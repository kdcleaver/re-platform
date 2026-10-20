/** Runs one deal x rent case x scenario through the full engine. */
import type { Deal, RentCase } from "./deal.js";
import type { MarketAssumptions } from "./market.js";
import { KYLE, type BuyerProfile } from "./buyer.js";
import {
  FHA, type CapitalCheck, type CostBuild, type Financing, type GrmScreen,
  type Phase1, type Phase2, type SelfSufficiency, type SolverContext,
  capitalCheck, costBuild, grmScreen, maxPriceForCapital, maxPriceForDscr, maxPriceForPhase2Hurdles,
  maxPriceForSelfSufficiency, maxPriceForZeroHousingCost, phase1, phase2, screenGrmMax, selfSufficiency,
} from "./engine.js";

export interface Scenario {
  id: string;
  label: string;
  priceFactor?: number; // 0.9 = 10% below ask
  price?: number; // explicit price wins over factor
  financing?: Financing;
  taxPct?: number;
  /**
   * Insurance. Default ("estimate-mid"): the deal's own estimate midpoint if it has one, else market %.
   * "estimate-high": deal's high end, else insPct fallback. "pct": always insPct (explicit shock).
   */
  insBasis?: "estimate-mid" | "estimate-high" | "pct";
  insPct?: number;
}

export interface Flag {
  severity: "info" | "warn" | "kill-candidate";
  message: string;
}

export interface HurdleResult {
  phase1Pass: boolean;
  phase2Pass: boolean;
  phase2Misses: string[];
}

export interface UnderwriteResult {
  dealId: string;
  rentCaseId: string;
  scenarioId: string;
  marketVersion: string;
  price: number;
  units: number;
  insuranceAnnual: number;
  insuranceBasis: string;
  screen: GrmScreen;
  cost: CostBuild;
  selfSufficiency: SelfSufficiency;
  capital: CapitalCheck;
  phase1: Phase1;
  phase2: Phase2;
  hurdles: HurdleResult;
  lender: { minDscr?: number; dscrPass?: boolean; eligible: boolean; reasons: string[] };
  solvers: {
    maxPriceSelfSufficiency: number | null;
    maxPriceDscr1: number | null;
    maxPricePhase2Hurdles: number | null;
    maxPriceZeroHousing: number | null;
    maxPriceLender: number | null;
    maxPriceCapital: number | null;
    /** min of every constraint that applies under this financing */
    maxOffer: number | null;
    bindingConstraint: string;
  };
  flags: Flag[];
}

export function ownerOtherRent(deal: Deal, rc: RentCase): { otherRentMo: number; assumedAverage: boolean } {
  const n = deal.units.length;
  if (rc.ownerUnitRentMo !== undefined) return { otherRentMo: rc.grossMo - rc.ownerUnitRentMo, assumedAverage: false };
  return { otherRentMo: (rc.grossMo * (n - 1)) / n, assumedAverage: true };
}

/**
 * Insurance follows the building (replacement cost), not the purchase price: it is resolved to a fixed
 * annual $ amount once per scenario and held constant across price cuts and solvers.
 * Percentage bases are applied to the ask price as a building-value proxy.
 */
function resolveInsurance(deal: Deal, sc: Scenario, market: MarketAssumptions): { insAnnual: number; label: string } {
  const basis = sc.insBasis ?? (sc.insPct !== undefined ? "pct" : "estimate-mid");
  const est = deal.insuranceEstimate;
  if (basis !== "pct" && est) {
    const annual = basis === "estimate-high" ? est.highAnnual : (est.lowAnnual + est.highAnnual) / 2;
    return { insAnnual: annual, label: `${basis === "estimate-high" ? "high" : "mid"} of deal estimate${est.bound ? " (bound)" : ""}` };
  }
  const pct = sc.insPct ?? market.insurancePctOfPrice;
  return { insAnnual: deal.askPrice * pct, label: `${(pct * 100).toFixed(2)}% of ask` };
}

function minNonNull(entries: [string, number | null][]): { value: number | null; name: string } {
  let best: { value: number | null; name: string } = { value: null, name: "none" };
  for (const [name, v] of entries) {
    if (v === null) return { value: null, name: `${name} (fails at every price tested)` };
    if (best.value === null || v < best.value) best = { value: v, name };
  }
  return best;
}

export function underwrite(
  deal: Deal,
  rc: RentCase,
  sc: Scenario,
  market: MarketAssumptions,
  buyer: BuyerProfile = KYLE,
  grmMax: number = screenGrmMax(market),
): UnderwriteResult {
  if (deal.marketId !== market.marketId) {
    throw new Error(`Deal ${deal.id} is in ${deal.marketId}, market record is ${market.marketId}`);
  }
  const price = sc.price ?? deal.askPrice * (sc.priceFactor ?? 1);
  const units = deal.units.length;
  const financing = sc.financing ?? FHA;
  const util = deal.overrides?.ownerUtilitiesPerDoorMo;
  const ins = resolveInsurance(deal, sc, market);
  const ctx: SolverContext = { market, financing, taxPct: sc.taxPct, insAnnual: ins.insAnnual, utilPerDoor: util };

  const cost = costBuild({ price, market, financing, taxPct: sc.taxPct, insAnnual: ins.insAnnual });
  const { otherRentMo, assumedAverage } = ownerOtherRent(deal, rc);
  const flags: Flag[] = [];
  const h = buyer.hurdles;

  if (assumedAverage) flags.push({ severity: "info", message: "Owner's unit rent unknown; Phase 1 assumes the average door." });
  if (financing.kind === "fha" && units > market.fha.maxUnits)
    flags.push({ severity: "kill-candidate", message: `${units} units is outside FHA 1–4 unit lending.` });

  // Lender eligibility + DSCR (non-FHA)
  const lender: UnderwriteResult["lender"] = { eligible: true, reasons: [] };
  if (financing.kind === "amortizing") {
    const e = financing.eligibility;
    if (e?.minLoan && cost.baseLoan < e.minLoan) lender.reasons.push(`loan $${Math.round(cost.baseLoan / 1000)}k < $${e.minLoan / 1000}k minimum`);
    if (e?.minUnits && units < e.minUnits) lender.reasons.push(`${units} units < ${e.minUnits}-unit minimum`);
    if (e?.maxUnits && units > e.maxUnits) lender.reasons.push(`${units} units > ${e.maxUnits}-unit maximum`);
    lender.eligible = lender.reasons.length === 0;
    if (!lender.eligible) flags.push({ severity: "kill-candidate", message: `Not eligible for ${financing.label}: ${lender.reasons.join("; ")}.` });
    if (financing.lenderMinDscr !== undefined) lender.minDscr = financing.lenderMinDscr;
  }

  // Seller-carry structure check against recorded liens
  if (financing.kind === "amortizing" && financing.lender === "seller") {
    const liens = (deal.openLiens ?? []).reduce((s, l) => s + l.amount, 0);
    const sellerEquity = price - liens;
    if (liens > 0 && cost.baseLoan > sellerEquity) {
      flags.push({
        severity: "kill-candidate",
        message:
          `Seller note $${Math.round(cost.baseLoan).toLocaleString()} exceeds seller's equity ~$${Math.round(sellerEquity).toLocaleString()} ` +
          `(recorded liens $${liens.toLocaleString()}). Requires payoff at close or a wrap with due-on-sale risk.`,
      });
    }
  }
  if (cost.balloon)
    flags.push({ severity: "warn", message: `Balloon of ~$${Math.round(cost.balloon.balanceDue).toLocaleString()} due in year ${cost.balloon.years}; refinance risk.` });

  const ss = selfSufficiency(units, rc.grossMo, cost, market, financing);
  const p1 = phase1(units, otherRentMo, cost, market, util);
  const p2 = phase2(price, units, rc.grossMo, cost, market, util);
  if (lender.minDscr !== undefined) lender.dscrPass = p2.dscr >= lender.minDscr;

  const misses: string[] = [];
  if (p2.dscr < h.phase2MinDscr) misses.push(`DSCR ${p2.dscr.toFixed(2)}x < ${h.phase2MinDscr}x`);
  if (p2.cashFlowPerDoorMo < h.phase2MinCashFlowPerDoorMo) misses.push(`CF/door $${Math.round(p2.cashFlowPerDoorMo)} < $${h.phase2MinCashFlowPerDoorMo}`);
  if (p2.coc < h.phase2MinCoc) misses.push(`CoC ${(p2.coc * 100).toFixed(1)}% < ${(h.phase2MinCoc * 100).toFixed(0)}%`);

  const ssApplies = financing.kind === "fha" && units >= 3 && units <= market.fha.maxUnits;
  const solvers = {
    maxPriceSelfSufficiency: ssApplies ? maxPriceForSelfSufficiency(rc.grossMo, ctx) : null,
    maxPriceDscr1: maxPriceForDscr(units, rc.grossMo, 1.0, ctx),
    maxPricePhase2Hurdles: maxPriceForPhase2Hurdles(units, rc.grossMo, h, ctx),
    maxPriceZeroHousing: maxPriceForZeroHousingCost(units, otherRentMo, ctx),
    maxPriceLender: lender.minDscr !== undefined ? maxPriceForDscr(units, rc.grossMo, lender.minDscr, ctx) : null,
    maxPriceCapital: maxPriceForCapital(buyer.capital, ctx),
  };
  const binding = minNonNull([
    ["Phase 2 hurdles", solvers.maxPricePhase2Hurdles],
    ["$0 Phase 1 housing cost", solvers.maxPriceZeroHousing],
    ["capital", solvers.maxPriceCapital],
    ...(ssApplies ? ([["FHA self-sufficiency", solvers.maxPriceSelfSufficiency]] as [string, number | null][]) : []),
    ...(lender.minDscr !== undefined ? ([["lender DSCR", solvers.maxPriceLender]] as [string, number | null][]) : []),
  ]);

  return {
    dealId: deal.id,
    rentCaseId: rc.id,
    scenarioId: sc.id,
    marketVersion: market.version,
    price,
    units,
    insuranceAnnual: ins.insAnnual,
    insuranceBasis: ins.label,
    screen: grmScreen(price, rc.grossMo, market, grmMax),
    cost,
    selfSufficiency: ss,
    capital: capitalCheck(cost, buyer.capital, financing),
    phase1: p1,
    phase2: p2,
    hurdles: { phase1Pass: p1.netHousingCostMo <= h.phase1MaxNetHousingCostMo, phase2Pass: misses.length === 0, phase2Misses: misses },
    lender,
    solvers: { ...solvers, maxOffer: lender.eligible ? binding.value : null, bindingConstraint: lender.eligible ? binding.name : "lender eligibility" },
    flags,
  };
}

/** Free-at-screening red flags derived from the deal record itself. */
export function screeningFlags(deal: Deal): Flag[] {
  const f: Flag[] = [];
  if (deal.isFrame && deal.yearBuilt < 1950)
    f.push({
      severity: "warn",
      message: `${deal.yearBuilt} frame construction: ${deal.insuranceEstimate?.bound ? "bound quote on file" : "needs a bound insurance quote and a clean 4-point inspection"}.`,
    });
  if (deal.mlsUnitCountField !== undefined && deal.mlsUnitCountField !== deal.units.length)
    f.push({
      severity: "warn",
      message: `MLS unit-count field says ${deal.mlsUnitCountField}, listing advertises ${deal.units.length} doors. Verify parcel unit count / CO.`,
    });
  const inPlace = deal.rentCases.find((r) => r.basis === "in-place");
  for (const rc of deal.rentCases) {
    if (inPlace && rc.basis === "seller-pro-forma" && rc.grossMo > inPlace.grossMo * 1.1)
      f.push({
        severity: "warn",
        message: `"${rc.label}" is ${Math.round((rc.grossMo / inPlace.grossMo - 1) * 100)}% above in-place rent. Underwrite to in-place.`,
      });
  }
  if (deal.currentAnnualTax !== undefined)
    f.push({
      severity: "info",
      message: `Current tax $${deal.currentAnnualTax.toLocaleString()} (${((deal.currentAnnualTax / deal.askPrice) * 100).toFixed(2)}% of ask) resets on sale; FL reassesses to just value.`,
    });
  return f;
}

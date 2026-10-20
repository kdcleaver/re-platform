/**
 * Path analysis: instead of "does this deal pass?", ask "what would have to be true, and how
 * likely is it?" Each lever is solved for the number it needs, then rated against evidence.
 *
 * Guardrail: a path is only as good as its feasibility rating. Ratings come from explicit rules
 * (below) using facts on the deal record — never from the path happening to make the math work.
 */
import type { Deal, RentCase } from "./deal.js";
import { primaryRentCase } from "./deal.js";
import type { MarketAssumptions } from "./market.js";
import type { BuyerProfile } from "./buyer.js";
import { KYLE } from "./buyer.js";
import {
  FHA, type Financing, balanceAfter, maxPriceForDscr, maxPriceForHousingCost, otherRentForHousingCost,
  principalPaid, rentNeeded, costBuild,
} from "./engine.js";
import { underwrite, type UnderwriteResult } from "./underwrite.js";

export type Feasibility = "supported" | "plausible" | "long-shot" | "very-unlikely" | "blocked";
export const FEASIBILITY_RANK: Record<Feasibility, number> = {
  supported: 0, plausible: 1, "long-shot": 2, "very-unlikely": 3, blocked: 4,
};

export type Lever = "as-is" | "price" | "rent" | "seller-credit" | "seller-carry" | "assumption" | "combo" | "data";

export interface PathTests {
  beatsRent: boolean; // Phase 1 net housing cost <= what Kyle pays now
  zeroHousing: boolean; // Kyle's original $0 hurdle
  dscr1: boolean; // Phase 2 doesn't bleed
  hurdles: boolean; // Phase 2 benchmark hurdles
  capital: boolean; // closes with Kyle's cash
}

export type OccupancyPlan = "move-out-after-year-1" | "stay-full-hold";

export interface WealthCase {
  plan: OccupancyPlan;
  appreciation: number;
  total: number;
  parts: { phase1SavingsVsRent: number; phase2CashFlow: number; principalPaydown: number; appreciation: number; cashOpportunityCost: number };
}

export interface Path {
  id: string;
  lever: Lever;
  label: string;
  /** the number this lever needs, in words */
  requirement: string;
  feasibility: Feasibility;
  reason: string;
  price: number;
  grossMo: number;
  financingLabel: string;
  netHousingMo: number;
  savingsVsRentMo: number;
  p2Dscr: number;
  p2CashFlowPerDoorMo: number;
  cashToClose: number;
  capitalShortfall: number;
  tests: PathTests;
  wealth: WealthCase[];
  flags: string[];
}

export interface DealPaths {
  dealId: string;
  name: string;
  askPrice: number;
  rentCase?: RentCase;
  motivation: { daysOnMarket: number; priceCuts: number; motivated: boolean; summary: string };
  paths: Path[];
  /** most feasible path that beats renting AND doesn't bleed after move-out, if any */
  best?: Path;
  /** most feasible (plausible or better) path that beats renting while Kyle lives there */
  bestBeatsRent?: Path;
  note?: string;
}

// ---------------- rules (placeholders: tune as paper trades resolve) ----------------

export const RULES = {
  /** FHA lets the seller pay up to 6% of price in concessions. */
  fhaMaxSellerConcessionPct: 0.06,
  /** Rule of thumb: 1 discount point (1% of loan) buys ~0.25% off the rate. Placeholder. */
  rateCutPerPoint: 0.0025,
  sellerCarry: { downPct: 0.1, rate: 0.06, amortMonths: 360, balloonYears: 5 },
  assumption: { assumedRateGuess: 0.03, termMonths: 360, secondRate: 0.06, secondAmortMonths: 360 },
  /** seller's cost to sell (commission + closing) when testing whether a price clears their payoff */
  sellerCostOfSalePct: 0.06,
  /** a cash gap this small is a "find a bit more cash" problem, not a dead end */
  smallCapitalGap: 5_000,
  motivated: { minDaysOnMarket: 90, minPriceCuts: 2 },
};

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

export function motivation(d: Deal, asOf: string) {
  const dom = daysBetween(d.firstListedOn ?? d.listedOn, asOf);
  const cuts = d.priceCuts ?? 0;
  const motivated = dom >= RULES.motivated.minDaysOnMarket || cuts >= RULES.motivated.minPriceCuts;
  const bits = [`${dom} days on market${d.firstListedOn ? " (incl. prior run)" : ""}`, `${cuts} cut${cuts === 1 ? "" : "s"}`];
  return { daysOnMarket: dom, priceCuts: cuts, motivated, summary: `${bits.join(", ")} → ${motivated ? "motivated" : "no clear motivation"}` };
}

function liensTotal(d: Deal): number | null {
  return d.openLiens && d.openLiens.length ? d.openLiens.reduce((a, l) => a + l.amount, 0) : null;
}

export function ratePriceCut(d: Deal, price: number, motivated: boolean): { f: Feasibility; why: string } {
  const disc = 1 - price / d.askPrice;
  const liens = liensTotal(d);
  if (liens != null && price < liens * (1 + RULES.sellerCostOfSalePct))
    return { f: "blocked", why: `$${Math.round(price / 1000)}k is below the seller's recorded loan (~$${Math.round(liens / 1000)}k) plus selling costs: short sale only.` };
  const pct = `${(disc * 100).toFixed(0)}% below ask`;
  if (disc <= 0) return { f: "supported", why: "At or above ask." };
  if (disc <= 0.05) return { f: "plausible", why: `${pct}: normal negotiating range.` };
  if (disc <= 0.1) return motivated ? { f: "plausible", why: `${pct}; seller shows motivation.` } : { f: "long-shot", why: `${pct} with no clear motivation.` };
  if (disc <= 0.2) return motivated ? { f: "long-shot", why: `${pct}; motivated seller, but a big ask.` } : { f: "very-unlikely", why: `${pct} with no clear motivation.` };
  return { f: "very-unlikely", why: `${pct}.` };
}

export function rateRentIncrease(d: Deal, primary: RentCase, needGross: number): { f: Feasibility; why: string } {
  const inc = needGross / primary.grossMo - 1;
  if (inc <= 0) return { f: "supported", why: "Current rents already cover it." };
  const backing = d.rentCases
    .filter((r) => r.id !== primary.id && r.grossMo >= needGross)
    .sort((a, b) => (a.basis === "market-estimate" ? -1 : 1) - (b.basis === "market-estimate" ? -1 : 1))[0];
  const pct = `+${(inc * 100).toFixed(0)}% over ${(primary.label.split(" (")[0] ?? primary.label).toLowerCase()}`;
  if (backing?.basis === "market-estimate") return { f: "plausible", why: `${pct}; supported by "${backing.label}".` };
  if (backing?.basis === "seller-pro-forma") return { f: "long-shot", why: `${pct}; only the seller's pro forma reaches it.` };
  if (inc <= 0.05) return { f: "plausible", why: `${pct}: normal turnover/renewal bump.` };
  if (inc <= 0.15) return { f: "long-shot", why: `${pct}; needs market comps to support.` };
  return { f: "very-unlikely", why: `${pct} with no evidence.` };
}

// ---------------- evaluation ----------------

function wealthCases(r: UnderwriteResult, buyer: BuyerProfile): WealthCase[] {
  const w = buyer.wealth;
  const months = w.holdYears * 12;
  const savingsMo = buyer.currentHousing.likeForLikeMo - r.phase1.netHousingCostMo;
  const paydown = principalPaid(r.cost, months);
  const opp = r.capital.cashToClose * ((1 + w.cashOpportunityRate) ** w.holdYears - 1);
  const out: WealthCase[] = [];
  for (const plan of ["move-out-after-year-1", "stay-full-hold"] as OccupancyPlan[]) {
    // moving out: 12 months of savings vs rent, then Phase 2 cash flow (Kyle pays rent elsewhere either way)
    const p1 = plan === "stay-full-hold" ? months * savingsMo : 12 * savingsMo;
    const p2 = plan === "stay-full-hold" ? 0 : 12 * (w.holdYears - 1) * r.phase2.cashFlowMo;
    for (const a of w.appreciationCases) {
      const appr = r.price * ((1 + a) ** w.holdYears - 1);
      out.push({
        plan, appreciation: a,
        total: p1 + p2 + paydown + appr - opp,
        parts: { phase1SavingsVsRent: p1, phase2CashFlow: p2, principalPaydown: paydown, appreciation: appr, cashOpportunityCost: -opp },
      });
    }
  }
  return out;
}

function evaluate(
  d: Deal, rc: RentCase, market: MarketAssumptions, buyer: BuyerProfile,
  p: { id: string; lever: Lever; label: string; requirement: string; feasibility: Feasibility; reason: string; price: number; financing?: Financing; grossMo?: number },
): Path {
  const rcUsed: RentCase = p.grossMo === undefined ? rc : { ...rc, id: `${rc.id}+`, grossMo: p.grossMo, ownerUnitRentMo: rc.ownerUnitRentMo };
  const r = underwrite(d, rcUsed, { id: p.id, label: p.label, price: p.price, financing: p.financing ?? FHA }, market, buyer);
  const h = buyer.hurdles;
  const like = buyer.currentHousing.likeForLikeMo;
  const tests: PathTests = {
    beatsRent: r.phase1.netHousingCostMo <= like,
    zeroHousing: r.phase1.netHousingCostMo <= h.phase1MaxNetHousingCostMo,
    dscr1: r.phase2.dscr >= 1,
    hurdles: r.hurdles.phase2Pass,
    capital: r.capital.pass,
  };
  // capital / eligibility facts override optimistic ratings
  let feasibility = p.feasibility;
  let reason = p.reason;
  const flags = r.flags.filter((f) => f.severity !== "info").map((f) => f.message);
  const gap = r.capital.closeShortfall + r.capital.reserveShortfall;
  if (!r.capital.pass && gap <= RULES.smallCapitalGap) {
    if (FEASIBILITY_RANK[feasibility] < FEASIBILITY_RANK["long-shot"]) feasibility = "long-shot";
    reason = `Short $${Math.round(gap).toLocaleString("en-US")} of cash (small gap). ${reason}`;
  } else if (!r.capital.pass && FEASIBILITY_RANK[feasibility] < FEASIBILITY_RANK.blocked) {
    feasibility = "blocked";
    reason = `Needs $${Math.round(gap / 1000)}k more cash than Kyle has. ${reason}`;
  }
  if (r.flags.some((f) => f.severity === "kill-candidate" && /exceeds seller's equity|outside FHA|loan limit/.test(f.message))) {
    feasibility = "blocked";
  }
  return {
    id: p.id, lever: p.lever, label: p.label, requirement: p.requirement, feasibility, reason,
    price: r.price, grossMo: rcUsed.grossMo, financingLabel: r.cost.financingLabel,
    netHousingMo: r.phase1.netHousingCostMo, savingsVsRentMo: like - r.phase1.netHousingCostMo,
    p2Dscr: r.phase2.dscr, p2CashFlowPerDoorMo: r.phase2.cashFlowPerDoorMo,
    cashToClose: r.capital.cashToClose, capitalShortfall: r.capital.closeShortfall + r.capital.reserveShortfall,
    tests, wealth: wealthCases(r, buyer), flags,
  };
}

const k = (x: number) => `$${Math.round(x / 1000)}k`;
const usd = (x: number) => `$${Math.round(x).toLocaleString("en-US")}`;

export function analyzePaths(d: Deal, market: MarketAssumptions, buyer: BuyerProfile = KYLE, asOf = market.asOfDate): DealPaths {
  const mot = motivation(d, asOf);
  const base: DealPaths = { dealId: d.id, name: d.name, askPrice: d.askPrice, motivation: mot, paths: [] };
  const like = buyer.currentHousing.likeForLikeMo;
  const units = d.units.length;
  const util = d.overrides?.ownerUtilitiesPerDoorMo;
  const insAnnual = d.insuranceEstimate ? (d.insuranceEstimate.lowAnnual + d.insuranceEstimate.highAnnual) / 2 : d.askPrice * market.insurancePctOfPrice;

  if (units > market.fha.maxUnits) {
    return { ...base, note: `${units} units: no FHA or 1–4 unit DSCR loan. Only paths are commercial debt (20%+ down, $1.5M+ minimums here) or partners — both outside the current plan.` };
  }
  const rc = primaryRentCase(d);
  if (!rc) {
    const n = rentNeeded(d.askPrice, units, buyer.hurdles, { market, insAnnual, utilPerDoor: util });
    const c = costBuild({ price: d.askPrice, market, insAnnual });
    const otherForRent = otherRentForHousingCost(units, c, market, like, util);
    return {
      ...base,
      note: `No rents published. At ask, the other ${units - 1} doors would need ~${usd(otherForRent)}/mo for Kyle to beat his current rent, and the building ~${usd(n.dscr1)}/mo for Phase 2 to break even. Get the rent roll before anything else.`,
    };
  }
  base.rentCase = rc;
  const ctx = { market, insAnnual, utilPerDoor: util };
  const ownerRent = rc.ownerUnitRentMo ?? rc.grossMo / units;
  const otherRent = rc.grossMo - ownerRent;
  const paths: Path[] = [];

  // 1. as-is
  paths.push(evaluate(d, rc, market, buyer, {
    id: "as-is", lever: "as-is", label: "As listed (FHA, ask, current rents)", requirement: "Nothing changes.",
    feasibility: "supported", reason: "Today's numbers.", price: d.askPrice,
  }));

  // 2. price: beat renting AND Phase 2 doesn't bleed
  const pRent = maxPriceForHousingCost(units, otherRent, like, ctx);
  const pDscr = maxPriceForDscr(units, rc.grossMo, 1.0, ctx);
  if (pRent != null && pDscr != null) {
    const target = Math.min(pRent, pDscr, d.askPrice);
    const binds = pRent <= pDscr ? "beating current rent" : "Phase 2 DSCR 1.0x";
    const rt = ratePriceCut(d, target, mot.motivated);
    paths.push(evaluate(d, rc, market, buyer, {
      id: "price", lever: "price", label: `Negotiate to ${k(target)}`,
      requirement: `Price ≤ ${k(target)} (${((1 - target / d.askPrice) * 100).toFixed(0)}% off; binds on ${binds}).`,
      feasibility: rt.f, reason: rt.why, price: target,
    }));
  }

  // 3. rent: what rents at ask would do it
  {
    const c = costBuild({ price: d.askPrice, market, insAnnual });
    const otherNeed = otherRentForHousingCost(units, c, market, like, util);
    const needForRent = ownerRent + otherNeed;
    const needForDscr = rentNeeded(d.askPrice, units, buyer.hurdles, ctx).dscr1;
    const need = Math.max(needForRent, needForDscr, rc.grossMo);
    const rt = rateRentIncrease(d, rc, need);
    paths.push(evaluate(d, rc, market, buyer, {
      id: "rent", lever: "rent", label: `Rents to ${usd(need)}/mo at ask`,
      requirement: `Gross rent ${usd(need)}/mo vs ${usd(rc.grossMo)} today (+${((need / rc.grossMo - 1) * 100).toFixed(0)}%).`,
      feasibility: rt.f, reason: rt.why, price: d.askPrice, grossMo: need,
    }));
  }

  // 4. seller credits: 3% to closing + 3% to a permanent buydown (FHA 6% cap)
  {
    const buydownPts = (RULES.fhaMaxSellerConcessionPct - market.closingCostPct) * 100 / (1 - market.fha.minDownPct);
    const rate = market.fha.rate - buydownPts * RULES.rateCutPerPoint;
    const f: Financing = { kind: "fha", rate, sellerCreditPct: market.closingCostPct, label: `FHA @ ${(rate * 100).toFixed(2)}% w/ 6% seller credit` };
    paths.push(evaluate(d, rc, market, buyer, {
      id: "seller-credit", lever: "seller-credit", label: "Ask: 6% seller credit (closing + rate buydown)",
      requirement: `Seller pays ${k(d.askPrice * RULES.fhaMaxSellerConcessionPct)} (FHA max): 3% closing, ~${buydownPts.toFixed(1)} pts → ${(rate * 100).toFixed(2)}%.`,
      feasibility: mot.motivated ? "plausible" : "long-shot",
      reason: `${mot.motivated ? "Motivated seller; " : ""}costs the seller about what a 6% price cut would.`,
      price: d.askPrice, financing: f,
    }));
  }

  // 5. seller carry (non-FHA; owner can still live there)
  {
    const sc = RULES.sellerCarry;
    const liens = liensTotal(d);
    const note = d.askPrice * (1 - sc.downPct);
    let rt: { f: Feasibility; why: string };
    if (liens != null && note > d.askPrice - liens) rt = { f: "blocked", why: `Seller has ~${k(d.askPrice - liens)} of equity over a ${k(liens)} recorded loan; can't carry a ${k(note)} note.` };
    else if (liens == null) rt = { f: "long-shot", why: "No open loan shown in listing data (verify); most sellers want cash." };
    else rt = { f: "long-shot", why: "Seller has the equity, but must choose to be the bank." };
    const f: Financing = {
      kind: "amortizing", label: `Seller note ${sc.downPct * 100}% down @ ${(sc.rate * 100).toFixed(1)}%, ${sc.balloonYears}-yr balloon`,
      lender: "seller", rate: sc.rate, downPct: sc.downPct, amortMonths: sc.amortMonths, balloonYears: sc.balloonYears,
    };
    paths.push(evaluate(d, rc, market, buyer, {
      id: "seller-carry", lever: "seller-carry", label: `Seller financing at ${(sc.rate * 100).toFixed(1)}%`,
      requirement: `Seller carries ${k(note)} for ${sc.balloonYears} yrs; Kyle puts ${sc.downPct * 100}% down.`,
      feasibility: rt.f, reason: rt.why, price: d.askPrice, financing: f,
    }));
  }

  // 6. assume a VA/FHA loan + seller second (only where one is on record)
  const assumable = d.openLiens?.find((l) => /VA|FHA/i.test(l.type));
  if (assumable) {
    const a = RULES.assumption;
    const months = Math.max(0, Math.round(daysBetween(assumable.recorded, asOf) / 30.44));
    const bal = balanceAfter(assumable.amount, a.assumedRateGuess, a.termMonths, months);
    const closing = d.askPrice * market.closingCostPct;
    const kyleDown = Math.max(0, buyer.capital.giftFunds + buyer.capital.ownCash - closing - 3 * 4_000); // keep ~3 mo reserves
    const second = Math.max(0, d.askPrice - bal - kyleDown);
    const f: Financing = {
      kind: "stack", label: `Assume ${assumable.type.split(" ")[0]} ~${k(bal)} @ ~${(a.assumedRateGuess * 100).toFixed(1)}% + seller 2nd ${k(second)} @ ${(a.secondRate * 100).toFixed(0)}%`,
      tranches: [
        { label: "assumed", balance: bal, rate: a.assumedRateGuess, amortMonths: a.termMonths - months, lender: "assumed" },
        { label: "seller second", balance: second, rate: a.secondRate, amortMonths: a.secondAmortMonths, lender: "seller" },
      ],
    };
    paths.push(evaluate(d, rc, market, buyer, {
      id: "assumption", lever: "assumption", label: "Assume seller's low-rate loan + seller second",
      requirement: `Lender/agency approves assumption of ~${k(bal)} (est.); seller carries ${k(second)} (${((second / d.askPrice) * 100).toFixed(0)}% of price).`,
      feasibility: "long-shot",
      reason: `Rate and balance estimated from the ${assumable.recorded.slice(0, 4)} recording. ${/VA/.test(assumable.type) ? "A non-veteran assumption leaves the seller's VA entitlement tied up — a big ask." : "Needs servicer approval."} Seller must also carry a large second.`,
      price: d.askPrice, financing: f,
    }));
  }

  // 7. combo: the realistic negotiated package
  {
    const disc = mot.motivated ? 0.1 : 0.05;
    const price = d.askPrice * (1 - disc);
    const rt = ratePriceCut(d, price, mot.motivated);
    const f: Financing = { kind: "fha", sellerCreditPct: market.closingCostPct, label: "FHA + 3% seller closing credit" };
    paths.push(evaluate(d, rc, market, buyer, {
      id: "combo", lever: "combo", label: `Package: ${(disc * 100).toFixed(0)}% off + 3% seller credit`,
      requirement: `${k(price)} price and seller pays closing costs (~${k(price * market.closingCostPct)}).`,
      feasibility: rt.f, reason: `${rt.why} Credit + cut total ${((disc + market.closingCostPct) * 100).toFixed(0)}% of ask.`,
      price, financing: f,
    }));
  }

  const sorted = paths.sort((a, b) => FEASIBILITY_RANK[a.feasibility] - FEASIBILITY_RANK[b.feasibility] || b.savingsVsRentMo - a.savingsVsRentMo);
  const ok = (p: Path) => p.feasibility !== "blocked" && p.feasibility !== "very-unlikely";
  const best = sorted.find((p) => ok(p) && p.tests.beatsRent && p.tests.dscr1 && p.tests.capital);
  // among paths rated plausible or better, the one that saves the most vs renting
  const bestBeatsRent = sorted
    .filter((p) => FEASIBILITY_RANK[p.feasibility] <= FEASIBILITY_RANK.plausible && p.tests.beatsRent && p.tests.capital)
    .sort((a, b) => b.savingsVsRentMo - a.savingsVsRentMo)[0];
  return { ...base, paths: sorted, best, bestBeatsRent };
}

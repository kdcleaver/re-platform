/**
 * Underwriting engine. Pure functions; every input comes from a MarketAssumptions
 * record, a Deal, or an explicit Financing structure.
 *
 * Ported from buybox_check.py v0 (hand-verified 2026-09-28). With FHA financing and
 * Tampa defaults it reproduces that script to the cent — see tests/parity.test.ts.
 */
import type { FicoBand, LoanProduct, MarketAssumptions } from "./market.js";
import type { BuyerCapital } from "./buyer.js";
export type { BuyerCapital } from "./buyer.js";

// ---------- Financing structures ----------

export type Financing =
  | {
      kind: "fha";
      /** override market FHA rate (stress tests) */
      rate?: number;
      downPct?: number;
    }
  | {
      kind: "amortizing";
      label: string;
      lender: "bank" | "seller";
      rate: number;
      downPct: number;
      amortMonths: number;
      /** balloon due in N years (informational; payment is fully amortizing until then) */
      balloonYears?: number;
      closingCostPct?: number;
      reserveMonths?: number;
      lenderMinDscr?: number;
      eligibility?: LoanProduct["eligibility"];
    };

export const FHA: Financing = { kind: "fha" };

export function fromProduct(p: LoanProduct, fico?: FicoBand): Financing {
  const rate = (fico && p.rateByFico?.[fico]) ?? p.rate;
  return {
    kind: "amortizing", label: `${p.label} @ ${(rate * 100).toFixed(3)}%${fico ? ` (${fico} FICO)` : ""}`,
    lender: p.lender, rate, downPct: p.downPct,
    amortMonths: p.amortMonths, balloonYears: p.balloonYears, closingCostPct: p.closingCostPct,
    reserveMonths: p.reserveMonths, lenderMinDscr: p.lenderMinDscr, eligibility: p.eligibility,
  };
}

export function product(market: MarketAssumptions, id: string, fico?: FicoBand): Financing {
  const p = market.loanProducts.find((x) => x.id === id);
  if (!p) throw new Error(`No loan product ${id} in ${market.marketId}@${market.version}`);
  return fromProduct(p, fico);
}

// ---------- Primitives ----------

/** Level monthly payment on a fully amortizing loan. */
export function pmt(principal: number, annualRate: number, months: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - (1 + r) ** -months);
}

/** Remaining balance after k payments. */
export function balanceAfter(principal: number, annualRate: number, months: number, k: number): number {
  const r = annualRate / 12;
  const p = pmt(principal, annualRate, months);
  if (r === 0) return principal - p * k;
  return principal * (1 + r) ** k - (p * ((1 + r) ** k - 1)) / r;
}

// ---------- Cost build (PITIA) ----------

export interface CostInputs {
  price: number;
  market: MarketAssumptions;
  financing?: Financing;
  /** stress overrides; default to market */
  taxPct?: number;
  insPct?: number;
  /** annual premium estimate in dollars; wins over insPct */
  insAnnual?: number;
}

export interface CostBuild {
  financingLabel: string;
  baseLoan: number;
  totalLoan: number;
  rate: number;
  pi: number;
  mip: number;
  tax: number;
  ins: number;
  pitia: number;
  debtServiceMo: number; // P&I + MIP
  down: number;
  closing: number;
  cashToClose: number;
  reserves: number;
  balloon?: { years: number; balanceDue: number };
}

export function costBuild(i: CostInputs): CostBuild {
  const { price, market } = i;
  const f = i.financing ?? FHA;
  const tax = (price * (i.taxPct ?? market.propertyTaxPctOfPrice)) / 12;
  const ins = i.insAnnual !== undefined ? i.insAnnual / 12 : (price * (i.insPct ?? market.insurancePctOfPrice)) / 12;

  if (f.kind === "fha") {
    const fha = market.fha;
    const rate = f.rate ?? fha.rate;
    const downPct = f.downPct ?? fha.minDownPct;
    const baseLoan = price * (1 - downPct);
    const totalLoan = baseLoan * (1 + fha.ufmipPct);
    const mipRate = baseLoan > fha.mipThreshold ? fha.mipHigh : fha.mipLow;
    const pi = pmt(totalLoan, rate, fha.termMonths);
    const mip = (baseLoan * mipRate) / 12;
    const pitia = pi + mip + tax + ins;
    const down = price * downPct;
    const closing = price * market.closingCostPct;
    return {
      financingLabel: `FHA ${(downPct * 100).toFixed(1)}% down @ ${(rate * 100).toFixed(2)}%`,
      baseLoan, totalLoan, rate, pi, mip, tax, ins, pitia,
      debtServiceMo: pi + mip,
      down, closing, cashToClose: down + closing,
      reserves: pitia * fha.reserveMonths,
    };
  }

  const baseLoan = price * (1 - f.downPct);
  const pi = pmt(baseLoan, f.rate, f.amortMonths);
  const pitia = pi + tax + ins;
  const down = price * f.downPct;
  const closing = price * (f.closingCostPct ?? market.closingCostPct);
  const out: CostBuild = {
    financingLabel: f.label,
    baseLoan, totalLoan: baseLoan, rate: f.rate, pi, mip: 0, tax, ins, pitia,
    debtServiceMo: pi,
    down, closing, cashToClose: down + closing,
    reserves: pitia * (f.reserveMonths ?? 3),
  };
  if (f.balloonYears) {
    out.balloon = {
      years: f.balloonYears,
      balanceDue: balanceAfter(baseLoan, f.rate, f.amortMonths, f.balloonYears * 12),
    };
  }
  return out;
}

// ---------- GRM pre-screen (cheap, runs first) ----------

export interface GrmScreen {
  grm: number;
  grmMax: number;
  pass: boolean;
  priceAtGrmMax: number;
  gapToGrmMaxPct: number; // how far price must fall to pass (negative = cushion)
}

/** The market's screen threshold: fixed, or derived from its own defaults. */
export function screenGrmMax(market: MarketAssumptions): number {
  if (market.screen.mode === "fixed") return market.screen.grmMax;
  const g = impliedBreakevenGrm({ market }, { targetDscr: market.screen.targetDscr });
  if (g == null) throw new Error("Could not derive GRM screen threshold");
  return g;
}

export function grmScreen(price: number, grossMo: number, market: MarketAssumptions, grmMax = screenGrmMax(market)): GrmScreen {
  const annual = grossMo * 12;
  const grm = price / annual;
  const priceAtGrmMax = annual * grmMax;
  return {
    grm,
    grmMax,
    pass: grm <= grmMax,
    priceAtGrmMax,
    gapToGrmMaxPct: 1 - priceAtGrmMax / price,
  };
}

/** Batch filter: which listings earn the full engine run. */
export function screenBatch<T extends { price: number; grossMo: number }>(
  items: T[],
  market: MarketAssumptions,
): { item: T; screen: GrmScreen }[] {
  const max = screenGrmMax(market);
  return items
    .map((item) => ({ item, screen: grmScreen(item.price, item.grossMo, market, max) }))
    .sort((a, b) => a.screen.grm - b.screen.grm);
}

// ---------- FHA self-sufficiency (3–4 units) ----------

export interface SelfSufficiency {
  applies: boolean;
  reason: string;
  allowed?: number; // factor x gross
  pitia?: number;
  pass?: boolean;
  shortfallMo?: number;
}

export function selfSufficiency(units: number, grossMo: number, c: CostBuild, market: MarketAssumptions, f: Financing = FHA): SelfSufficiency {
  if (f.kind !== "fha") return { applies: false, reason: "Not FHA financing" };
  if (units > market.fha.maxUnits) return { applies: false, reason: `${units} units: not FHA-eligible (commercial)` };
  if (units < 3) return { applies: false, reason: "1–2 units: HUD self-sufficiency test does not apply" };
  const allowed = market.fha.selfSufficiencyFactor * grossMo;
  return {
    applies: true,
    reason: `${market.fha.selfSufficiencyFactor * 100}% of gross rent must cover PITIA`,
    allowed,
    pitia: c.pitia,
    pass: allowed >= c.pitia,
    shortfallMo: Math.max(0, c.pitia - allowed),
  };
}

// ---------- Capital check ----------

export interface CapitalCheck {
  cashToClose: number;
  reserves: number;
  closeShortfall: number;
  reserveShortfall: number;
  pass: boolean;
}

/**
 * FHA: gift covers down + closing; reserves must come from own funds, and own cash
 * can backfill closing only after reserves are covered.
 * Other structures: capital is pooled (placeholder until lender confirms gift rules).
 */
export function capitalCheck(c: CostBuild, cap: BuyerCapital, f: Financing = FHA, units?: number): CapitalCheck {
  let closeShortfall: number;
  let reserveShortfall: number;
  if (f.kind === "fha") {
    // HUD 4000.1: the 3-month reserve requirement applies to 3–4 units only
    const reservesRequired = units === undefined || units >= 3 ? c.reserves : 0;
    reserveShortfall = Math.max(0, reservesRequired - cap.ownCash);
    const ownLeft = Math.max(0, cap.ownCash - reservesRequired);
    closeShortfall = Math.max(0, c.cashToClose - cap.giftFunds - ownLeft);
  } else {
    const pool = cap.giftFunds + cap.ownCash;
    closeShortfall = Math.max(0, c.cashToClose - pool);
    reserveShortfall = Math.max(0, c.reserves - Math.max(0, pool - c.cashToClose));
  }
  return {
    cashToClose: c.cashToClose,
    reserves: f.kind === "fha" && units !== undefined && units < 3 ? 0 : c.reserves,
    closeShortfall,
    reserveShortfall,
    pass: closeShortfall === 0 && reserveShortfall === 0,
  };
}

// ---------- Phase 1: owner-occupied ----------

export interface Phase1 {
  otherRentMo: number;
  collectedMo: number; // after repairs/capex/vacancy
  ownerUtilitiesMo: number;
  netHousingCostMo: number; // >0 = Kyle pays this out of pocket each month
  pass: boolean; // Kyle's stated hurdle: $0 net housing cost
}

export function phase1(units: number, otherRentMo: number, c: CostBuild, market: MarketAssumptions, utilPerDoor?: number): Phase1 {
  const o = market.opex;
  const varOpex = o.repairsPctOfRent + o.capexPctOfRent + o.vacancyPct;
  const collectedMo = otherRentMo * (1 - varOpex);
  const ownerUtilitiesMo = (utilPerDoor ?? o.ownerUtilitiesPerDoorMo) * units;
  const netHousingCostMo = c.pitia + ownerUtilitiesMo - collectedMo;
  return { otherRentMo, collectedMo, ownerUtilitiesMo, netHousingCostMo, pass: netHousingCostMo <= 0 };
}

// ---------- Phase 2: all doors leased, third-party managed ----------

export interface Phase2 {
  grossMo: number;
  egiMo: number;
  opexMo: number;
  opexRatio: number; // opex / EGI, includes tax + insurance
  noiYr: number;
  debtServiceMo: number;
  dscr: number;
  cashFlowMo: number;
  cashFlowPerDoorMo: number;
  coc: number;
  capRate: number; // NOI / price
}

export function phase2(price: number, units: number, grossMo: number, c: CostBuild, market: MarketAssumptions, utilPerDoor?: number): Phase2 {
  const o = market.opex;
  const egiMo = grossMo * (1 - o.vacancyPct);
  const opexMo =
    egiMo * (o.repairsPctOfRent + o.capexPctOfRent + o.mgmtPctOfEgi) +
    c.tax + c.ins +
    (utilPerDoor ?? o.ownerUtilitiesPerDoorMo) * units;
  const noiMo = egiMo - opexMo;
  const cashFlowMo = noiMo - c.debtServiceMo;
  return {
    grossMo, egiMo, opexMo,
    opexRatio: opexMo / egiMo,
    noiYr: noiMo * 12,
    debtServiceMo: c.debtServiceMo,
    dscr: noiMo / c.debtServiceMo,
    cashFlowMo,
    cashFlowPerDoorMo: cashFlowMo / units,
    coc: (cashFlowMo * 12) / c.cashToClose,
    capRate: (noiMo * 12) / price,
  };
}

// ---------- Solvers ----------

/** Highest price in [lo, hi] for which ok(price) holds. ok must be monotone (true below, false above). */
export function solveMaxPrice(ok: (price: number) => boolean, lo = 100_000, hi = 2_000_000, iters = 60): number | null {
  if (!ok(lo)) return null;
  for (let k = 0; k < iters; k++) {
    const mid = (lo + hi) / 2;
    if (ok(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

export interface SolverContext {
  market: MarketAssumptions;
  financing?: Financing;
  taxPct?: number;
  insPct?: number;
  insAnnual?: number;
  utilPerDoor?: number;
}

const cb = (price: number, s: SolverContext) =>
  costBuild({ price, market: s.market, financing: s.financing, taxPct: s.taxPct, insPct: s.insPct, insAnnual: s.insAnnual });

export function maxPriceForSelfSufficiency(grossMo: number, s: SolverContext): number | null {
  return solveMaxPrice((p) => s.market.fha.selfSufficiencyFactor * grossMo >= cb(p, s).pitia);
}

export function maxPriceForDscr(units: number, grossMo: number, target: number, s: SolverContext): number | null {
  return solveMaxPrice((p) => phase2(p, units, grossMo, cb(p, s), s.market, s.utilPerDoor).dscr >= target);
}

export function maxPriceForZeroHousingCost(units: number, otherRentMo: number, s: SolverContext): number | null {
  return solveMaxPrice((p) => phase1(units, otherRentMo, cb(p, s), s.market, s.utilPerDoor).netHousingCostMo <= 0);
}

/**
 * GRM at which Phase 2 DSCR = target, implied by a market record + financing.
 * Nearly price-independent (only per-door utilities and the MIP tier break scale
 * invariance), so it is the right threshold for the GRM pre-screen.
 */
export function impliedBreakevenGrm(
  s: SolverContext,
  opts: { units?: number; refGrossMo?: number; targetDscr?: number } = {},
): number | null {
  const units = opts.units ?? 4;
  const gross = opts.refGrossMo ?? 6_500;
  const p = maxPriceForDscr(units, gross, opts.targetDscr ?? 1.0, s);
  return p == null ? null : p / (gross * 12);
}

/** Rent needed from the non-owner doors for $0 net housing cost at this price. */
export function otherRentForZero(units: number, c: CostBuild, market: MarketAssumptions, utilPerDoor?: number): number {
  const o = market.opex;
  const varOpex = o.repairsPctOfRent + o.capexPctOfRent + o.vacancyPct;
  return (c.pitia + (utilPerDoor ?? o.ownerUtilitiesPerDoorMo) * units) / (1 - varOpex);
}

/** Highest price where Phase 2 clears every hurdle (DSCR, $/door, CoC). */
export function maxPriceForPhase2Hurdles(
  units: number,
  grossMo: number,
  h: { phase2MinDscr: number; phase2MinCashFlowPerDoorMo: number; phase2MinCoc: number },
  s: SolverContext,
): number | null {
  return solveMaxPrice((p) => {
    const r = phase2(p, units, grossMo, cb(p, s), s.market, s.utilPerDoor);
    return r.dscr >= h.phase2MinDscr && r.cashFlowPerDoorMo >= h.phase2MinCashFlowPerDoorMo && r.coc >= h.phase2MinCoc;
  });
}

/** Highest price the buyer's capital can close (cash to close + reserves under the financing's rules). */
export function maxPriceForCapital(cap: BuyerCapital, s: SolverContext, units?: number): number | null {
  return solveMaxPrice((p) => capitalCheck(cb(p, s), cap, s.financing ?? FHA, units).pass, 50_000);
}

// ---------- FHA loan limit ----------

export function fhaLoanLimit(units: number, market: MarketAssumptions): number | null {
  const t = market.fha.loanLimitByUnits;
  if (!t || units < 1 || units > 4) return null;
  return t[units as 1 | 2 | 3 | 4];
}

/** Highest price whose FHA base loan stays within the county limit. */
export function maxPriceForFhaLimit(units: number, market: MarketAssumptions, downPct = market.fha.minDownPct): number | null {
  const lim = fhaLoanLimit(units, market);
  return lim == null ? null : lim / (1 - downPct);
}

// ---------- Rent-needed solvers (for listings without a rent roll, or to size the gap) ----------

/** Lowest gross rent in [0, hi] for which ok(gross) holds. ok must be monotone (false below, true above). */
export function solveMinRent(ok: (grossMo: number) => boolean, hi = 50_000, iters = 60): number | null {
  if (!ok(hi)) return null;
  let lo = 0;
  for (let k = 0; k < iters; k++) {
    const mid = (lo + hi) / 2;
    if (ok(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

export interface RentNeeded {
  selfSufficiency: number | null; // FHA 3–4 units only
  dscr1: number;
  phase2Hurdles: number | null;
  /** rent from the non-owner doors for $0 Phase 1 housing cost */
  zeroHousingOtherDoors: number;
}

export function rentNeeded(
  price: number,
  units: number,
  h: { phase2MinDscr: number; phase2MinCashFlowPerDoorMo: number; phase2MinCoc: number },
  s: SolverContext,
): RentNeeded {
  const c = cb(price, s);
  const f = s.financing ?? FHA;
  const ss = f.kind === "fha" && units >= 3 && units <= s.market.fha.maxUnits ? c.pitia / s.market.fha.selfSufficiencyFactor : null;
  const dscr1 = solveMinRent((g) => phase2(price, units, g, c, s.market, s.utilPerDoor).dscr >= 1)!;
  const hurdles = solveMinRent((g) => {
    const r = phase2(price, units, g, c, s.market, s.utilPerDoor);
    return r.dscr >= h.phase2MinDscr && r.cashFlowPerDoorMo >= h.phase2MinCashFlowPerDoorMo && r.coc >= h.phase2MinCoc;
  });
  return { selfSufficiency: ss, dscr1, phase2Hurdles: hurdles, zeroHousingOtherDoors: otherRentForZero(units, c, s.market, s.utilPerDoor) };
}

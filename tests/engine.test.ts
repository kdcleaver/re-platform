import { describe, expect, it } from "vitest";
import { TAMPA_MSA_V0 as M, TAMPA_MSA_2026_10 as M10, type MarketAssumptions } from "../src/market.js";
import {
  balanceAfter, capitalCheck, costBuild, grmScreen, impliedBreakevenGrm, maxPriceForCapital, maxPriceForDscr,
  maxPriceForPhase2Hurdles, phase2, pmt, product, screenBatch, screenGrmMax, selfSufficiency,
} from "../src/engine.js";

describe("primitives", () => {
  it("pmt matches a known amortization ($100k, 6%, 30 yr = $599.55)", () => {
    expect(pmt(100_000, 0.06, 360)).toBeCloseTo(599.55, 2);
  });
  it("balance after full term is ~0 and after 0 payments is principal", () => {
    expect(balanceAfter(100_000, 0.06, 360, 360)).toBeCloseTo(0, 4);
    expect(balanceAfter(100_000, 0.06, 360, 0)).toBeCloseTo(100_000, 6);
  });
  it("zero-rate loan divides evenly", () => {
    expect(pmt(120_000, 0, 120)).toBe(1_000);
  });
});

describe("FHA rules", () => {
  it("switches to the high MIP tier above the threshold", () => {
    const below = costBuild({ price: 750_000, market: M }); // base 723,750
    const above = costBuild({ price: 755_000, market: M }); // base 728,575
    expect(below.mip).toBeCloseTo((723_750 * 0.0055) / 12, 6);
    expect(above.mip).toBeCloseTo((728_575 * 0.0075) / 12, 6);
  });
  it("self-sufficiency only applies to 3–4 units under FHA", () => {
    const c = costBuild({ price: 500_000, market: M });
    expect(selfSufficiency(2, 4_000, c, M).applies).toBe(false);
    expect(selfSufficiency(4, 4_000, c, M).applies).toBe(true);
    expect(selfSufficiency(6, 4_000, c, M).applies).toBe(false);
    expect(selfSufficiency(4, 4_000, c, M, { kind: "amortizing", label: "x", lender: "bank", rate: 0.07, downPct: 0.25, amortMonths: 360 }).applies).toBe(false);
  });
  it("gift money does not count toward FHA reserves", () => {
    const c = costBuild({ price: 700_000, market: M });
    const chk = capitalCheck(c, { giftFunds: 200_000, ownCash: 0 });
    expect(chk.closeShortfall).toBe(0);
    expect(chk.reserveShortfall).toBeCloseTo(c.reserves, 6);
  });
});

describe("market-agnostic", () => {
  it("results move when only the market record changes", () => {
    const cheapTax: MarketAssumptions = { ...M, marketId: "test", propertyTaxPctOfPrice: 0.01 };
    const a = costBuild({ price: 600_000, market: M });
    const b = costBuild({ price: 600_000, market: cheapTax });
    expect(a.tax - b.tax).toBeCloseTo((600_000 * 0.005) / 12, 6);
  });
});

describe("GRM screen", () => {
  it("computes GRM and the price that would pass", () => {
    const s = grmScreen(650_000, 7_400, M);
    expect(s.grm).toBeCloseTo(650_000 / 88_800, 9);
    expect(s.pass).toBe(true);
    expect(s.priceAtGrmMax).toBe(88_800 * 7.5);
  });
  it("screenBatch sorts best GRM first", () => {
    const r = screenBatch([{ price: 750_000, grossMo: 6_225 }, { price: 695_000, grossMo: 6_757 }], M);
    expect(r[0]!.item.price).toBe(695_000);
  });
});

describe("solvers", () => {
  it("max price for DSCR 1.0 actually lands on DSCR 1.0", () => {
    const p = maxPriceForDscr(4, 6_757, 1.0, { market: M })!;
    const d = phase2(p, 4, 6_757, costBuild({ price: p, market: M }), M).dscr;
    expect(d).toBeGreaterThanOrEqual(1.0);
    expect(d).toBeLessThan(1.0001);
  });
  it("implied breakeven GRM falls when tax/insurance rise", () => {
    const base = impliedBreakevenGrm({ market: M })!;
    const realistic = impliedBreakevenGrm({ market: M, taxPct: 0.02, insPct: 0.015 })!;
    expect(base).toBeGreaterThan(realistic);
    // round-trip: price at that GRM gives DSCR ~1.0
    const p = base * 6_500 * 12;
    expect(phase2(p, 4, 6_500, costBuild({ price: p, market: M }), M).dscr).toBeCloseTo(1.0, 3);
  });
  it("non-FHA structures pool gift + own cash", () => {
    const f = { kind: "amortizing" as const, label: "s", lender: "seller" as const, rate: 0.045, downPct: 0.1, amortMonths: 360 };
    const c = costBuild({ price: 650_000, market: M, financing: f });
    const chk = capitalCheck(c, { giftFunds: 50_000, ownCash: 20_000 }, f);
    expect(chk.closeShortfall + chk.reserveShortfall).toBeCloseTo(c.cashToClose + c.reserves - 70_000, 6);
  });
  it("FHA own cash backfills closing only after reserves", () => {
    const c = costBuild({ price: 400_000, market: M });
    const chk = capitalCheck(c, { giftFunds: c.cashToClose - 1_000, ownCash: c.reserves + 1_000 });
    expect(chk.pass).toBe(true);
  });
  it("seller-note balloon is computed", () => {
    const c = costBuild({
      price: 650_000, market: M,
      financing: { kind: "amortizing", label: "seller", lender: "seller", rate: 0.045, downPct: 0.1, amortMonths: 360, balloonYears: 7 },
    });
    expect(c.pi).toBeCloseTo(2_964.13, 1); // matches the brief's $2,964 P&I
    expect(c.balloon!.balanceDue).toBeGreaterThan(500_000);
    expect(c.balloon!.balanceDue).toBeLessThan(c.baseLoan);
  });
});

describe("2026-10 market record", () => {
  it("derived screen equals the breakeven GRM under the record's own defaults", () => {
    const max = screenGrmMax(M10);
    expect(max).toBeCloseTo(impliedBreakevenGrm({ market: M10 })!, 9);
    expect(max).toBeLessThan(7.5); // tighter than the old fixed screen
  });
  it("v0 record is frozen and keeps the fixed 7.5x screen", () => {
    expect(Object.isFrozen(M)).toBe(true);
    expect(screenGrmMax(M)).toBe(7.5);
  });
  it("every non-placeholder input carries a source", () => {
    for (const [k, p] of Object.entries(M10.provenance)) expect(p.source.length, k).toBeGreaterThan(20);
  });
  it("loan products resolve and carry lender rules", () => {
    const f = product(M10, "commercial-sb");
    expect(f.kind).toBe("amortizing");
    if (f.kind === "amortizing") {
      expect(f.lenderMinDscr).toBe(1.25);
      expect(f.eligibility?.minLoan).toBe(1_500_000);
    }
    expect(() => product(M10, "nope")).toThrow();
  });
  it("a dollar insurance estimate wins over the % and does not scale with price", () => {
    const a = costBuild({ price: 600_000, market: M10, insAnnual: 10_300 });
    const b = costBuild({ price: 700_000, market: M10, insAnnual: 10_300 });
    expect(a.ins).toBeCloseTo(10_300 / 12, 9);
    expect(b.ins).toBeCloseTo(a.ins, 9);
  });
});

describe("hurdle and capital solvers", () => {
  const h = { phase2MinDscr: 1.2, phase2MinCashFlowPerDoorMo: 100, phase2MinCoc: 0.08 };
  it("max price for hurdles clears all three at the boundary", () => {
    const p = maxPriceForPhase2Hurdles(4, 6_757, h, { market: M10 })!;
    const r = phase2(p, 4, 6_757, costBuild({ price: p, market: M10 }), M10);
    expect(r.dscr).toBeGreaterThanOrEqual(1.2);
    expect(r.cashFlowPerDoorMo).toBeGreaterThanOrEqual(100);
    expect(r.coc).toBeGreaterThanOrEqual(0.08);
    // and a hair above it fails
    const q = p + 500;
    const r2 = phase2(q, 4, 6_757, costBuild({ price: q, market: M10 }), M10);
    expect(r2.dscr >= 1.2 && r2.cashFlowPerDoorMo >= 100 && r2.coc >= 0.08).toBe(false);
  });
  it("capital solver lands where cash runs out", () => {
    const cap = { giftFunds: 50_000, ownCash: 20_000 };
    const f = product(M10, "dscr-25");
    const p = maxPriceForCapital(cap, { market: M10, financing: f })!;
    expect(capitalCheck(costBuild({ price: p, market: M10, financing: f }), cap, f).pass).toBe(true);
    expect(capitalCheck(costBuild({ price: p + 1_000, market: M10, financing: f }), cap, f).pass).toBe(false);
  });
});

describe("credit-tier pricing", () => {
  it("740+ prices below 720–739, and unknown band falls back to the conservative rate", () => {
    const hi = product(M10, "dscr-25", "740+");
    const mid = product(M10, "dscr-25", "720-739");
    const none = product(M10, "dscr-25");
    if (hi.kind !== "amortizing" || mid.kind !== "amortizing" || none.kind !== "amortizing") throw new Error();
    expect(hi.rate).toBe(0.07);
    expect(mid.rate).toBe(0.07125);
    expect(none.rate).toBe(0.07125);
    expect(product(M10, "commercial-sb", "740+").kind === "amortizing" && (product(M10, "commercial-sb", "740+") as { rate: number }).rate).toBe(0.066);
  });
});

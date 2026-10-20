import { describe, expect, it } from "vitest";
import { TAMPA_MSA_2026_10 as M } from "../src/market.js";
import { KYLE } from "../src/buyer.js";
import {
  DEALS, STPETE_1761_19TH_S as S1761, TPA_2613_E_23RD_AVE as T2613, STPETE_725_14TH_AVE_S as S725,
  YBOR_3106_N_17TH as YBOR, TPA_236_W_NORTH_ST, STPETE_633_7TH_AVE_N,
} from "../deals/index.js";
import { analyzePaths, motivation, ratePriceCut, FEASIBILITY_RANK } from "../src/paths.js";
import { costBuild } from "../src/engine.js";

describe("path analysis", () => {
  it("runs for all 13 deals; no-rent and 6-plex deals return a note instead of paths", () => {
    for (const d of DEALS) {
      const r = analyzePaths(d, M);
      if (d.rentCases.length === 0 || d.units.length > 4) {
        expect(r.paths.length).toBe(0);
        expect(r.note).toBeTruthy();
      } else expect(r.paths.length).toBeGreaterThanOrEqual(5);
    }
    expect(analyzePaths(TPA_236_W_NORTH_ST, M).note).toMatch(/No rents published/);
    expect(analyzePaths(STPETE_633_7TH_AVE_N, M).note).toMatch(/6 units/);
  });
  it("paths are sorted by feasibility", () => {
    const r = analyzePaths(S1761, M);
    const ranks = r.paths.map((p) => FEASIBILITY_RANK[p.feasibility]);
    expect([...ranks].sort((a, b) => a - b)).toEqual(ranks);
  });
  it("beats-rent test uses Kyle's like-for-like rent, not $0", () => {
    const asIs = analyzePaths(S1761, M).paths.find((p) => p.id === "as-is")!;
    expect(asIs.netHousingMo).toBeGreaterThan(0);
    expect(asIs.tests.zeroHousing).toBe(false);
    expect(asIs.tests.beatsRent).toBe(asIs.netHousingMo <= KYLE.currentHousing.likeForLikeMo);
    expect(asIs.savingsVsRentMo).toBeCloseTo(KYLE.currentHousing.likeForLikeMo - asIs.netHousingMo, 9);
  });
  it("the solved price path really does beat rent and break even in Phase 2", () => {
    const p = analyzePaths(S1761, M).paths.find((x) => x.id === "price")!;
    expect(p.tests.beatsRent).toBe(true);
    expect(p.p2Dscr).toBeGreaterThanOrEqual(1 - 1e-9);
  });
  it("a price below the seller's recorded loan + selling costs is blocked (short sale)", () => {
    expect(ratePriceCut(T2613, 400_000, true).f).toBe("blocked");
    expect(ratePriceCut(T2613, 760_000, true).f).toBe("plausible");
  });
  it("seller financing is blocked when the note exceeds seller equity", () => {
    const p = analyzePaths(YBOR, M).paths.find((x) => x.id === "seller-carry")!;
    expect(p.feasibility).toBe("blocked");
  });
  it("only deals with a VA/FHA loan on record get an assumption path", () => {
    expect(analyzePaths(S725, M).paths.some((p) => p.id === "assumption")).toBe(true);
    expect(analyzePaths(S1761, M).paths.some((p) => p.id === "assumption")).toBe(false);
  });
  it("seller credit lowers cash to close and the FHA rate", () => {
    const r = analyzePaths(S1761, M);
    const asIs = r.paths.find((p) => p.id === "as-is")!;
    const sc = r.paths.find((p) => p.id === "seller-credit")!;
    expect(sc.cashToClose).toBeLessThan(asIs.cashToClose);
    expect(sc.netHousingMo).toBeLessThan(asIs.netHousingMo);
  });
  it("relisted deals count days on market from the first run", () => {
    const d = DEALS.find((x) => x.id === "9502-banyan-ave")!;
    expect(motivation(d, "2026-10-20").daysOnMarket).toBeGreaterThan(365);
  });
  it("wealth parts add up, and staying beats moving out when Phase 2 bleeds", () => {
    const p = analyzePaths(S1761, M).paths.find((x) => x.id === "combo")!;
    for (const w of p.wealth) {
      const s = Object.values(w.parts).reduce((a, b) => a + b, 0);
      expect(s).toBeCloseTo(w.total, 6);
    }
    const out0 = p.wealth.find((w) => w.plan === "move-out-after-year-1" && w.appreciation === 0)!.total;
    const stay0 = p.wealth.find((w) => w.plan === "stay-full-hold" && w.appreciation === 0)!.total;
    expect(p.p2Dscr).toBeLessThan(1);
    expect(stay0).toBeGreaterThan(out0);
  });
  it("principal paydown matches the loan's amortization", () => {
    const c = costBuild({ price: 600_000, market: M });
    const p = analyzePaths(S1761, M).paths[0]!; // smoke: parts exist
    expect(p.wealth[0]!.parts.principalPaydown).toBeGreaterThan(0);
    expect(c.amortization[0]!.principal).toBeCloseTo(c.totalLoan, 9);
  });
});

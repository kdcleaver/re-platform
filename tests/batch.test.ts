/** Guards for the full 13-deal batch and the rules added with it. */
import { describe, expect, it } from "vitest";
import { TAMPA_MSA_2026_10 as M } from "../src/market.js";
import { primaryRentCase } from "../src/deal.js";
import {
  DEALS, SEPT_BATCH, STPETE_633_7TH_AVE_N, STPETE_935_17TH_AVE_S, TPA_236_W_NORTH_ST, TPA_9502_BANYAN_AVE,
  YBOR_3106_N_17TH, CLW_15501_61ST_ST_N, STPETE_1846_2ND_AVE_N,
} from "../deals/index.js";
import { rentNeededAt, screeningFlags, underwrite } from "../src/underwrite.js";
import { STANDARD_SCENARIOS } from "../src/stress.js";
import { capitalCheck, costBuild, fhaLoanLimit, phase2 } from "../src/engine.js";

const base = STANDARD_SCENARIOS.find((s) => s.id === "base")!;

describe("batch fixtures", () => {
  it("13 deals, unique ids, all in the Tampa market, every gate unverified", () => {
    expect(DEALS.length).toBe(13);
    expect(SEPT_BATCH.length).toBe(10);
    expect(new Set(DEALS.map((d) => d.id)).size).toBe(13);
    for (const d of DEALS) {
      expect(d.marketId).toBe(M.marketId);
      for (const g of d.gates) expect(g.state).toBe("unverified");
    }
  });
  it("every deal with rents runs end to end under every standard scenario", () => {
    for (const d of DEALS) {
      const rc = primaryRentCase(d);
      if (!rc) continue;
      for (const sc of STANDARD_SCENARIOS) {
        const r = underwrite(d, rc, sc, M);
        expect(Number.isFinite(r.phase2.dscr)).toBe(true);
        expect(Number.isFinite(r.cost.pitia)).toBe(true);
      }
    }
  });
});

describe("rules added for the Sept batch", () => {
  it("FHA reserves are required for 3–4 units, not duplexes", () => {
    const c = costBuild({ price: 480_000, market: M });
    expect(capitalCheck(c, { giftFunds: 50_000, ownCash: 0 }, { kind: "fha" }, 2).reserveShortfall).toBe(0);
    expect(capitalCheck(c, { giftFunds: 50_000, ownCash: 0 }, { kind: "fha" }, 4).reserveShortfall).toBeGreaterThan(0);
  });
  it("FHA loan limit is enforced as a flag and caps max offer", () => {
    expect(fhaLoanLimit(4, M)).toBe(1_041_125);
    const r = underwrite(STPETE_1846_2ND_AVE_N, primaryRentCase(STPETE_1846_2ND_AVE_N)!, { id: "x", label: "x", price: 1_200_000 }, M);
    expect(r.flags.some((f) => f.message.includes("exceeds the 4-unit limit"))).toBe(true);
    expect(r.solvers.maxPriceFhaLimit!).toBeCloseTo(1_041_125 / 0.965, 0);
  });
  it("6-plex has no max offer and says why", () => {
    const r = underwrite(STPETE_633_7TH_AVE_N, primaryRentCase(STPETE_633_7TH_AVE_N)!, base, M);
    expect(r.solvers.maxOffer).toBeNull();
    expect(r.solvers.bindingConstraint).toMatch(/not FHA-eligible/);
    expect(screeningFlags(STPETE_633_7TH_AVE_N, M).some((f) => f.severity === "kill-candidate")).toBe(true);
  });
  it("single-family zoning codes are flagged on multi-unit deals", () => {
    for (const d of [STPETE_935_17TH_AVE_S, TPA_236_W_NORTH_ST, TPA_9502_BANYAN_AVE, YBOR_3106_N_17TH])
      expect(screeningFlags(d, M).some((f) => f.message.includes("reads as single-family")), d.id).toBe(true);
    // RM-16 and R-4 are multi-family codes: no flag
    expect(screeningFlags(CLW_15501_61ST_ST_N, M).some((f) => f.message.includes("reads as single-family"))).toBe(false);
  });
  it("high First Street flood score is flagged", () => {
    expect(screeningFlags(CLW_15501_61ST_ST_N, M).some((f) => f.message.includes("Flood Factor 6/10"))).toBe(true);
  });
  it("deals with no rents get a rent-needed answer instead of a crash", () => {
    expect(primaryRentCase(TPA_236_W_NORTH_ST)).toBeUndefined();
    const n = rentNeededAt(TPA_236_W_NORTH_ST, base, M);
    expect(n.selfSufficiency!).toBeGreaterThan(10_000);
    expect(n.phase2Hurdles!).toBeGreaterThan(n.dscr1);
  });
  it("rent needed for DSCR 1.0x round-trips through the engine", () => {
    const d = YBOR_3106_N_17TH;
    const g = rentNeededAt(d, base, M).dscr1;
    const r = underwrite(d, { id: "t", label: "t", basis: "market-estimate", grossMo: g, ownerUnitRentMo: 1_350 }, base, M);
    expect(r.phase2.dscr).toBeCloseTo(1.0, 6);
    // and directly
    const c = costBuild({ price: d.askPrice, market: M, insAnnual: d.askPrice * M.insurancePctOfPrice });
    expect(phase2(d.askPrice, 4, g, c, M, 0).dscr).toBeCloseTo(1.0, 6);
  });
});

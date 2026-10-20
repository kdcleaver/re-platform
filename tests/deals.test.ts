/** Integration checks on the three live deals: guard the conclusions we act on. */
import { describe, expect, it } from "vitest";
import { TAMPA_MSA_2026_10 as M } from "../src/market.js";
import { DEALS, YBOR_3106_N_17TH as YBOR, STPETE_1761_19TH_S as S1761, STPETE_1846_2ND_AVE_N as S1846 } from "../deals/index.js";
import { screeningFlags, underwrite } from "../src/underwrite.js";
import { STANDARD_SCENARIOS, YBOR_STRUCTURE_SCENARIOS } from "../src/stress.js";

const base = STANDARD_SCENARIOS.find((s) => s.id === "base")!;
const rc = (d: typeof YBOR, id: string) => d.rentCases.find((r) => r.id === id)!;

describe("deal fixtures are internally consistent", () => {
  it.each(DEALS)("$id: market, units, rent cases", (d) => {
    expect(d.marketId).toBe(M.marketId);
    expect(d.units.length).toBeGreaterThan(0);
    expect(d.rentCases.length).toBeGreaterThan(0);
    for (const r of d.rentCases) expect(r.grossMo).toBeGreaterThan(0);
    // nothing starts Clear: PRD rule
    for (const g of d.gates) expect(g.state).toBe("unverified");
  });
  it("1761 in-place rent roll sums to the listing's $6,757", () => {
    const sum = S1761.units.reduce((s, u) => s + (u.inPlaceRentMo ?? 0), 0);
    expect(sum).toBe(6_757);
    expect(rc(S1761, "in-place").grossMo).toBe(6_757);
  });
});

describe("conclusions at asking price (in-place rents, base assumptions)", () => {
  it("no deal passes the GRM screen at in-place rents", () => {
    for (const d of DEALS) expect(underwrite(d, rc(d, "in-place"), base, M).screen.pass).toBe(false);
  });
  it("no deal passes FHA self-sufficiency at in-place rents", () => {
    for (const d of DEALS) expect(underwrite(d, rc(d, "in-place"), base, M).selfSufficiency.pass).toBe(false);
  });
  it("1761 is the closest to DSCR 1.0 of the three", () => {
    const dscr = DEALS.map((d) => underwrite(d, rc(d, "in-place"), base, M).phase2.dscr);
    expect(Math.max(...dscr)).toBe(dscr[1]);
  });
});

describe("Ybor outside brief, re-run through the engine", () => {
  const note = YBOR_STRUCTURE_SCENARIOS.find((s) => s.id === "brief-seller-note")!;
  it("seller note is flagged against the open $429k lien", () => {
    const r = underwrite(YBOR, rc(YBOR, "brief-pro-forma"), note, M);
    expect(r.flags.some((f) => f.severity === "kill-candidate" && f.message.includes("equity"))).toBe(true);
  });
  it("pro forma is flagged as well above in-place", () => {
    expect(screeningFlags(YBOR).some((f) => f.message.includes("above in-place"))).toBe(true);
  });
});

describe("screening flags", () => {
  it("flags pre-1950 frame and MLS unit-count mismatches", () => {
    const f1761 = screeningFlags(S1761).map((f) => f.message).join(" | ");
    expect(f1761).toMatch(/frame construction/);
    expect(f1761).toMatch(/unit-count field says 1/);
    const f1846 = screeningFlags(S1846).map((f) => f.message).join(" | ");
    expect(f1846).toMatch(/unit-count field says 2/);
  });
});

describe("hurdles and financing alternatives (2026-10 record)", () => {
  const sc = (id: string) => STANDARD_SCENARIOS.find((s) => s.id === id)!;
  it("no deal clears Phase 2 hurdles at ask on in-place rents", () => {
    for (const d of DEALS) expect(underwrite(d, rc(d, "in-place"), base, M).hurdles.phase2Pass).toBe(false);
  });
  it("max offer is below ask for every deal, and names its binding constraint", () => {
    for (const d of DEALS) {
      const r = underwrite(d, rc(d, "in-place"), base, M);
      expect(r.solvers.maxOffer ?? 0).toBeLessThan(d.askPrice);
      expect(r.solvers.bindingConstraint.length).toBeGreaterThan(0);
    }
  });
  it("commercial small-balance program is ineligible for all three", () => {
    for (const d of DEALS) {
      const r = underwrite(d, rc(d, "in-place"), sc("commercial-sb"), M);
      expect(r.lender.eligible).toBe(false);
      expect(r.solvers.maxOffer).toBeNull();
    }
  });
  it("DSCR loans are capital-bound for Kyle's $70k", () => {
    for (const d of DEALS) {
      const r = underwrite(d, rc(d, "in-place"), sc("dscr-25"), M);
      expect(r.capital.pass).toBe(false);
      expect(r.solvers.maxPriceCapital!).toBeLessThan(300_000);
    }
  });
  it("St. Pete deals use their $ insurance estimate; Ybor falls back to the market %", () => {
    expect(underwrite(S1761, rc(S1761, "in-place"), base, M).insuranceAnnual).toBe(10_300);
    expect(underwrite(YBOR, rc(YBOR, "in-place"), base, M).insuranceAnnual).toBeCloseTo(650_000 * 0.0145, 6);
    expect(underwrite(S1761, rc(S1761, "in-place"), sc("ins-high"), M).insuranceAnnual).toBe(11_400);
  });
});

describe("insurance follows the building, not the price", () => {
  it("a price cut does not lower the insurance premium", () => {
    const sc = (id: string) => STANDARD_SCENARIOS.find((s) => s.id === id)!;
    const a = underwrite(YBOR, rc(YBOR, "in-place"), base, M);
    const b = underwrite(YBOR, rc(YBOR, "in-place"), sc("price-90"), M);
    expect(b.insuranceAnnual).toBe(a.insuranceAnnual);
  });
  it("a heavier insurance shock never raises the max offer", () => {
    const sc = (id: string) => STANDARD_SCENARIOS.find((s) => s.id === id)!;
    for (const d of DEALS) {
      const b = underwrite(d, rc(d, "in-place"), base, M).solvers.maxOffer!;
      const hi = underwrite(d, rc(d, "in-place"), sc("ins-2.25"), M).solvers.maxOffer!;
      expect(hi).toBeLessThanOrEqual(b);
    }
  });
});

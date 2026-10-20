/** Buyer profile: capital on hand and the hurdles a deal must clear. Separate from the market. */
import type { Provenance } from "./market.js";

export interface BuyerCapital {
  giftFunds: number; // usable for down + closing
  ownCash: number; // FHA reserves must come from own funds
}

export interface Hurdles {
  /** Phase 1 (owner-occupied): max acceptable net housing cost, $/mo. 0 = tenants cover everything. */
  phase1MaxNetHousingCostMo: number;
  /** Phase 2 (all doors leased, third-party managed) */
  phase2MinDscr: number;
  phase2MinCashFlowPerDoorMo: number;
  phase2MinCoc: number;
}

export interface BuyerProfile {
  id: string;
  capital: BuyerCapital;
  hurdles: Hurdles;
  provenance: Record<string, Provenance>;
}

export const KYLE: BuyerProfile = {
  id: "kyle",
  capital: { giftFunds: 50_000, ownCash: 20_000 },
  hurdles: {
    phase1MaxNetHousingCostMo: 0,
    phase2MinDscr: 1.2,
    phase2MinCashFlowPerDoorMo: 100,
    phase2MinCoc: 0.08,
  },
  provenance: {
    capital: { source: "Kyle, 2026-09: ~$50k likely gift + ~$20k own reserves.", confidence: "researched" },
    "hurdles.phase1MaxNetHousingCostMo": {
      source: "Kyle's own stated hurdle (2026-09): NOI at least breakeven, $0 housing cost.",
      confidence: "quoted",
    },
    "hurdles.phase2": {
      source:
        "Benchmark defaults for a solo small-multifamily investor, set 2026-10-20 at Kyle's direction (not his own numbers): " +
        "DSCR 1.20x (between DSCR-lender 1.0x floor and commercial 1.25x), $100/door/mo cash flow after reserves + mgmt, 8% cash-on-cash.",
      confidence: "placeholder",
    },
  },
};

/** Buyer profile: capital on hand and the hurdles a deal must clear. Separate from the market. */
import type { FicoBand, Provenance } from "./market.js";

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

export interface CurrentHousing {
  /** like-for-like comparator: what owning replaces (base rent; owner model already charges water/trash) */
  likeForLikeMo: number;
  /** everything the household pays today incl. utilities kept as an owner */
  allInMo: number;
}

/** Placeholder return assumptions for the rough 5-year wealth view. */
export interface WealthAssumptions {
  holdYears: number;
  appreciationCases: number[]; // annual
  cashOpportunityRate: number; // what the down payment earns if not invested (T-bill proxy)
}

export interface BuyerProfile {
  id: string;
  capital: BuyerCapital;
  currentHousing: CurrentHousing;
  wealth: WealthAssumptions;
  /** pricing tier only; exact scores are not stored */
  ficoBand: FicoBand;
  hurdles: Hurdles;
  provenance: Record<string, Provenance>;
}

export const KYLE: BuyerProfile = {
  id: "kyle",
  capital: { giftFunds: 50_000, ownCash: 20_000 },
  currentHousing: { likeForLikeMo: 2_450, allInMo: 2_765 },
  wealth: { holdYears: 5, appreciationCases: [0, 0.03], cashOpportunityRate: 0.045 },
  ficoBand: "740+",
  hurdles: {
    phase1MaxNetHousingCostMo: 0,
    phase2MinDscr: 1.2,
    phase2MinCashFlowPerDoorMo: 100,
    phase2MinCoc: 0.08,
  },
  provenance: {
    capital: { source: "Kyle, 2026-09: ~$50k likely gift + ~$20k own reserves.", confidence: "researched" },
    currentHousing: {
      source: "Kyle, 2026-10-20: household all-in $2,765/mo = base rent $2,450 + trash, internet, electric, water. Comparator uses base rent: as an owner he still pays electric/internet, and the model already charges water/trash on his unit.",
      confidence: "quoted",
    },
    wealth: {
      source: "Placeholders for a rough comparison: 5-yr hold, 0% and 3%/yr appreciation, 4.5% opportunity rate on cash. Ignores rent/expense growth, selling costs, capex shocks, taxes.",
      confidence: "placeholder",
    },
    ficoBand: {
      source: "Kyle, 2026-10-20: two bureau scores, both 740+ (lenders use the lower of two / middle of three). Consumer scores; lender pull may differ slightly.",
      confidence: "researched",
    },
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

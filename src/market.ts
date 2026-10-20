/**
 * MarketAssumptions: every rate/tax/insurance/financing-rule input lives here,
 * versioned by market and as-of date. Calculation code never hardcodes these.
 * Old versions are frozen, never edited, so past results stay reproducible.
 */

/** placeholder = rule of thumb; researched = published source; quoted = binding quote / bound policy */
export type Confidence = "placeholder" | "researched" | "quoted";

export interface Provenance {
  source: string;
  confidence: Confidence;
  url?: string;
}

export interface FhaRules {
  rate: number; // 30-yr note rate (APR used as proxy until a live quote)
  termMonths: number;
  minDownPct: number;
  ufmipPct: number; // upfront MIP, financed on top of base loan
  mipLow: number; // annual MIP, base loan <= threshold
  mipHigh: number; // annual MIP, base loan > threshold
  mipThreshold: number;
  selfSufficiencyFactor: number; // 3-4 units: factor x gross rent >= PITIA
  reserveMonths: number; // 3-4 units, own funds, months of PITIA
  maxUnits: number; // >4 units = commercial underwriting, not FHA 1-4
}

export interface OperatingAssumptions {
  vacancyPct: number; // of gross rent
  repairsPctOfRent: number;
  capexPctOfRent: number;
  mgmtPctOfEgi: number; // phase 2 third-party management
  ownerUtilitiesPerDoorMo: number; // owner-paid water/sewer/trash
}

/** A non-FHA loan product available in this market. */
export interface LoanProduct {
  id: string;
  label: string;
  lender: "bank" | "seller";
  rate: number;
  downPct: number;
  amortMonths: number;
  balloonYears?: number;
  closingCostPct: number; // incl. points
  reserveMonths: number;
  /** lender's minimum DSCR on its own underwriting */
  lenderMinDscr?: number;
  eligibility?: { minLoan?: number; minUnits?: number; maxUnits?: number };
}

export type ScreenRule =
  | { mode: "fixed"; grmMax: number }
  /** threshold = GRM at which Phase 2 DSCR hits targetDscr under this market's own defaults (FHA) */
  | { mode: "derived"; targetDscr: number };

export interface MarketAssumptions {
  marketId: string;
  version: string;
  marketName: string;
  asOfDate: string; // ISO date
  propertyTaxPctOfPrice: number; // post-sale, annual
  insurancePctOfPrice: number; // annual; deals may carry their own estimate
  closingCostPct: number; // buyer closing + prepaids, no seller credit (FHA)
  fha: FhaRules;
  conventionalDownPctByUnits: Record<1 | 2 | 3 | 4, number>;
  opex: OperatingAssumptions;
  loanProducts: LoanProduct[];
  screen: ScreenRule;
  provenance: Record<string, Provenance>;
}

const FHA_2026: FhaRules = {
  rate: 0.0649,
  termMonths: 360,
  minDownPct: 0.035,
  ufmipPct: 0.0175,
  mipLow: 0.0055,
  mipHigh: 0.0075,
  mipThreshold: 726_200,
  selfSufficiencyFactor: 0.75,
  reserveMonths: 3,
  maxUnits: 4,
};

const OPEX_V0: OperatingAssumptions = {
  vacancyPct: 0.05,
  repairsPctOfRent: 0.05,
  capexPctOfRent: 0.05,
  mgmtPctOfEgi: 0.08,
  ownerUtilitiesPerDoorMo: 75,
};

const FHA_PROVENANCE: Record<string, Provenance> = {
  "fha.rate": { source: "Rocket Mortgage FHA 30-yr APR (Kyle's research, 2026-09). Not a live quote.", confidence: "researched" },
  "fha.ufmipPct": { source: "FHA published UFMIP 1.75%.", confidence: "researched" },
  "fha.mipLow": { source: "FHA annual MIP, LTV > 95%, base loan <= $726,200 (Kyle's research).", confidence: "researched" },
  "fha.mipHigh": { source: "FHA annual MIP, base loan > $726,200 (Kyle's research).", confidence: "researched" },
  "fha.selfSufficiencyFactor": { source: "HUD 4000.1 self-sufficiency test, 3–4 units.", confidence: "researched" },
  "fha.reserveMonths": { source: "HUD 4000.1: 3 months PITIA reserves for 3–4 units.", confidence: "researched" },
};

/**
 * FROZEN. The assumptions buybox_check.py v0 was hand-verified against (2026-09-28).
 * Parity tests run against this record. Do not edit.
 */
export const TAMPA_MSA_V0: MarketAssumptions = Object.freeze({
  marketId: "tampa-msa",
  version: "2026-09-v0",
  marketName: "Tampa–St. Petersburg–Clearwater MSA",
  asOfDate: "2026-09-28",
  propertyTaxPctOfPrice: 0.015,
  insurancePctOfPrice: 0.009,
  closingCostPct: 0.03,
  fha: FHA_2026,
  conventionalDownPctByUnits: { 1: 0.05, 2: 0.15, 3: 0.25, 4: 0.25 },
  opex: OPEX_V0,
  loanProducts: [],
  screen: { mode: "fixed", grmMax: 7.5 },
  provenance: {
    ...FHA_PROVENANCE,
    propertyTaxPctOfPrice: { source: "Low end of Kyle's 1.5–2.0% range.", confidence: "placeholder" },
    insurancePctOfPrice: { source: "Placeholder pending quotes.", confidence: "placeholder" },
    "screen.grmMax": { source: "Empirical, 10 Tampa listings, 2026-09-28.", confidence: "placeholder" },
  },
}) as MarketAssumptions;

/** Current Tampa MSA record. */
export const TAMPA_MSA_2026_10: MarketAssumptions = {
  marketId: "tampa-msa",
  version: "2026-10",
  marketName: "Tampa–St. Petersburg–Clearwater MSA",
  asOfDate: "2026-10-20",
  propertyTaxPctOfPrice: 0.017,
  insurancePctOfPrice: 0.0145,
  closingCostPct: 0.03,
  fha: FHA_2026,
  conventionalDownPctByUnits: { 1: 0.05, 2: 0.15, 3: 0.25, 4: 0.25 },
  opex: OPEX_V0,
  loanProducts: [
    {
      id: "dscr-25",
      label: "DSCR investor loan, 25% down @ 7.125%",
      lender: "bank",
      rate: 0.07125,
      downPct: 0.25,
      amortMonths: 360,
      closingCostPct: 0.04, // ~3% closing + ~1 point
      reserveMonths: 6,
      lenderMinDscr: 1.0,
      eligibility: { minUnits: 1, maxUnits: 4 },
    },
    {
      id: "dscr-20",
      label: "DSCR investor loan, 20% down @ 7.375%",
      lender: "bank",
      rate: 0.07375,
      downPct: 0.2,
      amortMonths: 360,
      closingCostPct: 0.04,
      reserveMonths: 6,
      lenderMinDscr: 1.0,
      eligibility: { minUnits: 1, maxUnits: 4 },
    },
    {
      id: "commercial-sb",
      label: "Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed)",
      lender: "bank",
      rate: 0.066,
      downPct: 0.2,
      amortMonths: 360,
      balloonYears: 5,
      closingCostPct: 0.03,
      reserveMonths: 6,
      lenderMinDscr: 1.25,
      eligibility: { minLoan: 1_500_000, minUnits: 5 },
    },
  ],
  screen: { mode: "derived", targetDscr: 1.0 },
  provenance: {
    ...FHA_PROVENANCE,
    propertyTaxPctOfPrice: {
      source:
        "2025 total millage: St. Petersburg (SP) 19.92 (Pinellas Tax Collector); City of Tampa (TA) ~19.8 summed from HCPA 2025 final millage components. " +
        "x ~85% assessment-to-sale ratio (FL just value nets cost of sale) = ~1.7% of price. Non-homestead; owner-unit homestead exemption ignored (conservative).",
      confidence: "researched",
      url: "https://pinellastaxcollector.gov/pdfs/2025%20MILLAGE.pdf",
    },
    insurancePctOfPrice: {
      source:
        "Default for deals without their own estimate: midpoint of Kyle's Pinellas pre-1950 frame quad comps ($9.2k–$11.4k/yr, Kin/State Farm/Insurify, 2026-10) " +
        "over ~$710k price ≈ 1.45%. Conservative for block/masonry; replace with a bound quote.",
      confidence: "researched",
    },
    closingCostPct: { source: "Placeholder: buyer closing + prepaids, no seller credit.", confidence: "placeholder" },
    conventionalDownPctByUnits: { source: "Only 1-unit 5% is solid; 2–4 unit figures need lender verification.", confidence: "placeholder" },
    opex: { source: "Rule-of-thumb placeholders from buybox_check.py v0.", confidence: "placeholder" },
    "loanProducts.dscr-25": {
      source:
        "DSCR Authority rate grid 2026-10-19: 720–739 FICO, 75% LTV, DSCR 1.00–1.24 = 7.00%, ~1 pt; 2–4 units +0–0.25% → 7.125%. HomeAbroad 2026-10-06: 75% LTV par 6.75% + 0.30% for DSCR 1.00–1.25. Kyle's FICO not yet confirmed.",
      confidence: "researched",
      url: "https://dscrauthority.com/rates/",
    },
    "loanProducts.dscr-20": {
      source: "DSCR Authority 2026-10-19: 720–739 FICO, 80% LTV = 7.25%; +0.125% for 2–4 units.",
      confidence: "researched",
      url: "https://dscrauthority.com/rates/",
    },
    "loanProducts.commercial-sb": {
      source:
        "Select Commercial indicative rates 2026-10-20: Apartment/Freddie SBL 6.60% 5-yr, 80% LTV purchase, 1.25x DSCR at 75–80% LTV, 30-yr amort. $1.5M minimum loan ('no exceptions'); 5+ unit programs. Reference only: not eligible for 2–4 unit deals of this size.",
      confidence: "researched",
      url: "https://selectcommercial.com/commercial-mortgage-rates.php",
    },
    screen: {
      source: "Derived from this record's own defaults (FHA, Phase 2 DSCR 1.0x). Replaces fixed 7.5x after the 2026-10-20 stress test.",
      confidence: "researched",
    },
  },
};

/** The record the app uses by default. */
export const CURRENT_TAMPA = TAMPA_MSA_2026_10;

/** Deal records: what we know about a listing, kept separate from the math. */

/** PRD gate states. Nothing is "clear" until independently verified. */
export type GateState = "unverified" | "clear" | "reprice" | "kill";

export interface GateItem {
  id: string;
  label: string;
  state: GateState;
  /** What the listing / public record says. Listing data is not independent verification. */
  evidence: string;
  /** What it becomes if the bad case is confirmed. */
  ifConfirmed?: "kill" | "reprice";
}

export interface Unit {
  id: string;
  beds: number;
  baths: number;
  /** In-place contract rent, if known */
  inPlaceRentMo?: number;
  note?: string;
}

export type RentBasis = "in-place" | "mls-gross" | "seller-pro-forma" | "market-estimate";

export interface RentCase {
  id: string;
  label: string;
  basis: RentBasis;
  /** Total monthly gross rent with every door leased (owner's unit included, at market) */
  grossMo: number;
  /**
   * Market rent of the unit the owner would occupy in Phase 1.
   * If omitted, the engine assumes the average door and flags it.
   */
  ownerUnitRentMo?: number;
  note?: string;
}

export interface Deal {
  id: string;
  name: string;
  address: string;
  url: string;
  mls?: string;
  marketId: string;
  askPrice: number;
  listedOn: string;
  units: Unit[];
  yearBuilt: number;
  construction: string;
  /** true if any structure is wood frame */
  isFrame: boolean;
  zoning?: string;
  floodZone?: string;
  /** Unit count shown in MLS data fields, when it disagrees with advertised doors */
  mlsUnitCountField?: number;
  currentAnnualTax?: number;
  sellerReportedOpexAnnual?: number;
  /** Open liens on public record, for structuring checks (e.g. seller financing) */
  openLiens?: { recorded: string; amount: number; type: string }[];
  lastSale?: { date: string; price: number };
  rentCases: RentCase[];
  /** Building-specific insurance estimate (annual $). Used instead of the market % when present. */
  insuranceEstimate?: { lowAnnual: number; highAnnual: number; source: string; bound: boolean };
  /** Per-deal operating overrides (e.g. tenants pay all utilities) */
  overrides?: { ownerUtilitiesPerDoorMo?: number; note?: string };
  gates: GateItem[];
  notes: string[];
}

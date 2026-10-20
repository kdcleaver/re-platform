import type { Deal } from "../src/deal.js";

/** St. Pete duplex, 2 x 4bd/2ba, vacant. Redfin MLS TB8545200, pulled 2026-10-20. */
export const STPETE_935_17TH_AVE_S: Deal = {
  id: "935-17th-ave-s",
  name: "St. Pete duplex (935 17th Ave S)",
  address: "935 17th Ave S, St. Petersburg, FL 33705",
  url: "https://www.redfin.com/FL/St-Petersburg/935-17th-Ave-S-33705/home/48126357",
  mls: "TB8545200",
  marketId: "tampa-msa",
  askPrice: 539_990,
  listedOn: "2026-09-02",
  units: [
    { id: "a", beds: 4, baths: 2, note: "vacant, listed for rent" },
    { id: "b", beds: 4, baths: 2, note: "vacant, listed for rent" },
  ],
  yearBuilt: 1953,
  construction: "Not stated (1953; area is mostly block). Wall/window AC; roof permit 2006, described as updated.",
  isFrame: false,
  zoning: "NT-2",
  floodFactor: 1,
  currentAnnualTax: 5_378,
  lastSale: { date: "2026-03-26", price: 265_000 },
  rentCases: [
    {
      id: "asking",
      label: "Asking rent from Sept listing ($2,600/unit)",
      basis: "market-estimate",
      grossMo: 2_600 * 2,
      ownerUnitRentMo: 2_600,
      note: "Both units vacant; no signed leases. RV pad ($650/mo claimed) excluded.",
    },
    {
      id: "hud-fmr",
      label: "Seller's HUD FMR ($3,195/unit)",
      basis: "seller-pro-forma",
      grossMo: 3_195 * 2,
      ownerUnitRentMo: 3_195,
      note: "FMR is a voucher payment standard, not a lease comp.",
    },
  ],
  primaryRentCaseId: "asking",
  gates: [
    { id: "zoning", label: "Zoning permits 2 units", state: "unverified", ifConfirmed: "kill",
      evidence: "NT-2 reads as single-family per Redfin. Confirm duplex is legal nonconforming." },
    { id: "rent-roll", label: "Rents achievable", state: "unverified", ifConfirmed: "reprice",
      evidence: "Fully vacant; rents are asks, not leases." },
    { id: "construction", label: "Construction type / insurability", state: "unverified", ifConfirmed: "reprice",
      evidence: "Not stated. Wall units; 2006 roof permit." },
    { id: "flood", label: "FEMA flood zone", state: "unverified", evidence: "Not on listing; First Street 1/10." },
  ],
  notes: [
    "Flip: bought 03/26/2026 for $265k, relisted at $539,990 (+104%) after a fall-through in Aug.",
    "Seller claims '10%++ cap rate' on FMR rents.",
  ],
};

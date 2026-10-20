import type { Deal } from "../src/deal.js";

/** St. Pete quad, 4 x ~3bd/1ba. Homes.com, pulled 2026-10-20 (first run 2026-09-28 at $725k). */
export const STPETE_725_14TH_AVE_S: Deal = {
  id: "725-14th-ave-s",
  name: "St. Pete quad (725 14th Ave S)",
  address: "725 14th Ave S, St. Petersburg, FL",
  url: "https://www.homes.com/property/725-14th-ave-s-saint-petersburg-fl/zgev5tvqx7pzm/",
  marketId: "tampa-msa",
  askPrice: 700_000,
  listedOn: "2026-07-02",
  units: [
    { id: "u1", beds: 3, baths: 1 },
    { id: "u2", beds: 3, baths: 1 },
    { id: "u3", beds: 3, baths: 1 },
    { id: "u4", beds: 3, baths: 1, note: "vacant per listing" },
  ],
  yearBuilt: 1924,
  construction: "Stucco/frame, block foundation; central HVAC; 'recently renovated' (no dates)",
  isFrame: true,
  floodZone: "X (panel 12103C0219H)",
  mlsUnitCountField: 1,
  currentAnnualTax: 8_624,
  openLiens: [{ recorded: "2021-04-21", amount: 398_725, type: "VA (open)" }],
  lastSale: { date: "2020-06-16", price: 385_000 },
  rentCases: [
    {
      id: "mls-gross",
      label: "MLS gross income ($71,760/yr)",
      basis: "mls-gross",
      grossMo: 71_760 / 12,
      note: "Basis not stated; one unit vacant, so likely includes the vacant door at an assumed rent. No per-unit rents.",
    },
  ],
  gates: [
    { id: "parcel-units", label: "Parcel unit count vs. advertised doors", state: "unverified", ifConfirmed: "kill",
      evidence: "MLS unit-count field shows 1 vs. 4 advertised; zoning not listed." },
    { id: "rent-roll", label: "Rent roll / leases", state: "unverified", ifConfirmed: "reprice", evidence: "Only an MLS gross figure; no leases." },
    { id: "insurance", label: "Insurability / quote", state: "unverified", ifConfirmed: "kill", evidence: "1924 frame. No quote." },
    { id: "flood", label: "FEMA flood zone", state: "unverified", evidence: "MLS says Zone X." },
  ],
  notes: [
    "Four price cuts since 07/02: $799k → $700k.",
    "Open 2021 VA loan ($398,725 original). VA loans are assumable with lender approval, likely at a ~3% rate; the equity gap (~$300k+) is far beyond current capital. Worth knowing for M2's assumable-loan comparison.",
  ],
};

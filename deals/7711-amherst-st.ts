import type { Deal } from "../src/deal.js";

/** Town 'n' Country duplex, 2 x 3bd/1ba, well + septic. Homes.com MLS TB8512830, pulled 2026-10-20. */
export const TPA_7711_AMHERST_ST: Deal = {
  id: "7711-amherst-st",
  name: "Tampa duplex (7711 Amherst St)",
  address: "7711 Amherst St, Tampa, FL 33625",
  url: "https://www.homes.com/property/7711-amherst-st-tampa-fl/wtb20z4ldlgs2/",
  mls: "TB8512830",
  marketId: "tampa-msa",
  askPrice: 530_000,
  listedOn: "2026-06-04",
  priceCuts: 4,
  units: [
    { id: "A", beds: 3, baths: 1 },
    { id: "B", beds: 3, baths: 1 },
  ],
  yearBuilt: 1986,
  construction: "Block, slab; new roof, electrical, plumbing per listing; dual central HVAC",
  isFrame: false,
  zoning: "CPV-I-1",
  floodZone: "X",
  currentAnnualTax: 6_879,
  sellerReportedOpexAnnual: 1_200,
  openLiens: [{ recorded: "2023-08-18", amount: 303_750, type: "Conventional (open)" }],
  lastSale: { date: "2023-08-18", price: 405_000 },
  rentCases: [
    { id: "in-place", label: "In-place ($3,525/mo)", basis: "in-place", grossMo: 3_525, note: "Per-unit split not given; 12-month gross leases." },
  ],
  overrides: { ownerUtilitiesPerDoorMo: 0, note: "Private well + septic; tenants pay electric and trash. Septic pumping sits in repairs." },
  gates: [
    { id: "septic-well", label: "Septic + well condition", state: "unverified", ifConfirmed: "reprice",
      evidence: "Private well and septic serving 2 units; needs inspection + water test." },
    { id: "zoning", label: "Zoning code", state: "unverified", ifConfirmed: "kill", evidence: "CPV-I-1 — confirm duplex use is permitted." },
    { id: "flood", label: "FEMA flood zone", state: "unverified", evidence: "MLS says Zone X." },
  ],
  notes: ["Five cuts since 06/04: $625k → $530k. Seller bought 08/2023 at $405k."],
};

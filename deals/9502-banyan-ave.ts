import type { Deal } from "../src/deal.js";

/** Tampa duplex, 2 x 3bd, from a 9-property retiring-owner portfolio. Homes.com MLS TB8428890, pulled 2026-10-20. */
export const TPA_9502_BANYAN_AVE: Deal = {
  id: "9502-banyan-ave",
  name: "Tampa duplex (9502 Banyan Ave)",
  address: "9502 Banyan Ave, Tampa, FL",
  url: "https://www.homes.com/property/9502-banyan-ave-tampa-fl-unit-a/968vdvgfy3l9l/",
  mls: "TB8428890",
  marketId: "tampa-msa",
  askPrice: 480_000,
  listedOn: "2026-09-17",
  units: [
    { id: "A", beds: 3, baths: 1, inPlaceRentMo: 1_590 },
    { id: "B", beds: 3, baths: 1, inPlaceRentMo: 1_590 },
  ],
  yearBuilt: 1988,
  construction: "Block/stucco, slab; central AC",
  isFrame: false,
  zoning: "RS-50",
  floodZone: "X (panel 12057C0212H)",
  mlsUnitCountField: 1,
  currentAnnualTax: 4_670,
  rentCases: [
    { id: "in-place", label: "In-place ($3,180/mo)", basis: "in-place", grossMo: 3_180, ownerUnitRentMo: 1_590, note: "Fully leased; 12-month gross leases." },
  ],
  gates: [
    { id: "zoning", label: "Zoning permits 2 units", state: "unverified", ifConfirmed: "kill", evidence: "RS-50 reads as single-family." },
    { id: "tenant", label: "Owner-occupancy path", state: "unverified", ifConfirmed: "reprice",
      evidence: "Sold with tenants in place; FHA needs a unit Kyle can move into within 60 days." },
    { id: "flood", label: "FEMA flood zone", state: "unverified", evidence: "MLS says Zone X." },
  ],
  notes: ["No seller financing. Relisted 09/17 at $480k (was $540k). Opportunity Zone per listing."],
};

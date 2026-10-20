import type { Deal } from "../src/deal.js";

/** Sulphur Springs duplex, 2 x 3bd/1ba, same retiring-owner portfolio as 9502 Banyan. Homes.com MLS TB8427328, pulled 2026-10-20. */
export const TPA_7902_N_14TH_ST: Deal = {
  id: "7902-n-14th-st",
  name: "Sulphur Springs duplex (7902 N 14th St)",
  address: "7902 N 14th St, Tampa, FL 33604",
  url: "https://www.homes.com/property/7902-n-14th-st-tampa-fl/zf2rvkdz5j9py/",
  mls: "TB8427328",
  marketId: "tampa-msa",
  askPrice: 480_000,
  listedOn: "2026-09-17",
  firstListedOn: "2025-09-19",
  priceCuts: 1,
  units: [
    { id: "A", beds: 3, baths: 1, inPlaceRentMo: 1_590 },
    { id: "B", beds: 3, baths: 1, inPlaceRentMo: 1_590 },
  ],
  yearBuilt: 1987,
  construction: "Stucco exterior, slab (wall system not stated); central AC",
  isFrame: false,
  zoning: "RS-50",
  floodZone: "X",
  currentAnnualTax: 4_457,
  lastSale: { date: "2020-03-02", price: 180_000 },
  rentCases: [
    { id: "in-place", label: "In-place ($3,180/mo)", basis: "in-place", grossMo: 3_180, ownerUnitRentMo: 1_590, note: "Fully tenanted; rented at $1,050 in 2019." },
  ],
  gates: [
    { id: "zoning", label: "Zoning permits 2 units", state: "unverified", ifConfirmed: "kill", evidence: "RS-50 reads as single-family." },
    { id: "tenant", label: "Owner-occupancy path", state: "unverified", ifConfirmed: "reprice",
      evidence: "Tenants in place from closing; FHA needs a unit Kyle can occupy." },
    { id: "flood", label: "FEMA flood zone", state: "unverified", evidence: "MLS says Zone X." },
  ],
  notes: ["No seller financing. Relisted 09/17 at $480k (was $525k)."],
};

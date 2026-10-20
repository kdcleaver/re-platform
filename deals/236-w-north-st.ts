import type { Deal } from "../src/deal.js";

/** Seminole Heights quad, 2 buildings, hybrid long-term + Airbnb. Homes.com MLS TB8521848, pulled 2026-10-20. */
export const TPA_236_W_NORTH_ST: Deal = {
  id: "236-w-north-st",
  name: "Seminole Heights quad (236 W North St)",
  address: "236 W North St, Tampa, FL",
  url: "https://www.homes.com/property/236-w-north-st-tampa-fl/krrggr9cxcjb9/?l=fz2w92vx92khd",
  mls: "TB8521848",
  marketId: "tampa-msa",
  askPrice: 998_000,
  listedOn: "2026-07-21",
  units: [
    { id: "A", beds: 2, baths: 2, note: "vacant; marketed for owner-occupancy" },
    { id: "B", beds: 1, baths: 1, note: "Airbnb" },
    { id: "C", beds: 2, baths: 1, note: "leased" },
    { id: "D", beds: 2, baths: 2, note: "leased" },
  ],
  yearBuilt: 1925,
  construction: "Frame, crawlspace; shingle roof (age not stated); central AC",
  isFrame: true,
  zoning: "SH-RS",
  floodZone: "X (panel 12057C0214J)",
  currentAnnualTax: 11_096,
  lastSale: { date: "2022-04-06", price: 880_000 },
  rentCases: [],
  gates: [
    { id: "rent-roll", label: "Rent roll / leases / STR income", state: "unverified", ifConfirmed: "kill",
      evidence: "No rents published for any unit." },
    { id: "zoning", label: "Zoning permits 4 units + STR", state: "unverified", ifConfirmed: "kill",
      evidence: "SH-RS reads as single-family; STR 'subject to local regulations'." },
    { id: "insurance", label: "Insurability / quote", state: "unverified", ifConfirmed: "kill", evidence: "1925 frame, crawlspace." },
    { id: "flood", label: "FEMA flood zone", state: "unverified", evidence: "MLS says Zone X." },
  ],
  notes: ["Header shows 28 beds / 20 baths vs ~7/6 in the unit mix; data error.", "Bought 04/2022 at $880k."],
};

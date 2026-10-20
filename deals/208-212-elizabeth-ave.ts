import type { Deal } from "../src/deal.js";

/** Clearwater quad (208/210/212 Elizabeth Ave). Redfin MLS TB8462114, pulled 2026-10-20. */
export const CLW_208_212_ELIZABETH: Deal = {
  id: "208-212-elizabeth-ave",
  name: "Clearwater quad (208–212 Elizabeth Ave)",
  address: "208-212 Elizabeth Ave, Clearwater, FL 33759",
  url: "https://www.redfin.com/FL/Clearwater/208-Elizabeth-Ave-33759/unit-A/home/48038809",
  mls: "TB8462114",
  marketId: "tampa-msa",
  askPrice: 879_000,
  listedOn: "2026-01-07",
  units: [
    { id: "u1", beds: 2, baths: 2, note: "per-unit mix not given (9 bd / 6 ba total)" },
    { id: "u2", beds: 2, baths: 1 },
    { id: "u3", beds: 2, baths: 1 },
    { id: "u4", beds: 3, baths: 2 },
  ],
  yearBuilt: 1985,
  construction: "Not stated; central HVAC; common laundry",
  isFrame: false,
  floodFactor: 1,
  currentAnnualTax: 8_920,
  lastSale: { date: "2020-01-07", price: 233_500 },
  rentCases: [],
  gates: [
    { id: "rent-roll", label: "Rent roll / leases", state: "unverified", ifConfirmed: "kill", evidence: "No rents published." },
    { id: "parcels", label: "Parcel structure", state: "unverified", ifConfirmed: "reprice",
      evidence: "Three addresses; public record lists 2–4 unit MF with 3 baths vs 6 advertised." },
    { id: "flood", label: "FEMA flood zone", state: "unverified", evidence: "Not on listing; First Street 1/10." },
  ],
  notes: ["On market since 01/07/2026; cut $990k → $879k.", "Recorded 2020 sale of $233,500 looks partial (one parcel?) — verify."],
};

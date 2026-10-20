import type { Deal } from "../src/deal.js";

/** Ybor new-build duplex (2023), 2 x 3bd/2.5ba. Homes.com MLS A4692763, pulled 2026-10-20. */
export const TPA_2613_E_23RD_AVE: Deal = {
  id: "2613-e-23rd-ave",
  name: "Ybor new-build duplex (2613 E 23rd Ave)",
  address: "2613 E 23rd Ave Unit 1/2, Tampa, FL 33605",
  url: "https://www.homes.com/property/2613-e-23rd-ave-tampa-fl-unit-1-2/fl5yv4dt8ncn0/?l=bscnb57pfy67c",
  mls: "A4692763",
  marketId: "tampa-msa",
  askPrice: 779_900,
  listedOn: "2026-06-18",
  units: [
    { id: "1", beds: 3, baths: 2.5 },
    { id: "2", beds: 3, baths: 2.5 },
  ],
  yearBuilt: 2023,
  construction: "Block, slab; impact windows/doors; central HVAC",
  isFrame: false,
  zoning: "RM-16",
  floodZone: "X (panel 12057C0360H)",
  currentAnnualTax: 12_363,
  openLiens: [{ recorded: "2024-05-06", amount: 570_000, type: "Conventional (open)" }],
  lastSale: { date: "2024-05-06", price: 760_000 },
  rentCases: [
    {
      id: "seller",
      label: "Seller: $2,600+/unit ($5,200)",
      basis: "seller-pro-forma",
      grossMo: 5_200,
      ownerUnitRentMo: 2_600,
      note: "MLS 'Total Actual Rent' field shows $2,600 — unclear if one unit leased or per unit.",
    },
  ],
  gates: [
    { id: "rent-roll", label: "Leases", state: "unverified", ifConfirmed: "reprice", evidence: "No leases; seller says each unit can get $2,600+." },
    { id: "flood", label: "FEMA flood zone", state: "unverified", evidence: "MLS says Zone X." },
  ],
  notes: [
    "Cleanest physical asset of the batch (2023 block, impact glass, RM-16).",
    "Owner bought 05/2024 at $760k; ask $779,900 after four cuts from $824,900.",
  ],
};

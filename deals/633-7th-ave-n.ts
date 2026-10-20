import type { Deal } from "../src/deal.js";

/** St. Pete 6-plex: front quad + two studios over garages. Homes.com, pulled 2026-10-20. */
export const STPETE_633_7TH_AVE_N: Deal = {
  id: "633-7th-ave-n",
  name: "St. Pete 6-plex (633 7th Ave N)",
  address: "633 7th Ave N, St. Petersburg, FL",
  url: "https://www.homes.com/property/633-7th-ave-n-st-petersburg-fl/x7sx57q7nx70w/",
  marketId: "tampa-msa",
  askPrice: 1_000_000,
  listedOn: "2026-07-14",
  units: [
    { id: "f1", beds: 1, baths: 1 },
    { id: "f2", beds: 1, baths: 1 },
    { id: "f3", beds: 1, baths: 1 },
    { id: "f4", beds: 2, baths: 1 },
    { id: "s1", beds: 0, baths: 1, note: "studio over garage" },
    { id: "s2", beds: 0, baths: 1, note: "studio over garage" },
  ],
  yearBuilt: 1925,
  construction: "Frame, crawlspace; wall/window AC, ductless heat",
  isFrame: true,
  floodZone: "X (panel 12103C0219H)",
  currentAnnualTax: 13_383,
  lastSale: { date: "2020-06-12", price: 615_000 },
  rentCases: [
    {
      id: "mls-gross",
      label: "MLS gross income ($110,460/yr)",
      basis: "mls-gross",
      grossMo: 110_460 / 12,
      note: "Basis not stated; may include garage-bay income.",
    },
  ],
  gates: [
    { id: "financing", label: "Financeable with Kyle's capital", state: "unverified", ifConfirmed: "kill",
      evidence: "6 units: no FHA, no residential DSCR; commercial needs $1.5M+ loans and 20%+ down." },
    { id: "taxes", label: "Tax figure", state: "unverified", ifConfirmed: "reprice",
      evidence: "Listing estimate $13,383 vs $6,957 paid in 2026; assessed $685,988." },
    { id: "insurance", label: "Insurability / quote", state: "unverified", ifConfirmed: "kill", evidence: "1925 frame." },
  ],
  notes: ["Professional management in place and willing to continue."],
};

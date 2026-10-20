/** Standard stress grid. One-at-a-time shocks, combined cases, and alternative financing. */
import type { Scenario } from "./underwrite.js";
import { CURRENT_TAMPA } from "./market.js";
import { product } from "./engine.js";
import { KYLE } from "./buyer.js";

const rateLabel = (id: string) => {
  const f = product(CURRENT_TAMPA, id, KYLE.ficoBand);
  return f.kind === "amortizing" ? ` @ ${(f.rate * 100).toFixed(3)}%` : "";
};

export const STANDARD_SCENARIOS: Scenario[] = [
  { id: "base", label: "Base (tax 1.7%, insurance estimate mid / 1.45%)" },
  { id: "v0", label: "v0 placeholders (tax 1.5%, ins 0.9%)", taxPct: 0.015, insBasis: "pct", insPct: 0.009 },
  { id: "rate-5.99", label: "FHA rate 5.99%", financing: { kind: "fha", rate: 0.0599 } },
  { id: "rate-7.25", label: "FHA rate 7.25%", financing: { kind: "fha", rate: 0.0725 } },
  { id: "tax-2.0", label: "Tax 2.0%", taxPct: 0.02 },
  { id: "ins-high", label: "Insurance high end (or 1.8%)", insBasis: "estimate-high", insPct: 0.018 },
  { id: "ins-2.25", label: "Insurance 2.25% (surplus lines)", insBasis: "pct", insPct: 0.0225 },
  { id: "price-95", label: "Price -5%", priceFactor: 0.95 },
  { id: "price-90", label: "Price -10%", priceFactor: 0.9 },
  {
    id: "downside",
    label: "Downside: tax 2.0%, ins high, rate 7.25%",
    taxPct: 0.02, insBasis: "estimate-high", insPct: 0.018, financing: { kind: "fha", rate: 0.0725 },
  },
  { id: "dscr-25", label: `DSCR loan 25% down${rateLabel("dscr-25")}`, financing: product(CURRENT_TAMPA, "dscr-25", KYLE.ficoBand) },
  { id: "dscr-20", label: `DSCR loan 20% down${rateLabel("dscr-20")}`, financing: product(CURRENT_TAMPA, "dscr-20", KYLE.ficoBand) },
  { id: "commercial-sb", label: "Commercial SB 20% @ 6.60% (eligibility check)", financing: product(CURRENT_TAMPA, "commercial-sb", KYLE.ficoBand) },
];

const BRIEF_NOTE = {
  kind: "amortizing" as const, label: "Seller note 10% down @ 4.50%", lender: "seller" as const,
  rate: 0.045, downPct: 0.1, amortMonths: 360, balloonYears: 7,
};

/** Ybor-only: the outside brief's structures, run through our engine. */
export const YBOR_STRUCTURE_SCENARIOS: Scenario[] = [
  { id: "brief-seller-note", label: "Brief: 10% down, 4.5% seller note, 7-yr balloon", financing: BRIEF_NOTE },
  { id: "brief-seller-note-downside", label: "Brief seller note + tax 2.0%, ins high", taxPct: 0.02, insBasis: "estimate-high", insPct: 0.018, financing: BRIEF_NOTE },
  { id: "brief-fha-7.25", label: "Brief's FHA case (7.25%)", financing: { kind: "fha", rate: 0.0725 } },
];

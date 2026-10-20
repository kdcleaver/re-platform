/**
 * Runs every deal x rent case x stress scenario and writes:
 *   out/stress-results.json  (full engine output)
 *   out/stress-report.md     (readable summary)
 * Usage: npm run stress
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { CURRENT_TAMPA as M, TAMPA_MSA_V0 } from "../src/market.js";
import { KYLE } from "../src/buyer.js";
import { DEALS, OCT_BATCH } from "../deals/index.js";
import { primaryRentCase } from "../src/deal.js";
import { impliedBreakevenGrm, screenBatch, screenGrmMax } from "../src/engine.js";
import { rentNeededAt, screeningFlags, underwrite, type Scenario, type UnderwriteResult } from "../src/underwrite.js";
import { STANDARD_SCENARIOS, YBOR_STRUCTURE_SCENARIOS } from "../src/stress.js";

const $ = (x: number | null | undefined) =>
  x == null ? "—" : (x < 0 ? "-$" : "$") + Math.abs(Math.round(x)).toLocaleString("en-US");
const x2 = (x: number) => x.toFixed(2) + "x";
const pct = (x: number) => (x * 100).toFixed(1) + "%";
const k = (x: number | null | undefined) => (x == null ? "—" : "$" + Math.round(x / 1000) + "k");
const H = KYLE.hurdles;

const results: UnderwriteResult[] = [];
const md: string[] = [];
const grmMax = screenGrmMax(M);
const sc = (id: string) => STANDARD_SCENARIOS.find((s) => s.id === id)!;

md.push(`# Stress test: ${DEALS.length} paper deals`);
md.push(`Market record **${M.marketName} @ ${M.version}** (as of ${M.asOfDate}). Run ${new Date().toISOString().slice(0, 10)}.\n`);
md.push(`**Base case:** FHA ${pct(M.fha.minDownPct)} down @ ${pct(M.fha.rate)}; tax ${pct(M.propertyTaxPctOfPrice)} of price; insurance = deal estimate midpoint where we have one, else ${pct(M.insurancePctOfPrice)}; ` +
  `vacancy ${pct(M.opex.vacancyPct)}, repairs+capex ${pct(M.opex.repairsPctOfRent + M.opex.capexPctOfRent)}, mgmt ${pct(M.opex.mgmtPctOfEgi)}. Capital: $50k gift + $20k own.\n`);
md.push(`**Hurdles:** Phase 1 net housing cost ≤ $${H.phase1MaxNetHousingCostMo} (Kyle's own). Phase 2 DSCR ≥ ${H.phase2MinDscr}x, cash flow ≥ $${H.phase2MinCashFlowPerDoorMo}/door/mo, CoC ≥ ${pct(H.phase2MinCoc)} (benchmark defaults, not yet Kyle's own).\n`);

md.push(`### Input confidence\n`);
md.push(`| Input | Confidence | Source |`);
md.push(`|---|---|---|`);
for (const [key, p] of Object.entries(M.provenance))
  md.push(`| ${key} | ${p.confidence} | ${p.url ? `[link](${p.url}) ` : ""}${p.source} |`);

// 0. verdicts first
md.push(`\n## Verdict: max offer on each deal's primary rent case\n`);
md.push(`Primary rent case = in-place where it exists, else MLS gross, else the listing's stated rent. Max offer = highest price clearing **every** constraint that applies (Phase 2 hurdles, $0 Phase 1 housing cost, FHA self-sufficiency, FHA loan limit, lender DSCR, capital).\n`);
md.push(`| Deal | Units | Ask | Rent case | GRM | FHA base: max offer | vs ask | Binding | FHA downside | Phase 2 hurdles only |`);
md.push(`|---|---|---|---|---|---|---|---|---|---|`);
const verdictRows: { d: (typeof DEALS)[number]; offer: number | null }[] = [];
for (const d of DEALS) {
  const rc = primaryRentCase(d);
  if (!rc) {
    md.push(`| ${d.name} | ${d.units.length} | ${k(d.askPrice)} | **no rents published** | — | — | — | needs rent roll | — | — |`);
    verdictRows.push({ d, offer: null });
    continue;
  }
  const b = underwrite(d, rc, sc("base"), M, KYLE, grmMax);
  const dn = underwrite(d, rc, sc("downside"), M, KYLE, grmMax);
  verdictRows.push({ d, offer: b.solvers.maxOffer });
  const gap = b.solvers.maxOffer == null ? "—" : `${pct(b.solvers.maxOffer / d.askPrice - 1)}`;
  const noFinancing = d.units.length > M.fha.maxUnits;
  md.push(`| ${d.name} | ${d.units.length} | ${k(d.askPrice)} | ${rc.label} | ${b.screen.grm.toFixed(1)}x | **${k(b.solvers.maxOffer)}** | ${gap} | ${b.solvers.bindingConstraint} | ${k(dn.solvers.maxOffer)} | ${noFinancing ? "n/a" : k(b.solvers.maxPricePhase2Hurdles)} |`);
}

// 0b. rent needed at ask
md.push(`\n## Rent needed at asking price (FHA base)\n`);
md.push(`What gross monthly rent (all doors) each ask would need. "Other doors for $0" = rent from the non-owner units for $0 Phase 1 housing cost.\n`);
md.push(`| Deal | Ask | Primary rent | FHA self-sufficiency | DSCR 1.0x | Phase 2 hurdles | Other doors for $0 | Primary rent covers |`);
md.push(`|---|---|---|---|---|---|---|---|`);
for (const d of DEALS) {
  const rc = primaryRentCase(d);
  if (d.units.length > M.fha.maxUnits) {
    md.push(`| ${d.name} | ${k(d.askPrice)} | ${rc ? $(rc.grossMo) : "none published"} | n/a | n/a | n/a | n/a | no eligible financing (${d.units.length} units) |`);
    continue;
  }
  const n = rentNeededAt(d, sc("base"), M, KYLE);
  const have = rc ? rc.grossMo : null;
  const covers = have == null ? "—" : `${pct(have / (n.phase2Hurdles ?? Infinity))} of hurdle rent`;
  md.push(`| ${d.name} | ${k(d.askPrice)} | ${have == null ? "none published" : $(have)} | ${n.selfSufficiency == null ? "n/a" : $(n.selfSufficiency)} | ${$(n.dscr1)} | ${$(n.phase2Hurdles)} | ${$(n.zeroHousingOtherDoors)} | ${covers} |`);
}

// 1. Screen calibration
md.push(`\n## Screen calibration\n`);
md.push(`Derived screen (this record, FHA, DSCR 1.0x): **${grmMax.toFixed(2)}x** (v0 used a fixed ${screenGrmMax(TAMPA_MSA_V0)}x).\n`);
md.push(`| Assumptions | Owner pays $75/door utilities | Tenants pay utilities |`);
md.push(`|---|---|---|`);
const beRows: [string, Parameters<typeof impliedBreakevenGrm>[0], number?][] = [
  ["This record, DSCR 1.0x", { market: M }],
  [`This record, hurdle DSCR ${H.phase2MinDscr}x`, { market: M }, H.phase2MinDscr],
  ["Tax 2.0%, ins 1.8%, rate 7.25%", { market: M, taxPct: 0.02, insPct: 0.018, financing: { kind: "fha", rate: 0.0725 } }],
  ["v0 placeholders", { market: TAMPA_MSA_V0 }],
];
for (const [label, s, t] of beRows) {
  const a = impliedBreakevenGrm(s, { targetDscr: t })!;
  const b2 = impliedBreakevenGrm({ ...s, utilPerDoor: 0 }, { targetDscr: t })!;
  md.push(`| ${label} | ${a.toFixed(2)}x | ${b2.toFixed(2)}x |`);
}

// 2. GRM pre-screen
md.push(`\n## GRM pre-screen (max ${grmMax.toFixed(2)}x)\n`);
md.push(`| Deal | Ask | Rent case | GRM | Pass | Price at ${grmMax.toFixed(2)}x | Cut needed |`);
md.push(`|---|---|---|---|---|---|---|`);
const batch = screenBatch(DEALS.flatMap((d) => d.rentCases.map((rc) => ({ d, rc, price: d.askPrice, grossMo: rc.grossMo }))), M);
for (const { item, screen } of batch)
  md.push(`| ${item.d.name} | ${k(item.price)} | ${item.rc.label} | ${screen.grm.toFixed(2)}x | ${screen.pass ? "✅" : "❌"} | ${k(screen.priceAtGrmMax)} | ${screen.pass ? "—" : pct(screen.gapToGrmMaxPct)} |`);

// 3. Per-deal grids
for (const d of DEALS) {
  md.push(`\n## ${d.name}\n${d.address} · ask ${$(d.askPrice)} · listed ${d.listedOn} · [listing](${d.url})\n`);
  for (const f of screeningFlags(d, M)) md.push(`- ${f.severity === "kill-candidate" ? "🚩" : f.severity === "warn" ? "⚠️" : "ℹ️"} ${f.message}`);
  if (d.rentCases.length === 0) md.push(`\n_No rent cases: see the rent-needed table above._`);
  md.push("");
  const scenarios: Scenario[] = d.id === "3106-n-17th-st" ? [...STANDARD_SCENARIOS, ...YBOR_STRUCTURE_SCENARIOS] : STANDARD_SCENARIOS;
  for (const rc of d.rentCases) {
    md.push(`### ${rc.label} — ${$(rc.grossMo)}/mo${rc.note ? `\n_${rc.note}_` : ""}\n`);
    md.push(`| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |`);
    md.push(`|---|---|---|---|---|---|---|---|---|---|---|---|`);
    const notes = new Set<string>();
    for (const s of scenarios) {
      const r = underwrite(d, rc, s, M, KYLE, grmMax);
      results.push(r);
      const ss = r.selfSufficiency.applies ? (r.selfSufficiency.pass ? "✅" : `❌ ${$(-r.selfSufficiency.shortfallMo!)}`) : "n/a";
      const cap = r.capital.pass ? "✅" : `❌ ${$(-(r.capital.closeShortfall + r.capital.reserveShortfall))}`;
      const hur = r.hurdles.phase2Pass ? "✅" : "❌";
      const lender = r.lender.minDscr !== undefined ? ` (lender ${r.lender.minDscr}x ${r.lender.dscrPass ? "✅" : "❌"})` : "";
      const offer = r.lender.eligible ? `${k(r.solvers.maxOffer)} (${r.solvers.bindingConstraint})` : "ineligible";
      md.push(`| ${s.label} | ${k(r.price)} | ${$(r.insuranceAnnual)} | ${$(r.cost.pitia)} | ${ss} | ${$(r.phase1.netHousingCostMo)} | ${x2(r.phase2.dscr)}${lender} | ${$(r.phase2.cashFlowPerDoorMo)} | ${pct(r.phase2.coc)} | ${hur} | ${cap} | ${offer} |`);
      for (const f of r.flags) if (f.severity !== "info") notes.add(`${s.label}: ${f.message}`);
    }
    if (notes.size) md.push("\n" + [...notes].map((s) => `- 🚩 ${s}`).join("\n"));
    md.push("");
  }
  md.push(`**Gates (all Unverified until independently checked):**\n`);
  for (const g of d.gates) md.push(`- [ ] **${g.label}**${g.ifConfirmed ? ` (${g.ifConfirmed} if confirmed)` : ""}: ${g.evidence}`);
  if (d.notes.length) md.push("\n" + d.notes.map((n) => `- ${n}`).join("\n"));
}

mkdirSync("out", { recursive: true });
writeFileSync("out/stress-results.json", JSON.stringify(results, null, 2));
writeFileSync("out/stress-report.md", md.join("\n") + "\n");
console.log(md.join("\n"));
console.log(`\nWrote ${results.length} scenario results to out/stress-results.json and out/stress-report.md`);

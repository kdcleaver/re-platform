/**
 * "What could work?" report: every lever per deal, solved and rated.
 *   out/paths-report.md, out/paths-results.json
 * Usage: npm run paths
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { CURRENT_TAMPA as M } from "../src/market.js";
import { KYLE } from "../src/buyer.js";
import { DEALS } from "../deals/index.js";
import { analyzePaths, RULES, type Path, type WealthCase } from "../src/paths.js";

const usd = (x: number) => (x < 0 ? "-$" : "$") + Math.abs(Math.round(x)).toLocaleString("en-US");
const k = (x: number) => (x < 0 ? "-$" : "$") + Math.abs(Math.round(x / 1000)) + "k";
const ICON: Record<string, string> = { supported: "🟢", plausible: "🟡", "long-shot": "🟠", "very-unlikely": "🔴", blocked: "⛔" };
const like = KYLE.currentHousing.likeForLikeMo;
const w = (p: Path, plan: WealthCase["plan"], a: number) => p.wealth.find((x) => x.plan === plan && x.appreciation === a)!.total;
const [a0, a1] = KYLE.wealth.appreciationCases as [number, number];
const yrs = KYLE.wealth.holdYears;

const results = DEALS.map((d) => analyzePaths(d, M, KYLE));
const md: string[] = [];

md.push(`# What could work: path analysis, ${DEALS.length} deals`);
md.push(`Market ${M.version} · run ${new Date().toISOString().slice(0, 10)}\n`);
md.push(`**The question changed** from "does it clear a fixed buy box?" to "what would have to be true, and how likely is that?"\n`);
md.push(`- **Beats renting:** Phase 1 net housing cost ≤ **${usd(like)}/mo** (current base rent; all-in today is ${usd(KYLE.currentHousing.allInMo)} incl. utilities Kyle keeps paying as an owner).`);
md.push(`- **Phase 2:** what the building does after Kyle moves out (third-party managed). DSCR < 1.0x means Kyle feeds it cash every month.`);
md.push(`- **${yrs}-yr wealth vs renting:** savings vs rent + Phase 2 cash flow + principal paydown + appreciation − what the cash would have earned at ${(KYLE.wealth.cashOpportunityRate * 100).toFixed(1)}%. ` +
  `Shown at ${a0 * 100}% and ${a1 * 100}%/yr appreciation, for two plans: move out after year 1, or stay all ${yrs} years. Rough: no rent/expense growth, selling costs, capex shocks or taxes.`);
md.push(`- **Feasibility** is rule-based from facts on the deal (days on market, price cuts, recorded loans, rent evidence, cash): ` +
  `${ICON.supported} supported · ${ICON.plausible} plausible · ${ICON["long-shot"]} long-shot · ${ICON["very-unlikely"]} very unlikely · ${ICON.blocked} blocked.\n`);

md.push(`## Summary\n`);
md.push(`| Deal | Ask | As listed: housing cost | Most likely path that beats renting | Housing cost | vs rent | After move-out | ${yrs}-yr wealth, move out (${a0 * 100}% / ${a1 * 100}%) | ${yrs}-yr wealth, stay (${a0 * 100}% / ${a1 * 100}%) | Clears Phase 2 too? |`);
md.push(`|---|---|---|---|---|---|---|---|---|---|`);
for (const r of results) {
  if (!r.paths.length) {
    md.push(`| ${r.name} | ${k(r.askPrice)} | — | ${r.note?.split(".")[0]} | — | — | — | — | — | — |`);
    continue;
  }
  const asIs = r.paths.find((p) => p.id === "as-is")!;
  const b = r.bestBeatsRent;
  const full = r.best ? `${ICON[r.best.feasibility]} ${r.best.label}` : "no path rated plausible or better";
  if (!b) {
    md.push(`| ${r.name} | ${k(r.askPrice)} | ${usd(asIs.netHousingMo)} | none rated plausible | — | — | — | — | — | ${full} |`);
    continue;
  }
  md.push(`| ${r.name} | ${k(r.askPrice)} | ${usd(asIs.netHousingMo)} | ${ICON[b.feasibility]} ${b.label} | ${usd(b.netHousingMo)} | **${usd(b.savingsVsRentMo)}/mo** | ${usd(b.p2CashFlowPerDoorMo * DEALS.find((d) => d.id === r.dealId)!.units.length)}/mo | ${k(w(b, "move-out-after-year-1", a0))} / ${k(w(b, "move-out-after-year-1", a1))} | ${k(w(b, "stay-full-hold", a0))} / ${k(w(b, "stay-full-hold", a1))} | ${full} |`);
}

for (const r of results) {
  md.push(`\n## ${r.name}\nAsk ${usd(r.askPrice)} · ${r.motivation.summary}${r.rentCase ? ` · rents: ${r.rentCase.label}` : ""}\n`);
  if (r.note) { md.push(`> ${r.note}`); continue; }
  md.push(`| | Path | What has to be true | Why this rating | Housing cost | vs rent | P2 DSCR | Bldg after move-out | Cash to close | ${yrs}-yr move out (${a0 * 100}/${a1 * 100}%) | ${yrs}-yr stay (${a0 * 100}/${a1 * 100}%) |`);
  md.push(`|---|---|---|---|---|---|---|---|---|---|---|`);
  const units = DEALS.find((d) => d.id === r.dealId)!.units.length;
  for (const p of r.paths) {
    md.push(`| ${ICON[p.feasibility]} | **${p.label}** | ${p.requirement} | ${p.reason} | ${usd(p.netHousingMo)} | ${usd(p.savingsVsRentMo)} | ${p.p2Dscr.toFixed(2)}x | ${usd(p.p2CashFlowPerDoorMo * units)}/mo | ${usd(p.cashToClose)} | ${k(w(p, "move-out-after-year-1", a0))} / ${k(w(p, "move-out-after-year-1", a1))} | ${k(w(p, "stay-full-hold", a0))} / ${k(w(p, "stay-full-hold", a1))} |`);
  }
  const fl = [...new Set(r.paths.flatMap((p) => p.flags))];
  if (fl.length) md.push("\n" + fl.map((f) => `- 🚩 ${f}`).join("\n"));
}

md.push(`\n## Rules behind the ratings (placeholders: tune as paper trades resolve)\n`);
md.push(`- Motivated seller: ≥ ${RULES.motivated.minDaysOnMarket} days on market (incl. prior runs) or ≥ ${RULES.motivated.minPriceCuts} price cuts.`);
md.push(`- Price cut: ≤5% plausible; 5–10% plausible if motivated, else long-shot; 10–20% long-shot if motivated, else very unlikely; >20% very unlikely. Below recorded loan + ${RULES.sellerCostOfSalePct * 100}% selling costs = blocked (short sale).`);
md.push(`- Rent: supported by a market-estimate rent case = plausible; only a seller pro forma = long-shot; otherwise ≤5% plausible, ≤15% long-shot, more = very unlikely.`);
md.push(`- Seller credit: FHA caps seller concessions at ${RULES.fhaMaxSellerConcessionPct * 100}% of price; buydown at ~${RULES.rateCutPerPoint * 100}% rate per point (rule of thumb). Plausible if motivated.`);
md.push(`- Seller financing: ${RULES.sellerCarry.downPct * 100}% down, ${RULES.sellerCarry.rate * 100}%, ${RULES.sellerCarry.balloonYears}-yr balloon. Blocked when the note exceeds seller equity over recorded loans.`);
md.push(`- Assumption: VA/FHA loans on record only; balance estimated at ~${RULES.assumption.assumedRateGuess * 100}% from the recording date; seller carries the gap. Always long-shot.`);
md.push(`- Cash gaps ≤ $${RULES.smallCapitalGap.toLocaleString()} downgrade a path to long-shot; larger gaps block it.`);

mkdirSync("out", { recursive: true });
writeFileSync("out/paths-results.json", JSON.stringify(results, null, 2));
writeFileSync("out/paths-report.md", md.join("\n") + "\n");
console.log(md.join("\n"));

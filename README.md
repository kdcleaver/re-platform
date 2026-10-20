# RE Platform — M0 underwriting engine

Local-first underwriting engine for paper house-hack deals. TypeScript, no UI yet.

## What's here

| Path | What it is |
|---|---|
| `src/market.ts` | `MarketAssumptions` type + versioned Tampa MSA records (`v0` frozen for parity, `2026-10` current). Every input carries a source and a confidence level (placeholder / researched / quoted). Includes loan products (DSCR 25%/20%, commercial small-balance for eligibility checks) and the derived GRM screen. |
| `src/buyer.ts` | Kyle's capital, credit tier (740+; exact scores not stored), and hurdles (Phase 1 $0 housing cost; Phase 2 benchmark DSCR 1.20x, $100/door, 8% CoC). |
| `src/engine.ts` | Pure math: PITIA build, FHA self-sufficiency, capital check, Phase 1 housing cost, Phase 2 DSCR/CF/CoC, price solvers (self-sufficiency, DSCR, hurdles, $0 housing, capital), GRM pre-screen, implied breakeven GRM, seller-note/bank financing. |
| `src/deal.ts` | Deal record shape: units, rent cases (in-place vs. pro forma), liens, gates (Kill/Reprice/Clear/Unverified). |
| `src/underwrite.ts` | Runs one deal × rent case × scenario: hurdle pass/fail, lender eligibility + DSCR, **max offer** (lowest price clearing every constraint) and which constraint binds; screening red flags. |
| `src/paths.ts` | **What could work?** Per deal: as-listed, negotiated price, rent upside, 6% seller credit/buydown, seller financing, loan assumption (VA/FHA on record), and a realistic package — each solved for the number it needs and rated (supported / plausible / long-shot / very unlikely / blocked) by explicit rules on deal facts. Tests: beats Kyle's current rent, $0 housing, Phase 2 DSCR, hurdles, capital; rough 5-yr wealth vs renting (move out vs stay; 0% / 3% appreciation). |
| `src/stress.ts` | Standard stress grid (rate, tax, insurance, price, combined) + Ybor brief structures. |
| `deals/` | 13 paper deals, one file each: the Oct batch (3) and the Sept `buybox_check.py` batch (10, re-pulled 2026-10-20). Deals may have no rent cases; the report then shows rent needed at ask. |
| `tests/` | Parity with `buybox_check.py` v0 (to the cent), engine unit tests, deal-level guards. |
| `scripts/run-stress.ts` | Writes `out/stress-report.md` and `out/stress-results.json`. |
| `scripts/run-paths.ts` | Writes `out/paths-report.md` and `out/paths-results.json`. |

## Run it (Mac)

```bash
# one time: install Node 22+ from nodejs.org, then in this folder:
npm install

npm test          # 75 tests, incl. parity with the original Python script
npm run stress    # regenerate out/stress-report.md
npm run paths     # regenerate out/paths-report.md (what could work)
npm run typecheck
```

## Adding a deal

Copy one file in `deals/`, fill it from the listing, add it to `deals/index.ts`, run `npm run stress`.
Rules: in-place rent is always its own rent case; seller/broker pro forma is a separate case;
every gate starts `unverified`.

## Changing assumptions

Never edit an old market record. Copy the current one, bump `version` and `asOfDate`, change values and their
`provenance`, and point `CURRENT_TAMPA` at it. Old results stay reproducible.

Insurance follows the building, not the price: it resolves to a fixed annual $ (deal estimate, or market % × ask)
and stays constant across price cuts and solvers.

## Still not verified

FHA rate/MIP (no live quote) · insurance (web comps, no bound quote) ·
conventional down % for 2–4 units · opex ratios · Phase 2 hurdles are benchmarks, not Kyle's own ·
path feasibility rules and wealth assumptions (appreciation, opportunity rate, buydown per point) are placeholders.

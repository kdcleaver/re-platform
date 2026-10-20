# RE Platform — PRD v1 & Build Log

Status: M0 engine built, tested, and on GitHub (kdcleaver/re-platform, private)
Last updated: 2026-10-20

## Purpose

A single-user, local-first tool to run paper real estate deals through consistent underwriting and deal-killer gates, building a track record of assumptions vs. outcomes over ~18 months before Kyle has capital to transact. Long-term: house-hack multifamily → self-storage owner-operation → eventual boat storage/marina/rental play in MN lake markets. Possible future B2B SaaS productization — explicitly not a near-term priority; nothing in M0–M3 should be built for multi-tenancy.

## Constraints that shape the build

- Non-coder. Claude (Opus for architecture, Sonnet for volume implementation) writes all code.
- ~8 hrs/week (1 hr weeknights, 3+ hrs weekends), stretch to ~20 hrs/week if his mother helps operationally later.
- Mac, no prior dev environment. GitHub is the sync point between cloud sessions and his local machine — not a shared filesystem.
- Legal/employment-agreement questions are explicitly parked per Kyle's instruction; not to be raised again absent his prompting.
- Capital: ~$50k likely gift (not co-investment — avoids equity/waterfall complexity in MVP) from his mother within ~12 months if a deal justifies it, plus ~$20k own reserves.

## Core architecture decision: market-agnostic by design

Underwriting must work for any market, not just Tampa. All rate/tax/insurance/financing-rule inputs live in a versioned `MarketAssumptions` object (market_id, as_of_date, source per field), never hardcoded into calculation logic. Tampa MSA is the first populated instance. The calculation engine takes a market object as a parameter.

```
MarketAssumptions {
  market_id, market_name, as_of_date, source,
  property_tax_pct, insurance_pct_of_price,
  fha_rate, fha_mip_low, fha_mip_high, fha_mip_threshold,
  conventional_down_pct_by_units: {1: .05, 2: .15, 3: .25, 4: .25},  // NEEDS LENDER VERIFICATION
  self_sufficiency_factor: .75,
  grm_screen_max: ~7.0–8.0,  // empirically derived, see below — should become derived (see 2026-10-20 update)
  ...
}
```

## Calculation engine: what's validated so far

Built and hand-verified in `buybox_check.py` against 10 real Tampa-area listings (see Findings). **Ported to TypeScript 2026-10-20 (`re-platform/`), parity to the cent — see Build log.** Covers: PITIA build (P&I, UFMIP-financed, tiered annual MIP, tax, insurance), 3-4 unit FHA self-sufficiency test (75% gross rent ≥ PITIA), cash-to-close and reserve checks, Phase 1 (owner-occupied) net housing cost, Phase 2 (post-move-out, 3rd-party managed) DSCR/cash-flow/CoC, and a binary-search max-price-at-given-rent solver.

**Open verification items (currently placeholder assumptions, need lender/insurer confirmation):**
- Conventional down payment by unit count (assumed 5%/15%/25%/25% for 1/2/3/4 units — only the 1-unit 5% figure is solid)
- Insurance % of price (currently flat 0.9%, needs real quotes — pre-1950s frame construction is a red flag for insurability separate from the numbers)
- FHA rate/MIP figures are Kyle's lender-website research, not a live quote

## Empirical finding: the GRM screen

Ran the engine against 10 real MLS listings (4 quads/6-plex, 1 triplex, 5 duplexes) across Tampa/St. Pete/Clearwater. Finding: **Phase 2 DSCR only clears 1.0x at a gross rent multiplier (price ÷ annual gross rent) of roughly 7.0–7.5x or below**, given 6.49% FHA rate, 3.5% down, and current placeholder tax/insurance/opex assumptions.

| GRM | Phase 2 DSCR (observed) |
|---|---|
| ~12.5x | 0.43–0.44x |
| ~10x | 0.60–0.64x |
| ~8.6–8.8x | 0.76–0.79x |
| ~7.0–7.7x | 0.92–1.04x |

Retail-condition, recently-renovated Tampa-area duplex/quads are almost all priced at 12–12.5x GRM right now — two full turns away from cash-flowing at today's FHA rate and leverage. Only distressed/underpriced listings (935 17th Ave S) or full pro-forma lease-up scenarios (15501 61st St N) got close to 1.0x.

**Update 2026-10-20 (stress test):** the 7.0–7.5x figure only holds under placeholder tax 1.5% / ins 0.9%. Implied breakeven GRM (DSCR 1.0x, FHA, 4 units), owner-paid utilities / tenant-paid:

| Assumptions | Owner pays utilities | Tenants pay |
|---|---|---|
| Base (tax 1.5%, ins 0.9%, 6.49%) | 7.07x | 7.51x |
| Realistic (tax 2.0%, ins 1.5%) | 6.39x | 6.79x |
| Severe (tax 2.0%, ins 2.25%, 7.25%) | 5.72x | 6.08x |
| Rate 5.99%, base tax/ins | 7.34x | 7.80x |

The screen threshold should be derived from the market record (`impliedBreakevenGrm`), not a fixed number.

**Build implication:** a cheap GRM pre-screen (price ÷ annual gross rent) should run before the expensive full PITIA/gate engine, as a first-pass filter on any batch of listings. Threshold configurable per `MarketAssumptions`, not hardcoded.

## Gate framework (Kill / Reprice / Clear / Unverified)

Adapted from Kyle's storage due-diligence framework to house-hack multifamily. Four states per item, not three — nothing is "Clear" until independently verified; "Unverified" is the default. Kyle's own stated pass criteria: Phase 1 = $0/door net cash flow ≥ housing cost covered by tenant rents including OpEx/debt service; Phase 2 (post-move-out, 3rd party managed) hurdles still TBD from Kyle directly (storage hurdles are documented in project source material; house-hack hurdles were partially given — see open questions below).

Free-at-screening checks: FEMA flood zone, permit/CO history, tax parcel unit count vs. advertised doors, construction era/type (insurability flag for pre-1950s frame).

Kill candidates (house-hack): unpermitted/illegal units, uninsurable defects, FHA self-sufficiency failure with no viable restructure, unverifiable rent roll, structural/sinkhole indicators.
Reprice candidates: deferred maintenance, insurance above underwritten, FL tax reassessment at sale, below-market rents (upside, not a defect).

Storage gate thresholds (from Kyle's source material, already numeric — see project doc history / original uploads if needed): missing leases >15% Kill, 5-15% Reprice, <5% Clear; economic-vs-physical occupancy gap <60% Kill (or unreconcilable financials), 10-25pt gap Reprice, <5-8pt Clear; supply >10 SF/capita + active pipeline Kill, 8-10 SF/capita Reprice, ≤8 Clear.

## Roadmap

| Milestone | Deliverable | Status |
|---|---|---|
| M0 | Ported, tested calculation engine (TS) + GRM pre-screen + Tampa MarketAssumptions record | **done 2026-10-20** — on GitHub |
| M0.5 | House-hack Excel workbook (Kyle's own, from scratch — golden file / spec) | not started |
| M1 | Intake, doc vault, assumptions library, pipeline w/ reminders, gates v1, paper-trade ledger, personal capital view | not started |
| M2 | Exit-scenario module (hold/refi/sale, FHA-assumable-vs-refi comparison; tax estimates flagged CPA-to-confirm) | not started |
| M3 | Storage workbook + module + storage gates | not started |
| M4 | OM extraction w/ mandatory human verification | not started |

## Open questions still outstanding

1. Phase 2 hurdles: Kyle delegated to market benchmarks (2026-10-20). Engine uses DSCR 1.20x, $100/door/mo, 8% CoC, labeled as benchmarks. Revisit once he has a view.
2. Real FHA lender quote (rate/MIP). Credit tier now known: 740+.
3. Bound insurance quote + 4-point inspection on a pre-1950 frame quad (current figures are web comps, $9.2k–$11.4k/yr Pinellas).
4. ~~GitHub repo~~ Resolved 2026-10-20: `kdcleaver/re-platform` (private), Claude GitHub App installed, M0 pushed.
5. Gift-fund rules for non-FHA structures (engine currently pools gift + own cash outside FHA).

## Session/tooling decisions

- Model: Opus (high effort) for architecture/engine design; Sonnet for volume implementation once design is locked.
- Repo: GitHub (sync point between cloud build sessions and Kyle's Mac — not a shared filesystem; Mac only needed for local dev/testing, not for the build to start).
- Local stack target: Next.js, TypeScript, Tailwind, SQLite (not Supabase yet — avoids cloud-project-pause issues for a bursty side project), Recharts, Claude API for later OM extraction.

## Build log

### 2026-10-20 — M0 engine + first stress test
- Built `re-platform/` (TypeScript + vitest): `MarketAssumptions` with per-field provenance/verified flag, Tampa MSA record; engine (PITIA, FHA self-sufficiency, capital check, Phase 1, Phase 2, price solvers, GRM screen, implied breakeven GRM, seller-note/bank amortizing financing with balloon); deal records with rent cases (in-place vs. pro forma kept separate) and gates; standard stress grid (rate ±, tax 2.0%, ins 1.5%/2.25%, price −5/−10%, realistic, severe).
- Parity: reproduces `buybox_check.py` v0 to the cent on 4 golden listings; 40 tests passing; new outputs independently cross-checked in Python.
- Capital rule: FHA = gift covers close, reserves from own funds (own cash backfills close only after reserves); non-FHA = pooled until a lender confirms gift rules.
- First 3 paper deals: 3106 N 17th St (Ybor, $650k), 1761 19th St S (Midtown St. Pete, $695k), 1846 2nd Ave N (Kenwood, $750k). None pass the GRM screen, FHA self-sufficiency, $0 housing cost, or DSCR 1.0x at in-place rents. Max price for DSCR 1.0x (base → realistic tax/ins): 1761 $574k → $519k; Ybor $520k → $470k; Kenwood $543k → $491k.
- Outside Ybor brief: its 4.5% seller note (10% down, $585k) exceeds the seller's ~$221k equity over an open $429k loan, and only clears 1.0x DSCR on its own pro forma rents (28% above in-place). Engine flags both.
- Next: push to GitHub (repo name open), make GRM screen derived from the market record, Kyle's Phase 2 hurdles, real lender + insurance quotes.

### 2026-10-20 (later) — market record v2026-10, hurdles, max offer
- Market records are now versioned: `2026-09-v0` frozen (parity), `2026-10` current. Each input carries confidence: placeholder / researched / quoted.
- Tax → 1.7% of price: 2025 total millage St. Pete 19.92 (Pinellas Tax Collector), Tampa ~19.8 (HCPA components), × ~85% assessment-to-sale.
- Insurance → deal-level $ estimates where available ($9.2k–$11.4k/yr comps for Pinellas pre-1950 frame quads, Kyle's research, not bound); market default 1.45% of price. Insurance is held as fixed $ across price cuts/solvers (follows replacement cost, not price).
- Kyle's "lender quote" (Select Commercial 6.60%, 80% LTV, 1.25x) is an indicative rate sheet with a $1.5M minimum loan and 5+ unit programs: kept as an eligibility check that fails for all three deals. Realistic non-FHA path for 2–4 units = DSCR investor loan (~7.0–7.25% at 75–80% LTV, 720–739 FICO, DSCR Authority 2026-10-19; modeled 7.125% @ 25% down, 7.375% @ 20%).
- GRM screen is now derived from the record's own defaults: 6.59x (owner-paid utilities) / 7.01x (tenant-paid) at DSCR 1.0; 5.76x at the 1.20x hurdle.
- New: buyer profile with hurdles, lender min-DSCR + eligibility checks, max-offer solver naming the binding constraint, capital solver.
- Results (in-place rents, FHA base): max offer Ybor $369k (ask $650k), 1761 19th St S $404k ($695k), 1846 2nd Ave N $366k ($750k). Binding constraint in all three is Kyle's $0 Phase 1 housing cost; Phase 2 hurdles alone allow $395k / $437k / $408k. DSCR loans are capital-bound at ~$200k for $70k of cash.
- 54 tests; new outputs re-derived independently in Python (8/8 exact).

### 2026-10-20 (later) — credit tier
- Kyle's credit is in the 740+ tier (both bureaus). Buyer profile stores the tier only, not exact scores.
- Loan products now price by credit tier (`rateByFico`): DSCR 25% down 7.00% (740+) vs 7.125% (720–739); 20% down 7.25% vs 7.375%. Verdicts unchanged: DSCR loans remain capital-bound (~$200k max price on $70k cash).
- FHA rate still Kyle's web research (6.49% APR); a 740+ borrower may price better on a live quote.

### 2026-10-20 (later) — Sept batch loaded (13 deals total)
- Re-pulled the 10 Sept listings: all still active. Changes since Sept: 725 14th Ave S cut to $700k; 7711 Amherst to $530k; 2613 E 23rd to $779,900; 15501 61st to $649,990; 208–212 Elizabeth to $879k. 935 17th Ave S is a flip (bought 03/2026 at $265k, ask $539,990).
- Engine additions: FHA loan limits by unit count (Tampa MSA at the 2026 national floor: $541,287 / ~$693k / ~$838k / ~$1.041M; 2–4 unit derived, verify on HUD); FHA 3-month reserves now only for 3–4 units (HUD; v0 applied them to duplexes too); rent-needed solver for deals without a rent roll; screening flags for single-family zoning codes, First Street flood score ≥5, missing FEMA zone, 5+ units.
- Results (FHA base, primary rent case): nothing within 40% of ask. Max offers: 1761 19th St S $404k (ask $695k), 3106 N 17th $369k ($650k), 1846 2nd Ave N $366k ($750k), 725 14th Ave S $331k ($700k), 15501 61st $261k ($650k), 935 17th Ave S $175k ($540k), 2613 E 23rd $139k ($780k), 7711 Amherst $106k ($530k); 9502 Banyan / 7902 N 14th fail $0 housing at any price ≥ $100k. 236 W North + 208–212 Elizabeth publish no rents (need ~$11–14k/mo). 633 7th Ave N (6 units) has no eligible financing.
- Duplex finding: $0 Phase 1 housing cost means one tenant's rent must cover the whole PITIA — structurally out of reach for Tampa duplexes at any realistic price. Phase 2 hurdle prices for duplexes run $186k–$346k vs $480k–$780k asks.
- Insurance default (1.45%, from frame-quad comps) is likely heavy for block duplexes; at 0.9% the duplex max offers rise $25–50k — conclusion unchanged.
- 64 tests; duplex/triplex/rent-needed outputs re-derived independently in Python (8/8 exact).

### 2026-10-20 (later) — path analysis: "what could work?"
- Kyle asked to move from a rigid buy box to showing which strategy/structure could work. New `src/paths.ts` + `npm run paths`.
- New Phase 1 comparator: Kyle's current housing — $2,765/mo household all-in, $2,450 base rent used as like-for-like (as owner he keeps paying electric/internet; model already charges water/trash on his unit). "$0 housing cost" stays as a stricter secondary test.
- Levers solved per deal and rated by explicit rules (days on market incl. prior runs, price cuts, recorded loans vs. price, rent evidence, cash): negotiated price (to beat rent and DSCR 1.0x), rent needed, 6% FHA seller credit (3% closing + ~0.75% buydown), seller financing (6%, 10% down, 5-yr balloon), VA/FHA loan assumption + seller second, and a realistic package (5–10% off + 3% credit).
- Rough 5-yr wealth vs renting at 0% / 3% appreciation, for "move out after year 1" vs "stay all 5 years".
- Findings: as listed, Ybor (~$2,267/mo) and 1761 19th St S (~$2,343/mo) already beat Kyle's rent. Best plausible path: 1761 at 10% off + 3% seller credit → ~$1,783/mo (saves ~$667/mo). No path rated plausible clears Phase 2 DSCR 1.0x; every quad loses ~$900–1,500/mo after move-out. Staying the full 5 years turns the quads wealth-positive even at 0% appreciation (~$37–74k, mostly principal paydown + savings); moving out after year 1 needs appreciation to work. Duplexes, Kenwood, 725 14th (marginal), and 15501 61st don't beat rent on any plausible path.
- Placeholder rules to calibrate as paper trades resolve: motivation thresholds, price-cut bands, buydown ~0.25%/point, seller-note terms, assumption rate guess, appreciation/opportunity rates.
- 75 tests; one full path (1761 package, incl. both wealth plans) re-derived independently in Python (8/8 exact).

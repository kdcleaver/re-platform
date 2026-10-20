# Stress test: 13 paper deals
Market record **Tampa–St. Petersburg–Clearwater MSA @ 2026-10** (as of 2026-10-20). Run 2026-10-20.

**Base case:** FHA 3.5% down @ 6.5%; tax 1.7% of price; insurance = deal estimate midpoint where we have one, else 1.5%; vacancy 5.0%, repairs+capex 10.0%, mgmt 8.0%. Capital: $50k gift + $20k own.

**Hurdles:** Phase 1 net housing cost ≤ $0 (Kyle's own). Phase 2 DSCR ≥ 1.2x, cash flow ≥ $100/door/mo, CoC ≥ 8.0% (benchmark defaults, not yet Kyle's own).

### Input confidence

| Input | Confidence | Source |
|---|---|---|
| fha.rate | researched | Rocket Mortgage FHA 30-yr APR (Kyle's research, 2026-09). Not a live quote. |
| fha.ufmipPct | researched | FHA published UFMIP 1.75%. |
| fha.mipLow | researched | FHA annual MIP, LTV > 95%, base loan <= $726,200 (Kyle's research). |
| fha.mipHigh | researched | FHA annual MIP, base loan > $726,200 (Kyle's research). |
| fha.selfSufficiencyFactor | researched | HUD 4000.1 self-sufficiency test, 3–4 units. |
| fha.reserveMonths | researched | HUD 4000.1: 3 months PITIA reserves for 3–4 units. |
| propertyTaxPctOfPrice | researched | [link](https://pinellastaxcollector.gov/pdfs/2025%20MILLAGE.pdf) 2025 total millage: St. Petersburg (SP) 19.92 (Pinellas Tax Collector); City of Tampa (TA) ~19.8 summed from HCPA 2025 final millage components. x ~85% assessment-to-sale ratio (FL just value nets cost of sale) = ~1.7% of price. Non-homestead; owner-unit homestead exemption ignored (conservative). |
| insurancePctOfPrice | researched | Default for deals without their own estimate: midpoint of Kyle's Pinellas pre-1950 frame quad comps ($9.2k–$11.4k/yr, Kin/State Farm/Insurify, 2026-10) over ~$710k price ≈ 1.45%. Conservative for block/masonry; replace with a bound quote. |
| closingCostPct | placeholder | Placeholder: buyer closing + prepaids, no seller credit. |
| conventionalDownPctByUnits | placeholder | Only 1-unit 5% is solid; 2–4 unit figures need lender verification. |
| opex | placeholder | Rule-of-thumb placeholders from buybox_check.py v0. |
| loanProducts.dscr-25 | researched | [link](https://dscrauthority.com/rates/) DSCR Authority rate grid 2026-10-19, 75% LTV, DSCR 1.00–1.24, ~1 pt: 740+ = 6.875%, 720–739 = 7.00%; 2–4 units +0–0.25% (modeled +0.125%) → 7.00% / 7.125%. HomeAbroad 2026-10-06 (740 FICO): 75% LTV par 6.75% + 0.30% for DSCR 1.00–1.25. |
| loanProducts.dscr-20 | researched | [link](https://dscrauthority.com/rates/) DSCR Authority 2026-10-19, 80% LTV: 740+ = 7.125%, 720–739 = 7.25%; +0.125% for 2–4 units → 7.25% / 7.375%. |
| loanProducts.commercial-sb | researched | [link](https://selectcommercial.com/commercial-mortgage-rates.php) Select Commercial indicative rates 2026-10-20: Apartment/Freddie SBL 6.60% 5-yr, 80% LTV purchase, 1.25x DSCR at 75–80% LTV, 30-yr amort. $1.5M minimum loan ('no exceptions'); 5+ unit programs. Reference only: not eligible for 2–4 unit deals of this size. |
| fha.loanLimitByUnits | researched | [link](https://homebuyer.com/mortgage-loan-limits/hillsborough-county-florida) 2026 FHA 1-unit limit $541,287 for Hillsborough (homebuyer.com, citing HUD/FHFA, 2026-10-20) = the national floor (65% of $832,750 conforming). 2–4 unit figures derived as 65% of 2026 conforming 2–4 unit limits; Pinellas shares the Tampa MSA. Verify on HUD's FHA limit lookup. |
| singleFamilyZoningPatterns | placeholder | Tampa RS-*, Seminole Heights SH-RS; St. Pete NT-1..3; Pinellas unincorporated R-1..R-3. Screening heuristic only: a match means 'confirm legal nonconforming status', not a ruling. |
| screen | researched | Derived from this record's own defaults (FHA, Phase 2 DSCR 1.0x). Replaces fixed 7.5x after the 2026-10-20 stress test. |

## Verdict: max offer on each deal's primary rent case

Primary rent case = in-place where it exists, else MLS gross, else the listing's stated rent. Max offer = highest price clearing **every** constraint that applies (Phase 2 hurdles, $0 Phase 1 housing cost, FHA self-sufficiency, FHA loan limit, lender DSCR, capital).

| Deal | Units | Ask | Rent case | GRM | FHA base: max offer | vs ask | Binding | FHA downside | Phase 2 hurdles only |
|---|---|---|---|---|---|---|---|---|---|
| Ybor City quad (bungalow + triplex) | 4 | $650k | In-place (3 leased) + vacant 1bd at $1,350 | 9.4x | **$369k** | -43.3% | $0 Phase 1 housing cost | $316k | $395k |
| Midtown St. Pete quad (4 x 2bd) | 4 | $695k | In-place rent roll ($6,757/mo) | 8.6x | **$404k** | -41.8% | $0 Phase 1 housing cost | $359k | $437k |
| Historic Kenwood quad (3 x 1bd + 3bd) | 4 | $750k | In-place / MLS gross ($6,225/mo) | 10.0x | **$366k** | -51.2% | $0 Phase 1 housing cost | $325k | $408k |
| Seminole Heights quad (236 W North St) | 4 | $998k | **no rents published** | — | — | — | needs rent roll | — | — |
| St. Pete 6-plex (633 7th Ave N) | 6 | $1000k | MLS gross income ($110,460/yr) | 9.1x | **—** | — | not FHA-eligible (5+ units) | — | n/a |
| St. Pete quad (725 14th Ave S) | 4 | $700k | MLS gross income ($71,760/yr) | 9.8x | **$331k** | -52.7% | $0 Phase 1 housing cost | $280k | $374k |
| St. Pete duplex (935 17th Ave S) | 2 | $540k | Asking rent from Sept listing ($2,600/unit) | 8.7x | **$175k** | -67.7% | $0 Phase 1 housing cost | $142k | $346k |
| Clearwater triplex (15501 61st St N) | 3 | $650k | In-place at close + vacant at last rent ($5,100) | 10.6x | **$261k** | -59.8% | $0 Phase 1 housing cost | $217k | $340k |
| Clearwater quad (208–212 Elizabeth Ave) | 4 | $879k | **no rents published** | — | — | — | needs rent roll | — | — |
| Ybor new-build duplex (2613 E 23rd Ave) | 2 | $780k | Seller: $2,600+/unit ($5,200) | 12.5x | **$139k** | -82.2% | $0 Phase 1 housing cost | $101k | $315k |
| Tampa duplex (7711 Amherst St) | 2 | $530k | In-place ($3,525/mo) | 12.5x | **$106k** | -79.9% | $0 Phase 1 housing cost | — | $224k |
| Tampa duplex (9502 Banyan Ave) | 2 | $480k | In-place ($3,180/mo) | 12.6x | **—** | — | $0 Phase 1 housing cost (fails at every price tested) | — | $186k |
| Sulphur Springs duplex (7902 N 14th St) | 2 | $480k | In-place ($3,180/mo) | 12.6x | **—** | — | $0 Phase 1 housing cost (fails at every price tested) | — | $186k |

## Rent needed at asking price (FHA base)

What gross monthly rent (all doors) each ask would need. "Other doors for $0" = rent from the non-owner units for $0 Phase 1 housing cost.

| Deal | Ask | Primary rent | FHA self-sufficiency | DSCR 1.0x | Phase 2 hurdles | Other doors for $0 | Primary rent covers |
|---|---|---|---|---|---|---|---|
| Ybor City quad (bungalow + triplex) | $650k | $5,770 | $8,031 | $7,732 | $8,841 | $7,087 | 65.3% of hurdle rent |
| Midtown St. Pete quad (4 x 2bd) | $695k | $6,757 | $8,612 | $8,677 | $9,862 | $7,952 | 68.5% of hurdle rent |
| Historic Kenwood quad (3 x 1bd + 3bd) | $750k | $6,225 | $9,203 | $9,066 | $10,345 | $8,309 | 60.2% of hurdle rent |
| Seminole Heights quad (236 W North St) | $998k | none published | $12,545 | $12,463 | $14,206 | $11,422 | — |
| St. Pete 6-plex (633 7th Ave N) | $1000k | $9,205 | n/a | n/a | n/a | n/a | no eligible financing (6 units) |
| St. Pete quad (725 14th Ave S) | $700k | $5,980 | $8,649 | $8,712 | $9,906 | $7,985 | 60.4% of hurdle rent |
| St. Pete duplex (935 17th Ave S) | $540k | $5,200 | n/a | $6,616 | $7,537 | $6,064 | 69.0% of hurdle rent |
| Clearwater triplex (15501 61st St N) | $650k | $5,100 | $8,031 | $7,732 | $8,841 | $7,086 | 57.7% of hurdle rent |
| Clearwater quad (208–212 Elizabeth Ave) | $879k | none published | $11,049 | $11,023 | $12,558 | $10,102 | — |
| Ybor new-build duplex (2613 E 23rd Ave) | $780k | $5,200 | n/a | $9,631 | $10,993 | $8,827 | 47.3% of hurdle rent |
| Tampa duplex (7711 Amherst St) | $530k | $3,525 | n/a | $6,305 | $7,209 | $5,778 | 48.9% of hurdle rent |
| Tampa duplex (9502 Banyan Ave) | $480k | $3,180 | n/a | $5,903 | $6,721 | $5,410 | 47.3% of hurdle rent |
| Sulphur Springs duplex (7902 N 14th St) | $480k | $3,180 | n/a | $5,903 | $6,721 | $5,410 | 47.3% of hurdle rent |

## Screen calibration

Derived screen (this record, FHA, DSCR 1.0x): **6.59x** (v0 used a fixed 7.5x).

| Assumptions | Owner pays $75/door utilities | Tenants pay utilities |
|---|---|---|
| This record, DSCR 1.0x | 6.59x | 7.01x |
| This record, hurdle DSCR 1.2x | 5.76x | 6.13x |
| Tax 2.0%, ins 1.8%, rate 7.25% | 5.93x | 6.30x |
| v0 placeholders | 7.07x | 7.51x |

## GRM pre-screen (max 6.59x)

| Deal | Ask | Rent case | GRM | Pass | Price at 6.59x | Cut needed |
|---|---|---|---|---|---|---|
| Midtown St. Pete quad (4 x 2bd) | $695k | Seller's HUD FMR upside ($2,130/door) | 6.80x | ❌ | $674k | 3.1% |
| St. Pete duplex (935 17th Ave S) | $540k | Seller's HUD FMR ($3,195/unit) | 7.04x | ❌ | $505k | 6.4% |
| Ybor City quad (bungalow + triplex) | $650k | Outside brief pro forma ($7,400/mo) | 7.32x | ❌ | $585k | 10.0% |
| Clearwater triplex (15501 61st St N) | $650k | Seller pro forma ($7,050) | 7.68x | ❌ | $558k | 14.2% |
| Midtown St. Pete quad (4 x 2bd) | $695k | In-place rent roll ($6,757/mo) | 8.57x | ❌ | $534k | 23.1% |
| St. Pete duplex (935 17th Ave S) | $540k | Asking rent from Sept listing ($2,600/unit) | 8.65x | ❌ | $411k | 23.8% |
| Clearwater triplex (15501 61st St N) | $650k | In-place + RV pad at $900 ($6,000) | 9.03x | ❌ | $474k | 27.0% |
| St. Pete 6-plex (633 7th Ave N) | $1000k | MLS gross income ($110,460/yr) | 9.05x | ❌ | $728k | 27.2% |
| Ybor City quad (bungalow + triplex) | $650k | In-place (3 leased) + vacant 1bd at $1,350 | 9.39x | ❌ | $456k | 29.8% |
| St. Pete quad (725 14th Ave S) | $700k | MLS gross income ($71,760/yr) | 9.75x | ❌ | $473k | 32.4% |
| Historic Kenwood quad (3 x 1bd + 3bd) | $750k | In-place / MLS gross ($6,225/mo) | 10.04x | ❌ | $492k | 34.4% |
| Ybor City quad (bungalow + triplex) | $650k | MLS gross income ($61,704/yr) | 10.53x | ❌ | $407k | 37.4% |
| Clearwater triplex (15501 61st St N) | $650k | In-place at close + vacant at last rent ($5,100) | 10.62x | ❌ | $403k | 38.0% |
| Ybor new-build duplex (2613 E 23rd Ave) | $780k | Seller: $2,600+/unit ($5,200) | 12.50x | ❌ | $411k | 47.3% |
| Tampa duplex (7711 Amherst St) | $530k | In-place ($3,525/mo) | 12.53x | ❌ | $279k | 47.4% |
| Tampa duplex (9502 Banyan Ave) | $480k | In-place ($3,180/mo) | 12.58x | ❌ | $251k | 47.6% |
| Sulphur Springs duplex (7902 N 14th St) | $480k | In-place ($3,180/mo) | 12.58x | ❌ | $251k | 47.6% |

## Ybor City quad (bungalow + triplex)
3106 N 17th St, Tampa, FL 33605 · ask $650,000 · listed 2026-10-14 · [listing](https://www.homes.com/property/3106-n-17th-st-tampa-fl/xbn0kbyzl4jqz/)

- ⚠️ Zoning RS-50 reads as single-family. Confirm the 4 units are legal (nonconforming/grandfathered) before anything else.
- ⚠️ "Outside brief pro forma ($7,400/mo)" is 28% above in-place rent. Underwrite to in-place.
- ℹ️ Current tax $9,620 (1.48% of ask) resets on sale; FL reassesses to just value.

### In-place (3 leased) + vacant 1bd at $1,350 — $5,770/mo
_MLS total actual rent $4,420 on 3 leased doors; vacant 1bd at the brief's $1,350 (unverified)._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $650k | $9,425 | $6,024 | ❌ -$1,696 | $2,267 | 0.65x | -$382 | -43.4% | ❌ | ✅ | $369k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $650k | $5,850 | $5,617 | ❌ -$1,290 | $1,860 | 0.74x | -$281 | -31.9% | ❌ | ✅ | $414k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $650k | $9,425 | $5,816 | ❌ -$1,489 | $2,059 | 0.68x | -$330 | -37.5% | ❌ | ✅ | $384k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $650k | $9,425 | $6,348 | ❌ -$2,020 | $2,591 | 0.60x | -$463 | -52.6% | ❌ | ✅ | $347k ($0 Phase 1 housing cost) |
| Tax 2.0% | $650k | $9,425 | $6,186 | ❌ -$1,859 | $2,429 | 0.61x | -$423 | -48.0% | ❌ | ✅ | $358k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $650k | $11,700 | $6,213 | ❌ -$1,886 | $2,456 | 0.60x | -$430 | -48.8% | ❌ | ✅ | $345k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $650k | $14,625 | $6,457 | ❌ -$2,129 | $2,700 | 0.55x | -$491 | -55.7% | ❌ | ✅ | $315k ($0 Phase 1 housing cost) |
| Price -5% | $618k | $9,425 | $5,762 | ❌ -$1,434 | $2,005 | 0.69x | -$317 | -37.9% | ❌ | ✅ | $369k ($0 Phase 1 housing cost) |
| Price -10% | $585k | $9,425 | $5,500 | ❌ -$1,172 | $1,743 | 0.74x | -$251 | -31.7% | ❌ | ✅ | $369k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $650k | $11,700 | $6,700 | ❌ -$2,372 | $2,943 | 0.52x | -$551 | -62.6% | ❌ | ❌ -$99 | $316k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $650k | $9,425 | $4,950 | n/a | $1,193 | 0.86x (lender 1x ❌) | -$114 | -2.9% | ❌ | ❌ -$148,198 | $199k (capital) |
| DSCR loan 20% down @ 7.250% | $650k | $9,425 | $5,254 | n/a | $1,497 | 0.79x (lender 1x ❌) | -$190 | -5.8% | ❌ | ❌ -$117,521 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | $1,270 | 0.84x (lender 1.25x ❌) | -$133 | -4.3% | ❌ | ❌ -$109,664 | ineligible |
| Brief: 10% down, 4.5% seller note, 7-yr balloon | $650k | $9,425 | $4,670 | n/a | $913 | 0.94x | -$44 | -2.5% | ❌ | ❌ -$28,511 | $457k (capital) |
| Brief seller note + tax 2.0%, ins high | $650k | $11,700 | $5,022 | n/a | $1,265 | 0.82x | -$132 | -7.5% | ❌ | ❌ -$29,567 | $447k ($0 Phase 1 housing cost) |
| Brief's FHA case (7.25%) | $650k | $9,425 | $6,348 | ❌ -$2,020 | $2,591 | 0.60x | -$463 | -52.6% | ❌ | ✅ | $347k ($0 Phase 1 housing cost) |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $520k < $1500k minimum; 4 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$487,333 due in year 5; refinance risk.
- 🚩 Brief: 10% down, 4.5% seller note, 7-yr balloon: Seller note $585,000 exceeds seller's equity ~$221,000 (recorded liens $429,000). Requires payoff at close or a wrap with due-on-sale risk.
- 🚩 Brief: 10% down, 4.5% seller note, 7-yr balloon: Balloon of ~$509,104 due in year 7; refinance risk.
- 🚩 Brief seller note + tax 2.0%, ins high: Seller note $585,000 exceeds seller's equity ~$221,000 (recorded liens $429,000). Requires payoff at close or a wrap with due-on-sale risk.
- 🚩 Brief seller note + tax 2.0%, ins high: Balloon of ~$509,104 due in year 7; refinance risk.

### MLS gross income ($61,704/yr) — $5,142/mo
_Seller-reported gross; composition unknown (may include RUBS bill-back)._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $650k | $9,425 | $6,024 | ❌ -$2,167 | $2,746 | 0.53x | -$504 | -57.3% | ❌ | ✅ | $309k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $650k | $5,850 | $5,617 | ❌ -$1,761 | $2,339 | 0.63x | -$403 | -45.8% | ❌ | ✅ | $354k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $650k | $9,425 | $5,816 | ❌ -$1,960 | $2,538 | 0.56x | -$453 | -51.4% | ❌ | ✅ | $322k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $650k | $9,425 | $6,348 | ❌ -$2,491 | $3,070 | 0.50x | -$585 | -66.5% | ❌ | ✅ | $291k ($0 Phase 1 housing cost) |
| Tax 2.0% | $650k | $9,425 | $6,186 | ❌ -$2,330 | $2,908 | 0.49x | -$545 | -61.9% | ❌ | ✅ | $300k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $650k | $11,700 | $6,213 | ❌ -$2,357 | $2,935 | 0.49x | -$552 | -62.7% | ❌ | ✅ | $286k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $650k | $14,625 | $6,457 | ❌ -$2,600 | $3,179 | 0.43x | -$613 | -69.6% | ❌ | ✅ | $256k ($0 Phase 1 housing cost) |
| Price -5% | $618k | $9,425 | $5,762 | ❌ -$1,905 | $2,484 | 0.57x | -$439 | -52.5% | ❌ | ✅ | $309k ($0 Phase 1 housing cost) |
| Price -10% | $585k | $9,425 | $5,500 | ❌ -$1,643 | $2,222 | 0.62x | -$374 | -47.2% | ❌ | ✅ | $309k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $650k | $11,700 | $6,700 | ❌ -$2,843 | $3,422 | 0.42x | -$674 | -76.5% | ❌ | ❌ -$99 | $261k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $650k | $9,425 | $4,950 | n/a | $1,672 | 0.71x (lender 1x ❌) | -$236 | -6.0% | ❌ | ❌ -$148,198 | $199k (capital) |
| DSCR loan 20% down @ 7.250% | $650k | $9,425 | $5,254 | n/a | $1,976 | 0.65x (lender 1x ❌) | -$312 | -9.6% | ❌ | ❌ -$117,521 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | $1,749 | 0.69x (lender 1.25x ❌) | -$255 | -8.2% | ❌ | ❌ -$109,664 | ineligible |
| Brief: 10% down, 4.5% seller note, 7-yr balloon | $650k | $9,425 | $4,670 | n/a | $1,392 | 0.78x | -$166 | -9.4% | ❌ | ❌ -$28,511 | $417k ($0 Phase 1 housing cost) |
| Brief seller note + tax 2.0%, ins high | $650k | $11,700 | $5,022 | n/a | $1,744 | 0.66x | -$254 | -14.4% | ❌ | ❌ -$29,567 | $370k ($0 Phase 1 housing cost) |
| Brief's FHA case (7.25%) | $650k | $9,425 | $6,348 | ❌ -$2,491 | $3,070 | 0.50x | -$585 | -66.5% | ❌ | ✅ | $291k ($0 Phase 1 housing cost) |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $520k < $1500k minimum; 4 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$487,333 due in year 5; refinance risk.
- 🚩 Brief: 10% down, 4.5% seller note, 7-yr balloon: Seller note $585,000 exceeds seller's equity ~$221,000 (recorded liens $429,000). Requires payoff at close or a wrap with due-on-sale risk.
- 🚩 Brief: 10% down, 4.5% seller note, 7-yr balloon: Balloon of ~$509,104 due in year 7; refinance risk.
- 🚩 Brief seller note + tax 2.0%, ins high: Seller note $585,000 exceeds seller's equity ~$221,000 (recorded liens $429,000). Requires payoff at close or a wrap with due-on-sale risk.
- 🚩 Brief seller note + tax 2.0%, ins high: Balloon of ~$509,104 due in year 7; refinance risk.

### Outside brief pro forma ($7,400/mo) — $7,400/mo
_House $3,000, 2bd $1,700, 1bds $1,350 x2. Not supported by in-place leases._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $650k | $9,425 | $6,024 | ❌ -$474 | $881 | 0.94x | -$65 | -7.4% | ❌ | ✅ | $530k (Phase 2 hurdles) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $650k | $5,850 | $5,617 | ❌ -$67 | $475 | 1.03x | $37 | 4.2% | ❌ | ✅ | $572k (Phase 2 hurdles) |
| FHA rate 5.99% | $650k | $9,425 | $5,816 | ❌ -$266 | $674 | 0.99x | -$13 | -1.5% | ❌ | ✅ | $553k (Phase 2 hurdles) |
| FHA rate 7.25% | $650k | $9,425 | $6,348 | ❌ -$798 | $1,205 | 0.87x | -$146 | -16.6% | ❌ | ✅ | $499k (Phase 2 hurdles) |
| Tax 2.0% | $650k | $9,425 | $6,186 | ❌ -$636 | $1,044 | 0.90x | -$105 | -12.0% | ❌ | ✅ | $517k (Phase 2 hurdles) |
| Insurance high end (or 1.8%) | $650k | $11,700 | $6,213 | ❌ -$663 | $1,071 | 0.90x | -$112 | -12.7% | ❌ | ✅ | $510k (Phase 2 hurdles) |
| Insurance 2.25% (surplus lines) | $650k | $14,625 | $6,457 | ❌ -$907 | $1,314 | 0.84x | -$173 | -19.7% | ❌ | ✅ | $484k (Phase 2 hurdles) |
| Price -5% | $618k | $9,425 | $5,762 | ❌ -$212 | $619 | 1.00x | $1 | 0.1% | ❌ | ✅ | $530k (Phase 2 hurdles) |
| Price -10% | $585k | $9,425 | $5,500 | ✅ | $357 | 1.07x | $66 | 8.4% | ❌ | ✅ | $530k (Phase 2 hurdles) |
| Downside: tax 2.0%, ins high, rate 7.25% | $650k | $11,700 | $6,700 | ❌ -$1,150 | $1,557 | 0.80x | -$234 | -26.6% | ❌ | ❌ -$99 | $468k (Phase 2 hurdles) |
| DSCR loan 25% down @ 7.000% | $650k | $9,425 | $4,950 | n/a | -$193 | 1.25x (lender 1x ✅) | $204 | 5.2% | ❌ | ❌ -$148,198 | $199k (capital) |
| DSCR loan 20% down @ 7.250% | $650k | $9,425 | $5,254 | n/a | $111 | 1.14x (lender 1x ✅) | $128 | 3.9% | ❌ | ❌ -$117,521 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | -$115 | 1.22x (lender 1.25x ❌) | $184 | 5.9% | ❌ | ❌ -$109,664 | ineligible |
| Brief: 10% down, 4.5% seller note, 7-yr balloon | $650k | $9,425 | $4,670 | n/a | -$472 | 1.37x | $274 | 15.5% | ✅ | ❌ -$28,511 | $457k (capital) |
| Brief seller note + tax 2.0%, ins high | $650k | $11,700 | $5,022 | n/a | -$120 | 1.25x | $186 | 10.5% | ✅ | ❌ -$29,567 | $451k (capital) |
| Brief's FHA case (7.25%) | $650k | $9,425 | $6,348 | ❌ -$798 | $1,205 | 0.87x | -$146 | -16.6% | ❌ | ✅ | $499k (Phase 2 hurdles) |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $520k < $1500k minimum; 4 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$487,333 due in year 5; refinance risk.
- 🚩 Brief: 10% down, 4.5% seller note, 7-yr balloon: Seller note $585,000 exceeds seller's equity ~$221,000 (recorded liens $429,000). Requires payoff at close or a wrap with due-on-sale risk.
- 🚩 Brief: 10% down, 4.5% seller note, 7-yr balloon: Balloon of ~$509,104 due in year 7; refinance risk.
- 🚩 Brief seller note + tax 2.0%, ins high: Seller note $585,000 exceeds seller's equity ~$221,000 (recorded liens $429,000). Requires payoff at close or a wrap with due-on-sale risk.
- 🚩 Brief seller note + tax 2.0%, ins high: Balloon of ~$509,104 due in year 7; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Zoning permits 4 units** (kill if confirmed): RS-50 is single-family zoning. 4 units likely legal nonconforming at best — confirm with City of Tampa.
- [ ] **Permit / CO history** (kill if confirmed): Triplex legality and 2020–21 renovation permits not yet checked.
- [ ] **Parcel unit count vs. advertised doors** (kill if confirmed): MLS: 4 units, 2 buildings. Check Hillsborough PA record.
- [ ] **FEMA flood zone**: MLS says Zone X. Confirm on FEMA map.
- [ ] **Insurability / quote** (reprice if confirmed): 1924 build; MLS says block/brick (unverified). No estimate yet: engine uses the market default 1.45% of price, conservative if it really is masonry.
- [ ] **Seller-reported opex reconciles** (reprice if confirmed): Seller lists $40,110/yr opex = 65% of MLS gross. Need line items.
- [ ] **Seller financing feasible** (kill if confirmed): Open $429k conventional (2024). A $585k seller note needs payoff or a wrap.

- Outside brief double-counts taxes/insurance (NOI after T&I, then subtracts full PITI).
- Brief's FHA live-in figure (-$2,912/mo) does not reconcile with its own rents.

## Midtown St. Pete quad (4 x 2bd)
1761 19th St S, St. Petersburg, FL 33712 · ask $695,000 · listed 2026-06-29 · [listing](https://www.homes.com/property/1761-19th-st-s-st-petersburg-fl/qfdm8bmw3qrjz/)

- ⚠️ 1927 frame construction: needs a bound insurance quote and a clean 4-point inspection.
- ⚠️ MLS unit-count field says 1, listing advertises 4 doors. Verify parcel unit count / CO.
- ⚠️ "Seller's HUD FMR upside ($2,130/door)" is 26% above in-place rent. Underwrite to in-place.
- ℹ️ Current tax $8,765 (1.26% of ask) resets on sale; FL reassesses to just value.

### In-place rent roll ($6,757/mo) — $6,757/mo

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $695k | $10,300 | $6,459 | ❌ -$1,391 | $2,343 | 0.68x | -$374 | -39.7% | ❌ | ✅ | $404k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $695k | $6,255 | $6,006 | ❌ -$938 | $1,890 | 0.77x | -$261 | -27.7% | ❌ | ✅ | $455k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $695k | $10,300 | $6,237 | ❌ -$1,170 | $2,122 | 0.71x | -$318 | -33.8% | ❌ | ✅ | $421k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $695k | $10,300 | $6,806 | ❌ -$1,738 | $2,690 | 0.63x | -$460 | -48.9% | ❌ | ❌ -$417 | $381k ($0 Phase 1 housing cost) |
| Tax 2.0% | $695k | $10,300 | $6,633 | ❌ -$1,565 | $2,517 | 0.64x | -$417 | -44.3% | ❌ | ✅ | $392k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $695k | $11,400 | $6,551 | ❌ -$1,483 | $2,435 | 0.66x | -$397 | -42.2% | ❌ | ✅ | $393k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $695k | $15,638 | $6,904 | ❌ -$1,836 | $2,788 | 0.58x | -$485 | -51.5% | ❌ | ❌ -$712 | $349k ($0 Phase 1 housing cost) |
| Price -5% | $660k | $10,300 | $6,179 | ❌ -$1,111 | $2,063 | 0.72x | -$304 | -34.0% | ❌ | ✅ | $404k ($0 Phase 1 housing cost) |
| Price -10% | $626k | $10,300 | $5,899 | ❌ -$831 | $1,783 | 0.77x | -$234 | -27.6% | ❌ | ✅ | $404k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $695k | $11,400 | $7,071 | ❌ -$2,003 | $2,955 | 0.58x | -$527 | -56.0% | ❌ | ❌ -$1,213 | $359k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $695k | $10,300 | $5,311 | n/a | $1,195 | 0.90x (lender 1x ❌) | -$87 | -2.1% | ❌ | ❌ -$163,415 | $197k (capital) |
| DSCR loan 20% down @ 7.250% | $695k | $10,300 | $5,636 | n/a | $1,520 | 0.82x (lender 1x ❌) | -$168 | -4.8% | ❌ | ❌ -$130,615 | $231k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $695k | $10,300 | $5,394 | n/a | $1,278 | 0.88x (lender 1.25x ❌) | -$108 | -3.2% | ❌ | ❌ -$122,213 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $556k < $1500k minimum; 4 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$521,072 due in year 5; refinance risk.

### Seller's HUD FMR upside ($2,130/door) — $8,520/mo
_FMR is a Section 8 payment benchmark, not a market-rent comp for ~530 sf units._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $695k | $10,300 | $6,459 | ❌ -$69 | $1,328 | 0.97x | -$31 | -3.2% | ❌ | ✅ | $530k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $695k | $6,255 | $6,006 | ✅ | $875 | 1.07x | $83 | 8.8% | ❌ | ✅ | $584k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $695k | $10,300 | $6,237 | ✅ | $1,106 | 1.02x | $25 | 2.6% | ❌ | ✅ | $552k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $695k | $10,300 | $6,806 | ❌ -$416 | $1,674 | 0.91x | -$117 | -12.4% | ❌ | ❌ -$417 | $499k ($0 Phase 1 housing cost) |
| Tax 2.0% | $695k | $10,300 | $6,633 | ❌ -$243 | $1,501 | 0.94x | -$74 | -7.9% | ❌ | ✅ | $514k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $695k | $11,400 | $6,551 | ❌ -$161 | $1,419 | 0.95x | -$53 | -5.7% | ❌ | ✅ | $519k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $695k | $15,638 | $6,904 | ❌ -$514 | $1,772 | 0.88x | -$142 | -15.1% | ❌ | ❌ -$712 | $475k ($0 Phase 1 housing cost) |
| Price -5% | $660k | $10,300 | $6,179 | ✅ | $1,048 | 1.04x | $39 | 4.4% | ❌ | ✅ | $530k ($0 Phase 1 housing cost) |
| Price -10% | $626k | $10,300 | $5,899 | ✅ | $768 | 1.11x | $110 | 12.9% | ❌ | ✅ | $530k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $695k | $11,400 | $7,071 | ❌ -$681 | $1,939 | 0.85x | -$183 | -19.5% | ❌ | ❌ -$1,213 | $475k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $695k | $10,300 | $5,311 | n/a | $179 | 1.30x (lender 1x ✅) | $257 | 6.1% | ❌ | ❌ -$163,415 | $197k (capital) |
| DSCR loan 20% down @ 7.250% | $695k | $10,300 | $5,636 | n/a | $504 | 1.18x (lender 1x ✅) | $175 | 5.0% | ❌ | ❌ -$130,615 | $231k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $695k | $10,300 | $5,394 | n/a | $262 | 1.27x (lender 1.25x ✅) | $236 | 7.1% | ❌ | ❌ -$122,213 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $556k < $1500k minimum; 4 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$521,072 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Parcel unit count vs. advertised doors** (kill if confirmed): MLS unit-count field shows 1 vs. 4 advertised. Check Pinellas PA / CO.
- [ ] **Permit history for 2021–23 gut reno** (reprice if confirmed): Gut renovation by a flipper; confirm permits closed.
- [ ] **FEMA flood zone**: MLS says Zone X.
- [ ] **Insurability / quote** (kill if confirmed): 1927 frame. Roof 2020 (wind-mit credit). Comps $9.2k–$11.4k/yr; needs a bound quote + clean 4-point (electrical, plumbing, HVAC, roof).
- [ ] **Cooling system** (reprice if confirmed): Wall/window units; mini-split conversion is a likely capex item.

- Seller bought 05/2023 at $520k; ask is +34%. Listed 06/29, cut $4k on 09/16; 'motivated seller'.

## Historic Kenwood quad (3 x 1bd + 3bd)
1846 2nd Ave N, St. Petersburg, FL 33713 · ask $750,000 · listed 2026-02-14 · [listing](https://www.homes.com/property/1846-2nd-ave-n-saint-petersburg-fl/5fqym9b67t1pn/)

- ⚠️ 1921 frame construction: needs a bound insurance quote and a clean 4-point inspection.
- ⚠️ MLS unit-count field says 2, listing advertises 4 doors. Verify parcel unit count / CO.
- ℹ️ Current tax $6,855 (0.91% of ask) resets on sale; FL reassesses to just value.

### In-place / MLS gross ($6,225/mo) — $6,225/mo
_Per-unit split not disclosed; Phase 1 assumes owner takes an average door (a 1bd is likely cheaper)._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $750k | $10,300 | $6,902 | ❌ -$2,234 | $3,094 | 0.56x | -$553 | -54.5% | ❌ | ❌ -$707 | $366k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $750k | $6,750 | $6,482 | ❌ -$1,813 | $2,673 | 0.64x | -$448 | -44.1% | ❌ | ✅ | $411k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $750k | $10,300 | $6,663 | ❌ -$1,994 | $2,855 | 0.58x | -$493 | -48.6% | ❌ | ✅ | $381k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $750k | $10,300 | $7,276 | ❌ -$2,607 | $3,468 | 0.52x | -$647 | -63.7% | ❌ | ❌ -$1,829 | $345k ($0 Phase 1 housing cost) |
| Tax 2.0% | $750k | $10,300 | $7,090 | ❌ -$2,421 | $3,281 | 0.52x | -$600 | -59.1% | ❌ | ❌ -$1,270 | $355k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $750k | $11,400 | $6,994 | ❌ -$2,325 | $3,186 | 0.54x | -$576 | -56.7% | ❌ | ❌ -$982 | $355k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $750k | $16,875 | $7,450 | ❌ -$2,782 | $3,642 | 0.45x | -$690 | -68.0% | ❌ | ❌ -$2,351 | $298k ($0 Phase 1 housing cost) |
| Price -5% | $713k | $10,300 | $6,600 | ❌ -$1,931 | $2,792 | 0.60x | -$478 | -49.5% | ❌ | ✅ | $366k ($0 Phase 1 housing cost) |
| Price -10% | $675k | $10,300 | $6,298 | ❌ -$1,629 | $2,490 | 0.64x | -$402 | -44.0% | ❌ | ✅ | $366k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $750k | $11,400 | $7,555 | ❌ -$2,887 | $3,747 | 0.46x | -$717 | -70.6% | ❌ | ❌ -$2,666 | $325k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $750k | $10,300 | $5,663 | n/a | $1,855 | 0.74x (lender 1x ❌) | -$243 | -5.4% | ❌ | ❌ -$181,479 | $197k (capital) |
| DSCR loan 20% down @ 7.250% | $750k | $10,300 | $6,014 | n/a | $2,205 | 0.68x (lender 1x ❌) | -$331 | -8.8% | ❌ | ❌ -$146,083 | $231k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $750k | $10,300 | $5,753 | n/a | $1,944 | 0.72x (lender 1.25x ❌) | -$266 | -7.4% | ❌ | ❌ -$137,017 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $600k < $1500k minimum; 4 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$562,308 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Zoning permits 4 units** (kill if confirmed): Listing says multi-family ≤10 units. Confirm code with City of St. Pete.
- [ ] **Parcel unit count vs. advertised doors** (kill if confirmed): MLS: 4 units total but 'Unit Count: 2', 2 buildings. Check Pinellas PA / CO.
- [ ] **FEMA flood zone**: MLS says Zone X, non-evacuation.
- [ ] **Insurability / quote** (kill if confirmed): 1921 frame, historic district. Comps $9.2k–$11.4k/yr; impact windows help wind-mit; roof age unknown. Needs a bound quote + clean 4-point.
- [ ] **Historic district constraints** (reprice if confirmed): Exterior changes need COA review; affects capex cost and timing.
- [ ] **Seller-reported opex reconciles** (reprice if confirmed): Seller lists $17,255/yr (23% of gross); taxes alone roughly double on sale.

- On market since 02/14/2026 with no price change (~248 days).

## Seminole Heights quad (236 W North St)
236 W North St, Tampa, FL · ask $998,000 · listed 2026-07-21 · [listing](https://www.homes.com/property/236-w-north-st-tampa-fl/krrggr9cxcjb9/?l=fz2w92vx92khd)

- ⚠️ Listing publishes no rents. Get a rent roll + leases; report shows the rent this price would need.
- ⚠️ Zoning SH-RS reads as single-family. Confirm the 4 units are legal (nonconforming/grandfathered) before anything else.
- ⚠️ 1925 frame construction: needs a bound insurance quote and a clean 4-point inspection.
- ℹ️ Current tax $11,096 (1.11% of ask) resets on sale; FL reassesses to just value.

_No rent cases: see the rent-needed table above._

**Gates (all Unverified until independently checked):**

- [ ] **Rent roll / leases / STR income** (kill if confirmed): No rents published for any unit.
- [ ] **Zoning permits 4 units + STR** (kill if confirmed): SH-RS reads as single-family; STR 'subject to local regulations'.
- [ ] **Insurability / quote** (kill if confirmed): 1925 frame, crawlspace.
- [ ] **FEMA flood zone**: MLS says Zone X.

- Header shows 28 beds / 20 baths vs ~7/6 in the unit mix; data error.
- Bought 04/2022 at $880k.

## St. Pete 6-plex (633 7th Ave N)
633 7th Ave N, St. Petersburg, FL · ask $1,000,000 · listed 2026-07-14 · [listing](https://www.homes.com/property/633-7th-ave-n-st-petersburg-fl/x7sx57q7nx70w/)

- 🚩 6 units: outside FHA and residential DSCR (1–4 unit) programs; commercial loans here need $1.5M+ and 20%+ down.
- ⚠️ 1925 frame construction: needs a bound insurance quote and a clean 4-point inspection.
- ℹ️ Current tax $13,383 (1.34% of ask) resets on sale; FL reassesses to just value.

### MLS gross income ($110,460/yr) — $9,205/mo
_Basis not stated; may include garage-bay income._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $1000k | $14,500 | $9,428 | n/a | $3,358 | 0.60x | -$451 | -50.0% | ❌ | ❌ -$23,284 | — (not FHA-eligible (5+ units)) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $1000k | $9,000 | $8,803 | n/a | $2,733 | 0.69x | -$347 | -38.4% | ❌ | ❌ -$21,409 | — (not FHA-eligible (5+ units)) |
| FHA rate 5.99% | $1000k | $14,500 | $9,109 | n/a | $3,039 | 0.63x | -$398 | -44.1% | ❌ | ❌ -$22,326 | — (not FHA-eligible (5+ units)) |
| FHA rate 7.25% | $1000k | $14,500 | $9,926 | n/a | $3,856 | 0.56x | -$534 | -59.2% | ❌ | ❌ -$24,779 | — (not FHA-eligible (5+ units)) |
| Tax 2.0% | $1000k | $14,500 | $9,678 | n/a | $3,608 | 0.57x | -$493 | -54.6% | ❌ | ❌ -$24,034 | — (not FHA-eligible (5+ units)) |
| Insurance high end (or 1.8%) | $1000k | $18,000 | $9,720 | n/a | $3,649 | 0.56x | -$500 | -55.4% | ❌ | ❌ -$24,159 | — (not FHA-eligible (5+ units)) |
| Insurance 2.25% (surplus lines) | $1000k | $22,500 | $10,095 | n/a | $4,024 | 0.50x | -$562 | -62.3% | ❌ | ❌ -$25,284 | — (not FHA-eligible (5+ units)) |
| Price -5% | $950k | $14,500 | $9,017 | n/a | $2,947 | 0.64x | -$383 | -44.6% | ❌ | ❌ -$18,801 | — (not FHA-eligible (5+ units)) |
| Price -10% | $900k | $14,500 | $8,606 | n/a | $2,536 | 0.69x | -$314 | -38.7% | ❌ | ❌ -$14,318 | — (not FHA-eligible (5+ units)) |
| Downside: tax 2.0%, ins high, rate 7.25% | $1000k | $18,000 | $10,468 | n/a | $4,398 | 0.49x | -$625 | -69.2% | ❌ | ❌ -$26,404 | — (not FHA-eligible (5+ units)) |
| DSCR loan 25% down @ 7.000% | $1000k | $14,500 | $7,615 | n/a | $1,545 | 0.82x (lender 1x ❌) | -$149 | -3.7% | ❌ | ❌ -$265,689 | ineligible |
| DSCR loan 20% down @ 7.250% | $1000k | $14,500 | $8,082 | n/a | $2,012 | 0.75x (lender 1x ❌) | -$227 | -6.8% | ❌ | ❌ -$218,494 | ineligible |
| Commercial SB 20% @ 6.60% (eligibility check) | $1000k | $14,500 | $7,734 | n/a | $1,664 | 0.80x (lender 1.25x ❌) | -$169 | -5.3% | ❌ | ❌ -$206,406 | ineligible |

- 🚩 Base (tax 1.7%, insurance estimate mid / 1.45%): 6 units is outside FHA 1–4 unit lending.
- 🚩 v0 placeholders (tax 1.5%, ins 0.9%): 6 units is outside FHA 1–4 unit lending.
- 🚩 FHA rate 5.99%: 6 units is outside FHA 1–4 unit lending.
- 🚩 FHA rate 7.25%: 6 units is outside FHA 1–4 unit lending.
- 🚩 Tax 2.0%: 6 units is outside FHA 1–4 unit lending.
- 🚩 Insurance high end (or 1.8%): 6 units is outside FHA 1–4 unit lending.
- 🚩 Insurance 2.25% (surplus lines): 6 units is outside FHA 1–4 unit lending.
- 🚩 Price -5%: 6 units is outside FHA 1–4 unit lending.
- 🚩 Price -10%: 6 units is outside FHA 1–4 unit lending.
- 🚩 Downside: tax 2.0%, ins high, rate 7.25%: 6 units is outside FHA 1–4 unit lending.
- 🚩 DSCR loan 25% down @ 7.000%: Not eligible for DSCR investor loan, 25% down @ 7.000% (740+ FICO): 6 units > 4-unit maximum.
- 🚩 DSCR loan 20% down @ 7.250%: Not eligible for DSCR investor loan, 20% down @ 7.250% (740+ FICO): 6 units > 4-unit maximum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $800k < $1500k minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$749,744 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Financeable with Kyle's capital** (kill if confirmed): 6 units: no FHA, no residential DSCR; commercial needs $1.5M+ loans and 20%+ down.
- [ ] **Tax figure** (reprice if confirmed): Listing estimate $13,383 vs $6,957 paid in 2026; assessed $685,988.
- [ ] **Insurability / quote** (kill if confirmed): 1925 frame.

- Professional management in place and willing to continue.

## St. Pete quad (725 14th Ave S)
725 14th Ave S, St. Petersburg, FL · ask $700,000 · listed 2026-07-02 · [listing](https://www.homes.com/property/725-14th-ave-s-saint-petersburg-fl/zgev5tvqx7pzm/)

- ⚠️ 1924 frame construction: needs a bound insurance quote and a clean 4-point inspection.
- ⚠️ MLS unit-count field says 1, listing advertises 4 doors. Verify parcel unit count / CO.
- ℹ️ Current tax $8,624 (1.23% of ask) resets on sale; FL reassesses to just value.

### MLS gross income ($71,760/yr) — $5,980/mo
_Basis not stated; one unit vacant, so likely includes the vacant door at an assumed rent. No per-unit rents._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $700k | $10,150 | $6,487 | ❌ -$2,002 | $2,975 | 0.54x | -$532 | -56.1% | ❌ | ✅ | $331k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $700k | $6,300 | $6,049 | ❌ -$1,564 | $2,537 | 0.64x | -$423 | -44.6% | ❌ | ✅ | $379k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $700k | $10,150 | $6,264 | ❌ -$1,779 | $2,751 | 0.57x | -$476 | -50.2% | ❌ | ✅ | $345k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $700k | $10,150 | $6,836 | ❌ -$2,351 | $3,324 | 0.50x | -$619 | -65.3% | ❌ | ❌ -$508 | $312k ($0 Phase 1 housing cost) |
| Tax 2.0% | $700k | $10,150 | $6,662 | ❌ -$2,177 | $3,150 | 0.50x | -$576 | -60.8% | ❌ | ✅ | $321k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $700k | $12,600 | $6,691 | ❌ -$2,206 | $3,179 | 0.50x | -$583 | -61.5% | ❌ | ❌ -$73 | $306k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $700k | $15,750 | $6,954 | ❌ -$2,469 | $3,441 | 0.44x | -$649 | -68.4% | ❌ | ❌ -$861 | $273k ($0 Phase 1 housing cost) |
| Price -5% | $665k | $10,150 | $6,205 | ❌ -$1,720 | $2,693 | 0.58x | -$462 | -51.3% | ❌ | ✅ | $331k ($0 Phase 1 housing cost) |
| Price -10% | $630k | $10,150 | $5,923 | ❌ -$1,438 | $2,411 | 0.63x | -$391 | -45.8% | ❌ | ✅ | $331k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $700k | $12,600 | $7,215 | ❌ -$2,730 | $3,703 | 0.43x | -$714 | -75.3% | ❌ | ❌ -$1,645 | $280k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $700k | $10,150 | $5,330 | n/a | $1,818 | 0.72x (lender 1x ❌) | -$243 | -5.7% | ❌ | ❌ -$164,982 | $198k (capital) |
| DSCR loan 20% down @ 7.250% | $700k | $10,150 | $5,658 | n/a | $2,145 | 0.66x (lender 1x ❌) | -$325 | -9.3% | ❌ | ❌ -$131,946 | $231k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $700k | $10,150 | $5,414 | n/a | $1,902 | 0.70x (lender 1.25x ❌) | -$264 | -7.9% | ❌ | ❌ -$123,484 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $560k < $1500k minimum; 4 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$524,820 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Parcel unit count vs. advertised doors** (kill if confirmed): MLS unit-count field shows 1 vs. 4 advertised; zoning not listed.
- [ ] **Rent roll / leases** (reprice if confirmed): Only an MLS gross figure; no leases.
- [ ] **Insurability / quote** (kill if confirmed): 1924 frame. No quote.
- [ ] **FEMA flood zone**: MLS says Zone X.

- Four price cuts since 07/02: $799k → $700k.
- Open 2021 VA loan ($398,725 original). VA loans are assumable with lender approval, likely at a ~3% rate; the equity gap (~$300k+) is far beyond current capital. Worth knowing for M2's assumable-loan comparison.

## St. Pete duplex (935 17th Ave S)
935 17th Ave S, St. Petersburg, FL 33705 · ask $539,990 · listed 2026-09-02 · [listing](https://www.redfin.com/FL/St-Petersburg/935-17th-Ave-S-33705/home/48126357)

- ⚠️ Zoning NT-2 reads as single-family. Confirm the 2 units are legal (nonconforming/grandfathered) before anything else.
- ℹ️ FEMA flood zone not on the listing; check the FEMA map.
- ℹ️ Current tax $5,378 (1.00% of ask) resets on sale; FL reassesses to just value.

### Asking rent from Sept listing ($2,600/unit) — $5,200/mo
_Both units vacant; no signed leases. RV pad ($650/mo claimed) excluded._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $540k | $7,830 | $5,004 | n/a | $2,944 | 0.69x | -$552 | -37.7% | ❌ | ✅ | $175k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $540k | $4,860 | $4,667 | n/a | $2,607 | 0.79x | -$383 | -26.2% | ❌ | ✅ | $210k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $540k | $7,830 | $4,832 | n/a | $2,772 | 0.73x | -$465 | -31.8% | ❌ | ✅ | $182k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $540k | $7,830 | $5,273 | n/a | $3,213 | 0.64x | -$686 | -46.9% | ❌ | ✅ | $164k ($0 Phase 1 housing cost) |
| Tax 2.0% | $540k | $7,830 | $5,139 | n/a | $3,079 | 0.65x | -$619 | -42.3% | ❌ | ✅ | $169k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $540k | $9,720 | $5,162 | n/a | $3,102 | 0.65x | -$630 | -43.1% | ❌ | ✅ | $155k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $540k | $12,150 | $5,364 | n/a | $3,304 | 0.59x | -$732 | -50.0% | ❌ | ✅ | $130k ($0 Phase 1 housing cost) |
| Price -5% | $513k | $7,830 | $4,787 | n/a | $2,727 | 0.74x | -$443 | -31.9% | ❌ | ✅ | $175k ($0 Phase 1 housing cost) |
| Price -10% | $486k | $7,830 | $4,569 | n/a | $2,509 | 0.79x | -$334 | -25.4% | ❌ | ✅ | $175k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $540k | $9,720 | $5,566 | n/a | $3,506 | 0.57x | -$832 | -56.9% | ❌ | ✅ | $142k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $540k | $7,830 | $4,112 | n/a | $2,052 | 0.92x (lender 1x ❌) | -$106 | -1.6% | ❌ | ❌ -$111,268 | $201k (capital) |
| DSCR loan 20% down @ 7.250% | $540k | $7,830 | $4,364 | n/a | $2,304 | 0.84x (lender 1x ❌) | -$232 | -4.3% | ❌ | ❌ -$85,784 | $205k ($0 Phase 1 housing cost) |
| Commercial SB 20% @ 6.60% (eligibility check) | $540k | $7,830 | $4,176 | n/a | $2,116 | 0.90x (lender 1.25x ❌) | -$138 | -2.7% | ❌ | ❌ -$79,256 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $432k < $1500k minimum; 2 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$404,854 due in year 5; refinance risk.

### Seller's HUD FMR ($3,195/unit) — $6,390/mo
_FMR is a voucher payment standard, not a lease comp._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $540k | $7,830 | $5,004 | n/a | $2,438 | 0.95x | -$88 | -6.0% | ❌ | ✅ | $237k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $540k | $4,860 | $4,667 | n/a | $2,101 | 1.04x | $81 | 5.5% | ❌ | ✅ | $274k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $540k | $7,830 | $4,832 | n/a | $2,266 | 1.00x | -$2 | -0.1% | ❌ | ✅ | $247k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $540k | $7,830 | $5,273 | n/a | $2,708 | 0.88x | -$223 | -15.2% | ❌ | ✅ | $224k ($0 Phase 1 housing cost) |
| Tax 2.0% | $540k | $7,830 | $5,139 | n/a | $2,573 | 0.91x | -$156 | -10.6% | ❌ | ✅ | $230k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $540k | $9,720 | $5,162 | n/a | $2,596 | 0.91x | -$167 | -11.4% | ❌ | ✅ | $218k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $540k | $12,150 | $5,364 | n/a | $2,798 | 0.85x | -$268 | -18.3% | ❌ | ✅ | $193k ($0 Phase 1 housing cost) |
| Price -5% | $513k | $7,830 | $4,787 | n/a | $2,221 | 1.01x | $21 | 1.5% | ❌ | ✅ | $237k ($0 Phase 1 housing cost) |
| Price -10% | $486k | $7,830 | $4,569 | n/a | $2,003 | 1.08x | $129 | 9.8% | ❌ | ✅ | $237k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $540k | $9,720 | $5,566 | n/a | $3,000 | 0.81x | -$369 | -25.2% | ❌ | ✅ | $199k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $540k | $7,830 | $4,112 | n/a | $1,546 | 1.27x (lender 1x ✅) | $358 | 5.5% | ❌ | ❌ -$111,268 | $201k (capital) |
| DSCR loan 20% down @ 7.250% | $540k | $7,830 | $4,364 | n/a | $1,799 | 1.16x (lender 1x ✅) | $232 | 4.3% | ❌ | ❌ -$85,784 | $235k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $540k | $7,830 | $4,176 | n/a | $1,611 | 1.24x (lender 1.25x ❌) | $326 | 6.3% | ❌ | ❌ -$79,256 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $432k < $1500k minimum; 2 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$404,854 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Zoning permits 2 units** (kill if confirmed): NT-2 reads as single-family per Redfin. Confirm duplex is legal nonconforming.
- [ ] **Rents achievable** (reprice if confirmed): Fully vacant; rents are asks, not leases.
- [ ] **Construction type / insurability** (reprice if confirmed): Not stated. Wall units; 2006 roof permit.
- [ ] **FEMA flood zone**: Not on listing; First Street 1/10.

- Flip: bought 03/26/2026 for $265k, relisted at $539,990 (+104%) after a fall-through in Aug.
- Seller claims '10%++ cap rate' on FMR rents.

## Clearwater triplex (15501 61st St N)
15501 61st St N, Clearwater, FL 33760 · ask $649,990 · listed 2026-08-13 · [listing](https://www.redfin.com/FL/Clearwater/15501-61st-St-N-33760/home/194440611)

- ⚠️ First Street Flood Factor 6/10 and no FEMA zone on the listing: check FEMA map and flood-insurance cost.
- ⚠️ "In-place + RV pad at $900 ($6,000)" is 18% above in-place rent. Underwrite to in-place.
- ⚠️ "Seller pro forma ($7,050)" is 38% above in-place rent. Underwrite to in-place.

### In-place at close + vacant at last rent ($5,100) — $5,100/mo
_$3,400 contracted at closing (incl. seller leaseback) + vacant unit at its last rent._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $650k | $9,425 | $6,023 | ❌ -$2,198 | $3,133 | 0.53x | -$684 | -58.2% | ❌ | ✅ | $261k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $650k | $5,850 | $5,617 | ❌ -$1,792 | $2,727 | 0.62x | -$548 | -46.7% | ❌ | ✅ | $304k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $650k | $9,425 | $5,816 | ❌ -$1,991 | $2,926 | 0.55x | -$614 | -52.4% | ❌ | ✅ | $272k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $650k | $9,425 | $6,347 | ❌ -$2,522 | $3,457 | 0.49x | -$792 | -67.4% | ❌ | ✅ | $246k ($0 Phase 1 housing cost) |
| Tax 2.0% | $650k | $9,425 | $6,186 | ❌ -$2,361 | $3,296 | 0.49x | -$738 | -62.9% | ❌ | ✅ | $253k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $650k | $11,700 | $6,213 | ❌ -$2,388 | $3,323 | 0.48x | -$747 | -63.6% | ❌ | ✅ | $238k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $650k | $14,625 | $6,457 | ❌ -$2,632 | $3,567 | 0.42x | -$828 | -70.5% | ❌ | ✅ | $207k ($0 Phase 1 housing cost) |
| Price -5% | $617k | $9,425 | $5,762 | ❌ -$1,937 | $2,872 | 0.56x | -$596 | -53.5% | ❌ | ✅ | $261k ($0 Phase 1 housing cost) |
| Price -10% | $585k | $9,425 | $5,500 | ❌ -$1,675 | $2,610 | 0.61x | -$509 | -48.2% | ❌ | ✅ | $261k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $650k | $11,700 | $6,700 | ❌ -$2,875 | $3,810 | 0.41x | -$909 | -77.4% | ❌ | ❌ -$99 | $217k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $650k | $9,425 | $4,950 | n/a | $2,060 | 0.70x (lender 1x ❌) | -$326 | -6.2% | ❌ | ❌ -$148,194 | $199k (capital) |
| DSCR loan 20% down @ 7.250% | $650k | $9,425 | $5,253 | n/a | $2,363 | 0.64x (lender 1x ❌) | -$427 | -9.9% | ❌ | ❌ -$117,519 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | $2,137 | 0.68x (lender 1.25x ❌) | -$351 | -8.5% | ❌ | ❌ -$109,661 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $520k < $1500k minimum; 3 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$487,326 due in year 5; refinance risk.

### In-place + RV pad at $900 ($6,000) — $6,000/mo
_RV pad needs power/water hookups first._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $650k | $9,425 | $6,023 | ❌ -$1,523 | $2,368 | 0.69x | -$450 | -38.3% | ❌ | ✅ | $356k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $650k | $5,850 | $5,617 | ❌ -$1,117 | $1,962 | 0.78x | -$314 | -26.8% | ❌ | ✅ | $401k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $650k | $9,425 | $5,816 | ❌ -$1,316 | $2,161 | 0.72x | -$381 | -32.4% | ❌ | ✅ | $371k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $650k | $9,425 | $6,347 | ❌ -$1,847 | $2,692 | 0.64x | -$558 | -47.5% | ❌ | ✅ | $335k ($0 Phase 1 housing cost) |
| Tax 2.0% | $650k | $9,425 | $6,186 | ❌ -$1,686 | $2,531 | 0.65x | -$504 | -42.9% | ❌ | ✅ | $345k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $650k | $11,700 | $6,213 | ❌ -$1,713 | $2,558 | 0.64x | -$513 | -43.7% | ❌ | ✅ | $333k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $650k | $14,625 | $6,457 | ❌ -$1,957 | $2,802 | 0.59x | -$594 | -50.6% | ❌ | ✅ | $302k ($0 Phase 1 housing cost) |
| Price -5% | $617k | $9,425 | $5,762 | ❌ -$1,262 | $2,107 | 0.73x | -$363 | -32.5% | ❌ | ✅ | $356k ($0 Phase 1 housing cost) |
| Price -10% | $585k | $9,425 | $5,500 | ❌ -$1,000 | $1,845 | 0.79x | -$275 | -26.1% | ❌ | ✅ | $356k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $650k | $11,700 | $6,700 | ❌ -$2,200 | $3,045 | 0.56x | -$675 | -57.5% | ❌ | ❌ -$99 | $304k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $650k | $9,425 | $4,950 | n/a | $1,295 | 0.92x (lender 1x ❌) | -$92 | -1.8% | ❌ | ❌ -$148,194 | $199k (capital) |
| DSCR loan 20% down @ 7.250% | $650k | $9,425 | $5,253 | n/a | $1,598 | 0.84x (lender 1x ❌) | -$193 | -4.5% | ❌ | ❌ -$117,519 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | $1,372 | 0.89x (lender 1.25x ❌) | -$118 | -2.8% | ❌ | ❌ -$109,661 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $520k < $1500k minimum; 3 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$487,326 due in year 5; refinance risk.

### Seller pro forma ($7,050) — $7,050/mo
_Seller's fully-leased figure ('8.8% cap'); unit-level rents not given._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $650k | $9,425 | $6,023 | ❌ -$736 | $2,028 | 0.88x | -$177 | -15.1% | ❌ | ✅ | $398k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $650k | $5,850 | $5,617 | ❌ -$330 | $1,622 | 0.97x | -$42 | -3.6% | ❌ | ✅ | $444k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $650k | $9,425 | $5,816 | ❌ -$529 | $1,821 | 0.92x | -$108 | -9.2% | ❌ | ✅ | $415k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $650k | $9,425 | $6,347 | ❌ -$1,060 | $2,352 | 0.82x | -$285 | -24.3% | ❌ | ✅ | $375k ($0 Phase 1 housing cost) |
| Tax 2.0% | $650k | $9,425 | $6,186 | ❌ -$898 | $2,191 | 0.84x | -$231 | -19.7% | ❌ | ✅ | $386k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $650k | $11,700 | $6,213 | ❌ -$926 | $2,218 | 0.83x | -$240 | -20.5% | ❌ | ✅ | $375k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $650k | $14,625 | $6,457 | ❌ -$1,169 | $2,462 | 0.78x | -$322 | -27.4% | ❌ | ✅ | $345k ($0 Phase 1 housing cost) |
| Price -5% | $617k | $9,425 | $5,762 | ❌ -$474 | $1,767 | 0.93x | -$90 | -8.1% | ❌ | ✅ | $398k ($0 Phase 1 housing cost) |
| Price -10% | $585k | $9,425 | $5,500 | ❌ -$212 | $1,505 | 1.00x | -$3 | -0.2% | ❌ | ✅ | $398k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $650k | $11,700 | $6,700 | ❌ -$1,412 | $2,705 | 0.74x | -$403 | -34.3% | ❌ | ❌ -$99 | $343k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $650k | $9,425 | $4,950 | n/a | $955 | 1.17x (lender 1x ✅) | $181 | 3.5% | ❌ | ❌ -$148,194 | $199k (capital) |
| DSCR loan 20% down @ 7.250% | $650k | $9,425 | $5,253 | n/a | $1,258 | 1.07x (lender 1x ✅) | $79 | 1.8% | ❌ | ❌ -$117,519 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | $1,032 | 1.14x (lender 1.25x ❌) | $155 | 3.7% | ❌ | ❌ -$109,661 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $520k < $1500k minimum; 3 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$487,326 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Flood risk / FEMA zone** (reprice if confirmed): First Street Flood Factor 6/10 (68–76% chance of flooding in 30 yrs); FEMA zone not stated. Flood insurance not in model.
- [ ] **Unit mix / bedroom count** (reprice if confirmed): Description: 2BR+bonus and two 2BR/1BA; public facts: one 3BR + two 2BR.
- [ ] **Seller leaseback terms** (reprice if confirmed): $1,550/mo for 12 months, below the $1,700 last rent.
- [ ] **RV pad income** (reprice if confirmed): Projected only; hookups not built.

- Cut from $699,990 to $649,990 since 08/13. Unincorporated Pinellas; STR permitted per listing.

## Clearwater quad (208–212 Elizabeth Ave)
208-212 Elizabeth Ave, Clearwater, FL 33759 · ask $879,000 · listed 2026-01-07 · [listing](https://www.redfin.com/FL/Clearwater/208-Elizabeth-Ave-33759/unit-A/home/48038809)

- ⚠️ Listing publishes no rents. Get a rent roll + leases; report shows the rent this price would need.
- ℹ️ FEMA flood zone not on the listing; check the FEMA map.
- ℹ️ Current tax $8,920 (1.01% of ask) resets on sale; FL reassesses to just value.

_No rent cases: see the rent-needed table above._

**Gates (all Unverified until independently checked):**

- [ ] **Rent roll / leases** (kill if confirmed): No rents published.
- [ ] **Parcel structure** (reprice if confirmed): Three addresses; public record lists 2–4 unit MF with 3 baths vs 6 advertised.
- [ ] **FEMA flood zone**: Not on listing; First Street 1/10.

- On market since 01/07/2026; cut $990k → $879k.
- Recorded 2020 sale of $233,500 looks partial (one parcel?) — verify.

## Ybor new-build duplex (2613 E 23rd Ave)
2613 E 23rd Ave Unit 1/2, Tampa, FL 33605 · ask $779,900 · listed 2026-06-18 · [listing](https://www.homes.com/property/2613-e-23rd-ave-tampa-fl-unit-1-2/fl5yv4dt8ncn0/?l=bscnb57pfy67c)

- ℹ️ Current tax $12,363 (1.59% of ask) resets on sale; FL reassesses to just value.

### Seller: $2,600+/unit ($5,200) — $5,200/mo
_MLS 'Total Actual Rent' field shows $2,600 — unclear if one unit leased or per unit._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $780k | $11,309 | $7,353 | n/a | $5,293 | 0.35x | -$1,726 | -81.7% | ❌ | ✅ | $139k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $780k | $7,019 | $6,865 | n/a | $4,805 | 0.44x | -$1,482 | -70.2% | ❌ | ✅ | $187k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $780k | $11,309 | $7,104 | n/a | $5,044 | 0.37x | -$1,602 | -75.8% | ❌ | ✅ | $144k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $780k | $11,309 | $7,742 | n/a | $5,682 | 0.33x | -$1,920 | -90.9% | ❌ | ✅ | $131k ($0 Phase 1 housing cost) |
| Tax 2.0% | $780k | $11,309 | $7,548 | n/a | $5,488 | 0.31x | -$1,823 | -86.3% | ❌ | ✅ | $135k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $780k | $14,038 | $7,580 | n/a | $5,520 | 0.31x | -$1,840 | -87.1% | ❌ | ✅ | $110k ($0 Phase 1 housing cost) |
| Insurance 2.25% (surplus lines) | $780k | $17,548 | $7,873 | n/a | $5,813 | 0.25x | -$1,986 | -94.0% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Price -5% | $741k | $11,309 | $6,913 | n/a | $4,853 | 0.39x | -$1,506 | -75.1% | ❌ | ✅ | $139k ($0 Phase 1 housing cost) |
| Price -10% | $702k | $11,309 | $6,599 | n/a | $4,539 | 0.42x | -$1,349 | -71.0% | ❌ | ✅ | $139k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $780k | $14,038 | $8,164 | n/a | $6,104 | 0.25x | -$2,132 | -100.9% | ❌ | ✅ | $101k ($0 Phase 1 housing cost) |
| DSCR loan 25% down @ 7.000% | $780k | $11,309 | $5,939 | n/a | $3,879 | 0.48x (lender 1x ❌) | -$1,019 | -10.8% | ❌ | ❌ -$191,804 | $174k ($0 Phase 1 housing cost) |
| DSCR loan 20% down @ 7.250% | $780k | $11,309 | $6,303 | n/a | $4,243 | 0.44x (lender 1x ❌) | -$1,201 | -15.4% | ❌ | ❌ -$154,997 | $163k ($0 Phase 1 housing cost) |
| Commercial SB 20% @ 6.60% (eligibility check) | $780k | $11,309 | $6,032 | n/a | $3,972 | 0.47x (lender 1.25x ❌) | -$1,066 | -14.3% | ❌ | ❌ -$145,569 | ineligible |

- 🚩 Base (tax 1.7%, insurance estimate mid / 1.45%): FHA base loan $753k exceeds the 2-unit limit $693k.
- 🚩 v0 placeholders (tax 1.5%, ins 0.9%): FHA base loan $753k exceeds the 2-unit limit $693k.
- 🚩 FHA rate 5.99%: FHA base loan $753k exceeds the 2-unit limit $693k.
- 🚩 FHA rate 7.25%: FHA base loan $753k exceeds the 2-unit limit $693k.
- 🚩 Tax 2.0%: FHA base loan $753k exceeds the 2-unit limit $693k.
- 🚩 Insurance high end (or 1.8%): FHA base loan $753k exceeds the 2-unit limit $693k.
- 🚩 Insurance 2.25% (surplus lines): FHA base loan $753k exceeds the 2-unit limit $693k.
- 🚩 Price -5%: FHA base loan $715k exceeds the 2-unit limit $693k.
- 🚩 Downside: tax 2.0%, ins high, rate 7.25%: FHA base loan $753k exceeds the 2-unit limit $693k.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $624k < $1500k minimum; 2 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$584,725 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Leases** (reprice if confirmed): No leases; seller says each unit can get $2,600+.
- [ ] **FEMA flood zone**: MLS says Zone X.

- Cleanest physical asset of the batch (2023 block, impact glass, RM-16).
- Owner bought 05/2024 at $760k; ask $779,900 after four cuts from $824,900.

## Tampa duplex (7711 Amherst St)
7711 Amherst St, Tampa, FL 33625 · ask $530,000 · listed 2026-06-04 · [listing](https://www.homes.com/property/7711-amherst-st-tampa-fl/wtb20z4ldlgs2/)

- ℹ️ Current tax $6,879 (1.30% of ask) resets on sale; FL reassesses to just value.

### In-place ($3,525/mo) — $3,525/mo
_Per-unit split not given; 12-month gross leases._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $530k | $7,685 | $4,912 | n/a | $3,413 | 0.38x | -$1,083 | -75.4% | ❌ | ✅ | $106k ($0 Phase 1 housing cost) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $530k | $4,770 | $4,580 | n/a | $3,082 | 0.48x | -$917 | -63.9% | ❌ | ✅ | $139k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $530k | $7,685 | $4,742 | n/a | $3,244 | 0.40x | -$998 | -69.5% | ❌ | ✅ | $111k ($0 Phase 1 housing cost) |
| FHA rate 7.25% | $530k | $7,685 | $5,176 | n/a | $3,678 | 0.36x | -$1,215 | -84.6% | ❌ | ✅ | $100k ($0 Phase 1 housing cost) |
| Tax 2.0% | $530k | $7,685 | $5,044 | n/a | $3,546 | 0.35x | -$1,149 | -80.0% | ❌ | ✅ | $103k ($0 Phase 1 housing cost) |
| Insurance high end (or 1.8%) | $530k | $9,540 | $5,066 | n/a | $3,568 | 0.34x | -$1,160 | -80.8% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Insurance 2.25% (surplus lines) | $530k | $11,925 | $5,265 | n/a | $3,767 | 0.28x | -$1,259 | -87.7% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Price -5% | $504k | $7,685 | $4,698 | n/a | $3,200 | 0.42x | -$976 | -71.6% | ❌ | ✅ | $106k ($0 Phase 1 housing cost) |
| Price -10% | $477k | $7,685 | $4,484 | n/a | $2,986 | 0.45x | -$869 | -67.3% | ❌ | ✅ | $106k ($0 Phase 1 housing cost) |
| Downside: tax 2.0%, ins high, rate 7.25% | $530k | $9,540 | $5,463 | n/a | $3,965 | 0.28x | -$1,358 | -94.6% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| DSCR loan 25% down @ 7.000% | $530k | $7,685 | $4,036 | n/a | $2,538 | 0.51x (lender 1x ❌) | -$645 | -10.1% | ❌ | ❌ -$107,915 | $134k ($0 Phase 1 housing cost) |
| DSCR loan 20% down @ 7.250% | $530k | $7,685 | $4,284 | n/a | $2,786 | 0.47x (lender 1x ❌) | -$769 | -14.5% | ❌ | ❌ -$82,902 | $125k ($0 Phase 1 housing cost) |
| Commercial SB 20% @ 6.60% (eligibility check) | $530k | $7,685 | $4,099 | n/a | $2,601 | 0.50x (lender 1.25x ❌) | -$677 | -13.3% | ❌ | ❌ -$76,495 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $424k < $1500k minimum; 2 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$397,364 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Septic + well condition** (reprice if confirmed): Private well and septic serving 2 units; needs inspection + water test.
- [ ] **Zoning code** (kill if confirmed): CPV-I-1 — confirm duplex use is permitted.
- [ ] **FEMA flood zone**: MLS says Zone X.

- Five cuts since 06/04: $625k → $530k. Seller bought 08/2023 at $405k.

## Tampa duplex (9502 Banyan Ave)
9502 Banyan Ave, Tampa, FL · ask $480,000 · listed 2026-09-17 · [listing](https://www.homes.com/property/9502-banyan-ave-tampa-fl-unit-a/968vdvgfy3l9l/)

- ⚠️ Zoning RS-50 reads as single-family. Confirm the 2 units are legal (nonconforming/grandfathered) before anything else.
- ⚠️ MLS unit-count field says 1, listing advertises 2 doors. Verify parcel unit count / CO.
- ℹ️ Current tax $4,670 (0.97% of ask) resets on sale; FL reassesses to just value.

### In-place ($3,180/mo) — $3,180/mo
_Fully leased; 12-month gross leases._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $480k | $6,960 | $4,448 | n/a | $3,247 | 0.33x | -$1,060 | -81.6% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $480k | $4,320 | $4,148 | n/a | $2,947 | 0.43x | -$910 | -70.0% | ❌ | ✅ | $107k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $480k | $6,960 | $4,295 | n/a | $3,093 | 0.35x | -$984 | -75.7% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| FHA rate 7.25% | $480k | $6,960 | $4,687 | n/a | $3,486 | 0.31x | -$1,180 | -90.8% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Tax 2.0% | $480k | $6,960 | $4,568 | n/a | $3,367 | 0.30x | -$1,120 | -86.2% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Insurance high end (or 1.8%) | $480k | $8,640 | $4,588 | n/a | $3,387 | 0.29x | -$1,130 | -87.0% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Insurance 2.25% (surplus lines) | $480k | $10,800 | $4,768 | n/a | $3,567 | 0.23x | -$1,220 | -93.9% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Price -5% | $456k | $6,960 | $4,255 | n/a | $3,053 | 0.36x | -$964 | -78.0% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Price -10% | $432k | $6,960 | $4,061 | n/a | $2,860 | 0.40x | -$867 | -74.1% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Downside: tax 2.0%, ins high, rate 7.25% | $480k | $8,640 | $4,947 | n/a | $3,746 | 0.24x | -$1,310 | -100.8% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| DSCR loan 25% down @ 7.000% | $480k | $6,960 | $3,655 | n/a | $2,454 | 0.45x (lender 1x ❌) | -$664 | -11.4% | ❌ | ❌ -$91,131 | — ($0 Phase 1 housing cost (fails at every price tested)) |
| DSCR loan 20% down @ 7.250% | $480k | $6,960 | $3,880 | n/a | $2,678 | 0.41x (lender 1x ❌) | -$776 | -16.2% | ❌ | ❌ -$68,477 | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Commercial SB 20% @ 6.60% (eligibility check) | $480k | $6,960 | $3,712 | n/a | $2,511 | 0.44x (lender 1.25x ❌) | -$693 | -15.1% | ❌ | ❌ -$62,675 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $384k < $1500k minimum; 2 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$359,877 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Zoning permits 2 units** (kill if confirmed): RS-50 reads as single-family.
- [ ] **Owner-occupancy path** (reprice if confirmed): Sold with tenants in place; FHA needs a unit Kyle can move into within 60 days.
- [ ] **FEMA flood zone**: MLS says Zone X.

- No seller financing. Relisted 09/17 at $480k (was $540k). Opportunity Zone per listing.

## Sulphur Springs duplex (7902 N 14th St)
7902 N 14th St, Tampa, FL 33604 · ask $480,000 · listed 2026-09-17 · [listing](https://www.homes.com/property/7902-n-14th-st-tampa-fl/zf2rvkdz5j9py/)

- ⚠️ Zoning RS-50 reads as single-family. Confirm the 2 units are legal (nonconforming/grandfathered) before anything else.
- ℹ️ Current tax $4,457 (0.93% of ask) resets on sale; FL reassesses to just value.

### In-place ($3,180/mo) — $3,180/mo
_Fully tenanted; rented at $1,050 in 2019._

| Scenario | Price | Ins/yr | PITIA | FHA SS | P1 housing cost | P2 DSCR | CF/door | CoC | P2 hurdles | Capital | Max offer (binding) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Base (tax 1.7%, insurance estimate mid / 1.45%) | $480k | $6,960 | $4,448 | n/a | $3,247 | 0.33x | -$1,060 | -81.6% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| v0 placeholders (tax 1.5%, ins 0.9%) | $480k | $4,320 | $4,148 | n/a | $2,947 | 0.43x | -$910 | -70.0% | ❌ | ✅ | $107k ($0 Phase 1 housing cost) |
| FHA rate 5.99% | $480k | $6,960 | $4,295 | n/a | $3,093 | 0.35x | -$984 | -75.7% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| FHA rate 7.25% | $480k | $6,960 | $4,687 | n/a | $3,486 | 0.31x | -$1,180 | -90.8% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Tax 2.0% | $480k | $6,960 | $4,568 | n/a | $3,367 | 0.30x | -$1,120 | -86.2% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Insurance high end (or 1.8%) | $480k | $8,640 | $4,588 | n/a | $3,387 | 0.29x | -$1,130 | -87.0% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Insurance 2.25% (surplus lines) | $480k | $10,800 | $4,768 | n/a | $3,567 | 0.23x | -$1,220 | -93.9% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Price -5% | $456k | $6,960 | $4,255 | n/a | $3,053 | 0.36x | -$964 | -78.0% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Price -10% | $432k | $6,960 | $4,061 | n/a | $2,860 | 0.40x | -$867 | -74.1% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Downside: tax 2.0%, ins high, rate 7.25% | $480k | $8,640 | $4,947 | n/a | $3,746 | 0.24x | -$1,310 | -100.8% | ❌ | ✅ | — ($0 Phase 1 housing cost (fails at every price tested)) |
| DSCR loan 25% down @ 7.000% | $480k | $6,960 | $3,655 | n/a | $2,454 | 0.45x (lender 1x ❌) | -$664 | -11.4% | ❌ | ❌ -$91,131 | — ($0 Phase 1 housing cost (fails at every price tested)) |
| DSCR loan 20% down @ 7.250% | $480k | $6,960 | $3,880 | n/a | $2,678 | 0.41x (lender 1x ❌) | -$776 | -16.2% | ❌ | ❌ -$68,477 | — ($0 Phase 1 housing cost (fails at every price tested)) |
| Commercial SB 20% @ 6.60% (eligibility check) | $480k | $6,960 | $3,712 | n/a | $2,511 | 0.44x (lender 1.25x ❌) | -$693 | -15.1% | ❌ | ❌ -$62,675 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed) @ 6.600% (740+ FICO): loan $384k < $1500k minimum; 2 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$359,877 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Zoning permits 2 units** (kill if confirmed): RS-50 reads as single-family.
- [ ] **Owner-occupancy path** (reprice if confirmed): Tenants in place from closing; FHA needs a unit Kyle can occupy.
- [ ] **FEMA flood zone**: MLS says Zone X.

- No seller financing. Relisted 09/17 at $480k (was $525k).

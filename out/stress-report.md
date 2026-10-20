# Stress test: 3 paper deals
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
| loanProducts.dscr-25 | researched | [link](https://dscrauthority.com/rates/) DSCR Authority rate grid 2026-10-19: 720–739 FICO, 75% LTV, DSCR 1.00–1.24 = 7.00%, ~1 pt; 2–4 units +0–0.25% → 7.125%. HomeAbroad 2026-10-06: 75% LTV par 6.75% + 0.30% for DSCR 1.00–1.25. Kyle's FICO not yet confirmed. |
| loanProducts.dscr-20 | researched | [link](https://dscrauthority.com/rates/) DSCR Authority 2026-10-19: 720–739 FICO, 80% LTV = 7.25%; +0.125% for 2–4 units. |
| loanProducts.commercial-sb | researched | [link](https://selectcommercial.com/commercial-mortgage-rates.php) Select Commercial indicative rates 2026-10-20: Apartment/Freddie SBL 6.60% 5-yr, 80% LTV purchase, 1.25x DSCR at 75–80% LTV, 30-yr amort. $1.5M minimum loan ('no exceptions'); 5+ unit programs. Reference only: not eligible for 2–4 unit deals of this size. |
| screen | researched | Derived from this record's own defaults (FHA, Phase 2 DSCR 1.0x). Replaces fixed 7.5x after the 2026-10-20 stress test. |

## Verdict: max offer at in-place rents

Max offer = lowest price that clears **every** constraint that applies (Phase 2 hurdles, $0 Phase 1 housing cost, FHA self-sufficiency, lender DSCR, capital).

| Deal | Ask | FHA base: max offer | Binding | FHA downside: max offer | Phase 2 hurdles only (base) | DSCR loan 25%: max offer | Binding |
|---|---|---|---|---|---|---|---|
| Ybor City quad (bungalow + triplex) | $650k | **$369k** (43.3% below) | $0 Phase 1 housing cost | $316k | $395k | $199k | capital |
| Midtown St. Pete quad (4 x 2bd) | $695k | **$404k** (41.8% below) | $0 Phase 1 housing cost | $359k | $437k | $197k | capital |
| Historic Kenwood quad (3 x 1bd + 3bd) | $750k | **$366k** (51.2% below) | $0 Phase 1 housing cost | $325k | $408k | $197k | capital |

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
| Ybor City quad (bungalow + triplex) | $650k | Outside brief pro forma ($7,400/mo) | 7.32x | ❌ | $585k | 10.0% |
| Midtown St. Pete quad (4 x 2bd) | $695k | In-place rent roll ($6,757/mo) | 8.57x | ❌ | $534k | 23.1% |
| Ybor City quad (bungalow + triplex) | $650k | In-place (3 leased) + vacant 1bd at $1,350 | 9.39x | ❌ | $456k | 29.8% |
| Historic Kenwood quad (3 x 1bd + 3bd) | $750k | In-place / MLS gross ($6,225/mo) | 10.04x | ❌ | $492k | 34.4% |
| Ybor City quad (bungalow + triplex) | $650k | MLS gross income ($61,704/yr) | 10.53x | ❌ | $407k | 37.4% |

## Ybor City quad (bungalow + triplex)
3106 N 17th St, Tampa, FL 33605 · ask $650,000 · listed 2026-10-14 · [listing](https://www.homes.com/property/3106-n-17th-st-tampa-fl/xbn0kbyzl4jqz/)

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
| DSCR loan 25% down @ 7.125% | $650k | $9,425 | $4,991 | n/a | $1,234 | 0.85x (lender 1x ❌) | -$124 | -3.2% | ❌ | ❌ -$148,444 | $199k (capital) |
| DSCR loan 20% down @ 7.375% | $650k | $9,425 | $5,298 | n/a | $1,541 | 0.78x (lender 1x ❌) | -$201 | -6.2% | ❌ | ❌ -$117,787 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | $1,270 | 0.84x (lender 1.25x ❌) | -$133 | -4.3% | ❌ | ❌ -$109,664 | ineligible |
| Brief: 10% down, 4.5% seller note, 7-yr balloon | $650k | $9,425 | $4,670 | n/a | $913 | 0.94x | -$44 | -2.5% | ❌ | ❌ -$28,511 | $457k (capital) |
| Brief seller note + tax 2.0%, ins high | $650k | $11,700 | $5,022 | n/a | $1,265 | 0.82x | -$132 | -7.5% | ❌ | ❌ -$29,567 | $447k ($0 Phase 1 housing cost) |
| Brief's FHA case (7.25%) | $650k | $9,425 | $6,348 | ❌ -$2,020 | $2,591 | 0.60x | -$463 | -52.6% | ❌ | ✅ | $347k ($0 Phase 1 housing cost) |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed): loan $520k < $1500k minimum; 4 units < 5-unit minimum.
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
| DSCR loan 25% down @ 7.125% | $650k | $9,425 | $4,991 | n/a | $1,713 | 0.70x (lender 1x ❌) | -$246 | -6.3% | ❌ | ❌ -$148,444 | $199k (capital) |
| DSCR loan 20% down @ 7.375% | $650k | $9,425 | $5,298 | n/a | $2,020 | 0.64x (lender 1x ❌) | -$323 | -9.9% | ❌ | ❌ -$117,787 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | $1,749 | 0.69x (lender 1.25x ❌) | -$255 | -8.2% | ❌ | ❌ -$109,664 | ineligible |
| Brief: 10% down, 4.5% seller note, 7-yr balloon | $650k | $9,425 | $4,670 | n/a | $1,392 | 0.78x | -$166 | -9.4% | ❌ | ❌ -$28,511 | $417k ($0 Phase 1 housing cost) |
| Brief seller note + tax 2.0%, ins high | $650k | $11,700 | $5,022 | n/a | $1,744 | 0.66x | -$254 | -14.4% | ❌ | ❌ -$29,567 | $370k ($0 Phase 1 housing cost) |
| Brief's FHA case (7.25%) | $650k | $9,425 | $6,348 | ❌ -$2,491 | $3,070 | 0.50x | -$585 | -66.5% | ❌ | ✅ | $291k ($0 Phase 1 housing cost) |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed): loan $520k < $1500k minimum; 4 units < 5-unit minimum.
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
| DSCR loan 25% down @ 7.125% | $650k | $9,425 | $4,991 | n/a | -$152 | 1.24x (lender 1x ✅) | $193 | 4.9% | ❌ | ❌ -$148,444 | $199k (capital) |
| DSCR loan 20% down @ 7.375% | $650k | $9,425 | $5,298 | n/a | $155 | 1.13x (lender 1x ✅) | $117 | 3.6% | ❌ | ❌ -$117,787 | $232k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $650k | $9,425 | $5,027 | n/a | -$115 | 1.22x (lender 1.25x ❌) | $184 | 5.9% | ❌ | ❌ -$109,664 | ineligible |
| Brief: 10% down, 4.5% seller note, 7-yr balloon | $650k | $9,425 | $4,670 | n/a | -$472 | 1.37x | $274 | 15.5% | ✅ | ❌ -$28,511 | $457k (capital) |
| Brief seller note + tax 2.0%, ins high | $650k | $11,700 | $5,022 | n/a | -$120 | 1.25x | $186 | 10.5% | ✅ | ❌ -$29,567 | $451k (capital) |
| Brief's FHA case (7.25%) | $650k | $9,425 | $6,348 | ❌ -$798 | $1,205 | 0.87x | -$146 | -16.6% | ❌ | ✅ | $499k (Phase 2 hurdles) |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed): loan $520k < $1500k minimum; 4 units < 5-unit minimum.
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
| DSCR loan 25% down @ 7.125% | $695k | $10,300 | $5,355 | n/a | $1,239 | 0.89x (lender 1x ❌) | -$98 | -2.3% | ❌ | ❌ -$163,678 | $197k (capital) |
| DSCR loan 20% down @ 7.375% | $695k | $10,300 | $5,683 | n/a | $1,567 | 0.81x (lender 1x ❌) | -$180 | -5.2% | ❌ | ❌ -$130,898 | $230k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $695k | $10,300 | $5,394 | n/a | $1,278 | 0.88x (lender 1.25x ❌) | -$108 | -3.2% | ❌ | ❌ -$122,213 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed): loan $556k < $1500k minimum; 4 units < 5-unit minimum.
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
| DSCR loan 25% down @ 7.125% | $695k | $10,300 | $5,355 | n/a | $223 | 1.28x (lender 1x ✅) | $246 | 5.8% | ❌ | ❌ -$163,678 | $197k (capital) |
| DSCR loan 20% down @ 7.375% | $695k | $10,300 | $5,683 | n/a | $552 | 1.17x (lender 1x ✅) | $164 | 4.7% | ❌ | ❌ -$130,898 | $230k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $695k | $10,300 | $5,394 | n/a | $262 | 1.27x (lender 1.25x ✅) | $236 | 7.1% | ❌ | ❌ -$122,213 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed): loan $556k < $1500k minimum; 4 units < 5-unit minimum.
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
| DSCR loan 25% down @ 7.125% | $750k | $10,300 | $5,711 | n/a | $1,902 | 0.73x (lender 1x ❌) | -$255 | -5.6% | ❌ | ❌ -$181,763 | $197k (capital) |
| DSCR loan 20% down @ 7.375% | $750k | $10,300 | $6,065 | n/a | $2,256 | 0.67x (lender 1x ❌) | -$344 | -9.2% | ❌ | ❌ -$146,389 | $230k (capital) |
| Commercial SB 20% @ 6.60% (eligibility check) | $750k | $10,300 | $5,753 | n/a | $1,944 | 0.72x (lender 1.25x ❌) | -$266 | -7.4% | ❌ | ❌ -$137,017 | ineligible |

- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Not eligible for Small-balance commercial MF, 20% down @ 6.60% (5-yr fixed): loan $600k < $1500k minimum; 4 units < 5-unit minimum.
- 🚩 Commercial SB 20% @ 6.60% (eligibility check): Balloon of ~$562,308 due in year 5; refinance risk.

**Gates (all Unverified until independently checked):**

- [ ] **Zoning permits 4 units** (kill if confirmed): Listing says multi-family ≤10 units. Confirm code with City of St. Pete.
- [ ] **Parcel unit count vs. advertised doors** (kill if confirmed): MLS: 4 units total but 'Unit Count: 2', 2 buildings. Check Pinellas PA / CO.
- [ ] **FEMA flood zone**: MLS says Zone X, non-evacuation.
- [ ] **Insurability / quote** (kill if confirmed): 1921 frame, historic district. Comps $9.2k–$11.4k/yr; impact windows help wind-mit; roof age unknown. Needs a bound quote + clean 4-point.
- [ ] **Historic district constraints** (reprice if confirmed): Exterior changes need COA review; affects capex cost and timing.
- [ ] **Seller-reported opex reconciles** (reprice if confirmed): Seller lists $17,255/yr (23% of gross); taxes alone roughly double on sale.

- On market since 02/14/2026 with no price change (~248 days).

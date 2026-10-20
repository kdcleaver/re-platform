"""Verbatim reconstruction of the hand-verified buybox_check.py (2026-09-28 session).
Used only to generate golden values for the TypeScript engine's parity tests."""
import json

ASSUMPTIONS = dict(
    rate=0.0649, term_months=360, down_pct=0.035, ufmip=0.0175,
    mip_low=0.0055, mip_high=0.0075, mip_threshold=726_200,
    tax_pct=0.015, ins_pct=0.009, closing_pct=0.03, reserve_months=3,
    ss_factor=0.75, var_opex=0.15, util_per_door=75, mgmt_pct=0.08,
    gift=50_000, own_cash=20_000,
)
A = ASSUMPTIONS


def pmt(principal, rate=A["rate"], n=A["term_months"]):
    r = rate / 12
    return principal * r / (1 - (1 + r) ** -n)


def costs(price):
    base = price * (1 - A["down_pct"])
    total_loan = base * (1 + A["ufmip"])
    mip_rate = A["mip_high"] if base > A["mip_threshold"] else A["mip_low"]
    pi = pmt(total_loan)
    mip = base * mip_rate / 12
    tax = price * A["tax_pct"] / 12
    ins = price * A["ins_pct"] / 12
    pitia = pi + mip + tax + ins
    down = price * A["down_pct"]
    closing = price * A["closing_pct"]
    return dict(base=base, total_loan=total_loan, pi=pi, mip=mip, tax=tax, ins=ins,
                pitia=pitia, down=down, closing=closing,
                cash_to_close=down + closing, reserves=pitia * A["reserve_months"])


def max_price_for_gross(gross, lo=100_000, hi=2_000_000):
    for _ in range(60):
        mid = (lo + hi) / 2
        if A["ss_factor"] * gross >= costs(mid)["pitia"]:
            lo = mid
        else:
            hi = mid
    return lo


def housing_cost(price, units, other_rent):
    c = costs(price)
    collected = other_rent * (1 - A["var_opex"])
    util = A["util_per_door"] * units
    return c["pitia"] + util - collected


def other_rent_for_zero(price, units):
    c = costs(price)
    return (c["pitia"] + A["util_per_door"] * units) / (1 - A["var_opex"])


def phase2(price, units, gross):
    c = costs(price)
    egi = gross * 0.95
    opex = (egi * (0.05 + 0.05 + A["mgmt_pct"]) + (c["tax"] + c["ins"]) +
            A["util_per_door"] * units)
    noi_mo = egi - opex
    debt_mo = c["pi"] + c["mip"]
    cf_mo = noi_mo - debt_mo
    coc = cf_mo * 12 / c["cash_to_close"]
    return dict(noi_yr=noi_mo * 12, dscr=noi_mo / debt_mo, cf_door=cf_mo / units, coc=coc)


CASES = [
    # (label, price, units, gross_rent_mo, other_rent_mo)
    ("725 14th Ave S", 725_000, 4, 5_980, 5_980 * 3 / 4),
    ("15501 61st St N full pro forma", 649_990, 3, 7_050, 7_050 * 2 / 3),
    ("935 17th Ave S duplex @ FMR", 539_990, 2, 3_195 * 2, 3_195),
    ("236 W North St (jumbo MIP tier)", 998_000, 4, 8_000, 6_000),
]

if __name__ == "__main__":
    out = []
    for label, price, units, gross, other in CASES:
        c = costs(price)
        p2 = phase2(price, units, gross)
        out.append(dict(
            label=label, price=price, units=units, gross=gross, other=other,
            pitia=c["pitia"], pi=c["pi"], mip=c["mip"], cash_to_close=c["cash_to_close"],
            reserves=c["reserves"], housing_cost=housing_cost(price, units, other),
            other_rent_for_zero=other_rent_for_zero(price, units),
            max_price_ss=max_price_for_gross(gross),
            noi_yr=p2["noi_yr"], dscr=p2["dscr"], cf_door=p2["cf_door"], coc=p2["coc"],
        ))
    print(json.dumps(out, indent=2))

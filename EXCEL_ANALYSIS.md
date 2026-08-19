# Depreciation & Tax Benefit Workbooks — Full Analysis (M9 + Cyberster)

**Source files (read-only, never modified):**
- `Depreciation Benefits(Tax Benefit Working M9).csv`
- `Depreciation Benefits(Tax Benefit Working Cyberster).csv`

**Analysed:** 2026-08-19
**Currency:** INR (₹). Confirmed by the tax table — "1 cr / 10 cr", surcharge + 4% cess = Indian income-tax structure.

---

## 0. Read this first

### 0.1 They are CSV exports, not `.xlsx`

A CSV stores *results*, not *formulas* — no formula text survived the export. Every formula below was **reverse-engineered from the numbers and re-verified arithmetically**.

Confidence is now very high, because three independent complete blocks exist and two of them reproduce **perfectly**:

| Block | Cells checked | Result |
|---|---|---|
| Cyberster | 35 cells + total | **100% exact match** |
| M9 Block 2 | 35 cells + total | **100% exact match** |
| M9 Block 1 | 35 cells + total | exact for Y1–Y3 + summary; **2 cells are bugs in the sheet** |

The Cyberster file arriving *after* the engine was derived from M9 is the strongest possible confirmation — it validated on the first run with zero adjustment.

### 0.2 The headline number is **the same for both cars** — and that is a real problem

The model's net-cost percentage is **mathematically independent of the car's price**. See §5. Both cars produce identical percentages at the same tax rate. The only reason the two sheets show different headlines is that **someone applied a different tax rate to each car**, not because the cars differ.

---

## 1. What each file contains

| | **M9 file** | **Cyberster file** |
|---|---|---|
| Main block | `A2:P16` — M9 @ **₹79,94,800**, tax **30%** | `A2:O12` — Cyberster @ **₹82,49,800**, tax **34%** |
| Second block | `R2:AF10` — "M9" @ **₹18,99,800**, tax **34%** | *(none)* |
| FY-wise block | `B18:I27` — "M9" @ ₹71,00,000 — **blank shell** | `B18:I27` — **identical blank shell, still labelled "M9"** |
| Summary panel | rows 13–16 — **populated** (the 38% headline) | rows 13–16 — **EMPTY except the label** |
| Tax table | rows 31–35 | rows 31–35 — identical |
| Non-empty rows | 53 of 1,048,587 | 25 of 1,048,562 |

Notes:
- The Cyberster file's block 3 still says **"M9"** at `E18` — an uncorrected copy-paste. Both files carry the same ₹71,00,000 blank template.
- Both files contain the same orphan value `1350000` in column L on the last row — export junk, ignore.
- The **Cyberster summary panel was never filled in**, so the Cyberster has no computed headline. I've computed it in §6.
- The mystery ₹18,99,800 "M9" block in the M9 file is now clearly a **scratch/template copy** — it is not the Cyberster (Cyberster is ₹82.5 lakh).

---

## 2. Variable glossary (the `a` … `m` chain)

Identical structure in all blocks.

| Sym | Column | Header text | Meaning |
|---|---|---|---|
| **a** | H4 | `Net Ex Sr (a)` | Net ex-showroom price. Base of everything. |
| **b** | C | `Depriciation in Books (b)` | Book depreciation **rate** — 40% flat. |
| **c** | D | `WDV (c=a*b)` | Written-Down Value at end of year. |
| **d** | F | `Tax Benefit (d=c*30%)` | Tax saved from claiming depreciation. |
| **e** | G | `Market RV (e)` | Market residual value **%** — 80/70/60/45/35. |
| **f** | H | `Market Value (f=e*a)` | Real-world resale value. |
| **g** | I | `Net Value > WDV (g=c-f)` | Book value − market value (always negative). |
| **h** | J | `Value after Tax Benefit (h=a-d)` | Effective price after tax relief. |
| **i** | K | `Cost of Ownership (i=H-f)` | Effective price − resale proceeds. |
| **j** | L | `ICE @ Rs 10/Km` | Cumulative petrol running cost. |
| **k** | M | `EV @ Rs 2/KM` | Cumulative EV running cost. |
| **l** | N | `Saving (l=j-k)` | Cumulative fuel saving. |
| **m** | O | `Cost of owneship (m=i-l)` | **Final answer** — true cost of ownership. |

> ⚠️ **Several headers are wrong as written.** Real formulas in §3. Do not code from the header text.

---

## 3. The formulas — as actually computed (verified against both cars)

### 3.1 `c` — Written Down Value  *(header `c=a*b` is WRONG)*

Reducing-balance, not `a*b`:

```
c₀ = a
cₙ = cₙ₋₁ × (1 − b)          closed form:  cₙ = a × (1 − b)ⁿ = a × 0.6ⁿ
```

### 3.2 `DepAmt` — the year's depreciation charge *(implicit, no column)*

```
DepAmtₙ = cₙ₋₁ − cₙ
```

### 3.3 `d` — Tax Benefit  *(header `d = c × 30%` is WRONG)*

The base is the **year's depreciation charge**, not the WDV:

```
dₙ = DepAmtₙ × taxRate = (cₙ₋₁ − cₙ) × taxRate
```

Proof, Cyberster Y1: `(8,249,800 − 4,949,880) × 34% = 3,299,920 × 34% = 1,121,973` ✓
(Had it been `c × 34%` it would read 1,682,959.)

### 3.4 `e`, `f` — Residual value

`e` is a hardcoded assumption ladder; `f` is a % of the **original** price (not of WDV):

```
fₙ = eₙ × a          e = [80%, 70%, 60%, 45%, 35%]
```

Both cars use the **identical** ladder.

### 3.5 `g` — Net Value > WDV

```
gₙ = cₙ − fₙ
```

Always negative — the car is worth more in the market than in the books. **That negative gap is the pitch**: value the owner captures beyond book. (On an actual sale this excess is a taxable balancing charge — not modelled. See §8.)

### 3.6 `h` — Value after Tax Benefit — **cumulative**

```
hₙ = a − Σ(d₁…dₙ)
```

**Cyberster settles the question that the M9 file left open.** Two of three blocks use the cumulative form:

| Block | Formula | Verdict |
|---|---|---|
| Cyberster | `a − Σd` | ✅ correct |
| M9 Block 1 | `a − Σd` | ✅ correct |
| M9 Block 2 | `a − dₙ` | ❌ **the outlier — broken** |

Cyberster Y2 proof: `8,249,800 − (1,121,972.80 + 673,183.68) = 6,454,644` ✓ (single-year would give 7,576,616 — not what the sheet shows).

M9 Block 2's version throws away every prior year's relief, making its `h` *rise* with age (1,641,427 → 1,866,315) — i.e. the car gets *more* expensive the longer you own it. Use the cumulative form everywhere.

### 3.7 `i` — Cost of Ownership

```
iₙ = hₙ − fₙ
```

Header labels disagree across files — M9 says `i=H-f`, Cyberster says `i=d-f`. **Both are wrong as literal algebra**; the computed value is `h − f` in both. Verified on all 10 rows across both cars.

### 3.8 `j`, `k`, `l` — Running costs ⚠️ **`k` contradicts its own label in BOTH files**

```
jₙ = 10,000 km × ₹10/km × n  =  100,000 × n     ✓ matches label
kₙ =  30,000 × n                                 ✗ label says "EV @ Rs 2/KM"
lₙ = jₙ − kₙ = 70,000 × n
```

At 10,000 km/yr, ₹2/km gives ₹20,000/yr, not ₹30,000. Both sheets hardcode **₹3/km**. Identical defect in both files — so it's a template error, not a one-off.

### 3.9 `m` — Final Cost of Ownership

```
mₙ = iₙ − lₙ
```

Full expansion:

```
mₙ = a − Σ(dᵢ) − (eₙ × a) − (iceRate − evRate) × kmPerYear × n
```

---

## 4. The Summary Panel (M9 file only, column I, rows 13–16)

Built on a **3-year hold**:

| Cell | M9 value | Formula (verified) | Meaning |
|---|---|---|---|
| I13 | 3,070,003.20 | `\|g₃\| = f₃ − c₃` | Market value above book value at year 3 |
| I14 | 1,880,377 | `d₁ + d₂ + d₃` | Cumulative tax benefit, 3 years |
| I15 | **4,950,380** | `I13 + I14` | **"Depreciation Benefit for Companies / Business Owner"** |
| I16 | **3,044,420** | `a − I15` | Effective net cost after 3 years |
| J16 | 0.3808 | `I16 / a` | Net cost as % of price |
| P16 | 38% | `ROUND(J16)` | **The headline** |

Check: `7,994,800 − 4,950,380.16 = 3,044,419.84` → `/7,994,800 = 38.08%` ✓

**Row 12 totals:** M9 `F12 = 2,506,862` (Σd, 5 yrs — *corrupted*, correct is **2,211,937**, see §7.1/7.2). Cyberster `F12 = 2,586,820` ✓ correct.

---

## 5. 🔴 The most important finding: the headline % is independent of price

Substituting the whole chain and dividing by `a`, the price **cancels out completely**:

```
netCost%(N) = 1 − ( e_N − (1−b)^N ) − taxRate × ( 1 − (1−b)^N )
```

For the standard assumptions (b = 40%, N = 3, e₃ = 60%, so (1−b)³ = 0.216):

```
netCost%(3yr) = 0.616 − 0.784 × taxRate
```

Verified exactly against both cars at every rate and holding period:

| Hold | taxRate | M9 (₹79.9L) | Cyberster (₹82.5L) | Closed form |
|---|---|---|---|---|
| 1 yr | 30% | 68.0000% | 68.0000% | 68.0000% ✓ |
| 3 yr | 30% | **38.0800%** | **38.0800%** | 38.0800% ✓ |
| 3 yr | 34% | **34.9440%** | **34.9440%** | 34.9440% ✓ |
| 5 yr | 30% | 45.1088% | 45.1088% | 45.1088% ✓ |

### What this means

1. **"38%" is not a fact about the M9.** It is a fact about the assumption set (40% dep, this RV ladder, 30% tax, 3-year hold). Any vehicle plugged in returns the same percentage.
2. **The two sheets are not comparable as shipped.** M9 uses 30%, Cyberster uses 34%. That single inconsistency — not the cars — creates the entire apparent gap:

| Comparison (3-yr hold) | M9 net cost | M9 % | Cyberster net cost | Cyb % |
|---|---|---|---|---|
| **As shipped (30% vs 34%)** | 3,044,420 | 38.08% | 2,882,810 | **34.94%** |
| Both at 30% | 3,044,420 | 38.08% | 3,141,524 | 38.08% |
| Both at 34% | 2,793,703 | 34.94% | 2,882,810 | 34.94% |
| Both at 34.944% (>₹10cr) | 2,734,534 | 34.20% | 2,821,754 | 34.20% |

Putting the M9 on Cyberster's tax band alone moves it **3.14 pts / ₹2,50,717**. On a like-for-like basis the Cyberster simply costs more in rupees (it is ₹2,55,000 / 3.19% more expensive) and is *identical* in percentage terms.

3. **Non-monotonic in holding period.** Net cost falls to a minimum around year 3 (38.08%) then *rises* again by year 5 (45.11%) — because the residual ladder drops faster (60%→35%) than tax relief accrues. **Year 3 is the optimum**, which is presumably why the summary uses it. Worth stating explicitly rather than leaving implicit.

---

## 6. Cyberster summary panel — computed (the sheet leaves it blank)

| Cell | Value | Formula |
|---|---|---|
| I13 | 3,167,923.20 | `\|g₃\|` |
| I14 | 2,199,066.69 | `d₁ + d₂ + d₃` |
| I15 | **5,366,989.89** | total depreciation benefit |
| I16 | **2,882,810.11** | net cost after 3 years |
| J16 | **34.94%** | net cost % |

Note this uses the sheet's own 34% rate. At M9's 30% it would be 38.08% — identical to the M9 (§5).

---

## 7. Errors and inconsistencies

**Do not port these into the calculator.**

### 7.1 🔴 M9 Block 1, Year 4 tax benefit is a hardcoded wrong number

- **Shown:** `485,572` · **Correct:** `690,750.72 × 30% = 207,225.22`
- Overstated by **+278,347 (134%)**. Implied base ₹16,18,573 appears nowhere in either workbook.
- Brute-forced every price × WDV/dep/market term × 12 candidate rates × all pairwise differences across all blocks: **zero matches**. It is a manually typed-over cell.
- **Cyberster's Y4 is correct** (`242,346`), confirming the formula.

### 7.2 🔴 M9 Block 1, Year 5 tax benefit uses the wrong tax rate

- **Shown:** `140,913` = `414,450.43 × 34%` · **Correct:** `× 30% = 124,335.13`
- The 34% leaked in from a neighbouring block. **Cyberster's Y5 is correct.**

> **Knock-on:** both errors flow into `h`, `i`, `m` for years 4–5 and into `F12`. The **summary panel is unaffected** (it only uses years 1–3), so the 38% headline is safe.

### 7.3 🔴 Inconsistent tax rate between the two cars

M9 at 30%, Cyberster at 34% — with no stated reason. Makes the two decks non-comparable and flatters the Cyberster by 3.14 pts (§5).

### 7.4 🔴 M9 Block 2 uses a different `h` formula

`h = a − dₙ` instead of cumulative (§3.6). Outlier among three blocks.

### 7.5 🟠 `k` contradicts its label in both files

₹2/km labelled, ₹3/km computed (§3.8).

### 7.6 🟠 Block 3 (rows 18–27) is a non-functional shell in **both** files

FY-wise schedule @ ₹71,00,000 with a proper **20% first-year rate** — the correct Indian half-year convention (asset used <180 days gets half of 40%) — then 40% thereafter. Every computed cell is ` - ` or `0`, and the Cyberster copy is still labelled **"M9"**.

| Age | FY | Rate | DepAmt | Accum | WDV | Tax Benefit |
|---|---|---|---|---|---|---|
| 1 month | FY 25-26 | 20% | – | – | 0 | 0 |
| 13 month | FY 26-27 | 40% | – | – | 0 | 0 |
| 25 month | FY 27-28 | 40% | – | – | 0 | 0 |
| 37 month | FY 28-29 | 40% | – | – | 0 | 0 |
| 49 month | FY 29-30 | 40% | – | – | 0 | 0 |

**This block is the better model** — it handles the half-year rule and financial-year alignment, which the main blocks ignore. It was simply never filled in. The calculator should implement *this* structure with the main block's economics.

### 7.7 🟡 Header text vs. actual formulas

`c=a*b`, `d=c*30%`, `i=H-f` / `i=d-f`, and `EV @ Rs 2/KM` are all wrong (§3.1, §3.3, §3.7, §3.8).

### 7.8 🟡 Unused / orphan cells

- M9 column **P**, rows 6–8 — stale partial duplicate of the WDV column.
- `L1048587` (M9) / `L1048562` (Cyberster) = `1350000` — export junk in both.
- `Consumer Scheme = 0` (D4) — an input that exists but is **never referenced by any formula**. Presumably intended as a discount off `a`.

---

## 8. Modelling gaps (not bugs, but the model is silent on these)

1. **No balancing charge on sale.** Selling at `f` when book value is `c` creates a taxable profit of `f − c` (₹30.7 L for M9, ₹31.7 L for Cyberster at year 3). The sheet counts this as pure *benefit*. Under s.50 of the Income Tax Act this is a short-term capital gain on the block of assets and is **taxable**. Both headline figures are therefore optimistic ceilings.
2. **No time value of money.** Tax benefits land across 5 years, resale at the end; all summed undiscounted. No NPV.
3. **No GST / input tax credit** treatment.
4. **No insurance, maintenance, tyres, or registration** — "cost of ownership" is only price − resale − fuel.
5. **`e` (residual %) is a fixed assumption ladder**, identical for both cars. A sports car and an MPV almost certainly do not depreciate identically — this is where a genuine M9-vs-Cyberster difference *should* appear, and currently does not.
6. **The 40% depreciation rate needs confirming with a tax advisor.** The *ordinary* rate for motor cars used in a business is **15%**; higher rates (30%/40%/45%) apply only in specific cases — vehicles run on hire, or assets acquired within particular incentive windows. 40% roughly **2.7×** the benefit versus 15%, so this single input drives the entire headline.

---

## 9. Tax Rate table (rows 31–35, identical in both files)

Labelled `For companies`. Three income bands: **base 30% → + surcharge → + 4% cess**.

```
effectiveRate = 30% × (1 + surcharge) × (1 + cess)
```

| Band | Surcharge | Cess | Effective (row 35) | Check |
|---|---|---|---|---|
| Income < ₹1 cr | 0% | 4% | **31.200%** | 30 × 1.00 × 1.04 ✓ |
| ₹1 cr – ₹10 cr | 7% | 4% | **33.384%** | 30 × 1.07 × 1.04 ✓ |
| > ₹10 cr | 12% | 4% | **34.944%** | 30 × 1.12 × 1.04 ✓ |

**Source of the rates used in the blocks** — each rounds a band *down* to a whole number, understating the benefit:

| Block | Rate used | From band | Rounding loss |
|---|---|---|---|
| M9 Block 1 | **30%** | 31.2% | −1.2 pts |
| M9 Block 3 / Cyb Block 3 | **33%** | 33.384% | −0.384 pts |
| M9 Block 2, **Cyberster** | **34%** | 34.944% | −0.944 pts |

The calculator should use the **exact** rates and let the user pick the band.

---

## 10. Specification for the calculator

### Inputs

| Input | Default | Notes |
|---|---|---|
| Model / Variant | M9 / Cyberster | dropdown |
| Ex-showroom price `a` | M9 7,994,800 · Cyb 8,249,800 | ₹ |
| Consumer scheme / discount | 0 | subtract from `a` |
| Book depreciation rate `b` | 40% | 15% / 30% / 40% / 45% selectable |
| Half-year rule | on | 1st-year rate → `b/2` if <180 days use |
| Income band | > ₹10 cr | drives tax rate |
| Tax rate | 34.944% | auto from band, overridable — **same for both cars** |
| Residual ladder `e` | 80/70/60/45/35 | editable per year, **per model** |
| Km per year | 10,000 | |
| ICE ₹/km | 10 | |
| EV ₹/km | 3 | ⚠️ resolve §7.5 |
| Holding period | 3 years | drives the headline |

### Engine (single canonical set — all bugs removed)

```
c₀   = a
cₙ   = cₙ₋₁ × (1 − bₙ)                 b₁ = b/2 if half-year else b
depₙ = cₙ₋₁ − cₙ
dₙ   = depₙ × taxRate
Σdₙ  = Σ(d₁…dₙ)
fₙ   = eₙ × a
gₙ   = cₙ − fₙ
hₙ   = a − Σdₙ                          ← cumulative, always
iₙ   = hₙ − fₙ
jₙ   = kmPerYear × iceRate × n
kₙ   = kmPerYear × evRate  × n
lₙ   = jₙ − kₙ
mₙ   = iₙ − lₙ
```

### Outputs

- Year-by-year table (`c`, `dep`, `d`, `Σd`, `f`, `g`, `h`, `i`, `l`, `m`)
- **Headline panel at holding period N:**
  `benefit = |g_N| + Σd_N` · `netCost = a − benefit` · `netCost% = netCost / a`
- **Side-by-side M9 vs Cyberster on one shared tax rate** — never one rate each (§7.3).
- Optional toggle: *include balancing-charge tax on sale* (§8.1) for a defensible number.

### Regression tests (must reproduce the sources exactly)

| Test | Expectation |
|---|---|
| Cyberster, all 5 years, all columns | matches to the rupee ✅ *(already verified)* |
| M9 Block 2, all 5 years | matches to the rupee ✅ *(already verified)* |
| M9 Block 1, years 1–3 | matches to the rupee ✅ |
| M9 summary panel | `4,950,380` / `3,044,420` / `38.08%` ✅ |
| Cyberster Σd (F12) | `2,586,820` ✅ |
| M9 Block 1 years 4–5 | **intentionally differs** — bugs corrected: `d₄ 485,572 → 207,225`, `d₅ 140,913 → 124,335`, `Σd 2,506,862 → 2,211,937` |
| Closed form | `netCost%(3yr) = 0.616 − 0.784 × taxRate` for any price |

---

## 11. Open questions

1. **Tax rate: should both cars use the same band?** (§7.3) As shipped they don't, and that alone creates the entire M9-vs-Cyberster gap. My strong recommendation: one shared, user-selectable band.
2. **EV running cost — ₹2/km or ₹3/km?** (§7.5) Same defect in both files.
3. **Should the residual ladder differ per model?** (§8.5) Currently identical for an MPV and a roadster. This is where a real difference between the two cars should live.
4. **Should the balancing charge on sale be modelled?** (§8.1) It materially changes both headlines.
5. **Confirm the 40% depreciation rate with a tax advisor** (§8.6) — highest-leverage input in the model.
6. **Confirm the 3-year holding period** for the headline. It happens to be the optimum (§5.3); 5 years is materially worse (45.11% vs 38.08%).
7. **Is the ₹18,99,800 "M9" block in the M9 file safe to delete?** It appears to be scratch work.

---

## Appendix A — M9 Block 1 recomputed correctly (₹79,94,800, 30%)

| Y | WDV `c` | DepAmt | Tax Ben `d` | Mkt Val `f` | `g=c−f` | `h=a−Σd` | `i=h−f` | `m=i−l` |
|---|---|---|---|---|---|---|---|---|
| 1 | 4,796,880 | 3,197,920 | 959,376 | 6,395,840 | −1,598,960 | 7,035,424 | 639,584 | 569,584 |
| 2 | 2,878,128 | 1,918,752 | 575,626 | 5,596,360 | −2,718,232 | 6,459,798 | 863,438 | 723,438 |
| 3 | 1,726,877 | 1,151,251 | 345,375 | 4,796,880 | −3,070,003 | 6,114,423 | 1,317,543 | 1,107,543 |
| 4 | 1,036,126 | 690,751 | **207,225** | 3,597,660 | −2,561,534 | **5,907,198** | **2,309,538** | **2,029,538** |
| 5 | 621,676 | 414,450 | **124,335** | 2,798,180 | −2,176,504 | **5,782,863** | **2,984,683** | **2,634,683** |

**Bold** = differs from the source because the source cell is wrong (§7.1, §7.2).

## Appendix B — Cyberster as-is (₹82,49,800, 34%) — reproduces the source exactly

| Y | WDV `c` | DepAmt | Tax Ben `d` | Mkt Val `f` | `g=c−f` | `h=a−Σd` | `i=h−f` | `m=i−l` |
|---|---|---|---|---|---|---|---|---|
| 1 | 4,949,880 | 3,299,920 | 1,121,973 | 6,599,840 | −1,649,960 | 7,127,827 | 527,987 | 457,987 |
| 2 | 2,969,928 | 1,979,952 | 673,184 | 5,774,860 | −2,804,932 | 6,454,644 | 679,784 | 539,784 |
| 3 | 1,781,957 | 1,187,971 | 403,910 | 4,949,880 | −3,167,923 | 6,050,733 | 1,100,853 | 890,853 |
| 4 | 1,069,174 | 712,783 | 242,346 | 3,712,410 | −2,643,236 | 5,808,387 | 2,095,977 | 1,815,977 |
| 5 | 641,504 | 427,670 | 145,408 | 2,887,430 | −2,245,926 | 5,662,980 | 2,775,550 | 2,425,550 |

**All 35 cells verified — zero discrepancies.** This block is the reference implementation.

## Appendix C — M9 Block 2 as-is (₹18,99,800, 34%) — scratch copy

| Y | WDV `c` | DepAmt | Tax Ben `d` | Mkt Val `f` | `g=c−f` | `h=a−d` ⚠️ | `i=h−f` | `m=i−l` |
|---|---|---|---|---|---|---|---|---|
| 1 | 1,139,880 | 759,920 | 258,373 | 1,519,840 | −379,960 | 1,641,427 | 121,587 | 51,587 |
| 2 | 683,928 | 455,952 | 155,024 | 1,329,860 | −645,932 | 1,744,776 | 414,916 | 274,916 |
| 3 | 410,357 | 273,571 | 93,014 | 1,139,880 | −729,523 | 1,806,786 | 666,906 | 456,906 |
| 4 | 246,214 | 164,143 | 55,809 | 854,910 | −608,696 | 1,843,991 | 989,081 | 709,081 |
| 5 | 147,728 | 98,486 | 33,485 | 664,930 | −517,202 | 1,866,315 | 1,201,385 | 851,385 |

Reproduces the source exactly, but `h` uses the **single-year** form — note it *rises* year on year (§3.6 / §7.4).

# Why Invest Journey — Model Assumptions & Reality Check

This document captures the return, volatility, and correlation assumptions used in the interactive tool, with comparisons to historical data. Update whenever model inputs change.

---

## 1. Asset Class Assumptions

| Asset Class | Model Return | Model Vol | Historical Return¹ | Historical Vol¹ |
|---|---|---|---|---|
| Equities | 7.5% p.a. | 18% | ~10% (MSCI World USD, 1970–2024) | 15–17% |
| Bonds | 3.0% p.a. | 5% | ~4–5% (Bloomberg Global Agg, 1990–2024) | 4–6% |
| REITs | 8.0% p.a. | 20% | 8.4% (FTSE NAREIT, 1972–2024) | 18–22% |
| Crypto | 14.0% p.a. | 65% | ~40–60% CAGR (BTC, 2015–2024) | 60–80% |
| Cash | 1.5% p.a. | ~0% | 1–4% (money market, varies by era) | ~0% |

¹ Nominal, approximate long-run averages; equity figures in USD, bond figures in EUR-hedged equivalent.

### Equities
- **7.5% nominal** is below the MSCI World historical ~10% (USD). The discount accounts for EUR base currency, forward valuation drag, and estimation conservatism.
- **18% vol** is a slight buffer above observed MSCI World annualised std. dev. of 15–17%.

### Bonds
- **3.0% nominal** reflects a blended global investment-grade portfolio at current yield levels (EUR IG ~3–4%). Raised from 2.5% in April 2026 after yield normalisation post-2022.
- **5% vol** is consistent with EUR aggregate bond index volatility (~4–6%).

### REITs (Listed Real Estate)
- **8.0% nominal** is broadly in line with FTSE NAREIT long-run returns (~8.4%). Slightly conservative vs. history.
- **20% vol** reflects REIT equity-like behaviour with leverage; consistent with NAREIT historical std. dev. of 18–22%.

### Crypto
- **14.0% nominal** is a conservative forward estimate relative to BTC's realised ~40–60% CAGR (2015–2024). Forward return is highly uncertain.
- **65% vol** reflects observed BTC annualised std. dev. of 60–80%. Intentionally in the lower range of history as a conservative baseline.

### Cash
- **1.5% nominal** is a long-run assumption, intentionally below current ECB rates (~3.5%), which are cyclical. Cash vol ≈ 0 is treated as zero in the formula.

---

## 2. Correlation Matrix (Model vs. Historical)

| Pair | Model ρ | Historical ρ (approx.) | Notes |
|---|---|---|---|
| Equities / Bonds | 0.00 | −0.10 to +0.20 | Regime-dependent; negative 1998–2021, positive post-2022 |
| Equities / REITs | +0.65 | 0.60–0.70 | REITs are equity-like; correlation well-documented |
| Equities / Crypto | +0.40 | 0.30–0.50 | Rising post-2020; higher during risk-off episodes |
| Bonds / REITs | +0.10 | 0.10–0.20 | Low; REITs have some interest-rate sensitivity |
| Bonds / Crypto | +0.05 | ~0.05 | Near-zero; crypto largely uncorrelated to fixed income |
| REITs / Crypto | +0.10 | ~0.05–0.15 | Both alternatives; some co-movement in risk-off |

Full matrix used in the volatility formula:

|  | Eq | Bo | Re | Cr | Ca |
|---|---|---|---|---|---|
| Equities | 1.00 | 0.00 | +0.65 | +0.40 | 0.00 |
| Bonds | — | 1.00 | +0.10 | +0.05 | 0.00 |
| REITs | — | — | 1.00 | +0.10 | 0.00 |
| Crypto | — | — | — | 1.00 | 0.00 |
| Cash | — | — | — | — | 1.00 |

**Volatility formula:**
```
σ = √( Σ wᵢ²·σᵢ² + 2·Σ wᵢwⱼ·σᵢσⱼ·ρᵢⱼ )
```
Cash is excluded (σ_cash = 0). All 10 pairs among Equities, Bonds, REITs, Crypto are included.

---

## 3. Reference Profiles — Allocations & Risk/Return

These are the four dots on the Ch1 risk-return scatter chart. Format: Eq / Bo / REITs / Crypto / Cash.

| Profile | Eq | Bo | REITs | Crypto | Ca | Model Return | Model Vol | Sharpe† |
|---|---|---|---|---|---|---|---|---|
| Conservative | 30% | 65% | 0% | 0% | 5% | 4.3% | 6.3% | 0.44 |
| Balanced | 55% | 40% | 0% | 0% | 5% | 5.4% | 10.1% | 0.39 |
| Growth | 70% | 20% | 5% | 2% | 3% | 6.6% | 13.9% | 0.37 |
| Aggressive | 90% | 0% | 6% | 4% | 0% | 7.8% | 18.2% | 0.35 |

† Sharpe = (return − 1.5% cash) / vol. Declining Sharpe across risk levels is expected and realistic.

Conservative and Balanced carry no satellite allocation by design — both classes require a long investment horizon and meaningful risk tolerance to be appropriate.

### Real-World Benchmarks

| Benchmark | Approx. Return | Approx. Vol | Period |
|---|---|---|---|
| MSCI World (100% equity, USD) | 10.4% | 15–17% | 1970–2024 |
| 60/40 Global (MSCI World / Barclays Agg) | 7–8% | 9–11% | 1990–2024 |
| Vanguard LifeStrategy 80 (GBP) | ~8–9% | ~13–15% | 2011–2024 |
| iShares Core MSCI World + 40% EUR Agg | ~6–7% (EUR) | ~10–12% | 2010–2024 |

**Assessment:** The model's Balanced (5.4% / 10.1%) and Growth (6.6% / 13.9%) profiles sit somewhat below real-world EUR 60/40 and 80/20 benchmarks. This is intentional conservatism — the tool is illustrative, not a performance projection.

---

## 4. Profile Classification Thresholds

Labels are based on **total risky assets = equities + REITs + crypto** (not equities alone).

| Label | Risky Asset Range | Horizon requirement in Prompt Builder |
|---|---|---|
| Capital preservation | < 20% | Any |
| Conservative | 20–39% | ≥ 3 years |
| Balanced | 40–59% | ≥ 5 years |
| Growth | 60–79% | ≥ 10 years |
| Aggressive | ≥ 80% | ≥ 10 years |
| Crypto-heavy ⚠️ | Crypto ≥ 15% | Overrides label (shown in coral) |

The crypto concentration warning triggers on standalone crypto allocation (not total satellites), reflecting that even a 15% crypto position dominates portfolio vol given its 65% standalone volatility.

The horizon cap mirrors the Prompt Builder's hard constraint: Growth and Aggressive profiles require a minimum 10-year investment horizon.

---

## 5. Implied Sharpe Ratios (per asset class)

| Asset Class | Return | Cash (RF) | Vol | Sharpe |
|---|---|---|---|---|
| Equities | 7.5% | 1.5% | 18% | **0.33** |
| Bonds | 3.0% | 1.5% | 5% | **0.30** |
| REITs | 8.0% | 1.5% | 20% | **0.33** |
| Crypto | 14.0% | 1.5% | 65% | **0.19** |
| Cash | 1.5% | — | ~0% | — |

Equities and REITs share the best Sharpe (0.33). Bonds at 0.30 are competitive on a risk-adjusted basis. Crypto at 0.19 is the weakest — its high absolute return is swamped by its extreme volatility. This is the key modelling argument for keeping crypto allocations small.

---

## 6. Known Limitations

1. **Static correlations.** In crises, correlations rise — equities, REITs, and crypto tend to sell off together. The model does not account for regime shifts, so diversification benefits are likely overstated in tail scenarios.
2. **No inflation adjustment.** All figures are nominal. Real returns subtract ~2–2.5% p.a.
3. **Bond return is rate-cycle sensitive.** 3.0% is appropriate today; will need revisiting if rates fall materially again.
4. **Equity 7.5% is EUR-adjusted conservatism.** USD-based studies (DMS, JPM LTCMA) suggest 9–10% nominal for global equities. The gap is intentional but worth flagging.
5. **Crypto 14% forward return is speculative.** The model uses a conservative long-run estimate; BTC's realised 5-year CAGR is multiples of this. Crypto return assumptions should be revisited periodically.
6. **No small-cap or factor premium.** The equity assumption is for a market-cap-weighted global ETF; factor tilts (value, small-cap) have historically added 1–2% but with higher tracking error.

---

*Last updated: April 2026. Maintained alongside `bicon-why-invest-journey-en.html` and `bicon-why-invest-journey-de.html`.*

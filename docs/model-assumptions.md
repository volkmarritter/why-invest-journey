# Why Invest Journey — Model Assumptions & Reality Check

This document captures the return, volatility, and correlation assumptions used in the interactive tool, with comparisons to historical data. Update whenever model inputs change.

---

## 1. Asset Class Assumptions

| Asset Class | Model Return | Model Vol | Historical Return¹ | Historical Vol¹ |
|---|---|---|---|---|
| Equities | 7.5% p.a. | 18% | ~10% (MSCI World USD, 1970–2024) | 15–17% |
| Bonds | 3.0% p.a. | 5% | ~4–5% (Bloomberg Global Agg, 1990–2024) | 4–6% |
| Satellites (blended) | 11.0% p.a. | 35% | See §3 | See §3 |
| Cash | 1.5% p.a. | ~0% | 1–4% (money market, varies by era) | ~0% |

¹ Nominal, approximate long-run averages; equity figures in USD, bond figures in EUR-hedged equivalent.

### Equities
- **7.5% nominal** is below the MSCI World historical ~10% (USD). The discount accounts for EUR base currency, forward valuation drag, and estimation conservatism.
- **18% vol** is a slight buffer above observed MSCI World annualised std. dev. of 15–17%.

### Bonds
- **3.0% nominal** reflects a blended global investment-grade portfolio at current yield levels (EUR IG ~3–4%). Raised from 2.5% in April 2026 after yield normalisation post-2022.
- **5% vol** is consistent with EUR aggregate bond index volatility (~4–6%).

### Cash
- **1.5% nominal** is a long-run assumption, intentionally below current ECB rates (~3.5%), which are cyclical. Cash vol ≈ 0 is treated as zero in the formula.

---

## 2. Correlation Matrix (Model vs. Historical)

| Pair | Model ρ | Historical ρ (approx.) | Notes |
|---|---|---|---|
| Equities / Bonds | 0.00 | −0.10 to +0.20 | Regime-dependent; negative 1998–2021, positive post-2022 |
| Equities / Satellites | +0.50 | REITs: 0.60–0.70 · BTC: 0.30–0.50 | Blended ~0.50 is reasonable for a REIT/crypto mix |
| Bonds / Satellites | +0.10 | REITs: 0.10–0.20 · BTC: ~0.05 | Low; model is conservative |

Full matrix used in the volatility formula:

|  | Eq | Bo | Sat | Ca |
|---|---|---|---|---|
| Equities | 1.00 | 0.00 | +0.50 | 0.00 |
| Bonds | — | 1.00 | +0.10 | 0.00 |
| Satellites | — | — | 1.00 | 0.00 |
| Cash | — | — | — | 1.00 |

**Volatility formula:**
```
σ = √( Σ wᵢ²·σᵢ² + 2·Σ wᵢwⱼ·σᵢσⱼ·ρᵢⱼ )
```
Cash is excluded (σ_cash = 0).

---

## 3. Satellite Assumptions — Detail & Limitations

The current model treats satellites as a **50/50 REIT / Crypto blend**.

| Component | Model Return | Model Vol | Historical Return | Historical Vol | Source |
|---|---|---|---|---|---|
| Listed Real Estate (REITs) | ~7.5–8% | ~18–22% | 8.4% (FTSE NAREIT, 1972–2024) | 18–22% | FTSE NAREIT |
| Crypto (BTC proxy) | ~14%† | ~60–70% | ~40–60% CAGR (2015–2024) | 60–80% | Various |
| **50/50 Blend (model)** | **11%** | **35%** | — | — | Internal estimate |

† Forward crypto return is highly uncertain. 14% is a conservative assumption relative to BTC's realised history; used solely to make the blended 11% figure internally consistent.

### Why 50/50 is a simplification

The Prompt Builder lets users choose their own REIT/crypto split. A 50/50 blend is therefore a rough midpoint, not a user-specific figure. The practical implications:

- **REIT-only satellite** → ~18% vol, ~7.5% return. The model's 35% vol overstates risk.
- **Crypto-only satellite** → 60–80%+ vol. The model's 35% vol understates risk significantly.
- **11% blended return** implies a ~14% crypto assumption, which is hard to defend in investor-facing copy without caveats.

**Open question:** Switch to REIT-only as the baseline assumption (18% vol, 7.5–8% return) and flag crypto as an add-on that raises both return and volatility sharply.

---

## 4. Reference Profiles — Allocations & Risk/Return

These are the four dots on the Ch1 risk-return scatter chart.

| Profile | Eq | Bo | Sat | Ca | Model Return | Model Vol | Sharpe† |
|---|---|---|---|---|---|---|---|
| Conservative | 30% | 65% | 0% | 5% | 4.3% | 6.3% | 0.44 |
| Balanced | 55% | 40% | 0% | 5% | 5.4% | 10.1% | 0.39 |
| Growth | 70% | 20% | 7% | 3% | 6.7% | 14.0% | 0.37 |
| Aggressive | 90% | 0% | 10% | 0% | 7.8% | 18.2% | 0.34 |

† Sharpe = (return − 1.5% cash) / vol. Declining Sharpe across risk levels is expected and realistic.

### Real-World Benchmarks

| Benchmark | Approx. Return | Approx. Vol | Period |
|---|---|---|---|
| MSCI World (100% equity, USD) | 10.4% | 15–17% | 1970–2024 |
| 60/40 Global (MSCI World / Barclays Agg) | 7–8% | 9–11% | 1990–2024 |
| Vanguard LifeStrategy 80 (GBP) | ~8–9% | ~13–15% | 2011–2024 |
| iShares Core MSCI World + 40% EUR Agg | ~6–7% (EUR) | ~10–12% | 2010–2024 |

**Assessment:** The model's Balanced (5.4% / 10.1%) and Growth (6.7% / 14.0%) profiles sit somewhat below real-world EUR 60/40 and 80/20 benchmarks. This is intentional conservatism — the tool is illustrative, not a performance projection.

---

## 5. Profile Classification Thresholds

Labels are based on **total risky assets = equities + satellites** (not equities alone).

| Label | Risky Asset Range | Horizon requirement in Prompt Builder |
|---|---|---|
| Capital preservation | < 20% | Any |
| Conservative | 20–39% | ≥ 3 years |
| Balanced | 40–59% | ≥ 5 years |
| Growth | 60–79% | ≥ 10 years |
| Aggressive | ≥ 80% | ≥ 10 years |
| Crypto-heavy ⚠️ | Satellites ≥ 25% | Overrides label (shown in coral) |

The horizon cap mirrors the Prompt Builder's hard constraint: Growth and Aggressive profiles require a minimum 10-year investment horizon.

---

## 6. Implied Sharpe Ratios (per asset class)

| Asset Class | Return | Cash (RF) | Vol | Sharpe |
|---|---|---|---|---|
| Equities | 7.5% | 1.5% | 18% | **0.33** |
| Satellites (blend) | 11.0% | 1.5% | 35% | **0.27** |
| Bonds | 3.0% | 1.5% | 5% | **0.30** |
| Cash | 1.5% | — | ~0% | — |

Equities have the best risk-adjusted return (0.33), followed closely by Bonds (0.30), then Satellites (0.27). The ranking is plausible: the satellite Sharpe being below equities reflects the blended crypto exposure dragging down the ratio.

---

## 7. Known Limitations & Open Questions

1. **Satellite blend is arbitrary.** 50/50 REIT/crypto is not user-configurable and will be wrong for most allocations. Consider REIT-only as the baseline.
2. **Static correlations.** In crises, correlations rise — equities and satellites tend to sell off together. The model does not account for regime shifts.
3. **No inflation adjustment.** All figures are nominal. Real returns subtract ~2–2.5% p.a.
4. **Bond return is rate-cycle sensitive.** 3.0% is appropriate today; will need revisiting if rates fall materially again.
5. **Equity 7.5% is EUR-adjusted conservatism.** USD-based studies (DMS, JPM LTCMA) suggest 9–10% nominal for global equities. The gap is intentional but worth flagging.
6. **No small-cap or factor premium.** The equity assumption is for a market-cap-weighted global ETF; factor tilts (value, small-cap) have historically added 1–2% but with higher tracking error.

---

*Last updated: April 2026. Maintained alongside `bicon-why-invest-journey-en.html` and `bicon-why-invest-journey-de.html`.*

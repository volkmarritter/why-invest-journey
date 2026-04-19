# Quiz scoring — test documentation

## How to run

```bash
node tests/quiz-scoring.test.js
```

No dependencies — plain Node.js. Output: pass/fail summary with details on any failures.

---

## Background — why these tests exist

The Ch 6 quiz computes a risk profile from four questions and deep-links the result to the Prompt Builder app at `bicon.li/prompt-builder`. Three bugs were found and fixed during development:

| # | Bug | Impact |
|---|---|---|
| 1 | EN quiz sent string values for `risk` (`buy`) and `income` (`volatile`) instead of integers | App didn't recognise the params; showed wrong profile |
| 2 | Journey score could produce Growth with a 5-year horizon; app hard-caps Growth/Aggressive at ≥10y | Journey and app showed different profiles for same inputs |
| 3 | `risk` URL param sent the raw quiz answer (e.g. `4` for "buy more"), which could contradict the computed profile (e.g. Balanced) | Internal inconsistency; app re-scored to wrong profile |

The tests lock these three fixes in place and cover all 1825 assertion paths.

---

## The quiz — inputs and scoring

The quiz has four questions. Each answer contributes a score delta:

| Question | Option | EN value | DE value | Score Δ |
|---|---|---|---|---|
| **01 Horizon** | ≥3 years | horizon=1 | horizon=1 | −25 |
| | ≥5 years | horizon=2 | horizon=2 | 0 |
| | ≥10 years | horizon=3 | horizon=3 | +20 |
| | Next generation | horizon=4 | horizon=4 | +35 |
| **02 Risk** | Sell immediately | panic | 1 | −25 |
| | Nervous, but waiting | *(not in EN)* | 2 | 0 |
| | Hold — plan is plan | hold | 3 | +5 |
| | Buy more | buy | 4 | +20 |
| **03 Income** | Rock solid / salary | stable | 1 | +10 |
| | Mostly stable | mixed | 2 | 0 |
| | Lumpy / commission | volatile | 3 | −10 |
| **04 Cash flow** | Yes — rely on distributions | yes | 1 | −15 |
| | Occasionally | sometimes | 2 | 0 |
| | No — pure accumulation | no | 3 | +10 |

### Scoring formula

```
e = 50  (base)
+ horizon delta
+ risk delta
+ income delta
+ cashflow delta
clamped to [10, 95]
```

### Horizon cap (mirrors Prompt Builder app)

The app hard-caps profiles by investment horizon. After clamping, the rank is additionally constrained:

| Horizon | Max profile |
|---|---|
| 1 (≥3y) | Conservative (rank 1) |
| 2 (≥5y) | Balanced (rank 2) |
| 3 (≥10y) | no cap |
| 4 (next gen) | no cap |

### Profile thresholds

| Score | Rank | Profile | Equity range | `risk` param |
|---|---|---|---|---|
| < 40 | 1 | Conservative | 20–40% | 1 |
| 40–59 | 2 | Balanced | 40–60% | 2 |
| 60–79 | 3 | Growth | 60–80% | 3 |
| ≥ 80 | 4 | Aggressive | 80–100% | 4 |

> **Key invariant:** the `risk` URL param always equals the final profile rank — not the raw quiz answer. This keeps `profile`, `equity`, and `risk` internally consistent for the app.

---

## URL param contract

```
https://bicon.li/prompt-builder/?profile=<slug>&equity=<int>&horizon=<1..4>
  &risk=<rank>&income=<1..3>&cashflow=<en-string|de-int>&src=why-journey&lang=<en|de>
```

| Param | EN | DE |
|---|---|---|
| `profile` | slug derived from rank | same |
| `equity` | 30 / 50 / 70 / 90 | same |
| `horizon` | integer 1–4 | same |
| `risk` | = profile rank (1–4) | same |
| `income` | mapped to int: stable→1, mixed→2, volatile→3 | integer from data-v |
| `cashflow` | string: yes / sometimes / no | integer: 1 / 2 / 3 |
| `src` | `why-journey` | same |
| `lang` | `en` | `de` |

---

## Test structure

The test file (`tests/quiz-scoring.test.js`) is self-contained plain JS with no framework. It mirrors the scoring logic from both HTML files and runs assertions against expected outputs.

### Section 1 — EN spot checks (7 cases, 28 assertions)

Named cases covering the three original bugs and boundary conditions:

| Case | horizon | risk | income | cashflow | Raw score | Capped profile | `risk` param |
|---|---|---|---|---|---|---|---|
| Original bug | 2 | buy | volatile | no | 70 → capped | Balanced | 2 |
| h=3 buy volatile yes | 3 | buy | volatile | yes | 65 | Growth | 3 |
| Ceiling clamp | 4 | buy | stable | no | 95 | Aggressive | 4 |
| Horizon-1 cap | 1 | buy | stable | no | 65 → capped | Conservative | 1 |
| Horizon-2 cap | 2 | hold | stable | no | 75 → capped | Balanced | 2 |
| Growth boundary | 3 | hold | mixed | sometimes | 75 | Growth | 3 |
| Floor clamp | 1 | panic | volatile | yes | 10 | Conservative | 1 |

### Section 2 — EN exhaustive (108 combinations, ~900 assertions)

Runs all 4×3×3×3 input combinations. Per combination asserts:
- Score clamped to [10, 95]
- Profile slug is one of the four valid values
- Equity is one of {30, 50, 70, 90}
- `risk` param is a valid rank (1–4)
- `income` param is an integer in {1, 2, 3}
- `cashflow` string is one of `yes / sometimes / no`
- Horizon cap: h=1 → rank must be 1; h=2 → rank must be ≤ 2

### Section 3 — DE spot checks (5 cases, 15 assertions)

Equivalent of the EN spot checks using DE integer inputs:

| Case | horizon | risk | income | cashflow | Raw score | Capped profile |
|---|---|---|---|---|---|---|
| Original bug | 2 | 4 | 3 | 3 | 70 → capped | Balanced |
| h=3 buy volatile yes | 3 | 4 | 3 | 1 | 65 | Growth |
| Ceiling clamp | 4 | 4 | 1 | 3 | 95 | Aggressive |
| Horizon-1 cap | 1 | 4 | 1 | 3 | 65 → capped | Conservative |
| Floor clamp | 1 | 1 | 3 | 1 | 10 | Conservative |

### Section 4 — DE exhaustive (144 combinations, ~720 assertions)

Runs all 4×4×3×3 input combinations (DE has a 4th risk option — "nervous"). Same assertions as EN exhaustive, adapted for integer inputs.

### Section 5 — EN↔DE parity (108 mapped pairs, 324 assertions)

For every EN input combination, maps it to the equivalent DE integers and asserts:
- Raw score is identical in both formulas
- Final profile (after horizon cap) is identical
- `risk` param (rank) is identical

This section detects any drift between `maybeShowProfile()` (EN) and `scoreProfile()` (DE).

---

## When to update the tests

| Change | What to update |
|---|---|
| Scoring weight or threshold | Update `enScore()` and/or `deScore()`, fix any failing spot checks |
| Horizon cap values | Update `HORIZON_CAP`, fix horizon-cap assertions |
| New quiz option (e.g. a 4th risk answer in EN) | Add to the input arrays, update spot checks |
| URL param contract change | Update the assertions in exhaustive sections |
| EN and DE scoring drift | The parity section will catch it automatically |

# Quiz scoring tests

## Run

```bash
node tests/quiz-scoring.test.js
```

No dependencies — plain Node.js.

## What is tested

The test suite validates the Ch 6 quiz scoring logic in both `bicon-why-invest-journey-en.html` and `bicon-why-invest-journey-de.html` against the deep-link contract with the Prompt Builder app.

### Coverage

| Section | Combinations | Assertions |
|---|---|---|
| EN spot checks | 7 named cases | 28 |
| EN exhaustive | 108 (4×3×3×3) | 756 + 54 horizon-cap checks |
| DE spot checks | 5 named cases | 15 |
| DE exhaustive | 144 (4×4×3×3) | 720 + 36 horizon-cap checks |
| EN↔DE parity | 108 mapped pairs | 216 |

Total: **~1619 assertions**.

### What each assertion checks

**Score validity**
- Raw score is clamped to [10, 95] before ranking.

**Horizon cap** (mirrors the Prompt Builder app's hard constraint)
- `horizon=1` (≥3y) → profile is always Conservative, regardless of score.
- `horizon=2` (≥5y) → profile is at most Balanced, regardless of score.
- `horizon=3/4` → no additional cap; score decides between Growth and Aggressive.

**Profile correctness**
- Profile slug is one of `conservative / balanced / growth / aggressive`.
- Equity value is one of `30 / 50 / 70 / 90`.
- Profile name is consistent with the score bracket.

**URL param contract**
- EN: `risk` and `income` are mapped to integers before building the URL (`panic→1`, `hold→3`, `buy→4`; `stable→1`, `mixed→2`, `volatile→3`). `cashflow` stays as strings (`yes/sometimes/no`).
- DE: `risk`, `income`, and `cashflow` are all integers natively (data-v coerced with `+`).

**EN↔DE parity**
- For every EN input combination, the equivalent DE integer inputs produce the same raw score and the same final profile. Ensures both scoring functions stay in sync.

## Spot-check cases

| Case | horizon | risk | income | cashflow | Expected profile |
|---|---|---|---|---|---|
| Original bug (screenshot) | 2 (5yr) | buy | volatile | no | Balanced *(was Growth before horizon cap)* |
| Horizon-1 cap | 1 (3yr) | buy | stable | no | Conservative *(score=65, capped)* |
| Horizon-2 cap | 2 (5yr) | hold | stable | no | Balanced *(score=75, capped)* |
| Growth possible | 3 (10yr) | hold | mixed | sometimes | Growth |
| Aggressive | 3 (10yr) | buy | volatile | no | Aggressive |
| Floor clamp | 1 (3yr) | panic | volatile | yes | Conservative *(score clamped to 10)* |
| Ceiling clamp | 4 (next-gen) | buy | stable | no | Aggressive *(score clamped to 95)* |

## Scoring formula reference

```
e = 50 (base)
+ horizon:  1→−25  2→0  3→+20  4→+35
+ risk:     1→−25  2→0  3→+5   4→+20
+ income:   1→+10  2→0  3→−10
+ cashflow: 1/yes→−15  2/sometimes→0  3/no→+10
clamped to [10, 95]

horizon cap: h=1→max rank 1  h=2→max rank 2  h=3/4→max rank 4
rank: <40→1(Conservative)  <60→2(Balanced)  <80→3(Growth)  else→4(Aggressive)
```

## When to update tests

- Any change to scoring weights or thresholds in `maybeShowProfile()` (EN) or `scoreProfile()` (DE).
- Any new quiz option added.
- Any change to the deep-link URL param contract.
- Any change to the horizon cap.

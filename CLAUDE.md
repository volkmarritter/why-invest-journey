# Why Invest Journey — project context for Claude Code

This file gives Claude Code the context it needs to work on this repo productively.
Short and operational on purpose.

## What this repo is

An interactive, editorial-style scrollytelling prototype that explains *why* the
Bicon Portfolio Prompt Builder (`https://bicon.li/prompt-builder/`) recommends
what it recommends. Aimed at curious private investors. Two single-file,
zero-build HTML deliverables that the Bicon app calls based on user locale.

Live: <https://volkmarritter.github.io/why-invest-journey/>

## File map

```
bicon-why-invest-journey-en.html   EN deliverable, standalone, no build
bicon-why-invest-journey-de.html   DE deliverable, kept in lockstep with EN
index.html                         GitHub Pages landing: redirects by navigator.languages, ?lang= override
og-image.png                       1200x630 editorial social card
robots.txt, sitemap.xml            SEO wiring with hreflang alternates
README.md                          Public-facing overview
bicon-concept-brief.md             Original concept doc
.github/workflows/pages.yml        Auto-deploys main -> GitHub Pages on push
```

## Golden rule

**Every edit to an EN file must be mirrored in the DE file (and vice versa).**
The two files must have the same six chapters, same callouts, same JS behaviour,
same chart data. Only the language and locale-specific formatting (de-DE number
format, „…" quotes, German profile labels) differ.

## Chapter structure (both files)

```
Hero                  "Why invest like this?" kicker + 5 min read chip + stats meta row
Ch 1: SAA             Allocation sliders + Chart.js donut + rebalancing callout
Ch 2: ETFs            500-dot ownership grid + 10/20/30y cost chart + inflation + home-bias callouts
Ch 3: Stock picking   SPIVA bars + 10-ticker mini-game with INDEX_REF vs MSCI World
Ch 4: Market timing   Missing-best-days chart + drawdown grid + Peter Lynch callout
Ch 5: Compounding     4-slider calculator + stacked area chart + PNG/text export
Ch 6: Your profile    4-question quiz (horizon ≥3/5/10y/next-gen · crash reaction · income stability · cash withdrawal need) → 4-profile result with equity range + exclusions → deep-link to Prompt Builder
Sources               Numbered references list + MiFID II / FIDLEG disclaimer
Final CTA             "To the app" / "Zur App" button
```

## Design tokens (keep these consistent)

```
--ink     #141210   --coral   #FF6B5B
--cream   #F4EEE4   --mustard #E8B84A
--paper   #FBF7F0   --forest  #2D5D3A
--muted   #7A6F62   --plum    #6B3FA0
--line    #d9cfbf   --sky     #3E8EDE

Serif:  'Fraunces' (Google Fonts)
Sans:   'Inter'    (Google Fonts)

Highlight utilities: .mark-coral / .mark-mustard / .mark-plum
Callout variants:    .callout, .callout.forest, .callout.mustard, .callout.plum
```

Editorial voice (not banking voice): short sentences, confident, a dry joke is
fine. Avoid jargon when a plain word works. Italics for emphasis, not bold.

## Deep-link contract (Ch 6 -> Prompt Builder)

The quiz builds a URL like:

```
https://bicon.li/prompt-builder/?profile=<slug>&equity=<int>&horizon=<1..4>&risk=<1..4>&income=<1..3>&cashflow=<yes|sometimes|no>&src=why-journey&lang=<en|de>
```

| Param    | Values                                                                              |
|----------|-------------------------------------------------------------------------------------|
| profile  | conservative / balanced / growth / aggressive                                       |
| equity   | 30 / 50 / 70 / 90                                                                   |
| horizon  | 1 (≥3y) / 2 (≥5y) / 3 (≥10y) / 4 (next generation)                                 |
| risk     | 1 (sell now) / 2 (nervous) / 3 (stay) / 4 (buy more)                               |
| income   | 1 (stable) / 2 (mixed) / 3 (lumpy) — earned income stability                       |
| cashflow | yes / sometimes / no (EN) · 1 / 2 / 3 (DE) — portfolio withdrawal need             |
| src      | always `why-journey`                                                                |
| lang     | `en` or `de`                                                                        |

Profiles match the builder config (config.js). Each profile exposes an equity
range and default exclusions in the result card.

Both files use the same equity-point scoring system. Keep them identical:

```
e = 50 (base)
+ horizon:  1→−25  2→0  3→+20  4→+35
+ risk:     1→−25  2→0  3→+5   4→+20   (EN uses panic/hold/buy strings; DE uses 1–4 ints)
+ income:   stable/1→+10  mixed/2→0  volatile/3→−10
+ cashflow: yes/1→−15  sometimes/2→0  no/3→+10
clamped 10–95 → raw rank: <40 conservative · <60 balanced · <80 growth · else aggressive
then horizon cap applied: h=1→max conservative · h=2→max balanced · h=3/4→no extra cap
```

The horizon cap mirrors the Prompt Builder app's hard constraint (Growth/Aggressive require ≥10y).

EN uses `maybeShowProfile()` with string values; DE uses `scoreProfile()` with int values.
If you change weights or thresholds, update both functions **and** run `node tests/quiz-scoring.test.js`.

### Quiz question → scoring → app profile mapping

| Question | EN option | DE option | Score Δ | URL param (both) |
|---|---|---|---|---|
| **01 Horizon** | 3 years or more | ≥3 Jahre | −25 | `horizon=1` |
| | 5 years or more | ≥5 Jahre | 0 | `horizon=2` |
| | 10 years or more | ≥10 Jahre | +20 | `horizon=3` |
| | Next generation | Nächste Generation | +35 | `horizon=4` |
| **02 Risk** | …sell. I can't stomach it. | Verkaufen | −25 | EN `risk=1` · DE `risk=1` |
| | *(not in EN)* | Abwarten und hoffen | 0 | DE `risk=2` only |
| | …hold. It hurts, but I wait. | Abwarten | +5 | EN `risk=2` · DE `risk=3` |
| | …buy more. Sales are for shopping. | Nachkaufen | +20 | EN `risk=3` · DE `risk=4` |
| **03 Income** | Rock solid. Salary or pension. | Sehr stabil | +10 | `income=1` |
| | Mostly stable, some variability. | Überwiegend stabil | 0 | `income=2` |
| | Lumpy. Business-owner or commission-based. | Unregelmäßig | −10 | `income=3` |
| **04 Cash flow** | Yes — I rely on distributions. | Ja | −15 | `cashflow=yes` / `1` |
| | Occasionally, but not essential. | Gelegentlich | 0 | `cashflow=sometimes` / `2` |
| | No — pure accumulation. | Nein | +10 | `cashflow=no` / `3` |

> EN `cashflow` passes strings (`yes/sometimes/no`); DE passes integers (`1/2/3`).
> All other URL params are integers in both locales.

### Journey result vs Prompt Builder app — profile boundaries

| Profile | Journey score range (after cap) | App min horizon | App risk appetite | Equity range |
|---|---|---|---|---|
| Conservative | < 40 · or horizon=1 regardless of score | ≥3 years | Low | 20–40% |
| Balanced | 40–59 · or horizon=2 regardless of score | ≥5 years | Moderate | 40–60% |
| Growth | 60–79 · requires horizon ≥3 | ≥10 years | High | 60–80% |
| Aggressive | ≥80 · requires horizon ≥3 | ≥10 years | Very high | 80–100% |

## Analytics stub

Every file exposes `window.bicon.track(event, props)` which pushes into
`window.dataLayer` if present, otherwise logs with `console.debug`. Page tag
differs per locale (`why-journey-en` / `why-journey-de`). Events fired:
`page_view`, `scroll_depth` (25/50/75/100), `chapter_view`, `stock_pick`,
`profile_scored`, `plan_image_saved`, `plan_text_copied`.

Do not remove the stub. If you add a new interaction, add a corresponding
`track()` call.

## Accessibility baseline

- All CSS animations respect `prefers-reduced-motion` (block at top of `<style>`).
- Charts have visible captions.
- Focus rings on interactive buttons — do not remove.

## Dev / preview

No build step. From the repo root:

```bash
python3 -m http.server 8000    # or: npx serve
```

Open `http://localhost:8000/`.

## Commit conventions

- Imperative mood, sentence-case subject, < 72 chars.
- Scope in subject only when useful: `Ch3 picker: add NVDA as outcome`.
- Body: what + why, not how.
- Keep EN+DE changes in the same commit when they are a pair.
- One commit per coherent change. No WIP commits on `main`.

## Deployment

- Push to `main` triggers `.github/workflows/pages.yml`.
- Pages site: <https://volkmarritter.github.io/why-invest-journey/>.
- Stray `.github/workflows/blank.yml` has been removed.

## Known sharp edges

- The bundle file `why-invest-journey.bundle` is a transport artefact and is
  gitignored. Don't add it back.
- Dropbox-synced working copies can lock files and confuse git. Always work in
  `C:\git\why-invest-journey` or similar non-synced path.
- The journey references sources (SPIVA, Morningstar, JPM, DMS, Brinson,
  Bessembinder) — if numbers are updated, update both files and the
  `<section class="refs">` list.

## Embedding in the Bicon app

Call the file that matches the user's locale:

```html
<!-- EN -->
<a href="https://volkmarritter.github.io/why-invest-journey/bicon-why-invest-journey-en.html">Why invest like this?</a>
<!-- DE -->
<a href="https://volkmarritter.github.io/why-invest-journey/bicon-why-invest-journey-de.html">Warum so investieren?</a>
```

The "To the app" / "Zur App" buttons in each file point at `https://bicon.li/prompt-builder/`.

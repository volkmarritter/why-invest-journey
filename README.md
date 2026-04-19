# Why Invest — A Journey for Curious Investors

An interactive, editorial-style scrollytelling prototype explaining *why* the
[**Bicon Portfolio Prompt Builder**](https://bicon.li/prompt-builder/) suggests
the kind of portfolios it suggests. Aimed at affluent private investors who want
to understand the reasoning — not just receive a recommendation.

Two single-file deliverables, no build step:

| Language | File | Status |
|---|---|---|
| English | [`bicon-why-invest-journey-en.html`](./bicon-why-invest-journey-en.html) | ready |
| Deutsch | [`bicon-why-invest-journey-de.html`](./bicon-why-invest-journey-de.html) | ready |

A small landing page, [`index.html`](./index.html), auto-detects browser
language and redirects to the right file — handy when the repo is published via
GitHub Pages.

---

## What's inside the journey

The user scrolls through six chapters, each with at least one interactive element:

1. **Strategic Asset Allocation** — draggable allocation sliders feeding a live
   donut chart, expected return and a volatility hint. Rebalancing callout.
2. **Why ETFs** — 500-dot "you own all of them" grid, cost-erosion chart with
   10 / 20 / 30 year toggles, inflation and home-bias callouts.
3. **The stock-picking trap** — SPIVA bars (1/5/10/20 years) and a mini-game of
   ten tickers where the outcome (winner / loser / shrugging emoji) is revealed
   after you pick, plus a reference to the MSCI World benchmark.
4. **Market timing** — "missing the best days" chart with 0/10/20/30-best-days
   toggles, three historical drawdowns (2000–02, 2008, 2020), Peter Lynch
   callout.
5. **Compounding** — live compound calculator with four sliders (start, monthly,
   years, rate), stacked area chart separating contributions from gains, and two
   plan-export buttons (**Save plan as image** → PNG, **Copy summary** → clipboard).
6. **Your profile** — a 30-second three-question quiz that produces one of five
   profiles (Capital Preservation → Aggressive Growth) and a **deep-linked
   button to the Prompt Builder** pre-loaded with the user's answers.

Finally, a **sources list** and a proper MiFID II / FIDLEG-style disclaimer.

Tech choices: Fraunces + Inter via Google Fonts, Chart.js 4.4 via jsDelivr,
vanilla JS, `IntersectionObserver` for reveal + chapter-in-view analytics,
`prefers-reduced-motion` respected everywhere.

---

## Embedding in the Bicon app

Call the file that matches the user's locale:

```html
<!-- EN -->
<a href="/why-invest-journey/bicon-why-invest-journey-en.html">Why invest like this?</a>

<!-- DE -->
<a href="/why-invest-journey/bicon-why-invest-journey-de.html">Warum so investieren?</a>
```

Each file ships with a single **"← Back to app"** / **"← Zurück zur App"**
button in both the header and footer, pointing at
`https://bicon.li/prompt-builder/`. No in-page language switcher — routing is
the app's responsibility.

### Deep-link handoff from Chapter 6

When the user completes the profile quiz, the **"Open in Prompt Builder →"**
button opens a URL shaped like:

```
https://bicon.li/prompt-builder/?profile=balanced&equity=55&horizon=3&risk=3&income=3&src=why-journey&lang=en
```

Query params the builder should be prepared to read:

| Param | Values | Meaning |
|---|---|---|
| `profile` | `capital-preservation` \| `conservative` \| `balanced` \| `growth` \| `aggressive-growth` | Suggested risk profile |
| `equity` | `15`…`90` | Suggested equity share in percent |
| `horizon` | `1`…`4` | Quiz answer: 2–3y / 4–7y / 8–15y / 15+y |
| `risk` | `1`…`4` | Quiz answer on a −30% drawdown reaction |
| `income` | `1`…`3` | Need for current income (1 = yes, 3 = pure growth) |
| `src` | `why-journey` | Attribution |
| `lang` | `en` \| `de` | Locale |

Analytics stub: every file exposes `window.bicon.track(event, props)` which
pushes into `window.dataLayer` if present, otherwise logs to the console. Events
fired: `page_view`, `scroll_depth` (25/50/75/100), `chapter_view`, `stock_pick`,
`profile_scored`, `plan_image_saved`, `plan_text_copied`.

---

## Publishing as a GitHub Pages site (optional)

1. Push this repo to GitHub.
2. In **Settings → Pages**, select **Deploy from a branch** → `main` / `/ (root)`.
3. The landing page at `/` detects browser language and redirects to the matching file.

---

## Local preview

No build step. Just:

```bash
python3 -m http.server 8000
# or
npx serve
```

Then open <http://localhost:8000/>.

---

## Disclaimer

Educational concept prototype. Not investment advice, not a recommendation, and
not an offer to buy or sell financial instruments in the sense of MiFID II (EU)
or FIDLEG (CH). All figures are illustrative. Historical returns are not a
reliable indicator of future performance.

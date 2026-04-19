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
LICENSE                            MIT (code only; editorial copy excluded)
bicon-concept-brief.md             Original concept doc
.github/workflows/pages.yml        Auto-deploys main -> GitHub Pages on push
.github/workflows/blank.yml        Stray template workflow (safe to remove)
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
Ch 6: Your profile    3-question quiz -> deep-link to Prompt Builder
Sources               Numbered references list + MiFID II / FIDLEG disclaimer
Final CTA             "Back to app" button
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
https://bicon.li/prompt-builder/?profile=<slug>&equity=<int>&horizon=<1..4>&risk=<1..4>&income=<1..3>&src=why-journey&lang=<en|de>
```

| Param    | Values                                                                              |
|----------|-------------------------------------------------------------------------------------|
| profile  | capital-preservation / conservative / balanced / growth / aggressive-growth         |
| equity   | 15 / 30 / 55 / 75 / 90                                                              |
| horizon  | 1 (2–3y) / 2 (4–7y) / 3 (8–15y) / 4 (15+y)                                          |
| risk     | 1 (sell now) / 2 (nervous) / 3 (stay) / 4 (buy more)                                |
| income   | 1 (need income) / 2 (some) / 3 (pure growth)                                        |
| src      | always `why-journey`                                                                |
| lang     | `en` or `de`                                                                        |

If you change quiz logic in one file, change it in the other, and keep the
scoring thresholds in `scoreProfile()` identical.

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
- The stray `.github/workflows/blank.yml` can be deleted in a one-line cleanup commit.

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

The "Back to app" buttons in each file point at `https://bicon.li/prompt-builder/`.

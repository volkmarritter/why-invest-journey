# Bicon Prompt Builder — "Why Invest This Way" Journey
### Concept brief accompanying the interactive prototype

---

## 1. The opportunity

Today `bicon.li/portfolio-prompt-builder/` and `bicon.li/prompt-builder/` are transactional tools: the user states goals and constraints, and a portfolio comes out. For a **private investor who is new to evidence-based investing**, the tool works — but the *why* is missing.

This concept adds a **persuasive, scroll-telling side journey** — an editorial, NYT/Pudding-style narrative — that convinces an investor *before* they ever touch a slider. It sits alongside the existing builder as a soft, brand-building on-ramp rather than replacing anything.

## 2. Where it lives in the site architecture

```
bicon.li/
├── portfolio-prompt-builder/        (existing — transactional)
├── prompt-builder/                  (existing — app)
└── why/  ← NEW ("Why invest this way")
    └── One long scroll experience → ends with CTA into /prompt-builder/
```

Suggested entry points:
- New top-nav item **"Why"** or **"The Case"**.
- A hero link on `/portfolio-prompt-builder/` for first-time visitors: *"First time here? 5 minutes to learn why this works →"*.
- Step 1 of the prompt builder gets a soft CTA: *"Not sure why we're asking this? See the story."*
- A post-onboarding email/PDF export of the same journey for advisors to send to prospects.

## 3. The five-chapter narrative

| # | Chapter | Core argument | Signature visual |
|---|---|---|---|
| 01 | **Strategic Asset Allocation** | The single biggest decision is the mix — ~90% of return variability (Brinson). | Live donut + risk profile that recomputes expected return as you drag sliders. |
| 02 | **Why ETFs** | Wide diversification, tiny TER, liquidity, transparency. Fees silently eat 1/3 of wealth over 30 years. | 500-dot grid that fills in ("own the whole market in one click") + cost-erosion line chart with 10/20/30-year toggle. |
| 03 | **Why not stock picking** | 85%+ of active managers underperform over 10y. Survivorship bias. Concentration risk. | Animated SPIVA bar race + "Pick the next winner" mini-game with real outcomes (AAPL, WDI/Wirecard, GME, GE, NOK…). |
| 04 | **Why market timing fails** | Missing the 10 best days in 20 years roughly halves your return. Best days cluster next to worst. | Interactive "Missed 0/10/20/30 best days" chart toggle + two hero stat cards. |
| 05 | **How wealth compounds** | Time × sensible portfolio × patience = exponential tail. | Live compounding calculator with stacked contributions vs. compound gains area chart. |

Each chapter ends with a **pull quote** (Bogle, Brinson, an Einstein wink) to give the narrative rhythm.

## 4. Design principles

The prototype is deliberately **not banking style**. Decisions:

- **Typography**: Fraunces (editorial serif) for headlines, Inter for body. Large, italic accents, highlighter-style marks on key words.
- **Palette**: cream paper `#F4EEE4`, ink black, coral `#FF6B5B`, mustard, forest, plum. Warm and magazine-like, not corporate blue.
- **Rhythm**: alternate cream → white → ink-black sections to pace the reader. Blobs, grain, subtle animation.
- **Interaction over reading**: every chapter has *one thing you can touch*. Sliders, toggles, a game, a calculator. The user *feels* the lesson.
- **Credibility anchors**: every claim cites a source label (Brinson, SPIVA, Bogle) — illustrative disclaimers at the bottom of each chart so compliance is happy.
- **Mobile first**: all grids collapse; charts re-render on resize; sticky chapter chips in the top nav for wayfinding.

## 5. Technical implementation notes

The prototype is a **single-file HTML** — easy to drop into the existing WordPress/whatever CMS behind bicon.li as a full-bleed page template.

- Chart.js for charts (already CDN-based, ~70 kB).
- IntersectionObserver for reveal-on-scroll and bar-race animations.
- No external CSS framework; ~300 lines of custom CSS using design tokens.
- Zero backend dependencies — fully static, cache-friendly, localisable.

For production I'd recommend:
- **Localisation**: DE / EN / FR / IT from day one (Liechtenstein / DACH / cross-border market).
- **Analytics hooks**: chapter-scroll-depth, mini-game plays, calculator parameter distributions → feeds product insight.
- **A/B test the entry point**: direct `/prompt-builder/` vs. `/why/ → /prompt-builder/` for first-session conversion and 30-day retention.
- **PDF export** of the journey, pre-filled with the user's prompt-builder answers, as a leave-behind for advisors.

## 6. Recommended next steps

1. **Approve the narrative & tone** on the prototype.
2. **Swap illustrative numbers** for Bicon's vetted data and compliance-approved SPIVA / MSCI series.
3. **Commission 5 custom illustrations** (one per chapter) from an editorial illustrator — a signature brand asset.
4. **Wire the CTAs** to the actual `/prompt-builder/` with UTM tagging so you can measure lift.
5. **Translate** to DE first, then FR / IT.
6. **Soft launch** as a blog-linked "manifesto" page, measure scroll depth + conversion, iterate.

---

*Prototype file: `bicon-why-invest-journey.html` — open in a browser. All numbers are illustrative for concept review. Not investment advice.*

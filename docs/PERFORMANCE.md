# Performance

**The rule: 100 in all four Lighthouse categories, and the reading conditions below. A change that
drops any of them does not ship.**

Performance, Accessibility, Best Practices, SEO. Not "90-something", not "green". The site is a
static page of text with no framework, no CMS and no client JS beyond analytics — there is no
excuse available, and the moment a 98 is acceptable the next 98 is too.

## Current

Emulated Moto G Power, Slow 4G throttling, Lighthouse 13.4.1, `https://andredreyer.com/`.

| Category | Score | Captured |
| --- | --- | --- |
| Performance | **100** | 2026-09-07 |
| Accessibility | **100** | 2026-09-07 |
| Best Practices | **100** | 2026-09-07 |
| SEO | **100** | 2026-09-07 |
| Agentic Browsing | 3/3 | 2026-09-07 |

Metrics, from the 2026-09-06 capture. The run that produced the four scores above reported the
category totals only, so these are last known rather than current — replace them from a run that
shows them, and do not copy today's date onto them.

| Metric | Value | Captured |
| --- | --- | --- |
| First Contentful Paint | 0.8s | 2026-09-06 |
| Largest Contentful Paint | 1.7s | 2026-09-06 |
| Total Blocking Time | 30ms | 2026-09-06 |
| Cumulative Layout Shift | 0.013 | 2026-09-06 |
| Speed Index | 1.0s | 2026-09-06 |

The four scores above cover everything shipped on 2026-09-06 and 2026-09-07: the composition and
craft batch, the Open Graph cards, the styled feed, the 404 and the index numerals. So the budget
has been held across five design commits rather than merely set.

**Agentic Browsing** is PageSpeed's newer category and is not part of the rule as written. It passes
3/3 today. Recorded because it is measured, not because it is a target.

**The Chrome User Experience Report has no field data for this site**, and says so on the report. It
needs real visitor traffic before it reports anything, and its absence does not affect the score —
the lab run is the whole number. An empty Core Web Vitals panel is not a failure.

## The reading conditions

The score is the floor, not the measure. It is taken on one route with very little content, at one
viewport, by a machine that does not read — so on its own it will happily certify a page nobody can
read comfortably. On 2026-09-08 it did exactly that: a section heading was rendering smaller than the
paragraph it headed, and the measure ran to 89 characters on every laptop. Both cost zero Lighthouse
points. Both had been shipping for weeks.

These bind at every width, not only the one the layout was composed for.

| Condition | Where it is set |
| --- | --- |
| The measure stays inside 45–75 characters | `--measure`, stepped at `40rem` |
| A section heading is never smaller than the body it heads | `--fs-h2` ≥ 1.15× `--fs-body` |
| Evidence is never the smallest text on the page | `--fs-artefact` |
| Anything a reader acts on clears a 44px target | index titles, nav |
| Every listing exposes headings | `PostEntry` renders `h2` |
| Every state a screen reader gets is visible too | `aria-current` has a visible style |

## How to measure

Lighthouse needs Chrome, which the dev container does not have, so this cannot run from an agent
session. It is a step André takes.

```
https://pagespeed.web.dev/analysis?url=https://andredreyer.com
```

Or with Chrome locally:

```bash
npx lighthouse https://andredreyer.com --output=json --output=html \
  --output-path=/workspace/tmp/lh-$(date +%Y%m%d-%H%M) --view
```

Measure the deployed site, not a local preview: throttling, compression and caching all differ, and
the number that matters is the one a reader gets.

## Process

**One change, measured.** The 2026-09-06 session shipped a fix on Lighthouse's own recommendation
without a baseline, learned nothing from it, and cost a deploy cycle. The revert that followed
worked because it moved exactly one variable against a known number.

A change that plausibly touches paint, bytes on the critical path, or the document head gets a
before number and an after number. Everything else can ride along.

## What is known to be expensive

Written down because each of these cost a real afternoon.

- **Procedural graphics at paint time.** `feTurbulence` cost **2.8 seconds of Speed Index** and two
  points, while First Contentful Paint and Largest Contentful Paint did not move at all. That
  signature — the critical path clean, the page slow to *finish* — means raster-thread work, and
  Total Blocking Time will not show it. See "A textured ground" in [DESIGN.md](DESIGN.md).
- **Anything that defers first paint.** Six blank filmstrip frames is the tell. Read the filmstrip
  before reading the insights; Lighthouse's suggestions are ranked by its own model, not by what is
  actually hurting this page.

## What is known to be fine

Also written down, because both looked guilty and were not.

- **The stylesheet, inlined.** ~9KB in the document rather than a second request. Removing the
  render-blocking request made that audit pass and moved the score by zero.
- **163KB of preloaded fonts.** `newsreader-latin.woff2` alone is 132KB, roughly 26x the gzipped
  document, and looks damning next to it. At a Speed Index of 1.0s it is plainly not the problem.
  Do not re-litigate this without a measurement.

## Where personality can still live

The rule constrains where the site can be given character, which is a design question and belongs
in [DESIGN.md](DESIGN.md). The performance half of it:

- **Free on the page** — typography, composition, the hairlines, copy, `::selection`. CSS the site
  already ships, costing a few hundred bytes inside an already-inlined stylesheet.
- **Free because Lighthouse never sees it** — the print stylesheet, the Open Graph cards, the styled
  RSS feed and the 404, all now shipped. Lighthouse scores the rendered article page: print media is
  not evaluated at all, the cards are static files no page loads, an XSL result is not a page it
  loads either, and the 404 is not the audited route. Only the favicon is left, and it is already
  good.
- **Costs a budget** — raster images, motion, anything computed at paint time, any client JS. Not
  forbidden, but it comes with a before-and-after number or it does not ship.

# Performance

**The rule: 100 in all four Lighthouse categories. A change that drops any of them does not ship.**

Performance, Accessibility, Best Practices, SEO. Not "90-something", not "green". The site is a
static page of text with no framework, no CMS and no client JS beyond analytics — there is no
excuse available, and the moment a 98 is acceptable the next 98 is too.

## Current

Emulated Moto G Power, Slow 4G throttling, Lighthouse 13.4.1, `https://andredreyer.com/`.

| Category | Score | Captured |
| --- | --- | --- |
| Performance | **100** | 2026-09-06 |
| Accessibility | not yet captured | — |
| Best Practices | not yet captured | — |
| SEO | not yet captured | — |

| Metric | Value |
| --- | --- |
| First Contentful Paint | 0.8s |
| Largest Contentful Paint | 1.7s |
| Total Blocking Time | 30ms |
| Cumulative Layout Shift | 0.013 |
| Speed Index | 1.0s |

The three uncaptured categories are uncaptured, not assumed. Fill them in from a real run; do not
write a number here that nobody has seen.

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
- **Free because Lighthouse never sees it** — the print stylesheet, Open Graph images, the RSS
  feed, the favicon, `/404`. Lighthouse scores the rendered article page; none of these are on it.
- **Costs a budget** — raster images, motion, anything computed at paint time, any client JS. Not
  forbidden, but it comes with a before-and-after number or it does not ship.

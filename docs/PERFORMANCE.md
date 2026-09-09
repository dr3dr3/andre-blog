# Performance

**The rule: 100 in all four Lighthouse categories, and the reading conditions below. A change that
drops any of them does not ship.**

Performance, Accessibility, Best Practices, SEO. Not "90-something", not "green". The site is a
static page of text with no framework, no CMS and no client JS beyond analytics — there is no
excuse available, and the moment a 98 is acceptable the next 98 is too.

## Current

Emulated Moto G Power, Slow 4G throttling, Lighthouse 13.4.1, `https://andredreyer.com/`.

| Category | Mobile | Desktop | Captured |
| --- | --- | --- | --- |
| Performance | **100** | **100** | 2026-09-08 |
| Accessibility | **100** | **100** | 2026-09-08 |
| Best Practices | **100** | **100** | 2026-09-08 |
| SEO | **100** | **100** | 2026-09-08 |
| Agentic Browsing | 3/3 | — | 2026-09-07 (PageSpeed only) |

Run with `pnpm lighthouse` against production, Lighthouse 13.4.1. It covers everything shipped in the
2026-09-08 batch: the About fix, the prose type scale, the measure step, heading semantics, read
next, the outcome glossary and the rule 6 reframe.

| Metric | Mobile (2 runs) | Desktop |
| --- | --- | --- |
| First Contentful Paint | 0.8–1.2s | 0.2s |
| Largest Contentful Paint | 1.2–1.7s | 0.3s |
| Total Blocking Time | 0–20ms | 0ms |
| Cumulative Layout Shift | 0.028–0.048 | 0.006 |
| Speed Index | 1.4–2.5s | 0.4s |

**Ranges, not values, because a single run from here is noisy.** Two mobile runs fifteen minutes
apart, against the same unchanged deployment, differed by 1.1s on Speed Index — most of a second on
the metric that has moved every time anything on this site changed. Both scored 100.

That is the operational fact worth carrying: **one run is not a measurement.** Before concluding a
change regressed something, run it again. Before concluding a change fixed something, run it again.
A difference smaller than the spread above is noise, and the 2.8s Speed Index regression that the
paper grain caused was only trustworthy because it was several times larger than this.

**These are not comparable to the PageSpeed numbers recorded before them.** `pnpm lighthouse` runs
from the dev container over its own network to Vercel; PageSpeed runs from Google's infrastructure.
The 2026-09-06 mobile run reported a 0.8s First Contentful Paint against 1.2s here, and that gap is
the measurement origin, not a regression. Compare a run to other runs from the same place.

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

These bind at every width, not only the one the layout was composed for, and **`pnpm check:reading`
enforces them** — in a real browser at five viewports, because font metrics, line boxes and hit areas
are not derivable from a stylesheet. The character count of a line depends on the glyphs in it.

| Condition | Measured as |
| --- | --- |
| The measure stays inside 45–80 characters | real line boxes, averaged over the prose |
| A section heading is never smaller than the body it heads | `--fs-h2` and `--fs-index-title` ≥ 1.15× `--fs-body` |
| Evidence is never the smallest text on the page | `--fs-artefact` against `--fs-body`, and against every rendered element |
| Evidence is never clipped | `scrollWidth > clientWidth` on the artefact |
| Anything a reader acts on clears a 44px target | bounding boxes at ≤768px |
| Every listing exposes headings | `h2` count on a page carrying `.post-index` |

Two notes on how it decides, because both were wrong on the first attempt:

- **The 45-character minimum only applies where the measure is what binds.** On a 390px phone the
  column is the viewport, and no type size reaches 45 characters there — every mobile site sits
  around 40. The check compares the column against the available width and skips the minimum when
  the viewport is deciding.
- **It asserts on tokens, not only on rendered elements.** No published post carries a `##` heading,
  so an element-only check for "h2 against body" had nothing to measure and passed vacuously. A
  check that cannot fail is not a check.

Written as prose on 2026-09-08 and broken the same day: raising `--fs-artefact` from 13px to 18px so
the evidence would stop being the smallest text pushed half of every long line outside the block.
The arithmetic was in the tokens the whole time and nothing measured it. That is why these are
executable now.

## How to measure

```bash
pnpm lighthouse                          # production, mobile — the default
pnpm lighthouse --desktop                # production, desktop
pnpm lighthouse http://localhost:4380/   # a local `pnpm preview`, as a pre-flight
```

It prints the four scores, the five metrics and every audit that scored below 1, writes a JSON and
HTML report into `.lighthouse/` (gitignored), and exits non-zero if any category is under 100 — so it
is usable as a gate and not only as a report.

Production is the default deliberately. Throttling, compression and caching all differ on a local
preview, and the number that matters is the one a reader gets; a local run is a pre-flight, not the
verdict.

**This did not used to be possible.** Until 2026-09-08 the dev container had no browser, so every
check was handed to André and pasted back as a screenshot — and a design pass ran for two days
measuring nothing while a heading rendered smaller than its own body text. `.devcontainer/post-create.sh`
now installs a pinned Chromium on container creation. If it is ever missing, `pnpm lighthouse` says
so and gives the one command that fixes it.

PageSpeed Insights remains useful as a second opinion from outside this network, and is the only
place the Agentic Browsing category appears:

```
https://pagespeed.web.dev/analysis?url=https://andredreyer.com
```

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

# Design

**Status: stub.** This file records the tokens the site was built with and nothing more. A
dedicated design pass will replace it with the real document — rationale, rules for when each token
applies, and the decisions behind the type scale. Until that happens, treat this as a manifest, not
a specification.

The implementation lives in [`src/styles/tokens.css`](../src/styles/tokens.css) and
[`src/styles/global.css`](../src/styles/global.css). `tokens.css` is the only file allowed to
contain a literal colour.

## Colour — light

| Token | Value | Used for |
| --- | --- | --- |
| `--ink` | `#17191C` | body text, titles, metadata values |
| `--paper` | `#F5F5F2` | page ground |
| `--rule` | `#D8DAD5` | hairline separators — the only decoration on the site |
| `--muted` | `#4D514D` | metadata labels, summaries, `experiment` outcomes |
| `--faint` | `#6B6F6A` | superseded outcomes, artefact captions, the DORA footer |
| `--wash` | `#EAECE7` | artefact blocks, inline code |
| `--ok` | `#2F5D50` | `shipped` outcomes |
| `--info` | `#2C5578` | links, focus rings, `still-running` outcomes |
| `--warn` | `#8C5A2B` | `abandoned` outcomes |
| `--bad` | `#8E3B34` | failure artefacts |

## Colour — dark

Selected under `prefers-color-scheme: dark`. There is no toggle. The dark theme is a different
material rather than an inversion: a deep cool slate ground, ink lifted to a warm off-white, and
every status hue raised in luminance so it still separates from body text on slate.

| Token | Value |
| --- | --- |
| `--ink` | `#E9E4DB` |
| `--paper` | `#15181B` |
| `--rule` | `#2A2F33` |
| `--muted` | `#B3B8B0` |
| `--faint` | `#8F968F` |
| `--wash` | `#1C2024` |
| `--ok` | `#79B39C` |
| `--info` | `#84AECF` |
| `--warn` | `#C68B52` |
| `--bad` | `#D9938B` |

## Status colour

Colour is not decoration here. It has exactly one job: labelling the `outcome.status` values the
content schema already defines, plus the one artefact in a post that is the failure. Nothing else on
the site takes a hue, and adding one to tags, archetypes or headings would make the code
unlearnable — an archetype is a shape, not a verdict.

The convention is the operational one, so a reader who has looked at a dashboard already knows it.

| Meaning | Token | Where |
| --- | --- | --- |
| all good | `--ok` | `shipped` — the verdict is in and it worked |
| informational | `--info` | `still-running` — in production, no verdict yet. Also links and focus rings. |
| warning | `--warn` | `abandoned` |
| bad | `--bad` | the `severity="failure"` rule on an `<Artefact>` |
| no signal yet | `--muted` | `experiment` — uncoloured on purpose |

Three rules govern any future use.

1. **Colour never carries meaning alone.** Every status hue tints a word that already says the same
   thing. Red and green side by side are indistinguishable to a significant share of readers, and
   this palette survives that only because the label always reads. A signal that exists only as a
   hue is not allowed.
2. **`abandoned` is not red.** On this site abandoning something is an honest outcome and often the
   most useful part of a post — see [ARCHETYPES.md](ARCHETYPES.md). Amber is a caution, not a
   verdict of failure. Red stays scarce so that it still means something when it appears.
3. **Tokens are named for the job, not the hue,** so a value can be re-picked without the name
   becoming a lie. `--ok` may stop being green; it may not stop meaning "this worked".

Links are `--info` because a link is informational, which resolves an ambiguity the earlier palette
carried: one token was both "this is clickable" and "this shipped", so neither reading could be
learned. A `still-running` status never sits inline with a link, and links are underlined.

Two extensions are deliberately deferred rather than rejected: colouring the DORA footer against its
thresholds, which is not worth doing while three of the four metrics render as an em dash, and a
`severity` value beyond `failure`.

The metrics strip does take one tone decision: a value that came back as an em dash is set in
`--faint` rather than `--ink`. It is not a status colour and carries no meaning of its own — it is
the absence of a value stepping back from four values in full contrast. Three of the four will be
em dashes until the site has three posts, and a strip that shouted its own missing numbers would be
worse than the run-on line it replaced.

## Type

| Role | Face | Size | ≥ 90rem | Notes |
| --- | --- | --- | --- | --- |
| Masthead | JetBrains Mono 500 | 28px | 40px | home page only, tracking `-0.035em` |
| Post title | JetBrains Mono 500 | 26px | 34px | tracking `-0.025em` |
| Index title | JetBrains Mono 500 | 20px | 28px | tracking `-0.025em` |
| Body | Newsreader (variable) | 17px, 18px ≥ 40rem | 21px | line-height 1.7, optical sizing auto |
| Metric value | JetBrains Mono 500 | 16px | 18px | the four footer numbers, tracking `-0.02em` |
| Utility | JetBrains Mono | 11.5px | 12.5px | metadata, dates, tags, footer |

The scale steps twice, at 40rem and at 90rem, and every step is set as a token rather than on
`body`, so a rule that reads `--fs-body` gets the value actually rendering. The second step exists
because 18px in a 62ch column reads as a stamp on a large display — a real complaint, from a 4K
monitor at 100% zoom.

It moves the measure at the same time. `ch` is the width of a zero, and Newsreader's zero is wider
than its average lowercase glyph, so a 62ch column wraps prose at 89 characters — measured off the
rendered index — where a line wants 45 to 75. Raising the type alone would have widened the column
and left the line just as long, so the measure drops to 56ch in the same step: the column still
grows, and the line comes back to about 80 characters.

The column is not widened beyond that, and the horizontal space left over is not a defect. A prose
column that fills a 2500px viewport is unreadable. The answer to an empty margin is structure, not
a longer line.

Titles set in the mono face is deliberate and central to the identity, not a placeholder.

Both faces are self-hosted from [`public/fonts`](../public/fonts) as `latin` and `latin-ext`
variable subsets with `font-display: swap`. Nothing is requested from a third-party CDN at runtime.
Both are licensed under the SIL Open Font License; the licence texts sit next to the font files.

## Layout

Single column, left-aligned, measure capped at `62ch` — `56ch` at `90rem` and above, where the type
is larger. No sidebar, no cards, no hero images, no featured post. Responsive floor is 380px.

**The column is centred below `90rem` and weighted right above it.** Centred, the two margins are
equal and both are leftover space. Weighted, the left margin becomes a place — the one the section
numerals already occupy — and the page reads as composed rather than as a column that happened to
land in the middle. It is the structural answer to the empty margin that this document has been
demanding since the type scale moved.

The shift is `padding-left` on `body`, not a margin on each region, so the header, main and footer
stay locked to each other and their hairlines keep lining up. Content centres inside the padding
box, so the column moves by half the padding added: `8rem` of padding, `4rem` of shift.

The header has two forms. Everywhere except the home page it is the compact one: the name on the
left, text links on the right, a hairline under it. The home page gets the **masthead** — the name
set at `--fs-masthead`, the page's own description on the line beneath it, then the nav, stacked and
flush left. Nothing else changes. The compact header had the site name at 15px, smaller than the
post title under it, which reads as a breadcrumb rather than a title page; a masthead on a post page
would have the opposite problem and compete with the title, so `BaseLayout` takes a `masthead` prop
and only `index.astro` passes it. The description is rendered from the same prop that sets the meta
description, so the visible line and the one search results show cannot drift apart.

The masthead carries no bottom border. The compact header does, and keeps it — on a post page
nothing else rules across the page beneath it. The masthead is the only header followed directly by
an index entry, and that entry's kicker draws its own hairline to the edge of the measure 3.5rem
below, so the home page opened with two full-width rules in sequence and a single label between
them. That reads as one stray rule, not two boundaries. The kicker's hairline is the one that
survives: it is the thing making a one-entry index look composed, where the header's was only
underlining a block the masthead's own size already sets apart.

## The label register

Two places set utility type in caps with `0.06`–`0.08em` of tracking: the kicker above an index
entry (date · outcome), and the labels in the footer's metrics strip. Nothing else on the site is
uppercase, and the register means one thing — *this names the thing under it*. The words are
lowercase in the markup and capitalised in CSS, so `deploy freq` still reads as `deploy freq` in the
source and in [METRICS.md](METRICS.md).

The index kicker moved above the title rather than below the summary as part of this. An entry then
reads label, title, summary — three sizes descending — instead of two body-sized blocks with a
footnote. The kicker carries a hairline from the end of the label to the edge of the measure, which
is what makes an index of one entry read as composed rather than sparse.

Numbered artefact captions (`ARTEFACT 1 · …`) are the third use of the register, and the section
numerals below are the fourth.

## Four flourishes, and the ones not taken

Everything here is CSS. No images, no script, no colour that was not already a token.

| | |
| --- | --- |
| **Section numerals** | `01`, `02` in the left margin beside each `h2`, from a CSS counter. Only at `90rem` and up, where the margin is empty anyway. The heading becomes a flex line whose first item is the numeral and which is pulled left by the numeral column, so the heading text does not move; `align-items: baseline` sits the 12.5px numeral on the 17px heading's baseline without a magic offset. Not `§` — that is a citation mark, and nothing on this site cites a section. |
| **Scene break** | A thematic break (`***`) in the MDX renders as a centred row of middle dots. Not an asterism (`⁂`): the dot is in the latin subset the fonts were built from, and a glyph missing from a subset falls back to a system face mid-page. |
| **Link rule** | Links in prose keep the browser's underline at rest, so the resting state is unchanged — descender-aware, and it survives forced colours and print. The flourish is additive: a 2px ink rule draws in beneath it over 260ms and the text goes to ink. The global `prefers-reduced-motion` rule collapses the transition, so it simply appears. |
| **Numbered artefacts** | The counter is incremented by the `figcaption`, not the `figure`, so an uncaptioned artefact does not consume a number and leave a gap. |

Four more were drawn and rejected, recorded so they are not re-proposed:

- **A drop cap** on the opening paragraph. Strong, and too strong: on a short post it reads as the
  post dressing up.
- **Old-style figures** in prose. Attractive in principle for a site this full of numbers, but the
  difference was not visible enough to justify a feature whose presence in the subsetted font could
  not be confirmed.
- **An opening reveal** — hairlines drawing, blocks rising on load. It puts motion between a reader
  and the text they came for, and on a second visit it is friction.
- **A textured ground.** Shipped on 2026-09-05 and pulled the next day. Two `feTurbulence` layers
  behind everything — fine tiled grain and low-frequency mottle — drawn from a `--texture` token at
  a measured mean of 1.030:1 on `--paper`, below `--wash`. It looked right. It was not free:
  `feTurbulence` is a procedural noise generator, and the mottle layer asked the compositor to
  rasterise 1200 × 1200 of fractal noise before it could present a frame. That is raster-thread
  work, so it never showed in Total Blocking Time — it showed in Speed Index.

  Measured, on an emulated Moto G Power over Slow 4G, Lighthouse 13.4.1:

  | | With the grain | Without |
  | --- | --- | --- |
  | Performance | 98 | **100** |
  | Speed Index | 3.8s | **1.0s** |
  | First Contentful Paint | 0.8s | 0.8s |
  | Largest Contentful Paint | 1.7s | 1.7s |
  | Total Blocking Time | 0ms | 30ms |
  | Cumulative Layout Shift | 0 | 0.013 |

  **2.8 seconds of Speed Index**, and nothing else. FCP and LCP did not move at all, which is the
  signature of raster-thread cost rather than anything on the critical path — the page reached its
  first paint on time and then took seconds to finish filling in. The filmstrip is the clearest
  evidence: six blank frames before, content from the second frame after.

  TBT and CLS got very slightly *worse* on removal, and that is not a regression. The page now
  paints early enough that the font swap lands after first paint instead of being hidden behind a
  blocked render. Both stay green with a wide margin.

  Two wrong diagnoses are worth recording so they are not repeated. The render-blocking stylesheet
  Lighthouse flagged was a red herring: inlining it made that audit pass and moved the score not at
  all. So were the fonts — 163KB preloaded at highest priority, which looked damning next to a 5KB
  document and is plainly fine at a Speed Index of 1.0s.

  Fifteen drawn textures were tried before this one and rejected for reading as pictures placed
  behind the text; the material approach was the answer to that and remains the right idea. Anything
  reviving it must **pre-rasterise the noise rather than generate it at paint time**, and must carry
  a Lighthouse number before and after. The cheaper half-step, untested: keep the 240 × 240 grain
  and drop the mottle, which was 25× the pixel count and did most of the damage.

## The hairline grammar

Hairlines are the only decoration on the site, and for a long time they were all the same object: 1px
of `--rule`, full width, everywhere. That made the page's structure illegible — a boundary between
the site's chrome and its content looked identical to a separator between two list items. Three
tiers now:

| Tier | Form | Where |
| --- | --- | --- |
| **Region boundary** | 1.5px `--rule` | Under the compact header, over the footer. Content ends, chrome begins. |
| **Content rule** | 1px `--rule` | Everything else — artefact borders, blockquote edges. |
| **Runs out** | 1px, `--rule` to transparent | The index kicker, after the date and outcome. |

The third is the one that carries meaning rather than weight. A kicker *names* the entry beneath it;
it does not enclose it, and a rule that ends square implies an edge that is not there. Running it out
says the label is trailing off into the entry, which is what it is doing.

The masthead carries no rule at all — see Layout above.

## The wordmark

`André` is set at 700, `Dreyer` at 500. Both faces are loaded variable across 400–700 and the site
used exactly one weight of that range, so the axis was already paid for and sitting idle. The given
name takes the weight because the site is a person writing, not a masthead of record.

Applied in both header forms, so the compact header on a post page and the masthead on the home page
are the same mark at two sizes.

## Optical size, driven

Newsreader carries an optical size axis of 6–72. The site set `font-optical-sizing: auto`, which only
lets the axis follow font-size. The index summary and the masthead line now set `opsz 60` explicitly,
which gives them a finer display cut at the *same* size as the body text beneath them — a second
texture out of a file already downloaded, for no bytes.

## Selection

Selecting text is the one interaction a reading site actually gets, and it was answered in the
browser's default blue — the only colour on the site nobody chose. It is now `--info` on `--paper`.

`--info` rather than `--ok`: this is the interface responding to the reader, which is the job `--info`
already holds on links and the focus ring. It is not a status, and the rule that colour labels
`outcome.status` and nothing else still stands.

## Print

The site had no `@media print` rules at all. It has them now: black on white, points rather than
pixels, navigation and the skip link dropped, link destinations spelled out after the link because
paper cannot be clicked, surfaces stripped of fill because a printer renders `--wash` as a grey box
that costs ink and separates nothing, and `break-after: avoid-page` on every heading so none is left
stranded at the foot of a sheet. The section numerals move inline, since a printed page has no margin
to spare. The metrics strip prints — it is the one thing on this site no other blog has.

This is free by construction: print media is not evaluated by Lighthouse. See
[PERFORMANCE.md](PERFORMANCE.md).

## The tone scale, and why it moved

As originally specified, `--faint` was `#9A9E98`, measuring **2.49:1** on `--paper` — well below the
WCAG AA threshold of 4.5:1, which applies because `--faint` is used at 11.5px, under the large-text
exemption. Lighthouse flagged it on the footer, the index metadata and both outcome elements.

The awkwardness recorded here previously was real: any value clearing AA on this ground lands within
a hair of the original `--muted` (`#6B6F6A`, 4.68:1). Fixing `--faint` alone would have collapsed
two tiers into one.

Resolved on 2026-08-09 by moving both rather than one. `--faint` took the original `--muted` value,
and `--muted` moved a step further from the ground. Three distinct levels survive, both palettes
clear AA, and summaries and blockquotes gained readability as a side effect (4.68:1 → 7.40:1).
`--ink` and `--paper` are untouched from the specified palette, as are the two hues it named:
they are now called `--ok` and `--warn`, and their values did not move.

## Contrast reference

Measured against the relevant ground. `--rule` and `--wash` are surfaces, not text, so the
4.5:1 threshold does not apply to them.

| Token | Light on `--paper` | Dark on `--paper` |
| --- | --- | --- |
| `--ink` | 16.13:1 | 14.07:1 |
| `--muted` | 7.40:1 | 8.83:1 |
| `--faint` | 4.68:1 | 5.88:1 |
| `--ok` | 6.86:1 | 7.42:1 |
| `--info` | 7.18:1 | 7.58:1 |
| `--warn` | 5.32:1 | 6.12:1 |
| `--bad` | 6.80:1 | 7.21:1 |

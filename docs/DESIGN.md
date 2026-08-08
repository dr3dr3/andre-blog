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
| `--muted` | `#6B6F6A` | metadata labels, summaries, `experiment` outcomes |
| `--faint` | `#9A9E98` | superseded outcomes, artefact captions, the DORA footer |
| `--signal` | `#2F5D50` | links, focus rings, `shipped` and `still-running` outcomes |
| `--amber` | `#8C5A2B` | `abandoned` outcomes only |
| `--wash` | `#EAECE7` | artefact blocks, inline code |

## Colour — dark

Selected under `prefers-color-scheme: dark`. There is no toggle. The dark theme is a different
material rather than an inversion: a deep cool slate ground, ink lifted to a warm off-white, and
eucalyptus raised in luminance so it still reads as a link.

| Token | Value |
| --- | --- |
| `--ink` | `#E9E4DB` |
| `--paper` | `#15181B` |
| `--rule` | `#2A2F33` |
| `--muted` | `#8F968F` |
| `--faint` | `#5F6663` |
| `--signal` | `#79B39C` |
| `--amber` | `#C68B52` |
| `--wash` | `#1C2024` |

## Type

| Role | Face | Size | Notes |
| --- | --- | --- | --- |
| Post title | JetBrains Mono 500 | 26px | tracking `-0.025em` |
| Index title | JetBrains Mono 500 | 20px | tracking `-0.025em` |
| Body | Newsreader (variable) | 17px, 18px ≥ 40rem | line-height 1.7, optical sizing auto |
| Utility | JetBrains Mono | 11.5px | metadata, dates, tags, footer |

Titles set in the mono face is deliberate and central to the identity, not a placeholder.

Both faces are self-hosted from [`public/fonts`](../public/fonts) as `latin` and `latin-ext`
variable subsets with `font-display: swap`. Nothing is requested from a third-party CDN at runtime.
Both are licensed under the SIL Open Font License; the licence texts sit next to the font files.

## Layout

Single column, left-aligned, centred in the viewport, measure capped at `62ch`. No sidebar, no
cards, no hero images, no featured post. Header is the name on the left and text links on the
right, separated by a hairline. Responsive floor is 380px.

## Known open question

`--faint` at `#9A9E98` on `--paper` measures **2.49:1**, below the WCAG AA threshold of 4.5:1 for
body-size text. Any value that clears AA on this ground lands within a hair of `--muted`
(`#6B6F6A`, 4.68:1), which collapses the two tiers into one. The token is implemented as specified
and the trade-off is recorded here for the design pass to settle.

## Contrast reference

Measured against the relevant ground. `--rule` and `--wash` are surfaces, not text, so the
4.5:1 threshold does not apply to them.

| Token | Light on `--paper` | Dark on `--paper` |
| --- | --- | --- |
| `--ink` | 16.13:1 | 14.07:1 |
| `--muted` | 4.68:1 | ~5.7:1 |
| `--faint` | 2.49:1 | 3.03:1 |
| `--signal` | 6.86:1 | 7.42:1 |
| `--amber` | 5.32:1 | 6.12:1 |

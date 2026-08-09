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
| `--muted` | `#B3B8B0` |
| `--faint` | `#8F968F` |
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
`--ink`, `--paper`, `--signal` and `--amber` are untouched from the specified palette.

## Contrast reference

Measured against the relevant ground. `--rule` and `--wash` are surfaces, not text, so the
4.5:1 threshold does not apply to them.

| Token | Light on `--paper` | Dark on `--paper` |
| --- | --- | --- |
| `--ink` | 16.13:1 | 14.07:1 |
| `--muted` | 7.40:1 | 8.83:1 |
| `--faint` | 4.68:1 | 5.88:1 |
| `--signal` | 6.86:1 | 7.42:1 |
| `--amber` | 5.32:1 | 6.12:1 |

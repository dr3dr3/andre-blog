---
target: the blog design (homepage + post page)
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:/workspaces/andre-blog/src/pages/index.astro"
target_fingerprint: "sha256:ae989103cb71312b6639b0a055a41192017516e71776e9cdc82444a61b2e70e1"
target_path: /workspaces/andre-blog/src/pages/index.astro
timestamp: 2026-09-08T10-04-22Z
slug: src-pages-index-astro
---
Method: dual-agent (A: design review, isolated · B: detector + evidence, isolated). No degradation.
No browser available in this environment — every URL scan failed with "No Chrome, Chromium, Edge or
Brave installation found". There is no rendered-layout evidence in this run.

## Design Health Score — 28/40 (Good, lower band)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | No aria-current anywhere; on / the "Posts" link targets the current page |
| 2 | Match System / Real World | 3 | /tags/<t>/ renders a bare lowercase h1 with no framing line |
| 3 | User Control and Freedom | 3 | No route onward at the end of an article except the top nav |
| 4 | Consistency and Standards | 3 | tags/[tag].astro hand-duplicates PostEntry and omits the numeral — already drifted |
| 5 | Error Prevention | 3 | check:og guards the cards; nothing destructive exists |
| 6 | Recognition Rather Than Recall | 2 | The outcome taxonomy carries the only colour and is explained on no page |
| 7 | Flexibility and Efficiency | 2 | Heading ids exist but no visible anchor affordance |
| 8 | Aesthetic and Minimalist Design | 3 | .prose h2 is smaller than body text at every viewport >= 640px |
| 9 | Error Recovery | 4 | The 404 is genuinely excellent |
| 10 | Help and Documentation | 3 | Colophon good; status taxonomy unexplained |

## Design Specificity Verdict

Authored, emphatically — and priced for one display. The status taxonomy, DORA-for-writing metrics,
mono titles against serif body, and <Artefact> with a caption-incremented counter are not
category-interchangeable.

But the weighted column, archive numerals, section numerals AND the corrected measure all fire only
at 90rem. READERS.md says every reader arrives by transmission — a feed, a phone. The entire
authored character is invisible to the reader class the site says it exists for.

Deterministic scan: 73 findings across dist, all rule `low-contrast`, ALL false positives — the
detector flattens media queries and pairs dark-mode and print colours against a #ffffff the site
never paints. Every real pairing recomputed and passes AA. Source markup clean, exit 0.
The detector produced 73 phantom a11y findings and missed every real one.

## What's Working

1. The Outcome status system, correctly constrained — every hue tints a span whose text already says
   the word; `experiment` uncoloured on purpose is the tell someone thought past the first four cases.
2. The 404 and the RSS XSL — two surfaces nobody designs, both designed.
3. The index kicker — gradient-to-transparent rule, label wrapped so inline spacing survives, a clean
   three-tier descent.

## Priority Issues

[P0] /about ships placeholder scaffolding to production. Verified in dist/about/index.html: renders
"Placeholder. Scaffolding, not André's writing — replace the paragraph below before this site is
shared anywhere." plus a literal [[TK: ...]] marker. On a site whose premise is verified honesty,
the identity page announces itself as unfinished. Fix: write it, or make pnpm check refuse to build
a non-draft page containing [[TK: or .placeholder. Command: /impeccable harden

[P1] In-prose type hierarchy inverts. .prose h2 is a hard 1.0625rem (17px), never overridden outside
@media print; body is 18px from 640px and 21px from 1440px. Section headings are smaller than the
paragraphs they head at every desktop width; the artefact renders at 13px beside 21px prose. Root
cause: h2, h3 and the artefact are absent from DESIGN.md's type table, so they were never tokenised.
Fix: --fs-h2/--fs-h3/--fs-artefact at all three steps, h2 >= 1.15x body. Command: /impeccable typeset

[P1] The measure fix is gated behind the composition breakpoint. --measure is 62ch from 0 to 1439px,
56ch only at 90rem, and DESIGN.md itself calls 62ch a defect (~89 characters). rem media queries
resolve against the user's base font, so the breakpoint retreats for low-vision readers. Fix: step
--measure at ~64rem, independent of the composition step. Command: /impeccable typeset

[P1] The end of an article is a dead end. Tags (unlabelled) -> 5rem gap -> 1.5px rule -> four
metrics, three of them em dashes -> two colophon links. Highest-intent moment on a reading site.
Fix: a continue block above the footer using PostEntry; render only metrics that resolve.
Command: /impeccable layout

[P2] The site's vocabulary is undocumented on the site. shipped/abandoned/still-running/experiment
carry the only colour and are explained nowhere; stack versions live only in abbr[title], unreachable
on touch. Fix: "What the outcomes mean" on /colophon; render versions inline. Command: /impeccable clarify

## Persona Red Flags

Casey (distracted mobile, the primary persona given the transmission premise): gets none of the
design; index title tap target ~27px tall, under the 44px floor, while the non-clickable summary
beneath looks more tappable; three sub-44px nav targets; never sees a stack version.

Sam (accessibility): the homepage exposes exactly one heading (h1.masthead-name) — post titles are
bare <a> in <li>, so rotor-browsing the index returns nothing. No aria-current. .post-tags announces
as two unlabelled links. Credit: :focus-visible solid in both palettes, skip link works,
prefers-reduced-motion honoured, .index-numeral correctly aria-hidden.

perks (READERS.md): arrives by phone from LinkedIn; everything signalling careful composition is
display:none. Wants "the parts that were a slog" — the artefact is that evidence and it is the
smallest text on the page. Credit: copy is genuinely free of pitch.

## Minor Observations

- tags/[tag].astro has already drifted from PostEntry; DESIGN.md's "cannot drift" claim is false.
- The hairline grammar has an unadmitted fourth tier (2px on .artefact--failure and :focus-visible).
- Radius literals leak: --radius exists but 3px and 2px appear undeclared.
- --bad / .artefact--failure have never rendered; first test will be in production.
- <title> on the homepage is just "André Dreyer"; og:site_name repeats the same string.
- Two date formats on one kicker line (isoDate for publication, longDate for changed).

## Questions to Consider

1. The audience document and the design document are in the same repo and point at different screens.
2. Is 90rem a design decision or a description of the author's monitor?
3. Rule 6 vetoed one texture and waved everything else through. What would it look like if it
   constrained reading outcomes rather than a score?
4. Rule 4 says the answer to an empty margin is structure, not a longer line. Between 640 and 1439px
   there is no structure AND the line is 89 characters. Which half of the rule is real?
5. The 01 beside an h2 is the most obvious anchor link a CSS counter ever generated, and it is
   ::before content. What if the numeral were the permalink?

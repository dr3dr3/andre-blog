# Metrics

The four numbers in the site footer. This file is the specification: what each one counts, the exact
question it asks git, and what it refuses to answer. The implementation lives in
[`src/lib/dora.ts`](../src/lib/dora.ts).

They keep the DORA shape because the audience recognises it — see [READERS.md](READERS.md) — but
only the first one still measures software delivery. The other three were re-pointed at the thing
this site actually produces, which is writing. The labels say what is counted, so the borrowed
frame is a nod rather than a claim.

## Rules that apply to all four

1. **Computed from git at build time.** No API, no database, no stored state. Every page in a build
   renders the same line.
2. **Never guess.** A number that cannot be computed honestly renders as an em dash. An em dash
   means *not available*, not zero. This follows rule 1 of [CLAUDE.md](../CLAUDE.md) and is the
   whole reason the file exists in its current shape.
3. **Never fail a build.** Every git call is wrapped, every error swallowed. A footer that cannot be
   computed is a footer full of em dashes, not a failed deploy.
4. **A complete history is required.** Vercel builds from a truncated clone. `getDora` asks for the
   rest of the history first; if that fetch does not land, every metric below reports an em dash
   rather than measuring a fragment.
5. **A median of one is not a median.** Each metric renders an em dash until it has at least
   **three** samples. Below that the footer stays quiet and the colophon carries the detail.

## 1. Deployment frequency

**Label:** `deploy freq` **Format:** `4.1/mo`

Changes landing on `main`, expressed per month.

| | |
| --- | --- |
| Counts | first-parent commits on `main` |
| Window | trailing 90 days |
| Arithmetic | `count ÷ 90 × 30.437` (mean Gregorian month) |
| Sample gate | not applied — a count is not a median |

`--first-parent` counts each merge as one landing rather than counting every commit the branch
carried in.

This is the one metric that stayed as it was, and it measures **the site, not the writing**. A
design pass, a tooling commit and a published post each count as one landing. That is deliberate:
the number answers "is this thing being worked on", and post cadence is what metric 2's denominator
is for. It does mean the figure can be healthy in a month with no new posts.

## 2. Lead time

**Label:** `draft→live` **Format:** `3d 4h`

How long a post takes to get from its first appearance in the repository to being published.

| | |
| --- | --- |
| Per post | `published` − author date of the commit that added the post file |
| Aggregate | median across qualifying posts |
| Window | every published post, all time |
| Sample gate | 3 posts |

The starting commit is found with `--diff-filter=A --follow`, so a renamed post keeps its original
start date. Author date rather than committer date, because it records when the work happened; the
repository never rewrites history, so in practice the two agree.

**What it can honestly claim.** Brain-dumps live in `drafts/`, which is gitignored — git cannot see
when André started thinking about a post, only when a file for it was committed. So this measures
*time in the repository*, not *time from idea*. The label says `draft→live` for that reason. Calling
it "how long an article takes to write" would overclaim.

**Worked example.** `wip-tracker.mdx` was added by `62c7085` on 2026-08-19 and carries
`published: 2026-08-22`, giving 3 days.

## 3. Change failure rate

**Label:** `revised` **Format:** `12%`

The share of published posts that needed changing after they went live.

| | |
| --- | --- |
| Denominator | every published post |
| Numerator | those with at least one revision commit |
| Window | all time |
| Sample gate | 3 posts |

**Publish commit.** The commit that set `draft: false` for that post. `scripts/publish-post.mjs`
does this in the same commit that stamps `published`, so it is unambiguous.

**Revision commit.** A commit touching the post file, later than the publish commit, whose diff
changes at least one line **below the closing frontmatter delimiter**.

That last clause is the load-bearing one. Bumping a tag, correcting a stack version or setting
`outcome.was` is bookkeeping, not a revision of the writing, and counting it would make the metric
mean "touched again" rather than "was wrong". Body-only is a mechanical proxy for that distinction
and it is not perfect: a repo-wide formatting sweep would still register. If that ever happens, the
answer is to record the exception here rather than to quietly widen the definition.

**Not derived from the `updated` frontmatter field.** That field is optional, set by hand, and
`publish-post.mjs` never writes it. Zero posts currently carry one. A field that must be remembered
will drift; git cannot forget.

**On calling this a failure.** It is not one, and the label does not say it is. A post revised
because the world moved is maintenance; a post revised because it was wrong is a correction. Git
cannot tell them apart, so the metric counts both and the label stays neutral.

## 4. Time to restore

**Label:** `time to revise` **Format:** `9d`

How long a post stood in its unrevised form before the first change landed.

| | |
| --- | --- |
| Per post | date of first revision commit − `published` |
| Aggregate | median |
| Denominator | **revised posts only**, not all published posts |
| Sample gate | 3 revised posts |

This is the closest honest analogue to MTTR, which measures from a failure occurring to service
being restored — including the time nobody noticed. This does the same: it cannot see when an error
was spotted, only when it was fixed, and the gap between publishing and fixing includes both.

Note the denominator differs from metric 3. Metric 3 asks how much of the archive needed changing;
this asks how quickly the changes came. With no revised posts it is an em dash, never zero.

## Exclusions

Applied to metrics 2, 3 and 4. Metric 1 counts commits and is unaffected.

- **Drafts.** `draft: true` is not published and has no publish date to measure from.
- **Future-dated posts.** `published` later than the build date.
- **Posts with impossible dates.** Any post whose `published` precedes the commit that added its
  file. This is a data error rather than a fast turnaround, and it produces a negative interval that
  would drag a median below zero. It exists today: `placeholder-six-agents.mdx` carries
  `published: 2026-06-18` but its file first appears in git on 2026-08-08. That post is being
  deleted, but the guard stays — a defensive rule costs nothing and this is exactly the class of
  silent nonsense rule 1 exists to prevent.
- **Posts whose start commit cannot be resolved.** Excluded from metric 2 only.

Every exclusion narrows a denominator, which is why the sample gate in rule 5 is checked *after*
exclusions, not before.

## Where the definitions are explained to readers

**Proposed: no new page.** The colophon already has a section called "The numbers in the footer",
it is already wrong now that these definitions have changed, and it is where "how this site works"
lives. Extending it costs nothing; a `/metrics` page would add a nav entry for a footnote, and the
header is deliberately three links.

The colophon section should carry, in prose rather than a table:

- what each of the four counts, in one sentence
- that an em dash means unavailable rather than zero
- the sample sizes behind each figure — the footer is gated at three, so the page is where a reader
  finds out a number rests on four posts

Linking the footer line to `/colophon#the-numbers-in-the-footer` would make that discoverable
without adding chrome. That is the one open decision here; everything above is settled.

## Open knobs

- **The sample gate is three.** Chosen because a median of one is the value itself and a median of
  two is the midpoint of two — neither is a distribution. It is a judgement call, not a derivation.
- **Window asymmetry.** Metric 1 uses a trailing 90 days; metrics 2–4 use every published post.
  Cadence is a question about now; the corpus is a question about the whole body of work. Worth
  revisiting when the archive is large enough that all-time figures stop moving.

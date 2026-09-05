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
   renders the same line. Git is the only source; where the build's own checkout cannot answer, the
   history is cloned and asked again, which is rule 4.
2. **Never guess.** A number that cannot be computed honestly renders as an em dash. An em dash
   means *not available*, not zero. This follows rule 1 of [CLAUDE.md](../CLAUDE.md) and is the
   whole reason the file exists in its current shape.
3. **Never fail a build.** Every git call is wrapped, every error swallowed. A footer that cannot be
   computed is a footer full of em dashes, not a failed deploy.
4. **A complete history is required — behind the ref being measured.** Vercel builds from a
   truncated clone. `getDora` asks for the rest of the history first, then checks that what it is
   about to measure is whole: a shallow clone records its cut points in `.git/shallow`, and those
   commits look parentless to git even though the project continues past them. If any parentless
   commit reachable from the measured ref is one of them, every metric reports an em dash rather
   than measuring a fragment.

   The check is about that ref and not about the repository, and it was broader once — any entry in
   `.git/shallow` at all. That made every metric on production an em dash, and it is the reason this
   section exists.

   **What the build log showed.** First `fetch --unshallow landed` immediately followed by a refusal,
   which said the fetch had succeeded and the file still had entries afterwards. Sharpening the check
   to the measured ref's own ancestry did not fix it, but it made the log specific: **22 commits on a
   detached `HEAD`, four graft points, all four of them roots of the ref being measured.** Neither
   `refs/heads/main` nor `refs/remotes/origin/main` existed. So the history really was truncated, and
   `--unshallow` had exited zero without delivering any of it — with no branch refspec there was
   nothing for it to deepen.

   Six clone shapes were tried locally against this repository to reproduce that (`--depth=10`, the
   same with `--no-single-branch`, `--depth=1`, a `git init` plus a depth-limited fetch of one commit,
   the same with the remote's fetch refspec unset, and the same again with the remote-tracking ref
   deleted). Every one of them repaired itself on `--unshallow`. Whatever produces the builder's
   checkout is its own, and it cannot be repaired from inside it.

   **So the history is cloned instead.** When the checkout cannot be made whole in place, `getDora`
   clones the project into a temp directory, measures that, and deletes it. The URL is built from
   `VERCEL_GIT_PROVIDER`, `VERCEL_GIT_REPO_OWNER` and `VERCEL_GIT_REPO_SLUG` rather than from the
   checkout's own remote — the whole point is that the checkout is not to be trusted, and its
   `origin` may carry a credential scoped to the build — falling back to the configured remote, which
   is what makes a local build work without touching the network. The repository is public, so the
   clone is anonymous. Measured at about 1.4 seconds end to end.

   It is an ordinary clone, not a bare or blobless one: `ls-files` needs an index, and `--follow`,
   `-S` and `show` need blobs, so each cheaper variant would break a different metric.

   Rule 3 still governs all of it. A clone that fails is caught and narrated, and the footer fills
   with em dashes rather than failing the build.
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

**Label:** `draft→live` **Format:** `3d`

How long a post takes to get from its first appearance in the repository to being published.

| | |
| --- | --- |
| Per post | `published` − author date of the commit that added the post file, as whole calendar days in UTC |
| Aggregate | median across qualifying posts |
| Window | every published post, all time |
| Sample gate | 3 posts |

The starting commit is found with `--diff-filter=A --follow`, so a renamed post keeps its original
start date. Author date rather than committer date, because it records when the work happened; the
repository never rewrites history, so in practice the two agree.

**Whole days, not hours.** `published` is a date with no time. Subtracting a commit timestamp from
it would report `2d 19h` for a post whose two dates are three days apart, claiming a precision the
field does not have — and would make a post written and published on the same day come out negative,
so the impossible-dates exclusion below would silently discard it. Only the dates are compared.

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
| Per post | date of first revision commit − `published`, as whole calendar days in UTC |
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
- **Posts with impossible dates.** Any post whose `published` *date* precedes the date of the commit
  that added its file. This is a data error rather than a fast turnaround, and it produces a negative
  interval that would drag a median below zero. A post added and published on the same day is zero
  days, not negative, and counts. It exists today: `placeholder-six-agents.mdx` carries
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

**Settled: a "What these count" link under the strip points at
`/colophon#the-numbers-in-the-footer`.** The four values are not themselves a link — the strip is a
labelled `<dl>`, and wrapping it would have made the whole footer one target. The link keeps the
footer's own colour and weight, underlined in that colour rather than in blue: a link that resolves
only on hover announces itself to nobody on a touchscreen.

## Open knobs

- **Whole days rather than hours.** Chosen because `published` carries no time, so any finer figure
  would be precision the data does not have. It costs the ability to distinguish a post published
  the morning after it was started from one published that evening; both read `1d`.
- **The sample gate is three.** Chosen because a median of one is the value itself and a median of
  two is the midpoint of two — neither is a distribution. It is a judgement call, not a derivation.
- **Window asymmetry.** Metric 1 uses a trailing 90 days; metrics 2–4 use every published post.
  Cadence is a question about now; the corpus is a question about the whole body of work. Worth
  revisiting when the archive is large enough that all-time figures stop moving.

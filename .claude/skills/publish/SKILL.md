---
name: publish
description: Take a finished draft live. Runs the pre-publish gates, sets the date and draft false via scripts/publish-post.mjs, verifies the post appears in a production build, then commits and pushes. Only André invokes this — never reach for it because a draft looks finished.
---

# Publish

**This skill is the only sanctioned path to `draft: false`, and it runs only when André types
`/publish`.** CLAUDE.md forbids publishing on your own initiative and that still holds: a finished
draft is not an instruction, a passing `/review` is not an instruction, and neither is a critic with
no objections left. His invocation is the instruction. Nothing else is.

If you find yourself thinking "the post is ready, I should publish it" — that is exactly the thought
the rule exists to stop.

## Before you start

Take a slug. If none was given, run the script with no arguments; it lists the drafts. If more than
one is a candidate, ask which.

Call `node` directly rather than `pnpm publish-post`. The pnpm alias exists for André's terminal,
but pnpm runs a dependency-status check first, and on a container where `node_modules` looks stale
it aborts asking for a TTY it does not have.

## 1. Check

```bash
node scripts/publish-post.mjs <slug> --check
```

Changes nothing. Prints one line per gate and exits non-zero if any fail.

**On a failure, stop and report it.** Do not fix the post and re-run in the same breath — a gate
failing at publish time means something was missed in the loop, and André should see that rather
than have it quietly patched. The exception is a failure he has already seen and asked you to fix.

The gates are WRITING.md §12 minus the items only a person can judge. They do not check whether the
post is any good, whether the artefacts are honestly captioned, or whether a number is real. The
fact-checker does the last one and should have run already.

## 2. Publish

```bash
node scripts/publish-post.mjs <slug>
```

Sets `published` to today, removes the published-date placeholder marker, sets `draft: false`, and
re-reads the file to confirm both landed.

If the harness blocks the write, **stop and tell him**. Do not route around it with a different tool
— see the note at the bottom.

## 3. Verify it actually builds in

```bash
node_modules/.bin/astro build
```

Without `INCLUDE_DRAFTS` set. Confirm `dist/posts/<slug>/index.html` exists and the slug appears in
`dist/index.html` and `dist/rss.xml`. This is the real proof: until this passes, the post was only
ever visible because a flag was set locally.

## 4. Commit and push

One commit, the post only. Do not sweep unrelated working-tree changes into a publish commit.

```
content: publish <slug>

<title>

<one line on what the post is>
```

Push the branch.

## 5. Hand over the merge

**Stop here.** The merge to `main` is what deploys, and that is his, not yours. Report:

- the branch and commit
- that a production build emitted the post
- the URL it will land at
- that the LinkedIn post is drafted in `drafts/<slug>.linkedin.md`, if it is

## Never

- Merge to `main`, or ask GitHub to. `gh pr merge` is off-limits from here.
- `terraform apply`, or deploy by any other route.
- Set `draft: false` by hand, with `sed`, or with any tool other than the script. The script's gates
  are the point; an edit that skips them is a publish that skipped the checklist.
- Work around a permission denial. If the harness blocks the write, that is a signal to stop and
  explain, not a puzzle to solve. An agent that routes around its own guards does not have any.

---
description: Interview André for a brain-dump, pick an archetype, and scaffold the post file. Does not write the post.
argument-hint: "[rough topic]"
---

# /newpost

Set up a new post. **You do not write the post.** You collect raw material and create the files the
drafter will work from.

Topic, if given: `$ARGUMENTS`

## 1. Interview

Ask questions and record the answers verbatim. Do not paraphrase into prose, do not tidy, do not
arrange into an argument. This is raw material.

Ask in roughly this order, following whatever thread turns out to be interesting:

- What is this about, in one sentence?
- What existed before? What was it for, and what constrained it?
- What went wrong, and how was it noticed?
- What was tried first? What did each attempt cost?
- What actually worked? What did that cost — what got slower, uglier, or thrown away?
- What numbers are there? Anything measured, before and after.
- What artefacts exist — logs, error messages, timing tables, bills? Ask him to paste them, not
  describe them.
- What tools, and what versions were pinned at the time?
- When did this happen? Dates, or at least a month.
- What would he do differently?
- Is the outcome settled, or might it change later?

Rules while interviewing:

- **Never supply an answer.** If he does not know a number, write `[[TK: ...]]` and move on.
- Ask for artefacts as text. A described log is not a log.
- If a company or client name comes up, keep it in the brain-dump — the brain-dump is not published
  — but flag that it will need to become a shape before drafting. See WRITING.md §8.
- Stop when he stops. A short brain-dump is a real answer.

Write it to `drafts/<slug>.brain-dump.md`. That directory is gitignored, because brain-dumps hold
raw names, internal detail and unscrubbed artefacts. **It never gets committed.**

## 2. Pick an archetype

Propose one from [docs/ARCHETYPES.md](../../docs/ARCHETYPES.md) with a sentence of reasoning, and
let him confirm or override.

Quick guide: something that involved being wrong for a while is a `war-story`; a fork in the road is
a `decision-record`; an assessment of a tool used in anger is a `teardown`; one true small thing is
a `field-note`.

## 3. Scaffold the post

Create `src/content/posts/<slug>.mdx` with complete frontmatter. Fill what the interview supports;
use `[[TK: ...]]` for the rest. The body stays empty apart from the TK markers.

```mdx
---
title: '[[TK: title — concrete, under 70 chars, see WRITING.md §10]]'
summary: '[[TK: one sentence, under 180 chars]]'
published: [[TK: YYYY-MM-DD]]
archetype: '<chosen>'
context: '[[TK: the shape of the situation — never a company name]]'
stack:
    - name: '[[TK]]'
      version: '[[TK: as pinned at the time]]'
outcome:
    status: '[[TK: shipped | abandoned | still-running | experiment]]'
tags: []
draft: true
---

[[TK: drafted by the drafter skill from drafts/<slug>.brain-dump.md]]
```

Notes:

- `draft: true` always. Never set it to `false`.
- Omit `updated`, `canonical`, `outcome.was` and `outcome.changed` unless they apply. `outcome.was`
  requires `outcome.changed` or the build fails.
- Slug: lower-case, hyphenated, no dates. It becomes the URL.

## 4. Hand over

Tell him the two paths are ready and that the next step is the `drafter` skill. **Do not start
drafting.** Do not run the loop unless he asks.

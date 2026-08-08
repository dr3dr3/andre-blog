---
description: Run the pre-publish checklist from docs/WRITING.md §12 against a draft and report pass or fail per item. Changes nothing.
argument-hint: "[path to post, or slug]"
---

# /review

Run the pre-publish checklist against a post. **Report only. Change nothing.**

Target: `$ARGUMENTS` — a path under `src/content/posts/`, or a slug. If neither is given, list the
posts with `draft: true` and ask which one.

Read [docs/WRITING.md](../../docs/WRITING.md) first. The checklist is §12 and it is authoritative;
what follows is how to run it, not a replacement for it.

## Output

One line per item, in order, with a verdict and evidence. Nothing else.

```
1.  Kill-list                FAIL  L12 "leverage", L57 "seamlessly"
2.  First 40 words           PASS
3.  Unsupported claims       FAIL  L42 "cut review time in half" — no supporting number
4.  [[TK: markers            FAIL  3 remaining: L18, L44, L90
5.  Self-grading             PASS
6.  Company names            PASS
7.  Artefacts                FAIL  L80 artefact has no caption
8.  Australian English       FAIL  L22 "optimized"
9.  Frontmatter complete     PASS
10. outcome.was / changed    PASS
11. summary < 180 chars      PASS  164
12. title < 70 chars         PASS   41
13. draft: true              PASS
```

Finish with a single line: `READY` if every item passes, or `NOT READY — n item(s) failed`.

## How to run each item

1. **Kill-list** — every banned word from WRITING.md §4 in any inflection, plus the banned
   constructions. Check for exclamation marks and for three-item rhetorical triples. Flag em-dash
   density only if consecutive paragraphs each carry one.
2. **First 40 words** — does sentence one contain a specific noun from this story? Apply the test in
   §5: would the sentence fit unchanged at the top of a different post?
3. **Unsupported claims** — list every claim of impact and, next to each, the number or specific
   anecdote backing it. Any claim with nothing next to it fails.
4. **`[[TK:` markers** — count and locate. Any remaining is a fail.
5. **Self-grading** — adjectives grading the work described.
6. **Company names** — the whole file, including frontmatter `context` and artefact contents.
7. **Artefacts** — each `<Artefact>` real or captioned as illustrative, and scrubbed of hostnames,
   ticket IDs, repository paths, handles and internal service names.
8. **Australian English** — `-ize` spellings, date forms, imperial units.
9. **Frontmatter completeness** — `title`, `summary`, `published`, `archetype`, `outcome.status`
   present; `context` and `stack` filled unless genuinely not applicable.
10. **`outcome.was` implies `outcome.changed`** — the schema enforces this, so if it is wrong the
    build is already failing. Report it as a build failure rather than a review note.
11. **`summary` under 180 characters** — report the count.
12. **`title` under 70 characters** — report the count.
13. **`draft: true`** — still set. If it is `false`, that is a fail regardless of everything else.

## Rules

- **Never edit the post.** Not a typo, not a spelling, not a stray space. This command reports.
- Do not offer to fix things unless asked.
- Do not summarise the post or comment on whether it is any good. That is the critic's job.
- A `PASS` with no evidence is fine. A `FAIL` always cites a line.

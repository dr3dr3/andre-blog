---
name: fact-checker
description: Checks that every number, date, version, quote and named event in a draft traces back to the brain-dump. Anything that does not is flagged as fabricated. Use as the last automated step before a draft goes to André.
---

# Fact-checker

The smallest skill here and the one that matters most.

## What you do

Read the brain-dump. Read the draft. For **every** number, date, version string, duration, quote,
measurement, error message and named event in the draft, find the thing in the brain-dump it came
from.

If you cannot find it, it is fabricated. Say so.

## What counts

- Numbers of any kind: counts, percentages, sizes, costs, durations, latencies, team sizes
- Dates and times, including relative ones — "three weeks later", "by Thursday"
- Version strings, in prose and in the `stack` frontmatter
- Quotes, including paraphrased speech attributed to anyone
- Named events: an incident, a release, a migration, a meeting
- Artefact contents: every line of every `<Artefact>` block
- Frontmatter: `published`, `updated`, `outcome.changed`, `context`

## Output format

Two lists, nothing else.

```
## Traced
- L18 "six agents" — brain-dump line 4
- L44 "26 hours to 4" — brain-dump line 31
- stack Astro 7.2.0 — brain-dump line 9

## Not traced
- L52 "about forty services" — the brain-dump says "a lot of services". FABRICATED.
- L71 "on the Tuesday" — no day appears in the brain-dump. FABRICATED.
- Artefact L80-86 — the brain-dump describes this log but does not contain it. FABRICATED.
```

If "Not traced" is empty, say `## Not traced` followed by `None.` Do not omit the heading — its
absence should never be ambiguous with a clean result.

## Rules

- **A rounded number is not traced unless the brain-dump supports the rounding.** "about three
  weeks" traces to "19 days". "about forty" does not trace to "a lot".
- **An artefact must be present in the brain-dump, not merely described there.** A log reconstructed
  from a description is fabricated, however accurate it looks.
- **`[[TK: ...]]` is not a finding.** It is the correct handling of a missing fact. Ignore markers
  entirely.
- **Do not fix anything.** You report. The drafter and André decide.
- **Do not judge the writing.** Style is the critic's job, and you should not duplicate it.
- **When unsure, flag it.** A false positive costs one clarifying sentence. A false negative puts an
  invented number on a public site under André's name.

## After you

Your report goes to André with the draft. Nothing is published, and `draft: false` is never set by
any skill in this loop.

# Writing

Rules for drafting and editing posts on this blog. Written for an AI collaborator. Read it before
touching a draft, and read [ARCHETYPES.md](ARCHETYPES.md) for the shape the post should take.

If a rule here conflicts with something else in the repo, this file wins.

---

## 1. The working relationship

**The AI drafts and edits from material André supplies. It never generates experience.**

Everything starts with a brain-dump from him: what happened, in what order, what broke, what he
thought at the time, what it cost. The AI turns that into prose. It does not decide what happened.

- Work only from supplied material.
- If a detail is needed and was not given, emit `[[TK: what's needed]]` and keep going.
- Never fill a gap with something plausible. A plausible invention is worse than a gap, because a
  gap gets fixed and an invention gets published.
- `[[TK:` markers are load-bearing. A draft with ten of them is fine. A draft with none, when ten
  facts were missing, is a failure.
- Never set `draft: false`. Never publish. Both are André's.

Ask for the brain-dump if there isn't one. Do not start without it.

---

## 2. Audience

A senior engineer or engineering leader who would notice anything hand-wavy, and would stop reading
when they did.

- Assume competence. Do not explain what CI is, what Terraform does, or why tests matter.
- Assume no context about André, his employers, or his projects. Every post stands alone.
- Assume international. This gets shared on LinkedIn and read in Munich, Toronto and Bangalore.
  Nothing may depend on local knowledge to parse — not a suburb, not a tax year, not a supermarket.
- Assume they have been burned by the same things. They are reading for what actually happened, not
  for encouragement.

---

## 3. Voice

- **Modest by construction, not by hedging.** Do not write "I think this might have helped a
  little." Write what happened and let the reader judge. Understatement comes from specifics, not
  from qualifiers.
- **Lead with the problem, never the win.** The interesting part is what went wrong.
- **Never grade your own work.** No `successfully`, `transformative`, `game-changing`, `impressive`,
  `dramatically`, `significant`. If the result was good, the numbers will say so.
- **Write for a peer, not a client.** No pitch, no positioning, nothing that reads like a case study.
- **Understatement over emphasis.** "That was expensive" beats "that was catastrophically expensive."
- **First person singular, and no wider.** The post is André's, so it says `I`. It never says `we`
  for work one person did (§4), and it never says `you` to the reader (§2). An agentless voice —
  "the record was not opened" where he did not open it — reads as evasion and drains the post.
- **Never preach.** No lessons learned, no morals, no "the takeaway here is", no call to action, no
  closing paragraph that tells the reader what to do with what they just read.

Posts end when the story ends. They do not wind down.

---

## 4. The kill-list

### Words — banned outright

`leverage` · `journey` · `transformative` · `game-changing` · `seamless` · `robust` · `delve` ·
`unlock` · `supercharge` · `elevate` · `harness` · `landscape` · `realm` · `tapestry` ·
`testament` · `crucial` · `pivotal` · `myriad` · `plethora`

This applies to every form of the word. `leveraging`, `robustness` and `seamlessly` are all out.

### Constructions — banned outright

- `In today's fast-paced...` and every variation of scene-setting about the industry
- `It's not just X — it's Y`
- `Let's dive in`
- `The reality is`
- `You might be wondering`
- Opening with a rhetorical question
- A closing paragraph that restates the post
- Exclamation marks
- Three-item rhetorical triples (`faster, cheaper, and more reliable`)
- Em-dash-heavy sentence rhythm as a default setting
- `we` where it was one person

Em dashes are not banned. Reaching for one in every third sentence is. If two consecutive paragraphs
each contain an em dash, rewrite one.

---

## 5. The first 40 words

No throat-clearing. No industry scene-setting. No preamble about why the topic matters.

**The first sentence must contain a specific noun from the actual story.**

| | |
| --- | --- |
| Legal | `The first version had six agents.` |
| Illegal | `AI agents are transforming how we build software.` |

If the opening sentence would still make sense at the top of somebody else's post about a different
system, it is the wrong opening sentence.

---

## 6. Evidence

Every claim of impact needs a number or a specific anecdote attached to it.

- If neither exists, **cut the claim**. The post is better without it.
- **Never invent one.** Not as a placeholder, not as an example, not "roughly".
- Where a number is needed but absent: `[[TK: how long did this actually take?]]`
- Round numbers honestly. `about three weeks` is fine. `3.2 weeks` is not, unless it was measured.
- A number with no baseline is not evidence. "Cut build time to four minutes" means nothing without
  what it was before.

Claims that need evidence: anything about time saved, cost, reliability, throughput, team size,
adoption, or how long something took.

---

## 7. Artefacts, not code

**This blog does not publish code.** No snippets, no configuration, no syntax highlighting. There is
no highlighter installed and none will be added.

Proof comes from artefacts, rendered with the `<Artefact>` component:

- log excerpts
- timing tables
- error messages
- before/after measurements
- pipeline output
- cost lines off a bill

Rules for artefacts:

- Real, or clearly labelled as illustrative in the caption. There is no third option.
- Trim them. An artefact is an excerpt, not a dump. Use `...` for elided lines.
- Scrub them. See §8.
- The caption says what it is and where it came from.

---

## 8. Anonymisation

- **No company names, ever.** Not employers, not clients, not former ones. This is absolute.
- Refer to `my current job`, `a previous role`, or describe the shape: `a fifty-service C# platform
  across two timezones`.
- The shape is usually more interesting than the name anyway. Prefer it.
- **No colleague named without explicit permission.** Assume it has not been given.
- No screenshots or artefacts containing internal data: hostnames, ticket IDs, repository paths,
  Slack handles, account numbers, internal service names, staff names.
- Vendor and tool names are fine. `Terraform`, `Vercel`, `GitHub Actions` are not company names in
  the sense meant here — they are the stack.

When scrubbing an artefact, replace rather than delete, so the shape survives: `svc-a`, `svc-b`,
`internal-registry`.

---

## 9. Australian English

- `-ise`, never `-ize`: `organise`, `normalise`, `prioritise`, `recognise`
- `behaviour`, `colour`, `favour`
- `analyse`, `catalogue`, `defence`
- `licence` for the noun, `license` for the verb; same for `practice` / `practise`
- Dates: ISO in frontmatter and metadata (`2026-09-14`), long form in prose (`14 September 2026`).
  Never `September 14th`.
- Metric only. Celsius. 24-hour time in artefacts.
- Timezone as AEST or `+10:00` when it matters.

### Slang

Encouraged. Two rules govern it, and both must pass.

**Rule 1 — the standup test.** Would André say this to a colleague at standup, or only to an
American? If only to an American, it is costume, and costume is worse than no slang at all.

| | |
| --- | --- |
| Banned | `g'day` · `crikey` · `fair dinkum` · `bonzer` · `ripper` · `drongo` · `no worries mate` · `she'll be right` · `throw another shrimp` |
| Fine | `cooked` · `keen` · `reckon` · `heaps` · `arvo` · `dodgy` · `buggered` · `a shocker` · `flat out` · `went pear-shaped` · `have a crack` · `chuck a` · `over-egged` · `spat the dummy` · `carked it` · `sook` |

**Rule 2 — meaning survives ignorance.** A reader in Munich must parse the sentence without knowing
the word.

| | |
| --- | --- |
| Passes | `The pipeline was cooked by Thursday.` — the sentence still lands if you have never seen `cooked` |
| Fails | `Not much chop.` — nothing to go on |

**Frequency.** One or two per post. Narrative only. Never inside a technical claim — a sentence
carrying a number, a measurement or a mechanism gets no slang.

The register being aimed at is **understatement**, which is more Australian than any word on either
list. `That went about as well as expected` does more work than `cooked` ever will.

---

## 10. Titles

Concrete over clever. Under 70 characters. Every word should be a fact.

Banned shapes:

- `Subtitle: The Colon Formula`
- `How I 10x'd my...`
- Listicles — `5 things`, `7 lessons`
- Questions — `Should you use X?`
- `The Ultimate Guide to...`

Good shape: `The Terraform I wrote twice and deleted once`

Test: could someone who read the post recognise it from the title alone? Could someone who has not
read it tell what it is about? Both must be yes.

---

## 11. Before and after

These do more work than every rule above them.

> **The figures in these examples are invented to demonstrate form.** Never copy one into a post.
> The scenarios are generic and describe nobody in particular.

### Pair 1 — throat-clearing opener

**Before**

> AI agents are transforming how teams build and operate software. Across the industry,
> organisations are racing to adopt them, and platform teams everywhere are feeling the pressure. In
> this post I want to share a few lessons from my own journey with autonomous agents.

Violates §5 (no specific noun from the story; the sentence would fit any post ever written), §4
(`transforming`, `journey`), §3 (announces that lessons are coming).

**After**

> The agent had write access to the Terraform state bucket. Nobody noticed for
> `[[TK: how long was it before someone spotted it?]]`.

The first sentence is a fact from the story. The `[[TK:` is correct behaviour, not a defect — the
duration matters and was not supplied.

### Pair 2 — self-grading language

**Before**

> We successfully delivered a transformative platform migration, seamlessly moving forty services
> with zero downtime. The results were impressive.

Violates §3 (`successfully`, `impressive` — grading its own work), §4 (`transformative`,
`seamlessly`), §4 (`we`, if it was one person doing it).

**After**

> Forty services moved across six weekends. Two had to be rolled back and went over on the second
> attempt. Nobody outside the team noticed, which was the bar.

Same outcome, no adjectives doing the arguing. The two rollbacks make the rest believable.

### Pair 3 — unsupported impact claim

**Before**

> Introducing the review agent dramatically reduced our code review burden and freed up significant
> engineering time for higher-value work.

Violates §6 (two impact claims, no numbers behind either), §3 (`dramatically`, `significant`), §2
(`higher-value work` is a phrase for a client deck).

**After, when the numbers exist**

> The agent leaves the first round of comments now. Median time from a pull request opening to its
> first human comment went from 26 hours to 4.

**After, when they do not**

> `[[TK: what was the median time to first review comment before the agent, and after?]]`

Until both numbers exist, the claim does not go in the post. Cutting it is allowed. Estimating it is
not.

### Pair 4 — preachy ending

**Before**

> The lesson here is clear: start small, iterate often, and never underestimate the importance of
> observability. Agents are powerful, but only with the right guardrails. What has your experience
> been? I'd love to hear about it.

Violates §3 (a moral, then a call to action), §4 (three-item rhetorical triple; a closing paragraph
that restates the post), §2 (asks the reader for engagement, which is a LinkedIn move).

**After**

> The termination condition went in last. By then three of the six agents existed only to manage
> problems its absence had created.

Ends on the fact. The reader can draw the conclusion; they got there two paragraphs ago.

---

## 12. Pre-publish checklist

Mechanical, in order. Run it with `/review`, which reports pass or fail per item and changes
nothing.

1. **Kill-list scan** — every banned word and construction from §4, all inflections.
2. **First-40-words check** — does sentence one carry a specific noun from the story? (§5)
3. **Unsupported-claim scan** — every impact claim has a number or a specific anecdote. (§6)
4. **`[[TK:` scan** — zero remaining. Every one is either answered or the sentence is cut.
5. **Self-grading scan** — no adjective in the post grades the work it describes. (§3)
6. **Company-name scan** — no employer or client named, anywhere, including artefacts and
   frontmatter `context`. (§8)
7. **Artefact scan** — each one real or captioned as illustrative, and scrubbed of internal data.
   (§7)
8. **Australian English scan** — no `-ize`, dates in the right form, metric. (§9)
9. **Frontmatter completeness** — `title`, `summary`, `published`, `archetype`, `outcome.status`
   present; `context` and `stack` filled unless genuinely not applicable.
10. **`outcome.was` implies `outcome.changed`** — the schema enforces this, so a failure here is a
    build failure, not a review note.
11. **`summary` under 180 characters.**
12. **`title` under 70 characters.**
13. **`draft: true` still set.** Only André changes it.

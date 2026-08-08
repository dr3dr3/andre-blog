# Archetypes

The shapes a post can take. Pick one before drafting; the skeleton is the outline.

Four are active. They are the only values the `archetype` field accepts, enforced by the schema in
[`src/content.config.ts`](../src/content.config.ts). The backlog at the bottom is a menu, not a
commitment — nothing there is defined until it is first used, and using one means adding it to the
enum in the same commit.

[WRITING.md](WRITING.md) governs voice and evidence throughout. This file only governs structure.

---

## War story

**Purpose.** Show judgement under real conditions. The reader learns more from what was tried and
abandoned than from the thing that eventually worked.

**When to use.** The default. Reach for this unless another archetype clearly fits better. Anything
that involved being wrong for a while belongs here.

**Target length.** 1,800–2,800 words.

**Opening rule.** Open on the system or the failure, never on the context. Context arrives in
section one; the first sentence names a thing.

### Skeleton

1. **The state of things** — what existed, what it was for, what constraints it ran under. Enough
   that the failure is legible. Not a full architecture tour. Two or three paragraphs.
2. **What went wrong** — the failure, concretely. This is where an artefact usually goes: the log
   excerpt, the error, the graph that first showed it. Include when it was noticed and by what,
   because "we found out from a customer" is itself the story sometimes.
3. **What I tried first** — **mandatory**. The attempts that did not work, in the order they
   happened, with what each one cost. Include the reasoning at the time, not the reasoning in
   hindsight. If an attempt made things worse, say so plainly.
4. **What actually worked, and what it cost** — the fix, and the price. Every fix has a price:
   something got slower, uglier, more manual, or was thrown away. A fix with no cost stated reads as
   a fix that has not been used in anger yet.
5. **What I'd do differently** — short. One or two paragraphs, specific to this system. Not general
   advice.

**This dies when** everything works first time. A war story where the first attempt succeeded is an
announcement, not a story — cut it down to a field note or drop it. It also dies when section 3 is
one sentence long, which usually means the failed attempts were embarrassing and got trimmed. Those
are the valuable part.

---

## Decision record

**Purpose.** Record a call, its constraints, and its cost, in a form that can be checked against
reality later.

**When to use.** A fork in the road with more than one defensible answer, where the reasoning is
more interesting than the outcome.

**Target length.** 900–1,500 words.

**Opening rule.** Open on the constraint, not on the decision. The reader should feel the box before
being shown the way out of it.

### Skeleton

1. **The constraint** — what forced a choice. Budget, headcount, a deadline, a dependency, a
   compliance requirement, an existing system that could not be touched. Be specific about what was
   actually fixed and what only looked fixed.
2. **The options** — each stated **fairly**, in the strongest form its advocates would recognise.
   Include the one that was obviously going to lose, and say why it was in the running at all.
   Usually three. Never one plus two decoys.
3. **The call, and when it was made** — the decision and its date. Dates matter here: a call made
   before a tool shipped a feature is a different call from one made after.
4. **What was traded away** — the cost, named. Every option not taken had something going for it.
   What was given up.
5. **How it's held up** — written later, or updated later. This is the section that makes the post
   worth keeping. If it is too early to say, say that, and set `outcome.status` accordingly so the
   post can be revised with `outcome.was` when it changes.

**This dies when** the rejected options are strawmen. If a reader who prefers option B does not
recognise their own argument in section 2, the post is a justification wearing a decision record's
clothes. Also dies when section 4 is empty, which means the trade-off has not been thought through.

---

## Teardown

**Purpose.** An honest assessment of a tool, service or pattern, with the conditions attached.

**When to use.** Enough hands-on time to have hit the edges. Not after a weekend.

**Target length.** 1,200–2,000 words.

**Opening rule.** Open on the thing itself and what it claims to do, in one or two sentences. No
industry context, no market framing.

### Skeleton

1. **What it is** — brief and neutral. Assume the reader can read a landing page; skip what it says
   about itself and describe what it does.
2. **What it's good at, with conditions** — the conditions are the point. "Good at X" is marketing.
   "Good at X when you have fewer than N of them and can tolerate Y" is a teardown. State the scale
   and shape of the use it was tested at.
3. **Where it falls over** — the edges, with the artefact that showed them. Include what was tried
   to work around each one.
4. **Who shouldn't use it** — named by situation, not by opinion. "Teams with more than one
   environment per region" beats "teams who care about simplicity."

**This dies when** it becomes a feature list or a hatchet job. If section 2 is thin, the tool was not
used long enough to write about. If section 3 is thin, the same. A teardown that recommends nothing
and warns of nothing has said nothing. Include the version tested in `stack`, since the assessment
expires.

---

## Field note

**Purpose.** One observation, recorded because it is true and small.

**When to use.** Something noticed that does not need an arc. A surprising default. A behaviour that
contradicts the documentation. A number that was not what anyone expected.

**Target length.** 300–600 words. Under 300 is fine.

**Opening rule.** The observation goes in the first sentence. There is no build-up; the post is
mostly the first sentence plus what makes it true.

### Skeleton

1. **The observation** — one or two sentences.
2. **What makes it true** — the artefact, the measurement, or the specific circumstance. Usually one
   paragraph and one artefact.
3. **The caveat, if there is one** — where this does not hold. One or two sentences. Omit if there
   isn't one; do not manufacture one for symmetry.

**This dies when** it grows a "what this teaches us" ending. The moment a field note reaches for
significance it becomes a bad war story. If it genuinely needs an arc, it was never a field note —
rewrite it as one of the others. It also dies when it is padded to look substantial; a 300-word post
that is true is worth more than a 900-word post that is 600 words of throat-clearing.

---

## Backlog

**A menu, not a commitment.** These are shapes that might earn a place. None of them is defined, and
none is in the schema. Flesh one out only when a real post needs it — write the full entry, add the
value to the `archetype` enum, and do both in the same commit. Delete anything here that has not
been wanted after a year.

| Name | Roughly |
| --- | --- |
| The Retrospective | A system revisited long after the fact, judged against what was expected of it |
| The Comparison | Two approaches run in the same conditions, with the conditions stated |
| The Number | A single measurement, and everything that had to be true for it to mean anything |
| The Reversal | A position held publicly, then abandoned, and what changed |
| The Postmortem | An incident, with the timeline as the spine |
| The Migration | Moving from one thing to another, with the long tail that nobody budgets for |
| The Anti-pattern | A shape that keeps recurring, and why it is attractive |
| The Constraint | A limit treated as a design input rather than an obstacle |
| The Inventory | What is actually running, counted honestly |
| The Boring Bit | The unglamorous work that made the interesting work possible |
| The Small Tool | Something built in an afternoon that is still in use |
| The Onboarding Note | What a new person needs to know, written for a stranger |
| The Reading Note | A paper or book, and what it changed |
| The Cost Breakdown | Where the money goes, itemised |
| The Handover | What was passed to someone else, and what had to be written down first |

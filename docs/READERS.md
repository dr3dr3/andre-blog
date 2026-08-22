# Readers

Who a post is for, by name. [WRITING.md §2](WRITING.md) sets the floor — the reader who would notice
anything hand-wavy. This file sets the target.

The floor never moves. Nothing here licenses explaining what CI is, naming an employer, or dropping
the evidence rules for a friendly reader. Where this file and WRITING.md disagree, WRITING.md wins.

Three sections: **readers** (people a post is written for), **bars** (people it is written knowing
they might read it), and **the queue** (ideas anchored to a person, waiting).

---

## Rules

- **One reader per post.** Never a blend. Blending three readers gets the average of everyone, which
  is what naming a reader was supposed to fix. Others may benefit; one gets served.
- **Name the class, not the person.** A post written for an individual is an in-joke. A post written
  for the class they stand for is a post. If an entry has no class, that person is a message, not an
  article.
- **The moment is the spec.** Who, without when, underdetermines the post. The moment decides the
  opening, the archetype and the evidence.
- **Write for the terminal reader.** Where the named reader forwards rather than uses, the post is
  written for whoever receives it. The forwarder's need is that what they passed on was real.
- **The publish test.** Would this post exist if the named reader never saw it? If no, it is outreach
  wearing a post's clothes. Send the message instead.
- **Aliases only, and nothing they would mind reading.** This repo is public. Entries describe a
  class and a need, never an individual's gaps. No real names, no employers, no detail that
  identifies a situation.
- **Entries expire.** An entry that has produced nothing in a year gets deleted, same as the
  archetype backlog.

---

## This blog is passed around, not found

Every reader here arrives by transmission — forwarded, seen in a feed, or mentioned in a
conversation. None arrives cold from a search at 11pm with the same error.

That is a choice, and it is already the one the repo makes: no search, no listicles, no guides,
nothing shaped for acquisition. Forty of the right readers beats four thousand strangers.

What follows from it:

- Every post must survive being forwarded with nobody present to explain it. WRITING.md §2 already
  demands this; here it is the primary constraint rather than a courtesy.
- The first 40 words carry more than usual, because the post is encountered rather than sought. The
  reader had no problem in mind when they arrived.
- [LINKEDIN.md](LINKEDIN.md)'s rule that the post must be worth reading even if nobody clicks is
  doing most of the work for at least one reader below, who will probably never click.
- The cost is that there is currently no path by which a stranger ever arrives. Accepted for now.
  See open items.

---

## The pipeline

**The thing explained twice at a catchup is the next post.**

Ideas arrive from conversations, not from a content calendar. Someone asks what has been going on,
the same explanation gets given more than once, and that explanation is a post that has already been
validated by a real person being interested in it.

Practice:

1. After a catchup, write down what got explained and who was interested. One line. Into the queue.
2. If a second person asks about the same thing, it moves up.
3. If it has been in the queue a year and nobody has asked again, delete it.

The queue holds ideas anchored to a person. It is expected to churn, and entries dying there is the
system working.

---

## Readers

### `chops` — senior manager, analytics and app teams

**Stands for.** Managers whose people are further ahead than the organisation's guardrails, and who
have to get things past a function whose job is to say no.

**Knows.** Enough to follow anything, not enough to build it. Does not need the tool explained.

**Reads to forward.** Terminal reader is an engineer on his team. Write for them. His need is that
what he passed on made him look like he brought something real.

**The moment.** He is about to talk to his team and wants something concrete to bring.

**Wants.** Not the tool — his people already know the tools exist. The tool *plus the constraint it
survived*: where the data sat, what it did not touch, what was said in the review.

**Loses them at.** A list of tools. Stale in a quarter, and banned by WRITING.md §10 anyway.

**Shapes that fit.** Decision record · teardown, especially the "who shouldn't use it" section.

**Posts so far.** —

### `perks` — platform engineer, deep in the practices

**Stands for.** Practitioners who believe in the practices already and are tired of being advocated
at. They want to see them run at real scale with the costs stated.

**Knows.** More than the post will contain about most of it. Skip the case for the practice entirely.

**Reads from a feed.** Encountered, not sought, and may never click through. The LinkedIn post
carries most of the weight for this reader.

**The moment.** None. There is no trigger and no search — this reader is reached by showing up.

**Wants.** Proof of practice, not argument for it. The value is in what it cost. A post where it all
worked gives this reader nothing they cannot get from a conference talk. The parts that were a slog
are the parts that land.

**Loses them at.** Anything that reads as positioning. If a post exists to update someone's
impression of the author, it comes out as a pitch and this reader can smell it.

**Shapes that fit.** War story — section 3 is the reason this reader exists.

**Posts so far.** —

### `louis` — agile practitioner, deep process knowledge

**Stands for.** Practitioners with real depth in process and organisational design, and thin ground
in delivery mechanics. Underserved: the DevOps writing assumes an engineer, the agile writing assumes
no interest in pipelines.

**Knows.** More theory than the post will contain. Do not explain the practices back to this reader.

**The moment.** Mid-conversation with engineering peers, wanting to hold their end of it.

**Wants.** The model underneath the vocabulary, tied to one system that actually ran. Vocabulary
alone gets them caught out.

**The test.** Does it survive one follow-up question from someone who does this daily? If the reader
can repeat a phrase but not defend it, the post failed.

**Loses them at.** Abstraction with no system under it. This is the reader most likely to be served
by a conceptual post and most likely to be failed by one.

**Shapes that fit.** Open — see open items. Nearest existing fit is the Reading Note in the
[archetype backlog](ARCHETYPES.md).

**Posts so far.** —

### `bridge` — engineer explaining delivery reality to non-technical stakeholders

**Stands for.** Anyone who gets asked "why can't AI just do this?" and does not have a good answer
ready that is neither dismissive nor a lecture.

**Origin.** A non-technical friend. The friend is not the reader — serving them directly would mean
explaining what the blog is built not to explain. They still get a link that makes sense to them.

**Knows.** Everything technical. The difficulty is not knowledge, it is having the explanation to
hand.

**The moment.** Immediately after being asked, usually by someone with budget.

**Wants.** One worked example where "just get the AI to do it" pulled a long thread — still faster
with AI, but the complexity moved rather than vanished. This blog is the available artefact: a static
site that "should" be trivial, with a devcontainer, Terraform, DNS and a writing system behind it.

**Loses them at.** Anything that sounds like AI scepticism. The point is not that it does not work.

**Shapes that fit.** War story · field note.

**Posts so far.** —

`[[TK: does this reader have a real person behind it? An alias would sharpen the entry.]]`

### `matt` — consultant, owns a structured-thinking method

**Stands for.** People whose professional method is being encoded into tools by other people, and
practitioners watching that happen to methods they use.

**Weak tie.** Met through a past engagement, not a standing relationship. Reach-out is part of the
motive, which is exactly what the publish test above is for.

**The moment.** Not established. `[[TK: what would he be in the middle of?]]`

**Wants.** Presumably not to have his method automated without a conversation first.

**Before anything is written.** The method is commercial and it is the consultancy's revenue.
Encoding it into a published skill is not obviously ours to give away. Talk to him first. This also
resolves the publish test — once the conversation has happened, the post no longer depends on him
seeing it.

**Shapes that fit.** War story · teardown. The post is what happens when a rigid human method is
encoded as a skill: where it resists, and what it assumes a person will do that a model will not.

**Posts so far.** —

---

## Bars

Not audiences. People a post is written knowing they might read it. A bar gets no moment and no post
written for it; it gets applied to every post.

### `sto` — very experienced engineer, opinionated

**The bar.** Would this look considered?

**What it is not.** It is not a reason to stay vague. This blog publishes no code at all
(WRITING.md §7), so the thing being guarded against is not on the page. Vagueness is the actual
failure mode here, not exposure.

**What it actually catches.** Unearned confidence. An architectural claim with no constraint
attached. An approach described as though the alternatives never existed. A trade-off asserted rather
than paid for.

**How to apply it.** Push toward more specificity, not less. If a claim cannot survive being read by
someone who has done it, cut the claim or add what makes it true.

**Note.** The private conversation this bar is aimed at is a better outcome than the post. The post
is what starts it.

---

## The queue

Ideas anchored to a person. Expected to churn. Deleting is normal.

| Idea | Reader | State |
| --- | --- | --- |
| DevOps as the other half of Agile, carried by one system that actually ran | `louis` | Wanted. Blocked on the archetype question. |
| "Just get the AI to do it" and the thread it pulled — this blog as the worked example | `bridge` | Ready. Best-supplied idea in the queue; the artefacts are in the repo. |
| Encoding a rigid human method as an AI skill, and where it resists | `matt` | Blocked. Conversation first. |
| A day of AI-assisted coding | — | Held. A container looking for content — see open items. |

---

## Open items

1. **No archetype fits a conceptual argument.** `louis` needs one. The four active archetypes are all
   anchored to an event or a thing. Options: route it through the Reading Note in the backlog, or
   define a new archetype and add it to the enum in the same commit per ARCHETYPES.md. Not resolved
   here.
2. **No cold readers.** Every entry arrives by transmission. If that stops being acceptable, the fix
   is not SEO — it is one or two entries for people who arrive with a problem, which will pull toward
   field notes and teardowns, the two archetypes the current readers barely touch.
3. **The day-in-the-life post.** Held deliberately. The frustrations are the content; the day is a
   container. Three frustrations as field notes first, then reconsider whether the day-shaped post
   still has a reason to exist.
4. **Video.** A home-office video means third-party JS on pages that currently carry none, and sits
   next to "an author photo" on the rejected list in [CLAUDE.md](../CLAUDE.md). A decision, not a
   detail. Undecided.

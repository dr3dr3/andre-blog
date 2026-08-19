# Roadmap

**Everything on this page is not-now.** It is recorded so the reasoning survives, not because any
of it is scheduled. Nothing here should influence a decision about the blog as it stands.

## Phase 2 — `lab.andredreyer.com`

**Not now.**

A second site for things the blog cannot hold: live demos, an agent playground, dashboards. Served
from a home Talos Kubernetes cluster, exposed through a Cloudflare Tunnel so there is no port
forwarding and no inbound firewall rule.

### Why it is a separate site

The blog stays on managed hosting because a stranger arriving from LinkedIn must find it up. That
is the entire argument. A personal site that is down when someone follows a link has spent whatever
the link earned.

The lab is where downtime is acceptable, and where saying so is honest. A cluster in a house has
power cuts, kernel upgrades and someone unplugging the wrong thing. Putting demos there and the
blog on Vercel means neither has to pretend to be the other. A demo that is occasionally offline is
a demo. A blog that is occasionally offline is a broken link.

The split also keeps the blog's constraints intact. The blog has no server, no JavaScript beyond
analytics, and no state. A playground has all three by definition. Rather than relax the blog's
rules to accommodate it, the two live apart.

### HTMX

**Rejected for the blog. A genuine candidate for the lab.**

It was rejected here because the blog has no server-driven state to swap — every page is static
HTML generated at build time, and there is nothing for HTMX to do. Adding it would mean adding a
dependency and a script tag to a site whose position is that it has neither.

The lab is the opposite case. An agent playground and a dashboard have real server state,
partial updates, and forms that submit somewhere. That is what HTMX is for, and the argument that
killed it here is the argument for it there. Revisit it when the lab exists, not before.

### Open questions, unanswered

- Whether the lab shares this repository or gets its own. Sharing means one deploy pipeline and one
  set of tokens; separating means the blog's build cannot be broken by a demo.
- Whether demos are linked from posts. A post that depends on a live demo stops working when the
  demo does, which argues for artefacts in the post and the demo as a bonus.
- What happens to a demo that nobody uses. There should be an expiry rule before there are demos.

## Phase 2 — `/scratch`

**Not now.**

A second content type for things too small to be a post: one image, a short caption, dry rather than
loud. Instagram's unit, not its register. It exists because the only unit of output today is a
1,800–2,800 word post through a critic loop, and there is nothing between that and silence.

One item is a **scrap**. Named that way because `note` collides with the `field-note` archetype and
with the RSS channel description, which already opens "Notes on ...".

### Why it is not on article pages

The obvious placement is a strip of recent scraps on every post, catching readers arriving from
LinkedIn. That is the version to avoid.

A post page is engineered down to its first 40 words for a reader who arrived with no problem in
mind. A stream beside it competes with the thing everything else was built to protect. `perks` in
[READERS.md](READERS.md) is the reader who switches off at anything that reads as positioning, and
is also the reader most likely to arrive from a feed.

The second argument is staleness. A feed carries an implied frequency, and a newest item seven
months old signals abandonment on the page where that costs the most. No strip, no sidebar, no
embed. A route linked from the header, and nothing else.

### What has to be true first

1. **Ten scraps written and sitting in the repository.** If ten cannot be reached, the format has no
   legs, and finding that out costs nothing. Shipping the route before the backlog exists ships an
   empty page.
2. **A named reader and a one-line purpose**, the way [ARCHETYPES.md](ARCHETYPES.md) defines the
   four shapes. READERS.md's own test applies: a format with no class of reader is a message, not a
   format.
3. **The design pass.** An image grid is the largest visual decision on this site. Building it while
   [DESIGN.md](DESIGN.md) is a stub makes that decision by accident.
4. **Where the images come from, decided in writing.** Photographs of physical things and generated
   diagrams are fine. Work screenshots are not, and the difference matters more here than in posts.
   A scrap is casual by design, which is the same as saying it skips the drafter, the critic and the
   fact-checker. [WRITING.md §8](WRITING.md) anonymisation and the company-name scan still apply,
   with no review step in front of them.

One more thing that is true and worth stating: neither writing agent can produce a scrap. The two
rules that override everything else are never invent facts and never write in first person as André.
A first-person aside is the single format the writing system offers no help with. Every scrap is
hand-written.

### Sketch

Enough to react to, not a design.

```ts
// src/content.config.ts
const scratch = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/scratch' }),
    schema: ({ image }) =>
        z.object({
            image: image(), // optimised at build time; no CDN, no external host
            alt: z.string().max(140), // required, never optional
            caption: z.string().max(280), // or the file body, if captions want links
            published: z.date(),
            draft: z.boolean().default(false),
            tags: z.array(z.string()).default([]),
        }),
});

export const collections = { posts, scratch };
```

```
src/pages/scratch/index.astro       the stream, newest first, one column
src/pages/scratch/[...slug].astro   permalink, so one scrap can be linked from LinkedIn
src/lib/scratch.ts                  getScraps(), mirroring src/lib/posts.ts, drafts filtered in prod
```

No JavaScript, consistent with every other page. Scraps stay out of `/rss.xml`, which carries posts.
A second feed at `/scratch/rss.xml` is the answer if anyone asks for one.

### Open questions, unanswered

- Whether a scrap ever appears on the home page. The same argument as the article-page strip, weaker,
  because the home page is not carrying a forwarded reader mid-article.
- What Vercel Analytics has to show on the header link before an embed is reconsidered. If nobody
  follows it, embedding only moves the ignoring onto a page that matters more.
- Whether scraps carry a visible date. Hiding it hides staleness, which is not the same as fixing it.

## Not planned

Listed because they come up, and because a written "no" saves the argument next time.

- Comments · site search · a dark-mode toggle · newsletter signup · view counters · webmentions ·
  tag clouds · reading-progress bars · syntax highlighting · social share buttons · an author photo
- A CMS. Posts are MDX in the repository and the writing workflow depends on that.
- Pagination on the index, until there are 30 posts.

## Deferred, with a trigger

- **Change failure rate and MTTR in the footer.** They need deployment outcomes from the Vercel API,
  which the static build does not have. They render as em dashes and the labels stay, because the
  gap is honest. Trigger: a reason to run something at build time that can hold a Vercel token.
- **A real `docs/DESIGN.md`.** The current one is a stub recording the tokens. Trigger: the design
  pass.
- **Moving the repository off the Windows drive.** The dev server does not work over the v9fs bind
  mount — see "Local development" in the README. Trigger: a clean, committed tree.

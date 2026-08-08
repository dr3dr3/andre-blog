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

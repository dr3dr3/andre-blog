# andre-blog

Personal technical blog for André Dreyer at [andredreyer.com](https://andredreyer.com). Astro, static, MDX posts in the repo. This file is a router; the detail is in `docs/`.

## Two rules that override everything else

1. **Never invent facts.** No fabricated numbers, dates, tool versions, metrics, error messages,
   quotes or events — anywhere, including documentation, examples and placeholder content. Where a
   real value is needed and unknown, emit `[[TK: what's needed]]` and move on.
2. **Never generate André's experience.** Posts are written in his voice, first person, because
   they are his. That is a licence to write `I` for things he told you, not a licence to decide
   what he did, thought or felt. If he did not supply it, he did not do it.

Also: never set `draft: false` unless André asks for it in that turn, and never change DNS or
Vercel settings by hand — those are configured outside this repo, see [docs/INFRA.md](docs/INFRA.md).

## Git

You commit, merge and push, including to `main`. A push to `main` deploys, so the last thing you do
before pushing is run `pnpm build` and `pnpm check` — do not push a red build. Branch, then merge
back with `--no-ff`; do not commit directly on `main`. Never force-push and never rewrite published
history. `draft: false` remains the one thing you do not decide: a post going public is André's
call, and deploying is not the same as publishing.

## Stack

| Concern | Decision |
| --- | --- |
| Framework | Astro 7, `output: 'static'`, no adapter |
| Content | MDX in `src/content/posts/`, no CMS |
| Styling | Plain CSS with custom properties. No Tailwind, no framework. |
| JS | None on content pages except Vercel Analytics |
| Package manager | pnpm, pinned via `packageManager` |
| Hosting | Vercel, Hobby, deployed by the Git integration |
| DNS | Route 53, set by hand. See [docs/INFRA.md](docs/INFRA.md) — the zone also carries mail. |

**Rejected, do not add:** HTMX · Tailwind · a CMS · comments · site search · a dark-mode toggle
(respect `prefers-color-scheme`) · newsletter signup · view counters · webmentions · tag clouds ·
reading-progress bars · syntax highlighting · share buttons · an author photo.

## Where things are

| | |
| --- | --- |
| [docs/WRITING.md](docs/WRITING.md) | How posts get written. The important one. Read it before touching a draft. |
| [docs/ARCHETYPES.md](docs/ARCHETYPES.md) | The four post shapes and their skeletons |
| [docs/READERS.md](docs/READERS.md) | Who each post is for, by name. Pick one before drafting. |
| [docs/LINKEDIN.md](docs/LINKEDIN.md) | Distribution |
| [docs/DESIGN.md](docs/DESIGN.md) | Design tokens. A stub, pending a design pass. |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Phase 2 and beyond. All not-now. |
| [docs/INFRA.md](docs/INFRA.md) | Vercel and DNS, as configured. Read before touching either. |
| [docs/METRICS.md](docs/METRICS.md) | What the four footer numbers count, and what they refuse to answer. |

## The writing loop

```
brain-dump → drafter → critic (objections only) → drafter (revise)
                            ↕ max 2 rounds
                       fact-checker → André
```

`/newpost` interviews and scaffolds. `/review` runs the pre-publish checklist. The `critic` may
never rewrite prose; the `fact-checker` traces every number back to the brain-dump. Two critic
rounds maximum, then it goes to André regardless of unresolved objections. Brain-dumps live in
`drafts/`, gitignored — they hold company names and unscrubbed data.

## Commands

`pnpm dev` · `pnpm build` · `pnpm preview` · `pnpm check`. `astro dev` does not work when the repo
sits on a Windows drive — see "Local development" in the [README](README.md).

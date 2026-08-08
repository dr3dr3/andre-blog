# andre-blog

Personal technical blog for André Dreyer — [andredreyer.com](https://andredreyer.com).

Astro, static output, MDX posts in the repo, plain CSS, no client-side JavaScript beyond Vercel
Analytics. Deployed by Vercel's Git integration; DNS and Vercel project configuration in Terraform.

[CLAUDE.md](CLAUDE.md) is the entry point for anything working in this repo.

## Local development

```bash
pnpm install
pnpm dev        # http://localhost:4380
pnpm build      # -> dist/
pnpm preview    # serves dist/
pnpm check      # astro check
```

Requires Node 22.12+ and pnpm (pinned by `packageManager`; `corepack enable` will fetch it).

**In the devcontainer, `node_modules` and the pnpm store are Docker named volumes** rather than
directories inside the workspace. `/workspace` is a bind mount, and on a WSL2 host that means v9fs,
where a single small file read costs around 12ms — enough that Astro's type generation took 21
seconds and Vite's dev server timed out before serving a page. On volumes the same work takes
milliseconds. The mounts are declared in
[.devcontainer/devcontainer.json](.devcontainer/devcontainer.json). **After a container rebuild the
volume is empty, so run `pnpm install` again.**

**`astro dev` does not work if the repo is cloned onto a Windows drive.** The volumes above fix
`node_modules`, but the project source is still on v9fs, and there the dev server takes ~48 seconds
to start and its file watcher never fires — it serves stale pages after an edit. The same project on
a Linux filesystem starts in 1 second and watches correctly. If you hit this, clone into the WSL2
Linux filesystem (`~/code/andre-blog` inside the distro) and open that folder instead. Until then,
`pnpm build && pnpm preview` is the working loop; the build takes about 4 seconds.

## Writing a post

```
brain-dump → drafter → critic (objections only) → drafter (revise)
                            ↕ max 2 rounds
                       fact-checker → André
```

1. **`/newpost`** interviews you for a brain-dump, helps pick an archetype, and scaffolds
   `src/content/posts/<slug>.mdx` with `draft: true`. It does not write the post.
2. **The `drafter` skill** turns the brain-dump into a draft, following
   [docs/WRITING.md](docs/WRITING.md) and the skeleton in [docs/ARCHETYPES.md](docs/ARCHETYPES.md).
   It works only from supplied material and marks anything missing as `[[TK: ...]]`.
3. **The `critic` skill** returns objections and never rewrites prose. Two rounds maximum.
4. **The `fact-checker` skill** traces every number, date and version back to the brain-dump.
   Anything that does not trace is flagged as fabricated.
5. **`/review`** runs the pre-publish checklist and reports pass or fail per item.
6. **You** set `draft: false`. No skill ever does.

Brain-dumps live in `drafts/` and are gitignored — they hold company names and unscrubbed
artefacts. Two rules override everything else: never invent a fact, and never write in first person
as André. Both are in [CLAUDE.md](CLAUDE.md) and [docs/WRITING.md](docs/WRITING.md).

Sharing on LinkedIn: [docs/LINKEDIN.md](docs/LINKEDIN.md).

## Deploying

Push to `main`. Vercel's Git integration builds and deploys; nothing else is involved and Terraform
plays no part in it. Pull requests get preview deployments automatically.

Terraform owns DNS and the Vercel project's configuration only, and is applied by hand. CI plans on
pull requests touching `infra/` and never applies. Setup, the import path for the existing Vercel
project, and the required secrets are in [infra/README.md](infra/README.md).

## Layout

| | |
| --- | --- |
| `src/content/posts/` | posts, MDX |
| `src/lib/` | `posts.ts` (the only reader of the collection), `dora.ts`, `format.ts` |
| `src/styles/tokens.css` | every colour and type token; the only file with a literal colour |
| `docs/` | writing, archetypes, LinkedIn, design, roadmap |
| `.claude/` | skills and slash commands |
| `infra/` | Terraform |
| `public/` | fonts, `llms.txt`, favicon |

## Licence

[MIT](LICENSE) for the code. Post content is not covered by it.

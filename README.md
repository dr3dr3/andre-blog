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

Requires Node 22.12+ and pnpm (pinned by `packageManager`; the devcontainer's `post-create.sh`
installs the corepack shim, or run `corepack enable` yourself).

### Open this repo in a container volume

**Use "Dev Containers: Clone Repository in Container Volume" rather than cloning to disk and opening
the folder.** It puts the working tree on a Docker volume — ext4, native container storage — instead
of a bind mount of the host filesystem.

This matters on a Windows host, where the bind mount is v9fs and a single small file read costs
around 12ms. Measured on this project, with everything else identical:

| Working tree on | `astro dev` ready | File watcher |
| --- | --- | --- |
| v9fs bind mount (a Windows drive) | 48–53s | never fires — serves stale pages after an edit |
| ext4 (a container volume) | **1s** | works |

`astro build` is unaffected either way, at about 4 seconds. It is only the dev server that suffers,
because Vite fetches thousands of modules through its SSR module runner on first request. Disabling
the watcher does not help, and a polling watcher makes it worse — the server then never becomes
ready at all. Cloning into the WSL2 Linux filesystem works equally well if you prefer that; the
requirement is a Linux filesystem, not WSL specifically.

Opening the folder as a plain bind mount still works. You get the slow dev server, and
`pnpm build && pnpm preview` as the practical loop.

**After any container rebuild, run `pnpm install`** — `node_modules` lives in the tree and the pnpm
store volume only caches the packages, it does not populate `node_modules` for you.

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

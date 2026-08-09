# Infrastructure

Everything the site depends on that is not in this repo. It is small enough to be a document
rather than a toolchain — five settings across two dashboards, all set once.

This replaced a Terraform configuration in `infra/`, removed on 2026-08-09. See "Why there is no
Terraform" at the bottom.

## What serves the site

Vercel, Hobby plan, personal account (not a team).

| | |
| --- | --- |
| Project | `andre-blog` |
| Project ID | `prj_mZwoP1ghGGQuj27z2KzBukygo8vi` |
| Framework preset | Astro |
| Repository | `dr3dr3/andre-blog`, production branch `main` |
| Build settings | preset defaults, unchanged. There is no `vercel.json`. |
| Deployment URL | `andre-blog-kohl.vercel.app` |

Deployments come from Vercel's Git integration on every push to `main`. Pull requests get preview
deployments. Nothing else deploys, and nothing should be added that does.

Web Analytics is enabled in the dashboard. The client script is in
[`src/components/Analytics.astro`](../src/components/Analytics.astro).

## Domains

`andredreyer.com` serves the site. `www.andredreyer.com` returns a 308 to the apex.

The direction matters: [`astro.config.mjs`](../astro.config.mjs) sets `site:
'https://andredreyer.com'`, so every canonical URL, sitemap entry and RSS link points at the apex.
If `www` served the site instead, every one of those links would bounce through a redirect. One
canonical origin, for links, RSS and search.

Vercel does **not** own the nameservers, and must not be allowed to. Route 53 holds the zone, and
the zone also holds the mail records below.

## DNS

Public hosted zone `andredreyer.com` in Route 53, delegated from the registrar to four AWS
nameservers (`ns-9.awsdns-01.com`, `ns-642.awsdns-16.net`, `ns-1166.awsdns-17.org`,
`ns-1738.awsdns-25.co.uk`).

Two records point at Vercel. Both were copied from **View DNS configuration** on the Vercel Domains
page, and both are verified live as of 2026-08-09:

| Record | Type | Value | TTL |
| --- | --- | --- | --- |
| `andredreyer.com` | A | `216.198.79.1` | 300 |
| `www.andredreyer.com` | CNAME | `f91a3d226241db90.vercel-dns-017.com.` | 300 |

The apex is a plain A record, not a Route 53 alias — aliases can only target AWS resources. TTL is
300 rather than the 86400 on the mail records, deliberately, so a bad value is cheap to correct.

### If the site goes dark, check this first

**Vercel has changed its apex IP address before.** These values are hand-copied and nothing is
watching them. When Vercel moves, the A record above keeps resolving to an address that no longer
serves the site, and nothing in this repository will notice.

The symptom is both domains flipping to **Invalid Configuration** on the Vercel Domains page. The
fix is to read the current values from **View DNS configuration** and update the two records.

```bash
curl -sI https://andredreyer.com | head -1          # expect 200
curl -sI https://www.andredreyer.com | head -1      # expect 308
curl -s -H 'accept: application/dns-json' \
  'https://cloudflare-dns.com/dns-query?name=andredreyer.com&type=A' | jq -r '.Answer[]?.data'
```

## Mail — do not break it

The same zone carries a working Proton Mail configuration: `MX`, a `TXT` record set at the apex, a
`_dmarc` `TXT`, and three `_domainkey` `CNAME` records. Web and mail records coexist at the same
name without interacting, so the two records above do not affect mail.

Two ways to break it anyway:

- **"Import zone file" in the Route 53 console** can replace records wholesale. Do not use it.
- **The apex `TXT` record set holds two values** — the `protonmail-verification=…` string and
  `v=spf1 include:_spf.proton…`. Any edit that writes only one silently breaks either domain
  verification or outbound mail deliverability. If something ever asks you to add a TXT record at
  the apex, merge it into that set rather than adding a second one, and never create a second
  `v=spf1` record.

## Why there is no Terraform

There were five resources: the Vercel project, its two domains, and two Route 53 records. All of
them are set-once. Against that, Terraform wanted an S3 state bucket, an IAM role with a GitHub
OIDC trust policy, three repository secrets, a rotating Vercel API token, a Terraform version pinned
in three places, and weekly Dependabot provider bumps.

The one thing it offered that a dashboard does not was drift detection — it read Vercel's
recommended apex IP at plan time instead of pinning it, so a change on Vercel's side would surface
as a diff. But the plan workflow only ran on pull requests touching `infra/`, and nothing ever
touches `infra/` when the infrastructure never changes. The mechanism was sound and the wiring
defeated it.

The trade accepted here is the hand-copied IP above, mitigated by knowing where to look when the
site breaks. If the estate ever grows past a handful of resources, the configuration is in git
history and `git revert` brings it back.

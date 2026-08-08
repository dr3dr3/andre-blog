# infra

Terraform for `andredreyer.com`. It owns **DNS and Vercel project configuration, and nothing else.**

**Deployments are not managed here.** Vercel's Git integration deploys on every push to `main`.
There is no `vercel_deployment` resource and there should never be one — it would put Terraform and
the Git integration in a fight over the same object.

| File | Owns |
| --- | --- |
| `backend.tf` | S3 remote state, `ap-southeast-2`, encrypted, S3-native locking |
| `providers.tf` | provider versions and configuration |
| `vercel.tf` | the Vercel project, and the apex and www domains |
| `dns.tf` | the Route 53 A and CNAME records |
| `variables.tf` / `outputs.tf` | inputs and outputs |

## Prerequisites

1. **The Vercel project exists already.** It is created in the dashboard and imported here — see
   [Importing](#importing-the-existing-vercel-project).
2. **The Route 53 hosted zone exists already.** It is looked up with a data source, not managed.
   Terraform will not create it and will not delete it.
3. **An S3 bucket for state**, in `ap-southeast-2`, with versioning on. Its name is account-specific
   and is not committed.

## Configuration

Nothing sensitive lives in a file. `*.tfvars` and `backend.hcl` are gitignored.

**The Vercel API token comes from the environment:**

```bash
export VERCEL_API_TOKEN='...'   # Vercel -> Settings -> Tokens
```

**AWS credentials** come from your usual profile or SSO session. The devcontainer defaults
`AWS_REGION` to `ap-southeast-2`.

**The state bucket** is passed at init time, because a backend block cannot take variables:

```bash
cat > backend.hcl <<'EOF'
bucket = "your-tfstate-bucket-name"
EOF

terraform init -backend-config=backend.hcl
```

## Usage

```bash
terraform init -backend-config=backend.hcl
terraform plan
terraform apply          # by hand, deliberately — CI only ever plans
```

## Importing the existing Vercel project

The project is created in the Vercel dashboard first, because connecting the GitHub repository
requires the OAuth flow. Terraform then adopts it.

1. Create the project in the dashboard, connect it to `dr3dr3/andre-blog`, and let the first
   deployment run. Framework preset: Astro.
2. Add both domains in the dashboard (`andredreyer.com` and `www.andredreyer.com`) so Vercel starts
   reporting DNS configuration for them.
3. Find the project ID: **Project → Settings → General → Project ID**, or

   ```bash
   curl -s -H "Authorization: Bearer $VERCEL_API_TOKEN" \
     'https://api.vercel.com/v9/projects/andre-blog' | jq -r '.id'
   ```

4. Import, innermost object first:

   ```bash
   terraform import vercel_project.blog                 prj_xxxxxxxxxxxxxxxxxxxx
   terraform import vercel_project_domain.apex          prj_xxxxxxxxxxxxxxxxxxxx/andredreyer.com
   terraform import vercel_project_domain.www           prj_xxxxxxxxxxxxxxxxxxxx/www.andredreyer.com
   ```

   On a team account the import ID is prefixed with the team ID —
   `team_xxxx/prj_xxxx/andredreyer.com`. On Hobby it is not.

5. `terraform plan` and read it carefully. A clean plan means the import matched. Anything proposing
   to **destroy** the project means the import did not take — do not apply.

The Route 53 records are new, so they are created rather than imported. If records for the apex or
`www` already exist in the zone, import them too or the apply will fail:

```bash
terraform import aws_route53_record.apex  ZONEID_andredreyer.com_A
terraform import aws_route53_record.www   ZONEID_www.andredreyer.com_CNAME
```

## The DNS targets are read from Vercel, not pinned

`dns.tf` does **not** hardcode Vercel's apex IP or the `www` CNAME target, and there is no variable
for either. `vercel/vercel` v3 exposes both through the `vercel_domain_config` data source:

- `data.vercel_domain_config.apex.recommended_ipv4s` → the A record
- `data.vercel_domain_config.www.recommended_cname` → the CNAME

This is deliberate. Vercel has changed its apex address historically, and a value pinned in a
variable goes stale silently — the site keeps resolving to an address that no longer serves it,
and nothing in the configuration notices. Reading it at plan time means a change on Vercel's side
turns up as a diff on the next plan instead.

Two consequences worth knowing:

- **A plan needs `VERCEL_API_TOKEN`** even when only DNS is changing.
- **The data sources depend on the `vercel_project_domain` resources**, so on a first apply against
  an empty state they are read after the domains are attached. Vercel cannot report configuration
  for a domain that is not on the project yet.

## CI

[`.github/workflows/terraform-plan.yml`](../.github/workflows/terraform-plan.yml) runs `fmt -check`,
`init`, `validate` and `plan` on any pull request touching `infra/`, and writes the plan to the job
summary. It never applies.

It needs, on the repository:

| Kind | Name | Value |
| --- | --- | --- |
| Secret | `AWS_ROLE_ARN` | IAM role for GitHub OIDC to assume, with read access to the state bucket and the hosted zone |
| Secret | `VERCEL_API_TOKEN` | as above |
| Variable | `TF_STATE_BUCKET` | the state bucket name |

Pull requests from forks are skipped, because they do not receive secrets and could only fail.

The Terraform version is pinned in the workflow and constrained in `providers.tf`. Bump both
together.

## Not managed here

- Deployments, build settings changed in the dashboard, and preview URLs
- The hosted zone itself, and any other record in it
- Vercel Analytics (enabled in the dashboard; the client script is in
  [`src/components/Analytics.astro`](../src/components/Analytics.astro))
- The state bucket and its IAM policy

variable "aws_region" {
  description = "AWS region. Route 53 is global, but the provider and the state bucket need one."
  type        = string
  default     = "ap-southeast-2"
}

variable "domain_name" {
  description = "Apex domain the blog is served from."
  type        = string
  default     = "andredreyer.com"
}

variable "route53_zone_name" {
  description = <<-EOT
    Name of the existing public hosted zone. The zone is not managed here — it
    is looked up — so this must match a zone that already exists in the account.
  EOT
  type        = string
  default     = "andredreyer.com"
}

variable "vercel_team_id" {
  description = <<-EOT
    Vercel team the project belongs to. Leave null for a personal account, which
    is what the Hobby plan uses.
  EOT
  type        = string
  default     = null
}

variable "vercel_project_name" {
  description = "Name of the Vercel project. Must match the project created in the dashboard."
  type        = string
  default     = "andre-blog"
}

variable "github_repo" {
  description = "GitHub repository Vercel's Git integration deploys from, as owner/name."
  type        = string
  default     = "dr3dr3/andre-blog"
}

variable "production_branch" {
  description = "Branch Vercel treats as production."
  type        = string
  default     = "main"
}

# There is no variable for the Vercel apex A record or the www CNAME target.
# vercel/vercel v3 exposes both through the vercel_domain_config data source
# (recommended_ipv4s, recommended_cname), so dns.tf reads them from Vercel at
# plan time instead. A pinned value would go stale silently. See README.md.

variable "dns_ttl" {
  description = "TTL for the apex and www records, in seconds."
  type        = number
  default     = 300
}

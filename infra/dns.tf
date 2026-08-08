# The hosted zone is looked up, not managed. It predates this configuration and
# may hold records for other things; Terraform owns only the two records below.

data "aws_route53_zone" "primary" {
  name         = var.route53_zone_name
  private_zone = false
}

# Vercel has changed its apex address historically, so the targets are read from
# Vercel at plan time rather than pinned in a variable here. Referencing the
# vercel_project_domain resources makes these read after the domains are
# attached to the project, which is when Vercel can answer.
#
# The consequence is that `terraform plan` needs a valid VERCEL_API_TOKEN even
# when only DNS is changing, and that a change on Vercel's side shows up as a
# diff on the next plan rather than silently going stale. See README.md.

data "vercel_domain_config" "apex" {
  domain             = vercel_project_domain.apex.domain
  project_id_or_name = vercel_project.blog.id
}

data "vercel_domain_config" "www" {
  domain             = vercel_project_domain.www.domain
  project_id_or_name = vercel_project.blog.id
}

resource "aws_route53_record" "apex" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = var.dns_ttl
  records = data.vercel_domain_config.apex.recommended_ipv4s
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = var.dns_ttl
  records = [data.vercel_domain_config.www.recommended_cname]
}

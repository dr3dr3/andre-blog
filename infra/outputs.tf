output "vercel_project_id" {
  description = "Vercel project ID. Needed for the import command in README.md."
  value       = vercel_project.blog.id
}

output "route53_zone_id" {
  description = "Hosted zone the records were written to."
  value       = data.aws_route53_zone.primary.zone_id
}

output "apex_record" {
  description = "Apex A record as applied, with the targets Vercel recommended at plan time."
  value       = "${aws_route53_record.apex.name} A ${join(", ", aws_route53_record.apex.records)}"
}

output "www_record" {
  description = "www CNAME record as applied."
  value       = "${aws_route53_record.www.name} CNAME ${join(", ", aws_route53_record.www.records)}"
}

output "site_url" {
  description = "Canonical origin. Must match `site` in astro.config.mjs."
  value       = "https://${var.domain_name}"
}

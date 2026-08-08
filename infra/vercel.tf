# Terraform owns the project's configuration and its domains. It does not own
# deployments — Vercel's Git integration does, triggered by pushes to GitHub.
# There is deliberately no vercel_deployment resource here, and adding one would
# put Terraform and the Git integration in a fight over the same thing.

resource "vercel_project" "blog" {
  name      = var.vercel_project_name
  framework = "astro"

  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = var.production_branch
  }
}

resource "vercel_project_domain" "apex" {
  project_id = vercel_project.blog.id
  domain     = var.domain_name
}

# www redirects to the apex rather than serving a second copy of the site, so
# there is one canonical origin for links, RSS and search.
resource "vercel_project_domain" "www" {
  project_id           = vercel_project.blog.id
  domain               = "www.${var.domain_name}"
  redirect             = vercel_project_domain.apex.domain
  redirect_status_code = 308
}

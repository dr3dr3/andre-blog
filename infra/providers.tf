terraform {
  required_version = "~> 1.13"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# The API token comes from VERCEL_API_TOKEN in the environment. Never put it in
# a .tfvars file, and never add an `api_token` argument here.
provider "vercel" {
  team = var.vercel_team_id
}

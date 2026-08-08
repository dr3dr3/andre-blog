terraform {
  # Partial configuration. The bucket is account-specific, so it is not
  # committed — pass it at init time:
  #
  #   terraform init -backend-config=backend.hcl
  #
  # backend.hcl is gitignored alongside *.tfvars. See README.md.
  #
  # use_lockfile puts state locking in S3 itself (Terraform 1.11+), so there is
  # no DynamoDB table to create or pay for.
  backend "s3" {
    key          = "andre-blog/terraform.tfstate"
    region       = "ap-southeast-2"
    encrypt      = true
    use_lockfile = true
  }
}

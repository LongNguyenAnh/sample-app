# Define Terraform Backend
terraform {
  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.40.0"
    }
  }

  required_version = ">= 0.13"
}

# Create AWS Provider

# Create AWS Provider (for cross regional replication)

# Create Links to MASTER shared state file
data "terraform_remote_state" "master" {
  backend = "s3"

  config = {
    bucket = "${var.rv_aws_account_name}-${var.rv_region}-samplepe-tfstate"
    key    = "samplepe/master/terraform.tfstate"
    region = var.rv_region
  }
}

# Create Link to regional alb state file
data "terraform_remote_state" "rgnl_alb" {
  count   = var.lv_create_alb ? 0 : 1
  backend = "s3"

  config = {
    bucket = "terraform-state-${var.rv_aws_account_name}-${var.rv_region}"
    key    = "${var.rv_rgnl_webapi_alb_appkey}/terraform.tfstate"
    region = var.rv_region
  }
}
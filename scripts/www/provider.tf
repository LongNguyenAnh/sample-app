# define terraform backend
terraform {
  backend "s3" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.30.0"
    }
    local = {
      source = "hashicorp/local"
      version = "2.4.0"
    }
  }
  required_version = ">= 0.13"
}

provider "local" {
  # local provider options
}

# create link to master shared state file
data "terraform_remote_state" "master" {
  backend = "s3"

  config = {
    bucket = "${var.rv_aws_account_name}-${var.rv_region}-samplepe-tfstate"
    key    = "samplepe/master/terraform.tfstate"
    region = var.rv_region
  }
}

# create link to regional security groups state file
data "terraform_remote_state" "securitygroups" {
  backend = "s3"

  config = {
    bucket = "${var.rv_aws_account_name}-${var.rv_region}-samplepe-tfstate"
    #Note: Below ternary is for backwards compatiblity with our current git2cb setup; remove the falsy result once GHA migration is complete
    key    = var.lv_security_groups_tf_key_prefix != "" ? "${var.lv_security_groups_tf_key_prefix}/terraform.tfstate" : "SecurityGroups/${var.rv_bounded_context_name}/terraform.tfstate"
    region = var.rv_region
  }
}

#get latest 64bit Amazon Linux running Node.js eb solution stack
data "aws_elastic_beanstalk_solution_stack" "latest_nodejs_stack" {
  most_recent = true
  name_regex  = "^64bit Amazon Linux (.*) running Node.js$"
}

# Create Link to regional alb state file
data "terraform_remote_state" "rgnl_alb" {
  count   = var.lv_create_alb ? 0 : 1
  backend = "s3"

  config = {
    bucket = "terraform-state-${var.rv_aws_account_name}-${var.rv_region}"
    key    = "${var.rv_rgnl_www_alb_appkey}/terraform.tfstate"
    region = var.rv_region
  }
}

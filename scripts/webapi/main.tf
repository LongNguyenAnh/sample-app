###
### DEFINE LOCAL VARIABLES TO USE WITHIN THIS MAIN.TF FILE
###
locals {
  stackname                   = "${var.rv_region_short}-${var.lv_appkey}-${var.lv_suffix}"
  accountname                 = var.rv_aws_account_name
  admin_sg_id                 = data.terraform_remote_state.master.outputs.admin-sg-id
  vpc_int_subnets             = [data.terraform_remote_state.master.outputs.intsubnets.0, data.terraform_remote_state.master.outputs.intsubnets.1, data.terraform_remote_state.master.outputs.intsubnets.2]
  vpc_ext_subnets             = [data.terraform_remote_state.master.outputs.extsubnets.0, data.terraform_remote_state.master.outputs.extsubnets.1, data.terraform_remote_state.master.outputs.extsubnets.2]
  accountid                   = data.terraform_remote_state.master.outputs.account_id
  vpcid                       = data.terraform_remote_state.master.outputs.vpcid
  region_short                = var.rv_region_short
  lambda_runtime              = var.lv_lambda_runtime
  lambda_handler              = var.lv_lambda_handler
  lambda_architectures        = var.lv_lambda_architectures
  dotnet_log_level            = var.lv_dotnet_log_level
  appkey                      = var.lv_appkey
  suffix                      = var.lv_suffix  
  lambda_memory_size          = var.lv_lambda_memory_size
  lambda_timeout              = var.lv_lambda_timeout
  lambda_s3_key               = "gha/${var.lv_git_repo}/${var.lv_branch_identifier}/${var.lv_appkey}/build-packages/${var.lv_appkey}-${var.lv_build_id}.zip"
  config                      = var.rv_config
  region                      = var.rv_region
  route53_hosted_zone         = var.rv_route53_hosted_zone
  r53_zone_id                 = var.rv_r53_zone_id
  aws_ssl_cert                = var.rv_aws_ssl_cert
  environment                 = "${var.rv_config}-${var.rv_region}-${var.lv_appkey}-${var.lv_suffix}"
  build_type                  = "terraform"
  owner                       = "sample.com"
  app_version                 = "1.1.0"
  team                        = var.rv_team
  layers                      = [var.rv_newrelic_dotnet_layer]
  create_alb                  = var.lv_create_alb
  rgnl_alb_dns_name           = var.lv_create_alb ? "" : data.terraform_remote_state.rgnl_alb[0].outputs.alb_dns_name
  rgnl_alb_zone_id            = var.lv_create_alb ? "" : data.terraform_remote_state.rgnl_alb[0].outputs.alb_zone_id
  rgnl_alb_listener_443_arn   = var.lv_create_alb ? "" : data.terraform_remote_state.rgnl_alb[0].outputs.alb_listener_443_arn
  rgnl_alb_listener_80_arn    = var.lv_create_alb ? "" : data.terraform_remote_state.rgnl_alb[0].outputs.alb_listener_80_arn

  environment_variables = {
    Region                                 = var.rv_region
    StaticData_BucketName                  = var.rv_static_data_bucket_name
    RecommendationsApiEndpointBaseUrl      = var.lv_recommendationsapi_baseurl
    RecommendationsApiKey                  = data.aws_ssm_parameter.recommendations_api_key.value
    RecommendationsApiTimeOutSeconds       = var.lv_recommendationsapi_timeout
    LogAllWebResponses                     = var.lv_log_all_webresponses
    "Logging__LogLevel__Default"           = var.lv_dotnet_log_level
    "AWS_LAMBDA_HANDLER_LOG_LEVEL"         = var.lv_dotnet_log_level
  }

  tags = {
    accountname = local.accountname
    accountid   = local.accountid
    appkey      = local.appkey
    application = local.appkey
    version     = local.app_version
    environment = local.environment
    tier        = "Web"
    buildtype   = "terraform"
    owner       = "sample.com"
    suffix      = local.suffix
    region      = local.region
    config      = local.config
  }
}

module "cache-data-s3" {
  source = "./modules/s3"

  mv_bucket_name_source  = "${local.region_short}-${local.accountname}-${local.appkey}-${var.lv_suffix}-cache-data-x"
  mv_role_name           = "${local.stackname}-s3-cache-data-svc-role"
  mv_service_policy_name = "${local.stackname}-s3-cache-data-svc-policy"
  mv_stackname           = local.stackname
  mv_region              = local.region
  mv_tags                = local.tags
}

module "lambda" {
  source = ""

  mv_runtime                 = local.lambda_runtime
  mv_handler                 = local.lambda_handler
  mv_function_name           = "${local.stackname}-wlf"
  mv_use_s3_file             = true
  mv_s3_bucket               = local.artifacts_s3_bucket
  mv_s3_key                  = local.lambda_s3_key
  mv_memory_size             = local.lambda_memory_size
  mv_timeout                 = local.lambda_timeout
  mv_stackname               = local.stackname
  mv_variables               = local.environment_variables
  mv_tags                    = local.tags
  mv_layers                  = local.layers
  mv_architectures           = local.lambda_architectures
  
  mv_vpc_config = [{
    subnet_ids         = local.vpc_int_subnets
    security_group_ids = [local.admin_sg_id, aws_security_group.lambda_sg.id]
  }]
}

module "alb" {
  source = "./modules/alb"
  count = local.create_alb ? 1 : 0

  mv_lambda_arn          = module.lambda.lambda_arn
  mv_vpcid               = local.vpcid
  mv_ext_subnets         = local.vpc_ext_subnets
  mv_route53_hosted_zone = local.route53_hosted_zone
  mv_aws_ssl_cert        = local.aws_ssl_cert
  mv_stackname           = local.stackname
  mv_region              = local.region
  mv_aws_zone_id         = local.r53_zone_id
  mv_tags                = local.tags
}

resource aws_security_group "lambda_sg" {
  name        = "${local.stackname}-wlf-sg"
  description = "Allow all outbound traffic"
  vpc_id      = local.vpcid

  lifecycle {
    create_before_destroy = true
  }
  egress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    tomap({Name    = "${local.stackname}-lf-sg"}),
    tomap({stack   = "${local.stackname} - Lambda Security Group"}),
    local.tags
  )
}

module "alb_shared" {
  source = "./modules/alb_shared"
  count = local.create_alb ? 0 : 1

  mv_lambda_arn          = module.lambda.lambda_arn
  mv_vpcid               = local.vpcid
  mv_ext_subnets         = local.vpc_ext_subnets
  mv_region              = local.region
  mv_route53_hosted_zone = local.route53_hosted_zone
  mv_aws_ssl_cert        = local.aws_ssl_cert
  mv_region_short        = local.region_short
  mv_stackname           = local.stackname
  mv_appkey              = local.appkey
  mv_accountname         = local.accountname
  mv_accountid           = local.accountid
  mv_suffix              = local.suffix
  mv_environment         = local.environment
  mv_tier                = "Web"
  mv_buildtype           = local.build_type
  mv_owner               = local.owner
  mv_app_version         = local.app_version
  mv_config              = local.config
  mv_aws_zone_id         = local.r53_zone_id
  mv_team                = local.team
  mv_rgnl_alb_dns_name         = local.rgnl_alb_dns_name
  mv_rgnl_alb_zone_id          = local.rgnl_alb_zone_id
  mv_rgnl_alb_listener_443_arn = local.rgnl_alb_listener_443_arn
  mv_rgnl_alb_listener_80_arn  = local.rgnl_alb_listener_80_arn
}

data "aws_route53_zone" "local_subdomain" {
  name         = local.route53_hosted_zone
  private_zone = false
}

resource "aws_route53_record" "route_53_entry" {
  zone_id    = data.aws_route53_zone.local_subdomain.id
  name       = local.stackname
  type       = "A"

  alias {
    name                   = local.create_alb ? module.alb[0].alb_dns_name : local.rgnl_alb_dns_name
    zone_id                = local.create_alb ? module.alb[0].alb_zone_id : local.rgnl_alb_zone_id
    evaluate_target_health = true
  }
}
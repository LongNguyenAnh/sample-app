###
### Define Variables used in the modules
###

locals {
  stackname                                = "${var.rv_region_short}-${var.lv_appkey}-${var.lv_suffix}"
  appkey                                   = var.lv_appkey
  branch_identifier                        = var.lv_branch_identifier
  bounded_context_name                     = var.rv_bounded_context_name
  static_cdn_base_url                      = var.lv_static_cdn_base_url
  vpcid                                    = data.terraform_remote_state.master.outputs.vpcid
  vpc_int_subnets                          = [data.terraform_remote_state.master.outputs.intsubnets.0, data.terraform_remote_state.master.outputs.intsubnets.1, data.terraform_remote_state.master.outputs.intsubnets.2]
  vpc_ext_subnets                          = [data.terraform_remote_state.master.outputs.extsubnets.0, data.terraform_remote_state.master.outputs.extsubnets.1, data.terraform_remote_state.master.outputs.extsubnets.2]
  intsubnets                               = join(",", local.vpc_int_subnets)
  extsubnets                               = join(",", local.vpc_ext_subnets)
  accountname                              = var.rv_aws_account_name
  flipper_endpoint                         = var.rv_flipper_endpoint
  config                                   = var.rv_config
  region                                   = var.rv_region
  replication_region                       = var.rv_replication_region
  environment                              = "${var.rv_config}-${var.rv_region}-${var.lv_appkey}-${var.lv_suffix}"
  aws_ssl_cert                             = var.rv_aws_ssl_cert
  route53_hosted_zone                      = var.rv_route53_hosted_zone
  region_short                             = var.rv_region_short
  node_env                                 = var.rv_node_env
  app_key                                  = var.rv_app_key
  webapi_url                               = var.lv_webapi_url
  static_data_bucket_name_primary          = var.rv_static_data_bucket_name_primary
  static_data_bucket_name_secondary        = var.rv_static_data_bucket_name_secondary
  location_accept_header                   = var.lv_location_accept_header
  psp_base_url                             = var.rv_psp_base_url
  build_type                               = "terraform"
  owner                                    = "sample.com"
  app_version                              = "1.1.0"
  enable_distributed_cache                 = var.lv_enable_distributed_cache
  default_cache_item_ttl_seconds           = var.rv_default_cache_item_ttl_seconds
  team                                     = var.rv_team
  siteshield_prod_sgid                     = data.terraform_remote_state.securitygroups.outputs.siteshield_prod_sg_id
  siteshield_stage_sgid                    = data.terraform_remote_state.securitygroups.outputs.siteshield_stage_sg_id
  rgnl_master_sgid                         = data.terraform_remote_state.securitygroups.outputs.master_sg_id
  elb_allowed_cidrs                        = var.lv_publicly_accessible ? ["0.0.0.0/0"] : []
  newrelic_nodejs_layer                    = var.rv_newrelic_nodejs_layer
  lambda_timeout                           = var.lv_lambda_timeout
  lambda_layer_handler                     = var.lv_lambda_layer_handler
  lambda_architectures                     = var.lv_lambda_architectures 
  lambda_runtime                           = var.lv_lambda_runtime
  access_logs_bucket                       = var.rv_access_logs_bucket
  access_logs_bucket_prefix                = var.rv_access_logs_bucket_prefix
  create_alb                               = var.lv_create_alb
  rgnl_alb_dns_name                        = var.lv_create_alb ? "" : data.terraform_remote_state.rgnl_alb[0].outputs.alb_dns_name
  rgnl_alb_zone_id                         = var.lv_create_alb ? "" : data.terraform_remote_state.rgnl_alb[0].outputs.alb_zone_id
  rgnl_alb_listener_443_arn                = var.lv_create_alb ? "" : data.terraform_remote_state.rgnl_alb[0].outputs.alb_listener_443_arn
  rgnl_alb_listener_80_arn                 = var.lv_create_alb ? "" : data.terraform_remote_state.rgnl_alb[0].outputs.alb_listener_80_arn
  master_memcached_configuration_url       = data.aws_ssm_parameter.master_memcached_configuration_url.value
  artifacts_s3_bucket                      = "${var.rv_aws_account_name}-${var.rv_artifacts_s3_bucket}-${var.rv_region}"
  lambda_s3_key                            = "gha/${var.lv_git_repo}/${var.lv_branch_identifier}/${var.lv_appkey}/build-packages/${var.lv_appkey}-${var.rv_aws_account_name}-${var.rv_region}-${var.lv_build_id}.zip"

  environment_variables = {
    "BASE_API"                                   = var.lv_webapi_url
    "MEMCACHED_CONFIGURATION_URL"                = local.enable_distributed_cache ? module.elasticache.configuration_endpoint : local.master_memcached_configuration_url
    "CONSUMER_API_API_KEY"                       = data.aws_ssm_parameter.consumer_api_key.value
    "EXPEDITED_EMAIL_API_KEY"                    = data.aws_ssm_parameter.expedited_email_api_key.value
    "GLOBALNAV_API_KEY"                          = data.aws_ssm_parameter.global_nav_api_key.value
  }

  lambda_environment_variables = {
    "LOADABLE_STATS_PATH"                     = "./loadable-stats.json"
    "HTML_PATH"                               = "./index.html"
    "FALLBACK_HTML_PATH"                      = "./index_fallback.html"
    "DIST_DIR"                                = "./static"
    "STATIC_DIR"                              = "./static"
    "SHARED_RESOURCES_DIR"                    = "./shared-resources"
  }

  tags = {
    accountname     = local.accountname
    accountid       = local.accountid
    appkey          = var.lv_appkey
    application     = var.lv_appkey
    version         = "1.1.0"
    environment     = "${var.rv_config}-${var.rv_region}-${var.lv_appkey}-${var.lv_suffix}"
    tier            = "Web"
    buildtype       = "terraform"
    owner           = "sample.com"
    suffix          = local.suffix
    region          = local.region
    config          = var.rv_config
    team            = var.rv_team
  }

}

module "security" {
  source = "./modules/security"

  mv_vpcid                 = local.vpcid
  mv_accountname           = local.accountname
  mv_accountid             = local.accountid
  mv_stackname             = local.stackname
  mv_appkey                = local.appkey
  mv_suffix                = local.suffix
  mv_environment           = local.environment
  mv_tier                  = "Security"
  mv_buildtype             = local.build_type
  mv_owner                 = local.owner
  mv_app_version           = local.app_version
  mv_config                = local.config
  mv_region                = local.region
  mv_team                  = local.team
}

module "elasticache" {
  source = ""
  mv_disable                = local.enable_distributed_cache ? false : true
  mv_name                   = "${local.bounded_context_name}-${local.region_short}-${local.suffix}"
  mv_security_group_ids     = [module.security.ecsgid]
  mv_vpc_int_subnets        = local.vpc_int_subnets
  mv_stackname              = local.stackname
  mv_tags                   = local.tags
  mv_node_type              = var.rv_cache_node_type
  mv_engine_version         = "1.6.17"
  mv_parameter_group_name   = "default.memcached1.6"
}

module "lambda" {
  source = "/terraform-modules.git//lambda-server?ref=v2.4.0"

  mv_stackname                 = "${local.stackname}-lf"
  mv_vpcid                     = local.vpcid
  mv_vpc_ext_subnets           = local.vpc_ext_subnets
  mv_aws_ssl_cert              = local.aws_ssl_cert
  mv_route53_hosted_zone       = local.route53_hosted_zone
  mv_use_s3_file               = true
  mv_s3_bucket                 = local.artifacts_s3_bucket
  mv_s3_key                    = local.lambda_s3_key
  mv_lambda_handler            = local.lambda_layer_handler
  mv_lambda_architectures      = local.lambda_architectures
  mv_bounded_context_name      = "sample"
  mv_lambda_timeout            = local.lambda_timeout
  mv_tags                      = local.tags
  mv_env_variables             = merge(local.environment_variables, local.lambda_environment_variables)
  mv_layers                    = [local.newrelic_nodejs_layer]
  mv_lambda_runtime            = local.lambda_runtime
  mv_lambda_alias_name         = "latest_published"
  mv_lambda_memory_size        = "2048"
  mv_access_logs_bucket        = local.access_logs_bucket
  mv_access_logs_bucket_prefix = local.access_logs_bucket_prefix
  mv_elb_allowed_cidrs         = local.elb_allowed_cidrs
  mv_siteshield_prod_sgid      = local.siteshield_prod_sgid
  mv_siteshield_stage_sgid     = local.siteshield_stage_sgid
  mv_rgnl_master_sgid          = local.rgnl_master_sgid

  mv_lambda_vpc_config = [{
    subnet_ids         = local.vpc_int_subnets
    security_group_ids = [module.security.ecsgid]
  }]

  mv_create_alb                = local.create_alb
  mv_rgnl_alb_dns_name         = local.rgnl_alb_dns_name
  mv_rgnl_alb_zone_id          = local.rgnl_alb_zone_id
  mv_rgnl_alb_listener_443_arn = local.rgnl_alb_listener_443_arn
  mv_rgnl_alb_listener_80_arn  = local.rgnl_alb_listener_80_arn
}
output "memcached_configuration_url" {
  value = local.enable_distributed_cache ? module.elasticache.configuration_endpoint : local.master_memcached_configuration_url
  sensitive = true
}

output "lambda_arn" {
  value = "arn:aws:lambda:${var.rv_region}:${local.accountid}:function:${local.stackname}-server-lf"
}

output "lambda_name" {
  value = module.lambda.lambda_name
}

output "lambda_version" {
  value = module.lambda.lambda_version
}

output "lambda_alias" {
  value = module.lambda.lambda_alias
}

output "lambda_log_group_name" {
  value = module.lambda.lambda_log_group_name
}

output "lambda_log_group_arn" {
  value = module.lambda.lambda_log_group_arn
}

#Outputs
output "lambda" {
  value = module.lambda.lambda_name
}

output "api_cdn" {
  value = aws_route53_record.route_53_entry.fqdn
}
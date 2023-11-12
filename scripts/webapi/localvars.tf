
############## DYNAMIC VALUES ##############
variable "lv_suffix" { default = "x" }
variable "lv_branch_identifier" { default = "" }
variable "lv_git_repo" { default = "" }
variable "lv_build_id" { default = "" }
variable "lv_create_alb" { default = true }

############## PRE-DEFINED VALUES ##############
variable "lv_appkey" {}
variable "lv_lambda_memory_size" {}
variable "lv_lambda_runtime" {}
variable "lv_lambda_timeout" {}
variable "lv_lambda_handler" {}
variable "lv_vrsapi_max_limit" {}
variable "lv_vrsapi_timeout" {}
variable "lv_cache_expiration_timespan" {}
variable "lv_recommendationsapi_timeout" {}
variable "lv_recommendationsapi_key" { default = "" }
variable "lv_log_all_webresponses" {}
variable "lv_recommendationsapi_baseurl" {}
variable "lv_lambda_architectures" {
  default = ["arm64"]
}
variable "lv_dotnet_log_level" {
  default = ""
}
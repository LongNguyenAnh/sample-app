############## PRE-DEFINED VALUES ##############
variable "lv_appkey" {}
variable "lv_static_cdn_base_url" {}

############## DYNAMIC VALUES ##############
variable "lv_suffix" { 
  default = "x"
}

variable "lv_branch_identifier" {
  default = ""
}

variable "lv_git_repo" { 
  default = ""
}

variable "lv_build_id" {
  default = ""
}

variable "lv_webapi_url" {
  default = ""
}

variable "lv_security_groups_tf_key_prefix" {
  default = ""
}

variable "lv_enable_distributed_cache" {
  default = false
}

variable "lv_lambda_src_dir" {
  default = ""
}

variable "lv_lambda_function_handler" {
  default = ""
}

variable "lv_lambda_layer_handler" {
  default = ""
}

variable "lv_lambda_timeout" {
  default = ""
}

variable "lv_lambda_architectures" {
  default = ["arm64"]
}

variable "lv_lambda_runtime" {
  default = ""
}

variable "lv_create_alb" {
  default = true
}

variable "lv_head_commit_id" {
  default = ""
}

variable "lv_newrelic_force_fallback" {
  default = "false"
}

variable "lv_party_town_debug" {
  default = false
}

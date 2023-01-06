module "local_zip_deploy_nodejs" {
  source = "./modules/nodejs/local_zip_deploy"
}

module "s3" {
  source            = "./modules/s3"
  bucket_name       = "${var.bucket_name}-${local.account_id}"
  kms_master_key_id = var.kms_master_key_id
  sse_algorithm     = var.sse_algorithm
}

module "local_zip_s3_deploy_nodejs" {
  source      = "./modules/nodejs/local_zip_s3_deploy"
  bucket_name = module.s3.bucket_name
  sse         = var.sse_algorithm
}

module "local_build_zip_deploy_nodejs" {
  source = "./modules/nodejs/local_build_zip_deploy"
}

module "local_build_zip_s3_deploy_nodejs" {
  source      = "./modules/nodejs/local_build_zip_s3_deploy"
  bucket_name = module.s3.bucket_name
  sse         = var.sse_algorithm
}

module "nodejs_layer" {
  source = "./modules/nodejs/nodejs_layer"
}

module "local_zip_use_layer_deploy_nodejs" {
  source       = "./modules/nodejs/local_zip_use_layer_deploy"
  layer_01_arn = module.nodejs_layer.nodejs14_layer_arn
}

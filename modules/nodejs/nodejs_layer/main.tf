resource "null_resource" "layer_build" {
  triggers = {
    code_diff = filebase64sha256("${path.module}/nodejs14/src/nodejs/package.json")
  }

  provisioner "local-exec" {
    command     = "npm install"
    working_dir = "${path.module}/nodejs14/src/nodejs"
  }
}

data "archive_file" "layer_zip" {
  type        = "zip"
  source_dir  = "${path.module}/nodejs14/src"
  output_path = "${path.module}/nodejs14/dist/nodejs14_layer.zip"

  depends_on = [
    null_resource.layer_build
  ]
}

resource "aws_lambda_layer_version" "nodejs14" {
  filename         = data.archive_file.layer_zip.output_path
  layer_name       = "nodejs14-base-layer"
  source_code_hash = data.archive_file.layer_zip.output_base64sha256

  compatible_runtimes = ["nodejs14.x"]
}

resource "null_resource" "layer_build" {
  triggers = {
    timestamp = timestamp()
  }

  provisioner "local-exec" {
    command = "npm install"
    working_dir = "${path.module}/nodejs14"
  }
}

data "archive_file" "layer_zip" {
  type = "zip"
  source_dir = "${path.module}/nodejs14/src"
  output_path = "${path.module}/nodejs14/dist/nodejs14_layer.zip"

  depends_on = [
    null_resource.layer_build
  ]
}

resource "aws_lambda_layer_version" "nodejs14" {
  filename = data.archive_file.layer_zip.output_path
  layer_name = "nodejs14-base-layer"

  compatible_runtimes = ["nodejs14.x"]
}
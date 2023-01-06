resource "null_resource" "build" {
  triggers = {
    #timestamp = timestamp()
    code_diff = base64sha256(join("", [
      for file in fileset("${path.module}/lambda/src", "{*.js, package.json}")
      : filebase64sha256("${path.module}/lambda/src/${file}")
    ]))
  }

  provisioner "local-exec" {
    command     = "npm install"
    working_dir = "${path.module}/lambda/src"
  }
}

data "archive_file" "this" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/src"
  output_path = "${path.module}/lambda/dist/function.zip"

  depends_on = [
    null_resource.build
  ]
}

resource "aws_lambda_function" "sample" {
  function_name    = "local-build-zip-sample-func"
  filename         = data.archive_file.this.output_path
  handler          = "index.handler"
  role             = aws_iam_role.sample_func.arn
  runtime          = "nodejs14.x"
  source_code_hash = data.archive_file.this.output_base64sha256


  depends_on = [
    aws_iam_role.sample_func
  ]
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "sample_func" {
  name               = "local-build-zip-sample-func-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

locals {
  lambda_basic_execution_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "basic" {
  role       = aws_iam_role.sample_func.name
  policy_arn = local.lambda_basic_execution_arn
}

# ── Public S3 bucket for project photos ──────────────────────────────────────
# Photos are served directly from S3 with public read access.

resource "aws_s3_bucket" "photos" {
  bucket = "dn-hobby-site-photos"
}

resource "aws_s3_bucket_public_access_block" "photos" {
  bucket = aws_s3_bucket.photos.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "photos" {
  bucket = aws_s3_bucket.photos.id
  policy = data.aws_iam_policy_document.photos_public_read.json

  depends_on = [aws_s3_bucket_public_access_block.photos]
}

data "aws_iam_policy_document" "photos_public_read" {
  statement {
    sid    = "PublicReadGetObject"
    effect = "Allow"

    principals {
      type        = "*"
      identifiers = ["*"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.photos.arn}/*"]
  }
}

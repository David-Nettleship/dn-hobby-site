output "cloudfront_url" {
  description = "Public URL of the website"
  value       = "https://${aws_cloudfront_distribution.website.domain_name}"
}

output "s3_bucket_name" {
  description = "S3 bucket to upload webpages into"
  value       = aws_s3_bucket.website.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (needed for cache invalidation)"
  value       = aws_cloudfront_distribution.website.id
}

output "photos_bucket_url" {
  description = "Base URL for the photos bucket"
  value       = "https://${aws_s3_bucket.photos.bucket_regional_domain_name}"
}

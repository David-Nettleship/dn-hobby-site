#!/usr/bin/env bash
set -euo pipefail

SITE_BUCKET="dn-hobby-site"
PHOTOS_BUCKET="dn-hobby-site-photos"
DISTRIBUTION_ID="ELS0BIQMCJAHT"
WEBPAGES_DIR="$(dirname "$0")/webpages"

usage() {
  echo "Usage: $0 [site|photos <campaign>|all <campaign>]"
  echo ""
  echo "  site                  Sync HTML/CSS/JS and invalidate CloudFront cache"
  echo "  photos <campaign>     Upload images for a campaign to the photos bucket"
  echo "                        e.g. $0 photos lenton"
  echo "  all <campaign>        Deploy both site and photos for a campaign"
  exit 1
}

deploy_site() {
  echo "==> Syncing site files to s3://$SITE_BUCKET/"
  aws s3 sync "$WEBPAGES_DIR/" "s3://$SITE_BUCKET/" \
    --delete \
    --exclude "images/*"

  echo "==> Invalidating CloudFront cache ($DISTRIBUTION_ID)"
  local invalidation_id
  invalidation_id=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)
  echo "    Invalidation $invalidation_id created (propagates in ~30s)"
}

deploy_photos() {
  local campaign="${1:-}"
  if [[ -z "$campaign" ]]; then
    echo "Error: photos requires a campaign name, e.g: $0 photos lenton"
    exit 1
  fi

  local src="$WEBPAGES_DIR/images/$campaign"
  if [[ ! -d "$src" ]]; then
    echo "Error: image directory not found: $src"
    exit 1
  fi

  echo "==> Syncing $campaign images to s3://$PHOTOS_BUCKET/$campaign/"
  aws s3 sync "$src/" "s3://$PHOTOS_BUCKET/$campaign/" \
    --content-type image/png
}

case "${1:-}" in
  site)
    deploy_site
    ;;
  photos)
    deploy_photos "${2:-}"
    ;;
  all)
    deploy_site
    deploy_photos "${2:-}"
    ;;
  *)
    usage
    ;;
esac

echo "==> Done"

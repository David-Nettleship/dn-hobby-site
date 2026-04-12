# dn-hobby-site

Warhammer hobby site with a Dark Mechanicum theme. Static HTML/CSS/JS hosted on AWS via S3 + CloudFront.

## Structure

```
webpages/
  index.html              Homepage
  style.css               Shared stylesheet
  bg.js                   Animated binary/sigil canvas background
  legions/
    legions.html          Legions Imperialis section index
  40k/
    40k.html              Warhammer 40,000 section index
  campaigns/
    radiances-totalus-iv.html
    slaughter-at-lenton.html
  images/                 Local image cache (extracted from PDFs)
    lenton/
    radiances/

infra/
  backend.tf              S3 remote state config
  main.tf                 Site S3 bucket + CloudFront distribution
  photos.tf               Public photos S3 bucket
  outputs.tf              CloudFront URL, bucket names, distribution ID
```

## Infrastructure

### Architecture

```
Browser → CloudFront (HTTPS) → S3 dn-hobby-site (private)
Photos  ← S3 dn-hobby-site-photos (public read)
```

- **`dn-hobby-site`** — private S3 bucket serving HTML/CSS/JS via CloudFront OAC. Public access fully blocked.
- **`dn-hobby-site-photos`** — public S3 bucket for campaign/battle report images. Served directly from S3.
- **CloudFront** — HTTPS-only, `PriceClass_100` (US, Canada, Europe), 1-hour default TTL.

### Remote state

Stored in `terraform-state-304707804854` (`eu-west-2`), key `dn-hobby-site/terraform.tfstate`.

### Deploy infrastructure

```bash
cd infra
terraform init
terraform plan
terraform apply
```

### Deploy site files

```bash
./deploy.sh site              # sync HTML/CSS/JS + invalidate CloudFront
./deploy.sh photos <campaign> # upload images for one campaign to the photos bucket
./deploy.sh all <campaign>    # both of the above
```

No cache invalidation needed for photos — they are served directly from S3.

Live URL: `https://d1jn4wrp35zcn1.cloudfront.net`

---

## Adding content

See `CLAUDE.md` for the full conventions used when adding new campaigns and battle reports.

---

## Cost estimate

All figures at AWS `eu-west-2` (London) pricing.

| Scenario | Estimated monthly cost |
|---|---|
| Low traffic (< 1,000 visitors/month) | **$0.00** (free tier) |
| Medium traffic (~50,000 requests/month) | **< $0.10** |
| High traffic (~1M requests/month) | **~$1.00** |

The site has no compute, database, or NAT gateway. Costs are purely CloudFront request volume + S3 storage, both negligible at hobby-site scale.

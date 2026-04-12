# CLAUDE.md — Site conventions and patterns

Reference for adding new content to dn-hobby-site. Read this before creating or editing pages.

---

## Theme

Dark Mechanicum aesthetic throughout:

- **Palette** — near-black background (`#080a08`), toxic machine-green (`#7cfc00`) as primary accent, corrupted red (`#c0392b`) for dark/corrupted elements.
- **Typography** — `Share Tech Mono` (Google Fonts) for all text including headings. Everything is monospace; no decorative serif fonts.
- **Title format** — `FORGE.NODE<span class="corrupted">//NETTLESHIP</span>` with a blinking cursor appended via CSS.
- **Subtitle** — `[SYS_BOOT:OK] :: [COGITATOR:ONLINE] :: [NOOSPHERIC_UPLINK:NOMINAL]` (or the index variant `[NOOSPHERE_UPLINK:CORRUPTED]`).
- **Background** — animated canvas (`bg.js`) with falling binary columns and rotating sigil overlays. CRT scanlines and radial vignette overlaid on top.
- **Binary text** — decorative `<p class="binary-text">` rows of space-separated 8-bit binary words used as section dividers. Content is thematic flavour, not meaningful data.

---

## File structure

```
webpages/
  index.html              Homepage — links to section pages
  style.css               Single shared stylesheet (all pages link to this)
  army-list.css           Additional stylesheet for army list pages (loaded alongside style.css)
  bg.js                   Canvas background (all pages load this)
  legions/
    legions.html          Legions Imperialis index
    mortivar.html         Background page — Archmagos Mortivar
    dark-mechanicum-2k.html  Army list page — Taghmata Mortivar 2000pts
  40k/
    40k.html              Warhammer 40,000 index
  campaigns/
    <slug>.html           One file per campaign/battle report
  images/
    <campaign>/           Local copy of extracted PDF images (not deployed to site S3)
```

### Section index structure (`legions.html`, `40k.html`)

Each section index is divided into named groups using `<div class="section-heading"><span>NAME</span></div>`. Current groups in `legions.html`:

| Section | Contents |
|---|---|
| BACKGROUND | Character/lore pages (e.g. mortivar.html) |
| ARMY LISTS | Army list pages (e.g. dark-mechanicum-2k.html) |
| BATTLE REPORTS | Campaign report pages in `campaigns/` |

### Relative path rules

Every page resolves assets relative to its own location:

| Page location | `style.css` | `bg.js` | Homepage |
|---|---|---|---|
| `webpages/` | `style.css` | `bg.js` | — |
| `webpages/legions/` | `../style.css` | `../bg.js` | `../index.html` |
| `webpages/40k/` | `../style.css` | `../bg.js` | `../index.html` |
| `webpages/campaigns/` | `../style.css` | `../bg.js` | `../index.html` |

Cross-links between sections always use explicit filenames — never trailing `/` or `index.html`:

```html
<!-- From campaigns/ -->
<a href="../legions/legions.html">LEGIONS IMPERIALIS</a>
<a href="../40k/40k.html">WARHAMMER 40,000</a>
```

---

## Page shell

Every page (except `index.html`) uses this header/nav shell. Copy it exactly, changing only the `active` class and the page `<title>`:

```html
<header>
  <div class="header-inner">
    <div class="sigil-mark">⚙</div>
    <a href="../index.html" class="site-title-link">
      <h1 class="site-title">FORGE.NODE<span class="corrupted">//NETTLESHIP</span></h1>
    </a>
    <p class="site-subtitle">[SYS_BOOT:OK] :: [COGITATOR:ONLINE] :: [NOOSPHERIC_UPLINK:NOMINAL]</p>
  </div>
  <nav>
    <a href="../legions/legions.html" class="nav-link [active]">LEGIONS IMPERIALIS</a>
    <span class="nav-sep">⬡</span>
    <a href="../40k/40k.html" class="nav-link [active]">WARHAMMER 40,000</a>
  </nav>
</header>
```

Add `class="nav-link active"` to whichever section the page belongs to.

---

## Images

### Source

Images are extracted from PDF battle reports using `pdfimages`:

```bash
mkdir -p webpages/images/<campaign>
pdfimages -all "<file>.pdf" webpages/images/<campaign>/img
```

### Processing

All images are converted to grayscale before upload to fit the Dark Mechanicum aesthetic:

```python
from PIL import Image
img = Image.open(path).convert("L").convert("RGB")
img.save(path, optimize=True)
```

### Storage

Images are uploaded to the **public** `dn-hobby-site-photos` S3 bucket, under a per-campaign prefix:

```
s3://dn-hobby-site-photos/<campaign-slug>/img-000.png
```

Reference in HTML using the regional S3 domain:

```
https://dn-hobby-site-photos.s3.eu-west-2.amazonaws.com/<campaign-slug>/img-NNN.png
```

The local `webpages/images/` directory is a cache only — it is excluded from the site S3 sync.

---

## Adding a background/lore page

Background pages live in the same folder as their section index (e.g. `webpages/legions/<slug>.html`). Use `webpages/legions/mortivar.html` as the template.

Key differences from campaign pages:
- No images required.
- Use `campaign-intro hex-border` for the opening paragraph(s).
- Use `battle-section` blocks for each named section, with roman numerals (`I`, `II`, …) in `battle-number` instead of `BATTLE 01`.
- Omit `battle-meta` (no points/opponent/outcome) — just `battle-title` and `battle-report-text`.
- Close with a `mortivar-quote` paragraph for the final statement, and a standard `report-nav` back link.

Add a card to the **BACKGROUND** section in the index:

```html
<a href="<slug>.html" class="report-card">
  <div class="report-card-header">
    <span class="report-date">FIELD RECORD</span>
    <span class="report-result">FACTION NAME</span>
  </div>
  <h3 class="report-name">Subject Name</h3>
  <p class="report-summary">One or two sentences of summary.</p>
  <div class="report-card-footer">
    <span class="report-battles">FACTION &nbsp;|&nbsp; ERA</span>
    <span class="report-link">READ BACKGROUND →</span>
  </div>
</a>
```

---

## Adding a campaign page

### 1. Extract and process images

```bash
mkdir -p webpages/images/<slug>
pdfimages -all "<report>.pdf" webpages/images/<slug>/img
# Convert to grayscale with Pillow (see above)
aws s3 sync webpages/images/<slug>/ s3://dn-hobby-site-photos/<slug>/ --content-type image/png
```

### 2. Create `webpages/campaigns/<slug>.html`

Use `campaigns/slaughter-at-lenton.html` or `campaigns/radiances-totalus-iv.html` as a template. Key components:

**Page header:**
```html
<div class="page-header">
  <p class="binary-text">...</p>
  <h2 class="page-title">CAMPAIGN TITLE IN CAPS</h2>
  <p class="page-desc">DD Month YYYY &nbsp;|&nbsp; Venue &nbsp;|&nbsp; Era</p>
</div>
```

**Intro image** (full-width, first image from PDF):
```html
<div class="battle-report-image full-width-image">
  <img src="https://dn-hobby-site-photos.s3.eu-west-2.amazonaws.com/<slug>/img-000.png"
       alt="..." loading="lazy" />
</div>
```

**Campaign intro** (lore/setup):
```html
<div class="campaign-intro hex-border">
  <p>...</p>
</div>
```

**Each battle:**
```html
<div class="battle-section">
  <div class="battle-header">
    <div class="battle-number">BATTLE 01</div>
    <div class="battle-header-detail">
      <h3 class="battle-title">Battle Name</h3>
      <div class="battle-meta">
        <span class="battle-pts">NNNN PTS</span>
        <span class="battle-opponents">vs. Legion &amp; Ally</span>
        <span class="battle-outcome victory|defeat|stalemate">OUTCOME</span>
      </div>
      <p class="battle-objective">Objective: ...</p>
    </div>
  </div>
  <!-- images (full-width or two-column row) -->
  <div class="battle-report-text">
    <p>...</p>
  </div>
</div>
```

Outcome classes: `victory` (green), `defeat` (red), `stalemate` (amber).

**Image layouts:**
```html
<!-- Full width -->
<div class="battle-report-image full-width-image">
  <img src="..." loading="lazy" />
</div>

<!-- Two column -->
<div class="battle-image-row">
  <div class="battle-report-image"><img src="..." loading="lazy" /></div>
  <div class="battle-report-image"><img src="..." loading="lazy" /></div>
</div>
```

**Campaign summary:**
```html
<div class="campaign-summary hex-border">
  <div class="summary-title">// CAMPAIGN OUTCOME //</div>
  <div class="summary-results">
    <div class="summary-stat">
      <span class="summary-num victory-colour">N</span>
      <span class="summary-label">DECISIVE VICTORY</span>
    </div>
    <!-- repeat for defeat / stalemate as needed -->
  </div>
  <p>Closing narrative...</p>
</div>
```

**Back link:**
```html
<div class="report-nav">
  <a href="../legions/legions.html" class="report-back">← RETURN TO LEGIONS IMPERIALIS</a>
</div>
```

### 3. Add a report card to the section index

In `webpages/legions/legions.html` (or `40k/40k.html`), add before the existing report cards:

```html
<a href="../campaigns/<slug>.html" class="report-card">
  <div class="report-card-header">
    <span class="report-date">DD MMM YYYY</span>
    <span class="report-result victory|defeat|mixed">RESULT SUMMARY</span>
  </div>
  <h3 class="report-name">Campaign Title</h3>
  <p class="report-summary">One or two sentences summarising the engagement.</p>
  <div class="report-card-footer">
    <span class="report-battles">N BATTLES &nbsp;|&nbsp; Venue</span>
    <span class="report-link">READ REPORT →</span>
  </div>
</a>
```

Report card result classes: `victory` (green), `defeat` (red), `mixed` (amber).

### 4. Deploy

```bash
./deploy.sh all <slug>    # uploads photos and syncs the site + invalidates cache
```

---

## Army list pages — print behaviour

Army list pages load `army-list.css` in addition to `style.css`. That stylesheet includes a `@media print` block that:

- Hides the site header, footer, nav, page header (`.al-page-header`), back-link (`.report-nav`), and all canvas/overlay elements.
- Silhouette galleries (`.al-gallery`) are preserved in print.
- Preserves all page colours and dark theme (`print-color-adjust: exact`).
- Leaves only the formation blocks (`.al-container`) and the casualty tracker (`.al-tracker`) visible.

No per-page print CSS is needed — it is handled entirely in `army-list.css`.

---

## Deploying after any change

```bash
./deploy.sh site              # HTML/CSS/JS only — syncs site and invalidates CloudFront
./deploy.sh photos <slug>     # photos only — uploads images for one campaign
./deploy.sh all <slug>        # both of the above
```

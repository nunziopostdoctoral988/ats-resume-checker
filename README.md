<div align="center">

# 📄 ATS Resume Checker

**Recruiter-grade, transparent ATS resume analysis — 100% client-side.**

[![Version](https://img.shields.io/badge/version-1.0.0-3b63f2)](https://github.com/Jahangirhussen/ats-resume-checker/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](#)
[![Responsive](https://img.shields.io/badge/design-responsive-4CAF50)](#)
[![GitHub Pages](https://img.shields.io/badge/deployed-GitHub%20Pages-222)](https://jahangirhussen.github.io/ats-resume-checker/)

[Live Demo](https://jahangirhussen.github.io/ats-resume-checker/) · [Report Bug](https://github.com/Jahangirhussen/ats-resume-checker/issues) · [Request Feature](https://github.com/Jahangirhussen/ats-resume-checker/issues)

</div>

---

## Overview

ATS Resume Checker analyzes a resume against a job description (or a target role's expected skill set) and produces a transparent, explainable ATS score — plus a recruiter-side bulk-screening mode for ranking hundreds of resumes at once. Everything runs in the browser: no backend, no build step, no resume data ever leaves the user's device.

## Live Demo

**[jahangirhussen.github.io/ats-resume-checker](https://jahangirhussen.github.io/ats-resume-checker/)**

## Screenshots

> _Add screenshots/GIFs here — `assets/screenshots/home.png`, `assets/screenshots/report.png`, `assets/screenshots/recruiter.png`._

## Features

### For Job Seekers
- Upload PDF / DOCX / TXT resumes (drag & drop), with OCR fallback for scanned PDFs
- Paste a job description or pick from 200+ roles across 29 industries for role-specific scoring
- 8-category transparent scoring: keyword match, structure, formatting, writing quality, achievements, experience, education, contact — every score shows its weight and reasoning
- Issue list with severity (Critical/High/Medium/Low), "why it matters," where it occurs, and before/after fixes
- Improvement roadmap, section-weight breakdown, resume health flag, score bands (A+–F)
- Local-only history, dark mode, fully responsive

### For Recruiters — Bulk Screening
- Upload hundreds of resumes against one job requirement at once
- Ranked candidate table: sortable columns, search, quick filters (Top 10/25/50, Grade A, score thresholds, status)
- Shortlist / Interview / Reject status tagging, star ratings, notes, candidate comparison (2–4 side by side)
- Duplicate & invalid file detection, cancel mid-run, retry failed files
- Live dashboard: total/processed/failed, average/highest/lowest score, average match %, processing time

### PDF Reports
- **Premium multi-page report** (single candidate): cover page, table of contents, executive summary with radar chart, category breakdown, priority roadmap, flagged issues, auto-generated recruiter notes, page headers/footers/numbering, optional "Prepared by" branding
- **Individual PDFs** per candidate (bulk mode), zipped with original filenames
- **Combined PDF** — every screened candidate in one file with a table of contents
- CSV / JSON export, all respecting active filters/selection

## Technology Stack

Plain HTML5, CSS3, and vanilla JavaScript (ES6+) — no framework, no bundler. Client-side parsing via [PDF.js](https://mozilla.github.io/pdf.js/), [Mammoth.js](https://github.com/mwilliamson/mammoth.js), [Tesseract.js](https://tesseract.projectnaptha.com/) (OCR), [JSZip](https://stuk.github.io/jszip/), and [jsPDF](https://github.com/parallax/jsPDF) — all loaded from CDN, none of them ever receive your resume data over the network.

## Browser Compatibility

Latest Chrome, Edge, Firefox, and Safari. Requires JavaScript; PDF/DOCX parsing libraries load from CDN on first use, so an internet connection is needed even though no resume data is uploaded anywhere.

## Folder Structure

```
index.html            Landing page
pages/                 upload, analysis, report, recruiter, history, about, contact
assets/css/            design system (variables, base, components, animations, responsive, print)
assets/js/             app logic (see below)
data/                  source-of-truth JSON (job roles, skills, action verbs, keywords, scoring rules)
```

### assets/js

| File | Responsibility |
|---|---|
| `data.js` | mirrors `/data/*.json` as `window.ATSData` (avoids fetch/CORS issues on `file://`) |
| `utils.js` | DOM/format helpers, toast notifications |
| `validator.js` | contact info extraction/validation |
| `storage.js` | localStorage/sessionStorage wrapper (history, reports, bulk batches) |
| `parser.js` | PDF/DOCX/TXT extraction, OCR fallback, section/name detection |
| `ats-checker.js` | scoring engine — 8 weighted categories, issue generation, roadmap |
| `charts.js` | score gauge / category bar / radar chart renderers |
| `export.js` | CSV/JSON/print/clipboard export helpers |
| `app.js` | shared navbar/footer/theme bootstrap |

## Installation

```bash
git clone https://github.com/Jahangirhussen/ats-resume-checker.git
cd ats-resume-checker
```

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
npx serve .
```

## Usage

1. Go to **Check Resume**, upload your resume, paste a job description (optional), pick your target role/seniority/country.
2. Review your ATS score, category breakdown, and prioritized fixes.
3. Download a PDF report, or check **For Companies** to screen a batch of resumes against one requirement.

## Roadmap / Future Plans

- Optional AI-assisted rewriting (requires connecting a paid LLM API key — not included by default, by design)
- Logo upload / more PDF export themes
- Additional language support for parsing/scoring

## What's explicitly out of scope (honest limitations)

- **AI rewriting / cover-letter generation** — needs a paid LLM API key, not configured in this build. The UI does not fake this.
- **Real ATS engine simulation** — "Strict/Modern/Generic" profiles are transparent scoring-weight adjustments, not connections to actual Workday/Taleo/Greenhouse software.
- **Percentile ranking ("Top 5% of candidates")** — not shown, since there's no real aggregate candidate dataset to compare against. A+–F score bands are used instead so nothing is fabricated.
- **Recruiter eye-tracking heatmaps, company-specific (FAANG) optimization** — would require real eye-tracking or hiring data we don't have; not implemented as fake features.

## FAQ

**Does my resume get uploaded anywhere?**
No. Parsing and scoring happen entirely in your browser. See [`pages/about.html`](pages/about.html) and [SECURITY.md](SECURITY.md).

**Why isn't there a login system?**
There's no backend, so there's nothing to authenticate against. History is stored locally per-browser.

**Can I use this for free?**
Yes — MIT licensed, no paywall, no account required.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Credits

Built by **Jahangir Hussen** — [GitHub](https://github.com/Jahangirhussen) · [Kaggle](https://www.kaggle.com/Jahangirhussen) · [Email](mailto:jahangirhussen.programmer@gmail.com)

## License

MIT — see [LICENSE](LICENSE).

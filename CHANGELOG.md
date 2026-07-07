# Changelog

All notable changes to this project are documented here.

## [1.0.0] — 2026-07-07

### Added
- Client-side ATS resume analysis: 8 weighted, transparent scoring categories (keyword match, structure, formatting, writing quality, achievements, experience, education, contact).
- PDF/DOCX/TXT resume parsing with OCR fallback for scanned PDFs.
- 200+ job roles across 29 industry categories, with seniority, country, and ATS-profile personalization.
- Job-seeker flow: upload → analysis → detailed report → history.
- Recruiter bulk-screening mode: upload hundreds of resumes against one job requirement, ranked table, sorting, filtering, status tagging (shortlist/interview/reject), star ratings, notes, candidate comparison.
- Exports: CSV, JSON (zipped), individual per-candidate PDFs (zipped, original filenames), combined multi-candidate PDF with table of contents, and a premium multi-page single-candidate PDF report (cover page, executive summary, radar chart, category breakdown, roadmap, flagged issues, auto-generated recruiter notes).
- Dark mode, responsive layout, local-only history (no backend, no data upload).

### Notes
- No AI rewriting / cover-letter generation — would require a paid LLM API key not configured in this build.
- No real employer ATS engine connection — scoring is transparent and rule-based, not a simulation of any specific vendor's software.

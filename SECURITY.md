# Security Policy

## Data handling

This application processes resumes and job descriptions entirely client-side, in the user's browser. No file or text content is ever transmitted to a server. Report history is stored only in the browser's `localStorage`/`sessionStorage`, on the user's own device.

The only network requests this app makes are to load third-party parsing libraries from CDN (PDF.js, Mammoth.js, Tesseract.js, JSZip, jsPDF) — these libraries do not receive resume content, they run locally in the browser after loading.

## Reporting a vulnerability

If you find a security issue (e.g. an XSS vector in how resume/report content is rendered), please open a private report via GitHub's "Report a vulnerability" feature on this repository, or email jahangirhussen.programmer@gmail.com. Please do not open a public issue for security reports.

We aim to acknowledge reports within 72 hours.

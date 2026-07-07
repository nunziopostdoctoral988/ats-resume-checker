# Contributing

Thanks for considering a contribution to ATS Resume Checker.

## Getting started

This is a plain HTML/CSS/JS project — no build step, no package manager required.

1. Fork and clone the repo.
2. Open `index.html` directly, or serve the folder with any static server (`npx serve`, VS Code Live Server, etc).
3. Make your changes under `assets/`, `pages/`, or `data/`.

## Guidelines

- No build tools/frameworks — keep it plain HTML/CSS/JS so anyone can run it by opening a file.
- Match the existing code style: no unnecessary comments, small focused functions, reuse the CSS classes in `assets/css/components.css` before adding new ones.
- If you change scoring logic in `assets/js/ats-checker.js`, explain the reasoning in your PR — scoring must stay transparent and explainable, not a black box.
- Test your change by actually running the upload → analysis → report flow in a browser before opening a PR.

## Reporting bugs / suggesting features

Open a GitHub issue with steps to reproduce (for bugs) or a clear use case (for features).

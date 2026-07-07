function basePath() {
  return location.pathname.includes("/pages/") ? "../" : "";
}

const NAV_LINKS = [
  { href: "index.html", label: "Home", key: "home" },
  { href: "pages/upload.html", label: "Check Resume", key: "upload" },
  { href: "pages/recruiter.html", label: "For Companies", key: "recruiter" },
  { href: "pages/history.html", label: "History", key: "history" },
  { href: "pages/about.html", label: "About", key: "about" },
  { href: "pages/contact.html", label: "Contact", key: "contact" },
];

function renderNavbar(activeKey) {
  const root = document.getElementById("navbar-root");
  if (!root) return;
  const base = basePath();
  const links = NAV_LINKS.map(
    (l) => `<a href="${base}${l.href}" class="${l.key === activeKey ? "active" : ""}">${l.label}</a>`
  ).join("");
  root.innerHTML = `
    <header class="navbar">
      <div class="navbar-inner">
        <a href="${base}index.html" class="brand"><span class="brand-mark">AI</span> ATS Checker</a>
        <nav class="nav-links" aria-label="Primary">${links}</nav>
        <div class="nav-actions">
          <a href="${base}pages/upload.html" class="btn btn-primary btn-sm">Check My Resume</a>
          <button class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">${themeIcon()}</button>
          <button class="nav-burger" id="nav-burger" aria-label="Open menu" aria-expanded="false">${burgerIcon()}</button>
        </div>
      </div>
      <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile">${links}</nav>
    </header>
  `;
  document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
  const burger = document.getElementById("nav-burger");
  const menu = document.getElementById("mobile-menu");
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
}

function themeIcon() {
  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  return dark
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>`;
}

function burgerIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("ats_theme", next);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.innerHTML = themeIcon();
}

function initTheme() {
  const saved = localStorage.getItem("ats_theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
}

function renderFooter() {
  const root = document.getElementById("footer-root");
  if (!root) return;
  const base = basePath();
  root.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-col">
            <a href="${base}index.html" class="brand" style="margin-bottom:12px"><span class="brand-mark">AI</span> ATS Checker</a>
            <p class="text-muted" style="font-size:var(--fs-sm)">Recruiter-grade ATS resume analysis. Transparent scoring, actionable fixes, 100% client-side &mdash; your resume never leaves your browser.</p>
          </div>
          <div class="footer-col">
            <h4>Product</h4>
            <a href="${base}pages/upload.html">Check Resume</a>
            <a href="${base}pages/history.html">History</a>
            <a href="${base}index.html#features">Features</a>
            <a href="${base}index.html#how-it-works">How It Works</a>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <a href="${base}pages/about.html">About</a>
            <a href="${base}pages/contact.html">Contact</a>
          </div>
          <div class="footer-col">
            <h4>Legal</h4>
            <a href="${base}pages/about.html#privacy">Privacy</a>
            <a href="${base}pages/about.html#terms">Terms</a>
          </div>
          <div class="footer-col">
            <h4>Connect</h4>
            <a href="https://github.com/Jahangirhussen/" target="_blank" rel="noopener">GitHub</a>
            <a href="https://www.kaggle.com/Jahangirhussen" target="_blank" rel="noopener">Kaggle</a>
            <a href="mailto:jahangirhussen.programmer@gmail.com">Email</a>
            <a href="https://wa.me/8801849620018" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
        <div class="footer-bottom">
          <span>&copy; ${new Date().getFullYear()} ATS Resume Checker. All rights reserved.</span>
          <span>Built for job seekers &amp; recruiters.</span>
        </div>
      </div>
    </footer>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  const active = document.body.getAttribute("data-page") || "home";
  renderNavbar(active);
  renderFooter();
});

const Charts = (() => {
  function gauge(score) {
    const r = 90, c = 2 * Math.PI * r;
    const offset = c - (score / 100) * c;
    const color = Utils.scoreColor(score);
    return `
      <div class="gauge-wrap">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle class="gauge-track" cx="110" cy="110" r="${r}"></circle>
          <circle class="gauge-fill" cx="110" cy="110" r="${r}" stroke="${color}"
            stroke-dasharray="${c}" stroke-dashoffset="${offset}"></circle>
        </svg>
        <div class="gauge-center">
          <div class="gauge-score" style="color:${color}">${score}</div>
          <div class="gauge-label">ATS Score</div>
        </div>
      </div>`;
  }

  function categoryBar(label, score) {
    const color = Utils.scoreColor(score);
    return `
      <div class="category-row">
        <div class="cat-name">${Utils.escapeHtml(label)}</div>
        <div class="progress"><div class="progress-fill" style="width:${score}%;background:${color}"></div></div>
        <div class="cat-score" style="color:${color}">${score}</div>
      </div>`;
  }

  function radar(categoryScores, labels) {
    const keys = Object.keys(categoryScores);
    const n = keys.length;
    const size = 260, center = 130, maxR = 95;
    const step = (2 * Math.PI) / n;
    const pt = (i, r) => {
      const a = -Math.PI / 2 + i * step;
      return [center + r * Math.cos(a), center + r * Math.sin(a)];
    };
    const grid = [0.25, 0.5, 0.75, 1].map((lv) =>
      keys.map((_, i) => pt(i, lv * maxR).join(",")).join(" ")
    );
    const axes = keys.map((_, i) => {
      const [x, y] = pt(i, maxR);
      return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" style="stroke:var(--border);stroke-width:1"></line>`;
    }).join("");
    const labelEls = keys.map((k, i) => {
      const [x, y] = pt(i, maxR + 24);
      return `<text x="${x}" y="${y}" font-size="9" text-anchor="middle" style="fill:var(--text-muted)">${(labels && labels[k]) || k}</text>`;
    }).join("");
    const dataPoly = keys.map((k, i) => pt(i, (categoryScores[k] / 100) * maxR).join(",")).join(" ");
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${grid.map((p) => `<polygon points="${p}" style="fill:none;stroke:var(--border);stroke-width:1"></polygon>`).join("")}
      ${axes}
      <polygon points="${dataPoly}" style="fill:var(--brand-500);fill-opacity:0.25;stroke:var(--brand-500);stroke-width:2"></polygon>
      ${labelEls}
    </svg>`;
  }

  return { gauge, categoryBar, radar };
})();

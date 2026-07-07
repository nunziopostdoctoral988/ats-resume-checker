const Exporter = (() => {
  function downloadJSON(report) {
    Utils.downloadFile(`${report.fileName || "resume"}-ats-report.json`, JSON.stringify(report, null, 2), "application/json");
  }

  function printReport() {
    window.print();
  }

  function copyShareSummary(report) {
    const top = report.issues.slice(0, 3).map((i, idx) => `${idx + 1}. ${i.title}`).join("\n");
    const text = `ATS Resume Report\nFile: ${report.fileName}\nRole: ${report.role}\nOverall Score: ${report.overallScore}/100 (${report.grade} - ${report.gradeLabel})\nEstimated ATS Pass Probability: ${report.passProbability}%\n\nTop Priority Fixes:\n${top}`;
    navigator.clipboard.writeText(text).then(
      () => Utils.toast("Summary copied to clipboard"),
      () => Utils.toast("Could not copy — clipboard permission denied", "error")
    );
  }

  function downloadCSV(filename, rows) {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = rows.map((row) => row.map(esc).join(",")).join("\n");
    Utils.downloadFile(filename, csv, "text/csv");
  }

  return { downloadJSON, printReport, copyShareSummary, downloadCSV };
})();

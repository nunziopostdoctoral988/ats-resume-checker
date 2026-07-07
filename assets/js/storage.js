const Storage = (() => {
  const HISTORY_KEY = "ats_history";
  const CURRENT_KEY = "ats_current_report";
  const MAX_HISTORY = 25;

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveToHistory(report) {
    const list = getHistory();
    list.unshift({
      id: report.id,
      fileName: report.fileName,
      role: report.role,
      overallScore: report.overallScore,
      grade: report.grade,
      createdAt: report.createdAt,
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
  }

  function deleteFromHistory(id) {
    const list = getHistory().filter((r) => r.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    const reports = getAllReports();
    delete reports[id];
    localStorage.setItem("ats_reports", JSON.stringify(reports));
  }

  function getAllReports() {
    try {
      return JSON.parse(localStorage.getItem("ats_reports")) || {};
    } catch {
      return {};
    }
  }

  function saveReport(report) {
    const all = getAllReports();
    all[report.id] = report;
    try {
      localStorage.setItem("ats_reports", JSON.stringify(all));
    } catch {
      const ids = Object.keys(all);
      if (ids.length > 5) {
        delete all[ids[ids.length - 1]];
        localStorage.setItem("ats_reports", JSON.stringify(all));
      }
    }
    saveToHistory(report);
  }

  function getReport(id) {
    return getAllReports()[id] || null;
  }

  function saveBulkReport(report) {
    const all = getAllReports();
    all[report.id] = report;
    try {
      localStorage.setItem("ats_reports", JSON.stringify(all));
    } catch {
      const ids = Object.keys(all);
      if (ids.length > 5) { delete all[ids[0]]; localStorage.setItem("ats_reports", JSON.stringify(all)); }
    }
  }

  function saveBulkBatch(batch) {
    const key = "ats_bulk_batches";
    let list = [];
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch { list = []; }
    list.unshift(batch);
    try {
      localStorage.setItem(key, JSON.stringify(list.slice(0, 10)));
    } catch {
      localStorage.setItem(key, JSON.stringify([batch]));
    }
  }

  function getBulkBatches() {
    try { return JSON.parse(localStorage.getItem("ats_bulk_batches")) || []; } catch { return []; }
  }

  function setCurrentReport(report) {
    sessionStorage.setItem(CURRENT_KEY, JSON.stringify(report));
  }

  function getCurrentReport() {
    try {
      return JSON.parse(sessionStorage.getItem(CURRENT_KEY));
    } catch {
      return null;
    }
  }

  function setPendingInput(data) {
    sessionStorage.setItem("ats_pending_input", JSON.stringify(data));
  }

  function getPendingInput() {
    try {
      return JSON.parse(sessionStorage.getItem("ats_pending_input"));
    } catch {
      return null;
    }
  }

  return {
    getHistory, saveReport, deleteFromHistory, getReport,
    setCurrentReport, getCurrentReport, setPendingInput, getPendingInput,
    saveBulkReport, saveBulkBatch, getBulkBatches,
  };
})();

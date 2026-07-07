const Parser = (() => {
  async function readFile(file) {
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "txt") return await readTxt(file);
    if (ext === "pdf") return await readPdf(file);
    if (ext === "docx") return await readDocx(file);
    throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
  }

  function readTxt(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ text: reader.result, pageCount: 1, ocrUsed: false });
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async function readPdf(file) {
    if (typeof pdfjsLib === "undefined") {
      throw new Error("PDF engine failed to load. Check your internet connection and try again.");
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const buf = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(" ") + "\n";
    }
    let ocrUsed = false;
    if (text.trim().length < 40 && pdf.numPages > 0) {
      text = await ocrPdf(pdf);
      ocrUsed = true;
    }
    return { text, pageCount: pdf.numPages, ocrUsed };
  }

  async function ocrPdf(pdf) {
    if (typeof Tesseract === "undefined") {
      throw new Error("This looks like a scanned/image PDF. OCR engine failed to load — please upload a text-based PDF or DOCX instead.");
    }
    let fullText = "";
    const maxPages = Math.min(pdf.numPages, 5);
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
      const { data } = await Tesseract.recognize(canvas, "eng");
      fullText += data.text + "\n";
    }
    return fullText;
  }

  async function readDocx(file) {
    if (typeof mammoth === "undefined") {
      throw new Error("DOCX engine failed to load. Check your internet connection and try again.");
    }
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return { text: result.value, pageCount: Math.max(1, Math.round(result.value.length / 3000)), ocrUsed: false };
  }

  function detectSections(text) {
    const headers = ATSData.keywords.section_headers;
    const lines = text.split(/\n/);
    const found = {};
    for (const [section, aliases] of Object.entries(headers)) {
      const re = new RegExp(`^\\s*(${aliases.join("|")})\\s*:?\\s*$`, "i");
      const idx = lines.findIndex((l) => re.test(l.trim()));
      found[section] = idx !== -1;
    }
    for (const [section, aliases] of Object.entries(headers)) {
      if (found[section]) continue;
      const re = new RegExp(`\\b(${aliases.join("|")})\\b`, "i");
      found[section] = re.test(text);
    }
    return found;
  }

  function extractName(text) {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 8);
    for (const line of lines) {
      if (/[@\d]/.test(line)) continue;
      if (line.length > 45 || line.length < 3) continue;
      const w = line.split(/\s+/);
      if (w.length < 2 || w.length > 4) continue;
      if (w.every((x) => /^[A-Z][a-zA-Z.'-]*$/.test(x))) return line;
    }
    return null;
  }

  function splitBullets(text) {
    return text
      .split(/\n/)
      .map((l) => l.trim())
      .filter((l) => /^[•\-*▪◦‣o]\s+/.test(l) || (l.length > 20 && l.length < 220))
      .map((l) => l.replace(/^[•\-*▪◦‣o]\s+/, ""));
  }

  return { readFile, detectSections, splitBullets, extractName };
})();

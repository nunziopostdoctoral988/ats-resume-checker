const AtsChecker = (() => {
  const D = () => window.ATSData;

  function words(text) {
    return (text.toLowerCase().match(/[a-z0-9+.#/]+/g) || []);
  }

  function sentences(text) {
    return text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  }

  function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  function fleschScore(text) {
    const sents = sentences(text);
    const w = words(text);
    if (!sents.length || !w.length) return 0;
    const syllables = w.reduce((sum, word) => sum + countSyllables(word), 0);
    const score = 206.835 - 1.015 * (w.length / sents.length) - 84.6 * (syllables / w.length);
    return Math.round(Utils.clamp(score, 0, 100));
  }

  function extractKeyPhrases(jdText) {
    const stop = new Set(D().keywords.stopwords);
    const raw = jdText.toLowerCase().match(/[a-z][a-z0-9+.#/\-]{1,30}/g) || [];
    const freq = {};
    raw.forEach((w) => {
      if (stop.has(w) || w.length < 3) return;
      freq[w] = (freq[w] || 0) + 1;
    });
    const techHits = D().keywords.tech_stack.filter((t) =>
      new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(jdText)
    );
    const ranked = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([k]) => k);
    return Array.from(new Set([...techHits.map((t) => t.toLowerCase()), ...ranked])).slice(0, 35);
  }

  function textContainsWord(text, term) {
    const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`, "i").test(text);
  }

  function analyzeKeywords(resumeText, jdText, roleCategory) {
    const resumeLower = resumeText.toLowerCase();
    let required = jdText && jdText.trim().length > 30 ? extractKeyPhrases(jdText) : [];
    const roleSkills = (roleCategory && D().skills[roleCategory]) || [];
    if (required.length < 8) {
      required = Array.from(new Set([...required, ...roleSkills.map((s) => s.toLowerCase())]));
    }
    const matched = [], missing = [];
    required.forEach((term) => {
      (textContainsWord(resumeLower, term) ? matched : missing).push(term);
    });
    const matchPct = required.length ? Math.round((matched.length / required.length) * 100) : 100;

    const techFound = D().keywords.tech_stack.filter((t) => textContainsWord(resumeLower, t.toLowerCase()));
    const certsFound = D().keywords.certifications.filter((c) => resumeLower.includes(c.toLowerCase()));

    const resumeWords = words(resumeText);
    const totalWords = resumeWords.length || 1;
    const stuffed = [];
    matched.forEach((term) => {
      const count = resumeWords.filter((w) => w === term || w.startsWith(term)).length;
      const density = count / totalWords;
      if (density > 0.04 && count > 5) stuffed.push({ term, count });
    });

    return { required, matched, missing, matchPct, techFound, certsFound, stuffed, usedJD: jdText && jdText.trim().length > 30 };
  }

  function analyzeStructure(sections) {
    const core = ["contact", "summary", "experience", "education", "skills"];
    const bonus = ["projects", "certifications", "awards", "publications", "research", "languages", "volunteer", "references"];
    const corePresent = core.filter((s) => sections[s]).length;
    const bonusPresent = bonus.filter((s) => sections[s]).length;
    const score = Utils.clamp(Math.round((corePresent / core.length) * 85 + (bonusPresent / bonus.length) * 15), 0, 100);
    const missingCore = core.filter((s) => !sections[s]);
    return { score, corePresent, missingCore, bonusPresent, bonusTotal: bonus.length };
  }

  function analyzeFormatting(text, pageCount, ocrUsed, wordCount) {
    const rules = D().atsRules.formattingRisks;
    const issues = [];
    let score = 100;

    if (ocrUsed) {
      issues.push(mkIssue("formatting", "critical", "Scanned / image-based PDF detected",
        "Your file had almost no extractable text and had to be read using OCR. Most ATS parsers cannot read image-based PDFs at all.",
        "Whole document", "Export your resume directly from Word/Docs as a PDF, or upload the DOCX instead — never a scanned image.", "high"));
      score -= 40;
    }
    if (pageCount > rules.maxRecommendedPages) {
      issues.push(mkIssue("formatting", "medium", `Resume is ${pageCount} pages`,
        `Most ATS and recruiters expect ${rules.maxRecommendedPages} pages or fewer unless you have 10+ years of experience.`,
        "Whole document", "Trim older/less relevant roles and tighten bullet points to fit within 2 pages.", "medium"));
      score -= 10;
    }
    if (wordCount < rules.minWordsWarn) {
      issues.push(mkIssue("formatting", "high", "Resume content is too short",
        `Only ~${wordCount} words detected. Thin resumes score poorly on keyword match because there isn't enough content to match against.`,
        "Whole document", "Expand your experience bullets with specific responsibilities and quantified results.", "high"));
      score -= 15;
    }
    if (wordCount > rules.maxWordsWarn) {
      issues.push(mkIssue("formatting", "low", "Resume content may be too long",
        `~${wordCount} words detected. Very long resumes dilute keyword density and lose recruiter attention.`,
        "Whole document", "Cut redundant or outdated content — focus on the last 10-15 years of relevant experience.", "low"));
      score -= 5;
    }
    const iconMatches = text.match(/[☀-➿\u{1F300}-\u{1FAFF}]/gu) || [];
    if (iconMatches.length > 3) {
      issues.push(mkIssue("formatting", "medium", "Icons or emoji detected",
        "Emoji/icon glyphs were found in the text layer. Many ATS parsers render these as garbled characters or strip surrounding text.",
        `${iconMatches.length} icon-like characters found`, "Replace icons with plain text labels (e.g. use \"Email:\" instead of an envelope icon).", "medium"));
      score -= 8;
    }
    const multiSpaceLines = text.split("\n").filter((l) => /\S {3,}\S/.test(l)).length;
    const totalLines = text.split("\n").filter((l) => l.trim()).length || 1;
    if (multiSpaceLines / totalLines > 0.25) {
      issues.push(mkIssue("formatting", "medium", "Possible multi-column layout",
        "A large share of lines contain wide internal gaps, which often means text was laid out in columns. ATS parsers read left-to-right, top-to-bottom and can scramble multi-column content.",
        `${multiSpaceLines} of ${totalLines} lines flagged`, "Switch to a single-column, linear layout for maximum ATS compatibility.", "medium"));
      score -= 12;
    }
    if (/\|.*\|.*\|/.test(text)) {
      issues.push(mkIssue("formatting", "low", "Possible table structure detected",
        "Pipe-separated content suggests a table. Tables are frequently misread or skipped entirely by ATS parsers.",
        "Detected in extracted text", "Convert any tables to plain bullet points or paragraphs.", "low"));
      score -= 6;
    }
    return { score: Utils.clamp(score, 0, 100), issues };
  }

  function analyzeWritingQuality(text, bullets) {
    const issues = [];
    let score = 100;
    const weak = D().actionVerbs.weak;
    const buzz = D().actionVerbs.buzzwords;
    const lower = text.toLowerCase();

    const weakHits = weak.filter((w) => lower.includes(w));
    if (weakHits.length) {
      issues.push(mkIssue("writingQuality", "high", "Weak / filler phrases found",
        `Phrases like "${weakHits.slice(0, 3).join('", "')}" read as passive and low-impact to both ATS keyword scanners and recruiters.`,
        `${weakHits.length} instance(s)`,
        buildBeforeAfter(weakHits[0]), "medium"));
      score -= Math.min(20, weakHits.length * 4);
    }

    const buzzHits = buzz.filter((b) => lower.includes(b));
    if (buzzHits.length) {
      issues.push(mkIssue("writingQuality", "low", "Overused buzzwords detected",
        `Words like "${buzzHits.slice(0, 3).join('", "')}" are cliché and carry no measurable meaning to recruiters or ATS.`,
        `${buzzHits.length} instance(s)`, "Replace buzzwords with a specific, quantified accomplishment instead.", "medium"));
      score -= Math.min(10, buzzHits.length * 2);
    }

    const passiveMatches = text.match(/\b(is|are|was|were|been|being|be)\s+\w+ed\b/gi) || [];
    if (passiveMatches.length > 2) {
      issues.push(mkIssue("writingQuality", "medium", "Passive voice detected",
        `Found ${passiveMatches.length} passive-voice constructions (e.g. "${passiveMatches[0]}"). Active voice reads stronger and matches action-verb-based ATS scoring.`,
        `${passiveMatches.length} instance(s)`,
        `<span class="label">Before</span>"The project was completed by me" <span class="label" style="margin-top:8px">After</span>"I completed the project"`, "medium"));
      score -= Math.min(12, passiveMatches.length * 2);
    }

    const wordList = words(text).filter((w) => w.length > 4 && !D().keywords.stopwords.includes(w));
    const freq = {};
    wordList.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const overused = Object.entries(freq).filter(([, c]) => c >= 6).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (overused.length) {
      issues.push(mkIssue("writingQuality", "low", "Repeated words detected",
        `"${overused[0][0]}" appears ${overused[0][1]} times. Excessive repetition can look unnatural and reduce readability.`,
        overused.map(([w, c]) => `${w} (${c}x)`).join(", "), "Vary your vocabulary using synonyms where natural.", "low"));
      score -= 5;
    }

    const longSentences = sentences(text).filter((s) => words(s).length > 32);
    if (longSentences.length > 3) {
      issues.push(mkIssue("writingQuality", "low", "Several long sentences found",
        `${longSentences.length} sentences exceed 32 words, which hurts readability for both recruiters and ATS parsing.`,
        "Multiple locations", "Break long sentences into short, punchy bullet points.", "low"));
      score -= 6;
    }

    const flesch = fleschScore(text);
    if (flesch < 30) {
      issues.push(mkIssue("writingQuality", "medium", "Low readability score",
        `Flesch Reading Ease score is ${flesch}/100 — the text is dense and hard to skim quickly.`,
        "Whole document", "Shorten sentences and prefer simple, direct wording.", "medium"));
      score -= 8;
    }

    return { score: Utils.clamp(score, 0, 100), issues, flesch, weakCount: weakHits.length, buzzCount: buzzHits.length, passiveCount: passiveMatches.length };
  }

  function buildBeforeAfter(weakPhrase) {
    const examples = {
      "responsible for": ["Responsible for managing a team of engineers", "Led a team of 8 engineers, cutting release cycle time by 30%"],
      "worked on": ["Worked on the checkout flow redesign", "Redesigned the checkout flow, increasing conversion by 18%"],
      "helped with": ["Helped with customer onboarding", "Streamlined customer onboarding, reducing setup time from 3 days to 4 hours"],
    };
    const [before, after] = examples[weakPhrase] || ["Responsible for managing team", "Led a team of 12 engineers and improved delivery speed by 28%"];
    return `<span class="label">Before</span>${Utils.escapeHtml(before)}<br><span class="label" style="margin-top:8px">After</span>${Utils.escapeHtml(after)}`;
  }

  function analyzeAchievements(bullets) {
    const issues = [];
    if (!bullets.length) {
      issues.push(mkIssue("achievements", "high", "No clear bullet points detected",
        "We couldn't detect bulleted achievement statements in your experience section. ATS and recruiters expect scannable bullet points, not paragraphs.",
        "Experience section", "Format each role's responsibilities as 3-6 bullet points starting with an action verb.", "medium"));
      return { score: 40, issues, quantifiedPct: 0, strongVerbPct: 0 };
    }
    const strong = new Set(D().actionVerbs.strong);
    let quantified = 0, strongStart = 0;
    bullets.forEach((b) => {
      if (/\d/.test(b)) quantified++;
      const firstWord = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
      if (strong.has(firstWord)) strongStart++;
    });
    const quantifiedPct = Math.round((quantified / bullets.length) * 100);
    const strongVerbPct = Math.round((strongStart / bullets.length) * 100);
    let score = Math.round(quantifiedPct * 0.5 + strongVerbPct * 0.5);

    if (quantifiedPct < 40) {
      issues.push(mkIssue("achievements", "critical", "Most bullets lack measurable impact",
        `Only ${quantifiedPct}% of bullet points include a number, percentage, or metric. Quantified results are the strongest signal of real impact to both ATS and recruiters.`,
        "Experience bullets",
        `<span class="label">Before</span>Responsible for managing team<br><span class="label" style="margin-top:8px">After</span>Led a team of 12 engineers and improved delivery speed by 28%`, "high"));
    }
    if (strongVerbPct < 40) {
      issues.push(mkIssue("achievements", "high", "Bullets don't start with strong action verbs",
        `Only ${strongVerbPct}% of bullets start with a strong action verb (e.g. "led", "built", "increased"). Weak openers reduce perceived ownership and impact.`,
        "Experience bullets", "Start every bullet with a strong past-tense action verb from a target-role-relevant list.", "medium"));
    }
    return { score: Utils.clamp(score, 0, 100), issues, quantifiedPct, strongVerbPct };
  }

  function parseDateRanges(text) {
    const monthYear = "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?\\s+(\\d{4})";
    const yearOnly = "(19|20)\\d{2}";
    const re = new RegExp(`(${monthYear}|${yearOnly})\\s*(?:-|–|—|to)\\s*(${monthYear}|${yearOnly}|Present|Current)`, "gi");
    const ranges = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      const startYear = parseInt((m[0].match(/(19|20)\d{2}/) || [])[0], 10);
      const isPresent = /present|current/i.test(m[0]);
      const endMatches = m[0].match(/(19|20)\d{2}/g) || [];
      const endYear = isPresent ? new Date().getFullYear() : parseInt(endMatches[endMatches.length - 1], 10);
      if (startYear && endYear && endYear >= startYear) ranges.push([startYear, endYear]);
    }
    return ranges;
  }

  function analyzeExperience(text, seniority) {
    const issues = [];
    const ranges = parseDateRanges(text).sort((a, b) => a[0] - b[0]);
    let totalYears = 0;
    let coverage = [];
    ranges.forEach(([s, e]) => {
      for (let y = s; y < e; y++) coverage.push(y);
    });
    totalYears = new Set(coverage).size;

    const gaps = [];
    for (let i = 1; i < ranges.length; i++) {
      const gap = ranges[i][0] - ranges[i - 1][1];
      if (gap >= 1) gaps.push({ from: ranges[i - 1][1], to: ranges[i][0], years: gap });
    }
    if (gaps.length) {
      issues.push(mkIssue("experience", "low", `${gaps.length} potential employment gap(s) found`,
        "Gaps of a year or more between roles were detected. This is not necessarily a problem — just flagged for your review, since recruiters may ask about it.",
        gaps.map((g) => `${g.from}–${g.to}`).join(", "), "Consider briefly addressing significant gaps in your summary (e.g. education, freelance work, career break) if relevant.", "low"));
    }

    let score = 70;
    if (seniority && D().atsRules.seniorityExpectedYears[seniority]) {
      const [min, max] = D().atsRules.seniorityExpectedYears[seniority];
      if (totalYears >= min && totalYears <= max + 3) score = 95;
      else if (totalYears < min) {
        score = Utils.clamp(60 - (min - totalYears) * 8, 20, 60);
        issues.push(mkIssue("experience", "medium", `Experience below typical range for ${seniority}`,
          `Detected ~${totalYears} year(s) of experience; ${seniority} roles typically expect ${min}-${max} years.`,
          "Experience section", "Emphasize projects, internships, and quantified impact to offset fewer years of formal experience.", "low"));
      } else score = 85;
    } else if (ranges.length === 0) {
      score = 50;
      issues.push(mkIssue("experience", "medium", "No clear employment dates detected",
        "We couldn't find recognizable date ranges (e.g. \"Jan 2022 – Present\") in your experience section.",
        "Experience section", "List clear start/end dates (Month Year format) for every role.", "medium"));
    }

    return { score: Utils.clamp(score, 0, 100), issues, totalYears, gaps, roleCount: ranges.length };
  }

  function analyzeEducation(text) {
    const issues = [];
    const degreeRe = /\b(Bachelor|Master|PhD|Ph\.D|B\.?Sc|M\.?Sc|BBA|MBA|B\.?A\.?|M\.?A\.?|B\.?Tech|M\.?Tech|Associate Degree|Diploma)\b/i;
    const hasDegree = degreeRe.test(text);
    const yearMatch = text.match(/(19|20)\d{2}/g) || [];
    const gpaMatch = text.match(/\bGPA[:\s]*([0-4]\.\d{1,2})/i);
    let score = 60;
    if (hasDegree) score += 25; else {
      issues.push(mkIssue("education", "medium", "No recognizable degree detected",
        "We couldn't find standard degree keywords (Bachelor, Master, B.Sc, MBA, etc.) in your education section.",
        "Education section", "List your degree using standard naming (e.g. \"Bachelor of Science in Computer Science\").", "low"));
    }
    if (yearMatch.length) score += 15;
    return { score: Utils.clamp(score, 0, 100), issues, hasDegree, gpa: gpaMatch ? gpaMatch[1] : null };
  }

  function analyzeContact(contact, roleCategory) {
    const issues = [];
    let score = 100;
    if (!contact.email) {
      issues.push(mkIssue("contact", "critical", "No email address found",
        "An email address is the single most critical contact field. Without it, recruiters and ATS auto-responders cannot reach you.",
        "Contact section", "Add a professional email address at the top of your resume.", "high"));
      score -= 40;
    } else if (!contact.emailValid) {
      issues.push(mkIssue("contact", "high", "Email format looks invalid", "The detected email doesn't match a standard email pattern.", contact.email, "Double-check your email address is typed correctly.", "high"));
      score -= 20;
    }
    if (!contact.phone) {
      issues.push(mkIssue("contact", "high", "No phone number found",
        "A phone number is expected on almost all resumes and is often used for ATS deduplication.",
        "Contact section", "Add a phone number with country code if applying internationally.", "high"));
      score -= 20;
    }
    if (!contact.linkedin) {
      issues.push(mkIssue("contact", "low", "No LinkedIn profile found",
        "A LinkedIn URL is expected by most recruiters and increases profile credibility.",
        "Contact section", "Add your LinkedIn profile URL near your contact details.", "medium"));
      score -= 10;
    }
    const devRoles = ["software-engineering", "ai-data", "devops-cloud", "cybersecurity", "qa-testing"];
    if (devRoles.includes(roleCategory) && !contact.github) {
      issues.push(mkIssue("contact", "low", "No GitHub profile found",
        "For technical roles, a GitHub link is a strong, expected signal of hands-on work.",
        "Contact section", "Add your GitHub profile URL, ideally with pinned relevant repos.", "medium"));
      score -= 10;
    }
    return { score: Utils.clamp(score, 0, 100), issues };
  }

  function mkIssue(category, severity, title, why, where, suggestion, confidence) {
    return { category, severity, title, why, where, suggestion, confidence: confidence === "high" ? "Rule-based — high confidence" : "Heuristic — medium confidence" };
  }

  function detectDuplicates(text, sections) {
    const issues = [];
    const lines = text.split("\n").map((l) => l.trim().toLowerCase()).filter((l) => l.length > 15);
    const freq = {};
    lines.forEach((l) => (freq[l] = (freq[l] || 0) + 1));
    const dupes = Object.entries(freq).filter(([, c]) => c > 1);
    if (dupes.length) {
      issues.push(mkIssue("structure", "low", "Duplicate lines detected",
        `${dupes.length} line(s) appear to be repeated verbatim in your resume.`,
        "Multiple sections", "Remove duplicate bullet points or descriptions.", "high"));
    }
    return issues;
  }

  function applyAtsProfile(score, strictness) {
    const gap = 100 - score;
    const adjusted = score - gap * (strictness - 1);
    return Utils.clamp(Math.round(adjusted), 0, 100);
  }

  function grade(score) {
    return D().atsRules.scoreBands.find((b) => score >= b.min) || D().atsRules.scoreBands[D().atsRules.scoreBands.length - 1];
  }

  function buildRoadmap(categoryScores, issues) {
    const weights = D().atsRules.categoryWeights;
    const items = Object.entries(categoryScores)
      .map(([cat, s]) => ({ cat, score: s, weight: weights[cat] || 0, deficiency: (100 - s) * (weights[cat] || 0) }))
      .filter((i) => i.deficiency > 1)
      .sort((a, b) => b.deficiency - a.deficiency)
      .slice(0, 5);
    const potentialGain = Math.round(items.reduce((sum, i) => sum + i.deficiency * 0.6, 0));
    return { items, potentialGain };
  }

  function analyze(input) {
    const { resumeText, jdText, roleCategory, roleName, seniority, country, atsProfileKey, fileName, pageCount, ocrUsed } = input;
    const sections = Parser.detectSections(resumeText);
    const contact = Validator.extractContact(resumeText);
    const bullets = Parser.splitBullets(resumeText);
    const wordCount = words(resumeText).length;

    const keywordRes = analyzeKeywords(resumeText, jdText, roleCategory);
    const structureRes = analyzeStructure(sections);
    const formattingRes = analyzeFormatting(resumeText, pageCount, ocrUsed, wordCount);
    const writingRes = analyzeWritingQuality(resumeText, bullets);
    const achievementRes = analyzeAchievements(bullets);
    const experienceRes = analyzeExperience(resumeText, seniority);
    const educationRes = analyzeEducation(resumeText);
    const contactRes = analyzeContact(contact, roleCategory);
    const dupIssues = detectDuplicates(resumeText, sections);

    const rawScores = {
      keywordMatch: keywordRes.matchPct,
      structure: structureRes.score,
      formatting: formattingRes.score,
      writingQuality: writingRes.score,
      achievements: achievementRes.score,
      experience: experienceRes.score,
      education: educationRes.score,
      contact: contactRes.score,
    };

    const profile = D().atsRules.atsProfiles[atsProfileKey] || D().atsRules.atsProfiles.generic;
    const categoryScores = {};
    Object.entries(rawScores).forEach(([k, v]) => (categoryScores[k] = applyAtsProfile(v, profile.strictness)));

    const weights = D().atsRules.categoryWeights;
    const overallScore = Utils.clamp(
      Math.round(Object.entries(categoryScores).reduce((sum, [k, v]) => sum + v * (weights[k] || 0), 0)),
      0, 100
    );
    const gradeInfo = grade(overallScore);
    const passProbability = Utils.clamp(Math.round(overallScore * 0.6 + categoryScores.keywordMatch * 0.4), 0, 100);

    let allIssues = [
      ...keywordRes.missing.slice(0, 12).map((m) => mkIssue("keywordMatch", "high", `Missing keyword: "${m}"`,
        "This term appears in the job description / expected skill set but not in your resume. ATS keyword filters commonly reject resumes missing required terms.",
        "Job description" + (keywordRes.usedJD ? "" : " (role skill list)"), `Naturally work "${m}" into your Skills or Experience section if it genuinely applies.`, "high")),
      ...structureRes.missingCore.map((s) => mkIssue("structure", s === "contact" || s === "experience" ? "critical" : "high", `Missing "${s}" section`,
        `A standard "${s}" section heading wasn't detected. ATS parsers rely on section headings to categorize your content correctly.`,
        "Whole document", `Add a clearly labeled "${s.charAt(0).toUpperCase() + s.slice(1)}" section.`, "high")),
      ...formattingRes.issues,
      ...writingRes.issues,
      ...achievementRes.issues,
      ...experienceRes.issues,
      ...educationRes.issues,
      ...contactRes.issues,
      ...dupIssues,
    ];
    if (keywordRes.stuffed.length) {
      allIssues.push(mkIssue("keywordMatch", "medium", "Possible keyword stuffing",
        `"${keywordRes.stuffed[0].term}" appears unusually often (${keywordRes.stuffed[0].count}x). Unnatural repetition can trigger ATS spam filters.`,
        "Multiple locations", "Use the term naturally — 2-4 well-placed mentions is enough for ATS matching.", "medium"));
    }

    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    allIssues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const strengths = [];
    if (categoryScores.contact >= 90) strengths.push("Complete, valid contact information");
    if (categoryScores.achievements >= 75) strengths.push("Strong, quantified achievement bullets");
    if (categoryScores.keywordMatch >= 75) strengths.push("Strong keyword alignment with target role");
    if (categoryScores.structure >= 85) strengths.push("Well-structured resume with clear sections");
    if (writingRes.flesch >= 50) strengths.push("Clear, readable writing style");
    if (keywordRes.certsFound.length) strengths.push(`Relevant certifications found: ${keywordRes.certsFound.slice(0, 3).join(", ")}`);
    if (keywordRes.techFound.length >= 5) strengths.push(`Solid technical stack coverage (${keywordRes.techFound.length} tools/technologies detected)`);
    if (!strengths.length) strengths.push("Resume successfully parsed — see priority fixes below to build up strengths");

    const critical = allIssues.filter((i) => i.severity === "critical").length;
    const high = allIssues.filter((i) => i.severity === "high").length;
    const health = critical > 0 ? "Red" : high > 2 ? "Yellow" : "Green";

    const sectionWeights = Object.entries(weights).map(([cat, w]) => ({
      category: cat, weight: Math.round(w * 100), score: categoryScores[cat], contribution: Math.round(w * categoryScores[cat]),
    }));

    const roadmap = buildRoadmap(categoryScores, allIssues);

    return {
      id: Utils.uid(),
      createdAt: Date.now(),
      fileName: fileName || "resume",
      role: roleName || "General",
      roleCategory,
      seniority,
      country,
      atsProfile: profile.label,
      atsProfileNote: profile.note,
      overallScore,
      grade: gradeInfo.grade,
      gradeLabel: gradeInfo.label,
      gradeColor: gradeInfo.color,
      passProbability,
      health,
      categoryScores,
      rawScores,
      sectionWeights,
      keywordRes,
      structureRes,
      formattingRes,
      writingRes,
      achievementRes,
      experienceRes,
      educationRes,
      contactRes,
      contact,
      sections,
      wordCount,
      pageCount,
      ocrUsed,
      issues: allIssues,
      strengths: strengths.slice(0, 6),
      roadmap,
      resumeTextPreview: resumeText.slice(0, 6000),
    };
  }

  return { analyze, fleschScore };
})();

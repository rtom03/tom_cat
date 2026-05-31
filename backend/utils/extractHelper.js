// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TITLE_WORDS = 8;
const MAX_COMPANY_WORDS = 6;

const TITLE_CONNECTORS = new Set([
  "of",
  "for",
  "and",
  "&",
  "to",
  "the",
  "in",
  "on",
  "with",
  "platform",
  "systems",
  "ml",
  "ai",
]);

// ─────────────────────────────────────────────────────────────────────────────
// TRUE STOP WORDS ONLY
// (Removed valid company-ish words like Tech, Labs, Cloud, Health)
// ─────────────────────────────────────────────────────────────────────────────

const TRUE_STOP_WORDS = new Set([
  "This",
  "That",
  "These",
  "Those",
  "With",
  "From",
  "Into",
  "Role",
  "Overview",
  "Benefits",
  "Requirements",
  "Responsibilities",
  "Qualifications",
  "Description",
  "Location",
  "Remote",
  "Hybrid",
  "Onsite",
  "Apply",
  "Join",
  "About",
  "Mission",
  "Culture",
  "People",
  "Team",
  "Department",
  "Division",
  "Unit",
  "Company",
  "Platform",
  "Industry",
  "Market",
  "World",
  "Future",
  "Today",
  "Career",
  "Performance",
  "Planning",
  "Insurance",
  "Coverage",
  "Policy",
  "Review",
  "Feedback",
  "Accessibility",
  "Opportunity",
  "Equal",
  "Employer",
]);

const COMPANY_ALLOWED_WORDS = new Set([
  "Tech",
  "Labs",
  "Cloud",
  "Health",
  "AI",
  "ML",
  "Data",
  "Systems",
  "Software",
  "Networks",
  "Global",
  "Analytics",
  "Solutions",
  "Technology",
  "Technologies",
  "Group",
  "Financial",
  "Finance",
]);

const NOISE_PATTERNS = [
  /skip to content/i,
  /cookie preferences/i,
  /privacy policy/i,
  /terms of service/i,
  /equal opportunity employer/i,
  /recommended jobs/i,
  /related jobs/i,
  /share this job/i,
  /apply now/i,
  /sign in/i,
  /create account/i,
  /accessibility/i,
  /powered by/i,
  /all rights reserved/i,
  /careers home/i,
  /search jobs/i,
];

const NEGATIVE_TITLE_TERMS = new Set([
  "benefits",
  "requirements",
  "responsibilities",
  "qualifications",
  "overview",
  "summary",
  "description",
  "salary",
  "location",
  "about",
  "company",
  "culture",
]);

const NEGATIVE_COMPANY_TERMS = new Set([
  "benefits",
  "requirements",
  "responsibilities",
  "qualifications",
  "overview",
  "summary",
  "description",
  "salary",
  "location",
  "remote",
  "hybrid",
  "onsite",
]);

const COMPANY_STOP = new Set([
  "We",
  "Our",
  "The",
  "A",
  "An",
  "Us",
  "You",
  "They",
  "Join",
  "Apply",
  "About",
  "At",
]);

const TRUE_LEGAL_SUFFIXES = [
  "Inc",
  "LLC",
  "Ltd",
  "Corp",
  "Co",
  "PLC",
  "GmbH",
  "AG",
  "SA",
  "NV",
  "BV",
];

const COMPANY_FLAVOR_WORDS = [
  "Technologies",
  "Technology",
  "Tech",
  "Software",
  "Systems",
  "Solutions",
  "Consulting",
  "Labs",
  "Analytics",
  "Cloud",
  "Networks",
  "Health",
  "Finance",
  "Financial",
  "Agency",
  "Global",
  "International",
  "Group",
];

const ROLE_TERMS = [
  "Engineer",
  "Developer",
  "Architect",
  "Designer",
  "Manager",
  "Director",
  "Lead",
  "Head",
  "Scientist",
  "Researcher",
  "Analyst",
  "Consultant",
  "Coordinator",
  "Specialist",
  "Administrator",
  "Officer",
  "Executive",
  "Recruiter",
  "Producer",
  "Editor",
  "Writer",
  "Strategist",
  "Associate",
  "Intern",
  "Product",
  "Marketing",
  "Operations",
  "Sales",
  "Finance",
  "Legal",
  "Compliance",
  "Security",
  "Cloud",
  "Platform",
  "Infrastructure",
  "Data",
  "AI",
  "ML",
  "MLOps",
  "DevOps",
  "SRE",
  "QA",
  "UX",
  "UI",
  "Frontend",
  "Backend",
  "Fullstack",
  "Full-Stack",
  "Technical",
  "Principal",
  "Staff",
  "Founding",
];

const TOKEN = "[\\p{Lu}][\\p{L}0-9&+.#/\\-]*";
const COMPANY_PATTERN = `(?:${TOKEN})(?:\\s+(?:${TOKEN})){0,5}`;

const TITLE_TOKEN = "[\\p{Lu}][\\p{L}0-9&+.#/\\-]*(?:'[\\p{L}]+)?";

const TITLE_PATTERN = `(?:${TITLE_TOKEN}|of|for|and|the|to|in|on|with|&|AI|ML|DevOps|SRE|QA|UI|UX)(?:\\s+(?:${TITLE_TOKEN}|of|for|and|the|to|in|on|with|&|AI|ML|DevOps|SRE|QA|UI|UX)){0,7}`;

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function normalizeWhitespace(str = "") {
  return str
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function normalizeCompany(company = "") {
  return company
    .replace(/[,]+/g, "")
    .replace(/\bINC\b/gi, "Inc")
    .replace(/\bLLC\b/gi, "LLC")
    .replace(/\bLTD\b/gi, "Ltd")
    .replace(/\bCORP\b/gi, "Corp")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function canonicalCompany(str = "") {
  return str
    .toLowerCase()
    .replace(/\.(com|ai|io|co|net|org)/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function titleCase(str) {
  return str
    .split(/\s+/)
    .map((w) => {
      if (TITLE_CONNECTORS.has(w.toLowerCase())) {
        return w.toLowerCase();
      }

      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}

function lineWeight(index) {
  if (index <= 3) return 60;
  if (index <= 10) return 40;
  if (index <= 20) return 20;
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEANING
// ─────────────────────────────────────────────────────────────────────────────

function cleanText(text = "") {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[•●🏅📈]/g, " ")
    .replace(/\|/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+(About\s+[A-Z])/g, "\n$1")
    .replace(/\s+(At\s+[A-Z][a-z])/g, "\n$1")
    .replace(/[ \t]{2,}/g, " ");
}

function preprocess(rawText) {
  const cleaned = cleanText(rawText);

  let lines = cleaned
    .split("\n")
    .map((l) => normalizeWhitespace(l))
    .filter(Boolean);

  const seen = new Set();

  lines = lines.filter((line) => {
    const normalized = line.toLowerCase();

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);

    return !NOISE_PATTERNS.some((p) => p.test(line));
  });

  return {
    lines,
    flat: normalizeWhitespace(lines.join(" ")),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATORS
// ─────────────────────────────────────────────────────────────────────────────

function isLikelyTitle(text) {
  if (!text) return false;

  if (NEGATIVE_TITLE_TERMS.has(text.toLowerCase())) {
    return false;
  }

  if (text.length > 100) {
    return false;
  }

  return ROLE_TERMS.some((term) => new RegExp(`\\b${term}\\b`, "i").test(text));
}

function isLikelyCompany(text) {
  if (!text) return false;

  if (NEGATIVE_COMPANY_TERMS.has(text.toLowerCase())) {
    return false;
  }

  if (text.length > 80) {
    return false;
  }

  if (
    /\b(team|department|division|squad|responsibilities|requirements)\b/i.test(
      text,
    )
  ) {
    return false;
  }

  if (/\b(we|our|your|their|this|that|these|those)\b/i.test(text)) {
    return false;
  }

  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISTINCTIVE WORDS
// ─────────────────────────────────────────────────────────────────────────────

const VERB_PATTERN =
  /(?:ing|tion|ment|ness|ance|ence|ity|ive|ous|ful|less|able|ible|ward|wise|ly)$/i;

function isDistinctiveWord(word) {
  if (!word) return false;

  if (word.length <= 2) return false;

  if (TRUE_STOP_WORDS.has(word)) return false;

  if (COMPANY_STOP.has(word)) return false;

  if (word.length > 6 && VERB_PATTERN.test(word)) {
    return false;
  }

  return /^\p{Lu}/u.test(word);
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY SHAPE MODEL
// ─────────────────────────────────────────────────────────────────────────────

function companyShapeScore(name = "") {
  let score = 0;

  const words = name.split(/\s+/);

  // PolicyMe
  if (/[a-z][A-Z]/.test(name)) {
    score += 35;
  }

  // Apartment List
  if (words.length === 2 && words.every((w) => /^[A-Z][a-z]+$/.test(w))) {
    score += 25;
  }

  // Stripe / Lattice
  if (
    words.length === 1 &&
    /^[A-Z][a-zA-Z]+$/.test(name) &&
    !TRUE_STOP_WORDS.has(name)
  ) {
    score += 30;
  }

  if (TRUE_LEGAL_SUFFIXES.some((s) => new RegExp(`\\b${s}\\b`).test(name))) {
    score += 20;
  }

  if (COMPANY_FLAVOR_WORDS.some((s) => new RegExp(`\\b${s}\\b`).test(name))) {
    score += 12;
  }

  // sentence-like phrases
  if (/\b(is|are|was|were|have|has|will|should|must|need)\b/i.test(name)) {
    score -= 60;
  }

  // pronouns
  if (/\b(we|our|your|their|this|that|these|those)\b/i.test(name)) {
    score -= 80;
  }

  if (words.length > 4) {
    score -= 40;
  }

  if (words.every((w) => TRUE_STOP_WORDS.has(w))) {
    score -= 70;
  }

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN DETECTION
// ─────────────────────────────────────────────────────────────────────────────

function extractDomainBrands(text = "") {
  const matches = [
    ...text.matchAll(
      /\b(?:www\.)?([A-Z][a-zA-Z0-9]+)\.(com|ai|io|co|net|org)\b/g,
    ),
  ];

  return [...new Set(matches.map((m) => m[1]))];
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATES
// ─────────────────────────────────────────────────────────────────────────────

function makeCandidate({ value, confidence = 0, source, line, type }) {
  return {
    value: normalizeWhitespace(value),
    confidence,
    source,
    line,
    type,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// TITLE EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

function extractTitleCandidates(lines, flat) {
  const candidates = [];

  // explicit title line
  lines.forEach((line, idx) => {
    if (!isLikelyTitle(line)) return;

    if (idx <= 4) {
      candidates.push(
        makeCandidate({
          value: line,
          confidence: 90 + lineWeight(idx),
          source: "T_HEADER",
          line: idx,
          type: "title",
        }),
      );
    }
  });

  // title at company
  lines.slice(0, 15).forEach((line, idx) => {
    const m = line.match(new RegExp(`(${TITLE_PATTERN})\\s+at\\s+`, "u"));

    if (!m) return;

    candidates.push(
      makeCandidate({
        value: m[1],
        confidence: 95 + lineWeight(idx),
        source: "T_AT",
        line: idx,
        type: "title",
      }),
    );
  });

  return candidates;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────

function extractCompanyCandidates(lines, flat) {
  const candidates = [];

  // About X
  lines.forEach((line, idx) => {
    const m = line.match(new RegExp(`^About\\s+(${COMPANY_PATTERN})`, "u"));

    if (!m) return;

    const value = normalizeCompany(m[1]);

    if (!isLikelyCompany(value)) return;

    candidates.push(
      makeCandidate({
        value,
        confidence: 120 + lineWeight(idx),
        source: "C_ABOUT",
        line: idx,
        type: "company",
      }),
    );
  });

  // At X,
  lines.slice(0, 15).forEach((line, idx) => {
    const m = line.match(new RegExp(`^At\\s+(${COMPANY_PATTERN})[,\\s]`, "u"));

    if (!m) return;

    const value = normalizeCompany(m[1]);

    if (!isLikelyCompany(value)) return;

    candidates.push(
      makeCandidate({
        value,
        confidence: 115 + lineWeight(idx),
        source: "C_AT",
        line: idx,
        type: "company",
      }),
    );
  });

  // X is hiring / mission
  lines.forEach((line, idx) => {
    const m = line.match(
      /^([A-Z][A-Za-z0-9&.\-]*(?:\s+[A-Z][A-Za-z0-9&.\-]*){0,2})\s+(?:is|are|was)\s+/,
    );

    if (!m) return;

    const value = normalizeCompany(m[1]);

    if (!isLikelyCompany(value)) return;

    candidates.push(
      makeCandidate({
        value,
        confidence: 100 + lineWeight(idx),
        source: "C_SUBJECT",
        line: idx,
        type: "company",
      }),
    );
  });

  // domains
  extractDomainBrands(flat).forEach((brand) => {
    candidates.push(
      makeCandidate({
        value: brand,
        confidence: 140,
        source: "C_DOMAIN",
        line: 999,
        type: "company",
      }),
    );
  });

  // repeated distinctive words
  const counts = {};

  for (const m of flat.matchAll(new RegExp(TOKEN, "gu"))) {
    const word = m[0];

    if (!isDistinctiveWord(word)) continue;

    counts[word] = (counts[word] || 0) + 1;
  }

  Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([word, count]) => {
      candidates.push(
        makeCandidate({
          value: word,
          confidence: 45 + count * 8,
          source: "C_REPEAT",
          line: 999,
          type: "company",
        }),
      );
    });

  return candidates;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING
// ─────────────────────────────────────────────────────────────────────────────

function appearsInBothEnds(value, lines) {
  if (!value || lines.length < 6) return false;

  const cutoff = Math.floor(lines.length * 0.7);

  const earlyLines = lines.slice(0, Math.min(10, cutoff));

  const lateLines = lines.slice(cutoff);

  const re = new RegExp(`\\b${escapeRegex(value)}\\b`, "i");

  return (
    earlyLines.some((l) => re.test(l)) && lateLines.some((l) => re.test(l))
  );
}

function enhanceCandidateScores(candidates, type, lines) {
  return candidates.map((candidate) => {
    let score = candidate.confidence;

    if (candidate.line <= 10) {
      score += 40;
    }

    if (type === "company") {
      score += companyShapeScore(candidate.value);

      if (appearsInBothEnds(candidate.value, lines)) {
        score += 25;
      }

      // kill OntarioEngineering
      if (
        !candidate.value.includes(" ") &&
        /[a-z][A-Z]/.test(candidate.value)
      ) {
        const parts = candidate.value
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .split(" ");

        if (parts.every((w) => TRUE_STOP_WORDS.has(w))) {
          score -= 100;
        }
      }
    }

    return {
      ...candidate,
      confidence: Math.max(0, Math.min(300, score)),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// AGGREGATION
// ─────────────────────────────────────────────────────────────────────────────

function aggregateCandidates(candidates) {
  const map = {};

  for (const c of candidates) {
    const key = canonicalCompany(c.value);

    if (!key) continue;

    if (!map[key]) {
      map[key] = {
        value: c.value,
        score: 0,
        mentions: 0,
        sources: new Set(),
        bestConfidence: 0,
      };
    }

    map[key].score += c.confidence;
    map[key].mentions += 1;
    map[key].sources.add(c.source);

    if (c.confidence > map[key].bestConfidence) {
      map[key].bestConfidence = c.confidence;
      map[key].value = c.value;
    }
  }

  return Object.values(map).map((x) => ({
    value: x.value,
    mentions: x.mentions,
    sources: [...x.sources],
    confidence: x.score + x.mentions * 15 + x.sources.size * 35,
  }));
}

function selectBest(candidates, validator) {
  const valid = candidates.filter((c) => validator(c.value));

  if (!valid.length) return null;

  valid.sort((a, b) => b.confidence - a.confidence);

  return valid[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function extractJobInfo(jobDesc = "") {
  const { lines, flat } = preprocess(jobDesc);

  let titleCandidates = extractTitleCandidates(lines, flat);

  let companyCandidates = extractCompanyCandidates(lines, flat);

  titleCandidates = enhanceCandidateScores(titleCandidates, "title", lines);

  companyCandidates = enhanceCandidateScores(
    companyCandidates,
    "company",
    lines,
  );

  const aggregatedCompanies = aggregateCandidates(companyCandidates);

  const bestTitle = selectBest(titleCandidates, isLikelyTitle);

  const bestCompany = selectBest(aggregatedCompanies, isLikelyCompany);

  return {
    title: bestTitle ? titleCase(bestTitle.value) : "Unknown",

    company: bestCompany ? normalizeCompany(bestCompany.value) : "Unknown",

    confidence: {
      title: bestTitle?.confidence || 0,
      company: bestCompany?.confidence || 0,
    },

    source: {
      title: bestTitle?.source || null,
      company: bestCompany?.sources || [],
    },

    debug: {
      titleCandidates: titleCandidates
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10),

      companyCandidates: aggregatedCompanies
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10),
    },
  };
}

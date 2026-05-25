/**
 * Advanced Job Title + Company Extractor
 * --------------------------------------
 *
 * Production-oriented extraction engine:
 *
 *   PREPROCESSING
 *      ↓
 *   SEGMENTATION
 *      ↓
 *   CANDIDATE GENERATION
 *      ↓
 *   SCORING ENGINE
 *      ↓
 *   VALIDATION
 *      ↓
 *   FINAL SELECTION
 *
 * Key upgrades over regex-only systems:
 *
 *  ✓ Candidate scoring instead of first-match
 *  ✓ Unicode-safe token support
 *  ✓ Connector-aware title parsing
 *  ✓ Noise removal + deduplication
 *  ✓ Frequency weighting
 *  ✓ Structural weighting
 *  ✓ Context relationship analysis
 *  ✓ Validation engine
 *  ✓ Confidence scores
 *  ✓ Source attribution
 *  ✓ Hydration duplication protection
 *  ✓ Modern title support
 *  ✓ Multi-pass extraction
 *
 * Designed for:
 *  - ATS ingestion
 *  - Job board scraping
 *  - Career page parsing
 *  - Messy HTML text extraction
 */

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
  /menu/i,
  /navigation/i,
  /footer/i,
  /header/i,
  /^home$/i,
  /^jobs$/i,
  /^careers$/i,
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
  "Team",
  "You",
  "They",
  "Join",
  "Apply",
]);

const LEGAL_SUFFIXES = [
  "Inc",
  "LLC",
  "Ltd",
  "Corp",
  "Co",
  "Group",
  "Technologies",
  "Technology",
  "Tech",
  "Software",
  "Systems",
  "Solutions",
  "Consulting",
  "Labs",
  "AI",
  "Analytics",
  "Cloud",
  "Networks",
  "Health",
  "Finance",
  "Financial",
  "Agency",
  "Global",
  "International",
];

// Modern + classic role signals
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
  "Prompt",
  "Advocate",
  "Evangelist",
  "Trainer",
  "Support",
  "Success",
  "Revenue",
  "Growth",
  "Principal",
  "Staff",
  "Founder",
  "Founding",
  "Partnerships",
  "Technical",
];

// Unicode-safe token
const TOKEN = "[\\p{Lu}][\\p{L}0-9&+.#/\\-]*(?:'[\\p{L}]+)?";

const COMPANY_PATTERN = `(?:${TOKEN})(?:\\s+(?:${TOKEN})){0,5}`;

const TITLE_PATTERN = `(?:${TOKEN}|of|for|and|the|to|in|on|with|&|AI|ML|DevOps|SRE|QA|UI|UX)(?:\\s+(?:${TOKEN}|of|for|and|the|to|in|on|with|&|AI|ML|DevOps|SRE|QA|UI|UX)){0,7}`;

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function unique(arr) {
  return [...new Set(arr)];
}

function normalizeWhitespace(str = "") {
  return str
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s{2,}/g, " ")
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

function dedupeLines(lines) {
  const seen = new Set();

  return lines.filter((line) => {
    const normalized = line.toLowerCase();

    if (seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

function cleanText(text = "") {
  return normalizeWhitespace(
    text
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/[•●]/g, " ")
      .replace(/\|/g, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

function removeNoise(lines) {
  return lines.filter((line) => {
    if (!line.trim()) return false;

    return !NOISE_PATTERNS.some((p) => p.test(line));
  });
}

function isLikelyTitle(text) {
  if (!text) return false;

  const lower = text.toLowerCase();

  if (NEGATIVE_TITLE_TERMS.has(lower)) {
    return false;
  }

  if (text.length > 100) {
    return false;
  }

  if (/[!?]{2,}/.test(text)) {
    return false;
  }

  const hasRoleTerm = ROLE_TERMS.some((term) =>
    new RegExp(`\\b${term}\\b`, "i").test(text),
  );

  return hasRoleTerm;
}

function isLikelyCompany(text) {
  if (!text) return false;

  const lower = text.toLowerCase();

  if (NEGATIVE_COMPANY_TERMS.has(lower)) {
    return false;
  }

  if (COMPANY_STOP.has(text.split(/\s+/)[0])) {
    return false;
  }

  if (text.length > 80) {
    return false;
  }

  return true;
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
  if (index <= 3) return 50;
  if (index <= 10) return 30;
  if (index <= 20) return 10;
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREPROCESSING
// ─────────────────────────────────────────────────────────────────────────────

function preprocess(rawText) {
  const cleaned = cleanText(rawText);

  let lines = cleaned
    .split("\n")
    .map((l) => normalizeWhitespace(l))
    .filter(Boolean);

  lines = dedupeLines(lines);
  lines = removeNoise(lines);

  const flat = normalizeWhitespace(lines.join(" "));

  return {
    lines,
    flat,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATE ENGINE
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

  // T1 Explicit labels
  lines.forEach((line, idx) => {
    const m = line.match(
      new RegExp(
        `(?:Job Title|Position|Role)\\s*[:\\-]\\s*(${TITLE_PATTERN})`,
        "u",
      ),
    );

    if (m) {
      candidates.push(
        makeCandidate({
          value: m[1],
          confidence: 95 + lineWeight(idx),
          source: "T1",
          line: idx,
          type: "title",
        }),
      );
    }
  });

  // T2 Hiring phrases
  const hiringPatterns = [
    /hiring\s+(?:an?\s+)?(.+?)(?:\.|,| at | to | who )/i,
    /looking for\s+(?:an?\s+)?(.+?)(?:\.|,| at | to | who )/i,
    /seeking\s+(?:an?\s+)?(.+?)(?:\.|,| at | to | who )/i,
    /recruiting\s+(?:an?\s+)?(.+?)(?:\.|,| at | to | who )/i,
    /need\s+(?:an?\s+)?(.+?)(?:\.|,| at | to | who )/i,
  ];

  hiringPatterns.forEach((pattern, pIdx) => {
    const matches = [...flat.matchAll(new RegExp(pattern, "gi"))];

    matches.forEach((m) => {
      const value = normalizeWhitespace(m[1]);

      if (!isLikelyTitle(value)) return;

      candidates.push(
        makeCandidate({
          value,
          confidence: 80 - pIdx,
          source: "T2",
          line: 999,
          type: "title",
        }),
      );
    });
  });

  // T3 "<Title> at <Company>"
  lines.slice(0, 15).forEach((line, idx) => {
    const m = line.match(
      new RegExp(`(${TITLE_PATTERN})\\s+at\\s+(${COMPANY_PATTERN})`, "u"),
    );

    if (m) {
      candidates.push(
        makeCandidate({
          value: m[1],
          confidence: 92 + lineWeight(idx),
          source: "T3",
          line: idx,
          type: "title",
        }),
      );
    }
  });

  // T4 Early-line semantic scan
  lines.slice(0, 20).forEach((line, idx) => {
    if (!isLikelyTitle(line)) return;

    candidates.push(
      makeCandidate({
        value: line,
        confidence: 60 + lineWeight(idx),
        source: "T4",
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

  // C1 Explicit labels
  lines.forEach((line, idx) => {
    const m = line.match(
      new RegExp(
        `(?:Company|Employer|Organization)\\s*[:\\-]\\s*(${COMPANY_PATTERN})`,
        "u",
      ),
    );

    if (m) {
      candidates.push(
        makeCandidate({
          value: normalizeCompany(m[1]),
          confidence: 98 + lineWeight(idx),
          source: "C1",
          line: idx,
          type: "company",
        }),
      );
    }
  });

  // C2 Subject-verb hiring pattern
  lines.forEach((line, idx) => {
    const m = line.match(
      new RegExp(
        `(${COMPANY_PATTERN})\\s+(?:is|are)\\s+(?:hiring|looking|seeking|recruiting)`,
        "u",
      ),
    );

    if (m) {
      candidates.push(
        makeCandidate({
          value: normalizeCompany(m[1]),
          confidence: 90 + lineWeight(idx),
          source: "C2",
          line: idx,
          type: "company",
        }),
      );
    }
  });

  // C3 "Join Company"
  lines.forEach((line, idx) => {
    const m = line.match(
      new RegExp(`Join\\s+(${COMPANY_PATTERN})(?:\\s+as|\\.|,|\\?|!)`, "iu"),
    );

    if (m) {
      candidates.push(
        makeCandidate({
          value: normalizeCompany(m[1]),
          confidence: 85 + lineWeight(idx),
          source: "C3",
          line: idx,
          type: "company",
        }),
      );
    }
  });

  // C4 "at Company"
  const atMatches = [
    ...flat.matchAll(new RegExp(`\\bat\\s+(${COMPANY_PATTERN})`, "gu")),
  ];

  atMatches.forEach((m) => {
    const value = normalizeCompany(m[1]);

    if (!isLikelyCompany(value)) return;

    candidates.push(
      makeCandidate({
        value,
        confidence: 65,
        source: "C4",
        line: 999,
        type: "company",
      }),
    );
  });

  // C5 Legal suffix
  const suffixRegex = new RegExp(
    `(${COMPANY_PATTERN})\\s+(?:${LEGAL_SUFFIXES.join("|")})`,
    "gu",
  );

  const suffixMatches = [...flat.matchAll(suffixRegex)];

  suffixMatches.forEach((m) => {
    candidates.push(
      makeCandidate({
        value: normalizeCompany(m[0]),
        confidence: 88,
        source: "C5",
        line: 999,
        type: "company",
      }),
    );
  });

  return candidates;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING ENGINE
// ─────────────────────────────────────────────────────────────────────────────

function enhanceCandidateScores(candidates, type) {
  const frequency = {};

  candidates.forEach((c) => {
    frequency[c.value] = (frequency[c.value] || 0) + 1;
  });

  return candidates.map((candidate) => {
    let score = candidate.confidence;

    // Frequency boost
    score += (frequency[candidate.value] || 0) * 5;

    // Structural weighting
    if (candidate.line <= 5) {
      score += 20;
    }

    // Penalize suspicious punctuation
    if (/[;:]{2,}/.test(candidate.value)) {
      score -= 40;
    }

    // Penalize sentence-like structures
    if (/\b(we|you|they|will|should|must)\b/i.test(candidate.value)) {
      score -= 50;
    }

    // Title-specific boosts
    if (type === "title") {
      if (
        ROLE_TERMS.some((t) =>
          new RegExp(`\\b${t}\\b`, "i").test(candidate.value),
        )
      ) {
        score += 20;
      }

      if (candidate.value.split(/\s+/).length > MAX_TITLE_WORDS) {
        score -= 30;
      }
    }

    // Company-specific boosts
    if (type === "company") {
      if (
        LEGAL_SUFFIXES.some((s) =>
          new RegExp(`\\b${s}\\b`, "i").test(candidate.value),
        )
      ) {
        score += 15;
      }

      if (candidate.value.split(/\s+/).length > MAX_COMPANY_WORDS) {
        score -= 25;
      }
    }

    return {
      ...candidate,
      confidence: Math.max(0, Math.min(100, score)),
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL RANKING
// ─────────────────────────────────────────────────────────────────────────────

function selectBest(candidates, validator) {
  const valid = candidates.filter((c) => validator(c.value));

  if (!valid.length) {
    return null;
  }

  valid.sort((a, b) => b.confidence - a.confidence);

  return valid[0];
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

export function extractJobInfo(jobDesc = "") {
  const { lines, flat } = preprocess(jobDesc);

  // Generate title candidates
  let titleCandidates = extractTitleCandidates(lines, flat);

  // Generate company candidates
  let companyCandidates = extractCompanyCandidates(lines, flat);

  // Enhance scores
  titleCandidates = enhanceCandidateScores(titleCandidates, "title");

  companyCandidates = enhanceCandidateScores(companyCandidates, "company");

  // Final selection
  const bestTitle = selectBest(titleCandidates, isLikelyTitle);

  const bestCompany = selectBest(companyCandidates, isLikelyCompany);

  return {
    title: bestTitle ? titleCase(bestTitle.value) : "Unknown",

    company: bestCompany ? normalizeCompany(bestCompany.value) : "Unknown",

    confidence: {
      title: bestTitle?.confidence || 0,
      company: bestCompany?.confidence || 0,
    },

    source: {
      title: bestTitle?.source || null,
      company: bestCompany?.source || null,
    },

    debug: {
      titleCandidates: titleCandidates
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5),

      companyCandidates: companyCandidates
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5),
    },
  };
}

const jobDescription = `
Software Engineer
Denver (Remote)
Evio Overview

Evio is a highly unique pharmacy solutions company that was founded by and works closely with health plans to implement transformative (to cost, quality, access and experience) initiatives primarily focused on specialty and other high-cost medication solutions.

In 2020, a group of five amazing Blue Cross Blue Shield health plans that in total serve more than 20 million members recognized that the way medications get to patients needs significant reform—rapidly rising costs and massive system complexities are detrimental to patients and the entire industry. In 2025, Wellmark joined as Evio's first non-founding investor and sixth owner health plan. Each company made, and continues to make, significant investments to establish Evio as an independent entity to lead this transformation.

Evio has advanced analytics and contracting capabilities at scale, and a suite of digital tools, to power our high-cost medication solutions. Our solutions act as a self-reinforcing “flywheel” where each element strengthens and feeds into the next, and support an “Only Evio can do that,” mindset and prioritization.

Evio is also a company that has invested heavily in and been highly intentional about people, team and culture. We believe we have created a very special place to work and encourage candidates to observe and ask us about our culture and decide for themselves.

Evio's Values

Empathy – The people our business serves always come first. We care for our teammates and put ourselves in the shoes of our health plan customers and the patients and clinicians our solutions benefit.

Diversity – We are committed to fostering a culture where everyone belongs and is valued for their background, experience and insights – one that encourages diversity of ideas, and is a nurturing, trusting, and accepting place for all.

Adventure – We are flexible, thrive in ambiguity, fail fast, and pivot quickly to get to a better answer. We celebrate wins and pivots with equal intensity.

Relentless – Guided by evidence and data, we are creative, curious, and unwavering in our pursuit of challenging the status quo and each other.

Transparency – Just as we seek to bring transparency to the pharmacy supply chain, authenticity and integrity are core to the way we communicate.

Excellence – We strive to raise the bar in all we do by hiring and developing exceptional talent and holding ourselves and our thinking to the highest standard.

About the role

At Evio, we are building solutions that improve how pharmacy works—and ultimately, how patients experience care. Our application-based digital solutions are central to that mission.

We’re looking for a Software Engineer who wants to build reliable systems that bring these solutions to life. The Senior Full Stack Engineer will be responsible for designing, developing, and supporting scalable, cloud-native applications. This role owns the technical design and evolution of our applications, working across the full stack, from intuitive user interfaces to resilient backend services and cloud-native infrastructure.

This is a hands-on role for someone who enjoys both building and shaping systems, and who wants to play a meaningful role in a growing, mission-driven team.

What you’ll do

Design, develop, and maintain cloud-native applications on AWS using serverless and container-based architectures

Build full stack features, including user interfaces and backend services

Develop and support containerized services running on ECS/Fargate with images stored in ECR

Implement and maintain CI/CD pipelines using GitHub Actions

Own the architecture and technical direction of a new cloud-native application

Lead design decisions across services, REST APIs, and data pipelines

Design and implement data pipelines and workflows using AWS Glue (PySpark) and Step Functions

Ensure the application is scalable, secure, and reliable in a regulated (HIPAA) environment

Collaborate with cross-functional teams including product, design, and engineering

Provide mentorship and technical guidance to team members

Qualifications

Bachelor’s degree in computer science, engineering, or related field (or equivalent experience)

7+ years of software engineering experience

Experience building cloud-native applications using AWS

Strong frontend development experience with React and TypeScript

Backend experience with Python and REST APIs

Experience with distributed systems, event-driven architecture, or data pipelines

Strong understanding of relational databases and SQL

Experience contributing to system design and architecture decisions

Strong problem-solving and communication skills across teams and levels

Someone who takes initiative, unearths problems, and leads with solutions

Ability to navigate ambiguity and drive clarity in complex problem spaces

Ownership mindset with a focus on delivering measurable outcomes

Strong product and business awareness when making technical decisions

Comfortable giving and receiving constructive feedback

Pragmatic approach to balancing speed, quality, and technical debt

Experience in healthcare, pharmacy, or regulated environments

Knowledge of HIPAA and PHI requirements

Experience with Apache Iceberg or modern data lake technologies

AWS certifications

Technology Stack

Frontend - React.js, TypeScript, Vite - Material UI, Redux Toolkit, React Router - styled-components

Backend & Services - Python (primary), Node.js (as needed) - REST APIs, microservices - AWS Lambda, AWS Step Functions - AWS Glue (PySpark)

Cloud & Infrastructure - AWS (Lambda, API Gateway, ECS, Fargate, ECR)

Data Platform - Amazon S3, Amazon Redshift - Apache Iceberg

DevOps & Tooling - GitHub Actions - Infrastructure-as-Code (CDK, Terraform, or similar)

Compensation: $140,000 - $170,000 plus additional variable compensation based on performance.

At Evio, we’re committed to building a competitive compensation package to honor the value our teammates bring as well as attract and retain top talent that is aligned with our culture, mission, and values. Compensation includes base pay (range shown) and could include other variable compensation opportunities depending on job seniority, location, and date of hire.

Evio Benefits

Great Health Insurance

The company pays 100% of medical, dental, and vision premiums for teammates, and 50% for dependents.

401K Match

Evio matches 100% of teammate contribution up to 5% of salary, subject to IRS limits.

Time Off

We have a flexible vacation policy for teammates to unplug and recharge when you need it. There is no minimum or maximum amount of vacation allowed per year, and there is no payment in consideration for unused vacation. Vacation is to be used at your discretion, with approval of leadership.

Parental Leave

Generous paid leave for new parents (includes birth and non-birth parents).

Evio values a diverse workplace and is committed to supporting and celebrating the diversity that each teammate brings to the table. We are proud to provide equal employment opportunities to all teammates and applicants for employment and prohibit discrimination and harassment of any type without regard to race, color, religion, age, sex, national origin, disability status, medical condition, genetic information, protected veteran status, sexual orientation, gender identity or expression, or any other characteristic protected by federal, state or local laws.

Fraud Notice

We’ve recently learned of fraudulent job postings and individuals falsely claiming to represent Evio. Protecting our candidates is incredibly important to us, and we want to share a few reminders:

All official communication will come from an email ending in @evio.com.

We will never conduct text-only interviews (Teams, SMS, WhatsApp, Telegram, etc.).

We will never ask for payment, gift cards, fees, or purchases of any kind.

We will never request sensitive financial information during the recruiting process.

Our open roles are posted only on our official website, LinkedIn, and Greenhouse job board.

If you believe you’ve encountered a scam, you can also report it to the Federal Trade Commission or the Internet Crime Complaint Center. Thank you for your care and vigilance — we’re grateful to everyone who helps keep our community safe.

Information Disclosure

We value transparency in our hiring process and want applicants to understand how your information is used.

We collect and use personal information you provide during the application process such as your resume, employment history, education, interview responses, and other job-related information, to evaluate your qualifications for employment. This may also include limited technical and interaction data, such as IP address and device or browser information.

We may use automated or AI-assisted tools to help review applications, identify qualified candidates, and detect or investigate potentially fraudulent or deceptive activity. Human reviewers remain involved, and these tools support, not replace, human judgment.

These measures support a fair and secure hiring process for all candidates. If you require a reasonable accommodation, please inform us when invited to interview.

California privacy notice

Consistent with California law, we use this information for recruiting, hiring, and related business purposes, including evaluating your candidacy and improving our hiring processes.
`;

// ─────────────────────────────────────────────────────────────────────────────
// TESTS
// ─────────────────────────────────────────────────────────────────────────────

const tests = [
  {
    label: "OpenAI",
    input: jobDescription,
  },
];

// Uncomment to run

// for (const t of tests) {
//   console.log("\n================================================");
//   console.log(t.label);

//   const result = extractJobInfo(t.input);

//   console.dir(result, { depth: null });
// }

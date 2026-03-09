/**
 * extractJobInfo(jobDesc)
 *
 * Regex-driven extractor — returns { title, company } from any job-posting.
 *
 * ── TITLE strategy (T1–T7) ─────────────────────────────────────────────────
 *  T1. Explicit label    "Job Title: …" / "Role: …" / "Position: …"
 *  T2. Hiring phrase     "hiring/seeking/recruiting [a] <Title>"
 *  T3. Looking phrase    "looking for [a] <Title>"
 *  T4. Join-as phrase    "join [us/Company] as [a] <Title>"
 *  T5. Dual anchor       "<Title> at <Company>"  (first meaningful line only)
 *  T6. Need phrase       "we need/want [a] <Title>"
 *  T7. Early-line scan   first 20 lines, skipping nav/UI noise
 *
 * ── COMPANY strategy (C1–C6) ───────────────────────────────────────────────
 *  C1. Explicit label    "Company: …" / "Employer: …"  (newline-bounded)
 *  C2. Legal suffix      "Acme Corp" / "Boston Consulting Group"
 *  C3. Subject-verb      "Stripe is hiring …"  (per-line, avoids duplicates)
 *  C4. Contextual "at"   "… at Google DeepMind" — pruned + last occurrence
 *  C5. Join phrase       "join Vercel" / "join Stryker?"
 *  C6. Work-for phrase   "work at/for/with Shopify"
 *
 * ── Key design decisions ───────────────────────────────────────────────────
 *  • NO /i flag on capturing patterns — it makes [A-Z] match lowercase too,
 *    letting stop-words ("as", "at", "to") slip into captured groups.
 *    Keywords use explicit case: [Hh]iring, [Jj]oin, etc.
 *  • Two-phase capture: locate keyword, then apply a case-sensitive pattern
 *    to only the substring that follows — no greedy cross-sentence matching.
 *  • clean() strips trailing lowercase runs and leading adjectives.
 *  • pruneName() strips trailing tokens that are in NAV_STOP, eliminating
 *    "Stryker Our Offices Explore Open" → "Stryker".
 *  • T7 scans the first 20 lines and skips known nav/UI noise lines so
 *    "Skip to content / Careers Home / Senior Director, Regulatory Affairs"
 *    correctly resolves to the title on line 6.
 *  • Company lookaheads include ? and ! so "join Stryker?" works.
 *  • Possessive 's is stripped ("Stryker's" → "Stryker").
 */

// ─── Shared fragments ────────────────────────────────────────────────────────

/** Single capitalised token: "Acme", "OpenAI", "AT&T" */
const NT = "[A-Z][a-zA-Z0-9&]+";

/** Multi-word name: up to 5 tokens */
const MN = `(?:${NT})(?:\\s+${NT}){0,4}`;

/** Legal / industry suffixes that strongly signal a company name */
const SUFFIX_RE =
  "Inc|LLC|Ltd|Corp|Co|Group|Holdings|Ventures|Capital|Partners|" +
  "Technologies|Technology|Tech|Software|Systems|Solutions|Services|" +
  "Consulting|Digital|Media|Studios?|Creative|Labs?|AI|Analytics|Cloud|" +
  "Networks|Interactive|Dynamics|Works|Hub|Health|Finance|Financial|" +
  "Management|Institute|Foundation|International|Global|Agency|Enterprises?";

/**
 * Navigation / UI words that must NEVER appear in a captured company name.
 * If any token in the capture matches one of these the trailing tokens (and
 * the bad token itself) are pruned off, e.g.:
 *   "Stryker Our Offices Explore Open"  →  "Stryker"
 */
const NAV_STOP = new Set([
  "Our",
  "Offices",
  "Explore",
  "Open",
  "Positions",
  "Home",
  "Search",
  "Return",
  "Apply",
  "View",
  "Jobs",
  "Logo",
  "Skip",
  "Content",
  "Menu",
  "Navigation",
  "Footer",
  "Header",
  "Page",
  "Site",
  "Privacy",
  "Policy",
  "Terms",
  "Service",
  "Legal",
  "About",
  "Contact",
  "Login",
  "Sign",
  "Register",
  "Back",
  "Next",
  "Previous",
  "Careers",
  "Hiring",
  "Join",
  "Work",
  "Review",
  "Read",
  "Learn",
  "More",
  "See",
  "All",
  "Latest",
  "New",
  "Featured",
  "Top",
  "Best",
  "Find",
  "Post",
  "Posted",
  "Date",
  "Details",
  "Description",
  "Requirements",
  "Benefits",
  "Overview",
  "Summary",
  "Apply",
  "Now",
  "Here",
  "Today",
  "Share",
  "Save",
]);

/** Words that can never stand alone as a company name */
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
  "I",
  "Join",
  "Work",
  "Hiring",
  "Are",
  "Is",
  "Was",
  "Be",
  "Been",
  "Have",
]);

/**
 * Lines that are clearly navigation / boilerplate — skip these in T7.
 * A line is "noisy" if it matches any of these patterns.
 */
const NAV_LINE_RE =
  /^(?:skip|return|apply|view all|careers|hiring at|our offices|explore|sitemap|accessibility|privacy|terms|legal|sign in|login|menu|navigation|©|\d+$)/i;

/** Role vocabulary — a valid title must contain ≥1 of these */
const ROLE_SIGNAL = new RegExp(
  [
    "Engineer",
    "Developer",
    "Designer",
    "Architect",
    "Manager",
    "Director",
    "VP",
    "President",
    "Officer",
    "Executive",
    "Full Stack Software Developer",
    "Lead",
    "Head",
    "Analyst",
    "Scientist",
    "Researcher",
    "Specialist",
    "Consultant",
    "Advisor",
    "Strategist",
    "Coordinator",
    "Administrator",
    "Associate",
    "Intern",
    "Trainee",
    "Recruiter",
    "Writer",
    "Editor",
    "Producer",
    "Technician",
    "Operations",
    "Marketing",
    "Sales",
    "Product",
    "Data",
    "FullStack",
    "Full.Stack",
    "Front.End",
    "Back.End",
    "DevOps",
    "QA",
    "UX",
    "UI",
    "CTO",
    "CIO",
    "CFO",
    "CEO",
    "COO",
    "SRE",
    "MLOps",
    "Scrum",
    "Cloud",
    "Security",
    "Platform",
    "Infrastructure",
    "Representative",
    "Support",
    "Account",
    "Project",
    "Program",
    "Growth",
    "Revenue",
    "Business",
    "Technical",
    "Delivery",
    "Affairs",
    "Regulatory",
    "Clinical",
    "Quality",
    "Finance",
    "Financial",
    "Legal",
    "Communications",
    "Relations",
    "Strategy",
    "Innovation",
    "Transformation",
  ].join("|"),
  "i",
);

// ─── Utilities ───────────────────────────────────────────────────────────────

/**
 * Strip noise from a raw regex capture.
 *   "talented Product Designer"       → "Product Designer"
 *   "Full Stack Developer at Stripe"  → "Full Stack Developer"
 *   "Boston Consulting Group,"        → "Boston Consulting Group"
 *   "Stryker's"                       → "Stryker"
 */
function clean(raw = "") {
  return raw
    .trim()
    .replace(/'s\b/g, "") // strip possessive
    .replace(/\s+[a-z]\S*.*$/s, "") // drop from first space+lowercase word onward
    .replace(/^[a-z]\S*\s+/, "") // drop a leading lowercase adjective
    .replace(/[,.\-\u2013:!?]+$/g, "") // strip trailing punctuation
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Prune a multi-word company name: if any token is in NAV_STOP, drop it and
 * everything after it.
 *   "Stryker Our Offices Explore Open"  →  "Stryker"
 *   "Boston Consulting Group"           →  "Boston Consulting Group"  (unchanged)
 */
function pruneName(str) {
  const tokens = str.split(/\s+/);
  const cut = tokens.findIndex((t) => NAV_STOP.has(t));
  return (cut === -1 ? tokens : tokens.slice(0, cut)).join(" ").trim();
}

function validTitle(s) {
  return Boolean(s) && s.length >= 3 && ROLE_SIGNAL.test(s);
}
function validCompany(s) {
  return Boolean(s) && s.length >= 2 && !COMPANY_STOP.has(s.split(/\s+/)[0]);
}

/** Locate a keyword and return the substring that immediately follows it */
function after(haystack, keywordRe) {
  const m = haystack.match(keywordRe);
  return m ? haystack.slice(m.index + m[0].length) : null;
}

// ─── Main function ───────────────────────────────────────────────────────────

function extractJobInfo(jobDesc) {
  const text = jobDesc.replace(/\r\n/g, "\n").trim();
  const flat = text.replace(/\n+/g, " ").replace(/\s{2,}/g, " ");
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let title = null;
  let company = null;

  // ── TITLE ─────────────────────────────────────────────────────────────────

  // T1 — Explicit label (newline = natural boundary)
  if (!title) {
    const m = text.match(
      /(?:job[\s\-]*title|position|role)\s*[:\-\u2013]\s*(.{3,80})(?:\n|$)/i,
    );
    if (m) {
      const c = clean(m[1]);
      if (validTitle(c)) title = c;
    }
  }

  // T2 — "hiring/seeking/recruiting [a/an] [adj] <Title>"
  if (!title) {
    const rest = after(flat, /[Hh]iring|[Ss]eeking|[Rr]ecruiting/);
    if (rest) {
      const n = rest.match(
        new RegExp(
          `^\\s+(?:an?\\s+)?(?:[a-z]+\\s+)?([A-Z][a-zA-Z\\-\\/&]+(?:\\s+[A-Z][a-zA-Z\\-\\/&]+){0,3})`,
        ),
      );
      if (n) {
        const c = clean(n[1]);
        if (validTitle(c)) title = c;
      }
    }
  }

  // T3 — "looking for [a/an] [adj] <Title>"
  if (!title) {
    const rest = after(flat, /[Ll]ooking\s+for/);
    if (rest) {
      const n = rest.match(
        new RegExp(
          `^\\s+(?:an?\\s+)?(?:[a-z]+\\s+)?([A-Z][a-zA-Z\\-\\/&]+(?:\\s+[A-Z][a-zA-Z\\-\\/&]+){0,3})`,
        ),
      );
      if (n) {
        const c = clean(n[1]);
        if (validTitle(c)) title = c;
      }
    }
  }

  // T4 — "join [Company/us/our team] as [a/an] <Title>"
  if (!title) {
    const rest = after(
      flat,
      /[Jj]oin\s+(?:\S+(?:\s+\S+){0,3}\s+)?[Aa]s\s+(?:an?\s+)?/,
    );
    if (rest) {
      const n = rest.match(
        new RegExp(
          `^([A-Z][a-zA-Z\\-\\/&]+(?:\\s+[A-Z][a-zA-Z\\-\\/&]+){0,3})`,
        ),
      );
      if (n) {
        const c = clean(n[1]);
        if (validTitle(c)) title = c;
      }
    }
  }

  // T5 — Dual anchor "<Title> at <Company>" (first non-noisy line only)
  if (!title) {
    const firstMeaningfulLine =
      lines.find((l) => !NAV_LINE_RE.test(l)) || lines[0];
    const m = firstMeaningfulLine.match(
      new RegExp(`((?:${NT}\\s+){0,3}${NT})\\s+at\\s+${NT}`),
    );
    if (m) {
      const c = clean(m[1]);
      if (validTitle(c)) title = c;
    }
  }

  // T6 — "we need/want [a/an] [adj] <Title>"
  if (!title) {
    const rest = after(flat, /[Ww]e\s+(?:need|want|are\s+looking\s+for)/);
    if (rest) {
      const n = rest.match(
        new RegExp(
          `^\\s+(?:an?\\s+)?(?:[a-z]+\\s+)?([A-Z][a-zA-Z\\-\\/&]+(?:\\s+[A-Z][a-zA-Z\\-\\/&]+){0,3})`,
        ),
      );
      if (n) {
        const c = clean(n[1]);
        if (validTitle(c)) title = c;
      }
    }
  }

  // T7 — Early-line scan: first 20 lines, skipping nav/UI noise
  //      Handles postings that lead with navigation before the title.
  if (!title) {
    for (const line of lines.slice(0, 20)) {
      if (NAV_LINE_RE.test(line)) continue; // skip nav cruft
      if (line.length > 80) continue; // skip long prose lines
      const c = clean(line);
      if (validTitle(c)) {
        title = c;
        break;
      }
    }
  }

  // ── COMPANY ───────────────────────────────────────────────────────────────

  /** Shared post-processing for every company candidate */
  function acceptCompany(raw) {
    const pruned = pruneName(clean(raw));
    return validCompany(pruned) ? pruned : null;
  }

  // C1 — Explicit label (newline-bounded)
  if (!company) {
    const m = text.match(
      /(?:[Cc]ompany|[Ee]mployer|[Oo]rganization)\s*[:\-\u2013]\s*(.{2,60})(?:\n|$)/,
    );
    if (m) company = acceptCompany(m[1].trim());
  }

  // C2 — Legal / industry suffix anchor
  if (!company) {
    const m = flat.match(
      new RegExp(
        `((?:${NT}\\s+){0,4}${NT})\\s*,?\\s+(?:${SUFFIX_RE})\\.?(?=\\s|,|\\.|\\?|$)`,
      ),
    );
    if (m) company = acceptCompany(m[0].replace(/[,.]?\s*$/, "").trim());
  }

  // C3 — Subject-verb per line (avoids cross-line duplication artefacts)
  if (!company) {
    for (const line of lines) {
      const m = line.match(
        new RegExp(
          `(${NT}(?:\\s+${NT}){0,2})\\s+(?:is|are)\\s+(?:hiring|looking|seeking|recruiting)`,
        ),
      );
      if (m) {
        const c = acceptCompany(m[1]);
        if (c) {
          company = c;
          break;
        }
      }
    }
  }

  // C4 — Contextual "at" — LAST occurrence, pruned to remove nav tokens
  if (!company) {
    const all = [
      ...flat.matchAll(new RegExp(`\\bat\\s+(${MN})(?=\\s|,|\\.|\\?|$)`, "g")),
    ];
    // Walk backwards: take the last match whose pruned result is valid
    for (let i = all.length - 1; i >= 0; i--) {
      const c = acceptCompany(all[i][1]);
      if (c) {
        company = c;
        break;
      }
    }
  }

  // C5 — "join <Company>" — lookahead includes ? and !
  if (!company) {
    const m = flat.match(new RegExp(`[Jj]oin\\s+(${MN})(?=\\s|,|\\.|\\?|!|$)`));
    if (m) company = acceptCompany(m[1]);
  }

  // C6 — "work at/for/with <Company>"
  if (!company) {
    const m = flat.match(
      new RegExp(`[Ww]ork\\s+(?:at|for|with)\\s+(${MN})(?=\\s|,|\\.|\\?|$)`),
    );
    if (m) company = acceptCompany(m[1]);
  }

  return {
    title: title || "Unknown",
    company: company || "Unknown",
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

const tests = [
  // ── Original 8 ─────────────────────────────────────────────────────────
  {
    label: "Explicit labels",
    input:
      "Job Title: Senior Software Engineer\nCompany: Anthropic\nWe build safe AI systems.",
    expect: { title: "Senior Software Engineer", company: "Anthropic" },
  },
  {
    label: "Hiring phrase + at-company",
    input:
      "We are hiring a Full Stack Developer at Stripe. You will work on our payments platform.",
    expect: { title: "Full Stack Developer", company: "Stripe" },
  },
  {
    label: "Join-as + legal suffix",
    input:
      "Join Vercel Inc as a Lead DevOps Engineer and help us scale edge infrastructure.",
    expect: { title: "Lead DevOps Engineer", company: "Vercel Inc" },
  },
  {
    label: "Subject-verb + looking-for",
    input:
      "OpenAI is hiring. We are looking for an experienced ML Researcher to join our alignment team.",
    expect: { title: "ML Researcher", company: "OpenAI" },
  },
  {
    label: "Dual anchor first-line",
    input:
      "Marketing Director at HubSpot\nHubSpot is looking for a marketing leader to drive our EMEA strategy.",
    expect: { title: "Marketing Director", company: "HubSpot" },
  },
  {
    label: "Multi-word legal suffix",
    input:
      "Exciting opportunity at Boston Consulting Group. We need a talented Management Consultant.",
    expect: {
      title: "Management Consultant",
      company: "Boston Consulting Group",
    },
  },
  {
    label: "We-need phrase + work-for",
    input:
      "We need a skilled Data Scientist to work for Databricks and help shape our ML platform.",
    expect: { title: "Data Scientist", company: "Databricks" },
  },
  {
    label: "Join phrase + seeking",
    input:
      "Join Notion and help us redefine productivity. We are seeking a talented Product Designer.",
    expect: { title: "Product Designer", company: "Notion" },
  },
  // ── New: real-world Stryker posting ────────────────────────────────────
  {
    label: "Stryker — nav noise before title, possessive company name",
    input: `Skip to content
Stryker's Logo
Careers Home
Hiring at Stryker
Our Offices
Explore Open Positions
Senior Director, Regulatory Affairs
Return to Search
Apply Now
5900 Optical Ct, San Jose, CA
Job details
Work flexibility: Remote or Hybrid or Onsite

Job description
The Senior Director, Regulatory Affairs is a key strategist, responsible for developing regulatory strategy for the Endoscopy business unit.
Why join Stryker?
Looking for a place that values your unique talents? Discover Stryker's award-winning culture.`,
    expect: {
      title: "Senior Director, Regulatory Affairs",
      company: "Stryker",
    },
  },
];

let passed = 0;
// for (const { label, input, expect } of tests) {
//   const result = extractJobInfo(input);
//   const titleOk = result.title === expect.title;
//   const companyOk = result.company === expect.company;
//   const ok = titleOk && companyOk;
//   if (ok) passed++;
//   console.log(`${ok ? "✅" : "❌"} ${label}`);
//   if (!titleOk)
//     console.log(
//       `   title  : got "${result.title}"\n            want "${expect.title}"`,
//     );
//   if (!companyOk)
//     console.log(
//       `   company: got "${result.company}"\n            want "${expect.company}"`,
//     );
// }
// console.log(`\n${passed}/${tests.length} tests passed`);

export { extractJobInfo };

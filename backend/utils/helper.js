import OpenAI from "openai";

const stopwords = [
  "Is",
  "Are",
  "The",
  "At",
  "A",
  "An",
  "And",
  "Or",
  "Of",
  "For",
  "On",
  "In",
  "We",
  "Our",
  "Hiring",
];

const titleStopwords = [
  "Is",
  "Are",
  "The",
  "At",
  "A",
  "An",
  "And",
  "Or",
  "Of",
  "For",
  "On",
  "In",
  "We",
  "Our",
  "Hiring",
  "Join",
  "Position",
];
function extractCompany(job_desc) {
  // 1️⃣ Look for "at <Company>" pattern
  const atPattern = /\bat\s+([A-Z][a-zA-Z&]+(?:\s[A-Z][a-zA-Z&]+)*)/g;
  const atMatch = [...job_desc.matchAll(atPattern)];
  if (atMatch.length > 0) {
    // Take the last "at <Company>" occurrence
    return atMatch[atMatch.length - 1][1];
  }

  // 2️⃣ Frequency analysis: find capitalized words sequences
  const words = job_desc.match(/\b[A-Z][a-zA-Z&]+\b/g) || [];
  const freqMap = {};
  for (let word of words) {
    if (!stopwords.includes(word)) {
      freqMap[word] = (freqMap[word] || 0) + 1;
    }
  }

  // Take the word with highest frequency
  const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) return sorted[0][0];

  // 3️⃣ Fallback
  return "Unknown";
}

function extractTitle(job_desc) {
  // 1️⃣ Look for common title patterns
  const patterns = [
    /\b(hiring a|looking for a|position as|join us as a)\s+([A-Z][a-zA-Z]*(?:\s[A-Z][a-zA-Z]*){0,2})/gi,
  ];

  for (let pattern of patterns) {
    const match = pattern.exec(job_desc);
    if (match) return match[2].trim();
  }

  // 2️⃣ Capitalized word sequences
  const words = job_desc.match(/\b[A-Z][a-zA-Z]+\b/g) || [];
  const filtered = words.filter((w) => !titleStopwords.includes(w));

  // Try to group two or three capitalized words in a row
  let candidate = [];
  for (let i = 0; i < filtered.length; i++) {
    if (i + 2 < filtered.length) {
      candidate.push(`${filtered[i]} ${filtered[i + 1]} ${filtered[i + 2]}`);
    }
  }

  if (candidate.length > 0) return candidate[0];

  // 3️⃣ Fallback: first capitalized word not in stopwords
  if (filtered.length > 0) return filtered[0];

  return "Unknown";
}

// utils/extractJobInfo.js

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set your API key in env
});

/**
 * Extract company name and job title from a job description using GPT
 * @param {string} job_desc - The full job description text
 * @returns {Promise<{company: string, title: string}>}
 */
async function extractJobInfo(job_desc) {
  if (!job_desc || typeof job_desc !== "string") {
    return { company: "Unknown", title: "Unknown" };
  }

  try {
    const prompt = `
You are a smart assistant that extracts job information from a job posting.
Given the following job description, extract:

1. The Company name  
2. The Job title

Rules:
- Company name is usually after words like "at" or "Hiring at" or repeated often in the description.
- Job title is usually mentioned in headings, key responsibilities, or phrases like "We are hiring a", "Join us as a", etc.
- Only return the company name and job title, nothing else.
- Return your answer strictly in JSON format like this:
{
  "company": "Company Name",
  "title": "Job Title"
}

Job description:
"""
${job_desc}
"""
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0, // deterministic
      max_tokens: 200,
    });

    // The assistant’s text
    const text = response.choices[0].message.content;

    // Try to parse JSON
    let result = { company: "Unknown", title: "Unknown" };
    try {
      result = JSON.parse(text);
    } catch (err) {
      console.warn("Could not parse GPT output as JSON, returning fallback");
    }

    return result;
  } catch (err) {
    console.error("GPT extraction error:", err);
    return { company: "Unknown", title: "Unknown" };
  }
}
export { extractCompany, extractTitle, extractJobInfo };

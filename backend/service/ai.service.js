import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set your API key in env
});

/**
 * Generates interview answer aligned with job description
 * @param {Object} params
 * @param {String} params.jobDesc
 * @param {String} params.company
 * @param {String} params.title
 * @param {String} params.question
 * @returns {Promise<String>}
 */
const generateInterviewAnswer = async ({
  jobDesc,
  company,
  title,
  question,
  userResume,
}) => {
  const candidateProfile = `
Title:
${userResume?.title || ""}

Professional Summary:
${userResume?.summary || ""}

Skills:
${userResume?.skills || ""}

Experience:
${userResume?.experience || ""}

Projects:
${userResume?.projects || ""}

Certifications:
${userResume?.certifications || ""}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `
You are an expert interview coach.

Your task is to answer interview questions as if you are the candidate.

Rules:
- Use the candidate's resume as the primary source of truth.
- Reference the candidate's actual experience, skills, projects, certifications, and achievements whenever relevant.
- Align the answer with the job description and company needs.
- Never invent experience, technologies, companies, or accomplishments that do not exist in the resume.
- If the resume lacks relevant information, use transferable skills and professional reasoning.
- Keep the answer concise, natural, confident, and impactful.
- Return ONLY the answer.
- The answer must be exactly one sentence.
        `,
      },
      {
        role: "system",
        content: `Candidate Resume:\n${candidateProfile}`,
      },
      {
        role: "user",
        content: `
Job Description:
${jobDesc}

Company:
${company}

Role:
${title}

Interview Question:
${question}
        `,
      },
    ],
  });

  return completion.choices[0].message.content.trim();
};

async function extractJobInfoAi(job_desc) {
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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    try {
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[0]);
        } catch {
          console.warn("Could not parse JSON after regex");
        }
      } else {
        console.warn("No JSON found in GPT output");
      }
    } catch (err) {
      console.warn("Could not parse GPT output as JSON, returning fallback");
    }

    return result;
  } catch (err) {
    console.error("GPT extraction error:", err);
    return { company: "Unknown", title: "Unknown" };
  }
}

export { extractJobInfoAi, generateInterviewAnswer };

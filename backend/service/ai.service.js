import OpenAI from "openai";

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
}) => {
  const prompt = `
You are an expert interview coach helping a candidate prepare.

Job Description:
${jobDesc}

Company: ${company}
Role: ${title}

Interview Question:
${question}

Instructions:
  
- Provide a confident and professional answer.
- Align response with company needs.
- Highlight relevant skills implied in the job description.
- Keep it concise, simple, short, relatable but impactful...always make sure answer is one sentence.

`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a professional interview coach." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content;
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

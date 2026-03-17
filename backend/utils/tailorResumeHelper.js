// helpers/tailorResume.ts

import OpenAI from "openai";
import { prisma } from "./db.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const tailorResume = async (userId, jobDesc) => {
  // 1️⃣ Fetch resume with user name
  const resume = await prisma.resume.findFirst({
    where: { userId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
      professionalExperiences: true,
    },
  });

  if (!resume) {
    throw new Error("Resume not found for this user");
  }

  // 2️⃣ Prepare resume data for AI
  const resumeData = {
    name: resume.user.name,
    title: resume.title,
    summary: resume.summary,
    personalDetail: resume.personalDetail,
    education: resume.education,
    skills: resume.skills,
    certifications: resume.certifications,
    projects: resume.projects,
    professionalExperiences: resume.professionalExperiences,
  };

  // 3️⃣ AI Prompt
  const prompt = `
You are an expert resume writer.

A job description and a candidate's resume are provided.

Your task:
- Analyze the job description
- Tailor the candidate's resume to better match the job
- Adjust wording of experience, summary, and skills to align with the job
- Do NOT fabricate fake companies or experiences
- Keep all information truthful but optimize it for the job

Guidelines:
- Rewrite the summary to match the job
- Highlight the most relevant skills
- Adjust past responsibilities to resemble the job requirements
- Maintain the same JSON structure

Return ONLY valid JSON.

JOB DESCRIPTION:
${jobDesc}

CANDIDATE RESUME:
${JSON.stringify(resumeData)}
`;

  // 4️⃣ Call AI
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a professional resume optimization AI.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.4,
  });

  const aiResponse = completion.choices[0].message.content;

  // 5️⃣ Parse JSON safely
  let tailoredResume;

  try {
    const cleaned = aiResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonStart = cleaned.indexOf("{");
    const jsonEnd = cleaned.lastIndexOf("}");

    const jsonString = cleaned.slice(jsonStart, jsonEnd + 1);

    tailoredResume = JSON.parse(jsonString);
  } catch (error) {
    console.error("AI RAW RESPONSE:", aiResponse);
    throw new Error("AI returned invalid JSON");
  }

  return tailoredResume;
};

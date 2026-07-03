// helpers/tailorResume.ts

import OpenAI from "openai";
import { prisma } from "./db.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const tailorResume = async (userId, jobDesc) => {
  // 1️⃣ Fetch resume with user name
  console.log("GPT HIT");
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
    experience: resume.experience,
    personalDetail: resume.personalDetail,
    education: resume.education,
    skills: resume.skills,
    certifications: resume.certifications,
    projects: resume.projects,
    professionalExperiences: resume.professionalExperiences,
  };

  const resumeDataToOptimize = {
    summary: resume.summary,
    skills: resume.skills,
    title: resume.title,
    professionalExperiences: resume.professionalExperiences.map((exp) => ({
      companyName: exp.companyName,
      title: exp.title,
      responsibilities: exp.responsibilities,
    })),
  };

  // 3️⃣ AI Prompt
  const prompt = `
You are an expert technical resume writer.

You will receive:

1. A job description.
2. A candidate's resume.

Your task is ONLY to optimize the resume.

Rules:

- Rewrite ONLY:
  • summary
  • skills
  • professionalExperiences[].responsibilities

- Do NOT change:
  • company names
  • job titles
  • dates
  • number of jobs
  
Responsibilities:

Rewrite each bullet to match the job description.

- 18–30 words
- ATS-friendly
- Strong action verbs
- Minimum 8 bullets per job

Skills:

- Reorder skills by relevance.
- Remove irrelevant skills.
- Prioritize skills mentioned in the job description.
- invent a skill the candidate doesn't already possess.

Title

- make the latest title in the resume matches the job's title

Summary:

- Rewrite the summary to target the role.
- Mention the most relevant technologies from the job description.
- Keep it between 70 and 120 words.

Return ONLY valid JSON having exactly this structure:

{
  "summary": "...",
  "skills": [...],
  "title":"...",
  "professionalExperiences": [
    {
      "responsibilities": [...]
    }
  ]
}
JOB DESCRIPTION:
${jobDesc}

CANDIDATE RESUME:
${JSON.stringify(resumeDataToOptimize)}
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
    tailoredResume = JSON.parse(cleaned);
  } catch (err) {
    console.error(aiResponse);
    throw new Error("AI returned invalid JSON");
  }

  const mergedResume = {
    ...resumeData,

    summary: tailoredResume.summary,

    skills: tailoredResume.skills,

    title: tailoredResume.title,

    professionalExperiences: resumeData.professionalExperiences.map(
      (experience, index) => ({
        ...experience,
        responsibilities:
          tailoredResume.professionalExperiences[index]?.responsibilities ??
          experience.responsibilities,
      }),
    ),
  };

  return mergedResume;
};

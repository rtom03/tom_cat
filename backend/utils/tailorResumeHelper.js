// // helpers/tailorResume.ts

// import OpenAI from "openai";
// import { prisma } from "./db.js";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const tailorResume = async (userId, jobDesc) => {
//   // 1️⃣ Fetch resume with user name
//   console.log("GPT HIT");
//   const resume = await prisma.resume.findFirst({
//     where: { userId },
//     include: {
//       user: {
//         select: {
//           name: true,
//         },
//       },
//       professionalExperiences: true,
//     },
//   });

//   if (!resume) {
//     throw new Error("Resume not found for this user");
//   }

//   // 2️⃣ Prepare resume data for AI
//   const resumeData = {
//     name: resume.user.name,
//     title: resume.title,
//     summary: resume.summary,
//     experience: resume.experience,
//     personalDetail: resume.personalDetail,
//     education: resume.education,
//     skills: resume.skills,
//     certifications: resume.certifications,
//     projects: resume.projects,
//     professionalExperiences: resume.professionalExperiences,
//   };

//   const resumeDataToOptimize = {
//     summary: resume.summary,
//     skills: resume.skills,
//     title: resume.title,
//     professionalExperiences: resume.professionalExperiences.map((exp) => ({
//       companyName: exp.companyName,
//       title: exp.title,
//       responsibilities: exp.responsibilities,
//     })),
//   };

//   // 3️⃣ AI Prompt
//   const prompt = `
// You are an expert technical resume writer.

// You will receive:

// 1. A job description.
// 2. A candidate's resume.

// Your task is ONLY to optimize the resume.

// Rules:

// - Rewrite ONLY:
//   • summary
//   • skills
//   • professionalExperiences[].responsibilities

// - Do NOT change:
//   • company names
//   • job titles
//   • dates
//   • number of jobs

// Rewrite each bullet to match the job description.

// - 18–30 words
// - ATS-friendly
// - Strong action verbs
// - Minimum 8 bullets per job

// Skills:

// - Reorder skills by relevance.
// - Remove irrelevant skills.
// - Prioritize skills mentioned in the job description.
// - invent a skill the candidate doesn't already possess.

// Title

// - make the latest title in the resume matches the job's title

// Professional Experience Title:
// -- make the latest title in the professionalExperience to matches the job's title
// -- the job experience that follows the latest should also be modify to align with the job's title but not identical

// Summary:

// - Rewrite the summary to target the role.
// - Mention the most relevant technologies from the job description.
// - Keep it between 70 and 120 words.

// Return ONLY valid JSON having exactly this structure:

// {
//   "summary": "...",
//   "skills": [...],
//   "title":"...",
//   "professionalExperiences": [
//     {
//       "responsibilities": [...]
//     }
//   ]
// }
// JOB DESCRIPTION:
// ${jobDesc}

// CANDIDATE RESUME:
// ${JSON.stringify(resumeDataToOptimize)}
// `;

//   // 4️⃣ Call AI
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content: "You are a professional resume optimization AI.",
//       },
//       {
//         role: "user",
//         content: prompt,
//       },
//     ],
//     temperature: 0.4,
//   });

//   const aiResponse = completion.choices[0].message.content;

//   // 5️⃣ Parse JSON safely
//   let tailoredResume;

//   try {
//     const cleaned = aiResponse
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();
//     tailoredResume = JSON.parse(cleaned);
//   } catch (err) {
//     console.error(aiResponse);
//     throw new Error("AI returned invalid JSON");
//   }

//   const mergedResume = {
//     ...resumeData,

//     summary: tailoredResume.summary,

//     skills: tailoredResume.skills,

//     title: tailoredResume.title,

//     professionalExperiences: resumeData.professionalExperiences.map(
//       (experience, index) => ({
//         ...experience,
//         responsibilities:
//           tailoredResume.professionalExperiences[index]?.responsibilities ??
//           experience.responsibilities,
//       }),
//     ),
//   };

//   return mergedResume;
// };
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
  • professionalExperiences[].title (latest role only, see below)
  • professionalExperiences[].responsibilities

- Do NOT change:
  • the candidate's overall professional title/header (this is not part of the optimization — never include or infer it)
  • company names
  • dates
  • number of jobs

Rewrite each bullet to match the job description.

- 18–30 words
- ATS-friendly
- Strong action verbs
- Minimum 8 bullets per job

Skills:

- Reorder skills by relevance.
- Remove irrelevant skills that don't overlap with the candidate's actual background.
- Prioritize skills mentioned in the job description that the candidate already has evidence of (from their experience/skills).
- Do NOT add any skill the candidate does not already have evidence of possessing. Never fabricate qualifications.

Professional Experience Title:
- The FIRST item in professionalExperiences (index 0, the most recent role) should have its title updated to closely match the job's title, as long as it stays truthful to the seniority/scope of that role — do not inflate seniority.
- The role immediately after that (index 1, if it exists) should have its title lightly aligned in language toward the job's title/domain, but must remain clearly distinct, not identical.
- All other experience titles are left unchanged.

Summary:

- Rewrite the summary to target the role.
- Mention the most relevant technologies from the job description that the candidate genuinely has experience with.
- Keep it between 70 and 120 words.

Return ONLY valid JSON having exactly this structure:

{
  "summary": "...",
  "skills": [...],
  "professionalExperiences": [
    {
      "title": "...",
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

    // NOTE: resumeData.title (the candidate's header/professional title) is
    // intentionally untouched here. It is never overwritten with AI output.

    summary: tailoredResume.summary,

    skills: tailoredResume.skills,

    professionalExperiences: resumeData.professionalExperiences.map(
      (experience, index) => {
        const tailored = tailoredResume.professionalExperiences?.[index];
        return {
          ...experience,
          title: tailored?.title ?? experience.title,
          responsibilities:
            tailored?.responsibilities ?? experience.responsibilities,
        };
      },
    ),
  };

  return mergedResume;
};

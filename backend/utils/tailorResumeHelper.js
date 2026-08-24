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
//   • professionalExperiences[].title (latest role only, see below)
//   • professionalExperiences[].responsibilities

// - Do NOT change:
//   • the candidate's overall professional title/header (this is not part of the optimization — never include or infer it)
//   • company names
//   • dates
//   • number of jobs

// Rewrite each bullet to match the job description.

// - 18–30 words
// - ATS-friendly
// - Strong action verbs
// - Minimum 8 bullets per job

// Skills:

// - Reorder skills by relevance.
// - Remove irrelevant skills that don't overlap with the candidate's actual background.
// - Prioritize skills mentioned in the job description that the candidate already has evidence of (from their experience/skills).
// - Do NOT add any skill the candidate does not already have evidence of possessing. Never fabricate qualifications.

// Professional Experience Title:
// - The FIRST item in professionalExperiences (index 0, the most recent role) should have its title updated to closely and confidently mirror the job's title — this is the strongest title match in the whole resume. Stay truthful to the seniority/scope of that role — do not inflate seniority (e.g. don't turn a mid-level role into "Senior X" or "X Lead" if nothing else in that role supports it).
// - The role immediately after that (index 1, if it exists) should have its title updated to be clearly in the same domain/discipline as the job title, using related language (shared keywords, adjacent focus area) — but it must be a genuinely different title from both the original job title AND from the new index 0 title. Never reuse the exact same title string twice in a row. Think "adjacent role on the way up to this," not "same job, different year."
// - All other experience titles are left unchanged.

// Summary:

// - Rewrite the summary to target the role.
// - Mention the most relevant technologies from the job description that the candidate genuinely has experience with.
// - Keep it between 70 and 120 words.

// Return ONLY valid JSON having exactly this structure:

// {
//   "summary": "...",
//   "skills": [...],
//   "professionalExperiences": [
//     {
//       "title": "...",
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

//     // NOTE: resumeData.title (the candidate's header/professional title) is
//     // intentionally untouched here. It is never overwritten with AI output.

//     summary: tailoredResume.summary,

//     skills: tailoredResume.skills,

//     professionalExperiences: resumeData.professionalExperiences.map(
//       (experience, index) => {
//         const tailored = tailoredResume.professionalExperiences?.[index];
//         return {
//           ...experience,
//           title: tailored?.title ?? experience.title,
//           responsibilities:
//             tailored?.responsibilities ?? experience.responsibilities,
//         };
//       },
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
    title: resume.title,
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
  • title (the candidate's overall professional title/header)
  • summary
  • skills
  • professionalExperiences[].title (index 0 and 1 only, see below)
  • professionalExperiences[].responsibilities

- Do NOT change:
  • company names
  • dates
  • number of jobs

Title matching — generic role extraction (applies to BOTH the header "title" AND professionalExperiences[1].title):
- Extract the CORE role ONLY. The output must be a short, plain, standalone job title — nothing else.
- Strip vendor names, product names, specific tech stack, and internal-sounding qualifiers. Example: a posting titled "MuleSoft Backend Engineer" → use "Backend Engineer", not "MuleSoft Backend Engineer".
- Example: "Senior React Frontend Developer II" → "Senior Frontend Developer" (drop the specific framework and internal leveling suffix; keep seniority only if genuinely supported elsewhere in the resume).
- NEVER append anything after the core title — no dash-qualifiers, no colon-qualifiers, no domain/specialty suffixes, no parentheticals. Do NOT produce things like "Software Engineer - Integrations & eCommerce", "Backend Engineer: Payments", "Software Engineer (eCommerce)". These are NOT allowed under any circumstance, even if the job posting itself uses this format.
- The output must be ONLY a concrete, plain title such as: "Software Engineer", "Senior Software Engineer", "Backend Developer", "Backend Engineer", "Frontend Developer", "Full Stack Engineer", "Software Developer". A maximum of one seniority word (e.g. "Senior", "Lead", "Staff") plus a plain role name — nothing more, ever.
- If the job posting's title includes a domain/product suffix (e.g. "Integrations & eCommerce", "Platform", "Growth"), DISCARD that suffix entirely. It must never appear in the output title.

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
- The SECOND item in professionalExperiences (index 1, if it exists) gets the generic extracted role title (see rule above) — this is the strongest, most direct title match in the resume.
- The FIRST item in professionalExperiences (index 0, the most recent role) should use "Senior " + the same core title as index 1 (e.g. if index 1 becomes "Backend Engineer", index 0 becomes "Senior Backend Engineer") — reflecting a natural promotion from that earlier role into the current one. This must also be a plain title with no suffix, exactly like the rule above — never "Senior Backend Engineer - Integrations" or similar.
  • Only apply the "Senior" bump if the role's actual responsibilities plausibly support it (e.g. mentions leading, owning a system, mentoring, scope beyond an individual task). If the role's original content gives zero support for seniority, keep the base title without "Senior" rather than inventing scope that isn't there.
- If index 1 does not exist (candidate has only one role), apply the same logic to index 0 alone: generic extracted title, with "Senior" only if genuinely supported.
- All other experience titles are left unchanged.

Summary:

- Rewrite the summary to target the role.
- Mention the most relevant technologies from the job description that the candidate genuinely has experience with.
- Keep it between 70 and 120 words.

Return ONLY valid JSON having exactly this structure:

{
  "title": "...",
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

  // Safety net: strip any dash/colon/pipe/parenthetical suffix the model
  // might still tack onto a title despite the prompt instruction, e.g.
  // "Senior Software Engineer - Integrations & eCommerce" -> "Senior Software Engineer"
  const stripTitleSuffix = (title) => {
    if (typeof title !== "string") return title;
    return title.split(/\s*[-–—:|(]\s*/)[0].trim();
  };

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

    // Header/professional title is now tailored per job, using a generic
    // role extraction (see prompt) — never a verbatim copy of the posting's
    // title. Falls back to the original if the AI omits it.
    title: stripTitleSuffix(tailoredResume.title) ?? resumeData.title,

    summary: tailoredResume.summary,

    skills: tailoredResume.skills,

    professionalExperiences: resumeData.professionalExperiences.map(
      (experience, index) => {
        const tailored = tailoredResume.professionalExperiences?.[index];
        return {
          ...experience,
          title: tailored?.title
            ? stripTitleSuffix(tailored.title)
            : experience.title,
          responsibilities:
            tailored?.responsibilities ?? experience.responsibilities,
        };
      },
    ),
  };

  return mergedResume;
};

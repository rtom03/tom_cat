import { cleaned_job_apps } from "../jb_apps.js";
import {
  extractJobInfoAi,
  generateInterviewAnswer,
} from "../service/ai.service.js";
import { prisma } from "../utils/db.js";
import { extractJobInfo } from "../utils/extractHelper.js";
import { tailorResume } from "../utils/tailorResumeHelper.js";

const createApp = async (req, res) => {
  try {
    const { job_desc } = req.body;
    const userId = req.user.userId;
    // console.log(userId);
    // const userId = req.user.id; // assuming user is authenticated

    // 1️⃣ Check for remote
    const remote = /remote/i.test(job_desc);
    // const company = extractCompany(job_desc);
    // let title = extractTitle(job_desc);
    let job_info = await extractJobInfo(job_desc);
    // const tailoredResume = await tailorResume(userId, job_desc);

    // 4️⃣ Create job record
    const job = await prisma.job_Apps.create({
      data: {
        job_desc,
        company: job_info.company,
        title: job_info.title,
        remote,
        createdBy: {
          connect: { id: userId }, // ✅ correct way to link a relation
        },
      },
    });

    res.status(201).json({
      job,
      // resume: tailoredResume
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /jobs/:id

export const updateJobApp = async (req, res) => {
  try {
    // const { id } = req.params;
    const id = parseInt(req.params.id); // was just req.params.id (a string)

    const { company } = req.body;
    const userId = req.user.id; // assuming auth middleware adds user

    // make sure the job belongs to the logged-in user
    const existingJob = await prisma.job_Apps.findFirst({
      where: {
        id,
        createdById: userId,
      },
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job application not found",
      });
    }

    const updatedJob = await prisma.job_Apps.update({
      where: {
        id,
      },
      data: {
        ...(company && { company }),
      },
    });

    return res.status(200).json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    console.error("Update job app error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const generateInterviewResponse = async (req, res) => {
  try {
    const { jobId, question } = req.body;

    if (!jobId || !question) {
      return res.status(400).json({
        message: "jobId and question are required",
      });
    }

    // 1️⃣ Fetch job
    const job = await prisma.job_Apps.findFirst({
      where: { id: Number(jobId) },
    });

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // 2️⃣ Call AI helper
    const answer = await generateInterviewAnswer({
      jobDesc: job.job_desc,
      company: job.company,
      title: job.title,
      question,
    });

    // 3️⃣ Return response
    return res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Interview generation error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getJobs = async (req, res) => {
  const userId = req.user.userId;
  try {
    const jobs = await prisma.job_Apps.findMany({
      where: {
        createdById: userId, // ✅ filter by logged-in user
      },
      include: {
        createdBy: {
          select: {
            username: true, // ✅ only returns username, not password etc.
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // latest first
      },
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const deleteJob = async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: "Job ID is required" });

  try {
    const deletedJob = await prisma.job_Apps.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({ message: "Job deleted", job: deletedJob });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete job" });
  }
};

const createResume = async (req, res) => {
  const serializeExperience = (exp) => ({
    ...exp,
    responsibilities: JSON.stringify(exp.responsibilities || []),
    technologies: JSON.stringify(exp.technologies || []),
  });

  try {
    const userId = req.user.userId;
    console.log(userId);
    console.log(userId); // assuming authMiddleware adds user to req
    const {
      title,
      summary,
      experience,
      education,
      personalDetail,
      skills,
      certifications,
      projects,
      professionalExperiences,
    } = req.body;

    const resume = await prisma.resume.upsert({
      where: { userId },
      update: {
        title,
        summary,
        experience,
        education: JSON.stringify(education),
        personalDetail: JSON.stringify(personalDetail),
        skills: JSON.stringify(skills),
        certifications: JSON.stringify(certifications),
        projects: JSON.stringify(projects),
        professionalExperiences: {
          deleteMany: {}, // remove old ones
          create: professionalExperiences.map(serializeExperience),
        },
      },
      create: {
        userId,
        title,
        summary,
        experience,
        education: JSON.stringify(education),
        skills: JSON.stringify(skills),
        certifications: JSON.stringify(certifications),
        projects: JSON.stringify(projects),
        professionalExperiences: {
          create: professionalExperiences.map(serializeExperience),
        },
      },
      include: { professionalExperiences: true },
    });

    return res.status(201).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

//
export { createApp, getJobs, deleteJob, createResume };

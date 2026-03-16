import {
  extractJobInfoAi,
  generateInterviewAnswer,
} from "../service/ai.service.js";
import { prisma } from "../utils/db.js";
import { tailorResume } from "../utils/tailorResumeHelper.js";

const createJob = async (req, res) => {
  try {
    const { job_desc } = req.body;
    const userId = req.user.userId;
    // console.log(userId);
    // const userId = req.user.id; // assuming user is authenticated

    // 1️⃣ Check for remote
    const remote = /remote/i.test(job_desc);
    // const company = extractCompany(job_desc);
    // let title = extractTitle(job_desc);
    let job_info = await extractJobInfoAi(job_desc);
    const tailoredResume = await tailorResume(userId, job_desc);

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

    res.status(201).json({ job, resume: tailoredResume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
  try {
    const userId = req.user.userId; // assuming authMiddleware adds user to req
    const {
      title,
      summary,
      education,
      skills,
      certifications,
      projects,
      professionalExperiences,
    } = req.body;

    const resume = await prisma.resume.create({
      data: {
        userId,
        title,
        summary,
        education,
        skills,
        certifications,
        projects,
        professionalExperiences: {
          create: professionalExperiences, // array of experiences
        },
      },
      include: {
        professionalExperiences: true,
      },
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
export { createJob, getJobs, deleteJob, createResume };

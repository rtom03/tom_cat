import { prisma } from "../utils/db.js";
import { extractJobInfo } from "../utils/extractHelper.js";
import { extractJobInfoAi } from "../utils/helper.js";

const createJob = async (req, res) => {
  try {
    const { job_desc } = req.body;
    const userId = req.user.userId;
    console.log(userId);
    // const userId = req.user.id; // assuming user is authenticated

    // 1️⃣ Check for remote
    const remote = /remote/i.test(job_desc);
    // const company = extractCompany(job_desc);
    // let title = extractTitle(job_desc);
    let job_info = await extractJobInfoAi(job_desc);

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

    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job_Apps.findMany({
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

export { createJob, getJobs };

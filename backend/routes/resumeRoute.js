import express from "express";
import {
  createJob,
  createResume,
  deleteJob,
  generateInterviewResponse,
  getJobs,
  seedToDB,
} from "../controller/resumeController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const isResumeRoute = express.Router();

isResumeRoute.post("/resume", protectRoute, createJob);
isResumeRoute.get("/get-apps", protectRoute, getJobs);
isResumeRoute.post("/job-ques", generateInterviewResponse);
isResumeRoute.post("/create-resume", protectRoute, createResume);
isResumeRoute.post("/seed", protectRoute, seedToDB);

isResumeRoute.delete("/jobs/:id", protectRoute, deleteJob);
export { isResumeRoute };

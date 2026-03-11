import express from "express";
import {
  createJob,
  deleteJob,
  generateInterviewResponse,
  getJobs,
} from "../controller/resumeController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const isResumeRoute = express.Router();

isResumeRoute.post("/resume", protectRoute, createJob);
isResumeRoute.get("/get-apps", protectRoute, getJobs);
isResumeRoute.post("/job-ques", generateInterviewResponse);
isResumeRoute.delete("/jobs/:id", protectRoute, deleteJob);
export { isResumeRoute };

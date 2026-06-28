import express from "express";
import {
  createApp,
  createResume,
  deleteJob,
  generateCv,
  generateInterviewResponse,
  getJobs,
  updateJobApp,
} from "../controller/resumeController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const isResumeRoute = express.Router();

isResumeRoute.post("/create-app", protectRoute, createApp);
isResumeRoute.post("/generate-cv", protectRoute, generateCv);
isResumeRoute.get("/get-apps", protectRoute, getJobs);
isResumeRoute.post("/job-ques", protectRoute, generateInterviewResponse);
isResumeRoute.post("/create-resume", protectRoute, createResume);
isResumeRoute.put("/update-jobs/:id", protectRoute, updateJobApp);

isResumeRoute.delete("/jobs/:id", protectRoute, deleteJob);
export { isResumeRoute };

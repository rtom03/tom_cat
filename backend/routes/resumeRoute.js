import express from "express";
import { createJob, getJobs } from "../controller/resumeController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const isResumeRoute = express.Router();

isResumeRoute.post("/resume", protectRoute, createJob);
isResumeRoute.get("/get-apps", protectRoute, getJobs);
export { isResumeRoute };

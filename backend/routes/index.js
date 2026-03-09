// routes/index.ts
import { Router } from "express";
import { isUserRoute } from "./userRoute.js";
import { isResumeRoute } from "./resumeRoute.js";

const router = Router();

router.use("/user", isUserRoute); // use .use() not router()
router.use("/apps", isResumeRoute);

export default router;

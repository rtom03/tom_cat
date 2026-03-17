import express from "express";
import multer from "multer";
import { createUser, loginUser } from "../controller/userController.js";
// import { protectRoute } from "../middleware/authMiddleware.js";

const isUserRoute = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

isUserRoute.use("/create", createUser);
isUserRoute.post("/login", loginUser);

export { isUserRoute };

// middleware/authMiddleware.ts
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/db.js";

const protectRoute = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;
  // console.log(token);
  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Not authorized. Try login again." });
  }

  try {
    // Decode the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Prisma: find user by ID
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: false, message: "Not authorized. User not found." });
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      username: user.username,
    };

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ status: false, message: "Not authorized. Try login again." });
  }
});

export { protectRoute };

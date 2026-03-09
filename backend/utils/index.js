import jwt from "jsonwebtoken";

const createJWT = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction, // ✅ false on localhost, true in prod
    sameSite: isProduction ? "none" : "lax", // ✅ "lax" works on localhost
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
  });

  return token;
};

export default createJWT;

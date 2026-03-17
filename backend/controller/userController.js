import { prisma } from "../utils/db.js";
import bcrypt from "bcryptjs";
import createJWT from "../utils/index.js";
const createUser = async (req, res) => {
  try {
    const { username, name, password } = req.body;

    const resumePath = req.file ? req.file.path : null;
    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        name,
        password: hashed,
        resume: resumePath,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    // res.status(500).json({ error: error.message });
    console.log(error);
  }
};
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { username },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = createJWT(res, user.id); // ✅ user.id not res.id
    console.log(token);
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        resume: user.resume,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
export { createUser, loginUser };

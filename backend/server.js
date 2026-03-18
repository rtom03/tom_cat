import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./utils/db.js";
import routes from "./routes/index.js";
import path from "path";
import { exec } from "child_process";

dotenv.config();

connectDB();

const port = process.env.PORT || 5000;

const app = express();
const __dirname = path.resolve();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3001"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(morgan("dev"));
app.use("/api", routes);

const execAsync = util.promisify(exec);

async function main() {
  try {
    console.log("Applying pending Prisma migrations...");

    // Run Prisma migration command programmatically
    const { stdout, stderr } = await execAsync("npx prisma migrate deploy");
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (err) {
    console.error("Migration failed:", err);
  }

  // Start your server after migrations
  // e.g., app.listen(10000, () => console.log("Server running..."));
}

// SPA fallback (IMPORTANT)
app.use(express.static(path.join(__dirname, "backend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "backend", "dist", "index.html"));
});

// app.use(routeNotFound);
// app.use(errorHandler);

main();

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`),
);

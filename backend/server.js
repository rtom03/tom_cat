import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./utils/db.js";
import routes from "./routes/index.js";
import path from "path";

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

// SPA fallback (IMPORTANT)
app.use(express.static(path.join(__dirname, "backend", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "backend", "dist", "index.html"));
});

// app.use(routeNotFound);
// app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`),
);

async function main() {
  // Apply all pending migrations on startup
  try {
    console.log("Applying pending Prisma migrations...");
    await import("@prisma/client/runtime").then(({ migrate }) =>
      migrate.deploy(),
    );
  } catch (err) {
    console.error("Migration failed:", err);
  }

  // Your server code here
  // e.g., app.listen(...)
}

main();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure backend/.env is loaded regardless of execution working directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import { connectDB } from "./config/db.js";
import cardRoutes from "./routes/cardRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxies (Cloudflare tunnel / Vite proxy)
app.set("trust proxy", 1);

// Connect to MongoDB
connectDB();

// CORS setup
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, QR scans)
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all in dev/scans, or filter strictly if needed
    },
    credentials: true,
  })
);


if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(express.json({ limit: "256kb" }));
app.use(express.urlencoded({ extended: true, limit: "256kb" }));

app.disable("x-powered-by");

import fs from "fs";

const distPath = path.resolve(__dirname, "../../dist");
const hasFrontendBuild = fs.existsSync(distPath);

if (hasFrontendBuild) {
  // 1. Aggressive immutable caching for Vite's hashed bundles (instant 0ms repeat page loads)
  app.use(
    "/assets",
    express.static(path.resolve(distPath, "assets"), {
      maxAge: "1y",
      immutable: true,
    })
  );

  // 2. Static root assets (favicon, svg icons, web manifest) with 1 hour caching
  app.use(
    express.static(distPath, {
      maxAge: "1h",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    })
  );
} else {
  app.get("/", (req, res) => {
    res.json({
      name: "Tapform NFC & Dynamic QR Backend API",
      status: "running",
      healthCheck: "/health",
      documentation: {
        list: "GET /api/cards",
        activate: "POST /api/cards/activate",
        update: "PUT /api/cards/:cardId",
        delete: "DELETE /api/cards/:cardId",
        getCard: "GET /api/cards/:cardId",
        scanRedirect: "GET /c/:cardId",
      },
    });
  });
}

// Ensure API responses are always real-time and never stale
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});

// App Routes
app.use(healthRoutes);
app.use(cardRoutes);

// If frontend build exists, fallback to index.html for SPA routes (e.g. /activate, /dashboard)
if (hasFrontendBuild) {
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/c/")) {
      return next();
    }
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Catch-all 404 handler for API and static misses
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 NFC Backend server running on:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Network: http://172.20.10.5:${PORT}`);
  console.log(`📡 Redirect scanner ready at: http://172.20.10.5:${PORT}/c/:cardId`);
});


process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

export default app;

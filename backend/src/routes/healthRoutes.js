import express from "express";
import mongoose from "mongoose";

const router = express.Router();

function getDbStateName(state) {
  switch (state) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
}

function handleHealthCheck(req, res) {
  const dbState = mongoose.connection.readyState;
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: getDbStateName(dbState),
      name: mongoose.connection.name || null,
      host: mongoose.connection.host || null,
    },
    version: "1.0.0",
  });
}

router.get("/health", handleHealthCheck);
router.get("/api/health", handleHealthCheck);

export default router;

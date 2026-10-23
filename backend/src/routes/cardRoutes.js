import express from "express";
import {
  activateCard,
  updateCard,
  getCard,
  redirectScan,
} from "../controllers/cardController.js";
import { requireApiKey } from "../middleware/authMiddleware.js";
import { apiLimiter, scanLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Card activation: POST /api/cards/activate
router.post("/api/cards/activate", apiLimiter, requireApiKey, activateCard);

// Card update: PUT /api/cards/:cardId
router.put("/api/cards/:cardId", apiLimiter, requireApiKey, updateCard);

// Get Card info: GET /api/cards/:cardId
router.get("/api/cards/:cardId", apiLimiter, getCard);

// NFC & QR Scan redirection: GET /c/:cardId
router.get("/c/:cardId", scanLimiter, redirectScan);

export default router;

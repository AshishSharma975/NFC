import express from "express";
import {
  activateCard,
  updateCard,
  getCard,
  getAllCards,
  deleteCard,
  redirectScan,
} from "../controllers/cardController.js";
import { requireApiKey } from "../middleware/authMiddleware.js";
import { apiLimiter, scanLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// List all dynamic QR cards with analytics stats: GET /api/cards
router.get("/api/cards", apiLimiter, getAllCards);

// Card activation: POST /api/cards/activate
router.post("/api/cards/activate", apiLimiter, requireApiKey, activateCard);

// Card update: PUT /api/cards/:cardId
router.put("/api/cards/:cardId", apiLimiter, requireApiKey, updateCard);

// Delete card: DELETE /api/cards/:cardId
router.delete("/api/cards/:cardId", apiLimiter, requireApiKey, deleteCard);

// Get single Card info: GET /api/cards/:cardId
router.get("/api/cards/:cardId", apiLimiter, getCard);

// NFC & QR Scan redirection: GET /c/:cardId
router.get("/c/:cardId", scanLimiter, redirectScan);

export default router;

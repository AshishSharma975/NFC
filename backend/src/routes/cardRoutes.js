import express from "express";
import {
  activateCard,
  updateCard,
  getCard,
  getAllCards,
  deleteCard,
  redirectScan,
  adminLogin,
  adminVerify,
  getAdminStats,
  bulkGenerateCards,
  bulkDeleteCards,
} from "../controllers/cardController.js";
import { requireApiKey, requireAdminAuth } from "../middleware/authMiddleware.js";
import { apiLimiter, scanLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Admin Authentication: POST /api/admin/login
router.post("/api/admin/login", apiLimiter, adminLogin);

// Admin Token Verification: GET /api/admin/verify
router.get("/api/admin/verify", apiLimiter, requireAdminAuth, adminVerify);

// Comprehensive Admin Dashboard Stats: GET /api/admin/stats
router.get("/api/admin/stats", apiLimiter, requireAdminAuth, getAdminStats);

// Bulk Dynamic QR Generation: POST /api/cards/bulk
router.post("/api/cards/bulk", apiLimiter, requireAdminAuth, bulkGenerateCards);

// Bulk Delete Cards: DELETE /api/cards/bulk
router.delete("/api/cards/bulk", apiLimiter, requireAdminAuth, bulkDeleteCards);

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


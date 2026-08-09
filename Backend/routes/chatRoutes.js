import express from "express";
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from "../controllers/chatController.js";
import userAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

// All chat routes require authentication
// POST   /api/v1/chat/message   — send a message, get AI reply
router.post("/message", userAuth, sendMessage);

// GET    /api/v1/chat/history   — retrieve full conversation history
router.get("/history", userAuth, getChatHistory);

// DELETE /api/v1/chat/clear     — wipe conversation history
router.delete("/clear", userAuth, clearChatHistory);

export default router;

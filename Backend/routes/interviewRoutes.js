import express from "express";
import {
  createInterview,
  getInterviews,
  updateInterview,
  deleteInterview,
} from "../controllers/interviewController.js";
import userAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

// All interview routes require authentication
// POST   /api/v1/interviews        — schedule a new interview
router.post("/", userAuth, createInterview);

// GET    /api/v1/interviews        — get all user interviews (?status=scheduled|completed|cancelled)
router.get("/", userAuth, getInterviews);

// PATCH  /api/v1/interviews/:id    — update interview details
router.patch("/:id", userAuth, updateInterview);

// DELETE /api/v1/interviews/:id    — delete an interview
router.delete("/:id", userAuth, deleteInterview);

export default router;

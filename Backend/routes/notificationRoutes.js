import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import userAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", userAuth, getNotifications);

// PATCH /api/v1/notifications/read-all — mark every notification as read
router.patch("/read-all", userAuth, markAllRead);

// PATCH /api/v1/notifications/:id/read — mark one notification as read
router.patch("/:id/read", userAuth, markAsRead);

// DELETE /api/v1/notifications/:id     — delete a notification
router.delete("/:id", userAuth, deleteNotification);

export default router;

import Notification from "../models/notificationModel.js";

// ─── Helper: emit real-time event via Socket.io ──────────────────────────────
const emitToUser = (req, userId, event, payload) => {
  try {
    const io = req.app.locals.io;
    if (io) {
      io.to(`user_${userId}`).emit(event, payload);
    }
  } catch (err) {
    console.error("[NotificationController] Socket emit error:", err.message);
  }
};

// ─── GET /api/v1/notifications ───────────────────────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, read: false }),
    ]);

    res.status(200).json({
      success: true,
      total,
      unreadCount,
      numOfPage: Math.ceil(total / limit),
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/notifications/:id/read ────────────────────────────────────
export const markAsRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return next(new Error("Notification not found"));
    }

    // Emit updated unread count
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    emitToUser(req, userId, "notification:unread_count", { unreadCount });

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/notifications/read-all ────────────────────────────────────
export const markAllRead = async (req, res, next) => {
  try {
    const { userId } = req.user;

    await Notification.updateMany({ userId, read: false }, { read: true });

    emitToUser(req, userId, "notification:unread_count", { unreadCount: 0 });

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/notifications/:id ────────────────────────────────────────
export const deleteNotification = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return next(new Error("Notification not found"));
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};

// ─── Utility: create + emit a notification (called by other controllers) ─────
export const createAndEmitNotification = async (io, userId, type, message, meta = {}) => {
  try {
    const notification = await Notification.create({ userId, type, message, meta });
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    if (io) {
      io.to(`user_${userId}`).emit("notification:new", { notification, unreadCount });
    }

    return notification;
  } catch (error) {
    console.error("[NotificationController] createAndEmitNotification error:", error.message);
  }
};

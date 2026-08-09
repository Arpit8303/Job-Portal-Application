import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      enum: ["status_change", "job_alert", "interview_reminder", "general"],
      default: "general",
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      maxlength: 500,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // optional metadata (e.g. jobId, interviewId) for deep-linking
    meta: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// index for fast per-user queries
notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

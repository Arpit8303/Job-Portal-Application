import mongoose from "mongoose";

const jobAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    // ── Alert filter criteria ────────────────────────────────────────────────
    filters: {
      keywords: {
        type: [String],
        default: [],
      },
      location: {
        type: String,
        default: "",
      },
      workType: {
        type: String,
        enum: ["full-time", "part-time", "internship", "contract", "all"],
        default: "all",
      },
      salaryMin: {
        type: Number,
        default: null,
      },
      salaryMax: {
        type: Number,
        default: null,
      },
    },
    // ── Alert meta ────────────────────────────────────────────────────────────
    name: {
      type: String,
      default: "My Job Alert",
      maxlength: 100,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // track when we last checked for new matches (for cron deduplication)
    lastCheckedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// one user can have at most 5 active alerts — enforced in the controller
jobAlertSchema.index({ userId: 1, active: 1 });

export default mongoose.model("JobAlert", jobAlertSchema);

import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    // references the job entry (Job model) that the interview is for
    applicationId: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      required: [true, "Application (Job) ID is required"],
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    dateTime: {
      type: Date,
      required: [true, "Interview date and time is required"],
    },
    notes: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    // track whether the 24-hour reminder email has been sent
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// compound index for efficient per-user interview queries
interviewSchema.index({ userId: 1, dateTime: 1 });

export default mongoose.model("Interview", interviewSchema);

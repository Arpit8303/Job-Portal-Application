import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Company name is required"],
    },
    position: {
      type: String,
      required: [true, "Job Position is required"],
      maxlength: 100,
    },
    status: {
      type: String,
      enum: ["pending", "reject", "interview", "offer"],
      default: "pending",
    },
    workType: {
      type: String,
      enum: ["full-time", "part-time", "internship", "contract"],
      default: "full-time",
    },
    workLocation: {
      type: String,
      default: "Mumbai",
      required: [true, "Work location is required"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    // Phase 7 — salary insight field
    salary: {
      type: Number,
      default: null,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Phase 7 — full-text search index
jobSchema.index({ position: "text", company: "text", workLocation: "text" });

export default mongoose.model("Job", jobSchema);
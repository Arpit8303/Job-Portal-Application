import Interview from "../models/interviewModel.js";
import Jobs from "../models/jobsModel.js";
import userModel from "../models/userModel.js";
import { sendInterviewReminderEmail } from "../utils/emailService.js";
import { createAndEmitNotification } from "./notificationController.js";

// ─── Helper: schedule a 24-hour reminder via setTimeout ──────────────────────
const scheduleReminder = (io, interview, userEmail, userName) => {
  const now = Date.now();
  const interviewTime = new Date(interview.dateTime).getTime();
  // fire 24 hours before the interview
  const reminderTime = interviewTime - 24 * 60 * 60 * 1000;
  const delay = reminderTime - now;

  if (delay <= 0) return; // interview is in less than 24 hours — skip delayed reminder

  setTimeout(async () => {
    try {
      // Refetch to check it wasn't cancelled
      const fresh = await Interview.findById(interview._id);
      if (!fresh || fresh.status === "cancelled" || fresh.reminderSent) return;

      await sendInterviewReminderEmail(userEmail, {
        dateTime: interview.dateTime,
        notes: interview.notes,
      });

      await createAndEmitNotification(
        io,
        interview.userId.toString(),
        "interview_reminder",
        `⏰ Reminder: You have an interview scheduled tomorrow at ${new Date(interview.dateTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`,
        { interviewId: interview._id }
      );

      await Interview.findByIdAndUpdate(interview._id, { reminderSent: true });
    } catch (err) {
      console.error("[InterviewController] Reminder error:", err.message);
    }
  }, delay);
};

// ─── POST /api/v1/interviews ─────────────────────────────────────────────────
export const createInterview = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { applicationId, dateTime, notes } = req.body;

    if (!applicationId || !dateTime) {
      return next(new Error("applicationId and dateTime are required"));
    }

    // Verify the job belongs to the user
    const job = await Jobs.findOne({ _id: applicationId, createdBy: userId });
    if (!job) {
      return next(new Error("Job application not found or not authorized"));
    }

    const interview = await Interview.create({
      applicationId,
      userId,
      dateTime,
      notes: notes || "",
    });

    // Fetch user for email
    const user = await userModel.findById(userId).select("email name");

    // Schedule 24h reminder in background
    const io = req.app.locals.io;
    scheduleReminder(io, interview, user.email, user.name);

    // Create an in-app notification
    await createAndEmitNotification(
      io,
      userId,
      "interview_reminder",
      `📅 Interview scheduled for "${job.position}" at ${job.company} on ${new Date(dateTime).toLocaleDateString("en-IN")}`,
      { interviewId: interview._id, jobId: job._id }
    );

    res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/interviews ───────────────────────────────────────────────────
export const getInterviews = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { status } = req.query;

    const query = { userId };
    if (status && status !== "all") query.status = status;

    const interviews = await Interview.find(query)
      .populate("applicationId", "position company workLocation")
      .sort({ dateTime: 1 });

    res.status(200).json({
      success: true,
      total: interviews.length,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/interviews/:id ────────────────────────────────────────────
export const updateInterview = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { dateTime, notes, status } = req.body;

    const interview = await Interview.findOne({ _id: id, userId });
    if (!interview) {
      return next(new Error("Interview not found or not authorized"));
    }

    if (dateTime) interview.dateTime = dateTime;
    if (notes !== undefined) interview.notes = notes;
    if (status) interview.status = status;

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Interview updated successfully",
      interview,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/interviews/:id ───────────────────────────────────────────
export const deleteInterview = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const interview = await Interview.findOneAndDelete({ _id: id, userId });
    if (!interview) {
      return next(new Error("Interview not found or not authorized"));
    }

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

import Jobs from "../models/jobsModel.js";
import userModel from "../models/userModel.js";
import JobAlert from "../models/jobAlertModel.js";
import { scoreJobMatch } from "../utils/resumeParser.js";

// ─── GET /api/v1/jobs/recommended ────────────────────────────────────────────
/**
 * Returns jobs scored by relevance to the authenticated user's:
 *   1. skills stored in their profile
 *   2. position/title keywords from their past applied jobs
 *
 * Jobs created by the user themselves are excluded.
 * Returns top 20 scored results.
 */
export const getRecommendedJobsController = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // 1. Fetch user profile for their saved skills
    const user = await userModel.findById(userId).select("skills location");
    const userSkills = user?.skills || [];

    // 2. Fetch the user's own job applications to extract keyword signals
    const userJobs = await Jobs.find({ createdBy: userId })
      .select("position company workLocation workType")
      .lean();

    // Build a keyword set from previous applications
    const pastKeywords = new Set();
    userJobs.forEach((job) => {
      job.position
        .toLowerCase()
        .split(/[\s,/|]+/)
        .forEach((word) => {
          if (word.length > 2) pastKeywords.add(word);
        });
    });

    // Combine user skill list with keywords from past jobs
    const allUserSignals = [
      ...userSkills.map((s) => s.toLowerCase()),
      ...Array.from(pastKeywords),
    ];

    // 3. Fetch all jobs NOT created by this user (i.e., the job marketplace)
    // For now the Jobs model doubles as both user-applications and marketplace;
    // in a real setup this would be a separate Jobs collection.
    // We pull recent jobs across ALL users as potential recommendations.
    const allJobs = await Jobs.find({
      createdBy: { $ne: userId }, // exclude own
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    // 4. Score and sort
    const scored = allJobs
      .map((job) => ({
        ...job,
        _matchScore: scoreJobMatch(allUserSignals, job),
      }))
      .filter((job) => job._matchScore > 0) // only include jobs with some match
      .sort((a, b) => b._matchScore - a._matchScore)
      .slice(0, 20);

    res.status(200).json({
      success: true,
      total: scored.length,
      userSkills,
      jobs: scored,
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/jobs/alerts ────────────────────────────────────────────────
export const createJobAlertController = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { name, filters } = req.body;

    if (!filters || (!filters.keywords?.length && !filters.location && !filters.workType)) {
      return next(new Error("Please provide at least one filter (keywords, location, or workType)"));
    }

    // Enforce max 5 active alerts per user
    const activeCount = await JobAlert.countDocuments({ userId, active: true });
    if (activeCount >= 5) {
      return next(new Error("You can have at most 5 active job alerts. Disable one before creating another."));
    }

    const alert = await JobAlert.create({
      userId,
      name: name || "My Job Alert",
      filters: {
        keywords: filters.keywords || [],
        location: filters.location || "",
        workType: filters.workType || "all",
        salaryMin: filters.salaryMin || null,
        salaryMax: filters.salaryMax || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Job alert created successfully",
      alert,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/jobs/alerts ─────────────────────────────────────────────────
export const getJobAlertsController = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const alerts = await JobAlert.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/jobs/alerts/:id ──────────────────────────────────────────
export const updateJobAlertController = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { name, filters, active } = req.body;

    const alert = await JobAlert.findOne({ _id: id, userId });
    if (!alert) {
      return next(new Error("Job alert not found or not authorized"));
    }

    if (name !== undefined)   alert.name = name;
    if (active !== undefined) alert.active = active;
    if (filters) {
      alert.filters = {
        keywords:  filters.keywords  ?? alert.filters.keywords,
        location:  filters.location  ?? alert.filters.location,
        workType:  filters.workType  ?? alert.filters.workType,
        salaryMin: filters.salaryMin ?? alert.filters.salaryMin,
        salaryMax: filters.salaryMax ?? alert.filters.salaryMax,
      };
    }

    await alert.save();
    res.status(200).json({ success: true, message: "Alert updated", alert });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/jobs/alerts/:id ─────────────────────────────────────────
export const deleteJobAlertController = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const alert = await JobAlert.findOneAndDelete({ _id: id, userId });
    if (!alert) {
      return next(new Error("Job alert not found or not authorized"));
    }

    res.status(200).json({ success: true, message: "Job alert deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * Phase 7 — Search & Salary Insights Controller
 */
import Jobs from "../models/jobsModel.js";
import mongoose from "mongoose";

// ─── GET /api/v1/jobs/search ──────────────────────────────────────────────────
// Query params: q, location, salaryMin, salaryMax, remote, workType, page, limit
export const searchJobsController = async (req, res, next) => {
  try {
    const {
      q,
      location,
      salaryMin,
      salaryMax,
      remote,
      workType,
      sort = "latest",
    } = req.query;

    const page  = Number(req.query.page)  || 1;
    const limit = Number(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const query = {};

    // ── Full-text search on position + company + workLocation ──────────────
    if (q && q.trim()) {
      query.$text = { $search: q.trim() };
    }

    // ── Location filter ────────────────────────────────────────────────────
    if (location && location.trim()) {
      query.workLocation = { $regex: location.trim(), $options: "i" };
    }

    // ── Remote filter ──────────────────────────────────────────────────────
    if (remote === "true") {
      query.isRemote = true;
    }

    // ── Work type filter ───────────────────────────────────────────────────
    if (workType && workType !== "all") {
      query.workType = workType;
    }

    // ── Salary range filter ────────────────────────────────────────────────
    if (salaryMin || salaryMax) {
      query.salary = {};
      if (salaryMin) query.salary.$gte = Number(salaryMin);
      if (salaryMax) query.salary.$lte = Number(salaryMax);
    }

    // ── Sort ───────────────────────────────────────────────────────────────
    let sortObj = { createdAt: -1 }; // default: latest
    if (q && q.trim()) sortObj = { score: { $meta: "textScore" }, ...sortObj };
    if (sort === "oldest")   sortObj = { createdAt: 1 };
    if (sort === "salary-high") sortObj = { salary: -1 };
    if (sort === "salary-low")  sortObj = { salary: 1 };

    // ── Execute ────────────────────────────────────────────────────────────
    const [jobs, total] = await Promise.all([
      Jobs.find(
        query,
        q && q.trim() ? { score: { $meta: "textScore" } } : {}
      )
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Jobs.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      numOfPage: Math.ceil(total / limit),
      currentPage: page,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/v1/jobs/salary-insights ────────────────────────────────────────
// Returns avg salary grouped by position title & location
export const salaryInsightsController = async (req, res, next) => {
  try {
    const { role, location } = req.query;

    const matchStage = {
      salary: { $ne: null, $gt: 0 },
    };
    if (role)     matchStage.position    = { $regex: role,     $options: "i" };
    if (location) matchStage.workLocation = { $regex: location, $options: "i" };

    // Avg salary by role (first 2 words of position)
    const byRole = await Jobs.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $toLower: {
              $trim: {
                input: {
                  $arrayElemAt: [{ $split: ["$position", " "] }, 0],
                },
              },
            },
          },
          avgSalary: { $avg: "$salary" },
          minSalary: { $min: "$salary" },
          maxSalary: { $max: "$salary" },
          count:     { $sum: 1 },
        },
      },
      { $sort: { avgSalary: -1 } },
      { $limit: 15 },
    ]);

    // Avg salary by location
    const byLocation = await Jobs.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $toLower: "$workLocation" },
          avgSalary: { $avg: "$salary" },
          count:     { $sum: 1 },
        },
      },
      { $sort: { avgSalary: -1 } },
      { $limit: 10 },
    ]);

    // Overall stats
    const overall = await Jobs.aggregate([
      { $match: { salary: { $ne: null, $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgSalary: { $avg: "$salary" },
          minSalary: { $min: "$salary" },
          maxSalary: { $max: "$salary" },
          totalJobs: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      overall: overall[0] || {},
      byRole:     byRole.map((r) => ({ role: r._id, ...r, _id: undefined })),
      byLocation: byLocation.map((l) => ({ location: l._id, ...l, _id: undefined })),
    });
  } catch (error) {
    next(error);
  }
};

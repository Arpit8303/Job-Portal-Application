import express from "express";
import {
  createJobController,
  deleteJobController,
  getAllJobsController,
  jobStatsController,
  updateJobController,
} from "../controllers/jobsController.js";
import {
  getRecommendedJobsController,
  createJobAlertController,
  getJobAlertsController,
  updateJobAlertController,
  deleteJobAlertController,
} from "../controllers/recommendationController.js";
import {
  searchJobsController,
  salaryInsightsController,
} from "../controllers/searchController.js";
import userAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Phase 2: Recommended Jobs (must be before /:id routes) ──────────────────
// GET  /api/v1/jobs/recommended   — personalised recommendations
router.get("/recommended", userAuth, getRecommendedJobsController);

// ── Phase 7: Search & Discovery ──────────────────────────────────────────────
// GET  /api/v1/jobs/search?q=&location=&salaryMin=&salaryMax=&remote=&workType=
router.get("/search", userAuth, searchJobsController);

// GET  /api/v1/jobs/salary-insights?role=&location=
router.get("/salary-insights", userAuth, salaryInsightsController);

// ── Phase 2: Job Alerts CRUD ─────────────────────────────────────────────────
// POST   /api/v1/jobs/alerts       — create a new alert
router.post("/alerts", userAuth, createJobAlertController);

// GET    /api/v1/jobs/alerts       — list user's alerts
router.get("/alerts", userAuth, getJobAlertsController);

// PATCH  /api/v1/jobs/alerts/:id   — update an alert
router.patch("/alerts/:id", userAuth, updateJobAlertController);

// DELETE /api/v1/jobs/alerts/:id   — delete an alert
router.delete("/alerts/:id", userAuth, deleteJobAlertController);

// ── Existing routes ───────────────────────────────────────────────────────────
// CREATE JOB || POST
router.post("/create-job", userAuth, createJobController);

//GET JOBS || GET
router.get("/get-job", userAuth, getAllJobsController);

//UPDATE JOBS ||  PATCH
router.patch("/update-job/:id", userAuth, updateJobController);

//DELETE JOBS || DELETE
router.delete("/delete-job/:id", userAuth, deleteJobController);

// JOBS STATS FILTER || GET
router.get("/job-stats", userAuth, jobStatsController);

export default router;
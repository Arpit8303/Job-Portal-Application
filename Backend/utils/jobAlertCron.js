/**
 * jobAlertCron.js — Phase 2
 *
 * Runs every 30 minutes via node-cron.
 * For each active JobAlert, queries newly created jobs that match the alert's
 * filters. If matches exist:
 *   - Sends an email digest via emailService
 *   - Creates an in-app notification via notificationController utility
 *   - Updates lastCheckedAt so the next run only checks new jobs
 */

import cron from "node-cron";
import JobAlert from "../models/jobAlertModel.js";
import Jobs from "../models/jobsModel.js";
import userModel from "../models/userModel.js";
import { sendJobAlertEmail } from "./emailService.js";
import { createAndEmitNotification } from "../controllers/notificationController.js";

/**
 * Build a Mongoose query object from an alert's filter config.
 * @param {object} filters
 * @param {Date}   sinceDate  — only return jobs created after this date
 */
const buildJobQuery = (filters, sinceDate) => {
  const query = {
    createdAt: { $gt: sinceDate },
  };

  // keyword matching on position field
  if (filters.keywords && filters.keywords.length > 0) {
    const keywordPattern = filters.keywords
      .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    query.position = { $regex: keywordPattern, $options: "i" };
  }

  // location matching
  if (filters.location && filters.location.trim() !== "") {
    query.workLocation = { $regex: filters.location.trim(), $options: "i" };
  }

  // work type matching
  if (filters.workType && filters.workType !== "all") {
    query.workType = filters.workType;
  }

  return query;
};

/**
 * Main job alert check function.
 * Exported so it can be called once on server start and from cron.
 * @param {SocketIOServer} io  — Socket.io server instance for real-time push
 */
export const runJobAlertCheck = async (io) => {
  console.log("[JobAlertCron] Running job alert check…".cyan);

  try {
    // Fetch all active alerts
    const alerts = await JobAlert.find({ active: true });

    if (alerts.length === 0) {
      console.log("[JobAlertCron] No active alerts. Skipping.".gray);
      return;
    }

    const now = new Date();

    for (const alert of alerts) {
      try {
        // Only check jobs created since the alert was last checked
        const sinceDate = alert.lastCheckedAt || alert.createdAt;

        const matchingJobs = await Jobs.find(buildJobQuery(alert.filters, sinceDate))
          .limit(10)
          .lean();

        if (matchingJobs.length === 0) continue;

        // Fetch user for email
        const user = await userModel.findById(alert.userId).select("email name");
        if (!user) continue;

        // Send email notification
        await sendJobAlertEmail(user.email, matchingJobs);

        // Create in-app notification
        await createAndEmitNotification(
          io,
          alert.userId.toString(),
          "job_alert",
          `🔔 ${matchingJobs.length} new job${matchingJobs.length > 1 ? "s" : ""} matching your alert "${alert.name}"`,
          { alertId: alert._id, matchCount: matchingJobs.length }
        );

        // Update lastCheckedAt
        alert.lastCheckedAt = now;
        await alert.save();

        console.log(
          `[JobAlertCron] Alert "${alert.name}" (${alert._id}): found ${matchingJobs.length} new jobs for user ${user.email}`.green
        );
      } catch (alertErr) {
        console.error(
          `[JobAlertCron] Error processing alert ${alert._id}:`,
          alertErr.message
        );
      }
    }
  } catch (err) {
    console.error("[JobAlertCron] Fatal error:", err.message);
  }
};

// initJobAlertCron — call once from server.js after Socket.io is ready.
// Schedule: every 30 minutes  →  "*/30 * * * *"
// @param {SocketIOServer} io
export const initJobAlertCron = (io) => {
  // Run immediately on startup (check any alerts that were missed during downtime)
  runJobAlertCheck(io);

  // Then schedule every 30 minutes
  cron.schedule("*/30 * * * *", () => {
    runJobAlertCheck(io);
  });

  console.log("[JobAlertCron] Scheduled: every 30 minutes".cyan);
};

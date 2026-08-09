import express from "express";
import {
  setup2FA,
  verify2FA,
  disable2FA,
  validate2FALogin,
} from "../controllers/twoFactorController.js";
import {
  googleAuth,
  googleAuthCallback,
  getPublicProfile,
  updatePublicSettings,
} from "../controllers/googleAuthController.js";
import userAuth from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── Google OAuth ──────────────────────────────────────────────────────────────
// GET /api/v1/auth/google          — initiates Google OAuth flow
router.get("/google", googleAuth);

// GET /api/v1/auth/google/callback — Google redirects here after login
router.get("/google/callback", googleAuthCallback);

// ── Two-Factor Authentication ─────────────────────────────────────────────────
// POST /api/v1/auth/2fa/setup      — generate secret + QR code (requires login)
router.post("/2fa/setup", userAuth, setup2FA);

// POST /api/v1/auth/2fa/verify     — activate 2FA after scanning QR
router.post("/2fa/verify", userAuth, verify2FA);

// POST /api/v1/auth/2fa/disable    — disable 2FA (requires valid TOTP token)
router.post("/2fa/disable", userAuth, disable2FA);

// POST /api/v1/auth/2fa/validate   — used during login when 2FA is active
router.post("/2fa/validate", validate2FALogin);

// ── Public Profile ────────────────────────────────────────────────────────────
// GET  /api/v1/auth/public/:username   — public resume-style profile (no auth)
router.get("/public/:username", getPublicProfile);

// PATCH /api/v1/auth/public-settings   — toggle isPublic + set username
router.patch("/public-settings", userAuth, updatePublicSettings);

export default router;

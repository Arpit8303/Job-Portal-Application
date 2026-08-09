/**
 * Phase 6 — Two-Factor Authentication Controller
 * Uses speakeasy for TOTP + qrcode for QR generation
 */
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import userModel from "../models/userModel.js";

// ─── POST /api/v1/auth/2fa/setup ─────────────────────────────────────────────
// Generate a new TOTP secret and return a QR code data-URL
export const setup2FA = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const secret = speakeasy.generateSecret({
      name: `JobLedger (${req.user.email || "your account"})`,
      length: 20,
    });

    // Temporarily store secret (unverified) on user doc
    await userModel.findByIdAndUpdate(userId, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false, // only enable after verification
    });

    // Generate QR code as data-URL
    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      success: true,
      message: "Scan the QR code with your authenticator app, then verify",
      qrCode: qrDataUrl,
      secret: secret.base32, // also return plaintext for manual entry
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/2fa/verify ────────────────────────────────────────────
// Verify the user's TOTP code and activate 2FA
export const verify2FA = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;

    if (!token) {
      return next(new Error("Verification code is required"));
    }

    const user = await userModel.findById(userId).select("+twoFactorSecret");
    if (!user || !user.twoFactorSecret) {
      return next(new Error("2FA setup not initiated. Call /2fa/setup first"));
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token.replace(/\s/g, ""),
      window: 1, // allow 1 step (30s) clock drift
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid code. Try again." });
    }

    await userModel.findByIdAndUpdate(userId, { twoFactorEnabled: true });

    res.status(200).json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/2fa/disable ───────────────────────────────────────────
export const disable2FA = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { token } = req.body;

    const user = await userModel.findById(userId).select("+twoFactorSecret");
    if (!user || !user.twoFactorEnabled) {
      return next(new Error("2FA is not enabled on this account"));
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token?.replace(/\s/g, "") || "",
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid code. 2FA not disabled." });
    }

    await userModel.findByIdAndUpdate(userId, {
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });

    res.status(200).json({ success: true, message: "2FA disabled successfully" });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/auth/2fa/validate ──────────────────────────────────────────
// Called during login flow when 2FA is enabled — verifies TOTP, returns JWT
export const validate2FALogin = async (req, res, next) => {
  try {
    const { tempUserId, token } = req.body;
    if (!tempUserId || !token) {
      return next(new Error("tempUserId and token are required"));
    }

    const user = await userModel.findById(tempUserId).select("+twoFactorSecret +password");
    if (!user || !user.twoFactorEnabled) {
      return next(new Error("Invalid request"));
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: token.replace(/\s/g, ""),
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ success: false, message: "Invalid 2FA code" });
    }

    user.password = undefined;
    const jwtToken = user.createJWT();

    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      token: jwtToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Phase 6 — Google OAuth Controller
 * Uses passport-google-oauth20 strategy
 * On success: issues a JWT (same as existing auth) and redirects to frontend
 */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";

/**
 * initGoogleOAuth — call once after dotenv.config() in server.js
 */
export const initGoogleOAuth = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn(
      "[GoogleOAuth] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled"
        .yellow
    );
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/v1/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email from Google profile"));

          // Find or create user
          let user = await userModel.findOne({
            $or: [{ googleId: profile.id }, { email }],
          });

          if (!user) {
            user = await userModel.create({
              name: profile.displayName || profile.name?.givenName || "User",
              email,
              googleId: profile.id,
              // password not set for OAuth users — they can set one later
              password: `google_${profile.id}_${Date.now()}`,
            });
          } else if (!user.googleId) {
            // Link Google to existing account
            user.googleId = profile.id;
            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Minimal serialisation (we use JWT, not sessions)
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

// ─── GET /api/v1/auth/google ──────────────────────────────────────────────────
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

// ─── GET /api/v1/auth/google/callback ────────────────────────────────────────
export const googleAuthCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user) => {
    if (err || !user) {
      const msg = err?.message || "Google authentication failed";
      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=${encodeURIComponent(msg)}`
      );
    }

    // Issue JWT — same mechanism as existing auth
    const token = user.createJWT();
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
    };

    // Redirect to frontend with token in query string (frontend stores it)
    const params = new URLSearchParams({
      token,
      user: JSON.stringify(userData),
    });

    res.redirect(
      `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/callback?${params.toString()}`
    );
  })(req, res, next);
};

// ─── GET /api/v1/user/public/:username ───────────────────────────────────────
export const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await userModel
      .findOne({ username: username.toLowerCase(), isPublic: true })
      .select("name lastName location skills resumeUrl isPublic username createdAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Public profile not found or not made public",
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /api/v1/user/public-settings ──────────────────────────────────────
export const updatePublicSettings = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { isPublic, username } = req.body;

    const update = {};
    if (isPublic !== undefined) update.isPublic = isPublic;

    if (username !== undefined) {
      const slug = username.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      if (!slug || slug.length < 3) {
        return next(new Error("Username must be at least 3 characters (letters, numbers, _ -)"));
      }
      // Check uniqueness
      const exists = await userModel.findOne({ username: slug, _id: { $ne: userId } });
      if (exists) {
        return next(new Error("Username already taken. Please choose another."));
      }
      update.username = slug;
    }

    const user = await userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .select("-password -twoFactorSecret");

    const token = user.createJWT();
    res.status(200).json({ success: true, user, token });
  } catch (error) {
    next(error);
  }
};

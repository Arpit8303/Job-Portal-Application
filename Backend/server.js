// !! env.js MUST be first — loads dotenv before any module reads process.env
import "./env.js";
// API Documentation
import swaggerUi from "swagger-ui-express";
import swaggerDoc from "swagger-jsdoc";
// packages imports
import express from "express";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import "express-async-errors";
import colors from "colors";
import cors from "cors";
import morgan from "morgan";
//securty packges
import helmet from "helmet";
import xss from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
// files imports
import connectDB from "./config/db.js";
// routes import
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import jobsRoutes from "./routes/jobsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import { initJobAlertCron } from "./utils/jobAlertCron.js";
import phase6Routes from "./routes/phase6Routes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { initGoogleOAuth } from "./controllers/googleAuthController.js";
import passport from "passport";

// MongoDB connection (env already loaded by env.js at top)
connectDB();

// Swagger api config
// swagger api options
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Portal Application",
      description: "Node Expressjs Job Portal Application",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const spec = swaggerDoc(options);

//rest object
const app = express();

// HTTP server (required for Socket.io)
const server = createServer(app);

// Socket.io setup
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store io on app so controllers can access via req.app.locals.io
app.locals.io = io;

// Socket.io connection handler
io.on("connection", (socket) => {
  // Clients must emit 'join' with their userId to subscribe to personal events
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`[Socket.io] User ${userId} joined room user_${userId}`.cyan);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Socket disconnected: ${socket.id}`.gray);
  });
});

//middelwares
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(passport.initialize()); // Phase 6 — Passport for Google OAuth

//routes
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/auth", phase6Routes);   // Phase 6: Google OAuth + 2FA + public profile
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/jobs", jobsRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/interviews", interviewRoutes);
app.use("/api/v1/chat", chatRoutes);       // Phase 8: Chatbot

//homeroute root
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(spec));

//root route
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Job Portal Application API</h1>");
});

//validation middelware
app.use(errorMiddleware);

//port
const PORT = process.env.PORT || 5000;
//listen
server.listen(PORT, () => {
  console.log(
    `Node Server Running In ${process.env.DEV_MODE} Mode on port no ${PORT}`
      .bgCyan.white
  );
  console.log(`[Socket.io] Real-time server ready`.cyan);
  // Phase 2: Start job alert cron (every 30 min)
  initJobAlertCron(io);
  // Phase 6: Initialise Google OAuth strategy
  initGoogleOAuth();
  console.log(`[Phase 6] Google OAuth + 2FA routes active`.cyan);
  console.log(`[Phase 8] Chatbot (Grok) routes active`.cyan);
});

// Handle server errors
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please kill the process using this port or change PORT.`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
  }
});
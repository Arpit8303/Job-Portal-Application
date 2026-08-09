/**
 * Phase 8 — AI Chatbot Controller
 * Uses Cohere Command API (REST) — no extra npm package needed
 * Model: command-r-08-2024 (stable, free tier)
 *
 * Tools:
 *   - Searches jobs from DB
 *   - Gets user's applications
 *   - Gives personalised recommendations
 */

import Chat from "../models/chatModel.js";
import Jobs from "../models/jobsModel.js";
import userModel from "../models/userModel.js";
import { scoreJobMatch } from "../utils/resumeParser.js";

// ─── Debug: confirm env is loaded ────────────────────────────────────────────
console.log("[Chatbot] COHERE_KEY loaded:", process.env.COHERE_KEY ? "YES ✅" : "MISSING ❌");

// ─── Per-user in-memory rate limiter ─────────────────────────────────────────
const userRateMap = new Map();
const RATE_LIMIT  = 10;
const RATE_WINDOW = 60 * 1000;

const checkRateLimit = (userId) => {
  const now   = Date.now();
  const entry = userRateMap.get(String(userId));
  if (!entry || now > entry.resetAt) {
    userRateMap.set(String(userId), { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
};

// ─── DB tool executor ─────────────────────────────────────────────────────────
const runDbTool = async (toolName, toolArgs, userId) => {
  switch (toolName) {

    case "search_jobs": {
      const { keyword, location, workType, limit = 5 } = toolArgs || {};
      const query = {};
      if (keyword)                         query.$text  = { $search: keyword };
      if (location)                        query.workLocation = { $regex: location, $options: "i" };
      if (workType && workType !== "all")  query.workType = workType;

      const jobs = await Jobs.find(
        query,
        keyword ? { score: { $meta: "textScore" } } : {}
      )
        .sort(keyword ? { score: { $meta: "textScore" } } : { createdAt: -1 })
        .limit(Math.min(Number(limit) || 5, 10))
        .lean();

      if (!jobs.length) return "No matching jobs found in the database.";

      return jobs
        .map((j, i) =>
          `${i + 1}. **${j.position}** at **${j.company}** — ${j.workLocation} (${j.workType})` +
          (j.salary ? ` — ₹${j.salary.toLocaleString("en-IN")}` : "") +
          ` [Status: ${j.status}]`
        )
        .join("\n");
    }

    case "get_my_applications": {
      const { status = "all" } = toolArgs || {};
      const query = { createdBy: userId };
      if (status && status !== "all") query.status = status;

      const jobs = await Jobs.find(query).sort({ createdAt: -1 }).limit(10).lean();
      if (!jobs.length) return "You have no job applications recorded yet.";

      const emoji = { pending: "⏳", interview: "🗣️", reject: "❌", offer: "🎉" };
      return jobs
        .map((j) =>
          `${emoji[j.status] || "📋"} **${j.position}** at ${j.company} — ${j.status} (${new Date(j.createdAt).toLocaleDateString("en-IN")})`
        )
        .join("\n");
    }

    case "get_recommended_jobs": {
      const user      = await userModel.findById(userId).select("skills");
      const userSkills = user?.skills || [];
      const userJobs  = await Jobs.find({ createdBy: userId }).select("position").lean();
      const pastKw    = new Set(
        userJobs.flatMap((j) =>
          j.position.toLowerCase().split(/[\s,/|]+/).filter((w) => w.length > 2)
        )
      );
      const signals   = [...userSkills.map((s) => s.toLowerCase()), ...pastKw];
      const allJobs   = await Jobs.find({ createdBy: { $ne: userId } })
        .sort({ createdAt: -1 }).limit(100).lean();

      const top = allJobs
        .map((j) => ({ ...j, _score: scoreJobMatch(signals, j) }))
        .filter((j) => j._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, 5);

      if (!top.length) return "No strong recommendations yet — add more skills to your profile!";
      return top
        .map((j, i) => `${i + 1}. **${j.position}** at ${j.company} — ${j.workLocation} (${j._score}% match)`)
        .join("\n");
    }

    default:
      return "Unknown tool.";
  }
};

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are JobLedger Assistant, an AI career helper built into the JobLedger job-tracking platform.

You ONLY help with:
• Finding and applying for jobs
• Career advice (resume tips, interview prep, salary negotiation)
• Explaining job application statuses
• JobLedger platform features

For anything outside this scope, say: "I'm JobLedger Assistant and I can only help with job search and career topics."

When users ask about jobs, their applications, or recommendations — search the database using tools.
Be concise, encouraging, and professional. Use simple markdown (bold, bullet lists).`;

// ─── Call Cohere Command API ──────────────────────────────────────────────────
const callCohere = async (messages, preamble) => {
  const apiKey = process.env.COHERE_KEY;
  if (!apiKey) throw new Error("COHERE_KEY is not set in .env");

  // Convert to Cohere chat history format
  const chatHistory = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "CHATBOT" : "USER",
    message: m.content,
  }));
  const lastUserMsg = messages[messages.length - 1].content;

  const body = {
    model:        "command-r-08-2024",     // stable free-tier model
    message:      lastUserMsg,
    preamble,
    chat_history: chatHistory,
    temperature:  0.7,
    max_tokens:   1024,
  };

  const resp = await fetch("https://api.cohere.com/v1/chat", {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Cohere API error ${resp.status}: ${errText}`);
  }

  const data = await resp.json();
  return data.text || "";
};

// ─── Detect if user wants a DB tool ──────────────────────────────────────────
const detectTool = (message) => {
  const msg = message.toLowerCase();

  if (msg.match(/recommend|suggest|best.*job|job.*me|fit me|match me|what jobs/))
    return { name: "get_recommended_jobs", args: {} };

  if (msg.match(/my application|applied|my job|my status|what.*applied|show.*application/))
    return { name: "get_my_applications", args: { status: "all" } };

  const searchMatch = msg.match(/find|search|show|list|any|jobs? (in|for|near|at)|available jobs?/);
  if (searchMatch) {
    // Extract location
    const locMatch = msg.match(/in ([a-z\s]+?)(?:\s*$|\s+for|\s+job)/i);
    // Extract role keyword
    const roleWords = msg.replace(/find|search|show|list|any|available|jobs?|please|me/gi, "").trim();
    return {
      name: "search_jobs",
      args: {
        keyword:  roleWords.slice(0, 40) || undefined,
        location: locMatch?.[1]?.trim() || undefined,
      },
    };
  }

  return null;
};

// ─── POST /api/v1/chat/message ────────────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { message } = req.body;

    if (!message?.trim())    return next(new Error("Message cannot be empty"));
    if (message.length > 2000) return next(new Error("Message too long (max 2000 characters)"));

    if (!checkRateLimit(userId)) {
      return res.status(429).json({ success: false, message: "Too many messages. Please wait a moment." });
    }

    // ── Load/create conversation ──────────────────────────────────────────────
    let chat = await Chat.findOne({ userId });
    if (!chat) chat = await Chat.create({ userId, messages: [] });

    chat.messages.push({ role: "user", content: message.trim() });
    if (chat.messages.length > 40) chat.messages = chat.messages.slice(-40);

    // ── Detect if we need a DB tool ───────────────────────────────────────────
    let toolContext = "";
    const tool = detectTool(message);
    if (tool) {
      try {
        const result = await runDbTool(tool.name, tool.args, userId);
        toolContext = `\n\n[Database result for ${tool.name}]:\n${result}\n\nUse this data to answer the user's question.`;
      } catch (toolErr) {
        console.error("[Chatbot] DB tool error:", toolErr.message);
      }
    }

    // ── Build messages for Cohere ─────────────────────────────────────────────
    const lastUserMessage = message.trim() + toolContext;
    const messagesForCohere = [
      ...chat.messages.slice(0, -1), // history without the latest user msg
      { role: "user", content: lastUserMessage },
    ];

    // ── Call Cohere ───────────────────────────────────────────────────────────
    let assistantContent;
    try {
      assistantContent = await callCohere(messagesForCohere, SYSTEM_PROMPT);
    } catch (aiErr) {
      console.error("[Chatbot] Cohere error:", aiErr.message);
      return res.status(503).json({
        success: false,
        message: `AI service error: ${aiErr.message}. Check COHERE_KEY in .env`,
      });
    }

    if (!assistantContent) assistantContent = "I couldn't generate a response. Please try again.";

    // ── Persist ───────────────────────────────────────────────────────────────
    chat.messages.push({ role: "assistant", content: assistantContent });
    chat.messageCount = chat.messages.length;
    await chat.save();

    res.status(200).json({ success: true, reply: assistantContent, messageCount: chat.messageCount });

  } catch (error) {
    if (error?.message?.includes("429") || error?.message?.includes("rate")) {
      return res.status(429).json({ success: false, message: "AI service is busy. Please try again in a moment." });
    }
    next(error);
  }
};

// ─── GET /api/v1/chat/history ─────────────────────────────────────────────────
export const getChatHistory = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const chat = await Chat.findOne({ userId });
    res.status(200).json({
      success:      true,
      messages:     chat?.messages || [],
      messageCount: chat?.messageCount || 0,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE /api/v1/chat/clear ────────────────────────────────────────────────
export const clearChatHistory = async (req, res, next) => {
  try {
    const { userId } = req.user;
    await Chat.findOneAndUpdate({ userId }, { messages: [], messageCount: 0 });
    res.status(200).json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    next(error);
  }
};

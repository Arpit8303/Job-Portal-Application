import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 8000,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // no separate _id per message
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    // keep last 50 messages per conversation to manage token usage
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);

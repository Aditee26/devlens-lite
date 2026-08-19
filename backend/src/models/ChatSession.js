const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role:    { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const chatSessionSchema = new mongoose.Schema(
  {
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true, index: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User",       required: true },
    title:        { type: String, default: "New Chat" },
    messages:     [messageSchema],
    tokenCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

chatSessionSchema.index({ userId: 1, repositoryId: 1 });
chatSessionSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("ChatSession", chatSessionSchema);

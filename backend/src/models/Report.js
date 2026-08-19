const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User",       required: true },
    analysisId:   { type: mongoose.Schema.Types.ObjectId, ref: "Analysis",   required: true },
    format:       { type: String, enum: ["pdf", "json"], required: true },
    filename:     { type: String, required: true },
    filePath:     { type: String, required: true },
    size:         { type: Number, default: 0 },
    downloadCount:{ type: Number, default: 0 },
    expiresAt:    { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ repositoryId: 1 });
reportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL

module.exports = mongoose.model("Report", reportSchema);

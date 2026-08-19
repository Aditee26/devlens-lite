const mongoose = require("mongoose");

const repositorySchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name:        { type: String, required: true, trim: true },
    owner:       { type: String, required: true, trim: true },
    fullName:    { type: String, required: true, trim: true },   // owner/name
    githubUrl:   { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    localPath:   { type: String, default: "" },
    defaultBranch: { type: String, default: "main" },
    language:    { type: String, default: "" },
    stars:       { type: Number, default: 0 },
    forks:       { type: Number, default: 0 },
    isPrivate:   { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "cloning", "analyzing", "complete", "error"],
      default: "pending",
    },
    statusMessage: { type: String, default: "" },
    progress:      { type: Number, default: 0, min: 0, max: 100 },
    analysisId:  { type: mongoose.Schema.Types.ObjectId, ref: "Analysis", default: null },
    lastAnalyzedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

repositorySchema.index({ userId: 1, githubUrl: 1 });
repositorySchema.index({ userId: 1, createdAt: -1 });
repositorySchema.index({ status: 1 });

module.exports = mongoose.model("Repository", repositorySchema);

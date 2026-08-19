const mongoose = require("mongoose");

const langStatSchema = new mongoose.Schema({
  language:   String,
  files:      Number,
  lines:      Number,
  percentage: Number,
  color:      String,
}, { _id: false });

const largeFileSchema = new mongoose.Schema({
  path:  String,
  lines: Number,
  size:  Number,
}, { _id: false });

const techInfoSchema = new mongoose.Schema({
  name:       String,
  version:    String,
  category:   String,
  confidence: Number,
}, { _id: false });

const depEdgeSchema = new mongoose.Schema({
  source: String,
  target: String,
}, { _id: false });

const analysisSchema = new mongoose.Schema(
  {
    repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true, index: true },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User",       required: true },
    metrics: {
      totalFiles:    { type: Number, default: 0 },
      totalFolders:  { type: Number, default: 0 },
      totalLines:    { type: Number, default: 0 },
      avgFileSize:   { type: Number, default: 0 },
      largestFiles:  [largeFileSchema],
      languageStats: [langStatSchema],
    },
    techStack:          [techInfoSchema],
    fileTree:           { type: mongoose.Schema.Types.Mixed, default: {} },
    dependencies:       [String],
    dependencyEdges:    [depEdgeSchema],
    summary:            { type: String, default: "" },
  },
  { timestamps: true }
);

analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Analysis", analysisSchema);

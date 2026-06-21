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

const fileNodeSchema = new mongoose.Schema({}, { strict: false, _id: false });

const securityFindingSchema = new mongoose.Schema({
  severity: { type: String, enum: ["critical", "high", "medium", "low"] },
  type:     String,
  file:     String,
  message:  String,
}, { _id: false });

const deadCodeItemSchema = new mongoose.Schema({
  type:    String,    // 'file' | 'import' | 'function'
  file:    String,
  line:    Number,
  symbol:  String,
  message: String,
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
      complexityScore:  { type: Number, default: 0 },
      technicalDebt:    { type: Number, default: 0 },
      duplicateRatio:   { type: Number, default: 0 },
    },
    techStack:          [techInfoSchema],
    fileTree:           { type: mongoose.Schema.Types.Mixed, default: {} },
    dependencies:       [String],
    dependencyEdges:    [depEdgeSchema],
    deadCode:           [deadCodeItemSchema],
    securityFindings:   [securityFindingSchema],
    summary:            { type: String, default: "" },
    aiSummary:          { type: String, default: "" },
  },
  { timestamps: true }
);

analysisSchema.index({ repositoryId: 1 });
analysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Analysis", analysisSchema);

const Analysis   = require("../../models/Analysis");
const { detectTechnologies } = require("../../analyzers/tech.detector");
const { analyzeStructure }   = require("../../analyzers/structure.analyzer");
const { analyzeDependencies }= require("../../analyzers/dependency.analyzer");
const { analyzeSecurityIssues } = require("../../analyzers/security.analyzer");
const { analyzeDeadCode }    = require("../../analyzers/deadcode.analyzer");
const { calculateComplexity, calculateTechnicalDebt } = require("../../analyzers/metrics.analyzer");

async function runAnalysis(repositoryId, userId, localPath) {
  // Delete old analysis for this repo
  await Analysis.deleteMany({ repositoryId });

  // Run all analyzers
  const techStack  = detectTechnologies(localPath);
  const structure  = analyzeStructure(localPath);
  const { dependencies, dependencyEdges, circularDeps } = analyzeDependencies(localPath);
  const securityFindings = analyzeSecurityIssues(localPath);
  const deadCode   = analyzeDeadCode(localPath);

  const complexityScore = calculateComplexity(structure, techStack);
  const technicalDebt   = calculateTechnicalDebt(structure);

  const summary = buildSummary({ techStack, structure, securityFindings, deadCode, circularDeps });

  const analysis = await Analysis.create({
    repositoryId,
    userId,
    metrics: {
      totalFiles:    structure.totalFiles,
      totalFolders:  structure.totalFolders,
      totalLines:    structure.totalLines,
      avgFileSize:   structure.avgFileSize,
      largestFiles:  structure.largestFiles,
      languageStats: structure.languageStats,
      complexityScore,
      technicalDebt,
      duplicateRatio: 0,
    },
    techStack,
    fileTree: structure.fileTree,
    dependencies,
    dependencyEdges,
    deadCode,
    securityFindings,
    summary,
  });

  return analysis;
}

function buildSummary({ techStack, structure, securityFindings, deadCode, circularDeps }) {
  const techs   = techStack.slice(0, 5).map((t) => t.name).join(", ");
  const critical = securityFindings.filter((f) => f.severity === "critical").length;
  const high     = securityFindings.filter((f) => f.severity === "high").length;

  let secStr = "No critical security issues detected.";
  if (critical > 0) secStr = `⚠️  ${critical} critical security finding(s) detected.`;
  else if (high > 0) secStr = `${high} high-severity security finding(s) found.`;

  return `This repository contains ${structure.totalFiles} files and ${structure.totalLines.toLocaleString()} lines of code. ` +
    `Primary technologies: ${techs || "unknown"}. ` +
    `${secStr} ` +
    `${deadCode.length} potential dead-code items found. ` +
    (circularDeps?.length ? `${circularDeps.length} circular dependencies detected.` : "No circular dependencies.");
}

module.exports = { runAnalysis };

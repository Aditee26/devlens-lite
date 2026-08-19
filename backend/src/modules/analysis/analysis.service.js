const Analysis   = require("../../models/Analysis");
const { detectTechnologies } = require("../../analyzers/tech.detector");
const { analyzeStructure }   = require("../../analyzers/structure.analyzer");
const { analyzeDependencies }= require("../../analyzers/dependency.analyzer");

async function runAnalysis(repositoryId, userId, localPath) {
  // Delete old analysis for this repo
  await Analysis.deleteMany({ repositoryId });

  // Run analyzers
  const techStack  = detectTechnologies(localPath);
  const structure  = analyzeStructure(localPath);
  const { dependencies, dependencyEdges } = analyzeDependencies(localPath);

  const summary = buildSummary({ techStack, structure, dependencies });

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
    },
    techStack,
    fileTree: structure.fileTree,
    dependencies,
    dependencyEdges,
    summary,
  });

  return analysis;
}

function buildSummary({ techStack, structure, dependencies }) {
  const techs = techStack.slice(0, 5).map((t) => t.name).join(", ");

  return `This repository contains ${structure.totalFiles} files and ${structure.totalLines.toLocaleString()} lines of code. ` +
    `Primary technologies: ${techs || "unknown"}. ` +
    `${dependencies.length} external dependencies detected across ${structure.languageStats.length} language(s).`;
}

module.exports = { runAnalysis };

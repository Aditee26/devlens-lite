const fs   = require("fs");
const path = require("path");

const SRC_EXTS  = new Set([".js",".jsx",".ts",".tsx",".mjs"]);
const SKIP_DIRS = new Set(["node_modules",".git","dist","build",".next","coverage"]);

function collectSrcFiles(dir, files = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return files; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collectSrcFiles(full, files);
    else if (e.isFile() && SRC_EXTS.has(path.extname(e.name))) files.push(full);
  }
  return files;
}

// Simple unused-import heuristic: imported symbol never appears in the rest of the file
function findUnusedImports(content, filePath) {
  const issues = [];
  const lines   = content.split("\n");
  // named imports: import { Foo, Bar } from '...'
  const namedRe = /import\s+\{([^}]+)\}\s+from\s+['"][^'"]+['"]/g;
  let m;
  while ((m = namedRe.exec(content)) !== null) {
    const lineNum = content.slice(0, m.index).split("\n").length;
    const symbols = m[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop().trim()).filter(Boolean);
    for (const sym of symbols) {
      // Count occurrences outside the import line
      const rest = content.slice(m.index + m[0].length);
      const count = (rest.match(new RegExp(`\\b${sym}\\b`, "g")) || []).length;
      if (count === 0 && sym.length > 0) {
        issues.push({ type: "import", file: filePath, line: lineNum, symbol: sym, message: `Unused import '${sym}'` });
      }
    }
  }
  return issues;
}

// Heuristic: exported functions/consts that are never imported elsewhere
function findPotentialDeadCode(content, relPath, allContent) {
  const issues = [];
  // Named exports
  const exportRe = /export\s+(?:function|const|class|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let m;
  while ((m = exportRe.exec(content)) !== null) {
    const sym = m[1];
    const usedElsewhere = allContent.filter((c) => {
      return c.path !== relPath && (c.content.match(new RegExp(`\\b${sym}\\b`)) || []).length > 0;
    });
    if (usedElsewhere.length === 0) {
      const lineNum = content.slice(0, m.index).split("\n").length;
      issues.push({ type: "function", file: relPath, line: lineNum, symbol: sym, message: `'${sym}' exported but not imported anywhere` });
    }
  }
  return issues;
}

function analyzeDeadCode(repoPath) {
  const files = collectSrcFiles(repoPath).slice(0, 200);
  const items = [];

  // Load all file contents once
  const allContent = files.map((f) => {
    try {
      return { path: path.relative(repoPath, f), content: fs.readFileSync(f, "utf8") };
    } catch (_) { return { path: path.relative(repoPath, f), content: "" }; }
  });

  for (const { path: relPath, content } of allContent) {
    if (!content) continue;
    // Unused imports
    const importIssues = findUnusedImports(content, relPath);
    items.push(...importIssues);
    // Dead exports (only in larger repos to avoid false positives on small projects)
    if (allContent.length > 5) {
      const deadExports = findPotentialDeadCode(content, relPath, allContent);
      items.push(...deadExports.slice(0, 3)); // max 3 per file
    }
  }

  return items.slice(0, 100); // cap
}

module.exports = { analyzeDeadCode };

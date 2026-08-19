const fs   = require("fs");
const path = require("path");

const LANG_EXT = {
  ".ts":      { language: "TypeScript", color: "#3178c6" },
  ".tsx":     { language: "TypeScript", color: "#3178c6" },
  ".js":      { language: "JavaScript", color: "#f0db4f" },
  ".jsx":     { language: "JavaScript", color: "#f0db4f" },
  ".mjs":     { language: "JavaScript", color: "#f0db4f" },
  ".cjs":     { language: "JavaScript", color: "#f0db4f" },
  ".py":      { language: "Python",     color: "#3572A5" },
  ".java":    { language: "Java",       color: "#b07219" },
  ".go":      { language: "Go",         color: "#00ADD8" },
  ".rs":      { language: "Rust",       color: "#dea584" },
  ".cpp":     { language: "C++",        color: "#f34b7d" },
  ".c":       { language: "C",          color: "#555555" },
  ".cs":      { language: "C#",        color: "#178600" },
  ".php":     { language: "PHP",        color: "#4F5D95" },
  ".rb":      { language: "Ruby",       color: "#701516" },
  ".swift":   { language: "Swift",      color: "#F05138" },
  ".kt":      { language: "Kotlin",     color: "#A97BFF" },
  ".html":    { language: "HTML",       color: "#e34c26" },
  ".css":     { language: "CSS",        color: "#563d7c" },
  ".scss":    { language: "SCSS",       color: "#c6538c" },
  ".sass":    { language: "Sass",       color: "#c6538c" },
  ".less":    { language: "Less",       color: "#1d365d" },
  ".vue":     { language: "Vue",        color: "#41b883" },
  ".svelte":  { language: "Svelte",     color: "#ff3e00" },
  ".json":    { language: "JSON",       color: "#292929" },
  ".yaml":    { language: "YAML",       color: "#cb171e" },
  ".yml":     { language: "YAML",       color: "#cb171e" },
  ".md":      { language: "Markdown",   color: "#083fa1" },
  ".sh":      { language: "Shell",      color: "#89e051" },
  ".sql":     { language: "SQL",        color: "#e38c00" },
  ".graphql": { language: "GraphQL",    color: "#e535ab" },
  ".dart":    { language: "Dart",       color: "#00B4AB" },
};

const IGNORE_DIRS  = new Set(["node_modules",".git",".next",".nuxt","dist","build","out",".cache","coverage","__pycache__",".pytest_cache","vendor",".venv","venv","target",".idea",".vscode","tmp",".turbo",".vercel",".netlify"]);
const IGNORE_FILES = new Set([".DS_Store","Thumbs.db","package-lock.json","yarn.lock","pnpm-lock.yaml","bun.lockb"]);

function countLines(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8").split("\n").length;
  } catch (_) { return 0; }
}

function buildNode(absPath, relPath, depth, acc, maxDepth = 6) {
  const name = path.basename(absPath);
  const node = { name, type: "dir", path: relPath || name, children: [] };
  if (depth > maxDepth) return node;

  let entries;
  try { entries = fs.readdirSync(absPath, { withFileTypes: true }); }
  catch (_) { return node; }

  entries.sort((a, b) => {
    if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  for (const e of entries) {
    const childAbs = path.join(absPath, e.name);
    const childRel = relPath ? `${relPath}/${e.name}` : e.name;

    if (e.isDirectory()) {
      if (IGNORE_DIRS.has(e.name)) continue;
      acc.folders++;
      node.children.push(buildNode(childAbs, childRel, depth + 1, acc, maxDepth));
    } else if (e.isFile()) {
      if (IGNORE_FILES.has(e.name)) continue;
      acc.files++;
      const ext  = path.extname(e.name).toLowerCase();
      const lang = LANG_EXT[ext];
      let size = 0, lines = 0;
      try {
        size  = fs.statSync(childAbs).size;
        const BINARY_EXTS = new Set([".png",".jpg",".jpeg",".gif",".webp",".ico",".svg",".pdf",".zip",".ttf",".woff",".woff2",".eot",".mp4",".mp3",".wav",".otf"]);
const fileExt = path.extname(e.name).toLowerCase();
if (size < 1_000_000 && !BINARY_EXTS.has(fileExt)) {
  lines = countLines(childAbs); acc.lines += lines;
}
      } catch (_) {}

      if (lang) {
        if (!acc.langMap[lang.language]) acc.langMap[lang.language] = { files: 0, lines: 0, color: lang.color };
        acc.langMap[lang.language].files++;
        acc.langMap[lang.language].lines += lines;
      }
      acc.allFiles.push({ path: childRel, lines, size });
      node.children.push({ name: e.name, type: "file", path: childRel, size, lines, language: lang?.language });
    }
  }
  return node;
}

function analyzeStructure(repoPath) {
  const acc = { files: 0, folders: 0, lines: 0, allFiles: [], langMap: {} };
  const tree = buildNode(repoPath, "", 0, acc);
  tree.name = path.basename(repoPath);
  tree.path = tree.name;

  const largestFiles = [...acc.allFiles].sort((a, b) => b.lines - a.lines).slice(0, 10);
  const totalLangLines = Object.values(acc.langMap).reduce((s, l) => s + l.lines, 0);
  const languageStats  = Object.entries(acc.langMap).map(([language, d]) => ({
    language, files: d.files, lines: d.lines,
    percentage: totalLangLines > 0 ? Math.round((d.lines / totalLangLines) * 100) : 0,
    color: d.color,
  })).sort((a, b) => b.lines - a.lines);

  const avgFileSize = acc.files > 0
    ? Math.round(acc.allFiles.reduce((s, f) => s + f.size, 0) / acc.files)
    : 0;

  return {
    fileTree: tree,
    totalFiles: acc.files,
    totalFolders: acc.folders,
    totalLines: acc.lines,
    avgFileSize,
    largestFiles,
    languageStats,
  };
}

module.exports = { analyzeStructure };

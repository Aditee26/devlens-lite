const fs   = require("fs");
const path = require("path");

const SRC_EXTS = new Set([".js",".jsx",".ts",".tsx",".mjs",".cjs",".vue",".svelte",".dart"]);
const SKIP_DIRS = new Set(["node_modules",".git","dist","build",".next","coverage","vendor"]);

const IMPORT_RE = [
  /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /(?:require|import)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /export\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /^import\s+['"]([^'"]+)['"]/gm,
];

function isRelative(p) { return p.startsWith("./") || p.startsWith("../"); }

function resolveImport(fromFile, importPath, root) {
  const dir = path.dirname(fromFile);
  const abs = path.resolve(dir, importPath);
  for (const ext of ["",".js",".jsx",".ts",".tsx","/index.js","/index.jsx","/index.ts","/index.tsx"]) {
    const c = abs + ext;
    try { if (fs.statSync(c).isFile()) return path.relative(root, c); } catch (_) {}
  }
  return null;
}

function collectFiles(dir, files = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (_) { return files; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    if (e.isDirectory()) collectFiles(path.join(dir, e.name), files);
    else if (e.isFile() && SRC_EXTS.has(path.extname(e.name))) files.push(path.join(dir, e.name));
  }
  return files;
}

function detectCircular(edges) {
  const graph = {};
  for (const { source, target } of edges) {
    if (!graph[source]) graph[source] = [];
    graph[source].push(target);
  }
  const cycles = [];
  const visited = new Set(), inStack = new Set();

  function dfs(node, stack) {
    visited.add(node); inStack.add(node);
    for (const neighbour of (graph[node] || [])) {
      if (!visited.has(neighbour)) dfs(neighbour, [...stack, neighbour]);
      else if (inStack.has(neighbour)) {
        const cycleStart = stack.indexOf(neighbour);
        if (cycleStart !== -1) {
          cycles.push(stack.slice(cycleStart).join(" → "));
        }
      }
    }
    inStack.delete(node);
  }
  for (const node of Object.keys(graph)) {
    if (!visited.has(node)) dfs(node, [node]);
  }
  return [...new Set(cycles)].slice(0, 20);
}

function analyzeDependencies(repoPath) {
  const sourceFiles = collectFiles(repoPath).slice(0, 400);
  const edgeSet     = new Set();
  const edges       = [];
  const externalDeps = new Set();

  for (const absFile of sourceFiles) {
    let content;
    try { content = fs.readFileSync(absFile, "utf8"); } catch (_) { continue; }
    const relSrc = path.relative(repoPath, absFile);

    for (const re of IMPORT_RE) {
      const regex = new RegExp(re.source, re.flags);
      let m;
      while ((m = regex.exec(content)) !== null) {
        const imp = m[1];
        if (!imp) continue;
        if (isRelative(imp)) {
          const resolved = resolveImport(absFile, imp, repoPath);
          if (resolved && resolved !== relSrc) {
            const key = `${relSrc}→${resolved}`;
            if (!edgeSet.has(key)) { edgeSet.add(key); edges.push({ source: relSrc, target: resolved }); }
          }
        } else {
         const parts = imp.split("/");
// Handle dart: and package: prefixes
if (imp.startsWith("dart:") || imp.startsWith("package:")) {
  const pkgName = parts[0].includes(":") ? `${parts[0]}${parts[1] ? "/" + parts[1] : ""}` : parts[0];
  externalDeps.add(pkgName);
} else {
  const pkg = imp.startsWith("@") ? `${parts[0]}/${parts[1]}` : parts[0];
  if (pkg && !pkg.startsWith("node:") && !pkg.startsWith("#")) externalDeps.add(pkg);
}
        }
      }
    }
  }

  const limitedEdges  = edges.slice(0, 200);
  const circularDeps  = detectCircular(limitedEdges);

  return {
    dependencies: [...externalDeps].sort(),
    dependencyEdges: limitedEdges,
    circularDeps,
  };
}

module.exports = { analyzeDependencies };

const fs   = require("fs");
const path = require("path");

const PATTERNS = [
  { type: "Hardcoded API Key",     severity: "critical", re: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][a-zA-Z0-9_\-]{20,}['"]/gi,        msg: "Hardcoded API key detected" },
  { type: "AWS Access Key",        severity: "critical", re: /AKIA[0-9A-Z]{16}/g,                                                       msg: "AWS access key ID found" },
  { type: "Private Key",           severity: "critical", re: /-----BEGIN\s(?:RSA\s)?PRIVATE KEY-----/g,                                 msg: "Private key material in source" },
  { type: "GitHub Token",          severity: "critical", re: /gh[pousr]_[A-Za-z0-9_]{36,}/g,                                            msg: "GitHub personal access token found" },
  { type: "Hardcoded Password",    severity: "high",     re: /(?:password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/gi,                    msg: "Hardcoded password detected" },
  { type: "JWT Secret",            severity: "high",     re: /jwt[_-]?secret\s*[:=]\s*['"][^'"]{8,}['"]/gi,                             msg: "JWT secret hardcoded in source" },
  { type: "DB Connection String",  severity: "high",     re: /(?:mongodb|postgres|mysql|redis):\/\/[^:]+:[^@\s]+@/gi,                   msg: "DB connection string with credentials" },
  { type: "Google API Key",        severity: "high",     re: /AIza[0-9A-Za-z\-_]{35}/g,                                                 msg: "Google API key detected" },
  { type: "Slack Token",           severity: "high",     re: /xox[baprs]-[A-Za-z0-9-]{10,}/g,                                           msg: "Slack token detected" },
  { type: "eval() Usage",          severity: "medium",   re: /\beval\s*\(/g,                                                             msg: "eval() usage is a security risk" },
  { type: "innerHTML Assignment",  severity: "medium",   re: /\.innerHTML\s*=/g,                                                         msg: "innerHTML assignment may enable XSS" },
  { type: "document.write",        severity: "medium",   re: /document\.write\s*\(/g,                                                    msg: "document.write() is unsafe" },
  { type: "Insecure Random",       severity: "low",      re: /Math\.random\s*\(\)/g,                                                     msg: "Math.random() is not cryptographically secure" },
  { type: "Console.log Leak",      severity: "low",      re: /console\.log\s*\([^)]*(?:password|token|secret|key)[^)]*\)/gi,            msg: "Possible credential leak via console.log" },
  { type: "TODO Security",         severity: "low",      re: /TODO[:\s].*(?:security|auth|password|secret|hack)/gi,                     msg: "Unresolved security-related TODO" },
];

const SCAN_EXTS = new Set([".js",".jsx",".ts",".tsx",".mjs",".cjs",".py",".rb",".php",".java",".go",".rs",".env"]);
const SKIP_DIRS = new Set(["node_modules",".git","dist","build","coverage",".next","vendor"]);
const PLACEHOLDERS = ["example","your_","placeholder","xxx","changeme","replace","todo","secret_here","key_here","<",">>>"];

function shouldScan(p) {
  const b = path.basename(p).toLowerCase();
  if (b.startsWith(".env")) return true;
  return SCAN_EXTS.has(path.extname(p).toLowerCase());
}

function isPlaceholder(str) {
  const s = str.toLowerCase();
  return PLACEHOLDERS.some((p) => s.includes(p));
}

function scanDir(dir, root, findings) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) scanDir(full, root, findings);
    else if (e.isFile() && shouldScan(full)) {
      let content;
      try {
        if (fs.statSync(full).size > 500_000) continue;
        content = fs.readFileSync(full, "utf8");
      } catch (_) { continue; }
      const rel = path.relative(root, full);
      for (const pat of PATTERNS) {
        const re = new RegExp(pat.re.source, pat.re.flags);
        let m;
        while ((m = re.exec(content)) !== null) {
          if (!isPlaceholder(m[0])) {
            findings.push({ severity: pat.severity, type: pat.type, file: rel, message: pat.msg });
            break; // one finding per pattern per file
          }
        }
      }
    }
  }
}

function analyzeSecurityIssues(repoPath) {
  const findings = [];
  scanDir(repoPath, repoPath, findings);
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return findings.sort((a, b) => order[a.severity] - order[b.severity]);
}

module.exports = { analyzeSecurityIssues };

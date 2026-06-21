const fs   = require("fs");
const path = require("path");

const SIGNATURES = [
  {
  name: "Flutter",
  category: "frontend",
  packages: [],
  files: ["pubspec.yaml", "pubspec.lock"],
},
{
  name: "Dart",
  category: "language",
  packages: [],
  files: ["pubspec.yaml", "lib/main.dart"],
},
{
  name: "Firebase",
  category: "database",
  packages: [],
  files: ["firebase.json", "firestore.rules", "google-services.json"],
},
{
  name: "Firestore",
  category: "database",
  packages: [],
  files: ["firestore.rules"],
},
  { name: "React",       category: "frontend", packages: ["react"] },
  { name: "Next.js",     category: "frontend", packages: ["next"], files: ["next.config.js","next.config.ts","next.config.mjs"] },
  { name: "Vue",         category: "frontend", packages: ["vue"], files: ["vue.config.js"] },
  { name: "Angular",     category: "frontend", packages: ["@angular/core"], files: ["angular.json"] },
  { name: "Svelte",      category: "frontend", packages: ["svelte"], files: ["svelte.config.js"] },
  { name: "Nuxt",        category: "frontend", packages: ["nuxt"], files: ["nuxt.config.ts","nuxt.config.js"] },
  { name: "Remix",       category: "frontend", packages: ["@remix-run/node"] },
  { name: "Astro",       category: "frontend", packages: ["astro"], files: ["astro.config.mjs"] },
  { name: "TypeScript",  category: "language", packages: ["typescript"], files: ["tsconfig.json"] },
  { name: "JavaScript",  category: "language", files: ["package.json"] },
  { name: "Express",     category: "backend",  packages: ["express"] },
  { name: "Fastify",     category: "backend",  packages: ["fastify"] },
  { name: "NestJS",      category: "backend",  packages: ["@nestjs/core"] },
  { name: "Hapi",        category: "backend",  packages: ["@hapi/hapi"] },
  { name: "Koa",         category: "backend",  packages: ["koa"] },
  { name: "Hono",        category: "backend",  packages: ["hono"] },
  { name: "MongoDB",     category: "database", packages: ["mongoose","mongodb"] },
  { name: "PostgreSQL",  category: "database", packages: ["pg","postgres","typeorm"] },
  { name: "MySQL",       category: "database", packages: ["mysql2","mysql"] },
  { name: "SQLite",      category: "database", packages: ["better-sqlite3","sqlite3"] },
  { name: "Prisma",      category: "database", packages: ["prisma","@prisma/client"], files: ["prisma/schema.prisma"] },
  { name: "Redis",       category: "database", packages: ["redis","ioredis"] },
  { name: "Supabase",    category: "database", packages: ["@supabase/supabase-js"] },
  { name: "Firebase",    category: "database", packages: ["firebase","firebase-admin"] },
  { name: "GraphQL",     category: "backend",  packages: ["graphql","apollo-server","@apollo/server"] },
  { name: "Tailwind CSS",category: "frontend", packages: ["tailwindcss"], files: ["tailwind.config.js","tailwind.config.ts"] },
  { name: "Vite",        category: "tool",     packages: ["vite"],    files: ["vite.config.ts","vite.config.js"] },
  { name: "Webpack",     category: "tool",     packages: ["webpack"], files: ["webpack.config.js"] },
  { name: "Docker",      category: "tool",     files: ["Dockerfile","docker-compose.yml","docker-compose.yaml"] },
  { name: "Jest",        category: "tool",     packages: ["jest"] },
  { name: "Vitest",      category: "tool",     packages: ["vitest"] },
  { name: "ESLint",      category: "tool",     packages: ["eslint"], files: [".eslintrc.js",".eslintrc.json"] },
  { name: "Prettier",    category: "tool",     packages: ["prettier"], files: [".prettierrc",".prettierrc.json"] },
  { name: "Zustand",     category: "frontend", packages: ["zustand"] },
  { name: "Redux",       category: "frontend", packages: ["@reduxjs/toolkit","redux"] },
  { name: "React Query", category: "frontend", packages: ["@tanstack/react-query","react-query"] },
  { name: "Zod",         category: "tool",     packages: ["zod"] },
  { name: "Python",      category: "language", files: ["requirements.txt","setup.py","pyproject.toml","Pipfile"] },
  { name: "Java",        category: "language", files: ["pom.xml","build.gradle"] },
  { name: "Go",          category: "language", files: ["go.mod"] },
  { name: "Rust",        category: "language", files: ["Cargo.toml"] },
  { name: "Ruby",        category: "language", files: ["Gemfile"] },
  { name: "PHP",         category: "language", files: ["composer.json"] },
];

function detectTechnologies(repoPath) {
  const results = [];
  const detected = new Set();

  let pkg = { dependencies: {}, devDependencies: {} };
  const pkgPath = path.join(repoPath, "package.json");
  if (fs.existsSync(pkgPath)) {
    try { pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")); } catch (_) {}
  }
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  for (const sig of SIGNATURES) {
    if (detected.has(sig.name)) continue;
    let confidence = 0;
    let version;

    if (sig.packages) {
      for (const p of sig.packages) {
        if (allDeps[p]) {
          confidence = Math.max(confidence, 95);
          version = allDeps[p].replace(/[^0-9.]/, "").split(" ")[0] || undefined;
          break;
        }
      }
    }
    if (sig.files) {
      for (const f of sig.files) {
        if (fs.existsSync(path.join(repoPath, f))) {
          confidence = Math.max(confidence, 80);
          break;
        }
      }
    }
    if (confidence > 0) {
      detected.add(sig.name);
      results.push({ name: sig.name, category: sig.category, confidence, version });
    }
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

module.exports = { detectTechnologies };

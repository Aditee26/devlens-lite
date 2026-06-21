const path     = require("path");
const fsExtra  = require("fs-extra");
const simpleGit= require("simple-git");
const Repository = require("../../models/Repository");
const AppError   = require("../../shared/AppError");
const { runAnalysis } = require("../analysis/analysis.service");

function parseGithubUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length < 2) return null;
    return { owner: parts[0], name: parts[1] };
  } catch (_) { return null; }
}

class RepoService {
  async list(userId) {
    return Repository.find({ userId }).sort({ createdAt: -1 }).populate("analysisId").lean();
  }

  async create(userId, githubUrl) {
    const parsed = parseGithubUrl(githubUrl);
    if (!parsed) throw new AppError("Invalid GitHub repository URL", 400);

    const existing = await Repository.findOne({ userId, githubUrl });
    if (existing) {
      // Re-trigger analysis if it errored or is stale
      if (existing.status === "error") {
        return this.triggerAnalysis(existing._id, userId);
      }
      return existing;
    }

    const repo = await Repository.create({
      userId,
      name:      parsed.name,
      owner:     parsed.owner,
      fullName:  `${parsed.owner}/${parsed.name}`,
      githubUrl,
      status:    "pending",
    });

    // Kick off async (do NOT await – respond immediately)
    this._runPipeline(repo._id, userId).catch((err) => {
      console.error(`[RepoService] Pipeline failed for ${repo._id}:`, err.message);
    });

    return repo;
  }

  async get(id, userId) {
    const repo = await Repository.findOne({ _id: id, userId }).populate("analysisId").lean();
    if (!repo) throw new AppError("Repository not found", 404);
    return repo;
  }

  async remove(id, userId) {
    const repo = await Repository.findOne({ _id: id, userId });
    if (!repo) throw new AppError("Repository not found", 404);
    // Clean up local clone
    if (repo.localPath) {
      await fsExtra.remove(repo.localPath).catch(() => {});
    }
    await Repository.deleteOne({ _id: id });
  }

  async triggerAnalysis(id, userId) {
    const repo = await Repository.findOne({ _id: id, userId });
    if (!repo) throw new AppError("Repository not found", 404);
    if (repo.status === "cloning" || repo.status === "analyzing") {
      return repo;
    }
    await Repository.findByIdAndUpdate(id, { status: "pending", progress: 0, statusMessage: "" });
    this._runPipeline(id, userId).catch((err) => {
      console.error(`[RepoService] Re-analysis failed for ${id}:`, err.message);
    });
    return Repository.findById(id).lean();
  }

  async getStatus(id, userId) {
    const repo = await Repository.findOne({ _id: id, userId }).select("status statusMessage progress analysisId").lean();
    if (!repo) throw new AppError("Repository not found", 404);
    return repo;
  }

  // ─── Internal pipeline ──────────────────────────────────────────────────────
  async _runPipeline(repoId, userId) {
    const cloneDir = process.env.CLONE_DIR || "/tmp/repos";
    let localPath;

    try {
      // 1. Fetch repo doc
      const repo = await Repository.findById(repoId);
      if (!repo) return;

      localPath = path.join(cloneDir, `${repo.owner}_${repo.name}_${repoId}`);
      await fsExtra.ensureDir(localPath);

      // 2. Clone
      await Repository.findByIdAndUpdate(repoId, { status: "cloning", progress: 10, statusMessage: "Cloning repository…", localPath });

      if (await fsExtra.pathExists(path.join(localPath, ".git"))) {
        const git = simpleGit(localPath);
        await git.pull();
      } else {
        await fsExtra.emptyDir(localPath);
        const git = simpleGit();
        await git.clone(repo.githubUrl, localPath, ["--depth", "1"]);
      }

      await Repository.findByIdAndUpdate(repoId, { status: "analyzing", progress: 40, statusMessage: "Analyzing repository…" });

      // 3. Run full analysis
      const analysis = await runAnalysis(repoId, userId, localPath);

      // 4. Mark complete
      await Repository.findByIdAndUpdate(repoId, {
        status: "complete",
        progress: 100,
        statusMessage: "Analysis complete",
        analysisId: analysis._id,
        lastAnalyzedAt: new Date(),
        localPath,
      });

    } catch (err) {
      console.error("[Pipeline] Error:", err.message);
      await Repository.findByIdAndUpdate(repoId, {
        status: "error",
        progress: 0,
        statusMessage: err.message.slice(0, 200),
      });
    }
  }
}

module.exports = RepoService;

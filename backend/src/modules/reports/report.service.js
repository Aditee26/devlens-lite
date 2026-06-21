const path     = require("path");
const fsExtra  = require("fs-extra");
const PDFDocument = require("pdfkit");
const Report     = require("../../models/Report");
const Repository = require("../../models/Repository");
const Analysis   = require("../../models/Analysis");
const AppError   = require("../../shared/AppError");

const REPORTS_DIR = path.join(process.cwd(), "data", "reports");

class ReportService {
  async list(userId) {
    return Report.find({ userId })
      .populate("repositoryId", "name owner fullName")
      .sort({ createdAt: -1 })
      .lean();
  }

  async generate(userId, repositoryId, format) {
    const repo = await Repository.findOne({ _id: repositoryId, userId });
    if (!repo) throw new AppError("Repository not found", 404);

    const analysis = await Analysis.findOne({ repositoryId }).sort({ createdAt: -1 }).lean();
    if (!analysis) throw new AppError("No analysis available – run analysis first", 400);

    await fsExtra.ensureDir(REPORTS_DIR);

    const timestamp = Date.now();
    const filename  = `devlens_${repo.name}_${timestamp}.${format}`;
    const filePath  = path.join(REPORTS_DIR, filename);

    let size = 0;
    if (format === "json") {
      size = await this._writeJson(filePath, repo, analysis);
    } else {
      size = await this._writePdf(filePath, repo, analysis);
    }

    const report = await Report.create({
      repositoryId, userId, analysisId: analysis._id,
      format, filename, filePath, size,
    });

    return report;
  }

  async download(id, userId, res) {
    const report = await Report.findOne({ _id: id, userId });
    if (!report) throw new AppError("Report not found", 404);

    const exists = await fsExtra.pathExists(report.filePath);
    if (!exists) throw new AppError("Report file no longer exists", 404);

    await Report.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });

    const contentType = report.format === "pdf" ? "application/pdf" : "application/json";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${report.filename}"`);
    res.sendFile(report.filePath);
  }

  async remove(id, userId) {
    const report = await Report.findOne({ _id: id, userId });
    if (!report) throw new AppError("Report not found", 404);
    await fsExtra.remove(report.filePath).catch(() => {});
    await Report.deleteOne({ _id: id });
  }

  // ─── JSON ──────────────────────────────────────────────────────────────────
  async _writeJson(filePath, repo, analysis) {
    const data = {
      generatedAt: new Date().toISOString(),
      repository: {
        name: repo.fullName,
        url:  repo.githubUrl,
        description: repo.description,
        defaultBranch: repo.defaultBranch,
        language: repo.language,
      },
      metrics: analysis.metrics,
      techStack: analysis.techStack,
      dependencies: analysis.dependencies,
      securityFindings: analysis.securityFindings,
      deadCode: analysis.deadCode.slice(0, 50),
      summary: analysis.summary,
    };
    const json = JSON.stringify(data, null, 2);
    await fsExtra.writeFile(filePath, json, "utf8");
    return Buffer.byteLength(json);
  }

  // ─── PDF ──────────────────────────────────────────────────────────────────
  _writePdf(filePath, repo, analysis) {
    return new Promise((resolve, reject) => {
      const doc  = new PDFDocument({ margin: 50, size: "A4" });
      const dest = fsExtra.createWriteStream(filePath);
      let size   = 0;

      doc.pipe(dest);
      doc.on("data", (chunk) => { size += chunk.length; });
      dest.on("error", reject);
      dest.on("finish", () => resolve(size));

      const m = analysis.metrics || {};
      const { r, g, b } = { r: 99, g: 102, b: 241 }; // indigo

      // ── Title ──
      doc.rect(0, 0, doc.page.width, 120).fill(`rgb(${r},${g},${b})`);
      doc.fillColor("white").fontSize(28).font("Helvetica-Bold").text("DevLens Lite", 50, 40);
      doc.fontSize(12).font("Helvetica").text("Repository Intelligence Report", 50, 76);
      doc.moveDown(3);

      doc.fillColor("#111").fontSize(18).font("Helvetica-Bold").text(repo.fullName, { underline: true });
      doc.fontSize(10).font("Helvetica").fillColor("#555").text(repo.githubUrl);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      const line = () => {
        doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor("#ddd").stroke();
        doc.moveDown(0.5);
      };

      // ── Summary ──
      doc.fillColor("#111").fontSize(14).font("Helvetica-Bold").text("Summary");
      line();
      doc.fontSize(10).font("Helvetica").fillColor("#333").text(analysis.summary || "N/A");
      doc.moveDown();

      // ── Metrics ──
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#111").text("Repository Metrics");
      line();
      const metricRows = [
        ["Total Files",      m.totalFiles || 0],
        ["Total Folders",    m.totalFolders || 0],
        ["Lines of Code",    (m.totalLines || 0).toLocaleString()],
        ["Avg File Size",    `${Math.round((m.avgFileSize || 0) / 1024)} KB`],
        ["Complexity Score", `${m.complexityScore || 0}/100`],
        ["Technical Debt",   `${m.technicalDebt || 0}/100`],
      ];
      for (const [k, v] of metricRows) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#555").text(`${k}:`, { continued: true, width: 160 });
        doc.font("Helvetica").fillColor("#111").text(String(v));
      }
      doc.moveDown();

      // ── Tech Stack ──
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#111").text("Technology Stack");
      line();
      for (const t of (analysis.techStack || []).slice(0, 12)) {
        doc.fontSize(10).fillColor("#333").text(`• ${t.name} (${t.category}) – ${t.confidence}% confidence`);
      }
      doc.moveDown();

      // ── Languages ──
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#111").text("Languages");
      line();
      for (const l of (m.languageStats || []).slice(0, 10)) {
        doc.fontSize(10).fillColor("#333").text(`• ${l.language}: ${l.files} files, ${l.lines.toLocaleString()} lines (${l.percentage}%)`);
      }
      doc.moveDown();

      // ── Security ──
      if ((analysis.securityFindings || []).length > 0) {
        doc.fontSize(14).font("Helvetica-Bold").fillColor("#111").text("Security Findings");
        line();
        for (const f of (analysis.securityFindings || []).slice(0, 15)) {
          const sev = f.severity.toUpperCase();
          doc.fontSize(10).fillColor(f.severity === "critical" ? "#dc2626" : f.severity === "high" ? "#ea580c" : "#ca8a04")
            .text(`[${sev}] ${f.type}`, { continued: true });
          doc.fillColor("#555").text(` – ${f.file}`);
          doc.fillColor("#333").text(`  ${f.message}`, { indent: 10 });
        }
        doc.moveDown();
      }

      // ── Dependencies ──
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#111").text("Dependencies");
      line();
      const deps = (analysis.dependencies || []).slice(0, 30);
      doc.fontSize(10).fillColor("#333").text(deps.join("  •  ") || "None detected");

      doc.end();
    });
  }
}

module.exports = ReportService;

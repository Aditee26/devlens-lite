const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatSession = require("../../models/ChatSession");
const Repository  = require("../../models/Repository");
const Analysis    = require("../../models/Analysis");
const AppError    = require("../../shared/AppError");

function buildSystemPrompt(repo, analysis) {
  const techs = (analysis?.techStack || []).map((t) => `${t.name} (${t.category})`).join(", ");
  const metrics = analysis?.metrics || {};
  const secCount = (analysis?.securityFindings || []).length;
  const deadCount = (analysis?.deadCode || []).length;

  return `You are DevLens AI, an expert code analyst assistant for the repository "${repo.fullName}".

REPOSITORY CONTEXT:
- URL: ${repo.githubUrl}
- Description: ${repo.description || "Not provided"}
- Default Branch: ${repo.defaultBranch}

ANALYSIS RESULTS:
- Total Files: ${metrics.totalFiles || 0}
- Total Lines of Code: ${(metrics.totalLines || 0).toLocaleString()}
- Tech Stack: ${techs || "Unknown"}
- Complexity Score: ${metrics.complexityScore || 0}/100
- Technical Debt: ${metrics.technicalDebt || 0}/100
- Security Findings: ${secCount}
- Dead Code Items: ${deadCount}
- Languages: ${(metrics.languageStats || []).map((l) => `${l.language} ${l.percentage}%`).join(", ")}
- Top Dependencies: ${(analysis?.dependencies || []).slice(0, 15).join(", ")}

SUMMARY: ${analysis?.summary || ""}

Answer questions about this repository accurately and concisely. 
If you don't know something specific, say so rather than guessing.
Format code examples with proper markdown code blocks.
Be helpful, direct, and technically precise.`;
}

class ChatService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
  }

  async listSessions(repoId, userId) {
    return ChatSession.find({ repositoryId: repoId, userId })
      .select("-messages")
      .sort({ updatedAt: -1 })
      .lean();
  }

  async createSession(repositoryId, userId) {
    const repo = await Repository.findOne({ _id: repositoryId, userId });
    if (!repo) throw new AppError("Repository not found", 404);

    const session = await ChatSession.create({
      repositoryId,
      userId,
      title: `Chat – ${repo.name}`,
    });
    return session;
  }

  async getSession(id, userId) {
    const session = await ChatSession.findOne({ _id: id, userId }).lean();
    if (!session) throw new AppError("Chat session not found", 404);
    return session;
  }

  async deleteSession(id, userId) {
    const session = await ChatSession.findOne({ _id: id, userId });
    if (!session) throw new AppError("Chat session not found", 404);
    await ChatSession.deleteOne({ _id: id });
  }

  async sendMessage(sessionId, userId, userMessage) {
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) throw new AppError("Chat session not found", 404);

    const repo = await Repository.findById(session.repositoryId);
    if (!repo) throw new AppError("Repository not found", 404);

    const analysis = await Analysis.findOne({ repositoryId: repo._id }).sort({ createdAt: -1 }).lean();

    // Store user message
    session.messages.push({ role: "user", content: userMessage });

    let aiResponse;

    if (!this.model) {
      // Fallback when no API key
      aiResponse = this._fallbackResponse(userMessage, repo, analysis);
    } else {
      try {
        const systemPrompt = buildSystemPrompt(repo, analysis);
        const history = session.messages.slice(-10).slice(0, -1).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        }));

        const chat = this.model.startChat({
          history,
          systemInstruction: systemPrompt,
        });

        const result = await chat.sendMessage(userMessage);
        aiResponse = result.response.text();
      } catch (err) {
        console.error("[ChatService] Gemini error:", err.message);
        aiResponse = `I encountered an error: ${err.message}. Please check your Gemini API key.`;
      }
    }

    session.messages.push({ role: "assistant", content: aiResponse });
    session.tokenCount += Math.ceil((userMessage.length + aiResponse.length) / 4);
    await session.save();

    return {
      userMessage,
      aiResponse,
      sessionId: session._id,
    };
  }

  _fallbackResponse(message, repo, analysis) {
    const lower = message.toLowerCase();
    const techs = (analysis?.techStack || []).map((t) => t.name).join(", ");
    const metrics = analysis?.metrics || {};

    if (lower.includes("tech") || lower.includes("stack") || lower.includes("framework")) {
      return `**${repo.fullName}** uses the following technologies:\n\n${(analysis?.techStack || []).map((t) => `- **${t.name}** (${t.category}) – ${t.confidence}% confidence`).join("\n") || "No technologies detected yet."}`;
    }
    if (lower.includes("metric") || lower.includes("size") || lower.includes("lines")) {
      return `**Repository Metrics for ${repo.fullName}:**\n\n- Total Files: **${metrics.totalFiles || 0}**\n- Total Lines: **${(metrics.totalLines || 0).toLocaleString()}**\n- Complexity Score: **${metrics.complexityScore || 0}/100**\n- Technical Debt: **${metrics.technicalDebt || 0}/100**`;
    }
    if (lower.includes("security") || lower.includes("vulnerab")) {
      const findings = analysis?.securityFindings || [];
      if (!findings.length) return "No security issues were detected in this repository.";
      return `**Security Findings (${findings.length} total):**\n\n${findings.slice(0, 5).map((f) => `- 🔴 **${f.type}** in \`${f.file}\`: ${f.message}`).join("\n")}`;
    }
    if (lower.includes("depend")) {
      const deps = analysis?.dependencies || [];
      return `**Dependencies (${deps.length} external packages):**\n\n${deps.slice(0, 20).map((d) => `- \`${d}\``).join("\n")}`;
    }
    if (lower.includes("summar") || lower.includes("overview") || lower.includes("what")) {
      return analysis?.summary || `**${repo.fullName}** – ${techs ? `Built with ${techs}.` : "Analysis pending."} ${metrics.totalFiles || 0} files, ${(metrics.totalLines || 0).toLocaleString()} lines of code.`;
    }

    return `I'm DevLens AI. To get full AI responses, add your **GEMINI_API_KEY** to the environment.\n\nMeanwhile, here's what I know about **${repo.fullName}**:\n- Technologies: ${techs || "unknown"}\n- Files: ${metrics.totalFiles || 0}\n- Lines: ${(metrics.totalLines || 0).toLocaleString()}`;
  }
}

module.exports = ChatService;

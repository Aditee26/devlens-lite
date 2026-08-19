const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatSession = require("../../models/ChatSession");
const Repository  = require("../../models/Repository");
const Analysis    = require("../../models/Analysis");
const AppError    = require("../../shared/AppError");

function buildSystemPrompt(repo, analysis) {
  const techs = (analysis?.techStack || []).map((t) => `${t.name} (${t.category})`).join(", ");
  const metrics = analysis?.metrics || {};

  return `You are DevLens AI, an expert code analyst assistant for the repository "${repo.fullName}".

REPOSITORY CONTEXT:
- URL: ${repo.githubUrl}
- Description: ${repo.description || "Not provided"}
- Default Branch: ${repo.defaultBranch}

ANALYSIS RESULTS:
- Total Files: ${metrics.totalFiles || 0}
- Total Lines of Code: ${(metrics.totalLines || 0).toLocaleString()}
- Tech Stack: ${techs || "Unknown"}
- Languages: ${(metrics.languageStats || []).map((l) => `${l.language} ${l.percentage}%`).join(", ")}
- Top Dependencies: ${(analysis?.dependencies || []).slice(0, 15).join(", ")}

SUMMARY: ${analysis?.summary || ""}

Answer questions about this repository accurately and concisely. 
If you don't know something specific, say so rather than guessing.
Format code examples with proper markdown code blocks.
Be helpful, direct, and technically precise.`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini returns 503 ("high demand") intermittently under load — this is a
// transient, account-independent condition, not a config problem. Retrying
// briefly with backoff resolves the vast majority of these automatically.
function isRetryable(err) {
  const msg = (err?.message || "").toLowerCase();
  return err?.status === 503 || msg.includes("503") || msg.includes("overloaded") || msg.includes("high demand");
}

class ChatService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Primary model, plus a stable fallback used only if the primary
      // keeps returning 503s after retrying.
      this.model         = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      this.fallbackModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
  }

  // Tries `model`, retrying transient 503s with exponential backoff
  // (attempts at 0s, ~1s, ~2s). Rethrows on the final failure so the caller
  // can decide whether to fall back to a different model.
  async _sendWithRetry(model, { history, systemInstruction, userMessage }, maxAttempts = 3) {
    let lastErr;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const chat = model.startChat({ history, systemInstruction });
        const result = await chat.sendMessage(userMessage);
        return result.response.text();
      } catch (err) {
        lastErr = err;
        if (!isRetryable(err) || attempt === maxAttempts - 1) throw err;
        await sleep(500 * 2 ** attempt + Math.random() * 250);
      }
    }
    throw lastErr;
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
      const systemPrompt = buildSystemPrompt(repo, analysis);
      const history = session.messages.slice(-10).slice(0, -1).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
      const request = {
        history,
        systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
        userMessage,
      };

      try {
        aiResponse = await this._sendWithRetry(this.model, request);
      } catch (primaryErr) {
        if (isRetryable(primaryErr)) {
          // Primary model is still overloaded after retries — try the
          // fallback model once before giving up.
          try {
            console.warn("[ChatService] Primary model overloaded, trying fallback:", primaryErr.message);
            aiResponse = await this._sendWithRetry(this.fallbackModel, request, 1);
          } catch (fallbackErr) {
            console.error("[ChatService] Gemini error (fallback also failed):", fallbackErr.message);
            aiResponse = "The AI model is experiencing high demand right now. Please try again in a moment.";
          }
        } else {
          console.error("[ChatService] Gemini error:", primaryErr.message);
          aiResponse = `I encountered an error: ${primaryErr.message}. Please check your Gemini API key.`;
        }
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
      return `**Repository Metrics for ${repo.fullName}:**\n\n- Total Files: **${metrics.totalFiles || 0}**\n- Total Lines: **${(metrics.totalLines || 0).toLocaleString()}**\n- Languages: **${(metrics.languageStats || []).length}**`;
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
import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Plus, Trash2, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChatSessions, useChatSession, useCreateSession, useDeleteSession, useSendMessage } from "../../hooks/useChat";
import { useRepository } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatRelative } from "../../utils/format";
import { cn } from "../../utils/cn";

const SUGGESTIONS = [
  "How does authentication work?",
  "What technologies are used?",
  "Where is the database connection?",
  "How does the frontend talk to the backend?",
  "Explain the project structure",
  "What are the main dependencies?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-semibold",
        isUser ? "bg-ink-800 dark:bg-ink-100 text-white dark:text-ink-900" : "border border-line dark:border-line-dark text-ink-500"
      )}>
        {isUser ? "Y" : "AI"}
      </div>
      <div className={cn(
        "max-w-[80%] px-4 py-2.5 text-sm",
        isUser
          ? "bg-ink-800 dark:bg-ink-100 text-white dark:text-ink-900"
          : "border border-line dark:border-line-dark text-ink-800 dark:text-ink-100"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-ink-900 prose-code:text-ink-700 dark:prose-code:text-ink-200">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        <p className={cn("text-[10px] mt-1.5 opacity-60", isUser ? "text-right" : "text-left")}>
          {formatRelative(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ChatWindow({ sessionId }) {
  const { data: session, isLoading } = useChatSession(sessionId);
  const sendMessage = useSendMessage(sessionId);
  const [input, setInput] = useState("");
  const [localMsgs, setLocalMsgs] = useState([]);
  const endRef = useRef(null);

  const messages = session?.messages || [];
  const allMsgs  = [...messages, ...localMsgs];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMsgs, sendMessage.isPending]);

  function send(text) {
    const msg = text || input.trim();
    if (!msg || sendMessage.isPending) return;
    setInput("");
    setLocalMsgs([]);
    sendMessage.mutate(msg, { onSuccess: () => setLocalMsgs([]) });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : allMsgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
            <div className="text-center">
              <p className="font-medium text-ink-800 dark:text-ink-100 mb-1">Ask anything about this repo</p>
              <p className="text-sm text-ink-400">Get AI-powered insights about architecture, code, and more</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-sm px-3 py-2 border border-line dark:border-line-dark hover:border-ink-400 dark:hover:border-ink-500 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          allMsgs.map((msg, i) => <Message key={msg._id || i} msg={msg} />)
        )}
        {sendMessage.isPending && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full border border-line dark:border-line-dark flex items-center justify-center flex-shrink-0 text-[10px] text-ink-400">AI</div>
            <div className="border border-line dark:border-line-dark px-4 py-3">
              <Spinner size="sm" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-line dark:border-line-dark">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about this repository… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="input resize-none flex-1 py-2.5 leading-snug"
            disabled={sendMessage.isPending}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || sendMessage.isPending}
            className="btn-primary px-4 self-end"
          >
            {sendMessage.isPending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { id } = useParams();
  const { data: sessions = [], isLoading: sessionsLoading } = useChatSessions(id);
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession();
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    if (sessions.length > 0 && !activeSession) {
      setActiveSession(sessions[0]._id);
    }
  }, [sessions, activeSession]);

  async function handleNewSession() {
    createSession.mutate(id, {
      onSuccess: (data) => setActiveSession(data.data.session._id),
    });
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex h-full border border-line dark:border-line-dark">
        {/* Sessions */}
        <div className="w-52 flex-shrink-0 border-r border-line dark:border-line-dark flex flex-col">
          <div className="p-3 border-b border-line dark:border-line-dark flex items-center gap-2">
            <Link to={`/repositories/${id}`} className="p-1 text-ink-400 hover:text-ink-800 dark:hover:text-ink-100 flex-shrink-0">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <p className="text-xs font-medium text-ink-600 dark:text-ink-300 truncate flex-1">AI chat</p>
            <button onClick={handleNewSession} disabled={createSession.isPending}
              className="p-1 text-ink-500 hover:text-ink-900 dark:hover:text-white flex-shrink-0">
              {createSession.isPending ? <Spinner size="sm" className="!w-3.5 !h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessionsLoading ? (
              <div className="flex justify-center py-4"><Spinner size="sm" /></div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-ink-400 text-center py-4 px-3">No sessions yet. Start a new chat.</p>
            ) : (
              sessions.map((s) => (
                <div key={s._id}
                  className={cn("flex items-center gap-2 px-3 py-2.5 cursor-pointer group border-b border-line dark:border-line-dark transition-colors",
                    activeSession === s._id ? "bg-ink-50 dark:bg-ink-800" : "hover:bg-ink-50/60 dark:hover:bg-ink-800/40"
                  )}
                  onClick={() => setActiveSession(s._id)}
                >
                  <p className="text-xs text-ink-700 dark:text-ink-200 truncate flex-1">{s.title}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession.mutate(s._id); if (activeSession === s._id) setActiveSession(null); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 transition-all text-ink-300"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeSession ? (
            <ChatWindow sessionId={activeSession} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="No chat selected"
                description="Create a new session or select an existing one"
                action={
                  <button onClick={handleNewSession} className="btn-primary">
                    <Plus className="w-4 h-4" /> New chat
                  </button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Bot, User, Plus, Trash2, MessageSquare, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useChatSessions, useChatSession, useCreateSession, useDeleteSession, useSendMessage } from "../../hooks/useChat";
import { useRepository } from "../../hooks/useRepositories";
import Spinner from "../../components/ui/Spinner";
import EmptyState from "../../components/ui/EmptyState";
import { formatRelative } from "../../utils/format";
import { cn } from "../../utils/cn";

const SUGGESTIONS = [
  "What does this repository do?",
  "What technologies are used?",
  "Explain the project structure",
  "Are there any security concerns?",
  "What are the main dependencies?",
  "Explain the authentication flow",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
        isUser ? "bg-brand-600" : "bg-gray-700 dark:bg-gray-800"
      )}>
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-brand-400" />}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "bg-brand-600 text-white rounded-tr-sm"
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-sm"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-gray-900 prose-code:text-brand-400">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
        <p className={cn("text-[10px] mt-1.5 opacity-60", isUser ? "text-right" : "text-left")}>
          {formatRelative(msg.createdAt)}
        </p>
      </div>
    </motion.div>
  );
}

function ChatWindow({ sessionId, repoId }) {
  const { data: session, isLoading } = useChatSession(sessionId);
  const sendMessage = useSendMessage(sessionId);
  const [input, setInput]   = useState("");
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
    sendMessage.mutate(msg, {
      onSuccess: () => setLocalMsgs([]),
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : allMsgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-brand-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 dark:text-white mb-1">Ask anything about this repo</p>
              <p className="text-sm text-gray-500">Get AI-powered insights about architecture, code, and more</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  className="text-left text-sm px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-brand-600/10 hover:text-brand-400 border border-gray-200 dark:border-gray-700 transition-colors">
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
            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                {[0,1,2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-brand-400"
                    animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i*0.15 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="Ask about this repository… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="input resize-none flex-1 py-3 leading-snug"
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
  const { data: repo } = useRepository(id);
  const { data: sessions = [], isLoading: sessionsLoading } = useChatSessions(id);
  const createSession = useCreateSession();
  const deleteSession = useDeleteSession();
  const [activeSession, setActiveSession] = useState(null);

  // Auto-select first session
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-8rem)]">
      <div className="flex h-full gap-0 card overflow-hidden">
        {/* Sidebar – sessions */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50 dark:bg-gray-900/50">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <Link to={`/repositories/${id}`} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 flex-shrink-0">
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate flex-1">AI Chat</p>
            <button onClick={handleNewSession} disabled={createSession.isPending}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-brand-500 flex-shrink-0">
              {createSession.isPending ? <Spinner size="sm" className="!w-3.5 !h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessionsLoading ? (
              <div className="flex justify-center py-4"><Spinner size="sm" /></div>
            ) : sessions.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4 px-2">No sessions yet. Start a new chat.</p>
            ) : (
              sessions.map((s) => (
                <div key={s._id}
                  className={cn("flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer group transition-colors",
                    activeSession === s._id ? "bg-brand-600/10 border border-brand-500/20" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                  onClick={() => setActiveSession(s._id)}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate flex-1">{s.title}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession.mutate(s._id); if (activeSession === s._id) setActiveSession(null); }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-500 transition-all text-gray-400"
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
            <ChatWindow sessionId={activeSession} repoId={id} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="No chat selected"
                description="Create a new session or select an existing one"
                action={
                  <button onClick={handleNewSession} className="btn-primary">
                    <Plus className="w-4 h-4" /> New Chat
                  </button>
                }
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

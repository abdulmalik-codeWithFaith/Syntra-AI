"use client";

import Sidebar from "@/components/sidebar";
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = "user" | "agent";

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  isTyping?: boolean;
}

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS: string[] = [
  "What tasks are overdue this week?",
  "Summarize my recent meetings",
  "Which tasks don't have an owner?",
  "What decisions were made this month?",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initialsFrom(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatTs(ts: any): string {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function now(): string {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

// ─── Thread list ──────────────────────────────────────────────────────────────

function ThreadList({ threads, activeId, onSelect, onNewChat, open, onClose }: {
  threads: ChatThread[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 z-20 bg-black/20 lg:hidden" onClick={onClose} />}
      <div className={`fixed lg:static top-0 left-0 z-30 h-screen w-72 flex flex-col border-r border-gray-100 bg-white flex-shrink-0 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-5 pt-6 pb-4 flex items-center gap-2">
          <button onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-2.5 text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
          <button onClick={onClose} className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-3 flex-1 overflow-y-auto space-y-1 pb-4">
          {threads.length === 0 ? (
            <p className="text-xs text-gray-400 px-2 py-4 text-center">No conversations yet</p>
          ) : (
            <>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">Recent</p>
              {threads.map((t) => (
                <button key={t.id} onClick={() => onSelect(t.id)}
                  className="w-full text-left px-3 py-2.5 rounded-xl transition-colors"
                  style={{ background: t.id === activeId ? "#F5F3FF" : "transparent" }}>
                  <p className="text-sm font-medium truncate" style={{ color: t.id === activeId ? "#7C3AED" : "#374151" }}>
                    {t.title}
                  </p>
                  {t.messages.length > 0 && (
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {t.messages[t.messages.length - 1].text.slice(0, 50)}...
                    </p>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, userInitials }: { message: ChatMessage; userInitials: string }) {
  const isAgent = message.role === "agent";
  return (
    <div className={`flex gap-2.5 ${isAgent ? "" : "flex-row-reverse"}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isAgent ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "#E5E7EB" }}>
        {isAgent ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        ) : (
          <span className="text-[10px] font-bold text-gray-600">{userInitials}</span>
        )}
      </div>
      <div className={`flex flex-col min-w-0 max-w-[80%] sm:max-w-[75%] ${isAgent ? "items-start" : "items-end"}`}>
        {message.isTyping ? (
          <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: "#F5F3FF" }}>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#A78BFA", animation: "typingDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-wrap"
            style={{
              background: isAgent ? "#F5F3FF" : "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: isAgent ? "#374151" : "#fff",
              borderTopLeftRadius: isAgent ? "4px" : "16px",
              borderTopRightRadius: isAgent ? "16px" : "4px",
            }}>
            {message.text}
          </div>
        )}
        <p className="text-[10px] text-gray-300 mt-1.5 px-1">{message.timestamp}</p>
      </div>
    </div>
  );
}

// ─── Welcome state ────────────────────────────────────────────────────────────

function WelcomeState({ onPromptClick }: { onPromptClick: (p: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      </div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "1.5rem" }} className="text-gray-900 mb-2">
        Ask Syntra anything
      </h2>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        I have full context on every meeting, task, and decision in your workspace. Ask me anything.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button key={prompt} onClick={() => onPromptClick(prompt)}
            className="text-left text-sm rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-600 hover:border-violet-300 hover:bg-violet-50/50 transition-colors">
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user, userDoc } = useAuth();
  const [threads, setThreads]     = useState<ChatThread[]>([]);
  const [activeId, setActiveId]   = useState<string>("");
  const [input, setInput]         = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const scrollRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const workspaceId = userDoc?.currentWorkspaceId ?? "";
  const userName    = user?.displayName ?? user?.email ?? "User";
  const userInitials = initialsFrom(userName);

  const activeThread = threads.find((t) => t.id === activeId) ?? null;
  const messages = activeThread?.messages ?? [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  // ── Build workspace context from Firestore ────────────────────────────────
  async function buildWorkspaceContext(): Promise<string> {
    if (!workspaceId) return "";
    try {
      const [meetingsSnap, tasksSnap] = await Promise.all([
        getDocs(query(collection(db, `workspaces/${workspaceId}/meetings`), orderBy("scheduledAt", "desc"), limit(10))),
        getDocs(query(collection(db, `workspaces/${workspaceId}/tasks`), orderBy("createdAt", "desc"), limit(20))),
      ]);

      const meetings = meetingsSnap.docs.map((d) => {
        const m = d.data();
        return `Meeting: "${m.title}" | Platform: ${m.platform} | Date: ${formatTs(m.scheduledAt)} | Status: ${m.status} | Tasks: ${m.taskCount} | Decisions: ${m.decisionCount}${m.summary ? ` | Summary: ${m.summary}` : ""}`;
      }).join("\n");

      const tasks = tasksSnap.docs.map((d) => {
        const t = d.data();
        return `Task: "${t.title}" | Status: ${t.status} | Owner: ${t.ownerName ?? "Unassigned"} | Meeting: ${t.meetingTitle} | Overdue: ${t.overdue ? "Yes" : "No"}${t.deadline ? ` | Deadline: ${formatTs(t.deadline)}` : ""}`;
      }).join("\n");

      return `WORKSPACE CONTEXT:\n\nMEETINGS (most recent 10):\n${meetings || "No meetings yet."}\n\nTASKS (most recent 20):\n${tasks || "No tasks yet."}`;
    } catch {
      return "";
    }
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function sendMessage(text: string) {
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `u${Date.now()}`, role: "user",
      text: text.trim(), timestamp: now(),
    };

    let currentThread: ChatThread;

    if (!activeId) {
      // Create new thread
      const newThread: ChatThread = {
        id: `t${Date.now()}`,
        title: text.trim().slice(0, 50),
        messages: [userMsg],
      };
      setThreads((prev) => [newThread, ...prev]);
      setActiveId(newThread.id);
      currentThread = newThread;
    } else {
      setThreads((prev) => prev.map((t) =>
        t.id === activeId ? { ...t, messages: [...t.messages, userMsg] } : t
      ));
      currentThread = { ...activeThread!, messages: [...(activeThread?.messages ?? []), userMsg] };
    }

    setInput("");
    setIsThinking(true);

    try {
      const context = await buildWorkspaceContext();

      // Build message history for the API
      const history = currentThread.messages.map((m) => ({
        role: m.role === "agent" ? "assistant" : "user",
        content: m.text,
      }));

      const systemPrompt = `You are Syntra, an AI meeting co-worker. You have full context on the user's workspace meetings, tasks, and decisions. Answer questions clearly and concisely based on the workspace data provided. If the data doesn't contain the answer, say so honestly. And remove the asterisk

${context}

Current user: ${userName}
Workspace ID: ${workspaceId}`;

      const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nConversation history:\n${history.map((m) => `${m.role}: ${m.content}`).join("\n")}\n\nUser: ${text.trim()}`,
            },
          ],
        },
      ],
    }),
  }
);

const data = await res.json();
const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm sorry, I couldn't generate a response. Please try again.";

      const agentMsg: ChatMessage = {
        id: `a${Date.now()}`, role: "agent",
        text: responseText, timestamp: now(),
      };

      setThreads((prev) => prev.map((t) =>
        t.id === (activeId || currentThread.id)
          ? { ...t, messages: [...t.messages, agentMsg] }
          : t
      ));
    } catch (err) {
      console.error("Chat error:", err);
      const errMsg: ChatMessage = {
        id: `e${Date.now()}`, role: "agent",
        text: "Sorry, something went wrong. Please try again.",
        timestamp: now(),
      };
      setThreads((prev) => prev.map((t) =>
        t.id === (activeId || currentThread.id)
          ? { ...t, messages: [...t.messages, errMsg] }
          : t
      ));
    } finally {
      setIsThinking(false);
    }
  }

  function handleNewChat() {
    setActiveId("");
    setThreadOpen(false);
  }

  function handlePromptClick(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  function handleSubmit(e: FormEvent) { e.preventDefault(); sendMessage(input); }
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      <Sidebar activeId="chat" />

      <ThreadList
        threads={threads}
        activeId={activeId}
        onSelect={(id) => { setActiveId(id); setThreadOpen(false); }}
        onNewChat={handleNewChat}
        open={threadOpen}
        onClose={() => setThreadOpen(false)}
      />

      <main className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-8 py-4 border-b border-gray-100 flex-shrink-0">
          <button onClick={() => setThreadOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">
              {activeThread?.title ?? "Ask Syntra"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">Has context on all workspace meetings and tasks</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {messages.length === 0 ? (
            <WelcomeState onPromptClick={handlePromptClick} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} userInitials={userInitials} />
              ))}
              {isThinking && (
                <MessageBubble
                  message={{ id: "typing", role: "agent", text: "", timestamp: "", isTyping: true }}
                  userInitials={userInitials}
                />
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 px-4 sm:px-8 py-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-white px-3 sm:px-4 py-2.5 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a meeting, task, or decision..."
                rows={1}
                className="flex-1 min-w-0 resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none py-1.5 max-h-32"
                style={{ fieldSizing: "content" } as React.CSSProperties}
              />
              <button type="submit" disabled={!input.trim() || isThinking}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-300 mt-2 text-center">
              Syntra can make mistakes. Check important info against the source meeting.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
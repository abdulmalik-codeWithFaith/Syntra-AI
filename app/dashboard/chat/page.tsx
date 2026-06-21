"use client";

import Sidebar from "@/components/sidebar";
import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageRole = "user" | "agent";

interface SourceRef {
  meetingTitle: string;
  meetingId: string;
  date: string;
}

interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  sources?: SourceRef[];
  isTyping?: boolean;
}

interface ChatThread {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  active: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THREADS: ChatThread[] = [
  { id: "c1", title: "What did we decide on pricing?", lastMessage: "Based on the Q3 Planning meeting...", timestamp: "2m ago", active: true },
  { id: "c2", title: "Tasks assigned to Sarah", lastMessage: "Sarah has 3 open tasks across...", timestamp: "1h ago", active: false },
  { id: "c3", title: "Engineering retro takeaways", lastMessage: "The team agreed to prioritize...", timestamp: "Yesterday", active: false },
  { id: "c4", title: "Overdue tasks this week", lastMessage: "You have 1 overdue task: Send beta...", timestamp: "Yesterday", active: false },
  { id: "c5", title: "Summary of investor update", lastMessage: "The investor update covered four...", timestamp: "3 days ago", active: false },
];

const SUGGESTED_PROMPTS: string[] = [
  "What tasks are overdue this week?",
  "Summarize yesterday's standup",
  "What decisions did we make about the mobile app?",
  "Which tasks don't have an owner?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    text: "What did we decide on pricing during Q3 Planning?",
    timestamp: "10:42 AM",
  },
  {
    id: "m2",
    role: "agent",
    text: "During Q3 Planning, the team decided to launch the beta by August 15th, with Sarah owning the release. Marketing assets were assigned to Mike, due that Friday. No final pricing tiers were locked in — that was left open pending the performance audit John is running on the dashboard API.",
    timestamp: "10:42 AM",
    sources: [
      { meetingTitle: "Q3 Planning", meetingId: "1", date: "Jun 20, 2026" },
      { meetingTitle: "Product Sync — Mobile App", meetingId: "4", date: "Jun 18, 2026" },
    ],
  },
  {
    id: "m3",
    role: "user",
    text: "Who's responsible for that audit and when is it due?",
    timestamp: "10:43 AM",
  },
  {
    id: "m4",
    role: "agent",
    text: "John Carter is running the performance audit on the dashboard API endpoint. It's due June 25th. This was flagged as a decision during the Product Sync meeting after concerns about a 3-second load time.",
    timestamp: "10:43 AM",
    sources: [{ meetingTitle: "Product Sync — Mobile App", meetingId: "4", date: "Jun 18, 2026" }],
  },
];

// ─── Chat thread list (secondary panel) ──────────────────────────────────────

function ThreadList({ threads, onNewChat }: { threads: ChatThread[]; onNewChat: () => void }) {
  return (
    <div className="w-72 h-screen sticky top-0 flex flex-col border-r border-gray-100 bg-white flex-shrink-0">
      <div className="px-5 pt-6 pb-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-xl py-2.5 text-white"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New chat
        </button>
      </div>

      <div className="px-3 flex-1 overflow-y-auto space-y-1 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 px-2 mb-2">Recent</p>
        {threads.map((t) => (
          <button
            key={t.id}
            className="w-full text-left px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: t.active ? "#F5F3FF" : "transparent" }}
            onMouseEnter={(e) => { if (!t.active) e.currentTarget.style.background = "#F9FAFB"; }}
            onMouseLeave={(e) => { if (!t.active) e.currentTarget.style.background = "transparent"; }}
          >
            <p className="text-sm font-medium truncate" style={{ color: t.active ? "#7C3AED" : "#374151" }}>{t.title}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{t.lastMessage}</p>
            <p className="text-[10px] text-gray-300 mt-1">{t.timestamp}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAgent = message.role === "agent";

  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: isAgent ? "linear-gradient(135deg, #2563EB, #7C3AED)" : "#E5E7EB" }}
      >
        {isAgent ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
        ) : (
          <span className="text-[10px] font-bold text-gray-600">MI</span>
        )}
      </div>

      <div className={`flex flex-col max-w-[75%] ${isAgent ? "items-start" : "items-end"}`}>
        {message.isTyping ? (
          <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: "#F5F3FF" }}>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#A78BFA", animation: `typingDot 1.2s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
            style={{
              background: isAgent ? "#F5F3FF" : "linear-gradient(135deg, #7C3AED, #6D28D9)",
              color: isAgent ? "#374151" : "#fff",
              borderTopLeftRadius: isAgent ? "4px" : "16px",
              borderTopRightRadius: isAgent ? "16px" : "4px",
            }}
          >
            {message.text}
          </div>
        )}

        {/* Source citations */}
        {message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.sources.map((s) => (
              <a
                key={s.meetingId}
                href={`/dashboard/meetings/${s.meetingId}`}
                className="flex items-center gap-1.5 text-xs rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-gray-500 hover:border-violet-300 hover:text-violet-600 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="5" width="14" height="12" rx="2" /><path d="M17 9.5l4-2.5v9l-4-2.5" />
                </svg>
                {s.meetingTitle}
                <span className="text-gray-300">·</span>
                {s.date}
              </a>
            ))}
          </div>
        )}

        <p className="text-[10px] text-gray-300 mt-1.5 px-1">{message.timestamp}</p>
      </div>
    </div>
  );
}

// ─── Empty / welcome state ─────────────────────────────────────────────────────

function WelcomeState({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
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
          <button
            key={prompt}
            onClick={() => onPromptClick(prompt)}
            className="text-left text-sm rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-600 hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Chat Page ──────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  function handlePromptClick(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: `u${Date.now()}`,
      role: "user",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    // TODO: replace with real call to Gemini API with workspace context (meetings, tasks, decisions)
    // const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: text, workspaceId }) })
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const agentMessage: ChatMessage = {
      id: `a${Date.now()}`,
      role: "agent",
      text: "I'd pull this from your workspace's meeting history and respond with cited sources, just like the examples above.",
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };

    setIsThinking(false);
    setMessages((prev) => [...prev, agentMessage]);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function handleNewChat() {
    setMessages([]);
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        textarea { field-sizing: content; }
      `}</style>

      <Sidebar activeId="chat" />
      <ThreadList threads={THREADS} onNewChat={handleNewChat} />

      {/* Chat panel */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-gray-900">Ask Syntra</h1>
            <p className="text-xs text-gray-400 mt-0.5">Powered by Gemini · Has context on all workspace meetings</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Online
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6">
          {messages.length === 0 ? (
            <WelcomeState onPromptClick={handlePromptClick} />
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isThinking && (
                <MessageBubble
                  message={{ id: "typing", role: "agent", text: "", timestamp: "", isTyping: true }}
                />
              )}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 px-8 py-4 flex-shrink-0">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a meeting, task, or decision..."
                rows={1}
                className="flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 focus:outline-none py-1.5 max-h-32"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-300 mt-2 text-center">Syntra can make mistakes. Check important info against the source meeting.</p>
          </form>
        </div>
      </main>
    </div>
  );
}
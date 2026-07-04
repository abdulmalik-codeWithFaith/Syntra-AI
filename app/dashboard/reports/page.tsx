"use client";

import Sidebar from "@/components/sidebar";
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { MeetingDoc, MeetingPlatform } from "@/lib/firestore";

type FilterTab = "All" | "This week" | "This month" | "Older";
type ViewMode  = "grid" | "list";

function PlatformIcon({ platform }: { platform: MeetingPlatform }) {
  if (platform === "Google Meet") return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path fill="#00832D" d="M12 11v6h6v-6z" /><path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
      <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" /><path fill="#2684FC" d="M5 11v6h7v-6z" />
      <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" /><path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
    </svg>
  );
  if (platform === "Zoom") return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#2D8CFF" />
      <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
      <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <rect x="2" y="5" width="13" height="14" rx="1.5" fill="#5059C9" /><circle cx="18.5" cy="7" r="2.5" fill="#5059C9" />
      <rect x="15" y="9" width="7" height="9" rx="1.5" fill="#7B83EB" /><rect x="5" y="9" width="7" height="7" rx="0.5" fill="white" />
    </svg>
  );
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDate(ts: any): string {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function bucketMeeting(ts: any): "This week" | "This month" | "Older" {
  if (!ts) return "Older";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7)  return "This week";
  if (diffDays <= 30) return "This month";
  return "Older";
}

function Topbar({ search, onSearch, userName, userInitials }: {
  search: string; onSearch: (v: string) => void;
  userName: string; userInitials: string;
}) {
  return (
    <div className="md:flex hidden items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 rounded-2xl border border-gray-100 w-full" style={{ background: "#F9FAFB" }}>
      <div className="flex-1 relative min-w-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input type="text" value={search} onChange={(e) => onSearch(e.target.value)}
          placeholder="Search reports..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all" />
      </div>
      <div className="flex items-center gap-2 pl-2 border-l border-gray-200 flex-shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
          {userInitials}
        </div>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ meeting, selected, onToggleSelect, onDownload }: {
  meeting: MeetingDoc; selected: boolean; onToggleSelect: () => void;
  onDownload: (url: string, title: string) => void;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 transition-all duration-150 hover:shadow-md relative"
      style={{ borderColor: selected ? "#7C3AED" : "#F3F4F6" }}>
      <button onClick={onToggleSelect}
        className="absolute top-4 right-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors z-10"
        style={{ borderColor: selected ? "#7C3AED" : "#D1D5DB", background: selected ? "#7C3AED" : "#fff" }}>
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="w-full h-28 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "linear-gradient(135deg, #F5F3FF, #EFF6FF)" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6M9 9h1" />
        </svg>
      </div>

      <div className="flex items-center gap-1.5 mb-1.5">
        <PlatformIcon platform={meeting.platform} />
        <span className="text-xs text-gray-400 truncate">{formatDate(meeting.scheduledAt)}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 leading-snug mb-3 pr-6 truncate">{meeting.title}</p>

      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4 flex-wrap">
        <span>{meeting.taskCount} tasks</span>
        <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
        <span>{meeting.decisionCount} decisions</span>
        {meeting.pdfSizeKB && (
          <>
            <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
            <span>{(meeting.pdfSizeKB / 1024).toFixed(1)} MB</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <a href={`/dashboard/meetings/${meeting.id}`}
          className="flex-1 text-center text-xs font-medium rounded-lg border border-gray-200 py-2 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-colors">
          View
        </a>
        {meeting.pdfUrl ? (
          <button
            onClick={() => onDownload(meeting.pdfUrl!, meeting.title)}
            className="flex-1 text-center text-xs font-semibold rounded-lg py-2 text-white"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            Download
          </button>
        ) : (
          <button disabled
            className="flex-1 text-center text-xs font-semibold rounded-lg py-2 text-gray-400 bg-gray-100 cursor-not-allowed">
            No PDF
          </button>
        )}
      </div>
    </div>
  );
}

function ReportRow({ meeting, selected, onToggleSelect, onDownload }: {
  meeting: MeetingDoc; selected: boolean; onToggleSelect: () => void;
  onDownload: (url: string, title: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border bg-white hover:shadow-sm transition-all duration-150 w-full min-w-0"
      style={{ borderColor: selected ? "#7C3AED" : "#F3F4F6" }}>
      <button onClick={onToggleSelect}
        className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors"
        style={{ borderColor: selected ? "#7C3AED" : "#D1D5DB", background: selected ? "#7C3AED" : "transparent" }}>
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#F5F3FF" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{meeting.title}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
          <span className="flex-shrink-0"><PlatformIcon platform={meeting.platform} /></span>
          <span className="truncate">{meeting.platform} · {formatDate(meeting.scheduledAt)}</span>
        </p>
      </div>

      <div className="hidden md:flex items-center gap-4 lg:gap-6 flex-shrink-0">
        <div className="text-center w-12">
          <p className="text-sm font-bold text-gray-900">{meeting.taskCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tasks</p>
        </div>
        <div className="text-center w-14">
          <p className="text-sm font-bold text-gray-900">{meeting.decisionCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Decisions</p>
        </div>
        {meeting.pdfSizeKB && (
          <div className="text-center w-14">
            <p className="text-sm font-bold text-gray-900">{(meeting.pdfSizeKB / 1024).toFixed(1)} MB</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Size</p>
          </div>
        )}
      </div>

      <a href={`/dashboard/meetings/${meeting.id}`}
        className="text-xs font-medium rounded-lg border border-gray-200 px-3 py-2 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-colors flex-shrink-0 hidden sm:block">
        View
      </a>

      {meeting.pdfUrl ? (
        <button
          onClick={() => onDownload(meeting.pdfUrl!, meeting.title)}
          className="text-xs font-semibold rounded-lg px-3 py-2 text-white flex-shrink-0 flex items-center gap-1"
          style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span className="hidden sm:inline">PDF</span>
        </button>
      ) : (
        <span className="text-xs text-gray-300 flex-shrink-0 hidden sm:block">No PDF</span>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white col-span-full">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">No reports yet</p>
      <p className="text-xs text-gray-400 text-center px-4">PDF reports are generated automatically after each completed meeting.</p>
    </div>
  );
}

export default function ReportsPage() {
  const { user, userDoc } = useAuth();
  const [meetings, setMeetings]         = useState<MeetingDoc[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search, setSearch]             = useState("");
  const [viewMode, setViewMode]         = useState<ViewMode>("grid");
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [downloading, setDownloading]   = useState(false);

  const workspaceId  = userDoc?.currentWorkspaceId ?? "";
  const userName     = user?.displayName ?? user?.email ?? "User";
  const userInitials = initialsFrom(userName);

  useEffect(() => {
    if (!workspaceId) return;
    const q = query(
      collection(db, `workspaces/${workspaceId}/meetings`),
      where("status", "==", "Completed"),
      orderBy("scheduledAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMeetings(snap.docs.map((d) => d.data() as MeetingDoc));
      setLoading(false);
    }, (err) => {
      console.error("Reports listener error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, [workspaceId]);

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleDownload(pdfUrl: string, title: string) {
  try {
    const proxyUrl = `/api/download-pdf?url=${encodeURIComponent(pdfUrl)}`;
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Download failed:", err);
  }
}

  async function handleDownloadSelected() {
    setDownloading(true);
    const toDownload = meetings.filter((m) => selected.has(m.id) && m.pdfUrl);
    for (const m of toDownload) {
      await handleDownload(m.pdfUrl!, m.title);
    }
    setDownloading(false);
  }

  async function handleDownloadAll() {
    setDownloading(true);
    const withPdfs = meetings.filter((m) => m.pdfUrl);
    for (const m of withPdfs) {
      await handleDownload(m.pdfUrl!, m.title);
    }
    setDownloading(false);
  }

  const filtered = useMemo(() => {
    let result = meetings;
    if (activeFilter !== "All") result = result.filter((m) => bucketMeeting(m.scheduledAt) === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) => m.title.toLowerCase().includes(q) || m.platform.toLowerCase().includes(q));
    }
    return result;
  }, [meetings, activeFilter, search]);

  const FILTER_TABS: FilterTab[] = ["All", "This week", "This month", "Older"];

  const counts: Record<FilterTab, number> = {
    All:          meetings.length,
    "This week":  meetings.filter((m) => bucketMeeting(m.scheduledAt) === "This week").length,
    "This month": meetings.filter((m) => bucketMeeting(m.scheduledAt) === "This month").length,
    Older:        meetings.filter((m) => bucketMeeting(m.scheduledAt) === "Older").length,
  };

  const totalSizeMB = (meetings.reduce((sum, m) => sum + (m.pdfSizeKB ?? 0), 0) / 1024).toFixed(1);
  const withPDF = meetings.filter((m) => m.pdfUrl).length;

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .filter-scroll { scrollbar-width: none; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="reports" />

      <main className="flex-1 min-w-0 flex flex-col px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        <Topbar search={search} onSearch={setSearch} userName={userName} userInitials={userInitials} />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(1.6rem, 4vw, 2.25rem)", color: "#111827" }}>
              Reports
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {withPDF} PDF {withPDF === 1 ? "report" : "reports"} generated
              {Number(totalSizeMB) > 0 ? ` · ${totalSizeMB} MB total` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <div className="flex items-center p-1 rounded-xl border border-gray-200 bg-white">
              {(["grid", "list"] as ViewMode[]).map((mode) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background: viewMode === mode ? "#F5F3FF" : "transparent", color: viewMode === mode ? "#7C3AED" : "#9CA3AF" }}>
                  {mode === "grid" ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {selected.size > 0 ? (
              <button
                onClick={handleDownloadSelected}
                disabled={downloading}
                className="text-white text-sm font-semibold rounded-xl px-4 py-2.5 flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {downloading ? "Downloading..." : `Download ${selected.size}`}
              </button>
            ) : (
              <button
                onClick={handleDownloadAll}
                disabled={downloading || withPDF === 0}
                className="text-sm font-semibold rounded-xl px-4 py-2.5 bg-white flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                style={{ border: "1.5px solid rgba(124,58,237,0.3)", color: "#7C3AED" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {downloading ? "Downloading..." : "Download all"}
              </button>
            )}
          </div>
        </div>

        <div className="filter-scroll overflow-x-auto mb-6 -mx-1 px-1">
          <div className="flex items-center gap-1.5 w-max">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <button key={tab} onClick={() => setActiveFilter(tab)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150 flex-shrink-0"
                  style={{
                    background: isActive ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff",
                    color:      isActive ? "#fff" : "#6B7280",
                    border:     isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                  }}>
                  {tab}
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6", color: isActive ? "#fff" : "#9CA3AF" }}>
                    {counts[tab]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pb-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((m) => (
                <ReportCard
                  key={m.id}
                  meeting={m}
                  selected={selected.has(m.id)}
                  onToggleSelect={() => toggleSelect(m.id)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((m) => (
                <ReportRow
                  key={m.id}
                  meeting={m}
                  selected={selected.has(m.id)}
                  onToggleSelect={() => toggleSelect(m.id)}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
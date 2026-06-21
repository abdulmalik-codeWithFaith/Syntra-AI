"use client";

import Sidebar from "@/components/sidebar";
import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────


type PlatformType = "Google Meet" | "Zoom" | "Microsoft Teams";
type FilterTab = "All" | "This week" | "This month" | "Older";
type ViewMode = "grid" | "list";

interface Report {
  id: string;
  meetingId: string;
  meetingTitle: string;
  platform: PlatformType;
  date: string;
  dateISO: string;
  taskCount: number;
  decisionCount: number;
  attendeeCount: number;
  fileSizeKB: number;
}

// ─── Icons ────────────────────────────────────────────────────────────────────



const PLATFORM_ICON: Record<PlatformType, React.ReactNode> = {
  "Google Meet": (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path fill="#00832D" d="M12 11v6h6v-6z" /><path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
      <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" /><path fill="#2684FC" d="M5 11v6h7v-6z" />
      <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" /><path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
    </svg>
  ),
  Zoom: (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <rect width="24" height="24" rx="6" fill="#2D8CFF" />
      <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
      <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
    </svg>
  ),
  "Microsoft Teams": (
    <svg width="14" height="14" viewBox="0 0 24 24">
      <rect x="2" y="5" width="13" height="14" rx="1.5" fill="#5059C9" /><circle cx="18.5" cy="7" r="2.5" fill="#5059C9" />
      <rect x="15" y="9" width="7" height="9" rx="1.5" fill="#7B83EB" /><rect x="5" y="9" width="7" height="7" rx="0.5" fill="white" />
    </svg>
  ),
};

// ─── Constants ────────────────────────────────────────────────────────────────


const REPORTS: Report[] = [
  { id: "r1", meetingId: "4", meetingTitle: "Product Sync — Mobile App", platform: "Zoom", date: "Jun 18, 2026", dateISO: "2026-06-18", taskCount: 5, decisionCount: 2, attendeeCount: 3, fileSizeKB: 412 },
  { id: "r2", meetingId: "5", meetingTitle: "Marketing Strategy Review", platform: "Microsoft Teams", date: "Jun 18, 2026", dateISO: "2026-06-18", taskCount: 3, decisionCount: 1, attendeeCount: 2, fileSizeKB: 298 },
  { id: "r3", meetingId: "6", meetingTitle: "Engineering Retro", platform: "Google Meet", date: "Jun 17, 2026", dateISO: "2026-06-17", taskCount: 6, decisionCount: 3, attendeeCount: 4, fileSizeKB: 521 },
  { id: "r4", meetingId: "7", meetingTitle: "Investor Update", platform: "Zoom", date: "Jun 15, 2026", dateISO: "2026-06-15", taskCount: 2, decisionCount: 4, attendeeCount: 1, fileSizeKB: 356 },
  { id: "r5", meetingId: "8", meetingTitle: "Weekly Standup", platform: "Google Meet", date: "Jun 13, 2026", dateISO: "2026-06-13", taskCount: 4, decisionCount: 0, attendeeCount: 5, fileSizeKB: 187 },
  { id: "r6", meetingId: "9", meetingTitle: "Client Onboarding — Acme Corp", platform: "Zoom", date: "Jun 12, 2026", dateISO: "2026-06-12", taskCount: 7, decisionCount: 2, attendeeCount: 4, fileSizeKB: 478 },
  { id: "r7", meetingId: "10", meetingTitle: "Design Review — Checkout Flow", platform: "Google Meet", date: "Jun 10, 2026", dateISO: "2026-06-10", taskCount: 3, decisionCount: 5, attendeeCount: 3, fileSizeKB: 392 },
  { id: "r8", meetingId: "11", meetingTitle: "Hiring Sync — Engineering", platform: "Microsoft Teams", date: "May 28, 2026", dateISO: "2026-05-28", taskCount: 2, decisionCount: 1, attendeeCount: 3, fileSizeKB: 245 },
  { id: "r9", meetingId: "12", meetingTitle: "Sprint Planning — Q3", platform: "Zoom", date: "May 20, 2026", dateISO: "2026-05-20", taskCount: 9, decisionCount: 3, attendeeCount: 6, fileSizeKB: 612 },
];

const FILTER_TABS: FilterTab[] = ["All", "This week", "This month", "Older"];

// today is referenced as 2026-06-20 for the "this week / this month" bucketing
const TODAY = new Date("2026-06-20");

function bucketReport(dateISO: string): "This week" | "This month" | "Older" {
  const date = new Date(dateISO);
  const diffDays = Math.floor((TODAY.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return "This week";
  if (diffDays <= 30) return "This month";
  return "Older";
}


// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  return (
    <div className="flex items-center gap-4 px-6 py-3.5 rounded-2xl border border-gray-100" style={{ background: "#F9FAFB" }}>
      <div className="flex-1 relative max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search reports..."
          className="w-full bg-white rounded-xl border border-gray-200 pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
        />
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}>
          MI
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-900 leading-tight">Musa Imran</p>
          <p className="text-xs text-gray-400 leading-tight">Admin</p>
        </div>
      </div>
    </div>
  );
}

// ─── Report card (grid view) ────────────────────────────────────────────────────

function ReportCard({ report, selected, onToggleSelect }: { report: Report; selected: boolean; onToggleSelect: () => void }) {
  return (
    <div
      className="rounded-2xl border bg-white p-5 transition-all duration-150 hover:shadow-md group relative"
      style={{ borderColor: selected ? "#7C3AED" : "#F3F4F6" }}
    >
      <button
        onClick={onToggleSelect}
        className="absolute top-4 right-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors z-10"
        style={{ borderColor: selected ? "#7C3AED" : "#D1D5DB", background: selected ? "#7C3AED" : "#fff" }}
      >
        {selected && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* PDF preview thumb */}
      <div className="w-full h-28 rounded-xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #F5F3FF, #EFF6FF)" }}>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6M9 9h1" />
        </svg>
      </div>

      <div className="flex items-center gap-1.5 mb-1.5">
        {PLATFORM_ICON[report.platform]}
        <span className="text-xs text-gray-400">{report.date}</span>
      </div>
      <p className="text-sm font-semibold text-gray-900 leading-snug mb-3 pr-6">{report.meetingTitle}</p>

      <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
        <span>{report.taskCount} tasks</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span>{report.decisionCount} decisions</span>
        <span className="w-1 h-1 rounded-full bg-gray-300" />
        <span>{(report.fileSizeKB / 1024).toFixed(1)} MB</span>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={`/dashboard/meetings/${report.meetingId}`}
          className="flex-1 text-center text-xs font-medium rounded-lg border border-gray-200 py-2 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-colors"
        >
          View meeting
        </a>
        <button className="flex-1 text-center text-xs font-semibold rounded-lg py-2 text-white" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
          Download
        </button>
      </div>
    </div>
  );
}

// ─── Report row (list view) ─────────────────────────────────────────────────────

function ReportRow({ report, selected, onToggleSelect }: { report: Report; selected: boolean; onToggleSelect: () => void }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-2xl border bg-white hover:shadow-sm transition-all duration-150"
      style={{ borderColor: selected ? "#7C3AED" : "#F3F4F6" }}
    >
      <button
        onClick={onToggleSelect}
        className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors"
        style={{ borderColor: selected ? "#7C3AED" : "#D1D5DB", background: selected ? "#7C3AED" : "transparent" }}
      >
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
        <p className="text-sm font-semibold text-gray-900 truncate">{report.meetingTitle}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
          {PLATFORM_ICON[report.platform]} {report.platform} · {report.date}
        </p>
      </div>

      <div className="hidden md:flex items-center gap-6 flex-shrink-0">
        <div className="text-center w-14">
          <p className="text-sm font-bold text-gray-900">{report.taskCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Tasks</p>
        </div>
        <div className="text-center w-14">
          <p className="text-sm font-bold text-gray-900">{report.decisionCount}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Decisions</p>
        </div>
        <div className="text-center w-16">
          <p className="text-sm font-bold text-gray-900">{(report.fileSizeKB / 1024).toFixed(1)} MB</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Size</p>
        </div>
      </div>

      <a
        href={`/dashboard/meetings/${report.meetingId}`}
        className="text-xs font-medium rounded-lg border border-gray-200 px-3.5 py-2 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-colors flex-shrink-0 hidden sm:block"
      >
        View
      </a>
      <button
        className="text-xs font-semibold rounded-lg px-4 py-2 text-white flex-shrink-0 flex items-center gap-1.5"
        style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        PDF
      </button>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-gray-200 bg-white col-span-full">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#F5F3FF" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-900 mb-1">No reports found</p>
      <p className="text-xs text-gray-400">PDF reports are generated automatically after each meeting.</p>
    </div>
  );
}

// ─── Main Reports Page ───────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredReports = useMemo(() => {
    let result = REPORTS;

    if (activeFilter !== "All") {
      result = result.filter((r) => bucketReport(r.dateISO) === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.meetingTitle.toLowerCase().includes(q) || r.platform.toLowerCase().includes(q));
    }

    return result;
  }, [activeFilter, search]);

  const counts: Record<FilterTab, number> = {
    All: REPORTS.length,
    "This week": REPORTS.filter((r) => bucketReport(r.dateISO) === "This week").length,
    "This month": REPORTS.filter((r) => bucketReport(r.dateISO) === "This month").length,
    Older: REPORTS.filter((r) => bucketReport(r.dateISO) === "Older").length,
  };

  const totalSizeMB = (REPORTS.reduce((sum, r) => sum + r.fileSizeKB, 0) / 1024).toFixed(1);

  return (
    <div className="min-h-screen flex" style={{ background: "#FAFAFB", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        .btn-outline-violet { border: 1.5px solid rgba(124, 58, 237, 0.3); color: #7C3AED; transition: all 0.15s ease; }
        .btn-outline-violet:hover { background: rgba(124, 58, 237, 0.06); border-color: #7C3AED; }
        .btn-primary-violet { background: linear-gradient(135deg, #7C3AED, #6D28D9); transition: all 0.2s ease; }
        .btn-primary-violet:hover { background: linear-gradient(135deg, #8B5CF6, #7C3AED); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Sidebar activeId="reports" />

      <main className="flex-1 px-6 sm:px-8 py-6 max-w-[1600px]">
        <Topbar search={search} onSearch={setSearch} />

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-8 mb-6">
          <div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "2.25rem", color: "#111827" }}>
              Reports
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {REPORTS.length} PDF reports generated · {totalSizeMB} MB total
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center p-1 rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => setViewMode("grid")}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: viewMode === "grid" ? "#F5F3FF" : "transparent", color: viewMode === "grid" ? "#7C3AED" : "#9CA3AF" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: viewMode === "list" ? "#F5F3FF" : "transparent", color: viewMode === "list" ? "#7C3AED" : "#9CA3AF" }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>

            {selected.size > 0 ? (
              <button className="btn-primary-violet text-white text-sm font-semibold rounded-xl px-5 py-2.5 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download {selected.size} selected
              </button>
            ) : (
              <button className="btn-outline-violet text-sm font-semibold rounded-xl px-5 py-2.5 bg-white flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download all
              </button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150"
                style={{
                  background: isActive ? "linear-gradient(135deg, #7C3AED, #6D28D9)" : "#fff",
                  color: isActive ? "#fff" : "#6B7280",
                  border: isActive ? "1px solid transparent" : "1px solid #E5E7EB",
                }}
              >
                {tab}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.2)" : "#F3F4F6",
                    color: isActive ? "#fff" : "#9CA3AF",
                  }}
                >
                  {counts[tab]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Reports */}
        <div className="pb-8">
          {filteredReports.length === 0 ? (
            <EmptyState />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReports.map((r) => (
                <ReportCard key={r.id} report={r} selected={selected.has(r.id)} onToggleSelect={() => toggleSelect(r.id)} />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredReports.map((r) => (
                <ReportRow key={r.id} report={r} selected={selected.has(r.id)} onToggleSelect={() => toggleSelect(r.id)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
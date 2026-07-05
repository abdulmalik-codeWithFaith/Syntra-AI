"use client";

import { useState, useMemo } from "react";

type MeetingStatus = "completed" | "live" | "processing" | "upcoming";
type MeetingPlatform = "Google Meet" | "Zoom" | "Microsoft Teams";

interface AdminMeeting {
  id: string;
  title: string;
  workspaceName: string;
  workspaceId: string;
  platform: MeetingPlatform;
  status: MeetingStatus;
  attendees: number;
  duration: number;
  taskCount: number;
  decisionCount: number;
  hasPDF: boolean;
  hasTranscript: boolean;
  scheduledAt: string;
  ownerName: string;
  ownerInitials: string;
  ownerColor: string;
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#2563EB,#7C3AED)",
  "linear-gradient(135deg,#DB2777,#EA580C)",
  "linear-gradient(135deg,#059669,#0891B2)",
  "linear-gradient(135deg,#7C3AED,#6D28D9)",
  "linear-gradient(135deg,#EA580C,#B45309)",
];

const STATUS_STYLES: Record<MeetingStatus, { bg: string; color: string; dot: string; label: string }> = {
  completed:  { bg: "#F5F3FF", color: "#7C3AED", dot: "#7C3AED", label: "Completed" },
  live:       { bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444", label: "Live" },
  processing: { bg: "#FEF3C7", color: "#B45309", dot: "#F59E0B", label: "Processing" },
  upcoming:   { bg: "#EFF6FF", color: "#2563EB", dot: "#3B82F6", label: "Upcoming" },
};

const PLATFORM_COLORS: Record<MeetingPlatform, string> = {
  "Google Meet": "#34A853",
  "Zoom": "#2D8CFF",
  "Microsoft Teams": "#5059C9",
};

function PlatformIcon({ platform }: { platform: MeetingPlatform }) {
  if (platform === "Google Meet") return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#00832D" d="M12 11v6h6v-6z" />
      <path fill="#0066DA" d="M12 5v6h6V8.5L21 6V5z" />
      <path fill="#E94235" d="M12 5H7.5L5 7.5V11h7z" />
      <path fill="#2684FC" d="M5 11v6h7v-6z" />
      <path fill="#00AC47" d="M18 11v3.5L21 19v-8z" />
      <path fill="#FFBA00" d="M5 7.5L2 5v14l3-2.5z" />
    </svg>
  );
  if (platform === "Zoom") return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <rect width="24" height="24" rx="6" fill="#2D8CFF" />
      <path fill="white" d="M5 9.5h9a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5H5z" />
      <path fill="white" d="M16 11.2l3-2v5.6l-3-2z" />
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <rect x="2" y="5" width="13" height="14" rx="1.5" fill="#5059C9" />
      <circle cx="18.5" cy="7" r="2.5" fill="#5059C9" />
      <rect x="15" y="9" width="7" height="9" rx="1.5" fill="#7B83EB" />
      <rect x="5" y="9" width="7" height="7" rx="0.5" fill="white" />
    </svg>
  );
}

const MOCK: AdminMeeting[] = [
  { id: "mtg_a1b2", title: "Q3 Planning Session", workspaceName: "Growthly Inc", workspaceId: "ws_k2m9p", platform: "Google Meet", status: "completed", attendees: 8, duration: 62, taskCount: 12, decisionCount: 4, hasPDF: true, hasTranscript: true, scheduledAt: "Jul 1, 2026 · 10:00 AM", ownerName: "James Carter", ownerInitials: "JC", ownerColor: AVATAR_COLORS[0] },
  { id: "mtg_c3d4", title: "Design Review — Mobile App", workspaceName: "DesignBase Studio", workspaceId: "ws_n7r3x", platform: "Zoom", status: "live", attendees: 4, duration: 0, taskCount: 0, decisionCount: 0, hasPDF: false, hasTranscript: false, scheduledAt: "Jul 5, 2026 · 2:00 PM", ownerName: "Sofia Reyes", ownerInitials: "SR", ownerColor: AVATAR_COLORS[1] },
  { id: "mtg_e5f6", title: "Investor Update Call", workspaceName: "MoonLab Technologies", workspaceId: "ws_p4t8q", platform: "Google Meet", status: "processing", attendees: 6, duration: 45, taskCount: 0, decisionCount: 0, hasPDF: false, hasTranscript: true, scheduledAt: "Jul 5, 2026 · 11:30 AM", ownerName: "Alex Morgan", ownerInitials: "AM", ownerColor: AVATAR_COLORS[2] },
  { id: "mtg_g7h8", title: "Weekly Standup", workspaceName: "Folio Labs", workspaceId: "ws_x1k6m", platform: "Microsoft Teams", status: "upcoming", attendees: 3, duration: 0, taskCount: 0, decisionCount: 0, hasPDF: false, hasTranscript: false, scheduledAt: "Jul 6, 2026 · 9:00 AM", ownerName: "Priya Rao", ownerInitials: "PR", ownerColor: AVATAR_COLORS[3] },
  { id: "mtg_i9j0", title: "Board Meeting Q2", workspaceName: "NexGen Ventures", workspaceId: "ws_q9j2w", platform: "Zoom", status: "completed", attendees: 12, duration: 90, taskCount: 18, decisionCount: 7, hasPDF: true, hasTranscript: true, scheduledAt: "Jun 30, 2026 · 3:00 PM", ownerName: "Tom Nakamura", ownerInitials: "TN", ownerColor: AVATAR_COLORS[4] },
  { id: "mtg_k1l2", title: "Engineering Retro", workspaceName: "Arcadia Systems", workspaceId: "ws_b3n1c", platform: "Google Meet", status: "completed", attendees: 9, duration: 55, taskCount: 8, decisionCount: 3, hasPDF: true, hasTranscript: true, scheduledAt: "Jun 29, 2026 · 4:00 PM", ownerName: "Kim Lee", ownerInitials: "KL", ownerColor: AVATAR_COLORS[0] },
  { id: "mtg_m3n4", title: "Client Kickoff", workspaceName: "Pulse Creative", workspaceId: "ws_m7d4e", platform: "Zoom", status: "completed", attendees: 5, duration: 38, taskCount: 6, decisionCount: 2, hasPDF: false, hasTranscript: true, scheduledAt: "Jun 28, 2026 · 1:00 PM", ownerName: "Sam Rivera", ownerInitials: "SR", ownerColor: AVATAR_COLORS[1] },
  { id: "mtg_o5p6", title: "Summit AI Strategy", workspaceName: "Summit AI", workspaceId: "ws_v5w6x", platform: "Microsoft Teams", status: "completed", attendees: 7, duration: 74, taskCount: 14, decisionCount: 5, hasPDF: true, hasTranscript: true, scheduledAt: "Jun 27, 2026 · 10:30 AM", ownerName: "Dana Scott", ownerInitials: "DS", ownerColor: AVATAR_COLORS[2] },
];

type FilterTab = "all" | MeetingStatus;
const PAGE_SIZE = 8;

export default function AdminMeetingsPage() {
  const [meetings] = useState<AdminMeeting[]>(MOCK);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterTab>("all");
  const [platformFilter, setPlatformFilter] = useState<"all" | MeetingPlatform>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let r = meetings;
    if (statusFilter !== "all") r = r.filter((m) => m.status === statusFilter);
    if (platformFilter !== "all") r = r.filter((m) => m.platform === platformFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((m) =>
        m.title.toLowerCase().includes(q) ||
        m.workspaceName.toLowerCase().includes(q) ||
        m.ownerName.toLowerCase().includes(q)
      );
    }
    return r;
  }, [meetings, statusFilter, platformFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const counts = {
    all: meetings.length,
    completed: meetings.filter((m) => m.status === "completed").length,
    live: meetings.filter((m) => m.status === "live").length,
    processing: meetings.filter((m) => m.status === "processing").length,
    upcoming: meetings.filter((m) => m.status === "upcoming").length,
  };

  const stats = [
    { label: "Total meetings", value: meetings.length, sub: "+230 today", trend: "neutral", icon: "ti-video", iconBg: "#EFF6FF", iconColor: "#2563EB" },
    { label: "Live now", value: meetings.filter((m) => m.status === "live").length, sub: "currently recording", trend: "up", icon: "ti-broadcast", iconBg: "#FEE2E2", iconColor: "#DC2626" },
    { label: "PDFs generated", value: meetings.filter((m) => m.hasPDF).length, sub: "of completed", trend: "neutral", icon: "ti-file-type-pdf", iconBg: "#F5F3FF", iconColor: "#7C3AED" },
    { label: "Total tasks", value: meetings.reduce((s, m) => s + m.taskCount, 0), sub: "extracted by AI", trend: "up", icon: "ti-checkbox", iconBg: "#ECFDF5", iconColor: "#059669" },
  ];

  return (
    <>
      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", flex: 1 }}>Meetings</div>
        <div style={{ position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF", pointerEvents: "none" }} />
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search meetings..."
            style={{ height: 34, width: 220, padding: "0 12px 0 32px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#FAFAFB", fontFamily: "inherit" }} />
        </div>
        <select value={platformFilter} onChange={(e) => { setPlatformFilter(e.target.value as any); setPage(1); }}
          style={{ height: 34, padding: "0 28px 0 10px", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 13, color: "#374151", background: "#fff", fontFamily: "inherit", cursor: "pointer" }}>
          <option value="all">All platforms</option>
          <option value="Google Meet">Google Meet</option>
          <option value="Zoom">Zoom</option>
          <option value="Microsoft Teams">Teams</option>
        </select>
      </div>

      {/* Status filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "12px 20px", background: "#fff", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
        {(["all", "completed", "live", "processing", "upcoming"] as const).map((f) => (
          <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }}
            style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 8, border: "1px solid", borderColor: statusFilter === f ? "transparent" : "#E5E7EB", color: statusFilter === f ? "#fff" : "#6B7280", background: statusFilter === f ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
            {f === "live" && statusFilter === f && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite" }} />
            )}
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 5px", borderRadius: 6, background: statusFilter === f ? "rgba(255,255,255,.2)" : "#F3F4F6", color: statusFilter === f ? "#fff" : "#9CA3AF" }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 12, padding: "14px 16px", position: "relative" }}>
              <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 10, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: 17, color: s.iconColor }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 500, marginTop: 3, color: s.trend === "up" ? "#059669" : "#9CA3AF" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #F3F4F6", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #F3F4F6" }}>
                {["Meeting", "Workspace", "Platform", "Attendees", "Duration", "Tasks", "PDF", "Status", ""].map((h) => (
                  <th key={h} style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".06em", padding: "10px 12px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 48, color: "#9CA3AF", fontSize: 13 }}>No meetings found</td></tr>
              ) : paginated.map((m) => {
                const status = STATUS_STYLES[m.status];
                return (
                  <tr key={m.id}
                    style={{ borderBottom: "1px solid #F9FAFB", cursor: "pointer", background: "#fff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFB")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>

                    {/* Meeting */}
                    <td style={{ padding: 12, maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: "#111827", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{m.scheduledAt}</div>
                    </td>

                    {/* Workspace */}
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: m.ownerColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {m.ownerInitials}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{m.workspaceName}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.ownerName}</div>
                        </div>
                      </div>
                    </td>

                    {/* Platform */}
                    <td style={{ padding: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <PlatformIcon platform={m.platform} />
                        <span style={{ fontSize: 12, color: "#6B7280" }}>{m.platform === "Microsoft Teams" ? "Teams" : m.platform}</span>
                      </div>
                    </td>

                    {/* Attendees */}
                    <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: "#111827" }}>{m.attendees}</td>

                    {/* Duration */}
                    <td style={{ padding: 12, fontSize: 13, color: "#6B7280" }}>
                      {m.duration > 0 ? `${m.duration} min` : "—"}
                    </td>

                    {/* Tasks */}
                    <td style={{ padding: 12 }}>
                      {m.taskCount > 0 ? (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#7C3AED", background: "#F5F3FF", padding: "2px 8px", borderRadius: 6 }}>
                          {m.taskCount}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "#D1D5DB" }}>—</span>
                      )}
                    </td>

                    {/* PDF */}
                    <td style={{ padding: 12 }}>
                      {m.hasPDF ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#059669", background: "#ECFDF5", padding: "2px 8px", borderRadius: 6 }}>
                          <i className="ti ti-check" style={{ fontSize: 11 }} />
                          Ready
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "#D1D5DB" }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 20, background: status.bg, color: status.color, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        {m.status === "live" && (
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
                        )}
                        {status.label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px", textAlign: "right", whiteSpace: "nowrap" }}>
                      {[
                        { icon: "ti-eye", danger: false, title: "View" },
                        { icon: "ti-file-type-pdf", danger: false, title: "PDF" },
                        { icon: "ti-trash", danger: true, title: "Delete" },
                      ].map((btn) => (
                        <button key={btn.icon} title={btn.title}
                          style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginLeft: 4 }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = btn.danger ? "#FEF2F2" : "#F9FAFB"; e.currentTarget.style.borderColor = btn.danger ? "#FECACA" : "#D1D5DB"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#E5E7EB"; }}>
                          <i className={`ti ${btn.icon}`} style={{ fontSize: 14, color: btn.danger ? "#DC2626" : "#6B7280" }} />
                        </button>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} meetings
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === 1 ? 0.4 : 1 }}>
              <i className="ti ti-chevron-left" style={{ fontSize: 14 }} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ width: 30, height: 30, borderRadius: 7, border: page === p ? "none" : "1px solid #E5E7EB", background: page === p ? "linear-gradient(135deg,#7C3AED,#6D28D9)" : "#fff", color: page === p ? "#fff" : "#6B7280", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: page === totalPages || totalPages === 0 ? 0.4 : 1 }}>
              <i className="ti ti-chevron-right" style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
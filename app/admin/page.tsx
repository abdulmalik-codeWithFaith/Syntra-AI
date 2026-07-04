import StatCard from "@/components/admin/StatCard";

// TODO: replace with real fetched data
const stats = {
  totalWorkspaces: 482,
  totalUsers: 1904,
  totalMeetings: 15230,
  totalPDFs: 9871,
  totalTasks: 26410,
  mrr: 18420,
  activeSubscriptions: { starter: 210, pro: 180, team: 62 },
};

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Overview</h1>
        <p className="text-sm text-slate-500">Platform-wide stats at a glance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Workspaces" value={stats.totalWorkspaces} />
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Meetings Processed" value={stats.totalMeetings} />
        <StatCard label="PDFs Generated" value={stats.totalPDFs} />
        <StatCard label="Tasks Extracted" value={stats.totalTasks} />
        <StatCard label="MRR" value={`$${stats.mrr.toLocaleString()}`} sublabel="+4.2% vs last month" trend="up" />
        <StatCard label="Active Subscriptions" value={
          stats.activeSubscriptions.starter + stats.activeSubscriptions.pro + stats.activeSubscriptions.team
        } />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Subscriptions by Plan</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500">Starter</p>
            <p className="text-lg font-semibold text-white">{stats.activeSubscriptions.starter}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Pro</p>
            <p className="text-lg font-semibold text-white">{stats.activeSubscriptions.pro}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Team</p>
            <p className="text-lg font-semibold text-white">{stats.activeSubscriptions.team}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
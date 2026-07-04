// components/admin/StatCard.tsx
export default function StatCard({
  label,
  value,
  sublabel,
  trend,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {sublabel && (
        <p
          className={`mt-1 text-xs ${
            trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-500"
          }`}
        >
          {sublabel}
        </p>
      )}
    </div>
  );
}
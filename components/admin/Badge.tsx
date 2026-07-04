// components/admin/Badge.tsx
const COLORS: Record<string, string> = {
  gray: "bg-slate-700/50 text-slate-300",
  green: "bg-emerald-500/10 text-emerald-400",
  yellow: "bg-yellow-500/10 text-yellow-400",
  red: "bg-red-500/10 text-red-400",
  blue: "bg-blue-500/10 text-blue-400",
  purple: "bg-purple-500/10 text-purple-400",
};

export default function Badge({
  children,
  color = "gray",
}: {
  children: React.ReactNode;
  color?: keyof typeof COLORS;
}) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[color]}`}>
      {children}
    </span>
  );
}
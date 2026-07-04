import StatCard from "@/components/admin/StatCard";
import { Table, Thead, Th, Tr, Td } from "@/components/admin/Table";

// TODO: replace with real fetched data
const usage = [
  { id: "1", workspace: "Acme Inc", minutesUsed: 1240, quota: 2000, cost: "$18.60" },
  { id: "2", workspace: "Northwind", minutesUsed: 4310, quota: 5000, cost: "$64.65" },
  { id: "3", workspace: "Solo Founder Co", minutesUsed: 180, quota: 300, cost: "$2.70" },
];

export default function RecallUsagePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Recall.ai Usage</h1>
        <p className="text-sm text-slate-500">Bot minutes, cost, and quota tracking per workspace</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Bot Minutes (30d)" value="5,730" />
        <StatCard label="Total Cost (30d)" value="$85.95" />
        <StatCard label="Workspaces Near Quota" value={2} sublabel="≥ 80% usage" trend="down" />
      </div>

      <Table>
        <Thead>
          <Th>Workspace</Th>
          <Th>Minutes Used</Th>
          <Th>Quota</Th>
          <Th>Usage</Th>
          <Th>Cost</Th>
        </Thead>
        <tbody>
          {usage.map((u) => {
            const pct = Math.round((u.minutesUsed / u.quota) * 100);
            return (
              <Tr key={u.id}>
                <Td>{u.workspace}</Td>
                <Td>{u.minutesUsed}</Td>
                <Td>{u.quota}</Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 rounded-full bg-slate-800">
                      <div
                        className={`h-1.5 rounded-full ${pct >= 80 ? "bg-red-500" : "bg-indigo-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{pct}%</span>
                  </div>
                </Td>
                <Td>{u.cost}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
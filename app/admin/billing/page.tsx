import StatCard from "@/components/admin/StatCard";
import { Table, Thead, Th, Tr, Td } from "@/components/admin/Table";
import Badge from "@/components/admin/Badge";

// TODO: replace with real Stripe-derived data
const payments = [
  { id: "1", workspace: "Acme Inc", amount: "$49.00", status: "paid", date: "2026-07-01" },
  { id: "2", workspace: "Northwind", amount: "$199.00", status: "paid", date: "2026-07-01" },
  { id: "3", workspace: "Solo Founder Co", amount: "$19.00", status: "failed", date: "2026-06-30" },
];

const statusColor: Record<string, "green" | "red"> = {
  paid: "green",
  failed: "red",
};

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Billing & Revenue</h1>
        <p className="text-sm text-slate-500">Stripe subscriptions and payment activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="MRR" value="$18,420" sublabel="+4.2% vs last month" trend="up" />
        <StatCard label="Active Subscriptions" value={452} />
        <StatCard label="Failed Payments (7d)" value={6} sublabel="Needs attention" trend="down" />
        <StatCard label="Churn Rate" value="2.1%" sublabel="last 30 days" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">MRR Trend</h2>
        {/* TODO: plug in a chart lib (recharts) here */}
        <div className="flex h-48 items-center justify-center rounded-md border border-dashed border-slate-700 text-sm text-slate-500">
          Chart placeholder — MRR over time
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-white">Recent Payments</h2>
        <Table>
          <Thead>
            <Th>Workspace</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </Thead>
          <tbody>
            {payments.map((p) => (
              <Tr key={p.id}>
                <Td>{p.workspace}</Td>
                <Td>{p.amount}</Td>
                <Td><Badge color={statusColor[p.status]}>{p.status}</Badge></Td>
                <Td>{p.date}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
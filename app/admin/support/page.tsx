import { Table, Thead, Th, Tr, Td } from "@/components/admin/Table";
import Badge from "@/components/admin/Badge";

// TODO: replace with real fetched data
const flaggedTasks = [
  { id: "1", title: "Follow up with legal", workspace: "Acme Inc", issue: "No owner" },
  { id: "2", title: "Send updated proposal", workspace: "Northwind", issue: "No deadline" },
];

const errorLogs = [
  { id: "1", message: "Transcript generation timeout", workspace: "Solo Founder Co", time: "2026-07-03 14:12" },
  { id: "2", message: "PDF export failed: null buffer", workspace: "Acme Inc", time: "2026-07-02 09:05" },
];

const failedWebhooks = [
  { id: "1", source: "Stripe", event: "invoice.payment_failed", time: "2026-06-30 22:41" },
  { id: "2", source: "Recall.ai", event: "bot.status_change", time: "2026-07-01 11:03" },
];

export default function SupportFlagsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-white">Support / Flags</h1>
        <p className="text-sm text-slate-500">Items that need manual attention</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-white">Flagged Tasks</h2>
        <Table>
          <Thead>
            <Th>Task</Th>
            <Th>Workspace</Th>
            <Th>Issue</Th>
          </Thead>
          <tbody>
            {flaggedTasks.map((t) => (
              <Tr key={t.id}>
                <Td>{t.title}</Td>
                <Td>{t.workspace}</Td>
                <Td><Badge color="yellow">{t.issue}</Badge></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-white">Error Logs</h2>
        <Table>
          <Thead>
            <Th>Message</Th>
            <Th>Workspace</Th>
            <Th>Time</Th>
          </Thead>
          <tbody>
            {errorLogs.map((e) => (
              <Tr key={e.id}>
                <Td><Badge color="red">{e.message}</Badge></Td>
                <Td>{e.workspace}</Td>
                <Td>{e.time}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-white">Failed Webhooks</h2>
        <Table>
          <Thead>
            <Th>Source</Th>
            <Th>Event</Th>
            <Th>Time</Th>
            <Th>Actions</Th>
          </Thead>
          <tbody>
            {failedWebhooks.map((w) => (
              <Tr key={w.id}>
                <Td>{w.source}</Td>
                <Td>{w.event}</Td>
                <Td>{w.time}</Td>
                <Td>
                  <button className="text-xs text-indigo-400 hover:underline">Retry</button>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
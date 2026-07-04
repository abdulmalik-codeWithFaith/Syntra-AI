import { Table, Thead, Th, Tr, Td } from "@/components/admin/Table";
import Badge from "@/components/admin/Badge";

// TODO: replace with real fetched data
const meetings = [
  { id: "1", title: "Q2 Planning", workspace: "Acme Inc", status: "completed", duration: "42m", transcript: true, pdf: true, date: "2026-07-01" },
  { id: "2", title: "Client Sync", workspace: "Northwind", status: "processing", duration: "18m", transcript: false, pdf: false, date: "2026-07-03" },
  { id: "3", title: "Weekly Standup", workspace: "Solo Founder Co", status: "failed", duration: "9m", transcript: false, pdf: false, date: "2026-06-29" },
];

const statusColor: Record<string, "green" | "yellow" | "red"> = {
  completed: "green",
  processing: "yellow",
  failed: "red",
};

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Meetings</h1>
          <p className="text-sm text-slate-500">All meetings across every workspace</p>
        </div>
        <div className="flex gap-2">
          <select className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500">
            <option>All Statuses</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Failed</option>
          </select>
          <input
            placeholder="Search meetings..."
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <Table>
        <Thead>
          <Th>Title</Th>
          <Th>Workspace</Th>
          <Th>Status</Th>
          <Th>Duration</Th>
          <Th>Transcript</Th>
          <Th>PDF</Th>
          <Th>Date</Th>
        </Thead>
        <tbody>
          {meetings.map((m) => (
            <Tr key={m.id}>
              <Td>{m.title}</Td>
              <Td>{m.workspace}</Td>
              <Td><Badge color={statusColor[m.status]}>{m.status}</Badge></Td>
              <Td>{m.duration}</Td>
              <Td>{m.transcript ? "✅" : "—"}</Td>
              <Td>{m.pdf ? "✅" : "—"}</Td>
              <Td>{m.date}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
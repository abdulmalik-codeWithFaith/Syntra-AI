import { Table, Thead, Th, Tr, Td } from "@/components/admin/Table";
import Badge from "@/components/admin/Badge";

// TODO: replace with real fetched data
const workspaces = [
  { id: "1", name: "Acme Inc", owner: "Jane Doe", plan: "Pro", members: 12, meetings: 340, created: "2025-02-11", lastActive: "2026-07-01" },
  { id: "2", name: "Northwind", owner: "John Smith", plan: "Team", members: 28, meetings: 890, created: "2024-11-04", lastActive: "2026-07-03" },
  { id: "3", name: "Solo Founder Co", owner: "Amaka O.", plan: "Starter", members: 1, meetings: 22, created: "2026-05-20", lastActive: "2026-06-28" },
];

const planColor: Record<string, "gray" | "blue" | "purple"> = {
  Starter: "gray",
  Pro: "blue",
  Team: "purple",
};

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Workspaces</h1>
          <p className="text-sm text-slate-500">{workspaces.length} total workspaces</p>
        </div>
        <input
          placeholder="Search workspaces..."
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        />
      </div>

      <Table>
        <Thead>
          <Th>Workspace</Th>
          <Th>Owner</Th>
          <Th>Plan</Th>
          <Th>Members</Th>
          <Th>Meetings</Th>
          <Th>Created</Th>
          <Th>Last Active</Th>
          <Th>Actions</Th>
        </Thead>
        <tbody>
          {workspaces.map((ws) => (
            <Tr key={ws.id}>
              <Td>{ws.name}</Td>
              <Td>{ws.owner}</Td>
              <Td><Badge color={planColor[ws.plan]}>{ws.plan}</Badge></Td>
              <Td>{ws.members}</Td>
              <Td>{ws.meetings}</Td>
              <Td>{ws.created}</Td>
              <Td>{ws.lastActive}</Td>
              <Td>
                <div className="flex gap-2">
                  <button className="text-xs text-indigo-400 hover:underline">View</button>
                  <button className="text-xs text-slate-400 hover:underline">Change Plan</button>
                  <button className="text-xs text-yellow-400 hover:underline">Suspend</button>
                  <button className="text-xs text-red-400 hover:underline">Delete</button>
                </div>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
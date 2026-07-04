import { Table, Thead, Th, Tr, Td } from "@/components/admin/Table";
import Badge from "@/components/admin/Badge";

// TODO: replace with real fetched data
const users = [
  { id: "1", email: "jane@acme.com", name: "Jane Doe", workspaces: 1, plan: "Pro", joined: "2025-02-11", lastLogin: "2026-07-04" },
  { id: "2", email: "john@northwind.com", name: "John Smith", workspaces: 2, plan: "Team", joined: "2024-11-04", lastLogin: "2026-07-02" },
  { id: "3", email: "amaka@solo.dev", name: "Amaka O.", workspaces: 1, plan: "Starter", joined: "2026-05-20", lastLogin: "2026-06-30" },
];

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Users</h1>
          <p className="text-sm text-slate-500">{users.length} total users</p>
        </div>
        <input
          placeholder="Search users..."
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
        />
      </div>

      <Table>
        <Thead>
          <Th>Name</Th>
          <Th>Email</Th>
          <Th>Workspaces</Th>
          <Th>Plan</Th>
          <Th>Joined</Th>
          <Th>Last Login</Th>
          <Th>Actions</Th>
        </Thead>
        <tbody>
          {users.map((u) => (
            <Tr key={u.id}>
              <Td>{u.name}</Td>
              <Td>{u.email}</Td>
              <Td>{u.workspaces}</Td>
              <Td><Badge color="blue">{u.plan}</Badge></Td>
              <Td>{u.joined}</Td>
              <Td>{u.lastLogin}</Td>
              <Td>
                <div className="flex gap-2">
                  <button className="text-xs text-indigo-400 hover:underline">View</button>
                  <button className="text-xs text-slate-400 hover:underline">Impersonate</button>
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
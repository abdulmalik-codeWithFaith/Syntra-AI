"use client";

// context/WorkspaceContext.tsx
// Multi-workspace support — one login, many workspaces, switchable like Slack.
// Exposes: current workspace, all workspaces, member role, and a switch function.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "./AuthContext";
import type { WorkspaceDoc, MemberDoc, AgentConfigDoc, MemberRole } from "@/lib/firestore";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkspaceWithRole {
  workspace: WorkspaceDoc;
  role: MemberRole;
  memberDoc: MemberDoc;
}

interface WorkspaceContextValue {
  // Current active workspace
  currentWorkspace: WorkspaceDoc | null;
  currentRole: MemberRole | null;
  currentMember: MemberDoc | null;
  agentConfig: AgentConfigDoc | null;

  // All workspaces the user belongs to
  workspaces: WorkspaceWithRole[];

  loading: boolean;

  // Slack-like workspace switch — updates Firestore + local state instantly
  switchWorkspace: (workspaceId: string) => Promise<void>;

  // Permission helpers — use these to gate UI features
  can: {
    manageTeam: boolean;       // Owner + Admin
    manageAgent: boolean;      // Owner + Admin
    manageIntegrations: boolean; // Owner + Admin
    manageBilling: boolean;    // Owner only
    viewReports: boolean;      // All roles
    viewMeetings: boolean;     // All roles
    viewTasks: boolean;        // All roles
    deleteWorkspace: boolean;  // Owner only
  };
}

// ─── Permissions map ──────────────────────────────────────────────────────────

function buildPermissions(role: MemberRole | null) {
  const isOwner = role === "Owner";
  const isAdmin = role === "Admin";
  const isMember = role === "Member";

  return {
    manageTeam: isOwner || isAdmin,
    manageAgent: isOwner || isAdmin,
    manageIntegrations: isOwner || isAdmin,
    manageBilling: isOwner,
    viewReports: isOwner || isAdmin || isMember,
    viewMeetings: isOwner || isAdmin || isMember,
    viewTasks: isOwner || isAdmin || isMember,
    deleteWorkspace: isOwner,
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user, userDoc } = useAuth();

  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceDoc | null>(null);
  const [currentRole, setCurrentRole] = useState<MemberRole | null>(null);
  const [currentMember, setCurrentMember] = useState<MemberDoc | null>(null);
  const [agentConfig, setAgentConfig] = useState<AgentConfigDoc | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceWithRole[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all workspaces the user belongs to
  const loadWorkspaces = useCallback(async () => {
    if (!user || !userDoc?.workspaceIds?.length) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setCurrentRole(null);
      setLoading(false);
      return;
    }

    const results: WorkspaceWithRole[] = [];

    for (const wsId of userDoc.workspaceIds) {
      const [wsSnap, memberSnap] = await Promise.all([
        getDoc(doc(db, "workspaces", wsId)),
        getDoc(doc(db, "workspaces", wsId, "members", user.uid)),
      ]);

      if (wsSnap.exists() && memberSnap.exists()) {
        const workspace = wsSnap.data() as WorkspaceDoc;
        const memberDoc = memberSnap.data() as MemberDoc;
        results.push({ workspace, role: memberDoc.role, memberDoc });
      }
    }

    setWorkspaces(results);

    // Resolve current workspace
    const currentId = userDoc.currentWorkspaceId;
    const active = results.find((r) => r.workspace.id === currentId) ?? results[0];

    if (active) {
      setCurrentWorkspace(active.workspace);
      setCurrentRole(active.role);
      setCurrentMember(active.memberDoc);

      // Load agent config
      const agentSnap = await getDoc(
        doc(db, "workspaces", active.workspace.id, "agent", "config")
      );
      setAgentConfig(agentSnap.exists() ? (agentSnap.data() as AgentConfigDoc) : null);
    }

    setLoading(false);
  }, [user, userDoc]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  // ─── Switch workspace ──────────────────────────────────────────────────────
  // Instant local update (like Slack) + persists to Firestore

  const switchWorkspace = useCallback(
    async (workspaceId: string) => {
      if (!user) return;

      const target = workspaces.find((w) => w.workspace.id === workspaceId);
      if (!target) return;

      setCurrentWorkspace(target.workspace);
      setCurrentRole(target.role);
      setCurrentMember(target.memberDoc);

      // Load agent config for new workspace
      const agentSnap = await getDoc(
        doc(db, "workspaces", workspaceId, "agent", "config")
      );
      setAgentConfig(agentSnap.exists() ? (agentSnap.data() as AgentConfigDoc) : null);

      // Persist the active workspace to user doc
      await updateDoc(doc(db, "users", user.uid), {
        currentWorkspaceId: workspaceId,
        updatedAt: serverTimestamp(),
      });
    },
    [user, workspaces]
  );

  const can = buildPermissions(currentRole);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        currentRole,
        currentMember,
        agentConfig,
        workspaces,
        loading,
        switchWorkspace,
        can,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}
// types/firestore.ts
// Single source of truth for every Firestore document shape in Syntra AI

import { Timestamp } from "firebase/firestore";

// ─── User ──────────────────────────────────────────────────────────────────────
// Collection: users/{uid}

export interface UserDoc {
  uid: string;
  email: string;
  fullName: string;
  photoURL?: string;
  workspaceIds: string[];           // workspaces this user belongs to
  currentWorkspaceId: string;       // active workspace
  onboardingComplete: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Workspace ────────────────────────────────────────────────────────────────
// Collection: workspaces/{workspaceId}

export type WorkspacePlan = "starter" | "pro" | "team";

export interface WorkspaceDoc {
  id: string;
  companyName: string;
  workspaceName: string;
  ownerId: string;                  // uid of owner
  plan: WorkspacePlan;
  timezone: string;
  language: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Workspace Member ─────────────────────────────────────────────────────────
// Collection: workspaces/{workspaceId}/members/{uid}

export type MemberRole = "Owner" | "Admin" | "Member";
export type MemberStatus = "Active" | "Invited";

export interface MemberDoc {
  uid: string;
  email: string;
  fullName: string;
  photoURL?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Timestamp | null;
  invitedAt: Timestamp;
}

// ─── Agent Config ─────────────────────────────────────────────────────────────
// Document: workspaces/{workspaceId}/agent/config

export type AgentMode = "Assistant" | "Observer" | "Proactive";
export type VoiceOption = "Aria" | "Nova" | "Orion" | "Sage";

export interface AgentConfigDoc {
  agentName: string;
  mode: AgentMode;
  voiceEnabled: boolean;
  voice: VoiceOption;
  generatePDFs: boolean;
  taskTracking: boolean;
  meetingReminders: boolean;
  autoJoin: boolean;
  flagMissingOwners: boolean;
  flagMissingDeadlines: boolean;
  status: "active" | "paused";
  connectedPlatforms: {
    googleMeet: boolean;
    zoom: boolean;
    microsoftTeams: boolean;
  };
  meetingLink?: string;
  updatedAt: Timestamp;
}

// ─── Meeting ──────────────────────────────────────────────────────────────────
// Collection: workspaces/{workspaceId}/meetings/{meetingId}

export type MeetingStatus = "Upcoming" | "Live" | "Processing" | "Completed";
export type MeetingPlatform = "Google Meet" | "Zoom" | "Microsoft Teams";

export interface MeetingAttendee {
  uid?: string;
  name: string;
  email?: string;
  initials: string;
  color: string;
}

export interface MeetingDoc {
  // id: string;
  workspaceId: string;
  title: string;
  platform: MeetingPlatform;
  meetingLink: string;
  status: MeetingStatus;
  scheduledAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  durationMinutes?: number;
  attendees: MeetingAttendee[];
  summary?: string;               // AI-generated after meeting
  pdfUrl?: string;                // Cloudinary URL
  pdfSizeKB?: number;
  taskCount: number;
  decisionCount: number;
  transcriptGenerated: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Transcript Line ──────────────────────────────────────────────────────────
// Collection: workspaces/{workspaceId}/meetings/{meetingId}/transcript/{lineId}

export interface TranscriptLineDoc {
  id: string;
  speaker: string;
  isAgent: boolean;
  text: string;
  timestampMs: number;            // ms from meeting start
  createdAt: Timestamp;
}

// ─── Task ─────────────────────────────────────────────────────────────────────
// Collection: workspaces/{workspaceId}/tasks/{taskId}

export type TaskStatus = "Pending" | "In Progress" | "Complete";

export interface TaskDoc {
  // id: string;
  workspaceId: string;
  meetingId: string;
  meetingTitle: string;
  title: string;
  ownerUid?: string;
  ownerName?: string;
  ownerInitials?: string;
  ownerColor?: string;
  deadline?: Timestamp;
  status: TaskStatus;
  overdue: boolean;
  extractedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Decision ─────────────────────────────────────────────────────────────────
// Collection: workspaces/{workspaceId}/meetings/{meetingId}/decisions/{decisionId}

export interface DecisionDoc {
  id: string;
  text: string;
  timestampMs: number;            // ms from meeting start
  createdAt: Timestamp;
}

// ─── Notification ────────────────────────────────────────────────────────────
// Collection: users/{uid}/notifications/{notificationId}

export type NotificationType =
  | "task_extracted"
  | "task_overdue"
  | "task_completed"
  | "meeting_joined"
  | "meeting_summary"
  | "pdf_generated"
  | "flag_no_owner"
  | "flag_no_deadline"
  | "team_invite"
  | "team_accepted"
  | "agent_alert";

export interface NotificationDoc {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  meetingId?: string;
  meetingTitle?: string;
  actionLabel?: string;
  actionHref?: string;
  createdAt: Timestamp;
}

// ─── Notification Preferences ────────────────────────────────────────────────
// Document: users/{uid}/prefs/notifications

export interface NotificationPrefsDoc {
  emailSummaries: boolean;
  taskReminders: boolean;
  meetingReminders: boolean;
  teamInviteAlerts: boolean;
  weeklyDigest: boolean;
  agentAlerts: boolean;
  updatedAt: Timestamp;
}
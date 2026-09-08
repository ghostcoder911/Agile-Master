export const TICKET_TYPES = ["story", "bug", "task", "spike"] as const;
export const TICKET_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
] as const;
export const PRIORITIES = ["critical", "high", "medium", "low"] as const;
export const SPRINT_STATUSES = ["planning", "active", "completed"] as const;
export const MEMBER_ROLES = [
  "product_owner",
  "scrum_master",
  "engineer",
  "designer",
  "qa",
] as const;
export const MOODS = ["on_track", "stretched", "blocked"] as const;
export const FOLLOW_UP_TYPES = [
  "due_soon",
  "due_today",
  "overdue",
  "stalled",
  "blocked",
  "missing_standup",
] as const;
export const FOLLOW_UP_STATUSES = [
  "pending",
  "sent",
  "acknowledged",
  "dismissed",
] as const;

export type TicketType = (typeof TICKET_TYPES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type SprintStatus = (typeof SPRINT_STATUSES)[number];
export type MemberRole = (typeof MEMBER_ROLES)[number];
export type Mood = (typeof MOODS)[number];
export type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];
export type FollowUpStatus = (typeof FOLLOW_UP_STATUSES)[number];

export type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  title: string;
  initials: string;
  hue: number;
  weeklyCapacityHours: number;
  skills: string[];
};

export type Sprint = {
  id: string;
  name: string;
  goal: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
};

export type Ticket = {
  id: string;
  key: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: Priority;
  storyPoints: number | null;
  dueDate: string | null;
  labels: string[];
  sprintId: string | null;
  assigneeId: string | null;
  reporterId: string;
  blockedReason: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type WorkLog = {
  id: string;
  memberId: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  hoursLogged: number;
  mood: Mood;
  ticketIds: string[];
  createdAt: string;
};

export type Comment = {
  id: string;
  ticketId: string;
  memberId: string;
  body: string;
  createdAt: string;
};

export type FollowUp = {
  id: string;
  ticketId: string | null;
  memberId: string;
  type: FollowUpType;
  message: string;
  status: FollowUpStatus;
  createdAt: string;
  sentAt: string | null;
};

export type Activity = {
  id: string;
  type: string;
  message: string;
  memberId: string | null;
  ticketId: string | null;
  createdAt: string;
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type WorkspaceSettings = {
  projectName: string;
  projectKey: string;
  teamName: string;
  nextTicketNumber: number;
};

export type Workspace = {
  settings: WorkspaceSettings;
  members: Member[];
  sprints: Sprint[];
  tickets: Ticket[];
  workLogs: WorkLog[];
  comments: Comment[];
  followUps: FollowUp[];
  activity: Activity[];
  agentMessages: AgentMessage[];
};

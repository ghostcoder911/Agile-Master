import type {
  Member,
  MemberRole,
  Mood,
  Priority,
  Ticket,
  TicketStatus,
  TicketType,
} from "@/lib/types";

export const statusLabel: Record<TicketStatus, string> = {
  backlog: "Backlog",
  todo: "To do",
  in_progress: "In progress",
  in_review: "In review",
  done: "Done",
};

export const statusOrder: TicketStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
];

export const boardColumns: TicketStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
];

export const typeLabel: Record<TicketType, string> = {
  story: "Story",
  bug: "Bug",
  task: "Task",
  spike: "Spike",
};

export const priorityLabel: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const roleLabel: Record<MemberRole, string> = {
  product_owner: "Product Owner",
  scrum_master: "Scrum Master",
  engineer: "Engineering",
  designer: "Design",
  qa: "QA",
};

export const moodLabel: Record<Mood, string> = {
  on_track: "On track",
  stretched: "Stretched",
  blocked: "Blocked",
};

export function memberName(members: Member[], id: string | null) {
  if (!id) return "Unassigned";
  return members.find((m) => m.id === id)?.name ?? "Unknown";
}

export function firstName(name: string) {
  return name.split(" ")[0];
}

export function openStatuses(status: TicketStatus) {
  return status !== "done";
}

export function wipTickets(tickets: Ticket[], memberId: string) {
  return tickets.filter(
    (t) =>
      t.assigneeId === memberId &&
      (t.status === "in_progress" || t.status === "in_review")
  );
}

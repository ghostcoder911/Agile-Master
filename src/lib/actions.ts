"use server";

import { revalidatePath } from "next/cache";
import {
  dueBuckets,
  memberLoads,
  missingStandups,
  suggestAssignee,
} from "@/lib/analytics";
import { nowIso, relativeTime, todayKey } from "@/lib/dates";
import { firstName, memberName, statusLabel } from "@/lib/format";
import { uid } from "@/lib/ids";
import { getActor, setActorId } from "@/lib/session";
import { readWorkspace, resetWorkspace, updateWorkspace } from "@/lib/store";
import type {
  FollowUp,
  FollowUpType,
  Mood,
  Priority,
  TicketStatus,
  TicketType,
  Workspace,
} from "@/lib/types";

function bump(paths: string[] = ["/"]) {
  const unique = new Set([
    "/",
    "/board",
    "/backlog",
    "/sprints",
    "/standup",
    "/team",
    "/analytics",
    "/agent",
    "/follow-ups",
    ...paths,
  ]);
  for (const p of unique) revalidatePath(p);
}

export async function switchActor(formData: FormData) {
  const id = String(formData.get("memberId") ?? "");
  const ws = readWorkspace();
  if (ws.members.some((m) => m.id === id)) await setActorId(id);
  bump();
}

export async function createTicket(formData: FormData) {
  const actor = await getActor();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  let key = "";
  await updateWorkspace((ws) => {
    key = `${ws.settings.projectKey}-${ws.settings.nextTicketNumber}`;
    ws.settings.nextTicketNumber += 1;
    const due = String(formData.get("dueDate") ?? "");
    const points = String(formData.get("storyPoints") ?? "");
    const sprintId = String(formData.get("sprintId") ?? "") || null;
    const assigneeId = String(formData.get("assigneeId") ?? "") || null;
    ws.tickets.unshift({
      id: key,
      key,
      title,
      description: String(formData.get("description") ?? "").trim(),
      type: (String(formData.get("type") ?? "task") as TicketType) || "task",
      status: (String(formData.get("status") ?? "backlog") as TicketStatus) || "backlog",
      priority: (String(formData.get("priority") ?? "medium") as Priority) || "medium",
      storyPoints: points ? Number(points) : null,
      dueDate: due || null,
      labels: String(formData.get("labels") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      sprintId,
      assigneeId,
      reporterId: actor.id,
      blockedReason: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      completedAt: null,
    });
    ws.activity.unshift({
      id: uid("act"),
      type: "created",
      message: `${actor.name} opened ${key}: ${title}`,
      memberId: actor.id,
      ticketId: key,
      createdAt: nowIso(),
    });
  });
  bump([`/tickets/${key}`]);
  return { ok: true, key };
}

export async function updateTicketFields(ticketId: string, patch: Partial<{
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  type: TicketType;
  storyPoints: number | null;
  dueDate: string | null;
  assigneeId: string | null;
  sprintId: string | null;
  labels: string[];
  blockedReason: string | null;
}>) {
  const actor = await getActor();
  await updateWorkspace((ws) => {
    const ticket = ws.tickets.find((t) => t.id === ticketId || t.key === ticketId);
    if (!ticket) return;
    const prevStatus = ticket.status;
    Object.assign(ticket, patch, { updatedAt: nowIso() });
    if (patch.status && patch.status !== prevStatus) {
      ticket.completedAt = patch.status === "done" ? nowIso() : null;
      ws.activity.unshift({
        id: uid("act"),
        type: "status",
        message: `${actor.name} moved ${ticket.key} to ${statusLabel[patch.status]}.`,
        memberId: actor.id,
        ticketId: ticket.id,
        createdAt: nowIso(),
      });
    } else if (patch.assigneeId !== undefined) {
      ws.activity.unshift({
        id: uid("act"),
        type: "assign",
        message: `${actor.name} assigned ${ticket.key} to ${memberName(ws.members, patch.assigneeId)}.`,
        memberId: actor.id,
        ticketId: ticket.id,
        createdAt: nowIso(),
      });
    } else {
      ws.activity.unshift({
        id: uid("act"),
        type: "update",
        message: `${actor.name} updated ${ticket.key}.`,
        memberId: actor.id,
        ticketId: ticket.id,
        createdAt: nowIso(),
      });
    }
  });
  bump([`/tickets/${ticketId}`]);
}

export async function moveTicket(ticketId: string, status: TicketStatus) {
  await updateTicketFields(ticketId, { status });
}

export async function assignTicket(ticketId: string, assigneeId: string | null) {
  await updateTicketFields(ticketId, { assigneeId });
}

export async function addComment(formData: FormData) {
  const actor = await getActor();
  const ticketId = String(formData.get("ticketId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await updateWorkspace((ws) => {
    ws.comments.push({
      id: uid("c"),
      ticketId,
      memberId: actor.id,
      body,
      createdAt: nowIso(),
    });
    ws.activity.unshift({
      id: uid("act"),
      type: "comment",
      message: `${actor.name} commented on ${ticketId}.`,
      memberId: actor.id,
      ticketId,
      createdAt: nowIso(),
    });
  });
  bump([`/tickets/${ticketId}`]);
}

export async function submitStandup(formData: FormData) {
  const actor = await getActor();
  const date = String(formData.get("date") ?? todayKey());
  const yesterday = String(formData.get("yesterday") ?? "").trim();
  const today = String(formData.get("today") ?? "").trim();
  if (!yesterday && !today) return;

  await updateWorkspace((ws) => {
    const existing = ws.workLogs.find((l) => l.memberId === actor.id && l.date === date);
    const ticketIds = formData.getAll("ticketIds").map(String);
    const entry = {
      id: existing?.id ?? uid("wl"),
      memberId: actor.id,
      date,
      yesterday,
      today,
      blockers: String(formData.get("blockers") ?? "").trim(),
      hoursLogged: Number(formData.get("hoursLogged") ?? 0) || 0,
      mood: (String(formData.get("mood") ?? "on_track") as Mood) || "on_track",
      ticketIds,
      createdAt: existing?.createdAt ?? nowIso(),
    };
    if (existing) {
      Object.assign(existing, entry);
    } else {
      ws.workLogs.unshift(entry);
    }
    ws.activity.unshift({
      id: uid("act"),
      type: "log",
      message: `${actor.name} submitted a daily log (${entry.hoursLogged}h, ${entry.mood.replace("_", " ")}).`,
      memberId: actor.id,
      ticketId: ticketIds[0] ?? null,
      createdAt: nowIso(),
    });
  });
  bump();
}

export async function createSprint(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const goal = String(formData.get("goal") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");
  if (!name || !startDate || !endDate) return;
  await updateWorkspace((ws) => {
    ws.sprints.unshift({
      id: uid("sprint"),
      name,
      goal,
      status: "planning",
      startDate,
      endDate,
    });
  });
  bump();
}

export async function activateSprint(sprintId: string) {
  await updateWorkspace((ws) => {
    for (const s of ws.sprints) {
      if (s.status === "active") s.status = "completed";
      if (s.id === sprintId) s.status = "active";
    }
  });
  bump();
}

export async function completeSprint(sprintId: string) {
  await updateWorkspace((ws) => {
    const sprint = ws.sprints.find((s) => s.id === sprintId);
    if (sprint) sprint.status = "completed";
  });
  bump();
}

function followUpMessage(ws: Workspace, type: FollowUpType, memberId: string, ticketId: string | null) {
  const member = ws.members.find((m) => m.id === memberId);
  const ticket = ws.tickets.find((t) => t.id === ticketId);
  const name = firstName(member?.name ?? "there");
  if (!ticket) {
    return `${name} — you have not filed today's daily log yet. Standup is the team's radar. Two lines on yesterday, today, and blockers is enough.`;
  }
  const due = ticket.dueDate ? `Due ${ticket.dueDate}.` : "No due date on the card.";
  const last = `Last updated ${relativeTime(ticket.updatedAt)}.`;
  if (type === "overdue") {
    return `${name} — ${ticket.key} (${ticket.title}) is past due and still ${statusLabel[ticket.status]}. ${last} ${ticket.blockedReason ? `Blocker: ${ticket.blockedReason}` : "Please post a status, re-date it, or pull it from the sprint so the board stays honest."}`;
  }
  if (type === "due_today") {
    return `${name} — ${ticket.key} is due today. It is ${statusLabel[ticket.status]}. ${last} If it will not land, say so before end of day.`;
  }
  if (type === "due_soon") {
    return `${name} — ${ticket.key} is due soon. ${due} Current status: ${statusLabel[ticket.status]}. ${last}`;
  }
  if (type === "blocked") {
    return `${name} — ${ticket.key} is blocked${ticket.blockedReason ? `: ${ticket.blockedReason}` : "."} Who owns the unblock, and what is the next visible step?`;
  }
  return `${name} — ${ticket.key} has gone quiet (${last}). A one-line update keeps the sprint forecast real.`;
}

export async function runDueDateSweep() {
  const actor = await getActor();
  const created: FollowUp[] = [];
  await updateWorkspace((ws) => {
    const sprint = ws.sprints.find((s) => s.status === "active");
    const tickets = sprint
      ? ws.tickets.filter((t) => t.sprintId === sprint.id)
      : ws.tickets;
    const buckets = dueBuckets(tickets);
    const pendingKey = (memberId: string, ticketId: string | null, type: FollowUpType) =>
      `${memberId}|${ticketId ?? "none"}|${type}`;
    const existing = new Set(
      ws.followUps
        .filter((f) => f.status === "pending" || f.status === "sent")
        .map((f) => pendingKey(f.memberId, f.ticketId, f.type))
    );

    const queue: { type: FollowUpType; ticketId: string | null; memberId: string }[] = [];
    for (const t of buckets.overdue) {
      if (t.assigneeId) queue.push({ type: "overdue", ticketId: t.id, memberId: t.assigneeId });
    }
    for (const t of buckets.today) {
      if (t.assigneeId) queue.push({ type: "due_today", ticketId: t.id, memberId: t.assigneeId });
    }
    for (const t of buckets.soon) {
      if (t.assigneeId) queue.push({ type: "due_soon", ticketId: t.id, memberId: t.assigneeId });
    }
    for (const t of buckets.stalled) {
      if (t.assigneeId) queue.push({ type: "stalled", ticketId: t.id, memberId: t.assigneeId });
    }
    for (const t of buckets.blocked) {
      if (t.assigneeId) queue.push({ type: "blocked", ticketId: t.id, memberId: t.assigneeId });
    }
    for (const m of missingStandups(ws)) {
      queue.push({ type: "missing_standup", ticketId: null, memberId: m.id });
    }

    for (const item of queue) {
      const key = pendingKey(item.memberId, item.ticketId, item.type);
      if (existing.has(key)) continue;
      const followUp: FollowUp = {
        id: uid("fu"),
        ticketId: item.ticketId,
        memberId: item.memberId,
        type: item.type,
        message: followUpMessage(ws, item.type, item.memberId, item.ticketId),
        status: "pending",
        createdAt: nowIso(),
        sentAt: null,
      };
      ws.followUps.unshift(followUp);
      created.push(followUp);
      existing.add(key);
    }

    ws.activity.unshift({
      id: uid("act"),
      type: "agent",
      message: `${actor.name} ran the Agile Coach due-date sweep (${created.length} new follow-ups).`,
      memberId: actor.id,
      ticketId: null,
      createdAt: nowIso(),
    });
  });
  bump();
  return { created: created.length, followUps: created };
}

export async function setFollowUpStatus(id: string, status: FollowUp["status"]) {
  const actor = await getActor();
  await updateWorkspace((ws) => {
    const item = ws.followUps.find((f) => f.id === id);
    if (!item) return;
    item.status = status;
    if (status === "sent") {
      item.sentAt = nowIso();
      if (item.ticketId) {
        ws.comments.push({
          id: uid("c"),
          ticketId: item.ticketId,
          memberId: actor.id,
          body: `Follow-up sent: ${item.message}`,
          createdAt: nowIso(),
        });
      }
    }
  });
  bump();
}

export async function resetDemoData() {
  await resetWorkspace();
  bump();
}

export async function autoAssignUnowned() {
  const actor = await getActor();
  const assigned: string[] = [];
  await updateWorkspace((ws) => {
    const unowned = ws.tickets.filter((t) => !t.assigneeId && t.status !== "done");
    for (const ticket of unowned) {
      const suggestion = suggestAssignee(ws, ticket);
      if (!suggestion) continue;
      ticket.assigneeId = suggestion.member.id;
      ticket.updatedAt = nowIso();
      assigned.push(`${ticket.key} → ${suggestion.member.name}`);
      ws.activity.unshift({
        id: uid("act"),
        type: "assign",
        message: `Coach assigned ${ticket.key} to ${suggestion.member.name} (${actor.name} approved).`,
        memberId: actor.id,
        ticketId: ticket.id,
        createdAt: nowIso(),
      });
    }
  });
  bump();
  return assigned;
}

export async function autoAssignUnownedAction() {
  await autoAssignUnowned();
}

export function workspaceSnapshot(): Workspace {
  return readWorkspace();
}

export async function sprintBrief() {
  const ws = readWorkspace();
  const sprint = ws.sprints.find((s) => s.status === "active");
  if (!sprint) return "No active sprint.";
  const tickets = ws.tickets.filter((t) => t.sprintId === sprint.id);
  const loads = memberLoads(ws, sprint);
  const buckets = dueBuckets(tickets);
  const missing = missingStandups(ws);
  return {
    sprint,
    tickets,
    loads,
    buckets,
    missing,
  };
}

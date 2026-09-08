import {
  dueBuckets,
  memberLoads,
  missingStandups,
  sprintTickets,
  stalled,
  suggestAssignee,
} from "@/lib/analytics";
import { daysUntil, isOverdue, relativeTime, todayKey } from "@/lib/dates";
import { firstName, memberName, statusLabel } from "@/lib/format";
import { uid } from "@/lib/ids";
import { nowIso } from "@/lib/dates";
import { readWorkspace, updateWorkspace } from "@/lib/store";
import type { TicketStatus, Workspace } from "@/lib/types";

export type AgentResult = {
  reply: string;
  actions: string[];
};

function compactContext(ws: Workspace) {
  const sprint = ws.sprints.find((s) => s.status === "active");
  const tickets = sprint ? sprintTickets(ws, sprint.id) : ws.tickets;
  const buckets = dueBuckets(tickets);
  const loads = memberLoads(ws, sprint ?? null);
  const missing = missingStandups(ws);
  return {
    today: todayKey(),
    project: ws.settings.projectName,
    sprint: sprint
      ? {
          name: sprint.name,
          goal: sprint.goal,
          start: sprint.startDate,
          end: sprint.endDate,
          daysLeft: daysUntil(sprint.endDate),
        }
      : null,
    members: ws.members.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      title: m.title,
      skills: m.skills,
    })),
    tickets: ws.tickets.map((t) => ({
      key: t.key,
      title: t.title,
      type: t.type,
      status: t.status,
      priority: t.priority,
      points: t.storyPoints,
      due: t.dueDate,
      assignee: memberName(ws.members, t.assigneeId),
      sprint: ws.sprints.find((s) => s.id === t.sprintId)?.name ?? "none",
      blocked: t.blockedReason,
      updated: t.updatedAt,
    })),
    standupMissing: missing.map((m) => m.name),
    overdue: buckets.overdue.map((t) => t.key),
    dueToday: buckets.today.map((t) => t.key),
    loads: loads.map((l) => ({
      name: l.member.name,
      open: l.openCount,
      wip: l.wipCount,
      overdue: l.overdueCount,
      hours: l.hoursThisWeek,
      loggedToday: l.loggedToday,
      contribution: l.contribution,
      focus: l.focus,
    })),
    recentLogs: ws.workLogs.slice(0, 8).map((l) => ({
      member: memberName(ws.members, l.memberId),
      date: l.date,
      today: l.today,
      blockers: l.blockers,
      mood: l.mood,
      hours: l.hoursLogged,
    })),
  };
}

function findMember(ws: Workspace, text: string) {
  const lower = text.toLowerCase();
  return (
    ws.members.find((m) => lower.includes(m.name.toLowerCase())) ??
    ws.members.find((m) => lower.includes(firstName(m.name).toLowerCase())) ??
    null
  );
}

function findTicket(ws: Workspace, text: string) {
  const match = text.toUpperCase().match(/\bAM-\d+\b/);
  if (match) return ws.tickets.find((t) => t.key === match[0]) ?? null;
  const lower = text.toLowerCase();
  return (
    ws.tickets.find((t) => lower.includes(t.title.toLowerCase())) ?? null
  );
}

function findStatus(text: string): TicketStatus | null {
  const lower = text.toLowerCase();
  if (/\b(done|complete|closed)\b/.test(lower)) return "done";
  if (/\breview\b/.test(lower)) return "in_review";
  if (/\b(progress|doing|wip)\b/.test(lower)) return "in_progress";
  if (/\bto\s?do\b/.test(lower)) return "todo";
  if (/\bbacklog\b/.test(lower)) return "backlog";
  return null;
}

async function remember(role: "user" | "assistant", content: string) {
  await updateWorkspace((ws) => {
    ws.agentMessages.push({
      id: uid("msg"),
      role,
      content,
      createdAt: nowIso(),
    });
    if (ws.agentMessages.length > 80) {
      ws.agentMessages = ws.agentMessages.slice(-80);
    }
  });
}

function briefing(ws: Workspace) {
  const sprint = ws.sprints.find((s) => s.status === "active");
  if (!sprint) return "There is no active sprint. Start one from Sprints, then I can coach against a goal.";
  const tickets = sprintTickets(ws, sprint.id);
  const buckets = dueBuckets(tickets);
  const missing = missingStandups(ws);
  const done = tickets.filter((t) => t.status === "done").length;
  const lines = [
    `**${sprint.name}** — ${sprint.goal}`,
    `${daysUntil(sprint.endDate) ?? 0} day(s) left. ${done}/${tickets.length} tickets done.`,
    buckets.overdue.length
      ? `Overdue: ${buckets.overdue.map((t) => `${t.key} (${memberName(ws.members, t.assigneeId)})`).join(", ")}.`
      : "No overdue sprint tickets.",
    buckets.today.length
      ? `Due today: ${buckets.today.map((t) => t.key).join(", ")}.`
      : "Nothing due today.",
    buckets.blocked.length
      ? `Blocked: ${buckets.blocked.map((t) => t.key).join(", ")}.`
      : "No blocked tickets.",
    missing.length
      ? `Missing today's log: ${missing.map((m) => firstName(m.name)).join(", ")}.`
      : "Every maker has logged today.",
  ];
  return lines.join("\n");
}

function productivityReport(ws: Workspace, memberId?: string) {
  const sprint = ws.sprints.find((s) => s.status === "active");
  const loads = memberLoads(ws, sprint ?? null);
  const subset = memberId ? loads.filter((l) => l.member.id === memberId) : loads;
  const ranked = [...subset].sort((a, b) => b.contribution - a.contribution);
  const lines = ranked.map((l) => {
    const logs = ws.workLogs.filter((w) => w.memberId === l.member.id).slice(0, 3);
    const latest = logs[0];
    return [
      `**${l.member.name}** · ${l.member.title}`,
      `Contribution ${l.contribution}/100 · ${l.doneThisSprint} done this sprint · ${l.openCount} open (${l.openPoints} pts) · ${l.wipCount} WIP · ${l.overdueCount} overdue · ${l.hoursThisWeek}h logged this week.`,
      l.focus,
      latest
        ? `Latest log (${latest.date}): ${latest.today}${latest.blockers ? ` Blocker: ${latest.blockers}` : ""}`
        : "No work logs on file.",
    ].join("\n");
  });
  return [
    "This is a coaching view, not a stack-rank. Contribution blends completed sprint work, logging hygiene, and overdue/stalled risk.",
    ...lines,
  ].join("\n\n");
}

function standupSummary(ws: Workspace) {
  const today = todayKey();
  const logs = ws.workLogs.filter((l) => l.date === today);
  const missing = missingStandups(ws);
  const parts = ["**Standup rollup**"];
  if (logs.length === 0) {
    parts.push("Nobody has logged yet today. I can ping the team when you ask me to run a sweep.");
  }
  for (const log of logs) {
    const name = memberName(ws.members, log.memberId);
    parts.push(
      `**${name}** (${log.mood.replace("_", " ")}, ${log.hoursLogged}h)\n- Yesterday: ${log.yesterday || "—"}\n- Today: ${log.today || "—"}\n- Blockers: ${log.blockers || "none"}`
    );
  }
  if (missing.length) {
    parts.push(`Still missing: ${missing.map((m) => m.name).join(", ")}.`);
  }
  const blocked = ws.tickets.filter((t) => t.blockedReason && t.status !== "done");
  if (blocked.length) {
    parts.push(
      `Board blockers: ${blocked.map((t) => `${t.key} — ${t.blockedReason}`).join(" | ")}`
    );
  }
  return parts.join("\n\n");
}

async function applyLocalTools(ws: Workspace, message: string): Promise<AgentResult | null> {
  const lower = message.toLowerCase();
  const actions: string[] = [];

  if (/\b(sweep|follow[- ]?ups?|nudge|remind|due[- ]date)\b/.test(lower) && !/\bhow\b/.test(lower)) {
    const { runDueDateSweep } = await import("@/lib/actions");
    const result = await runDueDateSweep();
    actions.push(`Created ${result.created} follow-up(s).`);
    const preview = result.followUps
      .slice(0, 6)
      .map((f) => `- ${f.message}`)
      .join("\n");
    return {
      actions,
      reply:
        result.created === 0
          ? "Sweep complete. Every due, stalled, blocked, and missing-log case already has an open follow-up."
          : `Sweep complete. I drafted ${result.created} follow-up message(s) and parked them in Follow-ups for you to send.\n\n${preview}`,
    };
  }

  if (/\b(auto[- ]?assign|assign un(owned|assigned)|who should own)\b/.test(lower) && /\b(all|unowned|unassigned|them)\b/.test(lower)) {
    const { autoAssignUnowned } = await import("@/lib/actions");
    const assigned = await autoAssignUnowned();
    return {
      actions: assigned,
      reply: assigned.length
        ? `Assigned unowned work by load and skills:\n${assigned.map((a) => `- ${a}`).join("\n")}`
        : "No unowned open tickets. Nothing to assign.",
    };
  }

  const ticket = findTicket(ws, message);
  const member = findMember(ws, message);
  const status = findStatus(message);

  if (ticket && member && /\bassign\b/.test(lower)) {
    const { assignTicket } = await import("@/lib/actions");
    await assignTicket(ticket.id, member.id);
    actions.push(`Assigned ${ticket.key} to ${member.name}.`);
    return {
      actions,
      reply: `Done. ${ticket.key} (${ticket.title}) is now with ${member.name}. Current load: they already have other open work — check Team if the WIP feels high.`,
    };
  }

  if (ticket && status && /\b(move|set|mark)\b/.test(lower)) {
    const { moveTicket } = await import("@/lib/actions");
    await moveTicket(ticket.id, status);
    actions.push(`Moved ${ticket.key} to ${statusLabel[status]}.`);
    return {
      actions,
      reply: `${ticket.key} is now **${statusLabel[status]}**.`,
    };
  }

  if (ticket && member && /\bsuggest\b/.test(lower)) {
    const suggestion = suggestAssignee(ws, ticket);
    return {
      actions: [],
      reply: suggestion
        ? `I would give ${ticket.key} to **${suggestion.member.name}** (${suggestion.member.title}). Skills: ${suggestion.member.skills.join(", ")}. Say “assign ${ticket.key} to ${firstName(suggestion.member.name)}” and I will do it.`
        : "I do not have a clean assignee suggestion.",
    };
  }

  if (ticket && /\b(follow|nudge|message|draft)\b/.test(lower)) {
    const assignee = ws.members.find((m) => m.id === ticket.assigneeId);
    const type = isOverdue(ticket.dueDate)
      ? "overdue"
      : stalled(ticket)
        ? "stalled"
        : "due_soon";
    await updateWorkspace((w) => {
      w.followUps.unshift({
        id: uid("fu"),
        ticketId: ticket.id,
        memberId: ticket.assigneeId ?? w.members[0].id,
        type,
        message: `${firstName(assignee?.name ?? "team")} — ${ticket.key} (${ticket.title}) is ${statusLabel[ticket.status]}. Due ${ticket.dueDate ?? "unset"}. Last updated ${relativeTime(ticket.updatedAt)}. ${ticket.blockedReason ?? "Please send a status before standup."}`,
        status: "pending",
        createdAt: nowIso(),
        sentAt: null,
      });
    });
    return {
      actions: [`Drafted a follow-up on ${ticket.key}.`],
      reply: `Drafted a follow-up for ${assignee?.name ?? "the team"} on ${ticket.key}. It is waiting in Follow-ups — send it when you want it on the ticket as a comment.`,
    };
  }

  return null;
}

function answerLocally(ws: Workspace, message: string): string {
  const lower = message.toLowerCase();
  const member = findMember(ws, message);
  const ticket = findTicket(ws, message);

  if (/\b(stand-?up|daily log|rollup)\b/.test(lower)) return standupSummary(ws);
  if (/\b(brief|risk|health|at risk|sprint)\b/.test(lower) && !ticket)
    return briefing(ws);
  if (/\b(productiv|performance|contribution|who is (overloaded|behind|free))\b/.test(lower) || (member && /\b(how is|load|doing)\b/.test(lower)))
    return productivityReport(ws, member?.id);
  if (/\boverloaded|wip|capacity\b/.test(lower))
    return productivityReport(ws);

  if (ticket) {
    const assignee = memberName(ws.members, ticket.assigneeId);
    const comments = ws.comments.filter((c) => c.ticketId === ticket.id);
    return [
      `**${ticket.key}** · ${ticket.title}`,
      `${ticket.type} · ${statusLabel[ticket.status]} · ${ticket.priority} · ${ticket.storyPoints ?? "–"} pts`,
      `Assignee: ${assignee} · Due: ${ticket.dueDate ?? "unset"} · Updated ${relativeTime(ticket.updatedAt)}`,
      ticket.blockedReason ? `Blocked: ${ticket.blockedReason}` : "Not blocked.",
      ticket.description,
      comments.length
        ? `Latest comment: ${comments[comments.length - 1].body}`
        : "No comments yet.",
    ].join("\n");
  }

  if (/\b(help|what can you|commands?)\b/.test(lower)) {
    return [
      "I can operate on this workspace, not just talk about it.",
      "- Brief the sprint / call out risk",
      "- Summarize today’s standup",
      "- Score team productivity (coaching view)",
      "- Run a due-date follow-up sweep",
      "- Assign a ticket: “assign AM-122 to Priya”",
      "- Move a ticket: “move AM-118 to review”",
      "- Draft a nudge on a card",
      "- Auto-assign unowned tickets",
    ].join("\n");
  }

  return `${briefing(ws)}\n\nAsk me to run a sweep, summarize standup, review productivity, or act on a ticket key (AM-118, AM-112, …).`;
}

async function answerWithOpenAI(ws: Workspace, message: string, history: { role: string; content: string }[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const context = compactContext(ws);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are Agile Master, the in-house Agile Coach for ${ws.settings.teamName} on ${ws.settings.projectName}. You follow Scrum: sprint goals, WIP discipline, honest due dates, daily logs, and coaching rather than surveillance. Use only the workspace JSON. Be concise, specific, and name ticket keys. If the user asked you to change the board, the host app may have already applied the mutation — acknowledge it. Workspace:\n${JSON.stringify(context)}`,
        },
        ...history.slice(-8).map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: message },
      ],
    }),
  });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return json.choices?.[0]?.message?.content ?? null;
  } catch {
    return null;
  }
}

export async function runAgent(message: string): Promise<AgentResult> {
  const trimmed = message.trim();
  if (!trimmed) return { reply: "Say a ticket key, a name, or ask for a sprint brief.", actions: [] };
  await remember("user", trimmed);
  const ws = readWorkspace();
  const tool = await applyLocalTools(ws, trimmed);
  if (tool) {
    await remember("assistant", tool.reply);
    return tool;
  }
  const fresh = readWorkspace();
  const llm = await answerWithOpenAI(
    fresh,
    trimmed,
    fresh.agentMessages.map((m) => ({ role: m.role, content: m.content }))
  );
  const reply = llm ?? answerLocally(fresh, trimmed);
  await remember("assistant", reply);
  return { reply, actions: [] };
}

export async function seedWelcomeIfEmpty() {
  const ws = readWorkspace();
  if (ws.agentMessages.length === 0) {
    await remember(
      "assistant",
      "I am your Agile Coach. I watch the board, daily logs, and due dates. Ask for a sprint brief to start."
    );
  }
}

import { differenceInCalendarDays, eachDayOfInterval, parseISO } from "date-fns";
import { daysUntil, isDueToday, isOverdue, parseDate, todayKey } from "@/lib/dates";
import type { Member, Sprint, Ticket, WorkLog, Workspace } from "@/lib/types";

export function sprintTickets(ws: Workspace, sprintId: string) {
  return ws.tickets.filter((t) => t.sprintId === sprintId);
}

export function committedPoints(tickets: Ticket[]) {
  return tickets.reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
}

export function donePoints(tickets: Ticket[]) {
  return tickets
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + (t.storyPoints ?? 0), 0);
}

export function sprintProgress(tickets: Ticket[]) {
  const total = tickets.length || 1;
  const done = tickets.filter((t) => t.status === "done").length;
  return Math.round((done / total) * 100);
}

export type MemberLoad = {
  member: Member;
  openCount: number;
  wipCount: number;
  openPoints: number;
  overdueCount: number;
  hoursThisWeek: number;
  loggedToday: boolean;
  doneThisSprint: number;
  stalledCount: number;
  contribution: number;
  focus: string;
};

export function stalled(ticket: Ticket) {
  if (ticket.status === "done" || ticket.status === "backlog") return false;
  const days = differenceInCalendarDays(new Date(), parseDate(ticket.updatedAt));
  return days >= 3;
}

export function memberLoads(ws: Workspace, sprint: Sprint | null): MemberLoad[] {
  const tickets = sprint
    ? ws.tickets.filter((t) => t.sprintId === sprint.id)
    : ws.tickets;
  const weekLogs = ws.workLogs.filter((l) => {
    const d = daysUntil(l.date);
    return d !== null && d <= 0 && d >= -6;
  });
  const today = todayKey();

  return ws.members.map((member) => {
    const assigned = tickets.filter((t) => t.assigneeId === member.id);
    const open = assigned.filter((t) => t.status !== "done");
    const wip = assigned.filter(
      (t) => t.status === "in_progress" || t.status === "in_review"
    );
    const overdue = open.filter((t) => isOverdue(t.dueDate));
    const hoursThisWeek = weekLogs
      .filter((l) => l.memberId === member.id)
      .reduce((s, l) => s + l.hoursLogged, 0);
    const loggedToday = ws.workLogs.some(
      (l) => l.memberId === member.id && l.date === today
    );
    const doneThisSprint = assigned.filter((t) => t.status === "done").length;
    const stalledCount = open.filter(stalled).length;
    const contribution = Math.round(
      Math.min(
        100,
        doneThisSprint * 18 +
          hoursThisWeek * 4 +
          (loggedToday ? 8 : 0) -
          overdue.length * 12 -
          stalledCount * 8
      )
    );

    let focus = "Steady contribution this sprint.";
    if (overdue.length >= 1) focus = "Has overdue work that needs a call.";
    else if (stalledCount >= 1) focus = "A ticket has gone quiet for 3+ days.";
    else if (wip.length >= 3) focus = "WIP is high — finish before pulling more.";
    else if (!loggedToday && member.role !== "product_owner")
      focus = "Daily log is still missing today.";
    else if (hoursThisWeek > member.weeklyCapacityHours * 0.35 && open.length >= 3)
      focus = "Load is heavy relative to remaining sprint days.";
    else if (open.length === 0) focus = "Available — good candidate for unassigned work.";

    return {
      member,
      openCount: open.length,
      wipCount: wip.length,
      openPoints: committedPoints(open),
      overdueCount: overdue.length,
      hoursThisWeek,
      loggedToday,
      doneThisSprint,
      stalledCount,
      contribution: Math.max(0, contribution),
      focus,
    };
  });
}

export function burndown(sprint: Sprint, tickets: Ticket[]) {
  const start = parseISO(sprint.startDate);
  const end = parseISO(sprint.endDate);
  const days = eachDayOfInterval({ start, end });
  const total = committedPoints(tickets);
  const span = Math.max(days.length - 1, 1);

  return days.map((day, index) => {
    const key = day.toISOString().slice(0, 10);
    const remaining = tickets
      .filter((t) => {
        if (!t.completedAt) return true;
        return parseDate(t.completedAt) > day;
      })
      .reduce((s, t) => s + (t.storyPoints ?? 0), 0);
    const ideal = Math.max(0, Math.round(total - (total * index) / span));
    return { day: key, remaining, ideal };
  });
}

export function dueBuckets(tickets: Ticket[]) {
  const open = tickets.filter((t) => t.status !== "done");
  return {
    overdue: open.filter((t) => isOverdue(t.dueDate)),
    today: open.filter((t) => isDueToday(t.dueDate)),
    soon: open.filter((t) => {
      const d = daysUntil(t.dueDate);
      return d !== null && d > 0 && d <= 2;
    }),
    stalled: open.filter(stalled),
    unassigned: open.filter((t) => !t.assigneeId),
    blocked: open.filter((t) => Boolean(t.blockedReason)),
  };
}

export function missingStandups(ws: Workspace, date = todayKey()) {
  const logged = new Set(
    ws.workLogs.filter((l) => l.date === date).map((l) => l.memberId)
  );
  return ws.members.filter(
    (m) => m.role !== "product_owner" && !logged.has(m.id)
  );
}

export function velocityBySprint(ws: Workspace) {
  return ws.sprints
    .slice()
    .reverse()
    .map((sprint) => {
      const tickets = sprintTickets(ws, sprint.id);
      return {
        sprint: sprint.name.replace("Sprint ", "S"),
        committed: committedPoints(tickets),
        completed: donePoints(tickets),
      };
    });
}

export function completionByMember(ws: Workspace, sprintId: string) {
  const tickets = sprintTickets(ws, sprintId);
  return ws.members
    .map((member) => {
      const assigned = tickets.filter((t) => t.assigneeId === member.id);
      const done = assigned.filter((t) => t.status === "done");
      return {
        name: member.name.split(" ")[0],
        memberId: member.id,
        done: done.length,
        open: assigned.length - done.length,
        points: donePoints(done),
      };
    })
    .filter((row) => row.done + row.open > 0);
}

export function logHoursSeries(logs: WorkLog[], members: Member[]) {
  const dates = Array.from(new Set(logs.map((l) => l.date))).sort();
  return dates.map((date) => {
    const row: Record<string, string | number> = { date: date.slice(5) };
    for (const m of members) {
      const hit = logs.find((l) => l.date === date && l.memberId === m.id);
      row[m.name.split(" ")[0]] = hit?.hoursLogged ?? 0;
    }
    return row;
  });
}

export function suggestAssignee(ws: Workspace, ticket: Ticket) {
  const sprint = ws.sprints.find((s) => s.status === "active");
  const loads = memberLoads(ws, sprint ?? null).filter(
    (l) => l.member.role !== "product_owner" && l.member.role !== "scrum_master"
  );

  const scored = loads.map((l) => {
    let score = 40 - l.openPoints * 3 - l.wipCount * 8 - l.overdueCount * 10;
    const skills = l.member.skills.join(" ");
    for (const label of ticket.labels) {
      if (skills.includes(label) || l.member.title.toLowerCase().includes(label))
        score += 12;
    }
    if (ticket.type === "bug" && l.member.role === "qa") score += 6;
    if (ticket.labels.includes("design") && l.member.role === "designer") score += 18;
    if (ticket.labels.includes("qa") && l.member.role === "qa") score += 18;
    if (l.openCount === 0) score += 8;
    return { member: l.member, score, reason: l.focus };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0] ?? null;
}

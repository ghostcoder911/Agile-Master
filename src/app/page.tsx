import Link from "next/link";
import { AgentComposer } from "@/components/agent-composer";
import { MemberAvatar } from "@/components/member-avatar";
import { PageHeader } from "@/components/page-header";
import { SweepButton } from "@/components/sweep-button";
import { TicketCreateDialog } from "@/components/ticket-create-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  committedPoints,
  donePoints,
  dueBuckets,
  memberLoads,
  missingStandups,
  sprintProgress,
  sprintTickets,
} from "@/lib/analytics";
import { daysUntil, prettyDate, relativeTime } from "@/lib/dates";
import { getActor } from "@/lib/session";
import { readWorkspace } from "@/lib/store";
import { AlertTriangle, CheckCircle2, Clock3, Flame } from "lucide-react";

export default async function CommandPage() {
  const ws = readWorkspace();
  const actor = await getActor();
  const sprint = ws.sprints.find((s) => s.status === "active") ?? null;
  const tickets = sprint ? sprintTickets(ws, sprint.id) : [];
  const buckets = dueBuckets(tickets);
  const loads = memberLoads(ws, sprint);
  const missing = missingStandups(ws);
  const lastCoach = [...ws.agentMessages].reverse().find((m) => m.role === "assistant");
  const daysLeft = sprint ? daysUntil(sprint.endDate) ?? 0 : 0;
  const progress = sprintProgress(tickets);
  const pointsDone = donePoints(tickets);
  const pointsTotal = committedPoints(tickets);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Command"
        title={`Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, ${actor.name.split(" ")[0]}`}
        description={
          sprint
            ? `${sprint.name} has ${daysLeft} day${daysLeft === 1 ? "" : "s"} left. Goal: ${sprint.goal}`
            : "No sprint is active. Start one so the coach has a goal to defend."
        }
        actions={
          <>
            <SweepButton />
            <TicketCreateDialog members={ws.members} sprints={ws.sprints} defaultSprintId={sprint?.id} />
          </>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Sprint progress"
          value={`${progress}%`}
          hint={`${tickets.filter((t) => t.status === "done").length}/${tickets.length} tickets · ${pointsDone}/${pointsTotal} pts`}
          icon={<CheckCircle2 className="size-4 text-teal-400" />}
        />
        <Stat
          label="Overdue"
          value={String(buckets.overdue.length)}
          hint={buckets.overdue[0] ? buckets.overdue[0].key : "Board is current"}
          icon={<Flame className="size-4 text-rose-400" />}
        />
        <Stat
          label="Due today"
          value={String(buckets.today.length)}
          hint={buckets.today[0] ? buckets.today.map((t) => t.key).join(", ") : "Clear calendar"}
          icon={<Clock3 className="size-4 text-amber-400" />}
        />
        <Stat
          label="Missing logs"
          value={String(missing.length)}
          hint={missing.length ? missing.map((m) => m.name.split(" ")[0]).join(", ") : "Team is logged"}
          icon={<AlertTriangle className="size-4 text-orange-400" />}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Needs a conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[...buckets.overdue, ...buckets.today, ...buckets.blocked, ...buckets.stalled]
              .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
              .slice(0, 7)
              .map((t) => {
                const owner = ws.members.find((m) => m.id === t.assigneeId);
                const why = buckets.overdue.some((x) => x.id === t.id)
                  ? "Overdue"
                  : buckets.today.some((x) => x.id === t.id)
                    ? "Due today"
                    : t.blockedReason
                      ? "Blocked"
                      : "Stalled";
                return (
                  <Link
                    key={t.id}
                    href={`/tickets/${t.key}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
                  >
                    <MemberAvatar member={owner} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="ticket-key mr-2 font-mono text-xs text-muted-foreground">{t.key}</span>
                        {t.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {owner?.name ?? "Unassigned"} · {why}
                        {t.dueDate ? ` · ${prettyDate(t.dueDate)}` : ""}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{relativeTime(t.updatedAt)}</span>
                  </Link>
                );
              })}
            {tickets.length === 0 && (
              <p className="text-sm text-muted-foreground">No sprint tickets yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coach briefing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
              {lastCoach?.content ?? "Ask the coach for a sprint brief."}
            </p>
            <AgentComposer compact />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team load</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loads.map((l) => (
              <div key={l.member.id} className="flex items-center gap-3">
                <MemberAvatar member={l.member} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{l.member.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {l.openCount} open · {l.hoursThisWeek}h
                    </p>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, l.contribution)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{l.focus}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ws.activity.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 text-sm">
                <p>{a.message}</p>
                <span className="shrink-0 text-[11px] text-muted-foreground">{relativeTime(a.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-1">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          {icon}
        </div>
        <p className="mt-2 font-mono text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

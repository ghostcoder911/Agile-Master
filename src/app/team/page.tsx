import { PageHeader } from "@/components/page-header";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { autoAssignUnownedAction, resetDemoData } from "@/lib/actions";
import { memberLoads } from "@/lib/analytics";
import { roleLabel } from "@/lib/format";
import { readWorkspace } from "@/lib/store";
import Link from "next/link";

export default function TeamPage() {
  const ws = readWorkspace();
  const sprint = ws.sprints.find((s) => s.status === "active") ?? null;
  const loads = memberLoads(ws, sprint).sort((a, b) => b.contribution - a.contribution);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team"
        title="Who is carrying the sprint"
        description="Contribution is a coaching signal: completed sprint work, logging hygiene, and overdue risk. It is not a stack rank for performance reviews."
        actions={
          <div className="flex gap-2">
            <form action={autoAssignUnownedAction}>
              <Button variant="outline">Auto-assign unowned</Button>
            </form>
            <form action={resetDemoData}>
              <Button variant="ghost">Reset demo data</Button>
            </form>
          </div>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {loads.map((l) => {
          const assigned = ws.tickets.filter(
            (t) => t.assigneeId === l.member.id && t.status !== "done"
          );
          return (
            <Card key={l.member.id}>
              <CardContent className="space-y-3 pt-1">
                <div className="flex items-start gap-3">
                  <MemberAvatar member={l.member} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{l.member.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {l.member.title} · {roleLabel[l.member.role]}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{l.focus}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-semibold">{l.contribution}</p>
                    <p className="text-[11px] text-muted-foreground">contribution</p>
                  </div>
                </div>
                <dl className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-muted/50 p-2">
                    <dt className="text-muted-foreground">Open</dt>
                    <dd className="font-mono text-base">{l.openCount}</dd>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <dt className="text-muted-foreground">WIP</dt>
                    <dd className="font-mono text-base">{l.wipCount}</dd>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <dt className="text-muted-foreground">Overdue</dt>
                    <dd className="font-mono text-base">{l.overdueCount}</dd>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-2">
                    <dt className="text-muted-foreground">Hours</dt>
                    <dd className="font-mono text-base">{l.hoursThisWeek}</dd>
                  </div>
                </dl>
                <div className="flex flex-wrap gap-1.5">
                  {l.member.skills.map((s) => (
                    <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-[11px]">
                      {s}
                    </span>
                  ))}
                </div>
                {assigned.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {assigned.map((t) => (
                      <Link key={t.id} href={`/tickets/${t.key}`} className="font-mono text-[11px] text-primary">
                        {t.key}
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

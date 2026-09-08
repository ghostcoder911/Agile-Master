import { BurndownChart, MemberBars, VelocityChart } from "@/components/charts";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  burndown,
  completionByMember,
  memberLoads,
  sprintTickets,
  velocityBySprint,
} from "@/lib/analytics";
import { readWorkspace } from "@/lib/store";

export default function AnalyticsPage() {
  const ws = readWorkspace();
  const sprint = ws.sprints.find((s) => s.status === "active");
  const tickets = sprint ? sprintTickets(ws, sprint.id) : [];
  const burn = sprint ? burndown(sprint, tickets) : [];
  const velocity = velocityBySprint(ws);
  const members = sprint ? completionByMember(ws, sprint.id) : [];
  const loads = memberLoads(ws, sprint ?? null);
  const avgContribution = Math.round(
    loads.reduce((s, l) => s + l.contribution, 0) / Math.max(loads.length, 1)
  );
  const logged = loads.filter((l) => l.loggedToday).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Is the sprint telling the truth?"
        description="Burndown, velocity, and completion by person. Use this with the daily logs — charts without narrative are how teams lie to themselves."
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-1">
            <p className="text-xs text-muted-foreground">Avg contribution</p>
            <p className="font-mono text-3xl font-semibold">{avgContribution}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <p className="text-xs text-muted-foreground">Logged today</p>
            <p className="font-mono text-3xl font-semibold">
              {logged}/{loads.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-1">
            <p className="text-xs text-muted-foreground">Open overdue</p>
            <p className="font-mono text-3xl font-semibold">
              {loads.reduce((s, l) => s + l.overdueCount, 0)}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sprint burndown (points remaining)</CardTitle>
          </CardHeader>
          <CardContent>
            {burn.length ? <BurndownChart data={burn} /> : <p className="text-sm text-muted-foreground">No active sprint.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Velocity by sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <VelocityChart data={velocity} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Completion by teammate (active sprint)</CardTitle>
          </CardHeader>
          <CardContent>
            {members.length ? (
              <MemberBars data={members} />
            ) : (
              <p className="text-sm text-muted-foreground">No assigned sprint work yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

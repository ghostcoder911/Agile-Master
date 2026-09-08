import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { activateSprint, completeSprint, createSprint } from "@/lib/actions";
import { committedPoints, donePoints, sprintProgress, sprintTickets } from "@/lib/analytics";
import { prettyDateLong } from "@/lib/dates";
import { readWorkspace } from "@/lib/store";

export default function SprintsPage() {
  const ws = readWorkspace();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sprints"
        title="Plan the increment"
        description="One active sprint at a time. Completing a sprint parks unfinished work for the next planning conversation — it does not silently close tickets."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {ws.sprints.map((sprint) => {
            const tickets = sprintTickets(ws, sprint.id);
            const progress = sprintProgress(tickets);
            return (
              <Card key={sprint.id}>
                <CardHeader className="flex-row items-start justify-between">
                  <div>
                    <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{sprint.status}</p>
                    <CardTitle>{sprint.name}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{sprint.goal}</p>
                  </div>
                  <div className="flex gap-2">
                    {sprint.status !== "active" && sprint.status !== "completed" && (
                      <form action={activateSprint.bind(null, sprint.id)}>
                        <Button size="sm">Activate</Button>
                      </form>
                    )}
                    {sprint.status === "active" && (
                      <form action={completeSprint.bind(null, sprint.id)}>
                        <Button size="sm" variant="outline">
                          Complete
                        </Button>
                      </form>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {prettyDateLong(sprint.startDate)} → {prettyDateLong(sprint.endDate)} · {tickets.length} tickets ·{" "}
                    {donePoints(tickets)}/{committedPoints(tickets)} pts
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Schedule a sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createSprint} className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Sprint 26" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="goal">Goal</Label>
                <Textarea id="goal" name="goal" placeholder="What will be true if this sprint succeeds?" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="startDate">Start</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endDate">End</Label>
                <Input id="endDate" name="endDate" type="date" required />
              </div>
              <Button type="submit">Create sprint</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

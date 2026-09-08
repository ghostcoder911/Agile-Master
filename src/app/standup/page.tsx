import { PageHeader } from "@/components/page-header";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitStandup } from "@/lib/actions";
import { missingStandups } from "@/lib/analytics";
import { todayKey } from "@/lib/dates";
import { moodLabel } from "@/lib/format";
import { getActor } from "@/lib/session";
import { readWorkspace } from "@/lib/store";

export default async function StandupPage() {
  const ws = readWorkspace();
  const actor = await getActor();
  const today = todayKey();
  const mine = ws.workLogs.find((l) => l.memberId === actor.id && l.date === today);
  const missing = missingStandups(ws);
  const assigned = ws.tickets.filter(
    (t) => t.assigneeId === actor.id && t.status !== "done"
  );
  const recent = ws.workLogs.slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Daily log"
        title={mine ? "Update today's log" : "What did you actually do?"}
        description="This is the team's radar, not a timesheet. Two honest paragraphs beat a perfect status. The coach uses these notes for standup rollups and follow-ups."
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle key={actor.id}>
              {actor.name} · {today}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={submitStandup} key={actor.id} className="grid gap-3">
              <input type="hidden" name="date" value={today} />
              <div className="grid gap-1.5">
                <Label htmlFor="yesterday">Yesterday</Label>
                <Textarea
                  id="yesterday"
                  name="yesterday"
                  defaultValue={mine?.yesterday}
                  placeholder="What landed? What slipped?"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="today">Today</Label>
                <Textarea
                  id="today"
                  name="today"
                  defaultValue={mine?.today}
                  placeholder="The one or two things that matter before standup tomorrow."
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="blockers">Blockers</Label>
                <Textarea
                  id="blockers"
                  name="blockers"
                  defaultValue={mine?.blockers}
                  placeholder="Names and ticket keys, not vibes."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="hoursLogged">Hours</Label>
                  <Input
                    id="hoursLogged"
                    name="hoursLogged"
                    type="number"
                    step="0.5"
                    min={0}
                    defaultValue={mine?.hoursLogged ?? 6}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="mood">Mood</Label>
                  <select
                    id="mood"
                    name="mood"
                    defaultValue={mine?.mood ?? "on_track"}
                    className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="on_track">On track</option>
                    <option value="stretched">Stretched</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              {assigned.length > 0 && (
                <div className="grid gap-1.5">
                  <Label>Linked tickets</Label>
                  <div className="flex flex-wrap gap-3">
                    {assigned.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          name="ticketIds"
                          value={t.id}
                          defaultChecked={mine?.ticketIds.includes(t.id) ?? true}
                        />
                        {t.key}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <Button type="submit">{mine ? "Save log" : "Submit log"}</Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Still silent today</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {missing.length === 0 && (
                <p className="text-sm text-muted-foreground">Everyone who should have logged, has.</p>
              )}
              {missing.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-sm">
                  <MemberAvatar member={m} size="sm" />
                  {m.name}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recent.slice(0, 6).map((log) => {
                const member = ws.members.find((m) => m.id === log.memberId);
                return (
                  <div key={log.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <MemberAvatar member={member} size="sm" />
                      <span className="font-medium">{member?.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {log.date} · {moodLabel[log.mood]}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{log.today || log.yesterday}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

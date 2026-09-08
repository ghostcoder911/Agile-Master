import { PageHeader } from "@/components/page-header";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  addMember,
  autoAssignUnownedAction,
  removeMember,
  resetDemoData,
} from "@/lib/actions";
import { memberLoads } from "@/lib/analytics";
import { roleLabel } from "@/lib/format";
import { getActor } from "@/lib/session";
import { readWorkspace } from "@/lib/store";
import { MEMBER_ROLES } from "@/lib/types";
import Link from "next/link";

const fieldClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const ws = readWorkspace();
  const actor = await getActor();
  const sprint = ws.sprints.find((s) => s.status === "active") ?? null;
  const loads = memberLoads(ws, sprint).sort((a, b) => b.contribution - a.contribution);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Team"
        title="Who is carrying the sprint"
        description="Add people when they join the squad. Removing someone unassigns their open tickets so the board stays honest."
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

      {error === "duplicate" && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          That email is already on the squad. Use a different address or remove the existing teammate first.
        </p>
      )}

      <Card>
        <CardContent className="space-y-3 pt-1">
          <p className="text-sm font-medium">Add a teammate</p>
          <form action={addMember} className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-medium">
              Name
              <input name="name" required placeholder="Jordan Lee" className={fieldClass} />
            </label>
            <label className="grid gap-1.5 text-xs font-medium">
              Email
              <input name="email" type="email" placeholder="jordan@harbor.team" className={fieldClass} />
            </label>
            <label className="grid gap-1.5 text-xs font-medium">
              Role
              <select name="role" defaultValue="engineer" className={fieldClass}>
                {MEMBER_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {roleLabel[role]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-xs font-medium">
              Title
              <input name="title" placeholder="Backend Engineer" className={fieldClass} />
            </label>
            <label className="grid gap-1.5 text-xs font-medium">
              Weekly hours
              <input
                name="weeklyCapacityHours"
                type="number"
                min={1}
                max={80}
                defaultValue={40}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5 text-xs font-medium">
              Skills
              <input name="skills" placeholder="payments, react, qa" className={fieldClass} />
            </label>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                Add teammate
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {loads.map((l) => {
          const assigned = ws.tickets.filter(
            (t) => t.assigneeId === l.member.id && t.status !== "done"
          );
          const canRemove = ws.members.length > 1;
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
                <form
                  action={removeMember}
                  className="flex items-center justify-between border-t pt-3"
                >
                  <input type="hidden" name="memberId" value={l.member.id} />
                  <p className="text-[11px] text-muted-foreground">
                    {l.member.id === actor.id ? "This is you." : l.member.email}
                  </p>
                  <button
                    type="submit"
                    disabled={!canRemove}
                    className="h-7 rounded-lg px-2.5 text-xs text-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


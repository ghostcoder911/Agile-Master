import { PageHeader } from "@/components/page-header";
import { SweepButton } from "@/components/sweep-button";
import { MemberAvatar } from "@/components/member-avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { setFollowUpStatus } from "@/lib/actions";
import { relativeTime } from "@/lib/dates";
import { memberName } from "@/lib/format";
import { readWorkspace } from "@/lib/store";
import Link from "next/link";

const typeCopy: Record<string, string> = {
  overdue: "Overdue",
  due_today: "Due today",
  due_soon: "Due soon",
  stalled: "Gone quiet",
  blocked: "Blocked",
  missing_standup: "Missing log",
};

export default function FollowUpsPage() {
  const ws = readWorkspace();
  const pending = ws.followUps.filter((f) => f.status === "pending" || f.status === "sent");
  const done = ws.followUps.filter((f) => f.status === "acknowledged" || f.status === "dismissed");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Follow-ups"
        title="Nudge work before it slips"
        description="The coach drafts these from due dates, stalled cards, blockers, and missing daily logs. Sending posts the message onto the ticket so the trail is public."
        actions={<SweepButton />}
      />
      <div className="space-y-3">
        {pending.length === 0 && (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              No open follow-ups. Run a sweep after standup if the board looks too quiet.
            </CardContent>
          </Card>
        )}
        {pending.map((item) => {
          const member = ws.members.find((m) => m.id === item.memberId);
          const ticket = ws.tickets.find((t) => t.id === item.ticketId);
          return (
            <Card key={item.id}>
              <CardContent className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MemberAvatar member={member} size="sm" />
                    <span className="text-sm font-medium">{memberName(ws.members, item.memberId)}</span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px]">{typeCopy[item.type]}</span>
                    {ticket && (
                      <Link href={`/tickets/${ticket.key}`} className="font-mono text-xs text-primary">
                        {ticket.key}
                      </Link>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground">{relativeTime(item.createdAt)}</span>
                </div>
                <p className="text-sm leading-relaxed">{item.message}</p>
                <div className="flex flex-wrap gap-2">
                  {item.status === "pending" && (
                    <form action={setFollowUpStatus.bind(null, item.id, "sent")}>
                      <Button size="sm">Send to ticket</Button>
                    </form>
                  )}
                  <form action={setFollowUpStatus.bind(null, item.id, "acknowledged")}>
                    <Button size="sm" variant="outline">
                      Mark heard
                    </Button>
                  </form>
                  <form action={setFollowUpStatus.bind(null, item.id, "dismissed")}>
                    <Button size="sm" variant="ghost">
                      Dismiss
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {done.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Closed</h2>
          <div className="space-y-2">
            {done.slice(0, 8).map((item) => (
              <p key={item.id} className="text-xs text-muted-foreground">
                {item.status} · {item.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

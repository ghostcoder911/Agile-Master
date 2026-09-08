import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { MemberAvatar } from "@/components/member-avatar";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/status-badge";
import { TicketEditor } from "@/components/ticket-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/lib/actions";
import { prettyDateLong, relativeTime } from "@/lib/dates";
import { memberName } from "@/lib/format";
import { readWorkspace } from "@/lib/store";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ws = readWorkspace();
  const ticket = ws.tickets.find((t) => t.id === id || t.key === id);
  if (!ticket) notFound();
  const comments = ws.comments.filter((c) => c.ticketId === ticket.id);
  const assignee = ws.members.find((m) => m.id === ticket.assigneeId);
  const reporter = ws.members.find((m) => m.id === ticket.reporterId);
  const sprint = ws.sprints.find((s) => s.id === ticket.sprintId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={ticket.key}
        title={ticket.title}
        description={`${sprint?.name ?? "No sprint"} · opened ${prettyDateLong(ticket.createdAt)} · updated ${relativeTime(ticket.updatedAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <TypeBadge type={ticket.type} />
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Work item</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketEditor ticket={ticket} members={ws.members} sprints={ws.sprints} />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>People</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MemberAvatar member={assignee} />
                <div>
                  <p className="text-xs text-muted-foreground">Assignee</p>
                  <p>{memberName(ws.members, ticket.assigneeId)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MemberAvatar member={reporter} />
                <div>
                  <p className="text-xs text-muted-foreground">Reporter</p>
                  <p>{memberName(ws.members, ticket.reporterId)}</p>
                </div>
              </div>
              {ticket.blockedReason && (
                <p className="rounded-lg bg-rose-500/10 p-2 text-xs text-rose-300">{ticket.blockedReason}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              )}
              {comments.map((c) => {
                const member = ws.members.find((m) => m.id === c.memberId);
                return (
                  <div key={c.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <MemberAvatar member={member} size="sm" />
                      <span className="font-medium">{member?.name}</span>
                      <span className="text-[11px] text-muted-foreground">{relativeTime(c.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{c.body}</p>
                  </div>
                );
              })}
              <form action={addComment} className="grid gap-2">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <Textarea name="body" placeholder="Leave a status, not a novel." />
                <Button type="submit" size="sm">
                  Comment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { MemberAvatar } from "@/components/member-avatar";
import { PriorityBadge, StatusBadge, TypeBadge } from "@/components/status-badge";
import { TicketCreateDialog } from "@/components/ticket-create-dialog";
import { prettyDate } from "@/lib/dates";
import { memberName } from "@/lib/format";
import { readWorkspace } from "@/lib/store";

export default async function BacklogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const ws = readWorkspace();
  const query = (q ?? "").toLowerCase();
  const tickets = ws.tickets.filter((t) => {
    if (status && t.status !== status) return false;
    if (!query) return true;
    return (
      t.title.toLowerCase().includes(query) ||
      t.key.toLowerCase().includes(query) ||
      t.labels.join(" ").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Backlog"
        title="Everything in flight"
        description="Filter, assign, and pull work into the active sprint. Unassigned cards are a smell — ask the coach to place them."
        actions={
          <TicketCreateDialog
            members={ws.members}
            sprints={ws.sprints}
            defaultSprintId={ws.sprints.find((s) => s.status === "active")?.id}
          />
        }
      />
      <form className="flex flex-col gap-2 sm:flex-row">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search keys, titles, labels"
          className="h-9 flex-1 rounded-lg border border-input bg-transparent px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All statuses</option>
          <option value="backlog">Backlog</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="in_review">In review</option>
          <option value="done">Done</option>
        </select>
        <button className="h-9 rounded-lg bg-secondary px-3 text-sm" type="submit">
          Filter
        </button>
      </form>
      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Key</th>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">Assignee</th>
              <th className="px-3 py-2 font-medium">Due</th>
              <th className="px-3 py-2 font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-t border-border/60 hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">
                  <Link href={`/tickets/${t.key}`} className="text-primary">
                    {t.key}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Link href={`/tickets/${t.key}`} className="hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <TypeBadge type={t.type} />
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-3 py-2">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-2">
                    <MemberAvatar member={ws.members.find((m) => m.id === t.assigneeId)} size="sm" />
                    <span className="text-xs">{memberName(ws.members, t.assigneeId)}</span>
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{prettyDate(t.dueDate)}</td>
                <td className="px-3 py-2 text-xs">{t.storyPoints ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">No tickets match that filter.</p>
        )}
      </div>
    </div>
  );
}

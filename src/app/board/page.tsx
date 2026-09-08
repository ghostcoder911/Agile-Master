import { KanbanColumn } from "@/components/kanban-column";
import { PageHeader } from "@/components/page-header";
import { TicketCard } from "@/components/ticket-card";
import { TicketCreateDialog } from "@/components/ticket-create-dialog";
import { sprintTickets } from "@/lib/analytics";
import { boardColumns, statusLabel } from "@/lib/format";
import { readWorkspace } from "@/lib/store";

export default function BoardPage() {
  const ws = readWorkspace();
  const sprint = ws.sprints.find((s) => s.status === "active");
  const tickets = sprint ? sprintTickets(ws, sprint.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sprint board"
        title={sprint ? sprint.name : "No active sprint"}
        description={
          sprint
            ? `${sprint.goal} Drag cards across columns. Changes are live for the whole squad.`
            : "Activate a sprint to see its board."
        }
        actions={
          <TicketCreateDialog members={ws.members} sprints={ws.sprints} defaultSprintId={sprint?.id} />
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {boardColumns.map((status) => {
          const column = tickets.filter((t) => t.status === status);
          const points = column.reduce((s, t) => s + (t.storyPoints ?? 0), 0);
          return (
            <KanbanColumn key={status} status={status}>
              <div className="flex items-baseline justify-between px-1 py-1">
                <h2 className="text-sm font-medium">{statusLabel[status]}</h2>
                <span className="text-[11px] text-muted-foreground">
                  {column.length} · {points} pts
                </span>
              </div>
              {column.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  member={ws.members.find((m) => m.id === ticket.assigneeId)}
                  draggable
                />
              ))}
            </KanbanColumn>
          );
        })}
      </div>
    </div>
  );
}

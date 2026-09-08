import { Badge } from "@/components/ui/badge";
import { priorityLabel, statusLabel, typeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Priority, TicketStatus, TicketType } from "@/lib/types";

export function StatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, string> = {
    backlog: "bg-muted text-muted-foreground",
    todo: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    in_progress: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
    in_review: "bg-violet-500/15 text-violet-800 dark:text-violet-300",
    done: "bg-teal-500/15 text-teal-800 dark:text-teal-300",
  };
  return (
    <Badge variant="secondary" className={cn("rounded-md", map[status])}>
      {statusLabel[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    critical: "bg-rose-500/15 text-rose-800 dark:text-rose-300",
    high: "bg-orange-500/15 text-orange-800 dark:text-orange-300",
    medium: "bg-muted text-muted-foreground",
    low: "bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="secondary" className={cn("rounded-md capitalize", map[priority])}>
      {priorityLabel[priority]}
    </Badge>
  );
}

export function TypeBadge({ type }: { type: TicketType }) {
  return (
    <Badge variant="outline" className="rounded-md capitalize">
      {typeLabel[type]}
    </Badge>
  );
}

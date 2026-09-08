"use client";

import Link from "next/link";
import { MemberAvatar } from "@/components/member-avatar";
import { PriorityBadge, TypeBadge } from "@/components/status-badge";
import { isOverdue } from "@/lib/dates";
import { prettyDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Member, Ticket } from "@/lib/types";

export function TicketCard({
  ticket,
  member,
  draggable,
}: {
  ticket: Ticket;
  member?: Member | null;
  draggable?: boolean;
}) {
  const overdue = isOverdue(ticket.dueDate) && ticket.status !== "done";
  return (
    <Link
      href={`/tickets/${ticket.key}`}
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/ticket-id", ticket.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "block rounded-xl bg-card p-3 ring-1 ring-foreground/8 transition hover:ring-primary/40",
        overdue && "ring-rose-500/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="ticket-key font-mono text-[11px] text-muted-foreground">{ticket.key}</span>
        <PriorityBadge priority={ticket.priority} />
      </div>
      <p className="mt-1.5 text-sm font-medium leading-snug">{ticket.title}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TypeBadge type={ticket.type} />
          {ticket.storyPoints != null && (
            <span className="text-[11px] text-muted-foreground">{ticket.storyPoints} pts</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {ticket.dueDate && (
            <span className={cn("text-[11px]", overdue ? "text-rose-400" : "text-muted-foreground")}>
              {prettyDate(ticket.dueDate)}
            </span>
          )}
          <MemberAvatar member={member} size="sm" />
        </div>
      </div>
      {ticket.blockedReason && (
        <p className="mt-2 line-clamp-2 text-[11px] text-rose-400">Blocked: {ticket.blockedReason}</p>
      )}
    </Link>
  );
}

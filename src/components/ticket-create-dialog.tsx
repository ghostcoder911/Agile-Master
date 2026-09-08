import Link from "next/link";
import type { Member, Sprint } from "@/lib/types";
import { Plus } from "lucide-react";

export function TicketCreateDialog({
  defaultSprintId,
}: {
  members?: Member[];
  sprints?: Sprint[];
  defaultSprintId?: string;
}) {
  const href = defaultSprintId
    ? `/tickets/new?sprint=${encodeURIComponent(defaultSprintId)}`
    : "/tickets/new";
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground"
    >
      <Plus className="size-4" />
      New ticket
    </Link>
  );
}

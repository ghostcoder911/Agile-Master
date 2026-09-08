"use client";

import { moveTicket } from "@/lib/actions";
import type { TicketStatus } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function KanbanColumn({
  status,
  children,
}: {
  status: TicketStatus;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [over, setOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={async (e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData("text/ticket-id");
        if (!id) return;
        await moveTicket(id, status);
        router.refresh();
      }}
      className={`flex min-h-[420px] flex-col gap-2 rounded-2xl p-2 ring-1 ring-foreground/8 ${
        over ? "bg-primary/8 ring-primary/40" : "bg-background/40"
      }`}
    >
      {children}
    </div>
  );
}

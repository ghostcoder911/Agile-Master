"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateTicketFields } from "@/lib/actions";
import { askCoachText } from "@/lib/agent-actions";
import type { Member, Sprint, Ticket } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function TicketEditor({
  ticket,
  members,
  sprints,
}: {
  ticket: Ticket;
  members: Member[];
  sprints: Sprint[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () => {
          await updateTicketFields(ticket.id, {
            title: String(data.get("title") ?? ticket.title),
            description: String(data.get("description") ?? ""),
            status: String(data.get("status")) as Ticket["status"],
            priority: String(data.get("priority")) as Ticket["priority"],
            type: String(data.get("type")) as Ticket["type"],
            storyPoints: data.get("storyPoints") ? Number(data.get("storyPoints")) : null,
            dueDate: String(data.get("dueDate") ?? "") || null,
            assigneeId: String(data.get("assigneeId") ?? "") || null,
            sprintId: String(data.get("sprintId") ?? "") || null,
            labels: String(data.get("labels") ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            blockedReason: String(data.get("blockedReason") ?? "") || null,
          });
          toast.success("Ticket saved");
          router.refresh();
        });
      }}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={ticket.title} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={ticket.description} className="min-h-28" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Status" name="status" defaultValue={ticket.status} options={[
          ["backlog", "Backlog"],
          ["todo", "To do"],
          ["in_progress", "In progress"],
          ["in_review", "In review"],
          ["done", "Done"],
        ]} />
        <Field label="Priority" name="priority" defaultValue={ticket.priority} options={[
          ["critical", "Critical"],
          ["high", "High"],
          ["medium", "Medium"],
          ["low", "Low"],
        ]} />
        <Field label="Type" name="type" defaultValue={ticket.type} options={[
          ["story", "Story"],
          ["task", "Task"],
          ["bug", "Bug"],
          ["spike", "Spike"],
        ]} />
        <div className="grid gap-1.5">
          <Label htmlFor="storyPoints">Points</Label>
          <Input id="storyPoints" name="storyPoints" type="number" defaultValue={ticket.storyPoints ?? ""} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="assigneeId">Assignee</Label>
          <select
            id="assigneeId"
            name="assigneeId"
            defaultValue={ticket.assigneeId ?? ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="sprintId">Sprint</Label>
          <select
            id="sprintId"
            name="sprintId"
            defaultValue={ticket.sprintId ?? ""}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">None</option>
            {sprints.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={ticket.dueDate ?? ""} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="labels">Labels</Label>
          <Input id="labels" name="labels" defaultValue={ticket.labels.join(", ")} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="blockedReason">Blocker</Label>
        <Input
          id="blockedReason"
          name="blockedReason"
          defaultValue={ticket.blockedReason ?? ""}
          placeholder="Leave empty if unblocked"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save ticket"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            start(async () => {
              await askCoachText(`Draft a follow-up for ${ticket.key}`);
              toast.success("Coach drafted a follow-up");
              router.refresh();
            })
          }
        >
          Ask coach to nudge
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: [string, string][];
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

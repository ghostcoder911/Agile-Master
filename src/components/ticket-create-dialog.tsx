"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/lib/actions";
import type { Member, Sprint } from "@/lib/types";
import { Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function TicketCreateDialog({
  members,
  sprints,
  defaultSprintId,
}: {
  members: Member[];
  sprints: Sprint[];
  defaultSprintId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        New ticket
      </Button>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-xl bg-popover p-4 text-sm ring-1 ring-foreground/10">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-base font-medium">Open a ticket</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Stories, bugs, tasks, and spikes all live on the same board.
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <form
              className="grid gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setPending(true);
                try {
                  const result = await createTicket(new FormData(e.currentTarget));
                  if ("error" in result && result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(`${result.key} opened`);
                  setOpen(false);
                  router.refresh();
                } finally {
                  setPending(false);
                }
              }}
            >
              <div className="grid gap-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required placeholder="What needs to happen?" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" placeholder="Context, acceptance, risk" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="type">Type</Label>
                  <select id="type" name="type" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
                    <option value="story">Story</option>
                    <option value="task">Task</option>
                    <option value="bug">Bug</option>
                    <option value="spike">Spike</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="priority">Priority</Label>
                  <select id="priority" name="priority" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
                    <option value="medium">Medium</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" name="status" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
                    <option value="backlog">Backlog</option>
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="storyPoints">Points</Label>
                  <Input id="storyPoints" name="storyPoints" type="number" min={0} placeholder="3" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="assigneeId">Assignee</Label>
                  <select id="assigneeId" name="assigneeId" className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm">
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
                    defaultValue={defaultSprintId ?? ""}
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
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="labels">Labels</Label>
                  <Input id="labels" name="labels" placeholder="checkout, qa" />
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t pt-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating…" : "Create ticket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

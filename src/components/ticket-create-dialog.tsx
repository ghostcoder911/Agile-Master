"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/lib/actions";
import type { Member, Sprint } from "@/lib/types";
import { Plus } from "lucide-react";
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
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        New ticket
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Open a ticket</DialogTitle>
          <DialogDescription>
            Stories, bugs, tasks, and spikes all live on the same board.
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          action={async (formData) => {
            const result = await createTicket(formData);
            if ("error" in result && result.error) {
              toast.error(result.error);
              return;
            }
            toast.success(`${result.key} opened`);
            setOpen(false);
            router.refresh();
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
          <DialogFooter>
            <Button type="submit">Create ticket</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

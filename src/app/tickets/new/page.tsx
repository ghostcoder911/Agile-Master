import { PageHeader } from "@/components/page-header";
import { createTicketForm } from "@/lib/actions";
import { readWorkspace } from "@/lib/store";

const fieldClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm";

export default async function NewTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ sprint?: string }>;
}) {
  const { sprint } = await searchParams;
  const ws = readWorkspace();
  const defaultSprintId =
    sprint ?? ws.sprints.find((s) => s.status === "active")?.id ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        eyebrow="New ticket"
        title="Open a work item"
        description="Give it an owner and a due date if it belongs in this sprint. The board stays honest only if the card does."
      />
      <form action={createTicketForm} className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <label className="grid gap-1.5 text-sm font-medium">
          Title
          <input id="title" name="title" required placeholder="What needs to happen?" className={fieldClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Description
          <textarea name="description" placeholder="Context, acceptance, risk" className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-sm font-medium">
            Type
            <select name="type" defaultValue="task" className={fieldClass}>
              <option value="story">Story</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
              <option value="spike">Spike</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Priority
            <select name="priority" defaultValue="medium" className={fieldClass}>
              <option value="medium">Medium</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Status
            <select name="status" defaultValue="todo" className={fieldClass}>
              <option value="backlog">Backlog</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Points
            <input name="storyPoints" type="number" min={0} placeholder="3" className={fieldClass} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Assignee
            <select name="assigneeId" className={fieldClass}>
              <option value="">Unassigned</option>
              {ws.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Sprint
            <select name="sprintId" defaultValue={defaultSprintId} className={fieldClass}>
              <option value="">None</option>
              {ws.sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Due date
            <input name="dueDate" type="date" className={fieldClass} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Labels
            <input name="labels" placeholder="checkout, qa" className={fieldClass} />
          </label>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
          >
            Create ticket
          </button>
        </div>
      </form>
    </div>
  );
}

import type { Member } from "@/lib/types";

export function ActorSwitcher({
  members,
  currentId,
  nextPath,
}: {
  members: Member[];
  currentId: string;
  nextPath: string;
}) {
  return (
    <form action="/act-as" method="get" className="space-y-1.5">
      <input type="hidden" name="next" value={nextPath} />
      <label className="sr-only" htmlFor="am-actor">
        Act as
      </label>
      <select
        id="am-actor"
        name="memberId"
        defaultValue={currentId}
        className="h-8 w-full rounded-lg border border-sidebar-border bg-sidebar px-2 text-xs"
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} · {m.title}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="h-7 w-full rounded-lg bg-sidebar-accent text-[11px] font-medium text-sidebar-accent-foreground"
      >
        Switch identity
      </button>
    </form>
  );
}

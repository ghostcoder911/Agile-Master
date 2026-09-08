"use client";

import { switchActor } from "@/lib/actions";
import type { Member } from "@/lib/types";
import { useRouter } from "next/navigation";

export function ActorSwitcher({
  members,
  currentId,
}: {
  members: Member[];
  currentId: string;
}) {
  const router = useRouter();
  return (
    <form action={switchActor}>
      <label className="sr-only" htmlFor="memberId">
        Act as
      </label>
      <select
        id="memberId"
        name="memberId"
        defaultValue={currentId}
        className="h-8 w-full rounded-lg border border-sidebar-border bg-sidebar px-2 text-xs"
        onChange={(e) => {
          e.currentTarget.form?.requestSubmit();
          router.refresh();
        }}
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} · {m.title}
          </option>
        ))}
      </select>
    </form>
  );
}

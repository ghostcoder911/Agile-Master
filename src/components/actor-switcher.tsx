"use client";

import { switchActor } from "@/lib/actions";
import type { Member } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function ActorSwitcher({
  members,
  currentId,
}: {
  members: Member[];
  currentId: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentId);
  const [pending, start] = useTransition();

  useEffect(() => {
    setValue(currentId);
  }, [currentId]);

  return (
    <div>
      <label className="sr-only" htmlFor="memberId">
        Act as
      </label>
      <select
        id="memberId"
        name="memberId"
        value={value}
        disabled={pending}
        className="h-8 w-full rounded-lg border border-sidebar-border bg-sidebar px-2 text-xs"
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          const formData = new FormData();
          formData.set("memberId", next);
          start(async () => {
            await switchActor(formData);
            router.refresh();
          });
        }}
      >
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} · {m.title}
          </option>
        ))}
      </select>
    </div>
  );
}

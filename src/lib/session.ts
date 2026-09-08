import { cookies } from "next/headers";
import { readWorkspace } from "@/lib/store";
import type { Member } from "@/lib/types";

export const ACTOR_COOKIE = "am_actor";

export async function getActor(): Promise<Member> {
  const ws = readWorkspace();
  const cookieStore = await cookies();
  const id = cookieStore.get(ACTOR_COOKIE)?.value;
  return ws.members.find((m) => m.id === id) ?? ws.members[0];
}

export async function setActorId(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTOR_COOKIE, id, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

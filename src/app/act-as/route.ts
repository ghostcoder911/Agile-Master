import { NextRequest, NextResponse } from "next/server";
import { ACTOR_COOKIE } from "@/lib/session";
import { readWorkspace } from "@/lib/store";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("memberId") ?? "";
  const nextPath = request.nextUrl.searchParams.get("next") || "/";
  const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
  const ws = readWorkspace();
  const res = NextResponse.redirect(new URL(safeNext, request.url));
  if (id && ws.members.some((m) => m.id === id)) {
    res.cookies.set(ACTOR_COOKIE, id, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

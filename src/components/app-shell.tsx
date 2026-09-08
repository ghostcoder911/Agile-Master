"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActorSwitcher } from "@/components/actor-switcher";
import { MemberAvatar } from "@/components/member-avatar";
import { cn } from "@/lib/utils";
import type { Member, Sprint } from "@/lib/types";
import {
  Activity,
  Bot,
  ClipboardList,
  Gauge,
  Kanban,
  LayoutDashboard,
  ListTodo,
  MessageSquareWarning,
  Timer,
  Users,
} from "lucide-react";

const nav = [
  { href: "/", label: "Command", icon: LayoutDashboard },
  { href: "/board", label: "Board", icon: Kanban },
  { href: "/backlog", label: "Backlog", icon: ListTodo },
  { href: "/sprints", label: "Sprints", icon: Timer },
  { href: "/standup", label: "Daily log", icon: ClipboardList },
  { href: "/follow-ups", label: "Follow-ups", icon: MessageSquareWarning },
  { href: "/team", label: "Team", icon: Users },
  { href: "/analytics", label: "Analytics", icon: Gauge },
  { href: "/agent", label: "Agile Coach", icon: Bot },
];

export function AppShell({
  children,
  actor,
  members,
  sprint,
  followUpCount,
}: {
  children: React.ReactNode;
  actor: Member;
  members: Member[];
  sprint: Sprint | null;
  followUpCount: number;
}) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="mesh-rail sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border lg:flex">
        <div className="px-4 pt-5 pb-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground">
              AM
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight">Agile Master</span>
              <span className="block text-[11px] text-muted-foreground">Harbor Squad</span>
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2">
          {nav.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm transition",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="size-4 opacity-80" />
                <span className="flex-1">{item.label}</span>
                {item.href === "/follow-ups" && followUpCount > 0 && (
                  <span className="rounded-full bg-rose-500/20 px-1.5 text-[10px] font-medium text-rose-300">
                    {followUpCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 border-t border-sidebar-border p-3">
          {sprint && (
            <div className="rounded-lg bg-background/40 px-2.5 py-2">
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase">Active sprint</p>
              <p className="text-xs font-medium">{sprint.name}</p>
              <p className="line-clamp-2 text-[11px] text-muted-foreground">{sprint.goal}</p>
            </div>
          )}
          <div className="flex items-center gap-2 px-1">
            <MemberAvatar member={actor} />
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">{actor.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{actor.title}</p>
            </div>
          </div>
          <ActorSwitcher members={members} currentId={actor.id} />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="size-4 text-primary" />
            <span className="hidden sm:inline">Acting as</span>
            <span className="font-medium text-foreground">{actor.name}</span>
            <span className="hidden md:inline">· switch identity in the rail to log work as a teammate</span>
          </div>
          <Link
            href="/agent"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
          >
            <Bot className="size-3.5" />
            Coach
          </Link>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 lg:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

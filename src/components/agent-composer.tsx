"use client";

import { Textarea } from "@/components/ui/textarea";
import { askCoachText } from "@/lib/agent-actions";
import type { AgentMessage } from "@/lib/types";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const SUGGESTIONS = [
  "Brief the sprint and call out risk",
  "Run a due-date follow-up sweep",
  "Summarize today's standup",
  "Who is overloaded this sprint?",
  "Assign AM-122 to Priya",
];

export function AgentComposer({
  compact,
  initialMessages = [],
}: {
  compact?: boolean;
  initialMessages?: AgentMessage[];
}) {
  const [message, setMessage] = useState("");
  const [thread, setThread] = useState<AgentMessage[]>(initialMessages);
  const [pending, start] = useTransition();
  const router = useRouter();

  function send(text: string) {
    const value = text.trim();
    if (!value || pending) return;
    const userMsg: AgentMessage = {
      id: `local_${Date.now()}`,
      role: "user",
      content: value,
      createdAt: new Date().toISOString(),
    };
    setThread((prev) => [...prev, userMsg]);
    setMessage("");
    start(async () => {
      try {
        const result = await askCoachText(value);
        setThread((prev) => [
          ...prev,
          {
            id: `local_a_${Date.now()}`,
            role: "assistant",
            content: result.reply,
            createdAt: new Date().toISOString(),
          },
        ]);
        if (result.actions.length) toast.success(result.actions.join(" · "));
        router.refresh();
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Coach could not answer.";
        toast.error(detail);
        setThread((prev) => [
          ...prev,
          {
            id: `local_e_${Date.now()}`,
            role: "assistant",
            content: `I hit a snag: ${detail}`,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    });
  }

  return (
    <div className="space-y-3">
      {!compact && (
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {thread.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-8 rounded-xl bg-primary/15 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
                  : "mr-8 rounded-xl bg-muted/60 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
              }
            >
              <p className="mb-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                {m.role === "user" ? "You" : "Coach"}
              </p>
              {m.content}
            </div>
          ))}
          {pending && (
            <p className="text-xs text-muted-foreground">Coach is reading the board…</p>
          )}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(message);
        }}
        className="relative"
      >
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              send(message);
            }
          }}
          placeholder="Ask the coach to brief, assign, nudge, or analyze…"
          className={compact ? "min-h-16 pr-24" : "min-h-24 pr-24"}
        />
        <button
          type="submit"
          disabled={pending}
          className="absolute right-2 bottom-2 inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground disabled:opacity-50"
        >
          <Sparkles className="size-3.5" />
          {pending ? "Thinking" : "Ask"}
        </button>
      </form>
      {compact && thread.length > 0 && (
        <p className="rounded-lg bg-muted/50 p-2 text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
          {thread[thread.length - 1]?.content}
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

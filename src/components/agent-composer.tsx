import { askCoach } from "@/lib/agent-actions";
import type { AgentMessage } from "@/lib/types";
import { Sparkles } from "lucide-react";

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
  return (
    <div className="space-y-3">
      {!compact && (
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {initialMessages.map((m) => (
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
        </div>
      )}
      <form action={askCoach} className="relative">
        <textarea
          name="message"
          required
          placeholder="Ask the coach to brief, assign, nudge, or analyze…"
          className={`flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none ${
            compact ? "min-h-16 pr-24" : "min-h-24 pr-24"
          }`}
        />
        <button
          type="submit"
          className="absolute right-2 bottom-2 inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground"
        >
          <Sparkles className="size-3.5" />
          Ask
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <form action={askCoach} key={s}>
            <button
              type="submit"
              name="message"
              value={s}
              className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {s}
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askCoachText } from "@/lib/agent-actions";
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

export function AgentComposer({ compact }: { compact?: boolean }) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    start(async () => {
      const result = await askCoachText(value);
      setMessage("");
      if (result.actions.length) toast.success(result.actions.join(" · "));
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
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
          placeholder="Ask the coach to brief, assign, nudge, or analyze…"
          className={compact ? "min-h-16 pr-24" : "min-h-24 pr-24"}
        />
        <Button
          type="submit"
          disabled={pending}
          className="absolute right-2 bottom-2"
          size="sm"
        >
          <Sparkles className="size-3.5" />
          {pending ? "Thinking" : "Ask"}
        </Button>
      </form>
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

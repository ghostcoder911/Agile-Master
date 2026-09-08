import { AgentComposer } from "@/components/agent-composer";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { readWorkspace } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AgentPage() {
  const ws = readWorkspace();
  const hasKey = Boolean(process.env.OPENAI_API_KEY);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Agile Coach"
        title="Operate the board in English"
        description={
          hasKey
            ? "OpenAI is connected. I still apply assignments, status changes, and follow-up sweeps locally so the board stays the source of truth."
            : "Running on the built-in coach. Add OPENAI_API_KEY for freer conversation — assignments, sweeps, and status changes already work without it."
        }
      />
      <Card>
        <CardContent className="space-y-4 pt-1">
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {ws.agentMessages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user" ? "ml-8 bg-primary/15" : "mr-8 bg-muted/60"
                )}
              >
                <p className="mb-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                  {m.role === "user" ? "You" : "Coach"}
                </p>
                {m.content}
              </div>
            ))}
          </div>
          <AgentComposer />
        </CardContent>
      </Card>
    </div>
  );
}

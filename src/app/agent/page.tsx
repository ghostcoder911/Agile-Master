import { AgentComposer } from "@/components/agent-composer";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { readWorkspace } from "@/lib/store";

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
        <CardContent className="pt-1">
          <AgentComposer initialMessages={ws.agentMessages} />
        </CardContent>
      </Card>
    </div>
  );
}

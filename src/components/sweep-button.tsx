"use client";

import { runDueDateSweep } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";

export function SweepButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const result = await runDueDateSweep();
          toast.success(
            result.created
              ? `Coach drafted ${result.created} follow-up${result.created === 1 ? "" : "s"}`
              : "Sweep complete — no new follow-ups"
          );
          router.refresh();
        })
      }
    >
      <Megaphone className="size-4" />
      {pending ? "Sweeping…" : "Run due-date sweep"}
    </Button>
  );
}

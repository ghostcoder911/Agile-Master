"use server";

import { revalidatePath } from "next/cache";
import { runAgent } from "@/lib/agent";

export async function askCoach(formData: FormData) {
  const message = String(formData.get("message") ?? "");
  const result = await runAgent(message);
  revalidatePath("/agent");
  revalidatePath("/");
  revalidatePath("/follow-ups");
  revalidatePath("/board");
  revalidatePath("/team");
  return result;
}

export async function askCoachText(message: string) {
  const result = await runAgent(message);
  revalidatePath("/agent");
  revalidatePath("/");
  revalidatePath("/follow-ups");
  revalidatePath("/board");
  revalidatePath("/team");
  return result;
}

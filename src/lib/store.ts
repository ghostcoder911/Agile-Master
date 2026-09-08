import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import path from "path";
import { createSeedWorkspace } from "@/lib/seed";
import type { Workspace } from "@/lib/types";

const dataDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "agile-master-data")
  : path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "workspace.json");

let cache: Workspace | null = null;
let writeChain: Promise<void> = Promise.resolve();

function persistSync(ws: Workspace) {
  cache = ws;
  try {
    mkdirSync(dataDir, { recursive: true });
    writeFileSync(dataFile, JSON.stringify(ws, null, 2));
  } catch {
    // Vercel / read-only FS: keep the in-memory board for this instance.
  }
}

export function readWorkspace(): Workspace {
  if (cache) return cache;
  try {
    if (existsSync(dataFile)) {
      cache = JSON.parse(readFileSync(dataFile, "utf8")) as Workspace;
      return cache;
    }
  } catch {
    // fall through to seed
  }
  cache = createSeedWorkspace();
  persistSync(cache);
  return cache;
}

export async function writeWorkspace(next: Workspace) {
  cache = next;
  writeChain = writeChain.then(() => {
    persistSync(next);
  });
  await writeChain;
}

export async function updateWorkspace(mutator: (ws: Workspace) => void) {
  const ws = structuredClone(readWorkspace());
  mutator(ws);
  await writeWorkspace(ws);
  return ws;
}

export async function resetWorkspace() {
  cache = createSeedWorkspace();
  await writeWorkspace(cache);
  return cache;
}

export function getMember(id: string) {
  return readWorkspace().members.find((m) => m.id === id) ?? null;
}

export function getTicket(idOrKey: string) {
  const ws = readWorkspace();
  return (
    ws.tickets.find((t) => t.id === idOrKey || t.key === idOrKey) ?? null
  );
}

export function activeSprint() {
  return readWorkspace().sprints.find((s) => s.status === "active") ?? null;
}

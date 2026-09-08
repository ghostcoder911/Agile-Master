import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { createSeedWorkspace } from "@/lib/seed";
import type { Workspace } from "@/lib/types";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "workspace.json");

let cache: Workspace | null = null;
let writeChain: Promise<void> = Promise.resolve();

function ensureDir() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
}

export function readWorkspace(): Workspace {
  if (cache) return cache;
  ensureDir();
  if (!existsSync(dataFile)) {
    cache = createSeedWorkspace();
    writeFileSync(dataFile, JSON.stringify(cache, null, 2));
    return cache;
  }
  try {
    cache = JSON.parse(readFileSync(dataFile, "utf8")) as Workspace;
    return cache;
  } catch {
    cache = createSeedWorkspace();
    writeFileSync(dataFile, JSON.stringify(cache, null, 2));
    return cache;
  }
}

export async function writeWorkspace(next: Workspace) {
  cache = next;
  const payload = JSON.stringify(next, null, 2);
  writeChain = writeChain.then(() => {
    ensureDir();
    writeFileSync(dataFile, payload);
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

# Agile Master

Agent-assisted agile operations for a squad that already knows Scrum and is tired of a board that does not talk back.

Harbor Squad ships **Harbor Checkout**. Agile Master is the place they log work, assign tickets, defend a sprint goal, and let a coach nudge people when due dates slip.

## What it does

- **Command** — sprint pulse, overdue work, missing daily logs, team load
- **Board** — Kanban for the active sprint; drag cards between columns
- **Backlog** — every ticket, filterable, with assignment and due dates
- **Sprints** — plan, activate, complete; one active increment at a time
- **Daily log** — yesterday / today / blockers / hours / mood, per teammate
- **Follow-ups** — coach-drafted nudges for overdue, due-today, stalled, blocked, and missing standups
- **Team** — coaching-oriented contribution, WIP, and capacity
- **Analytics** — burndown, velocity, completion by person
- **Agile Coach** — English in, board changes out (`assign AM-122 to Priya`, `run a due-date sweep`, `brief the sprint`)

There is no login. Switch identity in the left rail to act as a teammate (Product Owner, Scrum Master, engineers, design, QA). Persistence is a local JSON workspace in `data/workspace.json` (or `/tmp` on Vercel, which resets on cold starts).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:4521](http://localhost:4521).

## Deploy on Vercel

This is a standard Next.js app. Import `ghostcoder911/Agile-Master` in Vercel (no env vars required). The demo board is seeded on first request. Board edits survive while the serverless instance is warm; they reset on a cold start because there is no database.

Optional: copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` if you want a more conversational coach. Without a key, the built-in coach still reads the live board, drafts follow-ups, assigns work, and answers sprint questions from real data.

## Coach commands worth trying

- Brief the sprint and call out risk
- Run a due-date follow-up sweep
- Summarize today's standup
- Who is overloaded this sprint?
- Assign AM-122 to Priya
- Move AM-118 to review
- Draft a follow-up for AM-112

## Stack

Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Recharts. No database server required.

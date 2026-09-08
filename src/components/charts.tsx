"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "oklch(0.215 0.02 250)",
  border: "1px solid oklch(0.92 0.01 95 / 12%)",
  borderRadius: 8,
  fontSize: 12,
};

export function BurndownChart({
  data,
}: {
  data: { day: string; remaining: number; ideal: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="oklch(0.92 0.01 95 / 8%)" />
          <XAxis dataKey="day" tickFormatter={(v) => String(v).slice(5)} tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Line type="monotone" dataKey="ideal" stroke="oklch(0.7 0.02 250)" strokeDasharray="4 4" dot={false} />
          <Line type="monotone" dataKey="remaining" stroke="oklch(0.82 0.1 175)" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VelocityChart({
  data,
}: {
  data: { sprint: string; committed: number; completed: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="oklch(0.92 0.01 95 / 8%)" />
          <XAxis dataKey="sprint" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Bar dataKey="committed" fill="oklch(0.45 0.04 250)" radius={4} />
          <Bar dataKey="completed" fill="oklch(0.72 0.1 175)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MemberBars({
  data,
}: {
  data: { name: string; done: number; open: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid stroke="oklch(0.92 0.01 95 / 8%)" />
          <XAxis type="number" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={64} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Bar dataKey="done" stackId="a" fill="oklch(0.72 0.1 175)" radius={4} />
          <Bar dataKey="open" stackId="a" fill="oklch(0.5 0.04 70)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

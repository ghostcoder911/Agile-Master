import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/app-shell";
import { getActor } from "@/lib/session";
import { readWorkspace } from "@/lib/store";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agile Master — Harbor Squad",
  description:
    "Agent-assisted agile operations: tickets, sprints, daily logs, due-date follow-ups, and team productivity.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const actor = await getActor();
  const ws = readWorkspace();
  const sprint = ws.sprints.find((s) => s.status === "active") ?? null;
  const followUpCount = ws.followUps.filter((f) => f.status === "pending").length;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <TooltipProvider>
            <AppShell
              actor={actor}
              members={ws.members}
              sprint={sprint}
              followUpCount={followUpCount}
            >
              {children}
            </AppShell>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

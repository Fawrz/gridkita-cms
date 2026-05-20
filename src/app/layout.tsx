import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ToastFromQuery } from "@/components/toast-from-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleSwitcher } from "@/components/role-switcher";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GridKita Creative — Jasa Desain Grafis & Pemasaran Digital",
    template: "%s · GridKita",
  },
  description:
    "Agensi kreatif terintegrasi: pesan jasa desain grafis & pemasaran digital secara self-service, pantau status real-time, dan terima hasil tepat waktu.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const me = await getCurrentUser();
  return (
    <html
      lang="id"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider delayDuration={150}>
            {children}
            <Toaster richColors position="top-right" closeButton />
            <ToastFromQuery />
            <RoleSwitcher currentUserEmail={me?.email ?? null} />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

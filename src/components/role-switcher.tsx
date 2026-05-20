"use client";

import { useState, useTransition } from "react";
import { UserCog, LogOut, ShieldCheck, Brush, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { signOut, switchDemoAccount } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const roleIcon = {
  ADMIN: ShieldCheck,
  DESIGNER: Brush,
  CLIENT: UserIcon,
} as const;

const demoAccounts: { email: string; name: string; role: Role }[] = [
  { email: "admin@gridkita.id", name: "Damar Prakoso", role: "ADMIN" },
  { email: "arka@gridkita.id", name: "Arka Mahendra", role: "DESIGNER" },
  { email: "nara@gridkita.id", name: "Nara Satria", role: "DESIGNER" },
  { email: "tara@example.com", name: "Tara Kusuma", role: "CLIENT" },
  { email: "nesya@example.com", name: "Nesya Larasati", role: "CLIENT" },
  { email: "gilang@example.com", name: "Gilang Aditya", role: "CLIENT" },
];

export function RoleSwitcher({ currentUserEmail }: { currentUserEmail: string | null }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const me = demoAccounts.find((u) => u.email === currentUserEmail) ?? null;

  const handlePick = (email: string) => {
    setOpen(false);
    startTransition(() => {
      void switchDemoAccount(email);
    });
  };

  const handleLogout = () => {
    setOpen(false);
    startTransition(() => {
      void signOut();
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 print:hidden">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className="shadow-lg border bg-card/90 backdrop-blur gap-2"
            disabled={pending}
            aria-label="Switch role (developer tool)"
          >
            <UserCog className="size-4" />
            <span className="hidden sm:inline">
              {me ? `${me.name.split(" ")[0]} · ${me.role}` : "Login Demo"}
            </span>
            {me && (
              <Badge variant="outline" className="hidden md:inline-flex h-5 text-[10px]">
                DEV
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          className="w-72 p-0 overflow-hidden"
        >
          <div className="px-4 py-3 border-b bg-muted/40">
            <div className="text-xs font-medium text-muted-foreground">Demo Role Switcher</div>
            <div className="text-[11px] text-muted-foreground/80 mt-0.5">
              Login cepat tanpa password (front-end mock).
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {(["ADMIN", "DESIGNER", "CLIENT"] as const).map((role) => {
              const list = demoAccounts.filter((u) => u.role === role);
              const Icon = roleIcon[role];
              return (
                <div key={role} className="px-1">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Icon className="size-3" />
                    {role}
                  </div>
                  {list.map((u) => (
                    <button
                      key={u.email}
                      onClick={() => handlePick(u.email)}
                      disabled={pending}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between gap-2 hover:bg-muted transition-colors",
                        me?.email === u.email && "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/40 grid place-items-center text-[11px] font-medium shrink-0">
                          {u.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          {me && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground"
                onClick={handleLogout}
                disabled={pending}
              >
                <LogOut className="size-4 mr-2" /> Keluar
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

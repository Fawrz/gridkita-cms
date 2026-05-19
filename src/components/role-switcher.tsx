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
import { signInWithCredentials, signOut } from "@/app/actions/auth";
import { users } from "@/lib/mock/users";
import { cn } from "@/lib/utils";

const roleIcon = {
  ADMIN: ShieldCheck,
  DESIGNER: Brush,
  CLIENT: UserIcon,
} as const;

const demoPasswords: Record<string, string> = {
  "admin@gridkita.id": "gridkita2026",
  "wahyu@gridkita.id": "designer123",
  "raffi@gridkita.id": "designer123",
  "nabil@gridkita.id": "designer123",
  "rifat@example.com": "client123",
  "amelia@example.com": "client123",
  "budi@example.com": "client123",
};

export function RoleSwitcher({ currentUserId }: { currentUserId: string | null }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const me = users.find((u) => u.id === currentUserId) ?? null;

  const handlePick = (email: string) => {
    setOpen(false);
    startTransition(() => {
      void signInWithCredentials(email, demoPasswords[email] || "demo123");
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
              const list = users.filter((u) => u.role === role);
              const Icon = roleIcon[role];
              return (
                <div key={role} className="px-1">
                  <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Icon className="size-3" />
                    {role}
                  </div>
                  {list.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handlePick(u.email)}
                      disabled={pending}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between gap-2 hover:bg-muted transition-colors",
                        me?.id === u.id && "bg-primary/10 text-primary"
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
                      {!u.isActive && (
                        <Badge variant="outline" className="text-[10px]">
                          off
                        </Badge>
                      )}
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  Menu,
  Search,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  FileQuestion,
  Images,
  Package,
  Users,
  User as UserIcon,
  Wallet,
  ReceiptText,
  Repeat,
  BarChart3,
  Settings,
  Sparkles,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/app/actions/auth";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

const ICON_REGISTRY: Record<string, LucideIcon> = {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  FileQuestion,
  Images,
  Package,
  Users,
  User: UserIcon,
  Wallet,
  ReceiptText,
  Repeat,
  BarChart3,
  Settings,
  Bell,
  Sparkles,
  ListTodo,
};

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number | string;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

function SidebarNav({
  groups,
  onNavigate,
}: {
  groups: NavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = groups
    .flatMap((group) => group.items.map((item) => item.href))
    .filter(
      (href) =>
        pathname === href ||
        (href !== "/" && pathname.startsWith(`${href}/`))
    )
    .sort((a, b) => b.length - a.length)[0];

  return (
    <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </div>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = ICON_REGISTRY[item.icon] ?? LayoutDashboard;
              const active = activeHref === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200",
                      "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                      active &&
                        "bg-sidebar-primary/12 text-sidebar-primary shadow-sm ring-1 ring-sidebar-primary/15 hover:bg-sidebar-primary/16 font-semibold"
                    )}
                  >
                    {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-sidebar-primary" aria-hidden />}
                    <Icon className={cn("size-5 shrink-0 transition-colors", active ? "text-sidebar-primary" : "text-sidebar-foreground/50")} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <Badge
                        variant={active ? "default" : "outline"}
                        className="h-5 px-1.5 text-[10px] rounded-full"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DashboardShell({
  groups,
  me,
  unread,
  notifLink,
  roleLabel,
  showThemeToggle = false,
  children,
}: {
  groups: NavGroup[];
  me: User;
  unread: number;
  notifLink: string;
  roleLabel: string;
  showThemeToggle?: boolean;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-svh flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[270px] shrink-0 flex-col border-r border-border/60 bg-sidebar text-sidebar-foreground sticky top-0 h-svh">
        <div className="h-[72px] flex items-center px-6 border-b border-border/50">
          <BrandMark />
          <Badge variant="outline" className="ml-3 text-[10px] bg-background/50 border-border/50">
            {roleLabel}
          </Badge>
        </div>
        <SidebarNav groups={groups} />
        <div className="p-4 border-t border-border/40">
          <UserCard me={me} />
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="h-[72px] sticky top-0 z-30 border-b border-border/50 bg-background/82 backdrop-blur-xl flex items-center gap-4 px-4 md:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" aria-label="Buka navigasi" className="shrink-0 -ml-2">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 p-0 bg-sidebar text-sidebar-foreground border-r-0"
            >
              <SheetTitle className="sr-only">Navigasi</SheetTitle>
              <div className="h-[72px] flex items-center px-6 border-b border-border/40">
                <BrandMark />
                <Badge variant="outline" className="ml-3 text-[10px]">
                  {roleLabel}
                </Badge>
              </div>
              <SidebarNav groups={groups} onNavigate={() => setMobileOpen(false)} />
              <div className="p-4 border-t border-border/40">
                <UserCard me={me} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex items-center gap-2 max-w-md flex-1">
            <div className="relative flex-1 group">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="search"
                aria-label="Cari order, klien, atau paket"
                placeholder="Cari order, klien, paket…"
                className="w-full h-11 pl-10 pr-4 rounded-2xl border border-border/70 bg-card text-sm shadow-sm shadow-foreground/3 placeholder:text-muted-foreground focus:outline-none focus:ring-3 focus:ring-primary/15 focus:bg-background focus:border-primary/40 transition-[border-color,background-color,box-shadow]"
              />
            </div>
          </div>

          <div className="flex-1 md:hidden" />

          {showThemeToggle && <ThemeToggle />}

          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notifikasi">
            <Link href={notifLink}>
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 grid min-h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white ring-2 ring-background">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 gap-2 rounded-2xl px-2.5">
                <Avatar className="size-7">
                  <AvatarImage src={me.avatarUrl} alt={me.name} />
                  <AvatarFallback>
                    {me.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {me.name.split(" ")[0]}
                </span>
                <ChevronDown className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="font-medium truncate">{me.name}</div>
                <div className="text-xs text-muted-foreground truncate">{me.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`${notifLink.replace("/notifications", "/profile")}`}>
                  Profil saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={notifLink}>Notifikasi</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0">
                <SignOutForm />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function SignOutForm() {
  return (
    <form action={signOut} className="w-full">
      <button
        type="submit"
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:text-foreground transition-colors"
      >
        <LogOut className="size-4 shrink-0" />
        Keluar
      </button>
    </form>
  );
}

function UserCard({ me }: { me: User }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/70 p-2.5 shadow-sm">
      <Avatar className="size-8">
        <AvatarImage src={me.avatarUrl} alt={me.name} />
        <AvatarFallback>
          {me.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium truncate">{me.name}</div>
        <div className="text-[11px] text-muted-foreground truncate">{me.email}</div>
      </div>
    </div>
  );
}

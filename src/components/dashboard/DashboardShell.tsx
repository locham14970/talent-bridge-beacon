import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Bell, Home, LogOut } from "lucide-react";

import { Logo } from "@/components/home/Logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAccount, useNotifications } from "@/hooks/use-account";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_LABELS, roleHome } from "@/lib/account";
import { NAV_BY_ROLE, type NavItem } from "./nav";

export function initials(name: string, fallback: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return fallback.slice(0, 1).toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "")).toUpperCase();
}

function NavLinks({ items, unread }: { items: NavItem[]; unread: number }) {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.to}>
          <SidebarMenuButton asChild isActive={pathname === item.to} tooltip={item.label} className="h-10">
            <Link to={item.to} onClick={() => setOpenMobile(false)}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
          {item.notifications && unread > 0 && (
            <SidebarMenuBadge className="rounded-full bg-teal text-teal-foreground">{unread}</SidebarMenuBadge>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, profile, role } = useAccount();
  const { data: notifications } = useNotifications();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const nav = NAV_BY_ROLE[role];
  const unread = (notifications ?? []).filter((n) => !n.read_at).length;
  const name = profile?.full_name || user.email || "";
  const notificationsPath = nav.account.find((i) => i.notifications)?.to ?? roleHome(role);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/login", replace: true });
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="offcanvas">
        <SidebarHeader className="px-4 py-5">
          <Link to={roleHome(role)} aria-label="Go to dashboard overview" className="rounded-lg">
            <Logo tone="light" />
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60">
              {ROLE_LABELS[role]} workspace
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavLinks items={nav.main} unread={unread} />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/60">Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <NavLinks items={nav.account} unread={unread} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-1 p-4">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-sidebar-accent/60 p-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-teal text-sm font-bold text-teal-foreground">
              {initials(profile?.full_name ?? "", user.email ?? "U")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-sidebar-foreground/60">{ROLE_LABELS[role]}</p>
            </div>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="h-9">
                <Link to="/">
                  <Home />
                  <span>Back to homepage</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={signOut} className="h-9">
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6">
          <SidebarTrigger className="size-9" aria-label="Toggle navigation" />
          <span className="text-sm font-medium text-muted-foreground">{ROLE_LABELS[role]}</span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to={notificationsPath}
              aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
              className="relative inline-flex size-10 items-center justify-center rounded-full text-navy hover:bg-secondary"
            >
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-teal px-1 text-[10px] font-bold text-teal-foreground">
                  {unread}
                </span>
              )}
            </Link>
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

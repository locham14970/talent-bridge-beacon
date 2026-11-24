import {
  Bell,
  BookUser,
  Building2,
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { AppRole } from "@/lib/account";

export type NavPath =
  | "/dashboard"
  | "/dashboard/passport"
  | "/dashboard/assessment"
  | "/dashboard/readiness"
  | "/dashboard/opportunities"
  | "/dashboard/notifications"
  | "/dashboard/profile"
  | "/employer"
  | "/employer/notifications"
  | "/employer/profile"
  | "/admin"
  | "/admin/notifications"
  | "/admin/profile";

export type NavItem = { label: string; to: NavPath; icon: LucideIcon; notifications?: boolean };

export const NAV_BY_ROLE: Record<AppRole, { main: NavItem[]; account: NavItem[] }> = {
  refugee: {
    main: [
      { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
      { label: "Skills Passport", to: "/dashboard/passport", icon: BookUser },
      { label: "Skills Assessment", to: "/dashboard/assessment", icon: ClipboardCheck },
      { label: "Readiness Navigator", to: "/dashboard/readiness", icon: Compass },
      { label: "Opportunity Matching", to: "/dashboard/opportunities", icon: Sparkles },
    ],
    account: [
      { label: "Notifications", to: "/dashboard/notifications", icon: Bell, notifications: true },
      { label: "My Profile", to: "/dashboard/profile", icon: UserRound },
    ],
  },
  employer: {
    main: [{ label: "Overview", to: "/employer", icon: LayoutDashboard }],
    account: [
      { label: "Notifications", to: "/employer/notifications", icon: Bell, notifications: true },
      { label: "Organisation Profile", to: "/employer/profile", icon: Building2 },
    ],
  },
  admin: {
    main: [{ label: "Overview", to: "/admin", icon: LayoutDashboard }],
    account: [
      { label: "Notifications", to: "/admin/notifications", icon: Bell, notifications: true },
      { label: "My Profile", to: "/admin/profile", icon: UserRound },
    ],
  },
};

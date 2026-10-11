import { LayoutDashboard, Users, Building2, BarChart3, Settings, type LucideIcon } from "lucide-react";

/** One role (rev 3): admin sees everything. */
export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** §22.5 mock "fresh activity" count. */
  badge?: number;
}

export const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/leads", label: "Leads / Calls", icon: Users }, // every lead comes from a call
  { to: "/admin/projects", label: "Projects & properties", icon: Building2 },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

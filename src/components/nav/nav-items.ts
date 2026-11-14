import type { ComponentType } from "react";
import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  Package,
  ShoppingCart,
} from "lucide-react";

export type NavIcon = ComponentType<{
  size?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/recipes", label: "Recettes", icon: BookOpen },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/stock", label: "Stock", icon: Package },
  { href: "/shopping", label: "Liste de courses", icon: ShoppingCart },
] as const satisfies ReadonlyArray<{
  href: string;
  label: string;
  icon: NavIcon;
}>;

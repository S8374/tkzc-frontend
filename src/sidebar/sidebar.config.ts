// @/config/sidebar.config.ts
import { SidebarItem, SidebarSection } from "@/types/sidebar.types";
import {
  LayoutDashboard,
  FileText,
  Phone,
  Shield,
  Mail,
  Settings,
  BarChart3,
  Zap,
  Users,
  Code,
  Key,
  PilcrowLeft,
  Settings2,
  SquarePlus,
  User,
} from "lucide-react";

export const SIDEBAR_CONFIG: SidebarSection[] = [
  {
    title: "Admin Panel",
    roles: ["SUPER_ADMIN"],
    items: [

      {
        title: "Marquee",
        icon: PilcrowLeft,
        items: [
          { title: "Marquee Handel", url: "/admin/marquee", icon: Settings },
        ],
      },
      {
        title: "Slider",
        icon: Settings2,
        items: [
          { title: "Slider Controll", url: "/admin/slider-controll", icon: Settings },
          { title: "Add Slider Type", url: "/admin/add-slider-type", icon: SquarePlus },
          { title: "Add Slider", url: "/admin/sliders", icon: SquarePlus },
        ],
      },
      {
        title: "Deposite",
        icon: PilcrowLeft,
        items: [
          { title: "Deposite Handel", url: "/admin/add-deposite", icon: Settings },
            { title: "Deposite Request", url: "/admin/deposit-requests", icon: Settings },
        ],
      },
      {
        title: "User",
        icon: User,
        items: [
          { title: "User Handel", url: "/admin/controll-user", icon: Settings },
        ],
      },
    ],
  }
  ,
  {
    title: "User Panel",
    roles: ["USERS"],
    items: [
      {
        title: "Dashboard",
        url: "/user/overview",
        icon: LayoutDashboard,
      },
      {
        title: "Phonebook",
        icon: Phone,
        items: [
          { title: "Contacts", url: "/user/phonebook/contacts", icon: Users },
          { title: "Groups", url: "/user/phonebook/groups", icon: Users },
        ],
      },
      {
        title: "Reports",
        icon: BarChart3,
        items: [
          { title: "Usage", url: "/user/reports/usage", icon: Zap },
          { title: "Delivery", url: "/user/reports/delivery", icon: Mail },
          { title: "Errors", url: "/user/reports/errors", icon: Shield },
        ],
      },
      {
        title: "Developer / API",
        icon: Code,
        items: [
          { title: "API Keys", url: "/user/api/keys", icon: Key },
          { title: "Webhooks", url: "/user/api/webhooks", icon: Zap },
          { title: "Documentation", url: "/user/api/docs", icon: FileText },
        ],
      },
    ]
  }
];

// Helper: check if item has children
export const hasChildren = (item: SidebarItem): item is SidebarItem & { items: SidebarItem[] } =>
  !!item.items && item.items.length > 0;
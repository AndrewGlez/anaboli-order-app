import {
  Clipboard,
  BarChart4,
  Settings,
  PlusCircle,
  Package,
  Users,
} from "lucide-react-native";

export interface TabItem {
  name: string;
  href: string;
  title: string;
  icon: typeof Clipboard;
}

export const TAB_ITEMS: TabItem[] = [
  {
    name: "index",
    href: "/",
    title: "Órdenes",
    icon: Clipboard,
  },
  {
    name: "new-order",
    href: "/new-order",
    title: "Nuevo",
    icon: PlusCircle,
  },
  {
    name: "production",
    href: "/production",
    title: "Producción",
    icon: Package,
  },
  {
    name: "gyms",
    href: "/gyms",
    title: "Gimnasios",
    icon: Users,
  },
  {
    name: "analytics",
    href: "/analytics",
    title: "Análisis",
    icon: BarChart4,
  },
  {
    name: "inventory",
    href: "/inventory",
    title: "Inventario",
    icon: Package,
  },
  {
    name: "settings",
    href: "/settings",
    title: "Ajustes",
    icon: Settings,
  },
];

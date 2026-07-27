import { Clipboard, Settings, Package, Users } from "lucide-react-native";

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

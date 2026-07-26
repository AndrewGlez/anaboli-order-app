import { Settings, Package } from "lucide-react-native";

export interface TabItem {
	name: string;
	href: string;
	title: string;
	icon: typeof Settings;
}

export const TAB_ITEMS: TabItem[] = [
	{
		name: "inventory",
		href: "/inventory",
		title: "Inventario",
		icon: Package,
	},
	{
		name: "production",
		href: "/production",
		title: "Producción",
		icon: Package,
	},
	{
		name: "settings",
		href: "/settings",
		title: "Ajustes",
		icon: Settings,
	},
];

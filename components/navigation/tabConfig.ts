import {
  Clipboard,
  BarChart4,
  Settings,
  PlusCircle,
} from 'lucide-react-native';

export interface TabItem {
  name: string;
  href: string;
  title: string;
  icon: typeof Clipboard;
}

export const TAB_ITEMS: TabItem[] = [
  {
    name: 'index',
    href: '/',
    title: 'Ordenes',
    icon: Clipboard,
  },
  {
    name: 'new-order',
    href: '/new-order',
    title: 'Nuevo',
    icon: PlusCircle,
  },
  {
    name: 'analytics',
    href: '/analytics',
    title: 'Análisis',
    icon: BarChart4,
  },
  {
    name: 'settings',
    href: '/settings',
    title: 'Ajustes',
    icon: Settings,
  },
];

export interface NavItem {
  tab: 'tab1' | 'tab2' | 'tab3';
  route: string;
  icon: string;
  label: string;
}

export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { tab: 'tab1', route: '/tabs/tab1', icon: 'heart-outline', label: 'Inicio' },
  { tab: 'tab2', route: '/tabs/tab2', icon: 'pulse-outline', label: 'Diagnóstico' },
  { tab: 'tab3', route: '/tabs/tab3', icon: 'book-outline', label: 'Salud' },
];

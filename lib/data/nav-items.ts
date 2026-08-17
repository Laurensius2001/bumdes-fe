export interface NavItem {
  title: string;
  path: string;
  icon?: string;
  active: boolean;
  collapsible: boolean;
  sublist?: NavItem[];
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'lucide:layout-dashboard',
    active: true,
    collapsible: false,
  },
  {
    title: 'Data Pelanggan',
    path: '/admin/pelanggan',
    icon: 'lucide:users',
    active: false,
    collapsible: false,
    badge: '12',
  },
  {
    title: 'Paket Internet',
    path: '/admin/paket',
    icon: 'lucide:wifi',
    active: false,
    collapsible: false,
    badge: '1Gbps',
  },
  {
    title: 'Keluhan Pelanggan',
    path: '/admin/keluhan',
    icon: 'lucide:message-square-warning',
    active: false,
    collapsible: false,
  },
  {
    title: 'Cetak Struk',
    path: '/admin/struk',
    icon: 'lucide:printer',
    active: false,
    collapsible: false,
    badge: 'POS',
  },
];

export default navItems;

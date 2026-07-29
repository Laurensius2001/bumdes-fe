import { NavItem } from './nav-items';

const navItemsPelanggan: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/pelanggan/dashboard',
    icon: 'ion:home-sharp',
    active: true,
    collapsible: false,
  },
  {
    title: 'Keluhan',
    path: '/pelanggan/keluhan',
    icon: 'material-symbols:chat-error-outline',
    active: true,
    collapsible: false,
  },
];

export default navItemsPelanggan;

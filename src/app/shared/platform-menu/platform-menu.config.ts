import { MenuAppConfig } from '@taliferro/ui/platform/universal-menu.model';

/** Maya Social's part of the universal menu: what you can do here. */
export const PLATFORM_MENU_CONFIG: MenuAppConfig = {
  app: 'social',
  name: 'Social',
  items: [
    { label: 'Today', icon: 'grid', route: '/today', keywords: 'home review approve hold' },
    { label: 'Calendar', icon: 'calendar', route: '/calendar', keywords: 'schedule week month queue' },
    { label: 'Strategy', icon: 'target', route: '/strategy', keywords: 'pillars channels rules' },
    { label: 'Profile', icon: 'users', route: '/profile', keywords: 'company products channels connect accounts' },
  ],
  secondaryItems: [
    { label: 'See it in action', icon: 'play', route: '/videos', keywords: 'videos demo examples watch use cases' },
    { label: 'Compare', icon: 'chart', route: '/compare/synthesia', keywords: 'compare synthesia vs alternative video' },
    { label: 'Help', icon: 'help', route: '/help' },
    { label: 'About', icon: 'info', route: '/about' },
  ],
  signInRoute: '/login',
  profileRoute: '/profile',
};

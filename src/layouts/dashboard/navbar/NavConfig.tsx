// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
// components
import Label from 'src/components/Label';
import SvgIconStyle from 'src/components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name: string) => (
  <SvgIconStyle src={`/icons/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  blog: getIcon('ic_blog'),
  cart: getIcon('ic_cart'),
  chat: getIcon('ic_chat'),
  mail: getIcon('ic_mail'),
  mailline: getIcon('mail-line'),
  kanban: getIcon('ic_kanban'),
  House: getIcon('House'),
  booking: getIcon('ic_booking'),
  invoice: getIcon('ic_invoice'),
  calendar: getIcon('ic_calendar'),
  ecommerce: getIcon('Globe'),
  usersgroup: getIcon('Users-Group'),
  Shuffle: getIcon('Shuffle'),
  mindmap: getIcon('mind-map'),
  dashboard: getIcon('Home'),
  fileblank: getIcon('File-Blank'),
  focusline: getIcon('focus-line'),
  pulse: getIcon('pulse'),
  notification: getIcon('Notification'),
  user: getIcon('User'),
  settings: getIcon('Settings'),
  bilibilifill: getIcon('bilibili-fill'),
  storeline: getIcon('store-line'),
  sales: getIcon('auction-fill'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: '',
    items: [
      { title: 'dashboard', path: PATH_DASHBOARD.general.app, icon: ICONS.dashboard },
      { 
        title: 'marketing', 
        path: PATH_DASHBOARD.marketing.data, 
        icon: ICONS.ecommerce,
      },
      {
        title: 'members',
        path: PATH_DASHBOARD.members.data,
        icon: ICONS.usersgroup,
      },
      { title: 'farms', path: PATH_DASHBOARD.farms.data, icon: ICONS.House },
      {
        title: 'stallions',
        path: PATH_DASHBOARD.stallions.data,
        icon: ICONS.bilibilifill,
      },
      { 
        title: 'horse details', 
        path: PATH_DASHBOARD.horsedetails.data, 
        icon: ICONS.mindmap,
      },
      { 
        title: 'runner details', 
        path: PATH_DASHBOARD.runnerdetails.data, 
        icon: ICONS.Shuffle 
      },
      { 
        title: 'race details', 
        path: PATH_DASHBOARD.race.data, 
        icon: ICONS.focusline 
      },
      { 
        title: 'reports', 
        path: PATH_DASHBOARD.reports.data, 
        icon: ICONS.fileblank 
      },
      { 
        title: 'Messages', 
        path: PATH_DASHBOARD.messages.data, 
        icon: ICONS.mailline 
      },
      { 
        title: 'Products & Promo Codes', 
        path: PATH_DASHBOARD.products.data, 
        icon: ICONS.storeline 
      },
      { 
        title: 'Sales', 
        path: PATH_DASHBOARD.sales.data, 
        icon: ICONS.sales 
      },
    ],
  },

  // MANAGEMENT
  // ----------------------------------------------------------------------
  {
    subheader: 'system',
    items: [     

      // System Activity
      {
        title: 'system activity',
        path: PATH_DASHBOARD.system.systemactivities,
        icon: ICONS.pulse,
      },

      // Notifications
      {
        title: 'notifications',
        path: PATH_DASHBOARD.system.notifications,
        icon: ICONS.notification,
      },

      // USER
      {
        title: 'users',
        path: PATH_DASHBOARD.system.usermanagement,
        icon: ICONS.user,
      },

      // Settings
      {
        title: 'settings',
        path: PATH_DASHBOARD.system.settings,
        icon: ICONS.settings,
      },
    ],
  },  
];

export default navConfig;

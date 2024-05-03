// ----------------------------------------------------------------------

function path(root: string, sublink: string) {
  return `${root}${sublink}`;
}

const ROOTS_AUTH = '/auth';
const ROOTS_DASHBOARD = '/dashboard';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  root: ROOTS_AUTH,
  login: path(ROOTS_AUTH, '/login'),
  register: path(ROOTS_AUTH, '/register'),
  loginUnprotected: path(ROOTS_AUTH, '/login-unprotected'),
  registerUnprotected: path(ROOTS_AUTH, '/register-unprotected'),
  verify: path(ROOTS_AUTH, '/verify'),
  resetPassword: path(ROOTS_AUTH, '/reset-password'),
};

export const PATH_PAGE = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page404: '/404',
  page500: '/500',
  components: '/components',
};

export const PATH_DASHBOARD = {
  root: ROOTS_DASHBOARD,
  general: {
    app: path(ROOTS_DASHBOARD, '/app'),
    // ecommerce: path(ROOTS_DASHBOARD, '/ecommerce'),
    // analytics: path(ROOTS_DASHBOARD, '/analytics'),
    // banking: path(ROOTS_DASHBOARD, '/banking'),
    // booking: path(ROOTS_DASHBOARD, '/booking'),
    // marketing: path(ROOTS_DASHBOARD, '/marketing'),
    // members: path(ROOTS_DASHBOARD, '/members'),
    // farms: path(ROOTS_DASHBOARD, '/farms'),
    // racedetails: path(ROOTS_DASHBOARD, '/racedetails'),
    // runnerdetails: path(ROOTS_DASHBOARD, '/runnerdetails'),
    // reports: path(ROOTS_DASHBOARD, '/reports'),
  },
  system: {
    systemactivities: path(ROOTS_DASHBOARD, '/systemactivities/list'),
    notifications: path(ROOTS_DASHBOARD, '/notifications/list'),
    usermanagement: path(ROOTS_DASHBOARD, '/usermanagement/list'),
    settings: path(ROOTS_DASHBOARD, '/settings'),
    notificationfilter: (unread: string) => path(ROOTS_DASHBOARD, `/notifications/list/${unread}/notificationfilter`),
  },  
  // user: {
  //   root: path(ROOTS_DASHBOARD, '/user'),
  //   new: path(ROOTS_DASHBOARD, '/user/new'),
  //   list: path(ROOTS_DASHBOARD, '/user/list'),
  //   cards: path(ROOTS_DASHBOARD, '/user/cards'),
  //   profile: path(ROOTS_DASHBOARD, '/user/profile'),
  //   account: path(ROOTS_DASHBOARD, '/user/account'),
  //   edit: (name: string) => path(ROOTS_DASHBOARD, `/user/${name}/edit`),
  //   demoEdit: path(ROOTS_DASHBOARD, `/user/reece-chung/edit`),
  // },
  stallions: {
    root: path(ROOTS_DASHBOARD, '/stallions'),
    new: path(ROOTS_DASHBOARD, '/stallions/new'),
    list: path(ROOTS_DASHBOARD, '/stallions/list'),
    data: path(ROOTS_DASHBOARD, '/stallions/data'),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/stallions/${id}/edit`),
    // clist: path(ROOTS_DASHBOARD, '/stallions/clist'),
    feehistory: (id: string) => path(ROOTS_DASHBOARD, `/stallions/data/${id}/feehistory`),
    analytics: (id: string) => path(ROOTS_DASHBOARD, `/stallions/data/${id}/analytics`),
    filter: (farmname: string) => path(ROOTS_DASHBOARD, `/stallions/data/${farmname}/filter`),
    promotedfilter: (farmname: string) => path(ROOTS_DASHBOARD, `/stallions/data/${farmname}/promotedfilter`),
    marketingfilter: (farmname: string, stallionname: string) => path(ROOTS_DASHBOARD, `/stallions/data/${farmname}/${stallionname}/marketingfilter`),
    keywordfilter: (keywordName: string, type: string) => path(ROOTS_DASHBOARD, `/stallions/data/${keywordName}/${type}/keywordfilter`),
    filterId: (stallionId:string) => path(ROOTS_DASHBOARD, `/stallions/data/${stallionId}/edit`),
  },
  horsedetails: {
    root: path(ROOTS_DASHBOARD, '/horsedetails'),   
    new: path(ROOTS_DASHBOARD, '/horsedetails/data/new'),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/horsedetails/data/${id}/edit`),
    addhorse: path(ROOTS_DASHBOARD, '/horsedetails/data/new'),
    add: (name: string, progenyId: string, generation: number) => path(ROOTS_DASHBOARD, `/horsedetails/${name}/${progenyId}/${generation}/add`),
    addnew: (name: string, sex: string) => path(ROOTS_DASHBOARD, `/horsedetails/data/${name}/${sex}/add`),
    addnewforstallion: (requestId: string) => path(ROOTS_DASHBOARD, `/horsedetails/data/${requestId}/addnewforstallion`),
    addnewformare: (requestId: string) => path(ROOTS_DASHBOARD, `/horsedetails/${requestId}/addnewformare`),
    list: path(ROOTS_DASHBOARD, '/horsedetails/list'),
    data: path(ROOTS_DASHBOARD, '/horsedetails/data'),
    keywordsearch: (name: string, id: string, type: string, countryid: number) => path(ROOTS_DASHBOARD, `/horsedetails/data/${name}/${id}/${type}/${countryid}/keywordsearch`),
    progeny: (id: string) => path(ROOTS_DASHBOARD, `/horsedetails/data/${id}/progeny`),
    // new: path(ROOTS_DASHBOARD, '/horsedetails/new'),
    // edit: (id: string) => path(ROOTS_DASHBOARD, `/horsedetails/${id}/edit`),
    // clist: path(ROOTS_DASHBOARD, '/horsedetails/clist'),
    // cedit: (id: string) => path(ROOTS_DASHBOARD, `/horsedetails/${id}/cedit`),
  },
  members: {
    root: path(ROOTS_DASHBOARD, '/members'),
    new: path(ROOTS_DASHBOARD, '/members/new'),
    list: path(ROOTS_DASHBOARD, '/members/list'),
    data: path(ROOTS_DASHBOARD, '/members/data'),
    filter: (farmname: string) => path(ROOTS_DASHBOARD, `/members/data/${farmname}/filter`),
    userFilter: (username: string) => path(ROOTS_DASHBOARD, `/members/data/${username}/userFilter`),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/members/${id}/edit`),
    memberFilter: (obj: any) => path(ROOTS_DASHBOARD, `/members/data/${obj?.horseId}/${obj?.favourite}/memberFilter`),
  },
  farms: {
    data: path(ROOTS_DASHBOARD, '/farms/data'),
    list: path(ROOTS_DASHBOARD, '/stallions/list'),
    filter: (farmname:string) => path(ROOTS_DASHBOARD, `/farms/data/${farmname}/filter`),
    filterId: (farmId:string) => path(ROOTS_DASHBOARD, `/farms/data/${farmId}/edit`),
  },
  race: {
    data: path(ROOTS_DASHBOARD, '/race/data'),
    list: path(ROOTS_DASHBOARD, '/race/list'),
    filter: (name: string) => path(ROOTS_DASHBOARD, `/race/data/${name}/filter`),
    raceFilter: (id: string) => path(ROOTS_DASHBOARD, `/race/data/${id}/raceFilter`),
    horseIdfilter: (horseId: string) => path(ROOTS_DASHBOARD, `/race/data/${horseId}/horsefilter`),
    winnerORStakesfilter: (horseId: string,type:string) => path(ROOTS_DASHBOARD, `/race/data/${horseId}/${type}/typefilter`),
  },
  runnerdetails: {
    data: path(ROOTS_DASHBOARD, '/runnerdetails/data'),
    list: path(ROOTS_DASHBOARD, '/runnerdetails/list'),
    filter: (id: string) => path(ROOTS_DASHBOARD, `/runnerdetails/data/${id}/filter`),
    runnerfilter: (runnerName: string) => path(ROOTS_DASHBOARD, `/runnerdetails/data/${runnerName}/runnerfilter`),
  },
  users: {
    data: path(ROOTS_DASHBOARD, '/users/data'),
  },
  marketing: {
    data: path(ROOTS_DASHBOARD, '/marketing/data'),    
    stallionmatch: path(ROOTS_DASHBOARD, `/marketing/data/stallionmatch`),
    trends: path(ROOTS_DASHBOARD, `/marketing/data/trends`),
    reportoverview: path(ROOTS_DASHBOARD, `/marketing/data/reportoverview`),
    farm: path(ROOTS_DASHBOARD, `/marketing/data/farm`),
    stallion: path(ROOTS_DASHBOARD, `/marketing/data/stallion`),
    racehorse: path(ROOTS_DASHBOARD, `/marketing/data/racehorse`),
    filterbyfarmid: (farmId: string, ) => path(ROOTS_DASHBOARD, `/marketing/data/farm/${farmId}/filterbyfarmid`),
    filterbystallionid: (stallionId: string, ) => path(ROOTS_DASHBOARD, `/marketing/data/stallion/${stallionId}/filterbystallionid`),
  },
  messages: {
    data: path(ROOTS_DASHBOARD, '/messages/data'),
    list: path(ROOTS_DASHBOARD, '/messages/list'),
    filter: (channelId: string) => path(ROOTS_DASHBOARD, `/messages/data/${channelId}/filter`),
    farmfilter: (farmId: string) => path(ROOTS_DASHBOARD, `/messages/data/${farmId}/farmfilter`),
    isRedirectFarmFilter: (farmId: string) => path(ROOTS_DASHBOARD, `/messages/data/${farmId}/isRedirectFarmFilter`),
  },
  reports: {
    data: path(ROOTS_DASHBOARD, '/reports/data'),
    list: path(ROOTS_DASHBOARD, '/reports/list'),
    filter: (name: string) => path(ROOTS_DASHBOARD, `/reports/data/${name}/filter`),
    reportFilter: (name: string) => path(ROOTS_DASHBOARD, `/reports/data/${name}/reportFilter`),
  },
  products: {
    data: path(ROOTS_DASHBOARD, '/products/data'),
    list: path(ROOTS_DASHBOARD, '/products/list'),
    edit: (id: string) => path(ROOTS_DASHBOARD, `/products/list/${id}/edit`),
    promocodeslist: path(ROOTS_DASHBOARD, '/products/promocodeslist'),
  },
  userprofile: {
    data: path(ROOTS_DASHBOARD, '/userprofile/data'),
  },
  settings: {
    data: path(ROOTS_DASHBOARD, '/settings/data'),
  },
  sales: {
    data: path(ROOTS_DASHBOARD, '/sales/data'),
    list: path(ROOTS_DASHBOARD, '/sales/list'),
    viewlots: path(ROOTS_DASHBOARD, '/sales/viewlots'),
  }, 
  notifications: {
    list: path(ROOTS_DASHBOARD, '/notifications/list'),
  },
  usermanagement: {
    list: path(ROOTS_DASHBOARD, '/usermanagement/list'),
  },
  systemActivity: {
    horseFilter: (name: string) => path(ROOTS_DASHBOARD, `/systemactivities/list/${name}/horsefilter`),
    farmFilter: (name: string) => path(ROOTS_DASHBOARD, `/systemactivities/list/${name}/farmfilter`),
    userFilter: (name: string) => path(ROOTS_DASHBOARD, `/systemactivities/list/${name}/userfilter`),
    emailFilter: (email: string) => path(ROOTS_DASHBOARD, `/systemactivities/list/${email}/emailFilter`),
    raceNameFilter: (raceName: string) => path(ROOTS_DASHBOARD, `/systemactivities/list/${raceName}/racefilter`),
    runnerNameFilter: (runnerName: string) => path(ROOTS_DASHBOARD, `/systemactivities/list/${runnerName}/runnerfilter`),
    notificationFilter: (featureName: string) => path(ROOTS_DASHBOARD, `/systemactivities/list/${featureName}/notificationFilter`),
  }
};

export const PATH_DOCS = 'https://docs-minimals.vercel.app/introduction';

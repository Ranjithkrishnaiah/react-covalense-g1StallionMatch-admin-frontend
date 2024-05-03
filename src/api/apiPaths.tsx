const BaseAPI = process.env.REACT_APP_HOST_API_KEY;
const BaseFrontendAPI = process.env.REACT_APP_HOST_FRONTEND_API_KEY;
export const api = {
  baseUrl: BaseAPI + '/v1',
  mockBaseUrl: 'http://localhost:4000',
  //Auth Path
  loginPath: '/auth/email/login',
  forgotPasswordPath: '/auth/forgot/password',
  forgotPasswordTag: 'forgot-Password',
  resendConfirmEmailPath: '/auth/email/resend-confirm-email',
  resendConfirmEmailTag: 'resend-confirm-email',
  //uploade user profile image
  userProfileImageUpload: '/auth/me/profile-image',
  //save Member Details
  saveMembersDetails: '/auth/me',
  //updatePassword
  updatePassword:'/auth/me/update-password',
  //Country and State Path
  countriesPath: '/countries',
  eligibleRaceCountries: '/race/eligible-race-countries',
  statesByCountryIdPath: '/states/by-country/',
  allStatesPath: '/states',
  // Stallion
  stallionPath: '/stallion/',
  // Horse
  horsePath: '/horses/',
  // Member
  memberPath: '/members/',
  memberRecentOrders: '/members/latest-orders/',
  memberInvitation: '/member-invitations/',
  // Currency
  currencyPath: '/currencies',
  // Colours
  coloursPath: '/colours',
  //Horse Tags
  horseTag: 'horses',
  //Stallion Tags
  stallionTag: 'stallions',
  //member Tags
  memberTag: 'member',
  // Colours Tags
  coloursTag: 'Colour',
  // Currency Tags
  currencyTag: 'Currency',
  //Country Tags
  countryTag: 'Country',
  //State Tags
  stateTag: 'States',
  //Stallion Reducer Path
  stallionReducerPath: 'stallionsApi',
  //Horse Reducer Path
  horseReducerPath: 'horsesApi',
  //Member Reducer Path
  memberReducerPath: 'membersApi',
  //Login Reducer Path
  loginReducerPath: 'loginApi',
  //Forgot Password Reducer Path
  forgotPasswordReducerPath: 'forgotPasswordApi',
  //resend ConfirmEmail Reducer Path
  resendConfirmEmailReducerPath: 'resendConfirmEmailApi',
  //States Reducer Path
  statesReducerPath: 'statesApi',
  //Currency Reducer Path
  currenciesReducerPath: 'currenciesApi',
  //Countries Reducer Path
  countriesReducerPath: 'countriesApi',
  //Colours Reducer Path
  coloursReducerPath: 'coloursApi',

  // Breed
  breedPath: '/horse-types',
  // Breed Tags
  breedTag: 'Breed',
  //Breed Reducer Path
  breedReducerPath: 'breedApi',

  // Stallion Autocomplete
  stallionAutocompletePath: '/stallions/search-stallion-name',
  // Stallion Autocomplete Tags
  stallionAutocompleteTag: 'StallionAutocomplete',
  //Stallion Autocomplete Reducer Path
  stallionAutocompleteReducerPath: 'stallionAutocompleteApi',

  // Stallion Autocomplete
  promotionstatusTagPath: '/stallions/promotion-status',
  // Stallion Autocomplete Tags
  promotionstatusTag: 'Promotionstatus',
  //Stallion Autocomplete Reducer Path
  promotionstatusReducerPath: 'promotionstatusApi',

  // fee status
  feestatusPath: '/stallions/fee-status',
  // fee status Tags
  feestatusTag: 'Feestatus',
  //fee status Reducer Path
  feestatusReducerPath: 'feestatusApi',

  // fee updated by status
  feeupdatedbyPath: '/stallions/fee-updated-by',
  // fee status Tags
  feeupdatedbyTag: 'Feeupdatedby',
  //fee status Reducer Path
  feeupdatedbyReducerPath: 'feeUpdatedByApi',

  // farm autocomplete status
  farmAutocompleteReducerPath: 'farmAutocompleteApi',
  // fee status Tags
  farmAutocompleteTag: 'FarmAutocomplete',
  //fee status Reducer Path
  farmAutocompletePath: '/farms/search-farm-name',

  stallionApiPath: '/stallions/',
  stallionsReducerPath: 'stallionsApi',
  // Stallion Retired Reason status
  retiredReasonReducerPath: 'retiredReasonApi',
  // fee status Tags
  retiredReasonTag: 'RetiredReason',
  //fee status Reducer Path
  retiredReasonPath: '/stallion-retired-reasons',

  // Horse Breed Type
  horseTypesReducerPath: 'horseTypesApi',
  // Horse Breed Type Tags
  horseTypesTag: 'HorseTypes',
  // Horse Breed Type Reducer Path
  horseTypesPath: '/horse-types',

  // payment method
  paymentMethodsReducerPath: 'paymentMethodsApi',
  //  payment method  Tags
  paymentMethodsTag: 'PaymentMethods',
  // payment method  Reducer Path
  paymentMethodsPath: '/payment-methods',

  // social links
  socialLinksReducerPath: 'socialLinksApi',
  //  social links  Tags
  socialLinksTag: 'SocialLinks',
  // social links  Reducer Path
  socialLinksPath: '/social-links',
  socialSharePath: '/social-share-type',
  socialShareEmail: '/social-share/save-share-report',

  // Notifications related api details
  notificationsApiPath: '/notifications',
  notificationsTag: 'notifications',
  notificationsTitles: 'list/titles',
  notificationsLinkTypes: 'list/link-type',
  notificationsUnreadCount: 'unread-count',
  //Notification Reducer Path
  notificationPath: 'notificationsApi',
  // notification types`
  notificationTypesReducerPath: 'notificationTypesApi',
  // notification types Tags
  notificationTypesTag: 'NotificationTypes',
  // notification types  Reducer Path
  notificationTypesPath: '/notification-types',
  //Farm Reducer Path
  farmReducerPath: 'farmsApi',
  farmTag: 'farm',
  farmPath: '/farms/',

  // Race
  raceReducerPath: 'raceApi',
  racePath: '/race/',
  raceVenue: '/race-venue',
  raceTrackCondition: '/race-track-condition/',
  raceTrackType: '/race-track-type/',
  raceType: '/race-type/',
  raceClass: '/race-class/',
  raceStake: '/race-stake/',
  raceStatus: '/race-status/',
  raceStatusSexRestriction: '/race-sex-restriction',
  raceStatusAgeRestriction: '/race-age-restriction',
  raceStatusIsImportrd: '/race-status/IsImportrd',
  raceStatusAPIStatus: '/race-status/API-Status',
  raceDistanceUnit: '/distance-unit',
  changeEligibility: 'change-eligibility/',
  updateOnlyRunner: 'updateOnlyRunner/',
  raceDashboardPath: 'dashboard/',
  byRaceName: '/race/byRaceName',
  shareRaceApiPath: '/race/list/download-list',
  raceStakeCategoryApiPath: '/race-stake-category',
  raceTag: 'race',

  // ReunnerDetails
  runnerReducerPath: 'runnerDetailsApi',
  runnerPath: '/runner/',
  runnersTag: 'runner',
  runnerFinalPosition: '/runner-final-position/',
  runnerWeightUnit: '/weight-unit',
  runnersOwner: '/runner-owner',
  runnersJockey: '/runner-jockey',
  runnersTrainer: '/runner-trainer',
  runnersHorseName: '/displayName',
  runnerHorseMatchedMares: '/matched-horse-name',
  runnerGetHorseDetails: '/runner/getHorseDetails',
  runnerRating: '/horse-rating',
  source: '/source',
  shareRunnerApiPath: '/runner/list/download-list',

  // Matched Mares
  matchedMares: 'matched-mares',

  //settings
  settingsReducerPath: 'settingsApi',
  settingsPath: '/settings/',
  settingsTag: 'setting',

  // SM Settings
  smSettingsPath: '/sm-setting/',
  smSettingsTag: 'sm-setting',

  // Stallion  Progeny Tracker
  progenyTrackerSR: 'progeny-tracker-sr',
  marketingHomePageApiPath: '/page-data/', //"/marketingHomeTabList/",
  marketingStallionMatchPageApiPath: '/marketingStallionMatchTabList/',
  marketingTrendsPageApiPath: '/marketingTrendsTabList/',
  marketingReportsOverviewPageApiPath: '/reports-overview/',
  marketingFarmPageApiPath: '/marketingFarmTabList/',
  marketingStallionPageApiPath: '/marketingStallionTabList/',
  marketingRaceHorsePageApiPath: '/race-horse/',
  marketingHomePageCarasoulApiPath: '/carousel/', //"/homeCarasoul/",
  marketingHomePageTestimonialApiPath: '/testimonial/', //"/homeTestimonial/",
  MarketingHomeTag: 'marketingHome',
  MarketingStallionMatchTag: 'marketingStallionMatch',
  MarketingTrendsTag: 'marketingTrends',
  MarketingReportsOverviewTag: 'marketingReportsOverview',
  MarketingFarmTag: 'marketingFarm',
  MarketingStallionTag: 'marketingStallion',
  MarketingRacehorseTag: 'marketingRacehorse',
  MarketingTag: 'marketing',
  MarketingFarmGalleryTag: 'marketingFarmGallery',
  marketingHomePageAddEditApiPath: '/home/',
  marketingTrendsAddEditApiPath: '/trends/',
  marketingImageUploadApiPath: '/upload-image/',
  marketingReducerPath: 'marketingApi',
  marketingDeleteUuidApiPath: '/marketingPageAdditionalInfo/',
  marketingPageSectionApiPath: '/marketingPageSection',

  farmAccessLevelReducerPath: 'farmAccessLevel',
  farmAccessLevelPath: '/farm-access-levels/',
  farmAccessLevelTag: 'farmAccessLevel',
  farmUserInvitaionPath: 'farm-user-invitation',
  // Marketing for farm pricing tiles
  pricingTileApiPath: '/pricing-tile',
  pricingTileTag: 'pricing-tile',
  memberFavouriteStallionApiPath: '/favourite-stallions/',
  memberFavouriteMareApiPath: '/favourite-mares/',
  memberFavMareApiPath: '/member-mares/',
  memberFavouriteBroodmareSireApiPath: '/favourite-broodmare-sires/',
  memberFavouriteFarmApiPath: '/favourite-farms/',
  memberLinkedFarmApiPath: '/members/linkdFarms/',
  farmMareListApiPath: '/mares-list/byFarmId/',

  //promo code
  promoCodeReducerPath: 'promoCodeApi',
  promoCodeTag: 'promoCodes',
  promoCodePath: '/promo-codes/',

  //promo code
  productReducerPath: 'productApi',
  productTag: 'products',
  productPath: '/products/',
  pricingPath: '/pricing',
  productListPath: 'product-list',
  productDashboard: 'dashboard',
  productRedepmtionGraphData: 'redemptions-graph',
  productmostPopularPromocodes: 'most-popular-promocodes',
  productmostPopularProducts: 'most-popular-products',
  sharepromoCodesApiPath: '/promo-codes/list/download',

  //promo code
  usersReducerPath: 'usersApi',
  usersTag: 'users',
  usersPath: 'all/lists',

  //promo code
  categoryReducerPath: 'categoryApi',
  categoryTag: 'category',
  categoryPath: '/categories',

  farmDashboardPath: '/farms/dashboard/',
  productlListPath: '/products/product-list',
  createdByAPIPath: '/members/listing/members',
  membersListWithoutAdmins: '/members/listing/members-without-admins',

  // Horse Alias
  horseNameAliasAPIPath: '/horse-name-alias/',
  horseCOBAliasAPIPath: '/horse-cob-alias/',
  horseNameAliasTag: 'horse-name-alias',
  horseCOBAliasTag: 'horse-cob-alias',
  // Horse Dashboard
  horseDashboardPath: '/horses/dashboard/',
  memberDashboardPath: '/members/dashboard/',
  stallionDashboardPath: '/stallions/dashboard/',
  stallionsTag: 'stallions',

  // Reports related api details
  reportsApiPath: '/reportsApi',
  reportsPath: '/report',
  reportsTag: 'report',

  // Message related api details
  messagesApiPath: '/messages',
  MessagesTag: 'messages',
  messagesTag: 'messages',
  messagesMedia: '/message-media',
  mediaUploadStatusUrl: '/media/status',
  messagesUnreadCount: 'unread-count',
  conversationTag: 'conversationMessage',
  localBoost: 'local-boost',
  extendedBoost: 'extended-boost',
  messageDashboardPath: 'dashboard',
  shareNotificationApiPath: '/list/download',
  shareMessagesApiPath: '/list/download',

  // User Management api paths
  userManagementReducerPath: 'userManagementApi',
  userManagementApiPath: '/userManagement',
  userManagementTag: 'userManagement',
  role: '/roles',
  adminModuleAccessLevel: '/adminModuleAccessLevel',

  // Stallion stud fee api paths
  stallionStudFeeApiPath: '/stallions-service-fees/',
  stallionStudFeeTag: 'stallions-service-fees',

  // Stallion view activity api paths
  frontendUrl: BaseFrontendAPI + '/v1',
  stallionViewActivityMatchedMareApiPath: '/stallion-report/matched-mares',
  stallionViewActivityMatchedMareTag: 'stallion-matched-mare',
  stallionViewActivityMatchedMareReducerPath: 'frontendApi',
  progenyTrackerApiPath: '/stallion-report/progeny-tracker',
  stallionProgenyTrackerTag: 'progeny-tracker',
  // farm dashboard csv download api path
  farmDashboardCsvPath: '/farms/dashboard-report/',
  farmDashboardCsvReducerPath: 'dashboardDownloadApi',
  shareStallionApiPath: '/stallions/list/download-list',
  shareFarmApiPath: '/farms/list/download-farm-list',
  horseKeywordSearchPath: '/horses/key-words-search',
  horseKeywordSearchTag: 'key-words-search',
  horseNameDefaultAliasAPIPath: '/horse-name-alias/horse-name-default-alias/',
  horseNameDefaultAliasTag: 'horse-name-default-alias',
  horseCOBDefaultAliasAPIPath: '/horse-cob-alias/horse-cob-default-alias/',
  horseCOBDefaultAliasTag: 'horse-cob-default-alias',

  //Sales Reducer Path
  salesReducerPath: 'salesApi',
  salesTag: 'sale',
  salesPath: '/sales/',
  salesLotInfo: '/sales-lot-info-temp/',
  salesCompany: '/sales-company/',
  salesType: '/sales-type/',
  salesStatus: '/sales-status/',
  downloadSalesTemplate: '/sales-lots/list/template/',
  salesLots: '/sales-lots',
  downloadsalesLots: '/download-sales-lot',
  currentMonthSales: '/sales/fetchCurrentMonthSales/',
  lotList: '/lot-list/',
  reportSettings: '/report-settings/',
  impactAnalysisType: '/impact-analysis-type/',

  //Runner dashboard path
  runnerDashboard: 'dashboard/',
  //Main Dashboard path
  appDashboard: '/app-dashboard/',
  appDashboardReducerPath: 'mainDashboardApi',
  appDashboardTag: 'app-dashboard',
  marketingPdfUploadApiPath: '/upload-pdf/',
  marketingUploadStatusApiPath: '/media/status/',
  marketingStallionPageTestimonialApiPath: '/stallion/',
  marketingStallionPageTestimonialTag: 'marketing stallion',
  stallionActivityMatchedMareApiPath: 'matched-mares',
  stallionActivityMatchedMareTag: 'matched-mares',
  stallionActivityKeyStatisticApiPath: 'key-statistics',
  stallionActivityKeyStatisticTag: 'key-statistics',
  stallionActivityCloseAnalyticsApiPath: 'close-analytics',
  stallionActivityCloseAnalyticsTag: 'close-analytics',
  stallionMatchedActivityApiPath: 'match-activity',
  stallionMatchedActivityTag: 'match-activity',
  stallionStudFeeHistoryApiPath: 'fee-history',
  stallionStudFeeHistoryTag: 'fee-history',
  farmPageApiPath: '/farm/',
  marketingFarmPageMediaTag: 'marketing farm media',

  //systemActivity
  systemActivityReducerPath: 'systemActivityApi',
  systemActivityTag: 'systemActivity',
  systemActivityPath: '/system-activities',

  marketingFarmPageAddEditApiPath: '/stallion-farm/',
  marketingDeleteImageByUuidApiPath: '/delete-image/',
  memberLinkedFarmTag: 'members/linkdFarms/',
  shareMemberApiPath: '/members/list/download-list',
  memberStatus: '/member-status',
  recentMemberOrderApiPath: '/order-transactions/recent-order-by-member/',
  permissionAccessLevelApiPath : '/app-permission',
  updateUserStatus : '/users/update-status/',
  userApiPath : '/users',
  pageSettingApiPath: '/page-settings',
  pageSettingTag: 'page-settings',
  appPermissionByUserApiPath: '/app-permission/user',
  shareReportDownload: '/report/list/download-list',
  reportMinMaxPrice: '/report/orders-min-max-price',
  orderTransactionsApiPath: '/order-transactions',
  stallionRequestApiPath: '/stallion-requests/',
  raceHorseApiPath: '/race-horse',
  mareRequestApiPath: '/mare-requests/',
  salesByCountryIdPath: 'getSalesByCountryId/',
  salesLotBySaleIdPath: '/sales-list/by-sales/'
};

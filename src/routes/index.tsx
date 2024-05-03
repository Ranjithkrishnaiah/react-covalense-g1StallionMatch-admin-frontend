import { Suspense, lazy, ElementType } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
// guards
import useAuth from '../hooks/useAuth';
// layouts
import MainLayout from '../layouts/main';
import DashboardLayout from '../layouts/dashboard';
import LogoOnlyLayout from '../layouts/LogoOnlyLayout';
// guards
import GuestGuard from '../guards/GuestGuard';
import AuthGuard from '../guards/AuthGuard';
// import RoleBasedGuard from '../guards/RoleBasedGuard';
// config
import { PATH_AFTER_LOGIN } from '../config';
// components
import LoadingScreen from '../components/LoadingScreen';

// ----------------------------------------------------------------------

const Loadable = (Component: ElementType) => (props: any) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();

  //const { isAuthenticated } = useAuth();

  //const isDashboard = pathname.includes('/dashboard') && isAuthenticated;

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};

export default function Router() {
  return useRoutes([
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <Login />
            </GuestGuard>
          ),
        },
        // {
        //   path: 'register',
        //   element: (
        //     <GuestGuard>
        //       <Register />
        //     </GuestGuard>
        //   ),
        // },
        // { path: 'login-unprotected', element: <Login /> },
        // { path: 'register-unprotected', element: <Register /> },
        { path: 'reset-password', element: <ResetPassword /> },
        { path: 'verify', element: <VerifyCode /> },
      ],
    },

    // Dashboard Routes
    {
      path: 'dashboard',
      element: (
        <AuthGuard>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        { element: <Navigate to={PATH_AFTER_LOGIN} replace />, index: true },
        { path: 'app', element: <GeneralApp /> },
        // {
        //   path: 'user',
        //   children: [
        //     { element: <Navigate to="/dashboard/user/profile" replace />, index: true },
        //     { path: 'profile', element: <UserProfile /> },
        //     { path: 'cards', element: <UserCards /> },
        //     { path: 'list', element: <UserList /> },
        //     { path: 'new', element: <UserCreate /> },
        //     { path: ':name/edit', element: <UserCreate /> },
        //     { path: 'account', element: <UserAccount /> },
        //   ],
        // },
        {
          path: 'stallions',
          children: [
            { element: <Navigate to="/dashboard/stallions/list" replace />, index: true },
            { path: 'list', element: <StallionList /> },
            // { path: 'new', element: <StallionCreate /> },
            // { path: ':id/edit', element: <StallionCreate /> },
            { path: 'data', element: <StallionData /> },
            { path: 'data/:farmname/filter', element: <StallionData /> },
            { path: 'data/:keywordName/:type/keywordfilter', element: <StallionData /> },
            { path: 'data/:farmname/promotedfilter', element: <StallionData /> },
            { path: 'data/:farmname/:stallionname/marketingfilter', element: <StallionData /> },
            { path: 'data/:stallionname/stallionfilter', element: <StallionData /> },
            { path: 'data/:id/feehistory', element: <StallionData /> },
            { path: 'data/:id/analytics', element: <StallionData /> },
            // { path: 'clist', element: <StallionCList /> },
            { path: 'data/:stallionId/edit', element: <StallionData /> },
          ],
        },
        {
          path: 'horsedetails',
          children: [
            { element: <Navigate to="/dashboard/horsedetails/list" replace />, index: true },
            { path: 'list', element: <HorseList /> },
            // { path: 'new', element: <HorseCreate /> },
            { path: 'data/new', element: <HorseData /> },
            { path: 'data/:id/edit', element: <HorseData /> },
            { path: 'data/addhorse', element: <HorseCreate /> },
            { path: ':name/:progenyId/:generation/add', element: <HorseData /> },
            { path: 'data/:name/:sex/add', element: <HorseData /> },
            { path: 'data/:requestId/addnewforstallion', element: <HorseData /> },
            { path: 'data/:requestId/addnewformare', element: <HorseData /> },
            // { path: ':id/edit', element: <HorseCreate /> },
            { path: 'data', element: <HorseData /> },
            { path: 'data/:horsename/:horseid/:horsetype/:countryid/keywordsearch', element: <HorseData /> },
            { path: 'data/:id/progeny', element: <HorseData /> },
            { path: 'data/:horsename/horsefilter', element: <HorseData /> },
            // { path: 'clist', element: <HorseCList /> },
            // { path: ':id/cedit/', element: <HorseCCreate /> },
          ],
        },
        {
          path: 'members',
          children: [
            { element: <Navigate to="/dashboard/members/list" replace />, index: true },
            { path: 'list', element: <MemberList /> },
            { path: 'new', element: <MemberCreate /> },
            { path: ':id/edit', element: <MemberCreate /> },
            { path: 'data', element: <MemberData /> },
            { path: 'data/:farmname/filter', element: <MemberData /> },
            { path: 'data/:name/userFilter', element: <MemberData /> },
            { path: 'data/:horseId/:favourite/memberFilter', element: <MemberData /> },
          ],
        },
        {
          path: 'farms',
          children: [
            { element: <Navigate to="/dashboard/farms/list" replace />, index: true },
            { path: 'data', element: <FarmData /> },
            { path: 'data/:farmname/filter', element: <FarmData /> },
            { path: 'data/:farmId/edit', element: <FarmData /> },
            { path: 'list', element: <FarmList /> },
          ],
        },
        {
          path: 'race',
          children: [
            { element: <Navigate to="/dashboard/race/list" replace />, index: true },
            { path: 'data', element: <RaceData /> },
            { path: 'data/:name/filter', element: <RaceData /> },
            { path: 'data/:raceid/raceFilter', element: <RaceData /> },
            { path: 'data/:horse/horsefilter', element: <RaceData /> },
            { path: 'data/:horse/:type/typefilter', element: <RaceData /> },
            { path: 'list', element: <RaceList /> },  
          ],
        },
        {
          path: 'runnerdetails',
          children: [
            { element: <Navigate to="/dashboard/runnerdetails/list" replace />, index: true },
            { path: 'data', element: <RunnerData /> },
            { path: 'data/:raceid/filter', element: <RunnerData /> },
            { path: 'data/:runnerName/runnerfilter', element: <RunnerData /> },
            { path: 'list', element: <RunnerList /> },
          ],
        },
        // {
        //   path: 'users',
        //   children: [
        //     { element: <Navigate to="/dashboard/users/list" replace />, index: true },
        //     { path: 'data', element: <UserData /> },
        //   ],
        // },
        {
          path: 'marketing',
          children: [
            { element: <Navigate to="/dashboard/marketing/list" replace />, index: true },
            { path: 'data', element: <MarketingData /> },           
            { path: 'data/stallionmatch', element: <MarketingData /> },
            { path: 'data/trends', element: <MarketingData /> },
            { path: 'data/reportoverview', element: <MarketingData /> },
            { path: 'data/farm', element: <MarketingData /> },
            { path: 'data/stallion', element: <MarketingData /> },
            { path: 'data/racehorse', element: <MarketingData /> },
            { path: 'data/farm/:farmId/filterbyfarmid', element: <MarketingData /> },
            { path: 'data/stallion/:stallionId/filterbystallionid', element: <MarketingData /> },
          ],
        },
        {
          path: 'messages',
          children: [
            { element: <Navigate to="/dashboard/messages/list" replace />, index: true },
            { path: 'data', element: <MessagesData /> },
            { path: 'list', element: <MessagesList /> },
            { path: 'data/:channelId/filter', element: <MessagesData /> },
            { path: 'data/:farmId/farmfilter', element: <MessagesData /> },
            { path: 'data/:farmId/isRedirectFarmFilter', element: <MessagesData /> },
          ],
        },
        {
          path: 'reports',
          children: [
            { element: <Navigate to="/dashboard/reports/list" replace />, index: true },
            { path: 'data', element: <ReportsData /> },
            { path: 'list', element: <ReportsList /> },
            { path: 'data/:name/filter', element: <ReportsData /> },
            { path: 'data/:name/reportFilter', element: <ReportsData /> },
          ],
        },

        // System
        {
          path: 'systemactivities',
          children: [
            { element: <Navigate to="/dashboard/systemactivities/list" replace />, index: true },
            { path: 'list', element: <SystemActivitiesList /> },
            { path: 'list/:name/horsefilter', element: <SystemActivitiesList /> },
            { path: 'list/:fname/farmfilter', element: <SystemActivitiesList /> },
            { path: 'list/:user/userfilter', element: <SystemActivitiesList /> },
            { path: 'list/:raceName/racefilter', element: <SystemActivitiesList /> },
            { path: 'list/:runnerName/runnerfilter', element: <SystemActivitiesList /> },
            { path: 'list/:featureName/notificationFilter', element: <SystemActivitiesList /> },
            { path: 'list/:email/emailFilter', element: <SystemActivitiesList /> },
          ],
        },
        {
          path: 'notifications',
          children: [
            { element: <Navigate to="/dashboard/notifications/list" replace />, index: true },
            { path: 'list', element: <NotificationsList /> },
            { path: 'list/:unread/notificationfilter', element: <NotificationsList /> },
          ],
        },
        {
          path: 'usermanagement',
          children: [
            { element: <Navigate to="/dashboard/usermanagement/list" replace />, index: true },
            { path: 'list', element: <UserManagementList /> },
          ],
        },
        // System
        {
          path: 'products',
          children: [
            { element: <Navigate to="/dashboard/products/list" replace />, index: true },
            { path: 'data', element: <ProductsData /> },
            { path: 'list', element: <ProductsList /> },
            { path: 'edit', element: <ProductsList /> },
            { path: 'list/:id/edit', element: <ProductsList /> },
            { path: 'promocodeslist', element: <PromoCodesList /> },
          ],
        },

        {
          path: 'userprofile',
          children: [
            { element: <Navigate to="/dashboard/userprofile/data" replace />, index: true },
            { path: 'data', element: <UserProfileData /> },
          ],
        },
        {
          path: 'settings',
          children: [
            { element: <Navigate to="/dashboard/settings/data" replace />, index: true },
            { path: 'data', element: <SettingsData /> },
          ],
        },

        {
          path: 'sales',
          children: [
            { element: <Navigate to="/dashboard/sales/data" replace />, index: true },
            { path: 'data', element: <SalesCalenderData /> },
            { path: 'list', element: <SalesList /> },
            { path: 'viewlots/:lotId', element: <SalesViewLots /> },
          ],
        },

      ],
    },

    // Main Routes
    {
      path: '*',
      //element: <LogoOnlyLayout />,
      children: [
        { path: 'coming-soon', element: <ComingSoon /> },
        { path: 'maintenance', element: <Maintenance /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/auth/login" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

// AUTHENTICATION
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const ResetPassword = Loadable(lazy(() => import('../pages/auth/ResetPassword')));
const VerifyCode = Loadable(lazy(() => import('../pages/auth/VerifyCode')));

// DASHBOARD

// GENERAL
const GeneralApp = Loadable(lazy(() => import('../pages/dashboard/GeneralApp')));

// MAIN
const ComingSoon = Loadable(lazy(() => import('../pages/ComingSoon')));
const Maintenance = Loadable(lazy(() => import('../pages/Maintenance')));
const Page500 = Loadable(lazy(() => import('../pages/Page500')));
const NotFound = Loadable(lazy(() => import('../pages/Page404')));

// Stallion
const StallionList = Loadable(lazy(() => import('../pages/dashboard/StallionList')));
// const StallionCreate = Loadable(lazy(() => import('../pages/dashboard/StallionCreate')));
const StallionData = Loadable(lazy(() => import('../pages/dashboard/StallionData')));
// const StallionCList = Loadable(lazy(() => import('../pages/dashboard/StallionCList')));

// Horse Details
const HorseList = Loadable(lazy(() => import('../pages/dashboard/HorseList')));
const HorseCreate = Loadable(lazy(() => import('../pages/dashboard/HorseCreate')));
const HorseData = Loadable(lazy(() => import('../pages/dashboard/HorseData')));
// const HorseCList = Loadable(lazy(() => import('../pages/dashboard/HorseCList')));
// const HorseCCreate = Loadable(lazy(() => import('../pages/dashboard/HorseCCreate')));
// const HorseAdd = Loadable(lazy(() => import('../pages/dashboard/HorseAdd')));

// Member Details
const MemberList = Loadable(lazy(() => import('../pages/dashboard/MemberList')));
const MemberCreate = Loadable(lazy(() => import('../pages/dashboard/MemberCreate')));
const MemberData = Loadable(lazy(() => import('../pages/dashboard/MemberData')));

// Farms Details
const FarmData = Loadable(lazy(() => import('../pages/dashboard/FarmData')));
const FarmList = Loadable(lazy(() => import('../pages/dashboard/FarmList')));

// Race Details
const RaceData = Loadable(lazy(() => import('../pages/dashboard/RaceData')));
const RaceList = Loadable(lazy(() => import('../pages/dashboard/RaceList')));

// Runner Details
const RunnerData = Loadable(lazy(() => import('../pages/dashboard/RunnerData')));
const RunnerList = Loadable(lazy(() => import('../pages/dashboard/RunnerList')));

// Marketing
const HomeData = Loadable(lazy(() => import('../pages/dashboard/HomeData')));
const MarketingData = Loadable(lazy(() => import('../pages/dashboard/MarketingData')));

// Messages
const MessagesData = Loadable(lazy(() => import('../pages/dashboard/MessagesData')));
const MessagesList = Loadable(lazy(() => import('../pages/dashboard/MessagesList')));


// Reports
const ReportsData = Loadable(lazy(() => import('../pages/dashboard/ReportsData')));
const ReportsList = Loadable(lazy(() => import('../pages/dashboard/ReportsList')));

// System
const SystemActivitiesList = Loadable(lazy(() => import('../pages/dashboard/SystemActivitiesList')));
// User Management
const UserManagementList = Loadable(lazy(() => import('../pages/dashboard/UserManagementList')));
const NotificationsList = Loadable(lazy(() => import('../pages/dashboard/NotificationsList')));

// Product and PromoCode
const ProductsData = Loadable(lazy(() => import('../pages/dashboard/ProductsData')));
const ProductsList = Loadable(lazy(() => import('../pages/dashboard/ProductsList')));
const PromoCodesList = Loadable(lazy(() => import('../pages/dashboard/PromoCodesList')));

// User Profile
const UserProfileData = Loadable(lazy(() => import('../pages/dashboard/UserProfileData')));

// User Profile
const SettingsData = Loadable(lazy(() => import('../pages/dashboard/SettingsData')));

// Sales
const SalesCalenderData = Loadable(lazy(() => import('../pages/dashboard/SalesCalenderData')));
const SalesList = Loadable(lazy(() => import('../pages/dashboard/SalesList')));
const SalesViewLots = Loadable(lazy(() => import('../pages/dashboard/SalesViewLots')));
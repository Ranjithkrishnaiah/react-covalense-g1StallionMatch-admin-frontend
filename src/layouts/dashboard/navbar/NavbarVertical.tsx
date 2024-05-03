import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import { Box, Stack, Drawer, StyledEngineProvider } from '@mui/material';
// hooks
import useResponsive from '../../../hooks/useResponsive';
import useCollapseDrawer from '../../../hooks/useCollapseDrawer';
// utils
import cssStyles from '../../../utils/cssStyles';
// config
import { NAVBAR } from '../../../config';
// components
import Logo from '../../../assets/Images/StallionMatch-Logo.svg';
import SMLogo from '../../../assets/Images/SM-Logo.svg';
import Scrollbar from '../../../components/Scrollbar';
import { NavSectionVertical } from '../../../components/nav-section';
//
import navConfig from './NavConfig';
import NavbarDocs from './NavbarDocs';
import NavbarAccount from './NavbarAccount';
import CollapseButton from './CollapseButton';
import './Navbar.css'

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('xs')]: {
    flexShrink: 0,
    transition: theme.transitions.create('width', {
      duration: theme.transitions.duration.shorter,
    }),
  },
}));

// ----------------------------------------------------------------------

type Props = {
  isOpenSidebar: boolean;
  onCloseSidebar: VoidFunction;
};

export default function NavbarVertical({ isOpenSidebar, onCloseSidebar }: Props) {
  const theme = useTheme();

  const { pathname } = useLocation();

  const isDesktop = useResponsive('up', 'xs');

  // const { isCollapse, collapseClick, collapseHover, onToggleCollapse, onHoverEnter, onHoverLeave } =
  const { isCollapse, collapseClick, onToggleCollapse  } =
    useCollapseDrawer();

  const isCollapseDrawer = (isCollapse) ? 'NavbarCollapsed' : 'NavbarNotCollapsed';
    
  useEffect(() => {
    if (isOpenSidebar) {
      onCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Stack
      className='logo-header'
        spacing={3}
        sx={{
          pt: 2,
          pb: 0,
          px: 2.5,
          flexShrink: 0,
          ...(isCollapse && { alignItems: 'center' }),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" className='logo-wrapper'>
          {/* <Logo - Not Collapsed/> */}
          <img src={Logo} alt='Stallio Match Logo' className='notcollapsedLogo'/>


          {/* <Logo - Collapsed /> */}
          <img src={SMLogo} alt='Stallio Match Logo' className='collapsedLogo'/>

          
          <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />

          {/* {isDesktop && !isCollapse && (
            <CollapseButton onToggleCollapse={onToggleCollapse} collapseClick={collapseClick} />
          )} */}
        </Stack>
        
      </Stack>

      <NavSectionVertical className='navSectionVertical' navConfig={navConfig} isCollapse={isCollapse} />

      <Box sx={{ flexGrow: 1 }} />

      <NavbarAccount isCollapse={isCollapse} />
    </Scrollbar>
  );

  return (
    <StyledEngineProvider injectFirst>
    <Box className='Navbar MainNavbar'>
    <RootStyle
      sx={{
        width: {
          xs: isCollapse ? NAVBAR.DASHBOARD_COLLAPSE_WIDTH : NAVBAR.DASHBOARD_WIDTH,
        },
        ...(collapseClick && {
          position: 'absolute',
        }),
      }}
    >
      {!isDesktop && (
        <Drawer
        className='OpenSideBar'
          open={isOpenSidebar}
          onClose={onCloseSidebar}
          PaperProps={{ sx: { width: NAVBAR.DASHBOARD_WIDTH } }}
        >
          {renderContent}
        </Drawer>
      )}

      {isDesktop && (
        <Drawer
          open
          variant="persistent"
          // onMouseEnter={onHoverEnter}
          // onMouseLeave={onHoverLeave}
          className={`NavigationDrawer ${isCollapseDrawer}`}
          PaperProps={{
            sx: {
              width: NAVBAR.DASHBOARD_WIDTH,
              borderRightStyle: 'dashed',
              bgcolor: '#007142',
              transition: (theme) =>
                theme.transitions.create('width', {
                  duration: theme.transitions.duration.standard,
                }),
              ...(isCollapse && {
                width: NAVBAR.DASHBOARD_COLLAPSE_WIDTH,
              }),
              ...(collapseClick && {
                //...cssStyles(theme).bgBlur(),
                boxShadow: (theme) => theme.customShadows.z24,
              }),

              // ...(collapseHover && {
              //   //...cssStyles(theme).bgBlur(),
              //   boxShadow: (theme) => theme.customShadows.z24,
              // }),
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </RootStyle>
    </Box>
    </StyledEngineProvider>
  );
}

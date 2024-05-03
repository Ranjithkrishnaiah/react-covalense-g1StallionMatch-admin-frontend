import * as React from 'react';
// @mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Scrollbar from '../../../../components/Scrollbar';
import 'src/sections/@dashboard/css/filter.css';
import Switch, { SwitchProps } from '@mui/material/Switch';
import { PATH_DASHBOARD } from 'src/routes/paths';

///////////////////////////////////////

const drawerWidth = 290;
// openedMixin handler
const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});
// closedMixin handler
const closedMixin = (theme: any) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});
// Drawer Header handler
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

// IOSSwitch SwitchProps
const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

// Drawer handler
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }: any) => {
    return {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      }),
      ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      }),
    };
  }
);

export default function ProductFilterSidebar(props: any) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  // data from props
  const { handleFilter, handleFilterApplied, rowCount, page, limit } = props;
  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  // open drawer handler
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };
  // close drawer handler
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginRight: '0px',
        marginTop: '0px',
        width: '228px',
        borderRadius: '6px 6px 6px 6px',
        boxSizing: 'border-box',
      },
    },
  };

  // navigate Filter handler
  const navigateFilter = (type: string) => {
    switch (type) {
      case 'home':
        navigate(PATH_DASHBOARD.marketing.data);
        break;

      case 'stallionmatch':
        navigate(PATH_DASHBOARD.marketing.stallionmatch);
        break;

      case 'trends':
        navigate(PATH_DASHBOARD.marketing.trends);
        break;

      case 'reportoverview':
        navigate(PATH_DASHBOARD.marketing.reportoverview);
        break;

      case 'farm':
        navigate(PATH_DASHBOARD.marketing.farm);
        break;

      case 'stallion':
        navigate(PATH_DASHBOARD.marketing.stallion);
        break;

      case 'racehorse':
        navigate(PATH_DASHBOARD.marketing.racehorse);
        break;

      case 'products':
        navigate(PATH_DASHBOARD.products.list);
        break;

      case 'promocodeslist':
        navigate(PATH_DASHBOARD.products.promocodeslist);
        break;

      default:
        navigate(PATH_DASHBOARD.marketing.data);
        break;
    }
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* drawer */}
      <Drawer variant="permanent" open={open} className="filter-section farmfilter-leftbar">
        <Scrollbar
          className="filter-scrollbar"
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          <DrawerHeader className="filter-drawer-head">
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3" sx={{ whiteSpace: 'normal', lineHeight: '30px !important' }}>
                Products & Promo Codes
              </Typography>
              <Button className="clearBtn"></Button>
            </Box>

            <IconButton
              className="handleMenuOpen"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                position: 'relative',
                fontSize: '18px',
                background: '#e2e7e1 !important',
                left: '65px',
                zIndex: '9999',
                ...(open && { display: 'none' }),
              }}
            >
              <i className="icon-filter-open" />
            </IconButton>
            <IconButton className="handleMenuBack" onClick={handleDrawerClose}>
              <i className="icon-menu-back" />
            </IconButton>
          </DrawerHeader>

          {open && (
            <Box>
              {/* products and Promo Codes buttons */}
              <Box
                className="edit-section"
                pt={4}
                sx={{
                  ...(!isDisplayBox && { display: 'none' }),
                }}
              >
                <Box className="marketingFilterDrawer">
                  <Button
                    className="outline-btn"
                    fullWidth
                    onClick={() => navigateFilter('products')}
                    disabled={!props.productModuleAccess?.search_product_promocode}
                  >
                    Products
                  </Button>
                  <Button
                    className="outline-btn gold"
                    fullWidth
                    onClick={() => navigateFilter('promocodeslist')}
                    disabled={!props.productModuleAccess?.search_product_promocode}
                  >
                    Promo Codes
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
}

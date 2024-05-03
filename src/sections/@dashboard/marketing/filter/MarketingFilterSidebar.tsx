import * as React from 'react';
import { styled, useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack, InputLabel, RadioGroup, Radio } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import fmopen from '../../../../assets/Images/menu-fold.svg';

//import StallionFilter from './StallionFilter';
// form
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Modal from '@mui/material/Modal';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { StallionAutocomplete } from '../../../../@types/stallionAutocomplete';
import { useDispatch, useSelector } from 'react-redux';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionSplit';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { usePromotionstatusQuery } from 'src/redux/splitEndpoints/promotionstatusSplit';
import { useFeestatusQuery } from 'src/redux/splitEndpoints/feestatusSplit';
import { range } from '../../../../utils/formatYear';
import Scrollbar from '../../../../components/Scrollbar';
// hooks
import useSettings from '../../../../hooks/useSettings';
import { useForm, Controller } from 'react-hook-form';
import { LoadingButton } from '@mui/lab';
import {
  FormProvider,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from '../../../../components/hook-form';
import { usePaymentmethodsQuery } from 'src/redux/splitEndpoints/paymentmethodsSplit';
import { useSociallinksQuery } from 'src/redux/splitEndpoints/socialLinksSplit';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "src/sections/@dashboard/css/filter.css";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import DatePicker from 'src/components/DatePicker';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FarmAutoFilter from 'src/components/FarmAutoFilter';
import Slider from '@mui/material/Slider';
import { PATH_DASHBOARD } from 'src/routes/paths';

///////////////////////////////////////

const drawerWidth = 290;

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

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

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

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
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
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

export default function MarketingFilterSidebar(props: any) {
  // const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  const { data: countriesList } = useCountriesQuery();

  const { handleFilter, handleFilterApplied, rowCount, page, limit } = props;

  const yob = range(1900, 2050);

  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };


  const navigateFilter = (type: string) => {
    handleDrawerClose();
    switch (type) {
      case 'home':
        navigate(PATH_DASHBOARD.marketing.data)
        break;

      case 'stallionmatch':
        navigate(PATH_DASHBOARD.marketing.stallionmatch)
        break;

      case 'trends':
        navigate(PATH_DASHBOARD.marketing.trends)
        break;

        case 'reportoverview':
        navigate(PATH_DASHBOARD.marketing.reportoverview)
        break;

        case 'farm':
        navigate(PATH_DASHBOARD.marketing.farm)
        break;

        case 'stallion':
        navigate(PATH_DASHBOARD.marketing.stallion)
        break;

        case 'racehorse':
        navigate(PATH_DASHBOARD.marketing.racehorse)
        break;

      default:
        navigate(PATH_DASHBOARD.marketing.data)
        break;
        
    }
  }



  return (
    <StyledEngineProvider injectFirst>
      <Drawer variant="permanent" open={open} className="filter-section farmfilter-leftbar">
        <Scrollbar
          className='filter-scrollbar'
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          <DrawerHeader className='filter-drawer-head'>
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">
                {/* {rowCount}  */}
                Marketing
              </Typography>
              <Button className="clearBtn"></Button>
            </Box>

            <IconButton
              className='handleMenuOpen'
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
              <i className='icon-filter-open' />
            </IconButton>
            <IconButton className='handleMenuBack' onClick={handleDrawerClose}>
              <i className="icon-menu-back" />
            </IconButton>
          </DrawerHeader>


          {open && <Box>

            <Box className='edit-section' pt={4} sx={{
              ...(!isDisplayBox && { display: 'none' }),
            }}>

              <Box className='marketingFilterDrawer'>
                <Button className="outline-btn" fullWidth onClick={() => navigateFilter('home')}>Home Page</Button>
                <Button className="outline-btn" fullWidth onClick={() => navigateFilter('stallionmatch')}>Stallion Match Page</Button>
                <Button className="outline-btn" fullWidth onClick={() => navigateFilter('trends')}>Trends Page</Button>
                <Button className="outline-btn" fullWidth onClick={() => navigateFilter('reportoverview')}>Reports Overview Page</Button>
                <Button className="outline-btn gold" fullWidth onClick={() => navigateFilter('farm')}>Farm Page</Button>
                <Button className="outline-btn gold" fullWidth onClick={() => navigateFilter('stallion')}>Stallion Page</Button>
                <Button className="outline-btn gold" fullWidth onClick={() => navigateFilter('racehorse')}>Racehorse Pages</Button>
              </Box>

            </Box>

          </Box>}
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
}

import * as React from 'react';
import { styled, useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack, InputLabel, Grid, Checkbox, FormControl, InputAdornment } from '@mui/material';
// form
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { range } from 'src/utils/formatYear';
import Scrollbar from 'src/components/Scrollbar';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "src/sections/@dashboard/css/filter.css";
import FormControlLabel from '@mui/material/FormControlLabel';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SireAutoFilter from 'src/components/SireAutoFilter';
import DamAutoFilter from 'src/components/DamAutoFilter';
import HorseAutoFilter from 'src/components/HorseAutoFilter';
import { fNumber } from 'src/utils/formatNumber';
import { useState } from 'react';
import { Images } from 'src/assets/images';
import { FindDuplicatesWrapperDialog } from 'src/components/horse-modal/FindDuplicatesWrapper';
import { useHorseTypesQuery } from 'src/redux/splitEndpoints/horseTypesSplit';
import CustomDateRangePicker from 'src/components/customDateRangePicker/DateRangePicker';
import { DateRangeType } from 'src/@types/dateRangePicker';
import { yearOnlyConvert, dateHypenConvert } from 'src/utils/customFunctions';
//import Disabled from 'src/components/YearRangePicker';
import { useCreatedByQuery } from 'src/redux/splitEndpoints/memberSplit';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
// import CustomYOBRangePicker from 'src/components/customDateRangePicker/CustomYOBRangePicker';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
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

export default function HorseProgenyFilterSidebar(props: any) {
  // const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const { state, setStateValue, progenyTotal, setProgenyTotal } = props;
  
  const handleDrawerOpen = () => {
    setOpen(false);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
  };

  const ITEM_HEIGHT = 35;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-1px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  }

  return (
    <StyledEngineProvider injectFirst>
      <Drawer variant="permanent" open={open} className="filter-section DrawerLeftModal horse-leftbar">
        <Scrollbar
          className='filter-scrollbar'
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          <DrawerHeader className='filter-drawer-head'>
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">{fNumber(progenyTotal)} Horses</Typography>
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
        </Scrollbar>
      </Drawer>      
    </StyledEngineProvider>
  );
}

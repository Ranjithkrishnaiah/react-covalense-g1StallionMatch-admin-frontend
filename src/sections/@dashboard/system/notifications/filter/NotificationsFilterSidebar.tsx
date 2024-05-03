import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import Scrollbar from '../../../../../components/Scrollbar';
import 'src/sections/@dashboard/css/filter.css';
import Switch, { SwitchProps } from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import {
  useGetLinkTypeQuery,
  useGetTitlesQuery,
} from 'src/redux/splitEndpoints/notificationsSplit';
import { DateRange } from 'src/@types/dateRangePicker';
import { MenuProps } from 'src/constants/MenuProps';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import { dateHypenConvert, toPascalCase } from 'src/utils/customFunctions';
import { Autocomplete } from '@mui/material';
// ----------------------------------------------------------------------
// drawer details
const drawerWidth = 290;
// openedMixin method
const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});
// closedMixin method
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
// DrawerHeader method
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
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 1.5,
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

// Drawer method
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

export default function NotificationsFilterSidebar(props: any) {
  // react props
  const {
    handleFilter,
    handleFilterApplied,
    rowCount,
    page,
    limit,
    convertedSentDateRangeValue,
    setConvertedSentDateRangeValue,
    convertedSentDateDateValue,
    setConvertedSentDateDateValue,
    state,
    setStateValue,
    setIsShowAll,
  } = props;

  const [open, setOpen] = React.useState(false);
  //API for countries lists
  const { data: countriesList } = useCountriesQuery();
  //Get API for titles lists
  const { data: titlesListsData } = useGetTitlesQuery();
  //Get API for link type
  const { data: linkTypeData } = useGetLinkTypeQuery();

  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  // Drawer Open handler
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };
  // Drawer close handler
  const handleDrawerClose = () => {
    setOpen(false);
  };
  // date picker states
  const [dateRangeSelected, setDateRangeSelected] = React.useState(null);
  const [dateRange, setDateRange] = React.useState<DateRange>([null, null]);
  const [dateRangeValue, setDateRangeValue] = React.useState<DateRange>([null, null]);
  const handleDateRange = (value: any) => {
    setDateRangeValue(value);
  };

  // time conversion handler
  function parseDate(dateToParse: any) {
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate.getFullYear()}-${(parsedDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${parsedDate.getDate().toString().padStart(2, '0')} `;
    return formattedDate;
  }

  // onChange field handler
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });
  };

  // check for Filter Applied handler
  const checkFilterApplied = () => {
    if (
      state?.userName !== '' ||
      state?.emailAddress !== '' ||
      state?.messageKey !== '' ||
      state?.notificationStatus != 'none' ||
      state?.countryId ||
      state?.titlesLists?.title != null ||
      state?.linkType?.linkType != null ||
      dateRangeValue[0] !== null ||
      dateRangeValue[1] !== null ||
      dateHypenConvert(convertedSentDateDateValue[1]) !== undefined
    ) {
      return false;
    } else {
      return true;
    }
  };

  // Filter data handler
  const handleFilterData = () => {
    setIsShowAll(false);
    const data = {
      ...{ page: page },
      ...{ limit: limit },
      ...{ order: props.order },
      ...{ sortBy: props.orderBy },
      ...(state?.userName !== '' && { name: state?.userName }),
      ...(state?.emailAddress !== '' && { email: state?.emailAddress }),
      ...(state?.messageKey !== '' && { messageKey: state?.messageKey }),
      ...(state?.notificationStatus !== 'none' && { status: state?.notificationStatus }),
      ...(state?.countryId !== '' && { countryId: state?.countryId }),
      ...(state?.titlesLists?.title !== null && { title: state?.titlesLists?.title }),
      ...(state?.linkType?.linkType !== null && { linkType: state?.linkType?.linkType }),
      ...(dateRangeValue[0] !== null && { fromDate: parseDate(dateRangeValue[0]) }),
      ...(dateRangeValue[1] !== null && { toData: parseDate(dateRangeValue[1]) }),
      ...(dateHypenConvert(convertedSentDateDateValue[1]) !== undefined && {
        sentDate:
          dateHypenConvert(convertedSentDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedSentDateDateValue[1]),
      }),
    };
    handleFilter(data);
    handleFilterApplied();
    handleDrawerClose();
  };

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    userName : false,
    emailAddress:false,
    titlesLists:false,
    messageKey:false,
    linkType:false,
    countryId:false,
    notificationStatus :false
  });

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {

    if (e.key === 'Enter'){
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        userName : false,
        emailAddress:false,
        titlesLists:false,
        messageKey:false,
        linkType:false,
        countryId:false,
        notificationStatus :false
      });
    }
  }
  // clear all handler
  const handleClearAll = () => {
    setStateValue({
      userName: '',
      emailAddress: '',
      messageKey: '',
      countryId: '',
      countryName: { countryName: '' },
      titlesLists: null,
      linkType: null,
      notificationStatus: 'none',
      page: page,
      limit: limit,
      order: props.order,
      sortBy: props.orderBy,
    });
    setConvertedSentDateRangeValue('');
    setConvertedSentDateDateValue([null, null]);
    props.handleRemoveFilterApplied();
    props.setPage(1);
    setDateRangeValue([null, null]);
    setIsShowAll(true);
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* drawer */}
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal notifications-leftbar"
      >
        <Scrollbar
          className="filter-scrollbar"
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          <DrawerHeader className="filter-drawer-head">
            {/* Clear all button */}
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">{rowCount} Results</Typography>
              <Button className="clearBtn" onClick={handleClearAll}>
                Clear all
              </Button>
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
              <Box
                className="edit-section"
                pt={4}
                sx={{
                  ...(!isDisplayBox && { display: 'none' }),
                }}
              >
                <Box className="FormGroup" mt={3}>
                  {/* user name */}
                  <TextField
                    name="userName"
                    value={state?.userName}
                    placeholder="User Name"
                    onKeyDown={handleSelectKeyDown}
                    onChange={(e: any) => handleChangeField('userName', e.target.value)}
                    className="edit-field clientName"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i className="icon-Search"></i>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* email */}
                  <TextField
                    name="emailAddress"
                    value={state?.emailAddress}
                    onKeyDown={handleSelectKeyDown}
                    onChange={(e: any) => handleChangeField('emailAddress', e.target.value)}
                    placeholder="Email Address"
                    className="edit-field"
                  />

                  {/* Custom Range Picker */}
                  <Box className="calender-wrapper">
                    <Box className="edit-field">
                      <CustomFilterRangePicker
                        placeholderText="Date Range"
                        convertedDateRangeValue={convertedSentDateRangeValue}
                        setConvertedDateRangeValue={setConvertedSentDateRangeValue}
                        convertedDateValue={convertedSentDateDateValue}
                        setConvertedYobDateValue={setConvertedSentDateDateValue}
                      />
                    </Box>
                  </Box>

                  {/* select Title */}
                  <Box className="edit-field">
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={titlesListsData || []}
                      getOptionLabel={(option: any) => option?.title}
                      renderInput={(params) => <TextField {...params} placeholder={`Title`} />}
                      value={state?.titlesLists ? state?.titlesLists : null}
                      onKeyDown={handleSelectKeyDown}
                      onChange={(e: any, selectedOptions: any) =>
                        handleChangeField('titlesLists', selectedOptions)
                      }
                      className="mareBlockInput"
                    />
                  </Box>

                  {/* message key */}
                  <TextField
                    name="messageKey"
                    value={state?.messageKey}
                    onKeyDown={handleSelectKeyDown}
                    onChange={(e: any) => handleChangeField('messageKey', e.target.value)}
                    placeholder="Message Keyword"
                    className="edit-field"
                  />

                  <Box className="edit-field">
                    {/* Link Type */}
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={linkTypeData || []}
                      getOptionLabel={(option: any) => option?.linkType}
                      renderInput={(params) => <TextField {...params} placeholder={`Link Type`} />}
                      value={state?.linkType ? state?.linkType : null}
                      onKeyDown={handleSelectKeyDown}
                      onChange={(e: any, selectedOptions: any) =>
                        handleChangeField('linkType', selectedOptions)
                      }
                      className="mareBlockInput"
                    />
                  </Box>

                  <Box className="edit-field">
                    {/* Country */}
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={countriesList || []}
                      getOptionLabel={(option: any) => option?.countryName}
                      renderInput={(params) => <TextField {...params} placeholder={`Country`} />}
                      value={state?.countryName ? state?.countryName : null}
                      onKeyDown={handleSelectKeyDown}
                      onChange={(e: any, selectedOptions: any) => {
                        setStateValue({
                          ...state,
                          countryId: selectedOptions?.id,
                          countryName: selectedOptions,
                        });
                      }}
                      className="mareBlockInput"
                    />
                  </Box>

                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    {/* Status */}
                    <Select
                      MenuProps={{...MenuProps,
                        onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, notificationStatus: false })
                      }}
                      open={isOpenSelectBox.notificationStatus}
                      onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, notificationStatus: true })}
                      onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, notificationStatus: false })}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      onChange={(e: any) => handleChangeField('notificationStatus', e.target.value)}
                      className="filter-slct"
                      value={state?.notificationStatus ? state?.notificationStatus : 'none'}
                      name="notificationStatus"
                    >
                      <MenuItem className="selectDropDownList  disabled" value="none" disabled><em>Status</em></MenuItem>
                      <MenuItem className="selectDropDownList" value="Unread">Unread</MenuItem>
                      <MenuItem className="selectDropDownList" value="Read">Read</MenuItem>
                    </Select>
                  </Box>
                </Box>

                {/* search button */}
                <Stack sx={{ mt: 2 }} className="DrawerBtnWrapper">
                  <Button
                    disabled={checkFilterApplied()}
                    onClick={handleFilterData}
                    className="search-btn"
                    fullWidth
                  >
                    Search
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
}

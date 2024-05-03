import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack } from '@mui/material';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import Scrollbar from 'src/components/Scrollbar';
// hooks
import 'src/sections/@dashboard/css/filter.css';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from 'src/constants/MenuProps';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { useMemberProductListQuery } from 'src/redux/splitEndpoints/productSplit';
import { DateRange } from 'src/@types/dateRangePicker';
import { dateHypenConvert } from 'src/utils/customFunctions';
import { useLocation, useParams } from 'react-router';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import { Autocomplete } from '@mui/material';
// ----------------------------------------------------------------------
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

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
  ...theme.mixins.toolbar,
}));

const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 46,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 1.5,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(22px)',
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
    width: 20,
    height: 20,
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

const SystemActivitiesFilterSidebar = React.forwardRef((props: any, ref: any) => {
  const { handleFilter, handleFilterApplied, rowCount, page, limit, handleRemoveFilterApplied } =
    props;
  const { pathname } = useLocation();
  const { name = '', fname = '', user = '', raceName = '', runnerName = '', featureName = '',email='' } = useParams();
  const [open, setOpen] = React.useState(false);
  const [createDateSortSelected, setCreateDateSortSelected] = React.useState('');
  const [createDateValue, setCreateDateValue] = React.useState<DateRange>([null, null]);
  const [createDate, setCreateDate] = React.useState<DateRange>([null, null]);
  const [orderBy, setOrderBy] = React.useState('createdOn');
  const [order, setOrder] = React.useState('DESC');
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  const [state, setStateValue] = React.useState<any>({
    page: page,
    limit: limit,
    sortBy: orderBy,
    order: order,
    name: user,
    email: email,
    horseName: name,
    farmName: fname,
    countryId: '',
    countryName: { countryName: '' },
    fromDate: null,
    toDate: null,
    isRequiredApproval: false,
    result: 'none',
    reportType: '',
    productName: { productName: '' },
    activityModule: raceName ? 'Races' : runnerName ? 'Runners' : featureName ? featureName : 'none',
  });

  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  const [activity, setActivity] = React.useState('');
  const [isChecked, setIsChecked] = React.useState(true);
  const [isRequiredApprovalClicked, setIisRequiredApprovalClicked] = React.useState<boolean>(false);

  const { data } = useCountriesQuery();
  const { data: reportList } = useMemberProductListQuery();

  React.useImperativeHandle(ref, () => ({
    handleClearFilter() {
      setOpen(false);
      setIsDisplayBox(false);
      clearFilter();
    },
  }));

  console.log('horseName', name, fname, user, raceName, runnerName, featureName)

  React.useEffect(() => {
    let isFilter = false;
    if (name) {
      isFilter = pathname.includes('horsefilter');
    }
    if (fname) {
      isFilter = pathname.includes('farmfilter');
    }
    if (user) {
      isFilter = pathname.includes('userfilter');
    }
    if (raceName) {
      isFilter = pathname.includes('racefilter');
    }
    if (runnerName) {
      isFilter = pathname.includes('runnerfilter');
    }
    if (featureName) {
      isFilter = pathname.includes('notificationFilter');
    }
    if (email) {
      isFilter = pathname.includes('emailFilter');
    }
    if (isFilter) {
      handleFilterData();
    }
  }, []);

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    name: false,
    email: false,
    countryId: false,
    horseName: false,
    farmName: false,
    countryName: false,
    result: false,
  });


  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        name: false,
        email: false,
        countryId: false,
        horseName: false,
        farmName: false,
        countryName: false,
        result: false,
      });
    }
  };
  //opens the drawer
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };

  //closes the drawer
  const handleDrawerClose = () => {
    setOpen(false);
  };

  //updates activites fields values
  const handelActivity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivity(e?.target?.value);
  };
  //refetchs the data through api according to the filter applied
  const handleFilterData = () => {
    const data = {
      ...{ page: page },
      ...{ limit: limit },
      ...{ sortBy: orderBy },
      ...{ order: order },
      ...(state.name !== '' && { name: state.name }),
      ...(state.email !== '' && { email: state.email }),
      ...(state.horseName !== '' && { horseName: state.horseName }),
      ...(state.farmName !== '' && { farmName: state.farmName }),
      ...(state.countryId !== '' && { countryId: state.countryId }),
      ...(state.result !== 'none' && { result: state.result }),
      ...(state.activityModule !== 'none' && { activityModule: state.activityModule }),
      ...(state.reportType !== '' && { reportType: state.reportType }),
      ...(isRequiredApprovalClicked && { isRequiredApproval: state?.isRequiredApproval }),
      ...(pathname.includes('emailFilter') && { isRedirect: true }),
      ...(dateHypenConvert(createDateValue[0]) !== undefined && {
        fromDate: dateHypenConvert(createDateValue[0]),
      }),
      ...(dateHypenConvert(createDateValue[1]) !== undefined && {
        toDate: dateHypenConvert(createDateValue[1]),
      }),
      activity,
    };
    handleFilter(data);
    handleFilterApplied();
    handleDrawerClose();
  };
  //clears all the filter values and sets to default
  const clearFilter = () => {
    setStateValue({
      page: page,
      limit: limit,
      sortBy: state?.orderBy,
      order: state?.order,
      name: '',
      email: '',
      horseName: '',
      farmName: '',
      countryId: '',
      countryName: { countryName: '' },
      fromDate: null,
      toDate: null,
      isRequiredApproval: false,
      result: 'none',
      activityModule: 'none',
      reportType: '',
      productName: { productName: '' },
    });
    setActivity('');
    setCreateDateSortSelected('');
    setCreateDateValue([null, null]);
    setCreateDate([null, null]);
    setIisRequiredApprovalClicked(false);
    handleRemoveFilterApplied();
    // handleDrawerClose();
  };
  //updates the text fields values
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });
    if (type === 'isRequiredApproval') {
      setIisRequiredApprovalClicked(true);
    }
  };

  // checks weather any form field values are not null
  const checkFilterApplied = () => {
    if (
      state?.name ||
      state?.email ||
      state?.horseName ||
      state?.farmName ||
      state?.countryId ||
      state?.result !== 'none' ||
      state?.activityModule !== 'none' ||
      state?.reportType ||
      activity ||
      createDateValue[1] !== null
    ) {
      if (isRequiredApprovalClicked) {
        return false;
      }
      return false;
    } else {
      if (isRequiredApprovalClicked) {
        return false;
      }
      return true;
    }
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* system Activites filter drawer component  */}
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal systemactivities-leftbar"
      >
        <Scrollbar
          className="filter-scrollbar"
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          {/* Drawer Header component  */}
          <DrawerHeader className="filter-drawer-head">
            {/* Displays Result count and Clear all button  */}
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">{rowCount} Results</Typography>
              <Button onClick={clearFilter} className="clearBtn">
                Clear all
              </Button>
            </Box>
            {/* End Displays Result count and Clear all button  */}

            {/* displays handel open icon  */}
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
            {/* Ends displays handel open icon  */}

            {/* display hadel close icon  */}
            <IconButton className="handleMenuBack" onClick={handleDrawerClose}>
              <i className="icon-menu-back" />
            </IconButton>
            {/* Ends display hadel close icon  */}
          </DrawerHeader>
          {/* End Drawer Header component  */}

          {/* if drawer opend then this component is visible  */}
          {open && (
            <Box>
              <Box
                className="edit-section"
                mt={4}
                // paddingTop={60}
                sx={{
                  ...(!isDisplayBox && { display: 'none' }),
                }}
              >
                {/* Form fields  */}
                <Box className="FormGroup">
                  {/* UserName text filed  */}
                  <TextField
                    name=""
                    placeholder="User Name"
                    onChange={(e) => handleChangeField('name', e.target.value)}
                    value={state.name}
                    onKeyDown={handleSelectKeyDown}
                    className="edit-field clientName"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i className="icon-Search"></i>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* Email Address text filed  */}
                  <TextField
                    name=""
                    value={state.email}
                    onChange={(e) => handleChangeField('email', e.target.value)}
                    placeholder="Email Address"
                    className="edit-field"
                    onKeyDown={handleSelectKeyDown}
                  />
                  {/* Date Picker field  */}
                  <Box className="calender-wrapper" onKeyDown={handleSelectKeyDown}>
                    <Box className="edit-field">
                      <CustomFilterRangePicker
                        placeholderText="Date Range"
                        convertedDateRangeValue={createDateSortSelected}
                        setConvertedDateRangeValue={setCreateDateSortSelected}
                        convertedDateValue={createDateValue}
                        setConvertedYobDateValue={setCreateDateValue}
                      />
                    </Box>
                  </Box>
                  {/* Activity text field  */}
                  <TextField
                    name=""
                    value={activity}
                    onChange={handelActivity}
                    placeholder="Activity"
                    className="edit-field"
                    onKeyDown={handleSelectKeyDown}
                  />
                  {/* Horse Name Text field  */}
                  <TextField
                    name=""
                    value={state.horseName}
                    onChange={(e) => handleChangeField('horseName', e.target.value)}
                    placeholder="Horse Name"
                    className="edit-field"
                    onKeyDown={handleSelectKeyDown}
                  />
                  {/* farm name text field  */}
                  <TextField
                    name=""
                    value={state.farmName}
                    onChange={(e) => handleChangeField('farmName', e.target.value)}
                    placeholder="Farm Name"
                    className="edit-field"
                    onKeyDown={handleSelectKeyDown}
                  />
                  {/* country drop down field */}
                  <Box className="edit-field">
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={data || []}
                      onKeyDown={handleSelectKeyDown}
                      getOptionLabel={(option: any) => option?.countryName}
                      renderInput={(params: any) => (
                        <TextField {...params} placeholder={`Country`} />
                      )}
                      value={state?.countryName ? state?.countryName : null}
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
                  {/* Result dropdown fieḷd */}
                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    <Select
                      MenuProps={MenuProps}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      onChange={(e) => handleChangeField('result', e.target.value)}
                      value={state.result}
                      className="filter-slct"
                      defaultValue="none"
                      name="expiredStallion"
                    >
                      <MenuItem className="selectDropDownList" value="none" disabled>
                        <em>Result</em>
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Successful">
                        Successful
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Failed">
                        Failed
                      </MenuItem>
                    </Select>
                  </Box>
                  {/* Report type dropdown field  */}
                  <Box className="edit-field">
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      onKeyDown={handleSelectKeyDown}
                      options={reportList || []}
                      getOptionLabel={(option: any) => option?.productName}
                      renderInput={(params: any) => (
                        <TextField {...params} placeholder={`Report Type`} />
                      )}
                      value={state?.productName ? state?.productName : null}
                      onChange={(e: any, selectedOptions: any) => {
                        setStateValue({
                          ...state,
                          reportType: selectedOptions?.id,
                          productName: selectedOptions,
                        });
                      }}
                      className="mareBlockInput"
                    />
                  </Box>
                  {/* Activity Module Dropdown field  */}
                  {/* <Box className="edit-field">
                    <Select
                      MenuProps={MenuProps}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      onChange={(e) => handleChangeField('activityModule', e.target.value)}
                      value={state.activityModule}
                      className="filter-slct"
                      defaultValue="none"
                      name="expiredStallion"
                    >
                      <MenuItem className="selectDropDownList" value="none" disabled>
                        <em>Activity Module</em>
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Stallions">
                        Stallions
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Horses">
                        Horses
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Members">
                        Members
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Farms">
                        Farms
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Races">
                        Races
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Runners">
                        Runners
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Marketing">
                        Marketing
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Reports">
                        Reports
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Messages">
                        Messages
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="PromoCodes">
                        PromoCodes
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Testimonials">
                        Testimonials
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="FavouriteStallions">
                        FavouriteStallions
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="FavouriteFarms">
                        FavouriteFarms
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="StallionShortlist">
                        StallionShortlist
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Mares">
                        Mares
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="MaresList">
                        MaresList
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="General">
                        General
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="General">
                        General
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="UserManagement">
                        UserManagement
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Notifications">
                        Notifications
                      </MenuItem>
                    </Select>
                  </Box> */}
                  {/* Requires approvel switch  */}
                  <Box className="RHF-Switches" mt={0.5}>
                    <FormControlLabel
                      control={<IOSSwitch checked={state?.isRequiredApproval} />}
                      label="Requires Approval"
                      name="isVerified"
                      labelPlacement="start"
                      sx={{ paddingLeft: '10px' }}
                      checked={state?.isRequiredApproval}
                      onChange={(e: any) =>
                        handleChangeField('isRequiredApproval', e.target.checked ? true : false)
                      }
                    />
                  </Box>
                </Box>
                {/* End Form fields  */}

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
                {/* End search button */}
              </Box>
            </Box>
          )}
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
});
export default SystemActivitiesFilterSidebar;

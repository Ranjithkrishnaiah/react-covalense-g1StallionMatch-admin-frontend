import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {
  StyledEngineProvider,
  Typography,
  Stack,
  InputAdornment,
  Autocomplete,
} from '@mui/material';
// form
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useFarmLocationsQuery } from 'src/redux/splitEndpoints/farmSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/filter.css';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { DateRange } from 'src/@types/dateRangePicker';
import { Images } from 'src/assets/images';
import { dateHypenConvert } from 'src/utils/customFunctions';
import { useLocation } from 'react-router';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
///////////////////////////////////////
const drawerWidth = 290;
// opened Mixin handler
const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});
// closed Mixin handler
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
// DrawerHeader handler
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
  width: 46,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: '0px 0px 0px',
    margin: '2px 3px',
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#1D472E',
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
    backgroundColor: theme.palette.mode === 'light' ? '#B0B6AF' : '#39393D',
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

export default function FarmFilterSidebar(props: any) {
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();
  // API call to get countries List
  const { data: countriesList } = useFarmLocationsQuery();
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

  const [isVerifiedClicked, setIsVerifiedClicked] = React.useState<boolean>(false);
  // IsVerified Check handler
  const handleIsVerifiedCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setIsVerified(event.target.checked ? true : false);
    setIsVerifiedClicked(true);
    props.setStateValue({
      ...props.state,
      isVerifiedClicked: true,
    });
  };
  // call when popen open
  React.useEffect(() => {
    props.handleOpenFilterParam(open);
  }, [open]);
  // call when component loaded
  React.useEffect(() => {
    let isFilter = false;
    if (props.farmName) {
      isFilter = pathname.includes('filter');
    }

    if (isFilter) {
      handleFilterData();
    }
  }, []);

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    farmName: false,
    country: false,
    status: false,
    activePeriod: false,
    promotedStatus: false,
    expiredFarms: false,
    requirdedFarms: false,
  });

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        farmName: false,
        country: false,
        status: false,
        activePeriod: false,
        promotedStatus: false,
        expiredFarms: false,
        requirdedFarms: false,
      });
    }
  };

  // check Filter Applied handler
  const checkFilterApplied = () => {
    if (
      props.farmName !== '' ||
      props?.state?.countryId != null ||
      props.active != 'none' ||
      props.activePeriod != '' ||
      props.promotedStatus != 'none' ||
      props.expiredStallion != 'none' ||
      dateHypenConvert(props.convertedActivePeriodDateValue[1]) !== undefined ||
      isVerifiedClicked
    ) {
      return false;
    } else {
      return true;
    }
  };

  // Filter handler
  const handleFilterData = () => {
    const data = {
      ...{ page: props.page },
      ...{ limit: props.limit },
      ...{ order: props.order },
      ...{ sortBy: props.state?.isSortByClicked ? props.orderBy : props.defaultPageOrderBy },
      ...(props.farmName != '' && { farmName: props.farmName }),
      ...(props.farmName != '' && { isFarmNameExactSearch: props.isFarmNameExactSearch }),
      ...(props?.state?.countryId !== null && { country: props?.state?.countryId }),
      ...(props.active !== 'none' && { Status: props.active }),
      ...(dateHypenConvert(props.convertedActivePeriodDateValue[1]) !== undefined && {
        activePeriod:
          dateHypenConvert(props.convertedActivePeriodDateValue[0]) +
          '/' +
          dateHypenConvert(props.convertedActivePeriodDateValue[1]),
      }),
      ...(props.promotedStatus !== 'none' && { PromotedStatus: props.promotedStatus }),
      ...(props.expiredStallion !== 'none' && { expiredStallion: props.expiredStallion }),
      ...(props?.state?.isVerifiedClicked && { RequiresVerification: props.isVerified }),
      ...(props.dateValueFilter !== null && { dateValue: props.dateValueFilter }),
    };
    props.handleFilter(data);
    props.handleFilterApplied();
    props.setIsSearchClicked(true);
    handleDrawerClose();
  };

  // clear all and reset to initial state
  const handleClearAll = () => {
    props.setStateValue({
      farmName: '',
      activePeriod: '',
      activePeriodRange: [null, null],
      isVerifiedClicked: false,
      isSortByClicked: false,
      countryId: null,
      countryName: { countryName: '' },
    });
    props.setConvertedActivePeriodRangeValue('');
    props.setConvertedActivePeriodDateValue([null, null]);
    props.setPage(1);
    props.setFarmName('');
    props.setCountryId('none');
    props.setActive('none');
    props.setActivePeriod('');
    props.handleRemoveFilterApplied();
    props.setPromotedStatus('none');
    props.setExpiredStallion('none');
    props.setIsVerified(false);
    props.setDateValueFilter(null);
    setIsVerifiedClicked(false);
    Value([null, null]);
  };

  const [value, setValue] = React.useState<Date | null>(null);
  // farm Status menu List
  const farmStatusList = [
    { id: 'All', name: 'All' },
    { id: 'Active', name: 'Active' },
    { id: 'Inactive', name: 'Inactive' },
  ];
  // promoted Status menu List
  const promotedStatusList = [
    { id: 'All', name: 'All' },
    { id: 'Promoted', name: 'Promoted' },
    { id: 'Non-promoted', name: 'Non-promoted' },
  ];
  // MenuPropss
  const ITEM_HEIGHT = 35;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-2px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  };

  // onChange filed set state handler
  const handleChangeField = (type: any, targetValue: any) => {
    props.setFarmName(targetValue);
    props.setStateValue({
      ...props.state,
      [type]: targetValue,
    });

    setIsOpenSelectBox({
      farmName: false,
      country: false,
      status: false,
      activePeriod: false,
      promotedStatus: false,
      expiredFarms: false,
      requirdedFarms: false,
    });
  };
  const [isToggleClass, setIsToggleClass] = React.useState(true);
  const [isPartialToggleClass, setIsPartialToggleClass] = React.useState(false);
  // FarmName Toggle handler
  const handleFarmNameToggle = (nameFilterType: string) => {
    props.setIsFarmNameExactSearch(!props.isFarmNameExactSearch);
    props.setStateValue({
      ...props.state,
      isFarmNameExactSearch: props.isFarmNameExactSearch,
    });
    if (nameFilterType === 'exact') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    } else if (nameFilterType === 'partial') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    }
  };
  const [createDateSortSelected, SortSelected] = React.useState(null);
  const [createDateValue, Value] = React.useState<DateRange>([null, null]);
  let toggleClass = isToggleClass ? 'matched-active' : 'matched-inactive';
  let partialToggleClass = isPartialToggleClass ? 'matched-active' : 'matched-inactive';

  return (
    <StyledEngineProvider injectFirst>
      {/* drawer starts */}
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal farmfilter-leftbar"
      >
        <Scrollbar
          className="filter-scrollbar"
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          <DrawerHeader className="filter-drawer-head">
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">{props.rowCount} Farms</Typography>
              {/* Clear all */}
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

          {/* input fields for filers section */}
          {open && (
            <Box>
              <Box
                className="edit-section"
                pt={4}
                sx={{
                  ...(!isDisplayBox && { display: 'none' }),
                }}
              >
                <Box className="FormGroup">
                  {/* Name */}
                  <TextField
                    name="farmName"
                    placeholder="Name"
                    value={props?.state?.farmName}
                    onChange={(e) => handleChangeField('farmName', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                    className="edit-field matchcasetext"
                    autoComplete="off"
                    InputProps={{
                      endAdornment: (
                        <>
                          <InputAdornment position="start" className="matchcase">
                            <IconButton
                              className={`matchcase-first ${toggleClass}`}
                              aria-label="toggle password visibility"
                              edge="end"
                              onClick={() => handleFarmNameToggle('exact')}
                              sx={{ marginRight: '0px', padding: '0px' }}
                            >
                              <img src={Images.Aa} alt="Aa" />
                            </IconButton>

                            <IconButton
                              className={`matchcase-second ${partialToggleClass}`}
                              aria-label="toggle password visibility"
                              edge="end"
                              onClick={() => handleFarmNameToggle('partial')}
                              sx={{ marginRight: '0px', padding: '0px' }}
                            >
                              <img src={Images.ab} alt="ab" />
                            </IconButton>
                          </InputAdornment>
                        </>
                      ),
                    }}
                  />

                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    {/* Select Country */}
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={countriesList || []}
                      getOptionLabel={(option: any) => option?.countryName}
                      renderInput={(params) => (
                        <TextField {...params} placeholder={`Select Country`} />
                      )}
                      value={props?.state?.countryName ? props?.state?.countryName : null}
                      onChange={(e: any, selectedOptions: any) => {
                        props?.setStateValue({
                          ...props.state,
                          countryId: selectedOptions?.countryId,
                          countryName: selectedOptions,
                        });
                      }}
                      className="mareBlockInput"
                    />
                  </Box>
                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    {/* Status */}
                    <Select
                      MenuProps={{
                        ...MenuPropss,
                        onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, status: false }),
                      }}
                      open={isOpenSelectBox.status}
                      onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, status: true })}
                      onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, status: false })}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      name="active"
                      onChange={(e: any) => props.setActive(e.target.value)}
                      value={props.active}
                      className="filter-slct"
                    >
                      <MenuItem className="selectDropDownList" value="none" disabled>
                        <em>Status</em>
                      </MenuItem>
                      {farmStatusList?.map(({ id, name }) => {
                        return (
                          <MenuItem className="selectDropDownList" value={id} key={id}>
                            {name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Box>

                  {/* Custom Range Picker */}
                  <Box className="edit-field calender-wrapper" onKeyDown={handleSelectKeyDown}>
                    <CustomFilterRangePicker
                      placeholderText="Active Period"
                      convertedDateRangeValue={props.convertedActivePeriodRangeValue}
                      setConvertedDateRangeValue={props.setConvertedActivePeriodRangeValue}
                      convertedDateValue={props.convertedActivePeriodDateValue}
                      setConvertedYobDateValue={props.setConvertedActivePeriodDateValue}
                      handleSelectKeyDown={handleSelectKeyDown}
                    />
                  </Box>
                </Box>

                {/* Advanced Filters */}
                <Box className="FormGroup">
                  <Typography variant="h5">Advanced Filters</Typography>
                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    <Select
                      MenuProps={{
                        ...MenuPropss,
                        onClose: () =>
                          setIsOpenSelectBox({ ...isOpenSelectBox, promotedStatus: false }),
                      }}
                      open={isOpenSelectBox.promotedStatus}
                      onOpen={() =>
                        setIsOpenSelectBox({ ...isOpenSelectBox, promotedStatus: true })
                      }
                      onClose={() =>
                        setIsOpenSelectBox({ ...isOpenSelectBox, promotedStatus: false })
                      }
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      onChange={(e: any) => props.setPromotedStatus(e.target.value)}
                      className="filter-slct"
                      value={props.promotedStatus}
                      name="promotedStatus"
                    >
                      <MenuItem className="selectDropDownList" value="none" disabled>
                        <em>Promoted Status</em>
                      </MenuItem>
                      {promotedStatusList?.map(({ id, name }) => {
                        return (
                          <MenuItem className="selectDropDownList" value={id} key={id}>
                            {name}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Box>
                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    {/* Expired Farms */}
                    <Select
                      MenuProps={{
                        ...MenuPropss,
                        onClose: () =>
                          setIsOpenSelectBox({ ...isOpenSelectBox, expiredFarms: false }),
                      }}
                      open={isOpenSelectBox.expiredFarms}
                      onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, expiredFarms: true })}
                      onClose={() =>
                        setIsOpenSelectBox({ ...isOpenSelectBox, expiredFarms: false })
                      }
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      onChange={(e: any) => props.setExpiredStallion(e.target.value)}
                      className="filter-slct"
                      value={props.expiredStallion}
                      name="expiredStallion"
                    >
                      <MenuItem className="selectDropDownList" value="none" disabled>
                        <em>Expired Farms</em>
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="All">
                        All
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Yes">
                        Yes
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="No">
                        No
                      </MenuItem>
                    </Select>
                  </Box>
                </Box>

                <Box className="FormGroup RequiresVerification">
                  <Box className="RHF-Switches" onKeyDown={handleSelectKeyDown}>
                    {/* isVerified */}
                    <FormControlLabel
                      control={<IOSSwitch />}
                      label="Requires Verification"
                      name="isVerified"
                      labelPlacement="start"
                      checked={props.isVerified}
                      onChange={(event: any) => handleIsVerifiedCheck(event)}
                    />
                  </Box>
                </Box>

                {/* Search button */}
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
          {/* input fields for filers section ends */}
        </Scrollbar>
      </Drawer>
      {/* drawer ends */}
    </StyledEngineProvider>
  );
}

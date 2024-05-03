 import * as React from 'react';
// mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack } from '@mui/material';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import InputAdornment from '@mui/material/InputAdornment';

import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import {
  useSaleCompanyQuery,
  useSaleStatusQuery,
  useSaleTypeQuery,
} from 'src/redux/splitEndpoints/salesSplit';
import Scrollbar from '../../../../components/Scrollbar';
import 'src/sections/@dashboard/css/filter.css';
import { MenuProps } from 'src/constants/MenuProps';
import { DateRange } from 'src/@types/dateRangePicker';
import { dateHypenConvert } from 'src/utils/customFunctions';
import { Images } from 'src/assets/images';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import { Autocomplete } from '@mui/material';
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

const SalesFilterSidebar = React.forwardRef((props: any, ref: any) => {
  const {
    handleFilter,
    handleFilterApplied,
    handleRemoveFilterApplied,
    rowCount,
    page,
    limit,
    setIsSearchClicked,
    convertedCreatedRangeValue,
    setConvertedCreatedRangeValue,
    convertedCreatedDateValue,
    setConvertedCreatedDateValue,
    salesModuleAccess,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [order, setOrder] = React.useState('ASC');
  const [orderBy, setOrderBy] = React.useState('salesName');
  const [isToggleClass, setIsToggleClass] = React.useState(true);
  const [isPartialToggleClass, setIsPartialToggleClass] = React.useState(false);
  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  const [state, setStateValue] = React.useState<any>({
    page: page,
    limit: limit,
    sortBy: orderBy,
    order: order,
    salesName: '',
    countryId: '',
    countryName: { countryName: '' },
    salesCompanyId: '',
    salescompanyName: { salescompanyName: '' },
    salesInfoId: '',
    salesTypeName: { salesTypeName: '' },
    salesStatus: '',
    dateRange: '',
    isSalesNameExactSearch: true,
  });
  const [createDateValue, setCreateDateValue] = React.useState<DateRange>([null, null]);
  const [createDate, setCreateDate] = React.useState<DateRange>([null, null]);
  const [createDateSortSelected, setCreateDateSortSelected] = React.useState(null);
  let toggleClass = isToggleClass ? 'matched-active' : 'matched-inactive';
  let partialToggleClass = isPartialToggleClass ? 'matched-active' : 'matched-inactive';

  // Api call
  const { data: countriesList } = useCountriesQuery();
  const { data: salesCompanyList } = useSaleCompanyQuery();
  const { data: salesTypeList } = useSaleTypeQuery();
  const { data: salesStatusList } = useSaleStatusQuery();

  // handle filter states
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });

    setIsOpenSelectBox({
      salesName: false,
      countryId: false,
      salesCompanyId: false,
      salesInfoId: false,
      salesStatus: false,
      dateRange: false,
      isSalesNameExactSearch: false,
    });
  };

  // Open filter drawer
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };

  // close filter drawer
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Handle date value
  const handleDueDate = (value: any) => {
    setCreateDateValue(value);
  };

  // Submit filter
  const handleFilterData = () => {
    const data = {
      ...{ page: page },
      ...{ limit: limit },
      ...(state.salesName !== '' && { salesName: state.salesName }),
      ...(state.salesCompanyId !== '' && { salesCompanyId: state.salesCompanyId }),
      ...(state.salesInfoId !== '' && { salesInfoId: state.salesInfoId }),
      ...(state.salesStatus !== '' && { salesStatus: state.salesStatus }),
      ...(state.countryId !== '' && { countryId: state.countryId }),
      ...(state.salesName !== '' && { isSalesNameExactSearch: state.isSalesNameExactSearch }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && {
        dateRange:
          dateHypenConvert(convertedCreatedDateValue[0]) +
          '/' +
          dateHypenConvert(convertedCreatedDateValue[1]),
      }),
    };
    setIsSearchClicked(true);
    handleFilter(data);
    handleFilterApplied();
    handleDrawerClose();
  };

  // Apply partial search logic
  const handleSalesNameToggle = (nameFilterType: string) => {
    setStateValue({
      ...state,
      isSalesNameExactSearch: !state.isSalesNameExactSearch,
    });
    if (nameFilterType === 'exact') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    } else if (nameFilterType === 'partial') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    }
  };

  // Clear filter
  const clearFilter = () => {
    setStateValue({
      page: page,
      limit: limit,
      sortBy: orderBy,
      order: order,
      salesName: '',
      countryId: '',
      countryName: { countryName: '' },
      salesCompanyId: '',
      salescompanyName: { salescompanyName: '' },
      salesInfoId: '',
      salesTypeName: { salesTypeName: '' },
      salesStatus: '',
      dateRange: '',
      isSalesNameExactSearch: true,
    });
    setCreateDateSortSelected(null);
    setCreateDateValue([null, null]);
    setCreateDate([null, null]);
    handleRemoveFilterApplied();
    setIsToggleClass(true);
    setIsPartialToggleClass(false);
    setIsSearchClicked(false);
    setConvertedCreatedRangeValue('');
    setConvertedCreatedDateValue([null, null]);
  };

  // Call the parent component clear function
  React.useImperativeHandle(ref, () => ({
    handleClearFilter() {
      clearFilter();
    },
  }));

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    salesName: false,
    countryId: false,
    salesCompanyId: false,
    salesInfoId: false,
    salesStatus: false,
    dateRange: false,
    isSalesNameExactSearch: false,
  });

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        salesName: false,
        countryId: false,
        salesCompanyId: false,
        salesInfoId: false,
        salesStatus: false,
        dateRange: false,
        isSalesNameExactSearch: false,
      });
    }
  };

  // Check if filter is applied or not based on that disabled the search button
  const checkFilterApplied = () => {
    if (
      state?.salesName ||
      state?.countryId ||
      state?.salesCompanyId ||
      dateHypenConvert(convertedCreatedDateValue[1]) !== undefined ||
      state?.salesInfoId ||
      state?.salesStatus
    ) {
      return false;
    } else {
      return true;
    }
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* Sales filter form */}
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal sales-leftbar"
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
              <Typography variant="h3">{rowCount} Results</Typography>
              <Button className="clearBtn" onClick={clearFilter}>
                Clear all
              </Button>
            </Box>

            <IconButton
              className="handleMenuOpen"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              disabled={window.location.pathname.match('viewlots') !== null || salesModuleAccess.sales_list === false}
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
            <IconButton
              className="handleMenuBack"
              onClick={handleDrawerClose}
              disabled={window.location.pathname.match('viewlots') !== null}
            >
              <i className="icon-menu-back" />
            </IconButton>
          </DrawerHeader>
          {open && (
            <Box>
              <Box
                className="edit-section"
                pt={6}
                sx={{
                  ...(!isDisplayBox && { display: 'none' }),
                }}
              >
                <Box className="FormGroup" mt={3}>
                  <TextField
                    name=""
                    placeholder="Sale Name"
                    onChange={(e) => handleChangeField('salesName', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                    value={state?.salesName}
                    className="edit-field clientName"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i className="icon-Search"></i>
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <>
                          <InputAdornment position="start" className="matchcase">
                            <IconButton
                              className={`matchcase-first ${toggleClass}`}
                              aria-label="toggle password visibility"
                              edge="end"
                              onClick={() => handleSalesNameToggle('exact')}
                              sx={{ marginRight: '0px', padding: '0px' }}
                            >
                              <img src={Images.Aa} alt="Aa" />
                            </IconButton>

                            <IconButton
                              className={`matchcase-second ${partialToggleClass}`}
                              aria-label="toggle password visibility"
                              edge="end"
                              onClick={() => handleSalesNameToggle('partial')}
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
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={salesCompanyList || []}
                      getOptionLabel={(option: any) => option?.salescompanyName}
                      renderInput={(params: any) => (
                        <TextField {...params} placeholder={`Company`} />
                      )}
                      value={state?.salescompanyName ? state?.salescompanyName : null}
                      onChange={(e: any, selectedOptions: any) => {
                        setStateValue({
                          ...state,
                          salesCompanyId: selectedOptions?.id,
                          salescompanyName: selectedOptions,
                        });
                      }}
                      className="mareBlockInput"
                    />
                  </Box>

                  <Box className="calender-wrapper" onKeyDown={handleSelectKeyDown}>
                    <Box className="edit-field">
                      <CustomFilterRangePicker
                        placeholderText="Date Range"
                        convertedDateRangeValue={convertedCreatedRangeValue}
                        setConvertedDateRangeValue={setConvertedCreatedRangeValue}
                        convertedDateValue={convertedCreatedDateValue}
                        setConvertedYobDateValue={setConvertedCreatedDateValue}
                        handleSelectKeyDown={handleSelectKeyDown}
                      />
                    </Box>
                  </Box>

                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={countriesList || []}
                      getOptionLabel={(option: any) => option?.countryName}
                      renderInput={(params) => <TextField {...params} placeholder={`Country`} />}
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

                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={salesTypeList || []}
                      getOptionLabel={(option: any) => option?.salesTypeName}
                      renderInput={(params) => <TextField {...params} placeholder={`Sales Type`} />}
                      value={state?.salesTypeName ? state?.salesTypeName : null}
                      onChange={(e: any, selectedOptions: any) => {
                        setStateValue({
                          ...state,
                          salesInfoId: selectedOptions?.id,
                          salesTypeName: selectedOptions,
                        });
                      }}
                      className="mareBlockInput"
                    />
                  </Box>

                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    <Select
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      MenuProps={{
                        ...MenuProps,
                        onClose: () =>
                          setIsOpenSelectBox({ ...isOpenSelectBox, salesStatus: false }),
                      }}
                      open={isOpenSelectBox.salesStatus}
                      onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, salesStatus: true })}
                      onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, salesStatus: false })}
                      value={state?.salesStatus === '' ? 'none' : state?.salesStatus}
                      onChange={(e) => handleChangeField('salesStatus', e.target.value)}
                      className="filter-slct"
                      defaultValue="none"
                      name="expiredStallion"
                    >
                      <MenuItem className="selectDropDownList" value="none" disabled>
                        <em>Status</em>
                      </MenuItem>
                      {salesStatusList?.map((v: any) => {
                        return (
                          <MenuItem className="selectDropDownList" key={v.id} value={v.id}>
                            {v.status}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Box>
                </Box>

                <Stack sx={{ mt: 2 }} className="DrawerBtnWrapper">
                  <Button
                    onClick={handleFilterData}
                    disabled={checkFilterApplied()}
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
      {/* Sales filter form */}
    </StyledEngineProvider>
  );
});

export default SalesFilterSidebar;

import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack, InputAdornment } from '@mui/material';
// form
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Scrollbar from 'src/components/Scrollbar';
import { usePaymentmethodsQuery } from 'src/redux/splitEndpoints/paymentmethodsSplit';
import {
  useSocialShareQuery,
  useSociallinksQuery,
} from 'src/redux/splitEndpoints/socialLinksSplit';
import { useMemberProductListQuery } from 'src/redux/splitEndpoints/productSplit';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import 'src/sections/@dashboard/css/filter.css';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useFarmAccessLevelQuery } from 'src/redux/splitEndpoints/farmAccessLevelSplit';
import { Images } from 'src/assets/images';
import { memberfilterConstants } from 'src/constants/MemberFilterConstants';
import { dateHypenConvert } from 'src/utils/customFunctions';
import {
  useMemberStatusQuery,
  useMemberLocationsQuery,
} from 'src/redux/splitEndpoints/memberSplit';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import { Autocomplete } from '@mui/material';
// Set filter sidebar width
const drawerWidth = 290;

// set filter sidebar width & transition
const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

// Reset filter sidebar width & transition
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

// Set filter sidebar header style
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

// Set filter sidebar Drawer style
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

export default function MembersFilterSidebar(props: any) {
  const [open, setOpen] = React.useState(false);
  // Get all country api call
  const { data: countriesList } = useMemberLocationsQuery();

  // Get all Payment methods api call
  const { data: paymentMethodsData } = usePaymentmethodsQuery();

  // Get all Social links api call
  const { data: socialLinksData } = useSociallinksQuery();

  // Get all SocialShare api call
  const { data: socialShareData } = useSocialShareQuery();

  // Get all Farm AccessLevel api call
  const { data: selectaccesslevel } = useFarmAccessLevelQuery();

  // Get all Member ProductList api call
  const { data: productList } = useMemberProductListQuery();

  // Get all Member Status api call
  const { data: memberStatusList } = useMemberStatusQuery();

  const {
    handleFilter,
    handleFilterApplied,
    rowCount,
    page,
    limit,
    handleRemoveFilterApplied,
    isFilterApplied,
    isSearchClicked,
    setIsSearchClicked,
    state,
    setStateValue,
    convertedCreatedRangeValue,
    setConvertedCreatedRangeValue,
    convertedCreatedDateValue,
    setConvertedCreatedDateValue,
    defaultPageOrderBy,
    setDefaultPageOrderBy,
    orderBy,
    setOrderBy,
    setPage,
  } = props;

  // Open and close filter sidebar
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [expanded, setExpanded] = React.useState<string | false>(false);

  // expand or hide accordian
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const [isEmailExactSearch, setIsEmailExactSearch] = React.useState(
    state?.isEmailAddressExactSearch
  );
  const [isNameExactSearch, setIsNameExactSearch] = React.useState(state?.isNameExactSearch);

  // Set the filter data
  const handleFilterData = () => {
    setPage(1);
    const data = {
      ...{ page: 1 },
      ...{ limit: limit },
      ...{ order: state?.order },
      ...{ sortBy: state?.isSortByClicked ? state?.sortBy : defaultPageOrderBy },
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.name !== '' && { name: state?.name }),
      ...(state?.name != '' && { isNameExactSearch: state?.isNameExactSearch }),
      ...(state?.emailAddress !== '' && { emailAddress: state?.emailAddress }),
      ...(state?.emailAddress != '' && { isEmailAddressExactSearch: state?.isEmailExactSearch }),
      ...(state?.countryId !== null && { country: state?.countryId }),
      ...(state?.verified !== 'none' && { verified: state?.verified }),
      ...(state?.socialAccounts !== 'none' && { socialLinkId: state?.socialAccounts }),
      ...(state?.paymentMethods !== 'none' && { paymentmethodId: state?.paymentMethods }),
      ...(state?.previousOrders?.Name !== null && { PrevOrders: state?.previousOrders?.Name }),
      ...(state?.farmUser !== 'none' && { farmUser: state?.farmUser }),
      ...(state?.accessLevel !== 'none' && { accessLevel: state?.accessLevel }),
      ...(state?.status !== 'none' && { statusId: state?.status }),
      ...(state?.myHorseTracking !== 'none' && { horseTracking: state?.myHorseTracking }),
      ...(state?.searchActivity !== 'none' && { activity: state?.searchActivity }),
      ...(state?.searchShare !== 'none' && { socialShare: state?.searchShare }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && {
        activePeriod:
          dateHypenConvert(convertedCreatedDateValue[0]) +
          '/' +
          dateHypenConvert(convertedCreatedDateValue[1]),
      }),
    };
    handleFilter(data);
    handleFilterApplied();
    setIsSearchClicked(true);
    handleDrawerClose();
  };
  const [value, setValue] = React.useState<Date | null>(null);

  // Select box style
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
  };

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    memberName: false,
    memberEmail: false,
    country: false,
    verified: false,
    activePeriod: false,
    socialAccounts: false,
    paymentMethods: false,
    previousOrders: false,
    farmUser: false,
    accessLevel: false,
    status: false,
    myHorseTracking: false,
    searchActivity: false,
    searchShare: false,
  });

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        memberName: false,
        memberEmail: false,
        country: false,
        verified: false,
        activePeriod: false,
        socialAccounts: false,
        paymentMethods: false,
        previousOrders: false,
        farmUser: false,
        accessLevel: false,
        status: false,
        myHorseTracking: false,
        searchActivity: false,
        searchShare: false,
      });
    }
  };

  // Clear all
  const handleClearAll = () => {
    setStateValue({
      name: '',
      isNameExactSearch: true,
      emailAddress: '',
      isEmailExactSearch: true,
      countryId: null,
      countryName: { countryName: '' },
      verified: 'none',
      socialAccounts: 'none',
      paymentMethods: 'none',
      previousOrders: null,
      farmUser: 'none',
      accessLevel: 'none',
      status: 'none',
      myHorseTracking: 'none',
      searchActivity: 'none',
      searchShare: 'none',
      createDateValue: [null, null],
      createDate: '',
      page: page,
      limit: limit,
      order: state?.order,
      sortBy: state?.sortBy,
      isSortByClicked: false,
    });
    setOrderBy(defaultPageOrderBy);
    setConvertedCreatedRangeValue('');
    setConvertedCreatedDateValue([null, null]);
    handleRemoveFilterApplied();
  };

  // Check if any filter is applied then update the state variable
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });

    setIsOpenSelectBox({
      memberName: false,
      memberEmail: false,
      country: false,
      verified: false,
      activePeriod: false,
      socialAccounts: false,
      paymentMethods: false,
      previousOrders: false,
      farmUser: false,
      accessLevel: false,
      status: false,
      myHorseTracking: false,
      searchActivity: false,
      searchShare: false,
    });
  };

  //Email Exact/Partial Functionality
  const [isToggleClass, setIsToggleClass] = React.useState(true);
  const [isPartialToggleClass, setIsPartialToggleClass] = React.useState(false);
  const handleEmailToggle = (emailFilterType: string) => {
    setIsEmailExactSearch(!isEmailExactSearch);
    setStateValue({
      ...state,
      isEmailExactSearch: !isEmailExactSearch,
    });
    if (emailFilterType === 'exact') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    } else if (emailFilterType === 'partial') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    }
  };
  let toggleClass = state?.isEmailExactSearch ? 'matched-active' : 'matched-inactive';
  let partialToggleClass = !state?.isEmailExactSearch ? 'matched-active' : 'matched-inactive';

  //Name Exact/Partial Functionality
  const [isNameToggleClass, setIsNameToggleClass] = React.useState(true);
  const [isNamePartialToggleClass, setIsNamePartialToggleClass] = React.useState(false);
  const handleNameToggle = (nameFilterType: string) => {
    setIsNameExactSearch(!isNameExactSearch);
    setStateValue({
      ...state,
      isNameExactSearch: !isNameExactSearch,
    });
    if (nameFilterType === 'exact') {
      setIsNameToggleClass(!isNameToggleClass);
      setIsNamePartialToggleClass(!isNamePartialToggleClass);
    } else if (nameFilterType === 'partial') {
      setIsNameToggleClass(!isNameToggleClass);
      setIsNamePartialToggleClass(!isNamePartialToggleClass);
    }
  };
  let toggleNameClass = state?.isNameExactSearch ? 'matched-active' : 'matched-inactive';
  let partialToggleNameClass = !state?.isNameExactSearch ? 'matched-active' : 'matched-inactive';

  // Check if any filter is applied
  const checkFilterApplied = () => {
    if (
      state?.emailAddress ||
      state?.name ||
      state?.countryId != null ||
      state?.verified != 'none' ||
      dateHypenConvert(convertedCreatedDateValue[1]) !== undefined ||
      state?.socialAccounts != 'none' ||
      state?.paymentMethods != 'none' ||
      state?.previousOrders?.Name != null ||
      state?.farmUser != 'none' ||
      state?.accessLevel != 'none' ||
      state?.status != 'none' ||
      state?.myHorseTracking != 'none' ||
      state?.searchActivity != 'none' ||
      state?.searchShare != 'none'
    ) {
      return false;
    } else {
      return true;
    }
  };

  React.useEffect(() => {
    props.handleOpenFilterParam(open);
  }, [open]);

  return (
    <StyledEngineProvider injectFirst>
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal members-leftbar"
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
              <Typography variant="h3">{rowCount} Members</Typography>
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

          <Box className="edit-section" pt={4}>
            {open && (
              <Box>
                <Accordion
                  defaultExpanded={true}
                  onChange={handleChange('panel1')}
                  className="accordionDrawer"
                >
                  <AccordionSummary
                    expandIcon={<KeyboardArrowDownRoundedIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Box py={2}>
                      <Typography variant="h4">Personal Filters</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {/* Email textbox  with uption to choose either exact/partial search */}
                    <Box className="FormGroup" sx={{ marginBottom: '0px !important' }}>
                      <TextField
                        name="emailAddress"
                        placeholder="Email Address"
                        value={state?.emailAddress}
                        onChange={(e) => handleChangeField('emailAddress', e.target.value)}
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
                                  onClick={() => handleEmailToggle('exact')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.Aa} alt="Aa" />
                                </IconButton>

                                <IconButton
                                  className={`matchcase-second ${partialToggleClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleEmailToggle('partial')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.ab} alt="ab" />
                                </IconButton>
                              </InputAdornment>
                            </>
                          ),
                        }}
                      />
                      {/* Name textbox  with uption to choose either exact/partial search */}
                      <TextField
                        name="name"
                        placeholder="Name"
                        value={state?.name}
                        onChange={(e) => handleChangeField('name', e.target.value)}
                        onKeyDown={handleSelectKeyDown}
                        className="edit-field matchcasetext"
                        autoComplete="off"
                        InputProps={{
                          endAdornment: (
                            <>
                              <InputAdornment position="start" className="matchcase">
                                <IconButton
                                  className={`matchcase-first ${toggleNameClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleNameToggle('exact')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.Aa} alt="Aa" />
                                </IconButton>

                                <IconButton
                                  className={`matchcase-second ${partialToggleNameClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleNameToggle('partial')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.ab} alt="ab" />
                                </IconButton>
                              </InputAdornment>
                            </>
                          ),
                        }}
                      />
                      {/* Country selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Autocomplete
                          disablePortal
                          popupIcon={<KeyboardArrowDownRoundedIcon />}
                          options={countriesList || []}
                          getOptionLabel={(option: any) => option?.countryName}
                          renderInput={(params) => (
                            <TextField {...params} placeholder={`Select Country`} />
                          )}
                          value={state?.countryName ? state?.countryName : null}
                          onChange={(e: any, selectedOptions: any) => {
                            setStateValue({
                              ...state,
                              countryId: selectedOptions?.countryId,
                              countryName: selectedOptions,
                            });
                          }}
                          className="mareBlockInput"
                        />
                      </Box>

                      {/* Verified selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, verified: false }),
                          }}
                          open={isOpenSelectBox.verified}
                          onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, verified: true })}
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, verified: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          onChange={(e) => handleChangeField('verified', e.target.value)}
                          value={state?.verified}
                          className="filter-slct"
                        >
                          <MenuItem className="selectDropDownList" value={'none'} disabled>
                            <em>Verified</em>
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="yes">
                            Yes
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="no">
                            No
                          </MenuItem>
                        </Select>
                      </Box>

                      {/* Active period Date range */}
                      <Box className="edit-field calender-wrapper" onKeyDown={handleSelectKeyDown}>
                        <CustomFilterRangePicker
                          placeholderText="Active Period"
                          convertedDateRangeValue={convertedCreatedRangeValue}
                          setConvertedDateRangeValue={setConvertedCreatedRangeValue}
                          convertedDateValue={convertedCreatedDateValue}
                          setConvertedYobDateValue={setConvertedCreatedDateValue}
                          handleSelectKeyDown={handleSelectKeyDown}
                        />
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  defaultExpanded={true}
                  onChange={handleChange('panel2')}
                  className="accordionDrawer"
                >
                  <AccordionSummary
                    expandIcon={<KeyboardArrowDownRoundedIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Box py={2}>
                      <Typography variant="h4">Advanced Filters</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box className="FormGroup" sx={{ marginBottom: '0px !important' }}>
                      {/* Social account selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, socialAccounts: false }),
                          }}
                          open={isOpenSelectBox.socialAccounts}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, socialAccounts: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, socialAccounts: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          onChange={(e) => handleChangeField('socialAccounts', e.target.value)}
                          value={state?.socialAccounts}
                          name="socialAccounts"
                          className="filter-slct"
                        >
                          <MenuItem className="selectDropDownList" value={'none'} disabled>
                            <em>Social Accounts</em>
                          </MenuItem>
                          {socialLinksData?.map(({ id, socialLinkName }) => (
                            <MenuItem className="selectDropDownList" value={id} key={id}>
                              {socialLinkName}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>

                      {/* Payment method selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, paymentMethods: false }),
                          }}
                          open={isOpenSelectBox.paymentMethods}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, paymentMethods: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, paymentMethods: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          value={state?.paymentMethods}
                          onChange={(e) => handleChangeField('paymentMethods', e.target.value)}
                          className="filter-slct"
                          name="paymentMethods"
                        >
                          <MenuItem className="selectDropDownList" value={'none'} disabled>
                            <em>Payment Methods</em>
                          </MenuItem>
                          {paymentMethodsData?.map(({ id, paymentMethod }) => (
                            <MenuItem className="selectDropDownList" value={id} key={id}>
                              {paymentMethod}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>

                      {/* Previous order selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Autocomplete
                          disablePortal
                          popupIcon={<KeyboardArrowDownRoundedIcon />}
                          options={memberfilterConstants?.previousOrderList || []}
                          getOptionLabel={(option: any) => option?.Name}
                          renderInput={(params) => (
                            <TextField {...params} placeholder={`Previous Orders`} />
                          )}
                          value={state?.previousOrders ? state?.previousOrders : null}
                          onChange={(e: any, selectedOptions: any) =>
                            handleChangeField('previousOrders', selectedOptions)
                          }
                          className="mareBlockInput"
                        />
                      </Box>

                      {/* Farm user selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, farmUser: false }),
                          }}
                          open={isOpenSelectBox.farmUser}
                          onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, farmUser: true })}
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, farmUser: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          value={state?.farmUser}
                          onChange={(e) => handleChangeField('farmUser', e.target.value)}
                          className="filter-slct"
                          name="farmUser"
                        >
                          <MenuItem className="selectDropDownList" value={'none'} disabled>
                            <em>Farm User</em>
                          </MenuItem>
                          {memberfilterConstants?.farmUserList?.map(({ id, Name }) => {
                            return (
                              <MenuItem
                                className="selectDropDownList countryDropdownList"
                                value={Name}
                                key={id}
                              >
                                {Name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </Box>

                      {/* if farm user is selected as Yes, Access Level selectbox */}
                      {state?.farmUser === 'Yes' && (
                        <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                          <Select
                            MenuProps={{
                              ...MenuPropss,
                              onClose: () =>
                                setIsOpenSelectBox({ ...isOpenSelectBox, accessLevel: false }),
                            }}
                            open={isOpenSelectBox.accessLevel}
                            onOpen={() =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, accessLevel: true })
                            }
                            onClose={() =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, accessLevel: false })
                            }
                            IconComponent={KeyboardArrowDownRoundedIcon}
                            value={state?.accessLevel}
                            onChange={(e) => handleChangeField('accessLevel', e.target.value)}
                            className="filter-slct"
                            name="permissionLevel"
                          >
                            <MenuItem className="selectDropDownList" value={'none'} disabled>
                              <em>Access Level</em>
                            </MenuItem>
                            {selectaccesslevel?.map(({ id, accessName }) => {
                              return (
                                <MenuItem
                                  className="selectDropDownList countryDropdownList"
                                  value={id}
                                  key={id}
                                >
                                  {accessName}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </Box>
                      )}

                      {/* Status selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, status: false }),
                          }}
                          open={isOpenSelectBox.status}
                          onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, status: true })}
                          onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, status: false })}
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          value={state?.status}
                          onChange={(e) => handleChangeField('status', e.target.value)}
                          className="filter-slct"
                          name="status"
                        >
                          <MenuItem className="selectDropDownList" value={'none'} disabled>
                            <em>Status</em>
                          </MenuItem>
                          {memberStatusList?.map((value: any) => {
                            return (
                              <MenuItem
                                className="selectDropDownList"
                                value={value.id}
                                key={value.id}
                              >
                                {value.statusName}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  defaultExpanded={true}
                  onChange={handleChange('panel3')}
                  className="accordionDrawer"
                >
                  <AccordionSummary
                    expandIcon={<KeyboardArrowDownRoundedIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Box py={2}>
                      <Typography variant="h4">Engagement Filters</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box className="FormGroup" sx={{ marginBottom: '0px !important' }}>
                      {/* My horse tracking selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, myHorseTracking: false }),
                          }}
                          open={isOpenSelectBox.myHorseTracking}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, myHorseTracking: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, myHorseTracking: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          value={state?.myHorseTracking}
                          onChange={(e) => handleChangeField('myHorseTracking', e.target.value)}
                          className="filter-slct"
                          name="myHorseTracking"
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>My Horse Tracking</em>
                          </MenuItem>
                          {memberfilterConstants?.horseTrackingList?.map(({ id, Name }) => {
                            return (
                              <MenuItem className="selectDropDownList" value={id} key={id}>
                                {Name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </Box>

                      {/* Search activity selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, searchActivity: false }),
                          }}
                          open={isOpenSelectBox.searchActivity}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, searchActivity: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, searchActivity: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          value={state?.searchActivity}
                          onChange={(e) => handleChangeField('searchActivity', e.target.value)}
                          className="filter-slct"
                          name="searchActivity"
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Search Activity</em>
                          </MenuItem>
                          {memberfilterConstants?.searchActivityList?.map(({ id, Name }) => {
                            return (
                              <MenuItem className="selectDropDownList" value={Name} key={id}>
                                {Name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </Box>

                      {/* Search share selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, searchShare: false }),
                          }}
                          open={isOpenSelectBox.searchShare}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, searchShare: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, searchShare: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          value={state?.searchShare}
                          onChange={(e) => handleChangeField('searchShare', e.target.value)}
                          className="filter-slct"
                          name="searchShare"
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Search Share</em>
                          </MenuItem>
                          {socialShareData?.map((v: any, i: number) => {
                            return (
                              <MenuItem className="selectDropDownList" value={v?.id} key={v?.id}>
                                {v?.socialShareType}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>
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
            )}
          </Box>
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
}

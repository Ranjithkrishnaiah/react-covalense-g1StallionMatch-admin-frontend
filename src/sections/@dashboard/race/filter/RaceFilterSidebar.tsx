import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack, InputAdornment, Checkbox } from '@mui/material';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { range } from '../../../../utils/formatYear';
import Scrollbar from '../../../../components/Scrollbar';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import "src/sections/@dashboard/css/filter.css";
import FormControlLabel from '@mui/material/FormControlLabel';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Slider from '@mui/material/Slider';
import { useRaceStatusIsImportrdQuery, useRaceClassQuery, useRaceStatusAPIStatusQuery, useRaceTrackConditionQuery, useRaceTrackTypeQuery, useRaceTypeQuery, useRaceVenueQuery, useRaceStatusQuery } from 'src/redux/splitEndpoints/raceSplit';
import { Images } from 'src/assets/images';
import VenuAutoFilters from 'src/components/VenuAutoFilters';
import { dateHypenConvert } from 'src/utils/customFunctions';
import { DateRange } from 'src/@types/dateRangePicker';
import { useLocation, useNavigate, useParams } from 'react-router';
import { toPascalCase } from 'src/utils/customFunctions';
import { PATH_DASHBOARD } from 'src/routes/paths';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import ListItemText from '@mui/material/ListItemText';

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

const RaceFilterSidebar = React.forwardRef((props: any, ref: any) => {

  const { handleFilter, handleFilterApplied, handleRemoveFilterApplied, rowCount, page, limit, setIsSearchClicked, setOrder: setOrderDup } = props;
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const yob = range(1900, 2050);
  const [orderBy, setOrderBy] = React.useState('raceId');
  const [order, setOrder] = React.useState('ASC');
  const [isDistanceSliderClicked, setIsDistanceSliderClicked] = React.useState<boolean>(false);
  const [isIncludeEmptyFieldClicked, setIsIncludeEmptyFieldClicked] = React.useState<boolean>(false);
  const [isincludeEmptyFieldSize, setIsincludeEmptyFieldSize] = React.useState<boolean>(false);
  const [isFieldSizeClicked, setIsFieldSizeClicked] = React.useState<boolean>(false);
  const [isClearAutoComplete, setIsClearComplete] = React.useState(false);
  const { pathname } = useLocation();
  const { name = '', horse = '', type = '', raceid = '' } = useParams();
  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  const { data: countriesList } = useCountriesQuery();
  const [state, setStateValue] = React.useState<any>({
    page: page,
    limit: limit,
    sortBy: orderBy,
    order: order,
    displayName: name,
    date: null,
    country: 'none',
    class: 'none',
    venue: '',
    trackType: 'none',
    trackCondition: 'none',
    status: 'none',
    racetype: 'none',
    distanceRange: '',
    fieldSize: '',
    isDisplayNameExactSearch: true,
    includeEmptyField: false,
    includeEmptyFieldSize: false,
    isEligible: 'none',
    countryId: [],
    includedFee: false,
    venuDisplay: '',
    horseId: horse,
    raceId: raceid
  });
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

  // Set the filter from URL's
  React.useEffect(() => {
    let isFilter = false;
    if (name) {
      isFilter = pathname.includes('filter');
    }
    if (horse) {
      isFilter = pathname.includes('horsefilter');
    }
    if (type) {
      isFilter = pathname.includes('typefilter');
    }
    if (raceid) {
      isFilter = pathname.includes('raceFilter');
    }
    if (isFilter) {
      handleFilterData();
    }
  }, [])

  // Call the parent component clear function
  React.useImperativeHandle(ref, () => ({
    handleClearFilter() {
      clearFilter();
    }
  }))

  // Open filter drawer
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };

  // Close filter drawer
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Change filter states
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue
    })
    if (type === 'countryId') {
      setStateValue({
        ...state,
        [type]: typeof targetValue === 'string' ? targetValue.split(',') : targetValue,
        venue: '', venuDisplay: ''
      })
    }
    if (type === 'includeEmptyField') {
      setIsIncludeEmptyFieldClicked(true);
    }
    if (type === 'includeEmptyFieldSize') {
      setIsincludeEmptyFieldSize(true);
    }
    setIsOpenSelectBox({
      ...isOpenSelectBox,
      [type]: false // Close only the specific Select box
    });
  }

  const { data: trackConditionList } = useRaceTrackConditionQuery();
  const { data: trackTypeList } = useRaceTrackTypeQuery();
  const { data: raceTypeList } = useRaceTypeQuery();
  const { data: raceClassList } = useRaceClassQuery();
  // const { data: raceAPIStatus } = useRaceStatusAPIStatusQuery();
  const { data: raceStatusList } = useRaceStatusQuery();
  // const { data: raceIsImportrd } = useRaceStatusIsImportrdQuery();

  const [dateValue, setDateValue] = React.useState<any>(null);
  const [venue, setVenue] = React.useState(null);
  const [isExist, setIsExist] = React.useState(false);
  const [createDateSortSelected, setCreateDateSortSelected] = React.useState("");
  const [createDateValue, setCreateDateValue] = React.useState<DateRange>([null, null]);
  const [createDate, setCreateDate] = React.useState<DateRange>([null, null]);
  const [value2, setValue2] = React.useState<number[]>([800, 3400]);
  const [value3, setValue3] = React.useState<number[]>([1, 100]);
  const [isToggleClass, setIsToggleClass] = React.useState(true);
  const [isPartialToggleClass, setIsPartialToggleClass] = React.useState(false);
  const minDistance = 5;
  let toggleClass = (isToggleClass) ? 'matched-active' : 'matched-inactive';
  let partialToggleClass = (isPartialToggleClass) ? 'matched-active' : 'matched-inactive';

  // return slider value
  function valuetext(value: number) {
    return `${value}°C`;
  }

  // handle distance slider
  const handleChange2 = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        setValue2([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setValue2([clamped - minDistance, clamped]);
      }
    } else {
      setValue2(newValue as number[]);
    }
    setIsDistanceSliderClicked(true);
  };

  // return slider value for Field Size
  function valuetext1(value: number) {
    return `${value}°C`;
  }

  // handle Field Size slider
  const handleChange3 = (
    event: Event,
    newValue: number | number[],
    activeThumb: number,
  ) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        setValue3([clamped, clamped + minDistance]);
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setValue3([clamped - minDistance, clamped]);
      }
    } else {
      setValue3(newValue as number[]);
    }
    setIsFieldSizeClicked(true);
  };

  // Handle partial and full search key
  const handleFarmNameToggle = (nameFilterType: string) => {
    setStateValue({
      ...state,
      isDisplayNameExactSearch: !state.isDisplayNameExactSearch
    });
    if (nameFilterType === 'exact') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    } else if (nameFilterType === 'partial') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    }
  };

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    displayName: false,
    date: false,
    countryId: false,
    class: false,
    venue: false,
    trackType: false,
    trackCondition: false,
    status: false,
    racetype: false,
    isEligible: false,
  });

  // console.log(state,'State')
  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(e, state, 'State');
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        displayName: false,
        date: false,
        countryId: false,
        class: false,
        venue: false,
        trackType: false,
        trackCondition: false,
        status: false,
        racetype: false,
        isEligible: false,
      });
    }
  };

  // Clear filter
  const clearFilter = () => {
    setStateValue({
      page: page,
      limit: limit,
      sortBy: orderBy,
      order: order,
      displayName: '',
      date: null,
      country: 'none',
      class: 'none',
      venue: '',
      trackType: 'none',
      trackCondition: 'none',
      status: 'none',
      racetype: 'none',
      distanceRange: '',
      fieldSize: '',
      isDisplayNameExactSearch: true,
      includeEmptyField: false,
      includeEmptyFieldSize: false,
      isEligible: 'none',
      countryId: [],
      includedFee: false,
      venuDisplay: '',
      horseId: '',
      raceId: '',
    })
    setIsClearComplete(false);
    setValue2([800, 3400]);
    setValue3([1, 100]);
    setDateValue(null);
    setIsDistanceSliderClicked(false);
    setIsIncludeEmptyFieldClicked(false);
    setIsincludeEmptyFieldSize(false);
    setIsFieldSizeClicked(false);
    setCreateDateSortSelected("");
    setCreateDateValue([null, null]);
    setCreateDate([null, null]);
    handleRemoveFilterApplied();
    setIsClearComplete(true);
    setTimeout(() => {
      setIsClearComplete(false);
    }, 1000);
    // handleDrawerClose();
    navigate(PATH_DASHBOARD.race.data);
    setIsToggleClass(true);
    setIsPartialToggleClass(false);
  }


  // Apply filter
  const handleFilterData = () => {
    const data = {
      ...({ page: 1 }),
      ...({ limit: limit }),
      ...(state.displayName !== '' && { displayName: state.displayName }),
      ...(state.countryId.length !== 0 && { countryId: String(state?.countryId).split(',') }),
      ...(state.class !== 'none' && { class: state.class }),
      ...(state.racetype !== 'none' && { racetype: state.racetype }),
      ...(state.venue !== '' && { venue: state.venue }),
      ...(state.trackType !== 'none' && { trackType: state.trackType }),
      ...(state.trackCondition !== 'none' && { trackCondition: state.trackCondition }),
      ...(state.status !== 'none' && { status: state.status }),
      ...(state.horseId !== '' && { horseId: state.horseId }),
      ...(state.isEligible !== 'none' && { isEligible: state.isEligible }),
      distanceRange: value2.join('-'),
      fieldSize: value3.join('-'),
      ...({ sortBy: props.orderBy }),
      ...(props.orderBy === 'raceDate' && { order: 'DESC' }),
      ...(isIncludeEmptyFieldClicked && { includeEmptyField: state?.includeEmptyField }),
      ...(isincludeEmptyFieldSize && { includeEmptyFieldSize: state?.includeEmptyFieldSize }),
      ...(state.displayName !== '' && { isDisplayNameExactSearch: state.isDisplayNameExactSearch }),
      ...(state.raceId !== '' && { raceId: state.raceId }),
      ...((type !== '' && type === 'totalWins') && { winner: 'yes' }),
      ...((type !== '' && type === 'totalStakeWins') && { stakes: 'yes' }),
      ...(dateHypenConvert(createDate[1]) !== undefined && { date: dateHypenConvert(createDate[0]) + "/" + dateHypenConvert(createDate[1]) }),
    }
    handleFilter(data);
    handleFilterApplied();
    setIsSearchClicked(true);
    handleDrawerClose();
    if (props.orderBy === 'raceDate') {
      setOrderDup('DESC');
    }
  };

  // Check if filter is applied or not based on that disabled the search button
  const checkFilterApplied = () => {
    if (
      state?.displayName ||
      state?.countryId.length !== 0 ||
      state?.class != 'none' ||
      dateHypenConvert(createDate[1]) !== undefined ||
      state?.racetype != 'none' ||
      state?.venue != '' ||
      state?.trackType != 'none' ||
      state?.trackCondition != 'none' ||
      state?.status != 'none' ||
      state?.isEligible != 'none' ||
      isDistanceSliderClicked ||
      isFieldSizeClicked ||
      isIncludeEmptyFieldClicked ||
      isincludeEmptyFieldSize
    ) {
      return false
    } else {
      return true
    }
  };

  // Set venue state
  const handleVenuChange = (val: any) => {
    const updatedData = { ...state, ...val }
    setStateValue(updatedData)
  }

  return (
    <StyledEngineProvider injectFirst>
      {/* Race filter form */}
      <Drawer variant="permanent" open={open} className="filter-section DrawerLeftModal race-leftbar">
        <Scrollbar
          className='filter-scrollbar'
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          <DrawerHeader className='filter-drawer-head'>
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">{rowCount} Races</Typography>
              <Button className="clearBtn" onClick={clearFilter}>Clear all</Button>
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
              <Box className='FormGroup'>

                <TextField name="displayName" placeholder='Name'
                  value={state?.displayName}
                  onChange={(e) => handleChangeField("displayName", e.target.value)}
                  onKeyDown={handleSelectKeyDown}
                  className='edit-field matchcasetext' autoComplete="off"
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="start" className='matchcase'>
                          <IconButton
                            className={`matchcase-first ${toggleClass}`}
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleFarmNameToggle('exact')}
                            sx={{ marginRight: '0px', padding: '0px' }}>
                            <img src={Images.Aa} alt='Aa' />
                          </IconButton>

                          <IconButton
                            className={`matchcase-second ${partialToggleClass}`}
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleFarmNameToggle('partial')}
                            sx={{ marginRight: '0px', padding: '0px' }}>
                            <img src={Images.ab} alt='ab' />
                          </IconButton>
                        </InputAdornment>
                      </>
                    )
                  }}
                />
                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select

                    MenuProps={{
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                      },
                      ...MenuPropss,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, countryId: false }),
                    }}
                    value={(state?.countryId.length === 0) ? [] : state?.countryId}

                    multiple
                    displayEmpty
                    // renderValue={
                    //   state?.countryId.length !== 0 ? undefined : () => <Placeholder><em>Country</em></Placeholder>
                    // }

                    renderValue={(selected: any) => {
                      if (selected?.length === 0) {
                        return <em>Country</em>;
                      }
                      return <em>View Selected Countries</em>;

                    }}

                    open={isOpenSelectBox.countryId}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, countryId: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, countryId: false })}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    onChange={(e) => handleChangeField("countryId", e.target.value)}
                    name="countryId" defaultValue="none" className="countryDropdown filter-slct">
                    <MenuItem className="selectDropDownList countryDropdownList" value="none" disabled><em>Country</em></MenuItem>
                    {countriesList?.map(({ id, countryName }) => {
                      return (
                        <MenuItem className="selectDropDownList reportSelectCountry country-mem settingDropDown" key={id} value={id} disableRipple>

                          <ListItemText primary={countryName} />
                          <Checkbox
                            checkedIcon={<img src={Images.checked} alt="checkbox" />}
                            icon={<img src={Images.unchecked} alt="checkbox" />}
                            checked={(state?.countryId || []).indexOf(id) > -1}
                            disableRipple
                          />
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Box>
                <Box className='calender-wrapper'>
                  <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                    <CustomFilterRangePicker
                      placeholderText="Date"
                      convertedDateRangeValue={createDateSortSelected}
                      setConvertedDateRangeValue={setCreateDateSortSelected}
                      convertedDateValue={createDate}
                      setConvertedYobDateValue={setCreateDate}
                    />
                  </Box>
                </Box>
                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuPropss,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, class: false }),
                    }}
                    open={isOpenSelectBox.class}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, class: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, class: false })}
                    value={state.class}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                    // {...register("class")}
                    onChange={(e) => handleChangeField("class", e.target.value)}
                    defaultValue="none" name="class">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Class</em></MenuItem>
                    {raceClassList?.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.displayName}</MenuItem>
                      )
                    })}
                  </Select>
                </Box>

                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <VenuAutoFilters
                    setFarmId={handleVenuChange}
                    state={state}
                    setStateValueId={(value: any) => setStateValue({ ...state, venue: value?.id, venuDisplay: value?.displayName, trackType: value?.trackTypeId })}
                    pageType={'stallionForm'}
                    isEdit={true}
                    isExist={isExist}
                    isOpen={open}
                    displayName={state.venuDisplay}
                    isClearAutoComplete={isClearAutoComplete}
                    resetFilters={clearFilter}
                    MenuPropss
                  />
                </Box>
                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuPropss,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, trackType: false })
                    }}
                    open={isOpenSelectBox.trackType}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, trackType: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, trackType: false })}
                    value={state.trackType}
                    onChange={(e) => handleChangeField("trackType", e.target.value)}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                    defaultValue="none" name="trackType">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Track Type</em></MenuItem>
                    {trackTypeList?.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.displayName}</MenuItem>
                      )
                    })}
                  </Select>
                </Box>

                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuPropss,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, trackCondition: false })
                    }}
                    open={isOpenSelectBox.trackCondition}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, trackCondition: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, trackCondition: false })}
                    onChange={(e) => handleChangeField("trackCondition", e.target.value)}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    value={state.trackCondition}
                    className="filter-slct"
                    defaultValue="none" name="trackCondition">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Track Condition</em></MenuItem>
                    {trackConditionList?.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList filterTrack" key={v.id} value={v.id}>{v.displayName}</MenuItem>
                      )
                    })}
                  </Select>
                </Box>
                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuPropss,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, status: false })
                    }}
                    open={isOpenSelectBox.status}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, status: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, status: false })}
                    value={state.status}
                    onChange={(e) => handleChangeField("status", e.target.value)}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                    defaultValue="none" name="status">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Race Status</em></MenuItem>
                    {raceStatusList?.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.displayName)}</MenuItem>
                      )
                    })}
                  </Select>
                </Box>
                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuPropss,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, racetype: false })
                    }}
                    open={isOpenSelectBox.racetype}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, racetype: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, racetype: false })}
                    onChange={(e) => handleChangeField("racetype", e.target.value)}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                    value={state.racetype}
                    defaultValue="none" name="racetype">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Race Type</em></MenuItem>
                    {raceTypeList?.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.displayName}</MenuItem>
                      )
                    })}
                  </Select>
                </Box>
                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuPropss,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, isEligible: false })
                    }}
                    open={isOpenSelectBox.isEligible}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, isEligible: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, isEligible: false })}
                    value={state.isEligible}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    onChange={(e) => handleChangeField("isEligible", e.target.value)} className="filter-slct" defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Eligible</em></MenuItem>
                    <MenuItem className="selectDropDownList" value="All">All</MenuItem>
                    <MenuItem className="selectDropDownList" value="Eligible">Eligible</MenuItem>
                    <MenuItem className="selectDropDownList" value="Ineligible">Ineligible</MenuItem>
                  </Select>
                </Box>
                <Box className='edit-field rangeSliderFilter' sx={{ marginBottom: "20px !important" }} onKeyDown={handleSelectKeyDown}>

                  <Box className='feerange'>
                    <label>
                      {' '}
                      Distance ({value2[0].toLocaleString()}m - {value2[1].toLocaleString()}m){' '}
                    </label>
                  </Box>

                  <Slider
                    getAriaLabel={() => 'Minimum distance shift'}
                    value={value2}
                    onChange={handleChange2}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                    disableSwap
                    max={3400}
                    min={800}
                  />
                  <Box className='RadioGroupWrapper' onKeyDown={handleSelectKeyDown}>
                    <FormControlLabel value="female" control={
                      <Checkbox
                        disableRipple
                        className='includeEmptyField'
                        name={'includeEmptyField'}
                        checked={state?.includeEmptyField}
                        onChange={(e: any) => handleChangeField("includeEmptyField", e.target.checked)}
                        key={'includePrivateFees'}
                        checkedIcon={<img src={Images.Radiochecked} />}
                        icon={<img src={Images.Radiounchecked} />}
                      />
                    } label="Include Empty fields" />
                  </Box>
                </Box>

                <Box className='edit-field rangeSliderFilter' sx={{ marginTop: "0px !important" }} onKeyDown={handleSelectKeyDown}>

                  <Box className='feerange'>
                    <label>
                      {' '}
                      Field Size  ({value3[0].toLocaleString()} - {value3[1].toLocaleString()}){' '}
                    </label>
                  </Box>
                  <Slider
                    getAriaLabel={() => 'Minimum distance shift'}
                    value={value3}
                    onChange={handleChange3}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext1}
                    disableSwap
                    min={1}
                  />

                  <Box className='RadioGroupWrapper' onKeyDown={handleSelectKeyDown}>
                    <FormControlLabel value="female" control={
                      <Checkbox
                        disableRipple
                        className='includeEmptyFieldSize'
                        name={'includeEmptyFieldSize'}
                        checked={state?.includeEmptyFieldSize}
                        onChange={(e: any) => handleChangeField("includeEmptyFieldSize", e.target.checked)}
                        key={'includeEmptyFieldSize'}
                        checkedIcon={<img src={Images.Radiochecked} />}
                        icon={<img src={Images.Radiounchecked} />}
                      />
                    } label="Include Empty fields" />
                  </Box>
                </Box>
              </Box>
              <Stack sx={{ mt: 2 }} className='DrawerBtnWrapper'>
                <Button onClick={handleFilterData} disabled={checkFilterApplied()} className="search-btn" fullWidth>
                  Search
                </Button>
              </Stack>
            </Box>
          </Box>}
        </Scrollbar>
      </Drawer>
      {/* End Race filter form */}
    </StyledEngineProvider >
  );
})

export default RaceFilterSidebar
const Placeholder = ({ children }: any) => {
  return <div>{children}</div>;
};
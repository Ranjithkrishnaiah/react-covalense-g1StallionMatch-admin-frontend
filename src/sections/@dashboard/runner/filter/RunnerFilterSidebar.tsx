import * as React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
// mui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack, Checkbox, InputAdornment } from '@mui/material';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Slider from '@mui/material/Slider';

import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useBreedQuery } from 'src/redux/splitEndpoints/breedSplit';
import { PATH_DASHBOARD } from 'src/routes/paths';

import "src/sections/@dashboard/css/filter.css";
import Scrollbar from '../../../../components/Scrollbar';
import { range } from '../../../../utils/formatYear';
import { Images } from 'src/assets/images';
import { MenuProps } from 'src/constants/MenuProps';
import { DateRange } from 'src/@types/dateRangePicker';
import { dateHypenConvert } from 'src/utils/customFunctions';
import AutocompleteMultiSelectChip from 'src/components/AutocompleteMultiSelectChip';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';

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

const RunnerFilterSidebar = React.forwardRef((props: any, ref: any) => {
  const minDistance = 5;
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [isFilterApply, setIsFilterApply] = React.useState(false);
  const { handleFilter, handleFilterApplied, handleRemoveFilterApplied, rowCount, page, limit, order, orderBy, defaultPageOrderBy } = props;
  const [isIncludedFeeActive, setIsIncludedFeeActive] = React.useState(false);
  const yob = range(1900, 2050);
  const { pathname } = useLocation();
  const { raceid = '', runnerName = '' } = useParams();
  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  const [currency, setCurrency] = React.useState<any>('');
  const [dateValue, setDateValue] = React.useState(null);
  const [isFilterCleared, setIsFilterCleared] = React.useState(false);
  const [createDateSortSelected, setCreateDateSortSelected] = React.useState("");
  const [createDateValue, setCreateDateValue] = React.useState<DateRange>([null, null]);
  const [createDate, setCreateDate] = React.useState<DateRange>([null, null]);
  const [value3, setValue3] = React.useState<number[]>([0, 200000]);
  const [state, setStateValue] = React.useState<any>({
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
    stakes: [],
    position: [],
    includeEmptyField: false,
    countryId: [],
    date: null,
    country: 'none',
    priceRange: '',
    breed: 'none',
    currencyId: 'none',
    rating: 'none',
    age: '',
    name: runnerName,
    isNameExactSearch: true,
    sire: '',
    isSireExactSearch: true,
    dam: '',
    isDamExactSearch: true,
    raceId: raceid
  });

  const { data: countriesList } = useCountriesQuery();
  const { data: currenciesList } = useCurrenciesQuery();
  const { data: breedList } = useBreedQuery();

  // Set the filter from URL's
  React.useEffect(() => {
    let isFilter = false;
    if (raceid) {
      isFilter = pathname.includes('filter');
    }
    if (runnerName) {
      isFilter = pathname.includes('runnerfilter');
    }
    if (isFilter) {
      handleFilterData();
    }
  }, [])

  // Call the parent component clear function
  React.useImperativeHandle(ref, () => ({
    handleClearFilter() {
      setOpen(false);
      setIsDisplayBox(false);
      clearFilter();
    }
  }))

  // Open Drawer
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };

  // Close Drawer
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Check if filter is applied or not based on that disabled the search button
  const checkFilterApplied = () => {
    if (
      state?.name ||
      state?.countryId.length !== 0 ||
      dateHypenConvert(createDate[1]) !== undefined ||
      state?.position?.length != 0 ||
      state?.stakes?.length !== 0 ||
      value3.join('-') !== '0-200000' ||
      state?.currencyId != 'none' ||
      state?.breed != 'none' ||
      state?.rating != 'none' ||
      state?.sire != '' ||
      state?.dam != '' ||
      state?.age != '' ||
      state?.includeEmptyField
    ) {
      return false
    } else {
      return true
    }
  };

  // Apply filter
  const handleFilterData = () => {
    const data = {
      ...({ page: 1 }),
      ...({ limit: limit }),
      ...({ sortBy: (state?.isSortByClicked) ? orderBy : defaultPageOrderBy }),
      ...(state.position?.length !== 0 && { position: state.position }),
      ...(state.stakes?.length !== 0 && { stakes: state.stakes }),
      ...(state.countryId.length !== 0 && { countryId: String(state?.countryId).split(',') }),
      ...(value3.join('-') !== '0-200000' && { priceRange: value3.join('-') }),
      ...(state.currencyId !== 'none' && { currencyId: state.currencyId }),
      ...(state.breed !== 'none' && { breed: state.breed }),
      ...(state.rating !== 'none' && { rating: state.rating }),
      ...(state.name !== '' && { name: state.name }),
      ...(state.name !== '' && { isNameExactSearch: state.isNameExactSearch }),
      ...(state.sire !== '' && { sire: state.sire }),
      ...(state.sire !== '' && { isSireExactSearch: state.isSireExactSearch }),
      ...(state.dam !== '' && { dam: state.dam }),
      ...(state.dam !== '' && { isDamExactSearch: state.isDamExactSearch }),
      ...(state.age !== '' && { age: state.age }),
      ...(state.raceId !== '' && { raceId: state.raceId }),
      ...(isIncludedFeeActive && { includeEmptyField: state?.includeEmptyField }),
      ...(dateHypenConvert(createDate[1]) !== undefined && { date: dateHypenConvert(createDate[0]) + "/" + dateHypenConvert(createDate[1]) }),
    }
    handleFilter(data);
    handleFilterApplied();
    props.setIsSearchClicked(true);
    setIsFilterApply(true);
    handleDrawerClose();
  };

  // return slider value for Field Size
  function valuetext1(value: number) {
    return `${value}°C`;
  }

  // Handle pricing slider
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
  };

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    name: false,
    countryId: false,
    rating: false,
    breed: false,
    currencyId: false
  });

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        name: false,
        countryId: false,
        rating: false,
        breed: false,
        currencyId: false
      });
    }
  };
  // Clear filter
  const clearFilter = () => {
    setIsFilterCleared(true);
    setStateValue({
      page: page,
      limit: limit,
      order: order,
      sortBy: orderBy,
      stakes: [],
      position: [],
      includeEmptyField: false,
      countryId: [],
      date: null,
      country: 'none',
      priceRange: '',
      breed: 'none',
      currencyId: 'none',
      rating: 'none',
      age: '',
      name: '',
      isNameExactSearch: true,
      sire: '',
      isSireExactSearch: true,
      dam: '',
      raceId: '',
      isDamExactSearch: true,
    })
    setCreateDateSortSelected("");
    setCreateDateValue([null, null]);
    setCreateDate([null, null]);
    setDateValue(null);
    setValue3([0, 200000]);
    handleRemoveFilterApplied();
    setOpen(false);
    setIsDisplayBox(false);
    setIsFilterApply(false);
    navigate(PATH_DASHBOARD.runnerdetails.data);
  }

  // Handle form state's
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue
    })
    if (type === 'includeEmptyField') {
      setIsIncludedFeeActive(true);
    }
    if (type === 'currencyId') {
      let selectedCr = currenciesList?.filter((v, i) => v.id === targetValue)[0];
      setCurrency(selectedCr);
    }
    setIsOpenSelectBox({
      ...isOpenSelectBox,
      [type]: false // Close only the specific Select box
    });
  }

  // Handle Partial search key for all
  const handleNameToggle = (key: any, value: any, nameFilterType: string) => {
    setStateValue({
      ...state,
      [key]: !value
    });
  };

  return (
    <StyledEngineProvider injectFirst>
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal runner-leftbar"
        ModalProps={{
          keepMounted: true,
        }}
      >
        <Scrollbar
          className='filter-scrollbar'
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          <DrawerHeader className='filter-drawer-head'>
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">{rowCount} Results</Typography>
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
          <Box className={`${open ? '' : 'hide'}`}>
            <Box className='edit-section' pt={4} sx={{
              ...(!isDisplayBox && { display: 'none' }),
            }}>
              <Box className='FormGroup'>
                <TextField name="name"
                  placeholder='Name'
                  value={state.name}
                  onChange={(e) => handleChangeField("name", e.target.value)}
                  onKeyDown={handleSelectKeyDown}
                  className='edit-field matchcasetext'
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="start" className='matchcase'>
                          <IconButton
                            className={`matchcase-first ${(state.isNameExactSearch) ? 'matched-active' : 'matched-inactive'}`}
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleNameToggle('isNameExactSearch', state.isNameExactSearch, 'exact')}
                            sx={{ marginRight: '0px', padding: '0px' }}>
                            <img src={Images.Aa} alt='Aa' />
                          </IconButton>

                          <IconButton
                            className={`matchcase-second ${(!state.isNameExactSearch) ? 'matched-active' : 'matched-inactive'}`}
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleNameToggle('isNameExactSearch', state.isNameExactSearch, 'partial')}
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
                      ...MenuProps,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, countryId: false }),
                    }}
                    open={isOpenSelectBox.countryId}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, countryId: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, countryId: false })}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    name="countryId"
                    onChange={(e) => handleChangeField("countryId", e.target.value)}
                    value={(state?.countryId.length === 0) ? 'none' : state?.countryId}
                    className="countryDropdown filter-slct">
                    <MenuItem className="selectDropDownList countryDropdownList" value="none" disabled><em>Country</em></MenuItem>
                    {countriesList?.map(({ id, countryName }) => {
                      return (
                        <MenuItem className="selectDropDownList countryDropdownList" value={id} key={id}>{countryName}</MenuItem>
                      );
                    })}
                  </Select>
                </Box>
                <Box className='calender-wrapper' onKeyDown={handleSelectKeyDown}>
                  <Box className='edit-field'>
                    <CustomFilterRangePicker
                      placeholderText="Date"
                      convertedDateRangeValue={createDateSortSelected}
                      setConvertedDateRangeValue={setCreateDateSortSelected}
                      convertedDateValue={createDate}
                      setConvertedYobDateValue={setCreateDate}
                    />
                  </Box>
                </Box>
                <TextField
                  name="age"
                  value={state.age}
                  placeholder='Age'
                  onChange={(e) => handleChangeField("age", e.target.value)}
                  onKeyDown={handleSelectKeyDown}
                  className='edit-field'
                />
                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuProps,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, rating: false }),
                    }}
                    open={isOpenSelectBox.rating}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, rating: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, rating: false })}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    onChange={(e) => handleChangeField("rating", e.target.value)}
                    value={state?.rating}
                    className="filter-slct" name="promotedStatus">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Data Level Rating</em></MenuItem>
                    <MenuItem className="selectDropDownList" value="Poor" key="poor">Poor</MenuItem>
                    <MenuItem className="selectDropDownList" value="Good" key="good">Good</MenuItem>
                    <MenuItem className="selectDropDownList" value="Excellent" key="excellent">Excellent</MenuItem>
                    <MenuItem className="selectDropDownList" value="Outstanding" key="very-good">Outstanding</MenuItem>
                  </Select>
                </Box>
                
                <Box className='edit-field runnerStakes' onKeyDown={handleSelectKeyDown}>
                  {(isFilterApply ? true : open) && <AutocompleteMultiSelectChip placeholder={'RaceStake'} isFilterCleared={isFilterCleared} state={state} setStateValue={setStateValue} />}
                </Box>

                <Box className='edit-field runnerStakes' onKeyDown={handleSelectKeyDown}>
                  {(isFilterApply ? true : open) && <AutocompleteMultiSelectChip placeholder={'position'} isFilterCleared={isFilterCleared} state={state} setStateValue={setStateValue} />}
                </Box>
                <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuProps,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, breed: false }),
                    }}
                    open={isOpenSelectBox.breed}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, breed: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, breed: false })}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    onChange={(e) => handleChangeField("breed", e.target.value)} className="filter-slct" value={state?.breed} name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Breed</em></MenuItem>
                    {breedList && breedList.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.horseTypeName}</MenuItem>
                      )
                    })}
                  </Select>
                </Box>

                <TextField
                  name="Sire"
                  placeholder='Sire'
                  className='edit-field matchcasetext'
                  value={state.sire}
                  onKeyDown={handleSelectKeyDown}
                  onChange={(e) => handleChangeField("sire", e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="start" className='matchcase'>
                          <IconButton
                            className={`matchcase-first ${(state.isSireExactSearch) ? 'matched-active' : 'matched-inactive'}`}
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleNameToggle('isSireExactSearch', state.isSireExactSearch, 'exact')}
                            sx={{ marginRight: '0px', padding: '0px' }}>
                            <img src={Images.Aa} alt='Aa' />
                          </IconButton>

                          <IconButton
                            className={`matchcase-second ${(!state.isSireExactSearch) ? 'matched-active' : 'matched-inactive'}`}
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleNameToggle('isSireExactSearch', state.isSireExactSearch, 'partial')}
                            sx={{ marginRight: '0px', padding: '0px' }}>
                            <img src={Images.ab} alt='ab' />
                          </IconButton>
                        </InputAdornment>
                      </>
                    )
                  }}
                />
                <TextField
                  name="Dam"
                  placeholder='Dam'
                  className='edit-field matchcasetext'
                  value={state.dam}
                  onKeyDown={handleSelectKeyDown}
                  onChange={(e) => handleChangeField("dam", e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <>
                        <InputAdornment position="start" className='matchcase'>
                          <IconButton
                            className={`matchcase-first ${(state.isDamExactSearch) ? 'matched-active' : 'matched-inactive'}`}
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleNameToggle('isDamExactSearch', state.isDamExactSearch, 'exact')}
                            sx={{ marginRight: '0px', padding: '0px' }}>
                            <img src={Images.Aa} alt='Aa' />
                          </IconButton>

                          <IconButton
                            className={`matchcase-second ${(!state.isDamExactSearch) ? 'matched-active' : 'matched-inactive'}`}
                            aria-label="toggle password visibility"
                            edge="end"
                            onClick={() => handleNameToggle('isDamExactSearch', state.isDamExactSearch, 'partial')}
                            sx={{ marginRight: '0px', padding: '0px' }}>
                            <img src={Images.ab} alt='ab' />
                          </IconButton>
                        </InputAdornment>
                      </>
                    )
                  }}
                />

                <Box className='edit-field currencycoloum' onKeyDown={handleSelectKeyDown}>
                  <Select
                    MenuProps={{
                      ...MenuProps,
                      onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, currencyId: false }),
                    }}
                    open={isOpenSelectBox.currencyId}
                    onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, currencyId: true })}
                    onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, currencyId: false })}
                    value={state?.currencyId}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                    onChange={(e) => handleChangeField("currencyId", e.target.value)}
                    name="currencyId">
                    <MenuItem className="selectDropDownList" value="none" disabled selected><em>Currency</em></MenuItem>
                    {currenciesList?.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.currencyName}</MenuItem>
                      )
                    })}
                  </Select>
                </Box>
                <Box className='edit-field rangeSliderFilter' onKeyDown={handleSelectKeyDown}>

                  <Box className='feerange'>
                    <label>
                      {' '}
                      {currency && currency?.currencySymbol}{value3[0].toLocaleString()} - {currency && currency?.currencySymbol}{value3[1].toLocaleString()}{' '}
                    </label>
                  </Box>

                  <Slider
                    getAriaLabel={() => 'Minimum distance shift'}
                    value={value3}
                    onChange={handleChange3}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext1}
                    disableSwap
                    max={200000}
                    min={0}
                  />

                  <Box className='RadioGroupWrapper' onKeyDown={handleSelectKeyDown}>
                    <FormControlLabel value="female" control={
                      <Checkbox
                        disableRipple
                        className='includeEmptyField'
                        name={'includeEmptyField'}
                        checked={state?.includeEmptyField}
                        onChange={(e: any) => handleChangeField("includeEmptyField", e.target.checked)}
                        key={'includeEmptyField'}
                        checkedIcon={<img src={Images.Radiochecked} />}
                        icon={<img src={Images.Radiounchecked} />}
                      />
                    } label="Include Empty fields" />
                  </Box>
                </Box>
              </Box>
              <Stack sx={{ mt: 2 }} className='DrawerBtnWrapper'>
                <Button disabled={checkFilterApplied()} onClick={handleFilterData} className="search-btn" fullWidth>
                  Search
                </Button>
              </Stack>
            </Box>
          </Box>
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
})

export default RunnerFilterSidebar;
const Placeholder = ({ children }: any) => {
  // const classes = usePlaceholderStyles();
  return <div>{children}</div>;
};
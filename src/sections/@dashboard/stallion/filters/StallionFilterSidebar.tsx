import * as React from 'react';
import { styled, useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack, SelectChangeEvent, FormControlLabel, Radio, RadioGroup, Checkbox, InputAdornment } from '@mui/material';
// form
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { usePromotionstatusQuery } from 'src/redux/splitEndpoints/promotionstatusSplit';
import { useFeestatusQuery } from 'src/redux/splitEndpoints/feestatusSplit';
import { range } from "src/utils/formatYear";
import Scrollbar from 'src/components/Scrollbar';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { fNumber } from 'src/utils/formatNumber';
import { CustomRangeSlider } from 'src/components/CustomRangeslider';
import GrandSireAutoFilter from 'src/components/GrandSireAutoFilter';
import StallionSireAutoFilter from 'src/components/StallionSireAutoFilter';
import KeyByAncestorAutoComplete from 'src/components/KeyByAncestorAutoComplete';
import { Images } from 'src/assets/images';
import { useFeeupdatedbyQuery } from 'src/redux/splitEndpoints/feeUpdatedBySplit';
import { MenuProps } from 'src/constants/MenuProps';
import { dateHypenConvert } from 'src/utils/customFunctions';
import { useNavigate } from 'react-router-dom';
import { PATH_DASHBOARD } from 'src/routes/paths';
import "./index.css";
import { useGetCurrenciesMinMaxValueQuery, useStallionLocationsQuery } from 'src/redux/splitEndpoints/stallionsSplit';
import useCounter from 'src/hooks/useCounter';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';

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
    return ({
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
    });
  },
);

export default function StallionFilterSidebar(props: any) {
  const filterCounterhook = useCounter(0);
  const [isAutocompleteChoosen, setAutocompleteChoosen] = React.useState(
    {
      isSireChoosen: false,
      isGrandSireNameChoosen: false,
      isKeyAncestorChoosen: false,
      isDateChoosen: false,
    }
  );
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const { handleFilter, handleFilterApplied, rowCount, page, limit, handleRemoveFilterApplied, isFilterApplied, isSearchClicked, setIsSearchClicked, state, setStateValue, convertedCreatedRangeValue, setConvertedCreatedRangeValue, convertedCreatedDateValue, setConvertedCreatedDateValue, isFarmId, setIsFarmId, defaultPageOrderBy, setDefaultPageOrderBy, orderBy, setOrderBy,test } = props;
  
  const [valuesExist, setValuesExist] = React.useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = React.useState(false);
  const [stallionModuleAccess, setStallionModuleAccess] = React.useState({
    stallion_search: false,
    
  });

  // Check permission to access the member module
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  React.useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
      let list: any = [];
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: true,
          }));
        } else {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: false,
          }));
        }
      }
    }
  }, [isSuccessAccessLevel, isFetchingAccessLevel]);
  
  React.useEffect(() => {
    if (valuesExist.hasOwnProperty('STALLION_ADMIN_RUN_A_SEARCH_FOR_STALLIONS')) {
      setUserModuleAccess(true);
    }
    setStallionModuleAccess({
      ...stallionModuleAccess,
      stallion_search: !valuesExist?.hasOwnProperty('STALLION_ADMIN_RUN_A_SEARCH_FOR_STALLIONS')? false : true,
      // horse_list: !valuesExist?.hasOwnProperty('STALLION_ADMIN_VIEW_SHARE_FEE_HISTORY')? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  // Get all country api call
  const { data: countriesList } = useStallionLocationsQuery();

  // Get all currency api call
  const { data: currencyList } = useCurrenciesQuery();

  // Get all promotion status api call
  const { data: promotionStatusList } = usePromotionstatusQuery();

  // Get all fee status api call
  const { data: feeStatusList } = useFeestatusQuery();

  // Get all fee updatedby api call
  const { data: feeUpdatedByList } = useFeeupdatedbyQuery();
  const yob = range(1900, 2050);
  
  // Open and close filter sidebar
  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
    setIsDisplayBox(false);
  };

  const [currencySlider, setCurrencySlider] = React.useState<any>({});
  const [isCurrencyChanged, setIsCurrencyChanged] = React.useState<boolean>(false); 
  const [isSliderChanged, setIsSliderChanged] = React.useState<boolean>(false); 
  const [currency, setCurrency] = React.useState(1);
  const [minValue, setMinValue] = React.useState(0);
  const [maxValue, setMaxValue] = React.useState(1000000);   

  // Get Min and Max price slider api call
  const { data: CurrenciesMinMaxValue, isSuccess: isCurrenciesMinMaxvalueSuccess } = useGetCurrenciesMinMaxValueQuery(currencySlider, { skip: (!isCurrencyChanged) });
  
  const [isStallionNameExactSearch, setIsStallionNameExactSearch] = React.useState(state?.isStallionNameExactSearch);
  const [isFarmNameExactSearch, setIsFarmNameExactSearch] = React.useState(state?.isFarmNameExactSearch);
  const [sireId, setSireId] = React.useState('');
  const [grandSireName, setGrandSireName] = React.useState('');
  const [keyAncestor, setKeyAncestor] = React.useState('');
  const [selectedPriceRange, setSelectedPriceRage] = React.useState(state.price || [0, 1000000]);
  const [currencySymbol, setCurrencySymbol] = React.useState('$');
  const [price, setPrice] = React.useState(state.price || [0, 0]);
  const [isClearAutoComplete, setIsClearComplete] = React.useState(false);
  let isCountrySelected = false;
  React.useEffect(() => {
    if(isCurrenciesMinMaxvalueSuccess) {
      setPrice([CurrenciesMinMaxValue?.minPrice, CurrenciesMinMaxValue?.maxPrice]);
      setSelectedPriceRage([CurrenciesMinMaxValue?.minPrice, CurrenciesMinMaxValue?.maxPrice]);
      setMinValue(CurrenciesMinMaxValue?.minPrice || 0);
      setMaxValue(CurrenciesMinMaxValue?.maxPrice || 1000000);
    }
  }, [CurrenciesMinMaxValue,isCurrenciesMinMaxvalueSuccess]);

  React.useEffect(() => {
    props.handleOpenFilterParam(open);
  }, [open]);

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    stallionName: false,
    farmName: false,
    promotedStatus: false,
    feeUpdatedBy: false,
    promotedStartDate: false,
    country: false,
    stateId: false,
    serviceFee: false,
    currency: false,
    currencySlider: false,
    feeStatus: false,
    feeYear: false,
    isSire: false,
    isGrandSire: false,
    isKeyAncestor: false,
  });  

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        stallionName: false,
        farmName: false,
        promotedStatus: false,
        feeUpdatedBy: false,
        promotedStartDate: false,
        country: false,
        stateId: false,
        serviceFee: false,
        currency: false,
        currencySlider: false,
        feeStatus: false,
        feeYear: false,
        isSire: false,
        isGrandSire: false,
        isKeyAncestor: false,
      });
    }
  };
  
  // Set the filter data on Search button click event
  const handleFilterData = () => {
    const data = {
      ...({ page: 1 }),
      ...({ limit: limit }),
      ...({ order: state?.order }),
      ...({ sortBy: (state?.isSortByClicked) ? state?.sortBy : defaultPageOrderBy}),
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.farmName !== '' && { farmName: state?.farmName }),
      ...(state?.farmName !== '' && { isFarmNameExactSearch: isFarmNameExactSearch }),
      ...(state?.stallionName !== '' && { stallionName: state?.stallionName }),
      ...(state?.stallionName !== '' && { isStallionNameExactSearch: isStallionNameExactSearch }),
      ...(state?.promotedStatus !== 'none' && { promoted: state?.promotedStatus  }),
      ...(state?.countryId !== 'none' && { country: state?.countryId }),
      ...(countryStateList?.length > 0 && state?.stateId !== 'none' && { state: state?.stateId }),
      ...(state?.currency !== 'none' && { currency: state?.currency }),
      ...(state?.feeStatus !== 'none' && { feeStatus: state?.feeStatus }),
      ...(state?.feeUpdatedBy !== 'none' && { feeUpdatedBy: state?.feeUpdatedBy }),
      ...(state?.feeYear !== 'none' && { feeYear: state?.feeYear }),
      ...(sireId !== '' && { sireName: sireId }),
      ...(grandSireName !== '' && { GrandSireName: grandSireName }),
      ...(keyAncestor !== '' && { keyAncestor: keyAncestor }),
      ...(state?.isPrivateTouched && { includePrivateFee: state?.includedFee }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && { startDate: dateHypenConvert(convertedCreatedDateValue[0])+"/"+dateHypenConvert(convertedCreatedDateValue[1]) }),
      ...(isSliderChanged && { priceRange: selectedPriceRange[0]+"-"+selectedPriceRange[1] }),
    }
    handleFilter(data);
    handleFilterApplied();
    setIsSearchClicked(true);
    handleDrawerClose();
  };
  
  const [expanded, setExpanded] = React.useState<string | false>(false);

  // Handle slider change 
  const handleChange = (event: Event, value: any, activeThumb: number) => {
    let allEqual = (inputArray: any) => inputArray.every((v: any) => v === inputArray[0])
    if (allEqual(value)) {
      if (marks.some(mark => mark?.value === value[0])) {
        let markIndex = marks.findIndex(mark => mark?.value == value[0]);
        if (marks.length === (markIndex + 1)) {
          if (markIndex) {
            value = [marks[markIndex - 1]?.value, value[0]]
          }
        } else {
          value = [value[0], marks[markIndex + 1]?.value]
        }
      }
    }

    if (state?.currency === 'none') {
      // setCurrency('1');
    }
    //EOF Logic to avoid min max at same point
    setStateValue({
      ...state,     
      price: value,
    });
    setPrice(value);
    setSelectedPriceRage(value);
    setIsSliderChanged(true);
  };

  
  // Set price change state variable
  let handleInputPriceChange = (e: any) => {
    let { value, name } = e.target
    if (name == 'min_value') {
      if(value >= selectedPriceRange[1] ) return
      setSelectedPriceRage([parseInt(value), selectedPriceRange[1]]);
    } else {
      if(value <= selectedPriceRange[0]) return
      setSelectedPriceRage([selectedPriceRange[0], parseInt(value)]);
    }
  }

  const [value, setValue] = React.useState<Date | null>(null);
  const [countryStateList, setCountryStateList] = React.useState<any>([]);

  // // Get state list by country api call
  // const { data: stateList, isSuccess: isStatesByIdSuccess } = useStatesByCountryIdQuery(state?.countryId, { skip: state?.countryId === "none" });
  
  // console.log('countriesList>>>', countriesList);
  // React.useEffect(() => {
  //   setCountryStateList(stateList);
  // }, [state.countryId]);

  // Clear all
  const handleClearAll = () => {
    setSelectedPriceRage([0, 1000000]);
    setPrice([0, 1000000]);
    setIsClearComplete(true);
    setMinValue(0);
    setMaxValue(1000000);
    setStateValue({
      farmId: "",
      stallionId: "",
      stallionName: "",
      isStallionNameExactSearch: true,
      farmName: "",
      isFarmNameExactSearch: true,
      promotedStatus: "none",
      feeUpdatedBy: "none",
      promotedStartDate: "",
      countryId: "none",
      stateId: "none",
      currency: "none",
      feeStatus: "none",
      feeYear: "none",
      sireId: "",
      grandSireName: "",
      keyAncestor: "",
      isKeyAncestorExactSearch: true,
      isIncludedFeeActive: false,
      includedFee: false,
      dateValue: null,
      createDateValue: [null, null],
      createDate: "",
      price: [0, 1000000],
      page: page,
      limit: limit,
      order: state?.order,
      sortBy: state?.sortBy,
      isSortByClicked: false,
    });
    setTimeout(() => {
      setIsClearComplete(false);
    }, 1000);
    setConvertedCreatedRangeValue("");
    setConvertedCreatedDateValue([null, null]);
    setIsFarmId(false);
    setIsSearchClicked(true);
    handleRemoveFilterApplied();
    setOrderBy(defaultPageOrderBy);
    navigate(PATH_DASHBOARD.stallions.data);
    setIsSliderChanged(false);
  }

  // Check if any filter is applied
  const checkFilterApplied = () => {
    let isDateClicked = false;
    if (
      state?.stallionName ||
      state?.farmName ||
      state?.promotedStatus != 'none' ||
      state?.feeUpdatedBy != 'none' ||
      dateHypenConvert(convertedCreatedDateValue[1]) !== undefined ||
      state?.countryId != 'none' ||
      state?.currency != 'none' ||
      state?.feeStatus != 'none' ||
      state?.feeYear != 'none' ||
      sireId != '' ||
      grandSireName != '' ||
      keyAncestor != '' ||
      state?.isPrivateTouched ||
      isSliderChanged !== false
    ) {
      // if(!isDateClicked && dateHypenConvert(convertedCreatedDateValue[1]) !== undefined) {        
      //   setAutocompleteChoosen({
      //     ...isAutocompleteChoosen,
      //     isDateChoosen: true,
      //   });
      //   filterCounterhook.increment();
      //   isDateClicked = true;
      // }
      return false
    } else {      
      return true
    }
  }

  const marks = [
    {
      value: 0,
    },
    {
      value: 50000
    },
    {
      value: 100000
    },
    {
      value: 200000
    },
    {
      value: 300000
    },
    {
      value: 400000
    },
    {
      value: 500000
    },
    {
      value: 750000
    },
    {
      value: 1000000,
    }
  ];

  // Change price slider min max to K or M 
  function numFormatter(num: any) {
    if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed(0) + "K"; // convert to K for number from > 1000 < 1 million
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + "M"; // convert to M for number from > 1 million
    } else if (num < 900) {
      return num; // if value < 1000, nothing to do
    }
  }

  // Check if any filter is applied then update the state variable
  const handleChangeTextField = (e: any, type: any, targetValue: any) => {
    e.stopPropagation();
    setStateValue({
      ...state,
      [type]: targetValue
    })    

    if(type === 'currency') {
      setIsCurrencyChanged(true);
      setCurrencySlider({
        fromCurrency: targetValue,
        toCurrency: targetValue
      });
    }
  }

  // country clear function
  const handleClearCountry = () => {
    setStateValue({ ...state, countryId: 'none' });
  };

  const handleChangeField = (e: any, type: any, targetValue: any) => {
    e.stopPropagation();
    setStateValue({
      ...state,
      [type]: targetValue
    })

    if(type === 'currency') {
      setIsCurrencyChanged(true);
      setCurrencySlider({
        fromCurrency: targetValue,
        toCurrency: targetValue
      });
    }

    if (type === 'countryId') {
      // Find the selected country object
      const selectedCountry = countriesList?.find(country => country.countryId === targetValue);
  
      if (selectedCountry && selectedCountry.children) {
        // Set the selected country's children in countryStateList
        setCountryStateList(selectedCountry.children); 
        
        // Handle other field changes
        setStateValue({
          ...state,
          [type]: targetValue,
          stateId: "none" // Reset to "Select State"
        });

      } else {
        setCountryStateList([]);
      }
    } else {
      // Handle other field changes
      setStateValue({
        ...state,
        [type]: targetValue
      });
    }

    setIsOpenSelectBox({
      ...isOpenSelectBox,
      [type]: false // Close only the specific Select box
    });

    // if(type !== 'stallionName' || type !== 'farmName') {
    //   filterCounterhook.increment();     
    // }
  }

  const performSearchForDropdown = () => { 
    filterCounterhook.increment();     
  }

  React.useEffect(() => {
    if(filterCounterhook.value > 0) {
      handleFilterData(); 
    }
    filterCounterhook.reset();     
  }, [filterCounterhook]);

  // React.useEffect(() => {
  //   if(isAutocompleteChoosen.isKeyAncestorChoosen || isAutocompleteChoosen.isGrandSireNameChoosen || isAutocompleteChoosen.isSireChoosen || isAutocompleteChoosen.isDateChoosen) {
  //     handleFilterData(); 

  //     setAutocompleteChoosen({
  //       ...isAutocompleteChoosen,
  //       isKeyAncestorChoosen: false,
  //       isGrandSireNameChoosen: false,
  //       isSireChoosen: false,
  //       isDateChoosen: false,
  //     });   
  //   }
     
  // }, [isAutocompleteChoosen]);
  
  // Check if private fee is checked then update the state variable
  const handlePrivateField = (type: any, targetValue: any) =>{
    setStateValue({
      ...state,
      [type]: targetValue,
      isPrivateTouched: true
    })
    filterCounterhook.increment();   
  } 

  // Go back to stallion dashboard page
  // const handleGoBackToDashboard = () => {
  //   handleClearAll();
  //   handleDrawerClose();
  //   setIsSearchClicked(false);
  // }

  //FarmName exact/partial search
  const [isToggleClass, setIsToggleClass] = React.useState(true);
  const [isPartialToggleClass, setIsPartialToggleClass] = React.useState(false);
  const handleFarmNameToggle = (nameFilterType: string) => {
    setIsFarmNameExactSearch(!isFarmNameExactSearch);
    setStateValue({
      ...state,
      isFarmNameExactSearch: !isFarmNameExactSearch
    });
    if (nameFilterType === 'exact') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    } else if (nameFilterType === 'partial') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    }
  };
  let toggleClass = (state?.isFarmNameExactSearch) ? 'matched-active' : 'matched-inactive';
  let partialToggleClass = (!state?.isFarmNameExactSearch) ? 'matched-active' : 'matched-inactive';

  //stallionName exact/partial search
  const [isStallionToggleClass, setIsStallionToggleClass] = React.useState(true);
  const [isPartialStallionToggleClass, setIsStallionPartialToggleClass] = React.useState(false);
  const handleStallionNameToggle = (nameFilterType: string) => {
    setIsStallionNameExactSearch(!isStallionNameExactSearch);
    setStateValue({
      ...state,
      isStallionNameExactSearch: !isStallionNameExactSearch
    });
    if (nameFilterType === 'exact') {
      setIsStallionToggleClass(!isStallionToggleClass);
      setIsStallionPartialToggleClass(!isPartialStallionToggleClass);
    } else if (nameFilterType === 'partial') {
      setIsStallionToggleClass(!isStallionToggleClass);
      setIsStallionPartialToggleClass(!isPartialStallionToggleClass);
    }
  };
  let stallionToggleClass = (state?.isStallionNameExactSearch) ? 'matched-active' : 'matched-inactive';
  let stallionPartialToggleClass =(!state?.isStallionNameExactSearch)  ? 'matched-active' : 'matched-inactive';

  return (
    <StyledEngineProvider injectFirst>
      <Drawer variant="permanent" open={open} className='filter-section DrawerLeftModal stallion-leftbar'>
        <Scrollbar
          className='filter-scrollbar'
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          <DrawerHeader className='filter-drawer-head'>
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant='h3'>{fNumber(rowCount)} Stallions</Typography>
              <Button className='clearBtn' onClick={handleClearAll}>Clear all</Button>
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
              <i className='icon-menu-back' />
            </IconButton>            
          </DrawerHeader>
          <Box className='edit-section' pt={3}
          sx={{
            ...(!isDisplayBox && { display: 'none' }),
          }}
          >            
            <Box className='FormGroup' pt={3}>
              <Typography variant='h5'>Stallion Filters</Typography>

              {/* Stallion name textbox  with uption to choose either exact/partial search */}
              <TextField name="stallionName" placeholder='Select Stallion'
                value={state?.stallionName}
                onChange={(e) => handleChangeTextField(e, "stallionName", e.target.value)}
                onKeyDown={handleSelectKeyDown}
                className='edit-field matchcasetext' autoComplete="off"
                InputProps={{
                  endAdornment: (
                    <>
                      <InputAdornment position="start" className='matchcase'>
                        <IconButton
                          className={`matchcase-first ${stallionToggleClass}`}
                          aria-label="toggle password visibility"
                          edge="end"
                          onClick={() => handleStallionNameToggle('exact')}
                          sx={{ marginRight: '0px', padding: '0px' }}>
                          <img src={Images.Aa} alt='Aa' />
                        </IconButton>

                        <IconButton
                          className={`matchcase-second ${stallionPartialToggleClass}`}
                          aria-label="toggle password visibility"
                          edge="end"
                          onClick={() => handleStallionNameToggle('partial')}
                          sx={{ marginRight: '0px', padding: '0px' }}>
                          <img src={Images.ab} alt='ab' />
                        </IconButton>
                      </InputAdornment>
                    </>
                  )
                }}
              />

              {/* Farm name textbox  with uption to choose either exact/partial search */}
              <TextField name="farmName" placeholder='Select Farm'
                value={state?.farmName}
                onChange={(e) => handleChangeTextField(e, "farmName", e.target.value)}
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

              {/* Promoted Status selectbox */}
              <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                <Select
                  MenuProps={{
                    ...MenuProps,
                    onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, promotedStatus: false }),
                  }}
                  open={isOpenSelectBox.promotedStatus}
                  onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, promotedStatus: true })}
                  onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, promotedStatus: false })}
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  className='filter-slct '
                  value={state?.promotedStatus}
                  onChange={(e) => handleChangeField(e, "promotedStatus", e.target.value)}                  
                >
                  <MenuItem value="none" className='selectDropDownList' disabled><em>Promoted Status</em></MenuItem>
                  {
                    promotionStatusList?.map(({ id, name }) => {
                      return <MenuItem className='selectDropDownList' value={name} key={id}>{name}</MenuItem>
                    })}
                </Select>
              </Box>

              {/* Country selectbox */}
              <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                <Select
                  MenuProps={{
                    ...MenuProps,
                    onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, feeUpdatedBy: false }),
                  }}
                  open={isOpenSelectBox.feeUpdatedBy}
                  onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, feeUpdatedBy: true })}
                  onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, feeUpdatedBy: false })}
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  className='filter-slct'
                  value={state?.feeUpdatedBy}
                  onChange={(e) => handleChangeField(e, "feeUpdatedBy", e.target.value)}
                >
                  <MenuItem value="none" className='selectDropDownList' disabled><em>Fee Updated By</em></MenuItem>
                  {
                    feeUpdatedByList?.map(({ id, name }) => {
                      return <MenuItem className='selectDropDownList' value={id} key={id}>{name}</MenuItem>
                    })}
                </Select>
              </Box>
              {/* Promoted Start Date */}  
              <Box className='calender-wrapper' onKeyDown={handleSelectKeyDown}>
                <Box className='edit-field'>
                  <CustomFilterRangePicker placeholderText="Promoted Start Date" convertedDateRangeValue={convertedCreatedRangeValue} setConvertedDateRangeValue={setConvertedCreatedRangeValue} convertedDateValue={convertedCreatedDateValue} setConvertedYobDateValue={setConvertedCreatedDateValue} handleSelectKeyDown={handleSelectKeyDown} />
                </Box>
              </Box>
            </Box>

            {/* Country selectbox */}          
            <Box className='FormGroup'>
              <Typography variant='h5'>Location</Typography>
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
                    onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, country: false }),
                  }} 
                  open={isOpenSelectBox.country}
                  onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, country: true })}
                  onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, country: false })}
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  className='filter-slct countryDropdown'
                  value={state?.countryId}
                  onChange={(e) => handleChangeField(e, "countryId", e.target.value)}
                >
                  <MenuItem value="none" className="selectDropDownList countryDropdownList" disabled><em>Select Country</em></MenuItem>
                  {
                    countriesList?.map(({ countryId, label }) => {
                      return <MenuItem className="selectDropDownList countryDropdownList" value={countryId} key={countryId}>{label}</MenuItem>
                    })}
                </Select>
                {state.countryId !== 'none' && (
        <CloseRoundedIcon
          className="clear-icon"
          onClick={handleClearCountry}
        />
      )}
              </Box>

              {/* State selectbox */}  
              {(state?.countryId !== "none" && countryStateList?.length > 0) && 
              <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                <Select
                  MenuProps={{
                    ...MenuProps,
                    onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, stateId: false }),
                  }}
                  open={isOpenSelectBox.stateId}
                  onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, stateId: true })}
                  onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, stateId: false })}
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  className='filter-slct'
                  value={state?.stateId}
                  onChange={(e) => handleChangeField(e, "stateId", e.target.value)}
                >
                  <MenuItem value="none" className='selectDropDownList' disabled><em>Select State</em></MenuItem>
                  {
                    countryStateList?.map(({ stateId, label }: { stateId: number, label: string }) => {
                      return <MenuItem className='selectDropDownList' value={stateId} key={stateId}>{label}</MenuItem>
                    })}
                </Select>
              </Box>
            }
            </Box>

            {/* Service fee selectbox */}  
            <Box className='FormGroup'>
              <Typography variant='h5'>Service Fee</Typography>
              <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                <Select
                  MenuProps={{
                    ...MenuProps,
                    onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, serviceFee: false }),
                  }}
                  open={isOpenSelectBox.serviceFee}
                  onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, serviceFee: true })}
                  onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, serviceFee: false })}
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  className='filter-slct'
                  value={state?.currency}
                  onChange={(e) => handleChangeField(e, "currency", e.target.value)}
                >
                  <MenuItem className='selectDropDownList' value="none" disabled><em>Select Currency</em></MenuItem>
                  {
                    currencyList?.map(({ id, currencyName }) => {
                      return <MenuItem className='selectDropDownList' value={id} key={id}>{currencyName}</MenuItem>
                    })}
                </Select>
              </Box>

              {/* Price slider component */}        
              <Box className='edit-field rangeSliderFilterWrp' onKeyDown={handleSelectKeyDown}>
                <Box className='rangeSliderFilterBody'>
                  <CustomRangeSlider
                    className="rangeSliderFilter"
                    getAriaLabel={() => 'Fee range'}
                    value={selectedPriceRange}
                    valueLabelFormat={numFormatter}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    min={minValue}
                    max={maxValue}
                    step={(10/100) * maxValue}
                    marks={[{ value: 0 }, { value: 1000000 }]}
                    disableSwap
                  />
                  <Box className='min-max'>
                    <Typography variant='h6'> Min </Typography>
                    <Typography variant='h6'> Max </Typography>
                  </Box>
                  <Box className='stallion-feerange-values'>
                    <Box>
                      <TextField
                        type='number' name="min_value"
                        onChange={handleInputPriceChange}
                        value={Math.ceil(selectedPriceRange[0])}
                      />
                    </Box>
                    <Box>
                      <Typography variant='h6' style={{padding: "0 6px"}}> to</Typography>
                    </Box>
                    <Box>
                      <TextField
                        onChange={handleInputPriceChange}
                        type='number' name="max_value"
                        value={Math.ceil(selectedPriceRange[1])}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* isPrivate fee checkbox */}      
                <Box className='includedPrivateFee'>
                  <FormControlLabel
                    control={
                      <Checkbox
                        disableRipple
                        className='isPrivateFee'
                        name={'isPrivateFee'}
                        checked={state?.includedFee}
                        onChange={(e) => handlePrivateField("includedFee", e.target.checked)}
                        key={'includePrivateFees'}
                        checkedIcon={<img src={Images.Radiochecked} />}
                        icon={<img src={Images.Radiounchecked} />}
                      />
                    }
                    label={'Include Private Fees'}
                  />
                </Box>
              </Box>

              {/* Fee status selctbox */}      
              <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                <Select
                  MenuProps={{
                    ...MenuProps,
                    onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, feeStatus: false }),
                  }}
                  open={isOpenSelectBox.feeStatus}
                  onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, feeStatus: true })}
                  onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, feeStatus: false })}
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  className='filter-slct'
                  value={state?.feeStatus}
                  onChange={(e) => handleChangeField(e, "feeStatus", e.target.value)}
                >
                  <MenuItem className='selectDropDownList' value="none" disabled><em>Fee Status</em></MenuItem>
                  {
                    feeStatusList?.map(({ id, name }) => {
                      return <MenuItem className='selectDropDownList' value={id} key={id}>{name}</MenuItem>
                    })}
                </Select>
              </Box>

              <Box className='edit-field' onKeyDown={handleSelectKeyDown}>
                <Select
                  MenuProps={{
                    ...MenuProps,
                    onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, feeYear: false }),
                  }}
                  open={isOpenSelectBox.feeYear}
                  onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, feeYear: true })}
                  onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, feeYear: false })}
                  IconComponent={KeyboardArrowDownRoundedIcon}
                  className='filter-slct'
                  value={state?.feeYear}
                  onChange={(e) => handleChangeField(e, "feeYear", e.target.value)}
                >
                  <MenuItem value="none" className='selectDropDownList' disabled><em>Fee Year</em></MenuItem>
                  {yob.slice(0).reverse().map((year) => (
                    <MenuItem className='selectDropDownList' value={year} key={year}>{year}</MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Sire Autocomplete component */}
              <Box className='edit-field matchcasetext' onKeyDown={handleSelectKeyDown}>
                <StallionSireAutoFilter  setIsClearComplete={setIsClearComplete} isClearAutoComplete={isClearAutoComplete} setSireId={setSireId} sireId={sireId} isFilterApplied={isFilterApplied} type="stallions" isAutocompleteChoosen={isAutocompleteChoosen} setAutocompleteChoosen={setAutocompleteChoosen} />
              </Box>

              {/* GrandSire Autocomplete component */}
              <Box className='edit-field matchcasetext' onKeyDown={handleSelectKeyDown}>
                <GrandSireAutoFilter setIsClearComplete={setIsClearComplete} isClearAutoComplete={isClearAutoComplete} setGrandSireName={setGrandSireName} grandSireName={grandSireName} isFilterApplied={isFilterApplied} isAutocompleteChoosen={isAutocompleteChoosen} setAutocompleteChoosen={setAutocompleteChoosen}/>
              </Box>

              {/* Key anchestor Autocomplete component */}
              <Box className='edit-field KeyAncestorTextBox matchcasetext' onKeyDown={handleSelectKeyDown}>
                <KeyByAncestorAutoComplete keyAncestor={keyAncestor} setKeyAncestor={setKeyAncestor} isFilterApplied={isFilterApplied} isClearAutoComplete={isClearAutoComplete} setIsClearComplete={setIsClearComplete} type="stallions" state={state} setStateValue={setStateValue} isAutocompleteChoosen={isAutocompleteChoosen} setAutocompleteChoosen={setAutocompleteChoosen}/>
              </Box>

            </Box>
            <Stack sx={{ mt: 3 }} className='DrawerBtnWrapper'>
              <Button disabled={(checkFilterApplied() || stallionModuleAccess.stallion_search == false)} onClick={handleFilterData} className='search-btn' fullWidth>Search</Button>
            </Stack>
          </Box>
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
}
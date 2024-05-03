import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack } from '@mui/material';
// form
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import Button from '@mui/material/Button';
import { useDispatch } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import Scrollbar from '../../../../components/Scrollbar';
// hooks
import { usePaymentmethodsQuery } from 'src/redux/splitEndpoints/paymentmethodsSplit';
import 'src/sections/@dashboard/css/filter.css';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from 'src/constants/MenuProps';
import InputAdornment from '@mui/material/InputAdornment';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { dateHypenConvert, toPascalCase } from 'src/utils/customFunctions';
import { useMemberProductListQuery } from 'src/redux/splitEndpoints/productSplit';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
import {
  useGetMinMaxReportValueQuery,
  useReportOrderStatusQuery,
} from 'src/redux/splitEndpoints/reportsSplit';
import { setOrderReportOpened, setReportFilterOpened } from 'src/redux/slices/settings';
import { CustomRangeSlider } from 'src/components/CustomRangeslider';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import { Autocomplete } from '@mui/material';
import { useDamAutocompleteSearchQuery, useSireAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { debounce } from 'lodash';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useLocation, useParams } from 'react-router';
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
//Drawer Header component
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

//drawer component
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

const ReportsFilterSidebar = React.forwardRef((props: any, ref: any) => {
  const {
    handleFilter,
    handleFilterApplied,
    setIsSearchClicked,
    rowCount,
    page,
    limit,
    reportValue,
    state,
    setStateValue,
    convertedDateRangeValue,
    setConvertedDateRangeValue,
    convertedDateDateValue,
    setConvertedDateDateValue,
    convertedInitiatedDateRangeValue,
    setConvertedInitiatedDateRangeValue,
    convertedInitiatedDateDateValue,
    setConvertedInitiatedDateDateValue,
    convertedCompletedDateRangeValue,
    setConvertedCompletedDateRangeValue,
    convertedCompletedDateDateValue,
    setConvertedCompletedDateDateValue,
    convertedDeliveredDateRangeValue,
    setConvertedDeliveredDateRangeValue,
    convertedDeliveredDateDateValue,
    setConvertedDeliveredDateDateValue,
    defaultPageOrderBy,
  } = props;

  const navigate = useNavigate();
  const [currencySlider, setCurrencySlider] = React.useState<any>({});
  const [price, setPrice] = React.useState(state.price || [0, 0]);
  const [selectedPriceRange, setSelectedPriceRage] = React.useState(state.price || [0, 100]);
  const [minValue, setMinValue] = React.useState(0);
  const [maxValue, setMaxValue] = React.useState(1000000);
  const [isSliderChanged, setIsSliderChanged] = React.useState<boolean>(false);
  const [isAutoCompleteClear, setIsAutoCompleteClear] = React.useState(props.isClearAutoComplete);

  const { pathname } = useLocation();
  const { orderid = '' } = useParams();

  const [open, setOpen] = React.useState(false);
  //api for countrys list
  const { data: countriesList } = useCountriesQuery();
  //api for Member prodect List
  const { data: reportList } = useMemberProductListQuery();
  //api for report order Status
  const { data: orderStatusData } = useReportOrderStatusQuery();
  // api for Payment method
  const { data: paymentMethodsData } = usePaymentmethodsQuery();
  //api for curreiency slider min max values
  const { data: CurrenciesMinMaxValue, isSuccess: isCurrenciesMinMaxvalueSuccess } =
    useGetMinMaxReportValueQuery(currencySlider, { skip: !currencySlider });

  // Get all currency api call
  const { data: currencyList } = useCurrenciesQuery();

  // customAutoComplete starts
  const [damFilterData, setDamFilterData] = React.useState({
    damName: '',
  });
  const [sireFilterData, setSireFilterData] = React.useState({
    sireName: '',
  });
  const [isDam, setIsDam] = React.useState(false);
  const [damName, setDamName] = React.useState<any>('');
  const [sireName, setSireName] = React.useState<any>('');
  const [isSire, setIsSire] = React.useState(false);
  const [damNameSearch, setDamNameSearch] = React.useState({ horseName: '' });
  
  const [sireNameSearch, setSireNameSearch] = React.useState({ horseName: '' });
  //API call to get  Dam data
  const { data: dataDam, isFetching } = useDamAutocompleteSearchQuery(damFilterData, {
    skip: !isDam,
  });
   //API call to get  Sire data
  const { data: dataSire} = useSireAutocompleteSearchQuery(sireFilterData,{
    skip:!isSire
  })
  const damFilterOptions = isDam ? dataDam : [];
  const sireFilterOptions = isSire ? dataSire : [];

  const debouncedMareName = React.useRef(
    debounce(async (damName) => {
      if (damName.length >= 3) {
        setDamFilterData({
          damName: damName,
        });
        setIsDam(true);
      } else {
        setIsDam(false);
      }
    }, 1000)
  ).current;

  const debouncedSireName = React.useRef(
    debounce(async (sireName) => {
      if (sireName.length >= 3) {
        setSireFilterData({
          sireName: sireName,
        });
        setIsSire(true);
      } else {
        setIsSire(false);
      }
    }, 1000)
  ).current;


  const dispatch = useDispatch();
  const reportFilterOpened = false;

  React.useEffect(() => {
    if (isCurrenciesMinMaxvalueSuccess) {
      setPrice([CurrenciesMinMaxValue?.min, CurrenciesMinMaxValue?.max]);
      setSelectedPriceRage([CurrenciesMinMaxValue?.min, CurrenciesMinMaxValue?.max]);
      setMinValue(CurrenciesMinMaxValue?.min || 0);
      setMaxValue(CurrenciesMinMaxValue?.max || 100);
    }
  }, [CurrenciesMinMaxValue, isCurrenciesMinMaxvalueSuccess]);

  React.useEffect(() => {
    props.handleOpenFilterParam(open);
  }, [open]);

  React.useEffect(() => {
    setOpen(reportFilterOpened);
  }, [reportFilterOpened]);

  React.useImperativeHandle(ref, () => ({
    handleClearFilter() {
      handleClearAll();
    },
  }));

  React.useEffect(() => {
    let isFilter = false;
   
    if (orderid) {
      isFilter = pathname.includes('filter');
    }
   
    if (isFilter) {
      handleFilterData();
    }
  }, []);

  const [isDisplayBox, setIsDisplayBox] = React.useState(false);

  //opens the drawer
  const handleDrawerOpen = () => {
    setOpen(true);
    dispatch(setReportFilterOpened(true));
    dispatch(setOrderReportOpened(false));
    setIsDisplayBox(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
    dispatch(setReportFilterOpened(false));
  };

  // updates the Form Values
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });

    if (type == 'currency') {
      setCurrencySlider({ currencyId: targetValue });
    }

    setIsOpenSelectBox({
      ...isOpenSelectBox,
      [type]: false, // Close only the specific Select box
    });
  };

  // rerturns true when any form field is not empty
  const checkFilterApplied = () => {
    if (
      state?.clientName !== '' ||
      state?.email !== '' ||
      state?.selectedReport ||
      state?.orderId !== '' ||
      state?.orderStatus ||
      state?.sire !== '' ||
      state?.dam !== '' ||
      state?.country ||
      state?.company !== '' ||
      state?.paymentGateway !== 'none' ||
      state?.currency !== 'none' ||
      state?.paidRange.join('-') !== '0-100' ||
      state?.paidRangeClicked !== false ||
      state?.isIncludeClicked !== false ||
      dateHypenConvert(convertedDateDateValue[1]) !== undefined ||
      dateHypenConvert(convertedInitiatedDateDateValue[1]) !== undefined ||
      dateHypenConvert(convertedCompletedDateDateValue[1]) !== undefined ||
      dateHypenConvert(convertedDeliveredDateDateValue[1]) !== undefined ||
      isSliderChanged !== false
    ) {
      return false;
    } else {
      return true;
    }
  };
  //fetchs the datae based on filters
  const handleFilterData = () => {
    const data = {
      ...{ page: 1 },
      ...{ limit: limit },
      ...{ order: props.order },
      ...{ sortBy: state?.isSortByClicked ? props.orderBy : defaultPageOrderBy },
      ...(state?.clientName !== '' && { name: state?.clientName }),
      ...(state?.email !== '' && { email: state?.email }),
      ...(state?.orderId !== '' && { orderId: state?.orderId }),
      ...(state?.sire !== '' && { sireName: state?.sire }),
      ...(state?.dam !== '' && { damName: state?.dam }),
      ...(state.company !== '' && { companyName: state.company }),
      ...(reportValue == 'requiredApproval' && { isRequeiredApproval: true }),

      ...(dateHypenConvert(convertedDateDateValue[1]) !== undefined && {
        date:
          dateHypenConvert(convertedDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedDateDateValue[1]),
      }),
      ...(dateHypenConvert(convertedInitiatedDateDateValue[1]) !== undefined && {
        initiatedDate:
          dateHypenConvert(convertedInitiatedDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedInitiatedDateDateValue[1]),
      }),
      ...(dateHypenConvert(convertedCompletedDateDateValue[1]) !== undefined && {
        completedDate:
          dateHypenConvert(convertedCompletedDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedCompletedDateDateValue[1]),
      }),
      ...(dateHypenConvert(convertedDeliveredDateDateValue[1]) !== undefined && {
        deliveredDate:
          dateHypenConvert(convertedDeliveredDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedDeliveredDateDateValue[1]),
      }),
      ...(state?.selectedReport !== '' && { reportId: state?.selectedReport }),
      ...(state?.orderStatus !== '' && { orderStatusId: state?.orderStatus }),
      ...(state?.country !== '' && { countryId: state?.country }),
      ...(state?.paymentGateway !== 'none' && { paymentMethodId: state?.paymentGateway }),
      ...(state?.currency !== 'none' && { currencyId: state?.currency }),

      ...(state?.isFlaggedClicked && { isFlagged: state?.isFlagged }),
      ...(isSliderChanged && { minPrice: selectedPriceRange[0] }),
      ...(isSliderChanged && { maxPrice: selectedPriceRange[1] }),
      // ...(state?.paidRange.join('-') !== '0-100' && {
      //   paidRange: state?.paidRange.join('-'),
      // }),
    };
    props.setPage(1);
    handleFilter(data);
    handleFilterApplied();
    setIsSearchClicked(true);
    handleDrawerClose();
  };
  //clears all value in the filter
  const handleClearAll = () => {
    setStateValue({
      clientName: '',
      email: '',
      selectedReport: '',
      selectedReportName: { productName: '' },
      orderId: '',
      orderStatus: '',
      orderStatusName: { status: '' },
      sire: '',
      dam: '',
      country: '',
      countryName: { countryName: '' },
      company: '',
      paymentGateway: 'none',
      currency: 'none',
      paidRange: [0, 100],
      isInclude: false,
      paidRangeClicked: false,
      isIncludeClicked: false,
      page: page,
      limit: limit,
      order: props.order,
      sortBy: props.orderBy,
    });
    setConvertedDateRangeValue('');
    setConvertedInitiatedDateRangeValue('');
    setConvertedCompletedDateRangeValue('');
    setConvertedDeliveredDateRangeValue('');
    setConvertedDateDateValue([null, null]);
    setConvertedInitiatedDateDateValue([null, null]);
    setConvertedCompletedDateDateValue([null, null]);
    setConvertedDeliveredDateDateValue([null, null]);
    props.handleRemoveFilterApplied();
    props.setPage(1);
    navigate(PATH_DASHBOARD.reports.data);
    props.setIsSearchClicked(false);
    setIsSliderChanged(false);
    setSelectedPriceRage([CurrenciesMinMaxValue?.min, CurrenciesMinMaxValue?.max]);
    setDamNameSearch({ horseName: '' });
    setDamFilterData({damName:''});
    setSireNameSearch({horseName: '' });
    setSireFilterData({sireName:''});
    setIsAutoCompleteClear(true);
  };

  const [value, setValue] = React.useState<Date | null>(null);

  const minDistance = 5;

  const [value2, setValue2] = React.useState<number[]>([1000, 1600]);

  const [value3, setValue3] = React.useState<number[]>([4, 35]);

  //Icon button component

  const marks = [
    {
      value: 0,
    },
    {
      value: 50000,
    },
    {
      value: 100000,
    },
    {
      value: 200000,
    },
    {
      value: 300000,
    },
    {
      value: 400000,
    },
    {
      value: 500000,
    },
    {
      value: 750000,
    },
    {
      value: 1000000,
    },
  ];

  // number formator fro price Slider
  function numFormatter(num: any) {
    if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed(0) + 'K'; // convert to K for number from > 1000 < 1 million
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M'; // convert to M for number from > 1 million
    } else if (num < 900) {
      return num; // if value < 1000, nothing to do
    }
  }

  //Sets pricing slider  range
  const handleSliderChange = (event: Event, value: any) => {
    //BOF Logic to avoid min max at same point
    let allEqual = (inputArray: any) => inputArray.every((v: any) => v === inputArray[0]);
    if (allEqual(value)) {
      if (marks.some((mark) => mark?.value === value[0])) {
        let markIndex = marks.findIndex((mark) => mark?.value == value[0]);
        if (marks.length === markIndex + 1) {
          if (markIndex) {
            value = [marks[markIndex - 1]?.value, value[0]];
          }
        } else {
          value = [value[0], marks[markIndex + 1]?.value];
        }
      }
    }
    if (state?.currency === 'none') {
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

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    clientName: false,
    email: false,
    selectedReport: false,
    orderId: false,
    orderStatus: false,
    sire: false,
    dam: false,
    country: false,
    company: false,
    paymentGateway: false,
    currency: false,
  });

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        clientName: false,
        email: false,
        selectedReport: false,
        orderId: false,
        orderStatus: false,
        sire: false,
        dam: false,
        country: false,
        company: false,
        paymentGateway: false,
        currency: false,
      });
    }
  };

  const handleSireInput = (e: any) => {
    if (e && e.target.value) {
      setSireNameSearch({
        ...sireNameSearch,
        horseName: e.target.value,
      });
      setSireName(e.target.value);
      setStateValue({
        ...state,
        sire: e.target.value,
      });
      debouncedSireName(e.target.value);
    }
  };

  const handleSireSelect = (selectedOptions: any) => {
    setSireNameSearch(selectedOptions);
    setStateValue({
      ...state,
      sire: selectedOptions ? selectedOptions.horseId : '',
    });
    setIsAutoCompleteClear(false);
  };

  const handleDamInput = (e: any) => {
    if (e && e.target.value) {
      setDamNameSearch({
        ...damNameSearch,
        horseName: e.target.value,
      });
      setDamName(e.target.value);
      setStateValue({
        ...state,
        dam: e.target.value,
      });
      debouncedMareName(e.target.value);
    }
  };

  const handleDamSelect = (selectedOptions: any) => {
    setDamNameSearch(selectedOptions);
    setStateValue({
      ...state,
      dam: selectedOptions ? selectedOptions.horseId : '',
    });
    setIsAutoCompleteClear(false);
  };

  const handleMareOptionsReset = () => {
    setDamName('');
    setIsDam(false);
  };

  const handleSireOptionsReset = () => {
    setSireName('');
    setIsSire(false);
  };

  // Reset
  React.useEffect(() => {
    if (props.isClearAutoComplete) {
      setDamFilterData({ damName: '' });
      setSireFilterData ({sireName: ''});
      setIsAutoCompleteClear(true);
    }
  }, [props.isClearAutoComplete])
  


  return (
    <StyledEngineProvider injectFirst>
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal reports-leftbar"
      >
        <Scrollbar
          className="filter-scrollbar"
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          {/*Filter Header Section  */}
          <DrawerHeader className="filter-drawer-head">
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">{rowCount} Reports</Typography>
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
          {/* End Filter Header Section  */}

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
                  {/* Client Name text field  */}
                  <TextField
                    name=""
                    placeholder="Client Name"
                    value={state?.clientName}
                    onChange={(e) => handleChangeField('clientName', e.target.value)}
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
                  {/* Email text Field  */}
                  <TextField
                    name=""
                    placeholder="Email"
                    className="edit-field"
                    value={state?.email}
                    onChange={(e) => handleChangeField('email', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                  />
                  {/* Date  picker component   */}
                  <Box className="calender-wrapper" onKeyDown={handleSelectKeyDown}>
                    <Box className="edit-field">
                      <CustomFilterRangePicker
                        placeholderText="Date"
                        convertedDateRangeValue={convertedDateRangeValue}
                        setConvertedDateRangeValue={setConvertedDateRangeValue}
                        convertedDateValue={convertedDateDateValue}
                        setConvertedYobDateValue={setConvertedDateDateValue}
                      />
                    </Box>
                  </Box>
                  {/* Select Repot Dropdown  */}
                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={reportList ? reportList?.filter((v:any) => v.categoryId === 1) : []}
                      getOptionLabel={(option: any) => option?.productName}
                      renderInput={(params: any) => (
                        <TextField {...params} placeholder={`Select Report`} />
                      )}
                      value={state?.selectedReportName ? state?.selectedReportName : null}
                      onChange={(e: any, selectedOptions: any) => {
                        setStateValue({
                          ...state,
                          selectedReport: selectedOptions?.id,
                          selectedReportName: selectedOptions,
                        });
                      }}
                      className="mareBlockInput"
                    />
                  </Box>
                  {/* Order Id Text Field  */}
                  <TextField
                    name=""
                    placeholder="Order ID"
                    className="edit-field"
                    value={state?.orderId}
                    onChange={(e) => handleChangeField('orderId', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                  />
                  {/* intialDate date picler */}
                  <Box className="calender-wrapper" onKeyDown={handleSelectKeyDown}>
                    <Box className="edit-field">
                      <CustomFilterRangePicker
                        placeholderText="Initiated Date"
                        convertedDateRangeValue={convertedInitiatedDateRangeValue}
                        setConvertedDateRangeValue={setConvertedInitiatedDateRangeValue}
                        convertedDateValue={convertedInitiatedDateDateValue}
                        setConvertedYobDateValue={setConvertedInitiatedDateDateValue}
                      />
                    </Box>
                  </Box>
                  {/* CompletedDate date picker  */}
                  <Box className="calender-wrapper" onKeyDown={handleSelectKeyDown}>
                    <Box className="edit-field">
                      <CustomFilterRangePicker
                        placeholderText="Completed Date"
                        convertedDateRangeValue={convertedCompletedDateRangeValue}
                        setConvertedDateRangeValue={setConvertedCompletedDateRangeValue}
                        convertedDateValue={convertedCompletedDateDateValue}
                        setConvertedYobDateValue={setConvertedCompletedDateDateValue}
                      />
                    </Box>
                  </Box>
                  {/* DeliveredDate date picker  */}
                  <Box className="calender-wrapper" onKeyDown={handleSelectKeyDown}>
                    <Box className="edit-field">
                      <CustomFilterRangePicker
                        placeholderText="Delivered Date"
                        convertedDateRangeValue={convertedDeliveredDateRangeValue}
                        setConvertedDateRangeValue={setConvertedDeliveredDateRangeValue}
                        convertedDateValue={convertedDeliveredDateDateValue}
                        setConvertedYobDateValue={setConvertedDeliveredDateDateValue}
                      />
                    </Box>
                  </Box>
                  {/* Order Select dropdown  */}
                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={orderStatusData || []}
                      getOptionLabel={(option: any) => option?.status}
                      renderInput={(params: any) => (
                        <TextField {...params} placeholder={`Order Status`} />
                      )}
                      value={state?.orderStatusName ? state?.orderStatusName : null}
                      onChange={(e: any, selectedOptions: any) => {
                        setStateValue({
                          ...state,
                          orderStatus: selectedOptions?.id,
                          orderStatusName: selectedOptions,
                        });
                      }}
                      className="mareBlockInput"
                    />
                  </Box>
                  {/* Sire text field  */}
                  {/* <TextField
                    name="sireName"
                    placeholder="Enter Sire"
                    className="edit-field"
                    value={state?.sire}
                    onChange={(e) => handleChangeField('sire', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                  /> */}
                  <Box className="edit-field mareDropdown" onKeyDown={handleSelectKeyDown}>
                    {/* Mare Name */}
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={sireFilterOptions || []}
                      renderOption={(props, option: any) => (
                        // <li
                        //   className="searchstallionListBox"
                        //   {...props}
                        //   key={`${option?.horseId}${option?.horseName}`}
                        // >
                        //   <Stack className="stallionListBoxHead">
                        //     {toPascalCase(option.horseName)}
                        //   </Stack>
                        // </li>

                        <li className="searchstallionListBox" style={{ color: '#000 !important' }} {...props}>
                          <Stack className="stallionListBoxHead">
                            {toPascalCase(option.horseName)} ({option.yob},{' '}
                            <span>{option.countryCode}</span>){' '}
                          </Stack>
                          <Stack className="stallionListBoxpara">
                            <strong>X</strong>
                            <p>
                              {toPascalCase(option.sireName)} ({option.sireYob},{' '}
                              <span>{option.sirecountry}</span>),{' '} {toPascalCase(option.damName)} (
                              {option.damYob}, <span>{option.damcountry}</span>)
                            </p>
                          </Stack>
                        </li>
                      )}
                      onInputChange={handleSireInput}
                      getOptionLabel={(option: any) =>
                        `${toPascalCase(option?.horseName)?.toString()}`
                      }
                      value={sireNameSearch ? sireNameSearch : null}
                      renderInput={(params) => <TextField {...params} placeholder={`Enter Sire`} />}
                      onChange={(e: any, selectedOptions: any) => handleSireSelect(selectedOptions)}
                      onBlur={() => handleSireOptionsReset()}
                      className="mareBlockInput"
                    />
                  </Box>
                  {/* Dam text field  */}
                  <Box className="edit-field mareDropdown" onKeyDown={handleSelectKeyDown}>
                    {/* Mare Name */}
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={damFilterOptions || []}
                      renderOption={(props, option: any) => (
                        // <li
                        //   className="searchstallionListBox"
                        //   {...props}
                        //   key={`${option?.horseId}${option?.horseName}`}
                        // >
                        //   <Stack className="stallionListBoxHead">
                        //     {toPascalCase(option.horseName)}
                        //   </Stack>
                        // </li>

                        <li className="searchstallionListBox" style={{ color: '#000 !important' }} {...props}>
                          <Stack className="stallionListBoxHead">
                            {toPascalCase(option.horseName)} ({option.yob},{' '}
                            <span>{option.countryCode}</span>){' '}
                          </Stack>
                          <Stack className="stallionListBoxpara">
                            <strong>X</strong>
                            <p>
                              {toPascalCase(option.sireName)} ({option.sireYob},{' '}
                              <span>{option.sirecountry}</span>),{' '} {toPascalCase(option.damName)} (
                              {option.damYob}, <span>{option.damcountry}</span>)
                            </p>
                          </Stack>
                        </li>
                      )}
                      onInputChange={handleDamInput}
                      getOptionLabel={(option: any) =>
                        `${toPascalCase(option?.horseName)?.toString()}`
                      }
                      value={damNameSearch ? damNameSearch : null}
                      renderInput={(params) => <TextField {...params} placeholder={`Enter Dam`} />}
                      onChange={(e: any, selectedOptions: any) => handleDamSelect(selectedOptions)}
                      onBlur={() => handleMareOptionsReset()}
                      className="mareBlockInput"
                    />
                  </Box>
                  {/* country dropdown  */}
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
                          country: selectedOptions?.id,
                          countryName: selectedOptions,
                        });
                      }}
                      className="mareBlockInput"
                    />
                  </Box>
                  {/* Company Name field  */}
                  <TextField
                    name="company"
                    placeholder="Enter Company"
                    value={state.company}
                    className="edit-field"
                    onChange={(e) => handleChangeField('company', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                  />
                  {/* Payment Gateway DropDown  */}
                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    <Select
                      MenuProps={{
                        ...MenuProps,
                        onClose: () =>
                          setIsOpenSelectBox({ ...isOpenSelectBox, paymentGateway: false }),
                      }}
                      open={isOpenSelectBox.paymentGateway}
                      onOpen={() =>
                        setIsOpenSelectBox({ ...isOpenSelectBox, paymentGateway: true })
                      }
                      onClose={() =>
                        setIsOpenSelectBox({ ...isOpenSelectBox, paymentGateway: false })
                      }
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      value={state?.paymentGateway ? state?.paymentGateway : 'none'}
                      onChange={(e) => handleChangeField('paymentGateway', e.target.value)}
                      className="filter-slct"
                      name="paymentGateway"
                    >
                      <MenuItem className="selectDropDownList" value="none" disabled>
                        <em>Payment Gateway</em>
                      </MenuItem>
                      {paymentMethodsData?.map(({ id, paymentMethod }) => {
                        return (
                          <MenuItem
                            className="selectDropDownList countryDropdownList"
                            value={id}
                            key={id}
                          >
                            {paymentMethod}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Box>
                  {/* currency dropDown  */}
                  <Box className="edit-field currencycoloum" onKeyDown={handleSelectKeyDown}>
                    <Select
                      MenuProps={{
                        ...MenuProps,
                        onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, currency: false }),
                      }}
                      open={isOpenSelectBox.currency}
                      onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, currency: true })}
                      onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, currency: false })}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      value={state?.currency}
                      onChange={(e) => handleChangeField('currency', e.target.value)}
                      className="filter-slct"
                      defaultValue="none"
                      name="expiredStallion"
                    >
                      <MenuItem className="selectDropDownList" value="none" disabled>
                        <em>Currency</em>
                      </MenuItem>
                      {currencyList?.map((v: any) => {
                        return (
                          <MenuItem
                            className="selectDropDownList countryDropdownList"
                            value={v?.id}
                            key={v?.id}
                          >
                            {v?.currencyCode}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </Box>
                  {/* Price Silder component  */}
                  <Box className="edit-field rangeSliderFilter" onKeyDown={handleSelectKeyDown}>
                    <Box className="feerange">
                      <label>
                        {Math.ceil(selectedPriceRange[0])} - {Math.ceil(selectedPriceRange[1])}
                      </label>
                    </Box>
                    <CustomRangeSlider
                      className="rangeSliderFilter"
                      getAriaLabel={() => 'Fee range'}
                      value={selectedPriceRange}
                      valueLabelFormat={numFormatter}
                      onChange={handleSliderChange}
                      valueLabelDisplay="auto"
                      min={minValue}
                      max={maxValue}
                      step={(10 / 100) * maxValue}
                      marks={[{ value: 0 }, { value: 1000000 }]}
                      disableSwap
                    />
                  </Box>
                </Box>
                {/* Search Button  */}
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
});
export default ReportsFilterSidebar;

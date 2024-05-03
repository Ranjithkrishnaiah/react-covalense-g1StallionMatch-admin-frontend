import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import {
  StyledEngineProvider,
  Typography,
  Stack,
  Grid,
  Checkbox,
  FormControl,
  InputAdornment,
} from '@mui/material';
// form
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { useHorseLocationsQuery } from 'src/redux/splitEndpoints/horseSplit';
import { range } from 'src/utils/formatYear';
import Scrollbar from 'src/components/Scrollbar';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import 'src/sections/@dashboard/css/filter.css';
import FormControlLabel from '@mui/material/FormControlLabel';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { fNumber } from 'src/utils/formatNumber';
import { useState } from 'react';
import { Images } from 'src/assets/images';
import { FindDuplicatesWrapperDialog } from 'src/components/horse-modal/FindDuplicatesWrapper';
import { useHorseTypesQuery } from 'src/redux/splitEndpoints/horseTypesSplit';
import { DateRangeType } from 'src/@types/dateRangePicker';
import { yearOnlyConvert, dateHypenConvert } from 'src/utils/customFunctions';
import { useCreatedByQuery } from 'src/redux/splitEndpoints/memberSplit';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
import { Autocomplete } from '@mui/material';
///////////////////////////////////////

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

export default function HorseFilterSidebar(props: any) {
  const navigate = useNavigate();
  const selectedFarmSettings = {
    defaultDisplay: 'horseName',
    defaultGeneration: 6,
    source: [],
    verifyStatus: '',
    breed: '',
    startDate: '',
  };

  const [open, setOpen] = React.useState(false);
  const [countryStateList, setCountryStateList] = React.useState<any>([]);
  const { data: countriesList } = useHorseLocationsQuery();
  const { data: horseTypeList } = useHorseTypesQuery();
  const { data: createdByList } = useCreatedByQuery();
  const {
    handleFilter,
    handleFilterApplied,
    rowCount,
    horseModuleAccess,
    page,
    limit,
    orderBy,
    setOrderBy,
    order,
    setOrder,
    handleRemoveFilterApplied,
    isFilterApplied,
    isSearchClicked,
    setIsSearchClicked,
    state,
    setStateValue,
    defaultPageOrderBy,
    setDefaultPageOrderBy,
  } = props;
  const yob = range(1900, 2050);

  // Open and close filter sidebar
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // expand or hide accordian
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const [isHorseNameExactSearch, setIsHorseNameExactSearch] = React.useState(true);
  const [isSireNameExactSearch, setIsSireNameExactSearch] = React.useState(true);
  const [isDamNameExactSearch, setIsDamNameExactSearch] = React.useState(true);
  const [isClearAutoComplete, setIsClearComplete] = React.useState(false);
  const [convertedYoBRangeValue, setConvertedYoBRangeValue] = React.useState(state.YobDate);
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState(
    state.createDate
  );
  const [convertedYobDateValue, setConvertedYobDateValue] = React.useState<any>(state.yobDateValue);
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState<any>(
    state.createDateValue
  );

  React.useEffect(() => {
    props.handleOpenFilterParam(open);
  }, [open]);

  React.useEffect(() => {
    if (convertedYobDateValue[0] !== null && convertedYobDateValue[1] !== null) {
      setStateValue({
        ...state,
        YobDate:
          yearOnlyConvert(convertedYobDateValue[0]) +
          '-' +
          yearOnlyConvert(convertedYobDateValue[1]),
      });
    }
  }, [convertedYobDateValue]);

  React.useEffect(() => {
    if (convertedCreatedDateValue[0] !== null && convertedCreatedDateValue[1] !== null) {
      setStateValue({
        ...state,
        createDate:
          dateHypenConvert(convertedCreatedDateValue[0]) +
          '/' +
          dateHypenConvert(convertedCreatedDateValue[1]),
      });
    }
  }, [convertedCreatedDateValue]);

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    horseName: false,
    sireName: false,
    damName: false,
    country: false,
    yobRange: false,
    eligibility: false,
    stakesStatus: false,
    runnerStatus: false,
    accuracyProfile: false,
    sireStatus: false,
    damStatus: false,
    createdRange: false,
    missingYoB: false,
    missingCoB: false,
    unverified: false,
  });

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        horseName: false,
        sireName: false,
        damName: false,
        country: false,
        yobRange: false,
        eligibility: false,
        stakesStatus: false,
        runnerStatus: false,
        accuracyProfile: false,
        sireStatus: false,
        damStatus: false,
        createdRange: false,
        missingYoB: false,
        missingCoB: false,
        unverified: false,
      });
    }
  };

  // Check if any filter is applied
  const checkFilterApplied = () => {
    if (
      state?.horseName !== '' ||
      state?.sireName !== '' ||
      state?.damName !== '' ||
      state?.countryId != null ||
      state?.stateId != 'none' ||
      yearOnlyConvert(convertedYobDateValue[1]) !== undefined ||
      state?.eligibility != 'none' ||
      state?.horseBreed != null ||
      state?.stakesStatus != 'none' ||
      state?.runnerStatus != 'none' ||
      state?.accuracyProfile != 'none' ||
      state?.sireStatus != 'none' ||
      state?.damStatus != 'none' ||
      state?.createdBy?.fullName != null ||
      dateHypenConvert(convertedCreatedDateValue[1]) !== undefined ||
      state?.isMissingYobClicked ||
      state?.isMissingCobClicked ||
      state?.isUnverifiedClicked
    ) {
      return false;
    } else {
      return true;
    }
  };

  // Set the filter data
  const handleFilterData = () => {
    const data = {
      ...{ page: 1 },
      ...{ limit: limit },
      ...{ order: order },
      ...{ sortBy: state?.isSortByClicked ? orderBy : defaultPageOrderBy },
      ...(state?.horseName !== '' && { horseName: state?.horseName }),
      ...(state?.horseName != '' && { isHorseNameExactSearch: isHorseNameExactSearch }),
      ...(state?.sireName !== '' && { sireName: state?.sireName }),
      ...(state?.sireName != '' && { isSireNameExactSearch: isSireNameExactSearch }),
      ...(state?.damName !== '' && { damName: state?.damName }),
      ...(state?.damName != '' && { isDamNameExactSearch: isDamNameExactSearch }),
      ...(state?.countryId !== null && { countryId: state?.countryId }),
      ...(yearOnlyConvert(convertedYobDateValue[1]) !== undefined && {
        yob:
          yearOnlyConvert(convertedYobDateValue[0]) +
          '-' +
          yearOnlyConvert(convertedYobDateValue[1]),
      }),
      ...(state?.eligibility !== 'none' && { eligibility: state?.eligibility }),
      ...(state?.horseBreed !== null && {
        horseType: state?.horseBreed,
      }),
      ...(state?.stakesStatus !== 'none' && { stakesStatus: state?.stakesStatus }),
      ...(state?.runnerStatus !== 'none' && { runnerStatus: state?.runnerStatus }),
      ...(state?.accuracyProfile !== 'none' && { accuracyProfile: state?.accuracyProfile }),
      ...(state?.sireStatus !== 'none' && { sireStatus: state?.sireStatus }),
      ...(state?.damStatus !== 'none' && { damStatus: state?.damStatus }),
      ...(state?.createdBy?.fullName !== null && { createdBy: state?.createdBy?.fullName }),
      ...(dateHypenConvert(convertedCreatedDateValue[1]) !== undefined && {
        createdDate:
          dateHypenConvert(convertedCreatedDateValue[0]) +
          '/' +
          dateHypenConvert(convertedCreatedDateValue[1]),
      }),
      ...(state?.isMissingYobClicked && { missingYob: state?.missingYob }),
      ...(state?.isMissingCobClicked && { missingCob: state?.missingCob }),
      ...(state?.isUnverifiedClicked && { unVerified: state?.unVerified }),
    };
    setIsSearchClicked(true);
    handleFilter(data);
    handleFilterApplied();
    handleDrawerClose();
  };

  const [openFindDuplicate, setOpenFindDuplicate] = useState(false);

  // Close find duplicate modal
  const handleCloseFindDuplicate = () => {
    setOpenFindDuplicate(false);
  };

  // Open find duplicate modal
  const handleOpenFindDuplicate = () => {
    setOpenFindDuplicate(true);
  };

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

  // Clear all
  const handleClearAll = () => {
    setStateValue({
      horseName: '',
      isHorseNameExactSearch: true,
      sireName: '',
      isSireNameExactSearch: true,
      damName: '',
      isDamNameExactSearch: true,
      countryId: null,
      countryName: { countryName: '' },
      stateId: 'none',
      YobDate: '',
      eligibility: 'none',
      horseBreed: null,
      horseTypeName: { horseTypeName: '' },
      stakesStatus: 'none',
      runnerStatus: 'none',
      accuracyProfile: 'none',
      sireStatus: 'none',
      damStatus: 'none',
      createDate: '',
      createdBy: null,
      missingYob: false,
      missingCob: false,
      unVerified: false,
      isMissingYobClicked: false,
      isMissingCobClicked: false,
      isUnverifiedClicked: false,
      page: page,
      limit: limit,
    });
    setConvertedYoBRangeValue('');
    setConvertedCreatedRangeValue('');
    setCreateDateValue([null, null]);
    setYobDateValue([null, null]);
    setTimeout(() => {
      setIsClearComplete(false);
    }, 1000);
    setIsSearchClicked(false);
    handleRemoveFilterApplied();
    navigate(PATH_DASHBOARD.horsedetails?.data);
    setConvertedCreatedDateValue('');
    setConvertedYobDateValue([null, null]);
  };

  // Check if any checkbox filter is applied then update the state variable
  const handleCheckboxClicked = (type: any, targetValue: any, isTypeClicked: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
      [isTypeClicked]: true,
    });
  };

  // Check if any filter is applied then update the state variable
  const handleChangeField = (e: any, type: any, targetValue: any) => {
    e.stopPropagation();
    setStateValue({
      ...state,
      [type]: targetValue,
    });
    setIsOpenSelectBox({
      horseName: false,
      sireName: false,
      damName: false,
      country: false,
      yobRange: false,
      eligibility: false,
      stakesStatus: false,
      runnerStatus: false,
      accuracyProfile: false,
      sireStatus: false,
      damStatus: false,
      createdRange: false,
      missingYoB: false,
      missingCoB: false,
      unverified: false,
    });
  };

  const [createDateSortSelected, setCreateDateSortSelected] = useState(null);
  const [createDateValue, setCreateDateValue] = useState<DateRangeType>([null, null]);
  const [createDate, setCreateDate] = useState<DateRangeType>([null, null]);

  const fromCreateDateConverted = dateHypenConvert(createDate[0]);
  const toCreateDateConverted = dateHypenConvert(createDate[1]);

  const [yobSortDateSelected, setYobDateSortSelected] = useState(null);
  const [yobDateValue, setYobDateValue] = useState<DateRangeType>([null, null]);
  const [YobDate, setYobDate] = useState<DateRangeType>([null, null]);

  const fromYobConverted = yearOnlyConvert(yobDateValue[0]);
  const toYobConverted = yearOnlyConvert(yobDateValue[1]);

  //HorseName Exact/Partial Functionality
  const [isToggleClass, setIsToggleClass] = React.useState(true);
  const [isPartialToggleClass, setIsPartialToggleClass] = React.useState(false);
  const handleHorseNameToggle = (horseNameFilterType: string) => {
    setIsHorseNameExactSearch(!isHorseNameExactSearch);
    setStateValue({
      ...state,
      isHorseNameExactSearch: !isHorseNameExactSearch,
    });
    if (horseNameFilterType === 'exact') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    } else if (horseNameFilterType === 'partial') {
      setIsToggleClass(!isToggleClass);
      setIsPartialToggleClass(!isPartialToggleClass);
    }
    setIsSireNameToggleClass(isSireNameExactSearch);
    setIsSireNamePartialToggleClass(isSireNamePartialToggleClass);
    setIsDamNameToggleClass(isDamNameToggleClass);
    setIsDamNamePartialToggleClass(isDamNamePartialToggleClass);
  };
  let toggleClass = state?.isHorseNameExactSearch ? 'matched-active' : 'matched-inactive';
  let partialToggleClass = !state?.isHorseNameExactSearch ? 'matched-active' : 'matched-inactive';

  //SireName Exact/Partial Functionality
  const [isSireNameToggleClass, setIsSireNameToggleClass] = React.useState(true);
  const [isSireNamePartialToggleClass, setIsSireNamePartialToggleClass] = React.useState(false);
  const handleSireNameToggle = (horseNameFilterType: string) => {
    setIsSireNameExactSearch(!isSireNameExactSearch);
    setStateValue({
      ...state,
      isSireNameExactSearch: !isSireNameExactSearch,
    });
    if (horseNameFilterType === 'exact') {
      setIsSireNameToggleClass(!isSireNameToggleClass);
      setIsSireNamePartialToggleClass(!isSireNamePartialToggleClass);
    } else if (horseNameFilterType === 'partial') {
      setIsSireNameToggleClass(!isSireNameToggleClass);
      setIsSireNamePartialToggleClass(!isSireNamePartialToggleClass);
    }
    setIsToggleClass(isToggleClass);
    setIsPartialToggleClass(isPartialToggleClass);
    setIsDamNameToggleClass(isDamNameToggleClass);
    setIsDamNamePartialToggleClass(isDamNamePartialToggleClass);
  };
  let sireNameToggleClass = state?.isSireNameExactSearch ? 'matched-active' : 'matched-inactive';
  let sireNamePartialToggleClass = !state?.isSireNameExactSearch
    ? 'matched-active'
    : 'matched-inactive';

  //DamName Exact/Partial Functionality
  const [isDamNameToggleClass, setIsDamNameToggleClass] = React.useState(true);
  const [isDamNamePartialToggleClass, setIsDamNamePartialToggleClass] = React.useState(false);
  const handleDamNameToggle = (horseNameFilterType: string) => {
    setIsDamNameExactSearch(!isDamNameExactSearch);
    setStateValue({
      ...state,
      isDamNameExactSearch: !isDamNameExactSearch,
    });
    if (horseNameFilterType === 'exact') {
      setIsDamNameToggleClass(!isDamNameToggleClass);
      setIsDamNamePartialToggleClass(!isDamNamePartialToggleClass);
    } else if (horseNameFilterType === 'partial') {
      setIsDamNameToggleClass(!isDamNameToggleClass);
      setIsDamNamePartialToggleClass(!isDamNamePartialToggleClass);
    }
    setIsSireNameToggleClass(isSireNameExactSearch);
    setIsSireNamePartialToggleClass(isSireNamePartialToggleClass);
    setIsToggleClass(isToggleClass);
    setIsPartialToggleClass(isPartialToggleClass);
  };

  let damNameToggleClass = state?.isDamNameExactSearch ? 'matched-active' : 'matched-inactive';
  let damNamePartialToggleClass = !state?.isDamNameExactSearch
    ? 'matched-active'
    : 'matched-inactive';

  return (
    <StyledEngineProvider injectFirst>
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal horse-leftbar"
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
              <Typography variant="h3">{fNumber(rowCount)} Horses</Typography>
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
                      <Typography variant="h4">Horse Filters</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box className="FormGroup" sx={{ marginBottom: '0px !important' }}>
                      {/* horse name textbox  with uption to choose either exact/partial search */}
                      <TextField
                        name="horseName"
                        placeholder="Enter Horse"
                        onChange={(e) => handleChangeField(e, 'horseName', e.target.value)}
                        onKeyDown={handleSelectKeyDown}
                        className="edit-field matchcasetext"
                        value={state?.horseName}
                        autoComplete="off"
                        InputProps={{
                          endAdornment: (
                            <>
                              <InputAdornment position="start" className="matchcase">
                                <IconButton
                                  className={`matchcase-first ${toggleClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleHorseNameToggle('exact')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.Aa} alt="Aa" />
                                </IconButton>

                                <IconButton
                                  className={`matchcase-second ${partialToggleClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleHorseNameToggle('partial')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.ab} alt="ab" />
                                </IconButton>
                              </InputAdornment>
                            </>
                          ),
                        }}
                      />

                      {/* Sire name textbox  with uption to choose either exact/partial search */}
                      <TextField
                        name="sireName"
                        placeholder="Enter Sire"
                        onChange={(e) => handleChangeField(e, 'sireName', e.target.value)}
                        onKeyDown={handleSelectKeyDown}
                        className="edit-field matchcasetext"
                        value={state?.sireName}
                        autoComplete="off"
                        InputProps={{
                          endAdornment: (
                            <>
                              <InputAdornment position="start" className="matchcase">
                                <IconButton
                                  className={`matchcase-first ${sireNameToggleClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleSireNameToggle('exact')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.Aa} alt="Aa" />
                                </IconButton>

                                <IconButton
                                  className={`matchcase-second ${sireNamePartialToggleClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleSireNameToggle('partial')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.ab} alt="ab" />
                                </IconButton>
                              </InputAdornment>
                            </>
                          ),
                        }}
                      />

                      {/* Dam name textbox  with uption to choose either exact/partial search */}
                      <TextField
                        name="damName"
                        placeholder="Enter Dam"
                        onChange={(e) => handleChangeField(e, 'damName', e.target.value)}
                        onKeyDown={handleSelectKeyDown}
                        className="edit-field matchcasetext"
                        value={state?.damName}
                        autoComplete="off"
                        InputProps={{
                          endAdornment: (
                            <>
                              <InputAdornment position="start" className="matchcase">
                                <IconButton
                                  className={`matchcase-first ${damNameToggleClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleDamNameToggle('exact')}
                                  sx={{ marginRight: '0px', padding: '0px' }}
                                >
                                  <img src={Images.Aa} alt="Aa" />
                                </IconButton>

                                <IconButton
                                  className={`matchcase-second ${damNamePartialToggleClass}`}
                                  aria-label="toggle password visibility"
                                  edge="end"
                                  onClick={() => handleDamNameToggle('partial')}
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
                          renderInput={(params: any) => (
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
                      <Box className="edit-field calender-wrapper" onKeyDown={handleSelectKeyDown}>
                        <CustomFilterRangePicker
                          placeholderText="Select Year of Birth"
                          convertedDateRangeValue={convertedYoBRangeValue}
                          setConvertedDateRangeValue={setConvertedYoBRangeValue}
                          convertedDateValue={convertedYobDateValue}
                          setConvertedYobDateValue={setConvertedYobDateValue}
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
                      {/* Eligibility selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, eligibility: false }),
                          }}
                          open={isOpenSelectBox.eligibility}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, eligibility: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, eligibility: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          name="eligibility"
                          className="filter-slct"
                          value={state?.eligibility}
                          onChange={(e) => handleChangeField(e, 'eligibility', e.target.value)}
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Select Eligibility</em>
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Eligible" key="Eligible">
                            Eligible
                          </MenuItem>
                          <MenuItem
                            className="selectDropDownList"
                            value="Ineligible"
                            key="Ineligible"
                          >
                            Ineligible
                          </MenuItem>
                        </Select>
                      </Box>

                      {/* Horse Breed selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Autocomplete
                          disablePortal
                          popupIcon={<KeyboardArrowDownRoundedIcon />}
                          options={horseTypeList || []}
                          getOptionLabel={(option: any) => option?.horseTypeName}
                          renderInput={(params) => (
                            <TextField {...params} placeholder={`Select Horse Breed`} />
                          )}
                          value={state?.horseTypeName ? state?.horseTypeName : null}
                          onChange={(e: any, selectedOptions: any) =>
                            setStateValue({
                              ...state,
                              horseBreed: selectedOptions?.id,
                              horseTypeName: selectedOptions,
                            })
                          }
                          className="mareBlockInput"
                        />
                      </Box>

                      {/* Stakes Status selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, stakesStatus: false }),
                          }}
                          open={isOpenSelectBox.stakesStatus}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, stakesStatus: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, stakesStatus: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          name="stakesStatus"
                          className="filter-slct"
                          value={state?.stakesStatus}
                          onChange={(e) => handleChangeField(e, 'stakesStatus', e.target.value)}
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Select Stakes Status</em>
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="All" key="All">
                            All
                          </MenuItem>
                          <MenuItem
                            className="selectDropDownList"
                            value="Stakes Winner"
                            key="Stakes Winner"
                          >
                            Stakes Winner
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Other" key="Other">
                            Other
                          </MenuItem>
                        </Select>
                      </Box>

                      {/* Runner Status selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, runnerStatus: false }),
                          }}
                          open={isOpenSelectBox.runnerStatus}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, runnerStatus: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, runnerStatus: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          name="runnerStatus"
                          className="filter-slct"
                          value={state?.runnerStatus}
                          onChange={(e) => handleChangeField(e, 'runnerStatus', e.target.value)}
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Select Runner Status</em>
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="All" key="All">
                            All
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Runner" key="Runnerr">
                            Runner
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Other" key="Other">
                            Other
                          </MenuItem>
                        </Select>
                      </Box>

                      {/* Accuracy Profile selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, accuracyProfile: false }),
                          }}
                          open={isOpenSelectBox.accuracyProfile}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, accuracyProfile: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, accuracyProfile: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          name="accuracyProfile"
                          className="filter-slct"
                          value={state?.accuracyProfile}
                          onChange={(e) => handleChangeField(e, 'accuracyProfile', e.target.value)}
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Accuracy Profile</em>
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Poor" key="poor">
                            Poor
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Good" key="good">
                            Good
                          </MenuItem>
                          <MenuItem
                            className="selectDropDownList"
                            value="Excellent"
                            key="excellent"
                          >
                            Excellent
                          </MenuItem>
                          <MenuItem
                            className="selectDropDownList"
                            value="Outstanding"
                            key="very-good"
                          >
                            Outstanding
                          </MenuItem>
                        </Select>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  defaultExpanded={false}
                  onChange={handleChange('panel3')}
                  className="accordionDrawer"
                >
                  <AccordionSummary
                    expandIcon={<KeyboardArrowDownRoundedIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Box py={2}>
                      <Typography variant="h4">Data Audit Filters</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box className="FormGroup" sx={{ marginBottom: '0px !important' }}>
                      {/* Sire Status selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, sireStatus: false }),
                          }}
                          open={isOpenSelectBox.sireStatus}
                          onOpen={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, sireStatus: true })
                          }
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, sireStatus: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          name="sireStatus"
                          className="filter-slct"
                          value={state?.sireStatus}
                          onChange={(e) => handleChangeField(e, 'sireStatus', e.target.value)}
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Select Sire Status</em>
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="All" key="All">
                            All
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Present" key="Present">
                            Present
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Empty" key="Empty">
                            Empty
                          </MenuItem>
                          <MenuItem
                            className="selectDropDownList"
                            value="No Record"
                            key="No Record"
                          >
                            No Record
                          </MenuItem>
                        </Select>
                      </Box>

                      {/* Dam Status selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Select
                          MenuProps={{
                            ...MenuPropss,
                            onClose: () =>
                              setIsOpenSelectBox({ ...isOpenSelectBox, damStatus: false }),
                          }}
                          open={isOpenSelectBox.damStatus}
                          onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, damStatus: true })}
                          onClose={() =>
                            setIsOpenSelectBox({ ...isOpenSelectBox, damStatus: false })
                          }
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          name="damStatus"
                          className="filter-slct"
                          value={state?.damStatus}
                          onChange={(e) => handleChangeField(e, 'damStatus', e.target.value)}
                        >
                          <MenuItem className="selectDropDownList" value="none" disabled>
                            <em>Select Dam Status</em>
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="All" key="All">
                            All
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Present" key="Present">
                            Present
                          </MenuItem>
                          <MenuItem className="selectDropDownList" value="Empty" key="Empty">
                            Empty
                          </MenuItem>
                          <MenuItem
                            className="selectDropDownList"
                            value="No Record"
                            key="No Record"
                          >
                            No Record
                          </MenuItem>
                        </Select>
                      </Box>
                      <Box className="calender-wrapper" onKeyDown={handleSelectKeyDown}>
                        <Box className="edit-field">
                          <CustomFilterRangePicker
                            placeholderText="Select Created Date"
                            convertedDateRangeValue={convertedCreatedRangeValue}
                            setConvertedDateRangeValue={setConvertedCreatedRangeValue}
                            convertedDateValue={convertedCreatedDateValue}
                            setConvertedYobDateValue={setConvertedCreatedDateValue}
                            handleSelectKeyDown={handleSelectKeyDown}
                          />
                        </Box>
                      </Box>

                      {/* Created By selectbox */}
                      <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                        <Autocomplete
                          disablePortal
                          popupIcon={<KeyboardArrowDownRoundedIcon />}
                          options={createdByList || []}
                          getOptionLabel={(option: any) => option?.fullName}
                          renderInput={(params) => (
                            <TextField {...params} placeholder={`Created by`} />
                          )}
                          value={state?.createdBy ? state?.createdBy : null}
                          onChange={(e: any, selectedOptions: any) =>
                            setStateValue({
                              ...state,
                              createdBy: selectedOptions,
                            })
                          }
                          className="mareBlockInput"
                        />
                      </Box>
                    </Box>

                    {/* Missing YoB, Missing CoB, Unverified checkbox */}
                    <Box
                      className="FormGroup RadioGroupWrapperouter"
                      mt={2}
                      sx={{ marginBottom: '5px !important' }}
                    >
                      <Box className="RadioGroupWrapper" onKeyDown={handleSelectKeyDown}>
                        <FormControl>
                          <FormControlLabel
                            control={
                              <Checkbox
                                disableRipple
                                className="isPrivateFee"
                                name={'missingYob'}
                                checked={state?.missingYob}
                                onChange={(e) =>
                                  handleCheckboxClicked(
                                    'missingYob',
                                    e.target.checked,
                                    'isMissingYobClicked'
                                  )
                                }
                                value={state?.missingYob}
                                key={'Missing Year of Birth'}
                                icon={<img src={Images.Radiounchecked} />}
                                checkedIcon={<img src={Images.Radiochecked} />}
                              />
                            }
                            label={'Missing Year of Birth'}
                          />
                        </FormControl>
                      </Box>
                      <Box className="RadioGroupWrapper" onKeyDown={handleSelectKeyDown}>
                        <FormControl>
                          <FormControlLabel
                            control={
                              <Checkbox
                                disableRipple
                                className="isPrivateFee"
                                name={'missingCob'}
                                checked={state?.missingCob}
                                onChange={(e) =>
                                  handleCheckboxClicked(
                                    'missingCob',
                                    e.target.checked,
                                    'isMissingCobClicked'
                                  )
                                }
                                value={state?.missingCob}
                                key={'Missing Country of Birth'}
                                icon={<img src={Images.Radiounchecked} />}
                                checkedIcon={<img src={Images.Radiochecked} />}
                              />
                            }
                            label={'Missing Country of Birth'}
                          />
                        </FormControl>
                      </Box>
                      <Box className="RadioGroupWrapper" onKeyDown={handleSelectKeyDown}>
                        <FormControl>
                          <FormControlLabel
                            control={
                              <Checkbox
                                disableRipple
                                className="isPrivateFee"
                                name={'unVerified'}
                                checked={state?.unVerified}
                                onChange={(e) =>
                                  handleCheckboxClicked(
                                    'unVerified',
                                    e.target.checked,
                                    'isUnverifiedClicked'
                                  )
                                }
                                value={state?.unVerified}
                                key={'Unverified'}
                                icon={<img src={Images.Radiounchecked} />}
                                checkedIcon={<img src={Images.Radiochecked} />}
                              />
                            }
                            label={'Unverified'}
                          />
                        </FormControl>
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

                  <Grid container spacing={1} className="DrawerBtnBottom">
                    <Grid item xs={12} md={12} sx={{ paddingTop: '10px !important' }}>
                      <Button
                        onClick={handleOpenFindDuplicate}
                        className="search-btn search-btn-outline"
                        fullWidth
                        disabled={horseModuleAccess?.horse_filter_duplicate === true ? false : true}
                      >
                        Show Duplicates
                      </Button>
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            )}
          </Box>
        </Scrollbar>
      </Drawer>
      {/* Find duplicate modal */}
      <FindDuplicatesWrapperDialog
        title="Find Duplicates"
        open={openFindDuplicate}
        close={handleCloseFindDuplicate}
      />
    </StyledEngineProvider>
  );
}

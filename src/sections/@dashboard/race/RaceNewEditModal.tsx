import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
// @mui
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { LoadingButton } from '@mui/lab';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Select from '@mui/material/Select';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  Button,
  MenuItem
} from '@mui/material';
import { SxProps } from "@mui/system";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { MenuProps } from 'src/constants/MenuProps';
import { toPascalCase } from 'src/utils/customFunctions';
import { getStateById } from 'src/redux/splitEndpoints/stallionServiceSplit';
import { useAddRacesMutation, useChangeEligibilityMutation, useEditRaceMutation, useRaceClassQuery, useRaceDistanceUnitApiQuery, useRaceQuery, useRaceStakeQuery, useRaceStatusAgeRestrictionQuery, useRaceStatusQuery, useRaceStatusSexRestrictionQuery, useRaceTrackConditionQuery, useRaceTrackTypeQuery, useRaceTypeQuery, useRaceVenueQuery } from 'src/redux/splitEndpoints/raceSplit';
import { RaceEligibleWrapperDialog } from 'src/components/race-modal/RaceEligibleWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import CustomDatePicker from 'src/components/customDatePicker/CustomDatePicker';
import VenuAutoFilters from 'src/components/VenuAutoFilters';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { Spinner } from 'src/components/Spinner';
import { CircularSpinner } from 'src/components/CircularSpinner';

const drawerWidth = 654;
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

// HtmlTooltip
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

export default function RaceNewEditModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    apiStatus, setApiStatus, 
    apiStatusMsg, setApiStatusMsg,
    valuesExist, setValuesExist,
    clickedPopover, setClickedPopover
  } = props;

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginRight: '0px',
        marginTop: '0px',
        width: '228px',
        borderRadius: '6px 6px 6px 6px',
        boxSizing: 'border-box',
      },
    },
  }

  const paperSx: SxProps = {
    "& .MuiPaper-root": {
      fontFamily: 'Synthese-Book',
    },

    "& .MuiClockPicker-root button.css-1fz2goj-MuiButtonBase-root-MuiIconButton-root": {
      background: '#1D472E',
      fontFamily: 'Synthese-Book',

    },
    "& .MuiClockPicker-root .css-u3dgvv-MuiButtonBase-root-MuiIconButton-root": {
      background: '#1D472E',
      fontFamily: 'Synthese-Book',
    },
    "& .css-1ruaz1i": {
      background: '#1D472E',
      borderColor: '#1D472E',
    },

    "& .css-b6d8hq": {
      background: '#1D472E',
    },

    "& .css-1boh581": {
      background: '#1D472E',
    },
    "& .css-iyyrwa": {
      borderColor: '#1D472E',
    },
    "& .css-1ptj7dt": {
      fontSize: '14px',
    },
    "& .MuiIconButton-edgeEnd, .MuiIconButton-edgeStart": {
      color: '#161716',
    },
    "& .css-u5dyjw-MuiButtonBase-root-MuiIconButton-root,.css-seummm-MuiButtonBase-root-MuiIconButton-root": {
      color: '#161716',
    },
    "& .css-eziifo": {
      background: '#e2e7e1',
    }
  };

  // initial state of userModuleAccessAddBtn
  const [isEligibilityDisable, setIsEligibilityDisable] = useState(true);
  const [raceAndRunnerModuleAccessAddBtn, setRaceAndRunnerModuleAccessAddBtn] = useState({
    raceAndRunner_add: false,
    raceAndRunner_edit: false,
    raceAndRunner_merge: false,
    raceAndRunner_eligibility: true,
    raceAndRunner_update_status: true,
    raceAndRunner_list: false,
  });
  // call on valuesExist
  React.useEffect(() => {
    setRaceAndRunnerModuleAccessAddBtn({
      ...raceAndRunnerModuleAccessAddBtn,
      raceAndRunner_add: !valuesExist?.hasOwnProperty('RACE_ADMIN_ADD_NEW_RACE') ? false : true,
      raceAndRunner_edit: !valuesExist?.hasOwnProperty('RACE_ADMIN_EDIT_EXISTING_RACE_DETAILS') ? false : true,
      raceAndRunner_merge: !valuesExist?.hasOwnProperty('RACE_ADMIN_MERGE_RACE') ? false : true,
      raceAndRunner_list: !valuesExist?.hasOwnProperty('RACE_ADMIN_SEARCH_VIEW_READONLY') ? false : true,
      // raceAndRunner_eligibility: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_UPDATE_ELIGIBILITY_OF_RACE') ? false : true,
      // raceAndRunner_update_status: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_UPDATE_RACE_STATUS_GLOBAL') ? false : true,
    });
    if (valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_EDIT_INFORMATION_EXCLUDING_BULK_ELIGIBILITY_UPDATE') || valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_UPDATE_ELIGIBILITY_OF_RACE') || valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_READ_ONLY')) {
      setIsEligibilityDisable(false);
    }
  }, [valuesExist]);
  // console.log(valuesExist,'valuesExist')

  const navigate = useNavigate();
  const [addRace] = useAddRacesMutation();
  const [editRace] = useEditRaceMutation();
  const [stateList, setStateList] = useState<any>([]);
  const [isExist, setIsExist] = React.useState(false);
  const [changeEligibility] = useChangeEligibilityMutation();
  const [onYesClick, setOnYesClick] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [state, setStateValue] = useState<any>({
    raceDate: null,
    raceTime: null,
    trackTypeId: '',
    raceStatusId: '',
    raceName: '',
    raceDistance: null,
    trackConditionId: '',
    distanceUnitId: '',
    raceStakeId: '',
    raceAgeRestrictionId: '',
    raceSexRestrictionId: '',
    racePrizemoney: null,
    countryId: "",
    venueId: '',
    venue: '',
    raceClassId: '',
    raceTypeId: '',
    id: null,
    isEligible: true,
    currencyId: '',
    stateId: '',
    raceNumber: ''
  })

  // Api calls
  const { data: countriesList } = useCountriesQuery();
  const { data: trackConditionList } = useRaceTrackConditionQuery();
  const { data: trackTypeList } = useRaceTrackTypeQuery();
  const { data: raceTypeList } = useRaceTypeQuery();
  const { data: raceClassList } = useRaceClassQuery();
  const { data: raceStakeList } = useRaceStakeQuery();
  const { data: raceStatusList } = useRaceStatusQuery();
  const { data: raceStatusAgeRestriList } = useRaceStatusAgeRestrictionQuery();
  const { data: raceStatusSexRestriList } = useRaceStatusSexRestrictionQuery();
  const { data: raceDistanceUnitList } = useRaceDistanceUnitApiQuery();
  const { data: currenciesList } = useCurrenciesQuery();

  // Close popup
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  // close Drawer
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  // Show default value on edit
  useEffect(() => {
    if (!openAddEditForm) {
      handleDefaultValues();
      setErrors({});
    }
  }, [openAddEditForm])

  // Expand accordion
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const { data: farmData, error, isFetching, isLoading, isSuccess } = useRaceQuery(rowId, { skip: (!isEdit) });
  const currentFarm = isEdit ? !isLoading ? farmData : farmData : farmData;

  // Handle default values
  const handleDefaultValues = () => {
    getStates(currentFarm?.countryId)
    setStateValue({
      ...state,
      raceDate: currentFarm?.raceDate || null,
      raceTime: currentFarm?.raceTime || null,
      trackTypeId: currentFarm?.trackTypeId || '',
      raceStatusId: currentFarm?.raceStatusId || '',
      raceName: currentFarm?.raceName || '',
      raceDistance: currentFarm?.raceDistance || '',
      trackConditionId: currentFarm?.trackConditionId || '',
      distanceUnitId: currentFarm?.distanceUnitId || '',
      raceStakeId: currentFarm?.raceStakeId || '',
      raceAgeRestrictionId: currentFarm?.raceAgeRestrictionId || '',
      raceSexRestrictionId: currentFarm?.raceSexRestrictionId || '',
      racePrizemoney: currentFarm?.racePrizemoney || '',
      countryId: currentFarm?.countryId ? currentFarm?.countryId : '',
      venueId: currentFarm?.venueId || '',
      venue: currentFarm?.venue || '',
      raceClassId: currentFarm?.raceClassId || '',
      raceTypeId: currentFarm?.raceTypeId || '',
      id: currentFarm?.raceUuid || null,
      isEligible: currentFarm?.isEligible || false,
      currencyId: currentFarm?.currencyId || '',
      stateId: currentFarm?.stateId || '',
      raceNumber: currentFarm?.raceNumber || '',
    })
  }

  // Reset form
  React.useEffect(() => {
    if (isEdit && currentFarm) {
      handleDefaultValues()
    }
    if (!isEdit) {
      resetData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentFarm]);

  // Reset form
  const resetData = () => {
    setStateValue({
      raceDate: null,
      raceTime: null,
      trackTypeId: '',
      raceStatusId: '',
      raceName: '',
      raceDistance: null,
      trackConditionId: '',
      distanceUnitId: '',
      raceStakeId: '',
      raceAgeRestrictionId: '',
      raceSexRestrictionId: '',
      racePrizemoney: null,
      countryId: '',
      venueId: '',
      venue: '',
      raceClassId: '',
      raceTypeId: '',
      id: null,
      isEligible: false,
      currencyId: '',
      stateId: '',
      raceNumber: ''
    })
  }

  // Submit form
  const onSubmit = async (event: any) => {
    event.preventDefault();
    if (!validateForm()) return
    try {
      const finalData: any = { ...state };

      finalData.raceAgeRestrictionId = parseInt(String(finalData.raceAgeRestrictionId));
      finalData.raceClassId = parseInt(String(finalData.raceClassId));
      finalData.raceSexRestrictionId = parseInt(String(finalData.raceSexRestrictionId));
      finalData.raceStakeId = parseInt(String(finalData.raceStakeId));
      finalData.raceStatusId = parseInt(String(finalData.raceStatusId));
      finalData.raceTypeId = parseInt(String(finalData.raceTypeId));
      finalData.trackConditionId = parseInt(String(finalData.trackConditionId));
      finalData.trackTypeId = parseInt(String(finalData.trackTypeId));
      finalData.venueId = parseInt(String(finalData.venueId));
      finalData.currencyId = parseInt(String(finalData.currencyId));
      finalData.distanceUnitId = parseInt(String(finalData.distanceUnitId));
      finalData.racePrizemoney = parseInt(String(finalData.racePrizemoney));
      finalData.raceDistance = parseInt(String(finalData.raceDistance));
      finalData.raceNumber = parseInt(String(finalData.raceNumber));
      finalData.raceDate = (format(new Date(state.raceDate), 'yyyy-MM-dd'));
      finalData.displayName = state.raceName;
      delete finalData.id;
      delete finalData.stateId;
      delete finalData.venue;

      let res: any = isEdit ? await editRace({ ...finalData, id: rowId }) : await addRace(finalData);
      if (res.error) {
        setApiStatusMsg({ 'status': 422, 'message': res?.error?.data?.message });
        setApiStatus(true);
      } else {
        setApiStatusMsg({ 'status': 201, 'message': res?.data?.message });
        setApiStatus(true);
        resetData();
        if (isEdit) {
          handleCloseModal()
        } else {
          handleDrawerCloseRow()
        }
      }
    } catch (error) {
    }
  };

  const [errors, setErrors] = React.useState<any>({});
  const [countryID, setCountryID] = React.useState(currentFarm?.countryId);
  const [isCountrySelected, setIsCountrySelected] = React.useState((currentFarm?.countryId > 0) ? true : false);
  const [openMergeFarmAccountsWrapper, setOpenMergeFarmAccountsWrapper] = useState(false);
  const [openRaceEligibleWrapper, setOpenRaceEligibleWrapper] = useState(false);

  // handle country id
  const handlecountryChange = (event: any) => {
    setCountryID(event.target.value);
    setIsCountrySelected(true);
  };

  // based on country id fetch states list
  useEffect(() => {
    setIsCountrySelected(currentFarm?.countryId > 0 ? true : false);
    getStates(currentFarm?.countryId || state?.countryId)
  }, [currentFarm?.countryId || state?.countryId]);

  // Close Merge race modal
  const handleCloseMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(false);
  };

  // Open Merge race modal
  const handleOpenMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(true);
  };

  // Close race eligible modal
  const handleCloseRaceEligibleWrapper = () => {
    setOpenRaceEligibleWrapper(false);
  };

  // Open race eligible modal
  const handleOpenRaceEligibleWrapper = () => {
    setOpenRaceEligibleWrapper(true);
  };

  // Get state list as per country id
  const getStates = async (id: any) => {
    let res = await getStateById(id);
    if (res) {
      setStateList(res)
    }
  }

  // Set eligible value form modal
  useEffect(() => {
    if (!openRaceEligibleWrapper) {
      if (!onYesClick) {
        setStateValue({
          ...state,
          isEligible: !state.isEligible
        })
      }
      setOnYesClick(false);
    }
  }, [openRaceEligibleWrapper])

  // Set form state
  const handleChangeField = (type: any, targetValue: any) => {
    if (type === 'countryId') {
      getStates(targetValue)
    }
    setStateValue({
      ...state,
      [type]: targetValue
    })
    if (type === 'isEligible') {
      if (isEdit && !isEligibilityDisable) {
        setOpenRaceEligibleWrapper(true);
      } 
    }
    if (type === 'raceDistance') {
      let newRaceName = targetValue.replace(/[^0-9]/g,''); 
      setStateValue({
      ...state,
      [type]: targetValue ? newRaceName : targetValue
    })
  }
  }

  // Validate form
  let validateForm = () => {
    /*eslint-disable */
    let fields = state;
    let errors = {};
    let formIsValid = true;
    //@ts-ignore
    if (!fields["raceDate"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceDate"] = `Date is required`;
    }
    if (!fields["raceTime"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceTime"] = `Time is required`;
    }
    if (!fields["trackTypeId"]) {
      formIsValid = false;  //@ts-ignore
      errors["trackTypeId"] = `Track type required`;
    }
    if (!fields["raceStatusId"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceStatusId"] = `Race status required`;
    }
    if (!fields["raceName"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceName"] = `Race name required`;
    } 
    if (!fields["raceDistance"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceDistance"] = `Race distance required`;
    }
    if (!fields["trackConditionId"]) {
      formIsValid = false;  //@ts-ignore
      errors["trackConditionId"] = `Track condition required`;
    }
    if (!fields["distanceUnitId"]) {
      formIsValid = false;  //@ts-ignore
      errors["distanceUnitId"] = `Distance unit required`;
    }
    if (!fields["raceStakeId"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceStakeId"] = `Race stake required`;
    }
    if (!fields["raceAgeRestrictionId"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceAgeRestrictionId"] = `Race age restriction required`;
    }
    if (!fields["raceSexRestrictionId"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceSexRestrictionId"] = `Race sex restriction required`;
    }
    if (!fields["racePrizemoney"]) {
      formIsValid = false;  //@ts-ignore
      errors["racePrizemoney"] = `Race prizemoney required`;
    }
    if (!fields["venueId"]) {
      formIsValid = false;  //@ts-ignore
      errors["venueId"] = `Venue required`;
    }
    if (!fields["raceClassId"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceClassId"] = `Race class required`;
    }
    if (!fields["raceTypeId"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceTypeId"] = `Race type required`;
    }
    if (!fields["raceNumber"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceNumber"] = `Race Number required`;
    }
    if (!fields["countryId"]) {
      formIsValid = false;  //@ts-ignore
      errors["countryId"] = `Country required`;
    }
    if (!fields["currencyId"]) {
      formIsValid = false;  //@ts-ignore
      errors["currencyId"] = `Currency required`;
    }
    setErrors(errors)
    return formIsValid
    /*eslint-enable */
  }

  // Handle venue state
  const handleVenuChange = (val: any) => {
    const updatedData = { ...state, ...val }
    setStateValue(updatedData)
  }

  // Handle on success and error toast message
  const handleOnSuccess = (res: any) => {
    if (res?.data?.statusCode) {
      if (res?.data?.statusCode === 200) {
        setApiStatusMsg({ 'status': 201, 'message': res?.data?.message });
        setApiStatus(true);
        setOpenRaceEligibleWrapper(false);
      }
    } else {
      if (res.error) {
        setApiStatusMsg({ 'status': 422, 'message': res?.error?.data?.message });
        setApiStatus(true);
      }
    }
  }

  // Redirect to runners
  const handleRedirectToRunnerFilter = () => {
    if (!raceAndRunnerModuleAccessAddBtn?.raceAndRunner_list) {
      setClickedPopover(true);
    } else {
      navigate(PATH_DASHBOARD.runnerdetails.filter(state.id))
    }
  }

  return (
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          // overflow: 'scroll',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root':
        {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className='filter-section DrawerRightModal RaceEditModal'
    >
      <Scrollbar
        className='DrawerModalScroll'
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: "100vh",
            // overflow: "scroll",
            background: "#E2E7E1",
          },
        }}
      >
        <CssBaseline />
        <DrawerHeader className='race-header'>
          <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}>
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>
        {isFetching ?<Box className='raceLoader'><CircularSpinner /></Box> : ''}
        {isEdit === undefined && raceAndRunnerModuleAccessAddBtn.raceAndRunner_add === false && <UnAuthorized />}
        {isEdit === true && raceAndRunnerModuleAccessAddBtn.raceAndRunner_edit === false && <UnAuthorized />}

        {
        ((isSuccess && raceAndRunnerModuleAccessAddBtn.raceAndRunner_edit === true) || (isEdit === undefined && raceAndRunnerModuleAccessAddBtn.raceAndRunner_add === true)) && (
        <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
          <Typography variant="h4" className='ImportedHeader'>Imported<i className="icon-Confirmed-24px"></i></Typography>
          {/* Race Add/Edit Form */}
          <form onSubmit={onSubmit}>
            <Box px={0}>
              <Grid container spacing={2.3} mt={0} pt={0} className='RaceListModalBox'>

                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='calender-wrapper'>
                      <Box className={`edit-field ${errors.raceDate ? 'Mui-error' : " "}`}>
                        <CustomDatePicker
                          placeholderText='Date'
                          value={state?.raceDate ? state?.raceDate : ''}
                          handleChange={(newValue: any) => { handleChangeField("raceDate", newValue) }}
                          isError={errors.raceDate}
                        />
                      </Box>
                    </Box>
                    {state?.raceDate === null && <p className="error-text">{errors.raceDate}</p>}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='calender-wrapper'>
                      <Box className={`edit-field ${errors.raceTime ? 'Mui-error' : " "}`}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <TimePicker

                            PaperProps={{
                              sx: paperSx,
                            }}
                            className='timePicker'
                            value={state?.raceTime}
                            onChange={(newValue) => {
                              handleChangeField("raceTime", newValue)
                              // setValue(rest.name, String(newValue)?.toString());
                            }}
                            renderInput={(params) => <TextField className="datepicker"  {...params} inputProps={{
                              ...params.inputProps,
                              placeholder: "Time"

                            }}
                            error={(errors.raceTime && state.raceTime === null) ? true : false}
                            />}
                          />
                        </LocalizationProvider>
                      </Box>
                    </Box>
                    {state.raceTime === null && <p className="error-text">{errors.raceTime}</p>}
                    {/* <RHFTextField name="time" placeholder='Time' className='edit-field' /> */}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <VenuAutoFilters
                        setFarmId={handleVenuChange}
                        state={state}
                        setStateValueId={(value: any) => { if (value) setStateValue({ ...state, venueId: value?.id, countryId: value?.countryId, stateId: value?.stateId, trackTypeId: value?.trackTypeId }) }}
                        pageType={'stallionForm'}
                        isEdit={true}
                        isExist={isExist}
                        isOpen={open || openAddEditForm}
                        displayName={state.venue}
                        isInsideEdit={true}
                        isError={errors.venueId}
                      />
                      {/* <Select
                        MenuProps={{
                          disableScrollLock: true,
                        }}
                        placeholder="Select venue"
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        onChange={(e) => handleChangeField("venueId", e.target.value)}
                        value={(state?.venueId === "") ? 'none' : state?.venueId}
                        name="venueId">
                        <MenuItem className="selectDropDownList" value="none" disabled selected>Select Venue</MenuItem>
                        {venulist?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.displayName}</MenuItem>
                          )
                        })}
                      </Select> */}
                      {/* <MenuItem className="selectDropDownList" value="Mumbai">Mumbai</MenuItem> */}
                      {state.venueId === "" && <p className="error-text">{errors.venueId}</p>}
                      {/* isEdit ? defaultValues?.venue : "''"  value={isEdit ? getValues('venue') : "''"}*/}
                    </Box>

                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select

                        IconComponent={KeyboardArrowDownRoundedIcon}
                        defaultValue={"''"}
                        className="countryDropdown filter-slct"
                        onChange={(e) => handleChangeField("countryId", e.target.value)}
                        value={(state?.countryId === "") ? 'none' : state?.countryId}
                        error={(errors.countryId && state?.countryId === "") ? true : false}
                        // onChange={(v) => { setValue('country', v?.target?.value, { shouldValidate: true }) }}
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList countryDropdownList race-country" value="none" disabled><em>Country</em></MenuItem>
                        {countriesList?.map(({ id, countryName }) => {
                          return (
                            <MenuItem className="selectDropDownList countryDropdownList race-country" value={id} key={id}>
                              {countryName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {/* <Select
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        defaultValue={"''"}
                        className="countryDropdown filter-slct"
                        onChange={(e) => handleChangeField("countryId", e.target.value)}
                        value={currentFarm && (state?.countryId.length === 0) ? [] : state?.countryId}
                        multiple
                        displayEmpty
                        renderValue={
                          state?.countryId.length !== 0 ? undefined : () => <Placeholder><em>Country</em></Placeholder>
                          }
                        // onChange={(v) => { setValue('country', v?.target?.value, { shouldValidate: true }) }}
                        MenuProps={{
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList countryDropdownList lg"  value="none" disabled selected><em>Country</em></MenuItem>
                        {countriesList?.map(({ id, countryName }) => {
                          return (
                            <MenuItem className="selectDropDownList countryDropdownList lg" value={id} key={id}>
                              {countryName}
                            </MenuItem>
                          );
                        })}
                      </Select> */}
                      {state?.countryId === "" && <p className="error-text">{errors.countryId}</p>}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        placeholder="Select track type"
                        onChange={(e) => handleChangeField("trackTypeId", e.target.value)}
                        error={(errors?.trackTypeId && state?.trackTypeId === "") ? true : false}
                        value={(state?.trackTypeId === "") ? 'none' : state?.trackTypeId}

                        // onChange={(v) => { setValue('trackTypeId', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('trackTypeId')}
                        defaultValue={"''"}
                        name="trackTypeId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Track Type</em></MenuItem>
                        {trackTypeList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v?.id} value={v?.id}>{toPascalCase(v?.displayName)}</MenuItem>
                          )
                        })}
                      </Select>
                      {state?.trackTypeId === "" && <p className="error-text">{errors.trackTypeId}</p>}
                    </Box>
                  </Box>
                </Grid>
                {/* value={isEdit ? getValues('trackType') : "''"} */}

                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        onChange={(e) => handleChangeField("stateId", e.target.value)}
                        value={(state?.stateId === "" || state?.stateId === null) ? 'none' : stateList?.length === 0 ? 'none' : state?.stateId}
                        // onChange={(v) => { setValue('trackConditionId', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('trackConditionId')}
                        defaultValue="''"
                        name="trackConditionId"
                        // error={(state?.stateId === "" || state?.stateId === null) ? true : false}
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>State</em></MenuItem>
                        {stateList.length &&
                          stateList?.map((v: any, i: number) => {
                            return <MenuItem className="selectDropDownList" value={v?.id} key={v?.id}>{v?.stateName}</MenuItem>
                          })}
                      </Select>
                      <p className="error-text">{errors.stateId}</p>
                    </Box>
                  </Box>
                </Grid>


                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>

                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        onChange={(e) => handleChangeField("trackConditionId", e.target.value)}
                        value={(state?.trackConditionId === "") ? 'none' : state?.trackConditionId}
                        // onChange={(v) => { setValue('trackConditionId', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('trackConditionId')}
                        error={(errors?.trackConditionId && state?.trackConditionId === "") ? true : false}
                        defaultValue="''" name="trackConditionId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Track Condition</em></MenuItem>
                        {trackConditionList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList selectTrack" key={v?.id} value={v?.id}>{toPascalCase(v?.displayName)}</MenuItem>
                          )
                        })}
                      </Select>
                      {state?.trackConditionId === "" && <p className="error-text">{errors.trackConditionId}</p>}
                    </Box>
                  </Box>
                </Grid>


                <Grid item xs={3.5} md={3.5} mt={-1.5} className='racelistgroup'>
                  <Box className='edit-field'>
                    {/* {isEdit && */}
                    <TextField type={'number'} error={(errors?.raceNumber && state?.raceNumber === '') ? true : false}
                      name="raceNumber" value={state?.raceNumber} onChange={(e) => handleChangeField("raceNumber", e.target.value)} placeholder='Race #' className=''
                    />
                    {/* // } */}
                    {state?.raceNumber === '' && <p className="error-text">{errors.raceNumber}</p>}
                  </Box>
                </Grid>
                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <TextField
                      name="raceName" error={( errors?.raceName && state?.raceName === '') ? true : false}
                      onChange={(e) => handleChangeField("raceName", e.target.value)}
                      value={(state?.raceName)} placeholder='Race Name' className='edit-field'
                    />
                    {state?.raceName === '' && <p className="error-text">{errors.raceName}</p>}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <TextField
                      name="raceDistance" error={( errors?.raceDistance && (state?.raceDistance === '' || state?.raceDistance === null)) ? true : false}
                      onChange={(e) => handleChangeField("raceDistance", e.target.value)}
                      value={state?.raceDistance} placeholder='Distance' className='edit-field'
                    />
                    {(state?.raceDistance === '' || state?.raceDistance === null) && <p className="error-text">{errors.raceDistance}</p>}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        onChange={(e) => handleChangeField("distanceUnitId", e.target.value)}
                        value={(state?.distanceUnitId === "") ? 'none' : state?.distanceUnitId}
                        error={(errors?.distanceUnitId && state?.distanceUnitId === "") ? true : false}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('distanceUnitId')}
                        defaultValue="''" name="distanceUnitId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Distance Unit</em></MenuItem>
                        {raceDistanceUnitList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.distanceUnit)}</MenuItem>
                          )
                        })}
                      </Select>
                      {state?.distanceUnitId === "" && <p className="error-text">{errors.distanceUnitId}</p>}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        onChange={(e) => handleChangeField("raceClassId", e.target.value)}
                        value={(state?.raceClassId === "") ? 'none' : state?.raceClassId}
                        error={(errors?.raceClassId && state?.raceClassId === "") ? true : false}
                        // onChange={(v) => { setValue('raceClassId', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('raceClassId')}
                        defaultValue="''" name="raceClassId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Class</em></MenuItem>
                        {raceClassList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.displayName)}</MenuItem>
                          )
                        })}
                      </Select>

                      {state?.raceClassId === "" && <p className="error-text">{errors.raceClassId}</p>}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        onChange={(e) => handleChangeField("raceStakeId", e.target.value)}
                        value={(state?.raceStakeId === "") ? 'none' : state?.raceStakeId}
                        error={(errors?.raceStakeId && state?.raceStakeId === "") ? true : false}
                        // onChange={(v) => { setValue('raceStakeId', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('raceStakeId')}
                        defaultValue="''" name="raceStakeId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Stakes</em></MenuItem>
                        {raceStakeList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.displayName)}</MenuItem>
                          )
                        })}
                      </Select>

                      {state?.raceStakeId === "" && <p className="error-text">{errors.raceStakeId}</p>}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        placeholder="Select Age Restriction"
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        onChange={(e) => handleChangeField("raceAgeRestrictionId", e.target.value)}
                        value={(state?.raceAgeRestrictionId === "") ? 'none' : state?.raceAgeRestrictionId}
                        error={(errors?.raceAgeRestrictionId && state?.raceAgeRestrictionId === "") ? true : false}
                        // onChange={(v) => { setValue('raceAgeRestrictionId', v?.target?.value, { shouldValidate: true }) }}
                        // value={isEdit && getValues('raceAgeRestrictionId')}
                        defaultValue={"''"} name="raceAgeRestrictionId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Age Restriction</em></MenuItem>
                        {raceStatusAgeRestriList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.displayName)}</MenuItem>
                          )
                        })}
                        {/* <MenuItem className="selectDropDownList" value="Mumbai">Mumbai</MenuItem> */}
                      </Select>

                      {state?.raceAgeRestrictionId === "" && <p className="error-text">{errors.raceAgeRestrictionId}</p>}
                      {/* <RHFTextField name="ageRestriction" placeholder='Age Restriction' className='edit-field' /> */}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        onChange={(e) => handleChangeField("raceSexRestrictionId", e.target.value)}
                        value={(state?.raceSexRestrictionId === "") ? 'none' : state?.raceSexRestrictionId}
                        error={(errors?.raceSexRestrictionId && state?.raceSexRestrictionId === "") ? true : false}
                        placeholder="Select Sex Restriction"
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // onChange={(v) => { setValue('raceSexRestrictionId', v?.target?.value, { shouldValidate: true }) }}
                        // value={isEdit && getValues('raceSexRestrictionId')}
                        defaultValue={"''"} name="raceSexRestrictionId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Sex Restriction</em></MenuItem>
                        {raceStatusSexRestriList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.displayName)}</MenuItem>
                          )
                        })}
                        {/* <MenuItem className="selectDropDownList" value="Mumbai">Mumbai</MenuItem> */}
                      </Select>

                      {state?.raceSexRestrictionId === "" && <p className="error-text">{errors.raceSexRestrictionId}</p>}
                      {/* <RHFTextField name="sexRestriction" placeholder='Sex Restriction' className='edit-field' /> */}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>

                    <Box className='edit-field'>
                      <Select
                        onChange={(e) => handleChangeField("currencyId", e.target.value)}
                        value={(state?.currencyId === "") ? 'none' : state?.currencyId}
                        error={(errors?.currencyId && state?.currencyId === "") ? true : false}
                        // onChange={(v) => { setValue('currencyId', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('currencyId')}
                        defaultValue="''" name="currencyId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Currency</em></MenuItem>
                        {currenciesList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{v.currencyName}</MenuItem>
                          )
                        })}
                      </Select>

                      {state?.currencyId === "" && <p className="error-text">{errors.currencyId}</p>}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <TextField
                      name="racePrizemoney" error={( errors?.racePrizemoney && (state?.racePrizemoney === '' || state?.racePrizemoney === null)) ? true : false}
                       onChange={(e) => handleChangeField("racePrizemoney", e.target.value)}
                      value={state?.racePrizemoney} placeholder='Prizemoney' className='edit-field'
                    />
                    {(state?.racePrizemoney === '' || state?.racePrizemoney === null) && <p className="error-text">{errors.racePrizemoney}</p>}
                    {/* <RHFTextField  /> */}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        // {...register("raceTypeId")}
                        onChange={(e) => handleChangeField("raceTypeId", e.target.value)}
                        value={(state?.raceTypeId === "") ? 'none' : state?.raceTypeId}
                        error={(errors?.raceTypeId && state?.raceTypeId === "") ? true : false}
                        // onChange={(v) => { setValue('raceTypeId', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('raceTypeId')}
                        defaultValue="''" name="raceTypeId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Race Type</em></MenuItem>
                        {raceTypeList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.displayName)}</MenuItem>
                          )
                        })}
                      </Select>
                      {state?.raceTypeId === "" && <p className="error-text">{errors.raceTypeId}</p>}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        onChange={(e) => handleChangeField("raceStatusId", e.target.value)}
                        value={(state?.raceStatusId === "") ? 'none' : state?.raceStatusId}
                        error={(errors?.raceStatusId && state?.raceStatusId === "") ? true : false}
                        // onChange={(v) => { setValue('raceStatusId', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('raceStatusId')}
                        defaultValue="''" name="raceStatusId"
                        MenuProps={{
                          className: 'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuProps
                        }}>
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Race Status</em></MenuItem>
                        {raceStatusList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.id} value={v.id}>{toPascalCase(v.displayName)}</MenuItem>
                          )
                        })}
                      </Select>
                      {state?.raceStatusId === "" && <p className="error-text">{errors.raceStatusId}</p>}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={5} md={5} mt={1} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <div className='swith-container'>
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Eligible{' '}
                        {isEligibilityDisable && 
                          <Box className="tooltipPopoverbox">
                            <HtmlTooltip
                              className="tableTooltip"
                              title={
                                <React.Fragment>
                                  <Box className="tooltipPopoverBody HorseDetailsPopover">
                                    <p>Unauthorized Access</p>
                                    <p>
                                      You do not have sufficient privileges to access this module
                                    </p>
                                  </Box>
                                </React.Fragment>
                              }
                            >
                              <i className="icon-Info-circle tooltip-table" />
                            </HtmlTooltip>
                          </Box>
                        }
                      </Typography>
                      <label className="switch">
                        <input type="checkbox" checked={state.isEligible} disabled={isEligibilityDisable}
                          name="isEligible"
                          onChange={(e: any) => handleChangeField("isEligible", e.target.checked)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    {/* <RHFSwitch

                      className='RHF-Switches'
                      name="isEligible"
                      labelPlacement="start"
                      onChange={(e: any) => handleChangeField("isEligible", e.target.checked)}
                      value={state?.isEligible}
                      label={
                        <>
                          <Typography variant="h4" sx={{ mb: 0.5 }}>
                            Eligible
                          </Typography>
                        </>
                      }
                      defaultValue="false"
                      sx={{ mx: 0, width: 1, mt: 1, justifyContent: 'space-between' }}
                    /> */}
                  </Box>
                </Grid>

                {isEdit === true && <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Grid item xs={6} md={6} mt={0} className='racelistgrouplist'>
                    <Box className='FormGroup'>
                      <Accordion className='accordionDrawer' defaultExpanded={true} onChange={handleChange('panel1')}>
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls="panel4bh-content"
                          id="panel4bh-header"
                        >
                          <Typography variant='h4' sx={{ flexShrink: 0 }}>Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack className='FormGroupList'>
                            <Typography component='p'>Race ID: {currentFarm?.raceId ? <u onClick={
                              handleRedirectToRunnerFilter
                            }>{currentFarm?.raceId}</u> : '--'} </Typography>
                            <Typography component='p'>Total Runners:{currentFarm?.totalRunner ? <u onClick={
                              handleRedirectToRunnerFilter
                            }>{currentFarm?.totalRunner}</u> : '--'}  </Typography>
                            {<Typography component='p'>Created: {currentFarm?.createdOn ? formatInTimeZone(new Date(currentFarm?.createdOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') + ' AEST' : '--'}</Typography>}
                            <Typography component='p'>Created by:  {currentFarm?.createdBy ? currentFarm?.createdBy : '--'}</Typography>
                            {<Typography component='p'>Updated: {currentFarm?.modifiedOn ? formatInTimeZone(new Date(currentFarm?.modifiedOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') + ' AEST' : '--'}</Typography>}
                            <Typography component='p'>Updated by: {currentFarm?.modifiedBy ? currentFarm?.modifiedBy : '--'}</Typography>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    </Box>
                  </Grid>
                </Grid>}

                <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>


                  <Stack sx={{ mt: 3 }} className='DrawerBtnWrapper'>
                    <Grid container spacing={1} className='DrawerBtnBottom'>
                      <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                        <LoadingButton fullWidth className='search-btn' type="submit" variant="contained">
                          {!isEdit ? 'Create Race' : 'Save'}
                        </LoadingButton>

                      </Grid>
                      <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                        <Button fullWidth type='button' className='add-btn' disabled onClick={handleOpenMergeFarmAccountsWrapper}>Merge</Button>
                      </Grid>
                    </Grid>
                  </Stack>

                </Grid>
              </Grid>
            </Box>
          </form>
          {/* End Race Add/Edit Form */}
        </Box>
         )}
        {/* Race Eligible Modal */}
        <RaceEligibleWrapperDialog title="Are you sure?" state={state} handleOnSuccess={handleOnSuccess} open={openRaceEligibleWrapper} setOnYesClick={setOnYesClick} close={handleCloseRaceEligibleWrapper} />
        {/* Merge race Modal */}
        <MergeFarmAccountsWrapperDialog title="Merge Race Events" open={openMergeFarmAccountsWrapper} close={handleCloseMergeFarmAccountsWrapper} />
      </Scrollbar>
    </Drawer>
  );
}

const Placeholder = ({ children }: any) => {
  // const classes = usePlaceholderStyles();
  return <div>{children}</div>;
};
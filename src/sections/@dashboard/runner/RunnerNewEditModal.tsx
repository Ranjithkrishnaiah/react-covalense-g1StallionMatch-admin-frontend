import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
// @mui
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  TextField
} from '@mui/material';
import Select from '@mui/material/Select';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { PATH_DASHBOARD } from 'src/routes/paths';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import { RunnerEligibleWrapperDialog } from 'src/components/runner-modal/RunnerEligibleWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { useAddRunnerMutation, useEditRunnerMutation, useRunnerFinalPositionQuery, useRunnerQuery, useRunnersGetHorseDetailsQuery, useRunnersGetRatingQuery, useRunnersSourceQuery, useRunnerWeightUnitQuery } from 'src/redux/splitEndpoints/runnerDetailsSplit';
import { MenuProps } from 'src/constants/MenuProps';
import JockeyAutoFilter from 'src/components/JockeyAutoFilter';
import { toPascalCase } from 'src/utils/customFunctions';
import TrainerAutoComplete from 'src/components/TrainerAutoComplete';
import OwnerAutoComplete from 'src/components/OwnerAutoComplete';
import RunnersHorseAutoFilter from 'src/components/RunnersHorseAutoFilter';
import { formatInTimeZone } from 'date-fns-tz';
import RaceNameAutoComplete from 'src/components/RaceNameAutoComplete';
import RunnersEditrunnerListAutoComplete from 'src/components/RunnersEditrunnerListAutoComplete';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

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

export default function RunnerNewEditModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg,
    handleEditUndoState, valuesExist, setValuesExist, clickedPopover, setClickedPopover
  } = props;

  // initial state of userModuleAccessAddBtn
  const [isEligibilityDisable, setIsEligibilityDisable] = useState(false);
  const [raceAndRunnerModuleAccessAddBtn, setRaceAndRunnerModuleAccessAddBtn] = useState({
    raceAndRunner_add: false,
    raceAndRunner_edit: false,
    raceAndRunner_merge: false,
    raceAndRunner_eligibility: true,
    raceAndRunner_update_status: true,
    raceAndRunner_list: true,
    horse_list: true,
  });
  // call on valuesExist
  React.useEffect(() => {
    setRaceAndRunnerModuleAccessAddBtn({
      ...raceAndRunnerModuleAccessAddBtn,
      raceAndRunner_add: !valuesExist?.hasOwnProperty('RUNNER_ADMIN_ADD_NEW_RUNNER') ? false : true,
      raceAndRunner_edit: !valuesExist?.hasOwnProperty('RUNNER_ADMIN_EDIT_EXISTING_RUNNER_DETAILS') ? false : true,
      raceAndRunner_merge: !valuesExist?.hasOwnProperty('RUNNER_ADMIN_MERGE_RUNNERS') ? false : true,
      // raceAndRunner_eligibility: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_UPDATE_ELIGIBILITY_OF_RACE') ? false : true,
      // raceAndRunner_update_status: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_UPDATE_RACE_STATUS_GLOBAL') ? false : true,
      // raceAndRunner_list: !valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_READ_ONLY') ? false : true,
      // horse_list: !valuesExist?.hasOwnProperty('HORSE_ADMIN_READ_ONLY') ? false : true,
    });
    // if (valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_EDIT_INFORMATION_EXCLUDING_BULK_ELIGIBILITY_UPDATE') && valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_UPDATE_ELIGIBILITY_OF_RACE') && valuesExist?.hasOwnProperty('RACE_RUNNER_ADMIN_READ_ONLY')) {
    //   setIsEligibilityDisable(false);
    // }
  }, [valuesExist]);

  const navigate = useNavigate();

  const [isRaceEligible, setIsRaceEligible] = useState(true);
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [callHorseDetailsApi, setCallHorseDetailsApi] = useState(true);
  const [errors, setErrors] = React.useState<any>({});
  const [onYesClick, setOnYesClick] = React.useState(false);
  const [openRunnerEligibleWrapper, setOpenRunnerEligibleWrapper] = useState(false);
  const [state, setStateValue] = useState<any>({
    "runnerUuid": "",
    "runnerId": "",
    "raceId": null,
    "horseId": null,
    "horseUuid": "",
    "number": null,
    "barrier": null,
    "finalPositionId": '',
    "margin": null,
    "weight": null,
    "weightUnitId": '',
    "jockeyId": null,
    "trainerId": null,
    "ownerId": null,
    "prizemoneyWon": null,
    "startingPrice": null,
    "currencyId": '',
    "isApprentice": false,
    "isScratched": false,
    "sourceId": '',
    "isEligible": true,
    "createdBy": null,
    "createdOn": "",
    "modifiedBy": null,
    "modifiedOn": null,
    "weightUnit": null,
    "silksColor": null,
    "totalRun": null,
    "totalPrizemoneyWon": null,
    "totalWins": null,
    "totalStakeWins": null,
    "displayName": '',
    "horseName": '',
    "trainerName": '',
    "sireName": '',
    "cob": '',
    "yob": '',
    "damName": '',
    "ownerName": '',
    "raceName": '',
    "raceTime": '',
    "raceUuid": '',
  })

  // Reset the form and error
  useEffect(() => {
    if (!openAddEditForm) {
      handleDefaultValues();
      setErrors({});
    }
  }, [openAddEditForm])

  // Close drawer and edit popup
  const handleDrawerClose = () => {
    handleEditPopup();
    handleEditUndoState();
  };

  // close popup
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  // Api calls
  const { data: currencyList } = useCurrenciesQuery();
  const [addRunner, addRunnerResponse] = useAddRunnerMutation();
  const [editRunner, editRunnerResponse] = useEditRunnerMutation();
  const { data: countriesList } = useCountriesQuery();
  const { data: weightUnitList } = useRunnerWeightUnitQuery();
  const { data: sourceList } = useRunnersSourceQuery();
  const { data: runnerFinalPositionList } = useRunnerFinalPositionQuery();
  const { data: runnerData, error, isFetching, isLoading, isSuccess } = useRunnerQuery(rowId, { skip: (!rowId && !isEdit), refetchOnMountOrArgChange: true });
  const currentRunner = runnerData;
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  // handle default value
  const handleDefaultValues = () => {
    setStateValue({
      ...state,
      currencyId: currentRunner?.currencyId || '',
      number: currentRunner?.number || '',
      barrier: currentRunner?.barrier || '',
      finalPositionId: currentRunner?.finalPositionId || '',
      margin: currentRunner?.margin || '',
      weight: currentRunner?.weight || '',
      weightUnitId: currentRunner?.weightUnitId || '',
      prizemoneyWon: (parseInt(currentRunner?.prizemoneyWon || '', 10) || 0).toLocaleString('en-US'),
      startingPrice: currentRunner?.startingPrice || '',
      sourceId: currentRunner?.sourceId || '',
      totalRun: currentRunner?.totalRun || '',
      totalPrizemoneyWon: currentRunner?.totalPrizemoneyWon || '',
      totalWins: currentRunner?.totalWins || '',
      totalStakeWins: currentRunner?.totalStakeWins || '',
      runnerUuid: currentRunner?.runnerUuid || '',
      runnerId: currentRunner?.runnerId || '',
      displayName: currentRunner?.displayName || '',
      horseName: currentRunner?.horseName || '',
      trainerName: currentRunner?.trainerName || '',
      sireName: currentRunner?.sireName || '',
      cob: currentRunner?.cob || '',
      yob: currentRunner?.yob || '',
      damName: currentRunner?.damName || '',
      ownerName: currentRunner?.ownerName || '',
      trainerId: currentRunner?.trainerId || null,
      jockeyId: currentRunner?.jockeyId || null,
      ownerId: currentRunner?.ownerId || null,
      raceId: currentRunner?.raceId || null,
      horseId: currentRunner?.horseId || null,
      horseUuid: currentRunner?.horseUuid || null,
      raceName: currentRunner?.raceName || '',
      raceTime: currentRunner?.raceTime || '',
      raceUuid: currentRunner?.raceUuid || '',
      createdOn: currentRunner?.createdOn || '',
      createdBy: currentRunner?.createdBy || '',
      modifiedBy: currentRunner?.modifiedBy || '',
      modifiedOn: currentRunner?.modifiedOn || '',
      weightUnit: currentRunner?.weightUnit || '',
      isEligible: currentRunner?.isEligible || false,
      isScratched: currentRunner?.isScratched || false,
      isApprentice: currentRunner?.isApprentice || false,
    })
  }

  // handle Reset form
  const resetData = () => {
    setStateValue({
      "runnerUuid": "",
      "runnerId": "",
      "raceId": null,
      "horseId": null,
      "horseUuid": "",
      "number": null,
      "barrier": null,
      "finalPositionId": '',
      "margin": null,
      "weight": null,
      "weightUnitId": '',
      "jockeyId": null,
      "trainerId": null,
      "ownerId": null,
      "prizemoneyWon": null,
      "startingPrice": null,
      "currencyId": '',
      "isApprentice": false,
      "isScratched": false,
      "sourceId": '',
      "isEligible": false,
      "createdBy": null,
      "createdOn": "",
      "modifiedBy": null,
      "modifiedOn": null,
      "weightUnit": null,
      "silksColor": null,
      "totalRun": null,
      "totalPrizemoneyWon": null,
      "totalWins": null,
      "totalStakeWins": null,
      "displayName": '',
      "horseName": '',
      "trainerName": '',
      "sireName": '',
      "cob": '',
      "yob": '',
      "damName": '',
      "ownerName": '',
      'raceName': '',
      'raceTime': '',
      'raceUuid': '',
    })
  }

  // Reset form
  React.useEffect(() => {
    if (isEdit && currentRunner) {
      handleDefaultValues()
      setCallHorseDetailsApi(false);
    }
    if (!isEdit) {
      resetData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentRunner]);

  // Handle form state
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue
    })
    if (type == 'prizemoneyWon') {
      const formatNumberCommas = parseInt(targetValue.replace(/,/g, '')).toLocaleString('en-US');
      setStateValue({
        ...state,
        [type]: targetValue ? formatNumberCommas : targetValue
      })
    }
    if (type == 'number') {
      const formatNumber = targetValue.replace(/[^0-9]/g,'');
      setStateValue({
        ...state,
        [type]: targetValue ? formatNumber : targetValue
      })
    }
    if (type == 'weight') {
      const formatWeight = targetValue.replace(/[^0-9]/g,'');
      setStateValue({
        ...state,
        [type]: targetValue ? formatWeight : targetValue
      })
    }
    if (type == 'barrier') {
      const formatBarrier = targetValue.replace(/[^0-9]/g,'');
      setStateValue({
        ...state,
        [type]: targetValue ? formatBarrier : targetValue
      })
    }
    if (type == 'margin') {
      const formatMargin = targetValue.replace(/[^0-9]/g,'');
      setStateValue({
        ...state,
        [type]: targetValue ? formatMargin : targetValue
      })
    }
    if (type == 'startingPrice') {
      const formatStartingPrice = targetValue.replace(/[^0-9]/g,'');
      setStateValue({
        ...state,
        [type]: targetValue ? formatStartingPrice : targetValue
      })
    }

    if (type === 'isEligible') {
      if (isEdit && !isEligibilityDisable) {        
          setOpenRunnerEligibleWrapper(true);
      }
    }
  }

  // Horse state and api call
  const [horseDetailsTop, sethorseDetailsTop] = useState<any>({});
  const runnerHorsePedigreeDetails = useRunnersGetHorseDetailsQuery(state?.horseUuid, { skip: callHorseDetailsApi, refetchOnMountOrArgChange: true })
  const { currentData: runnerRatingDetails } = useRunnersGetRatingQuery(state?.horseUuid, { skip: !state?.horseUuid, refetchOnMountOrArgChange: true })

  // Border color for rating
  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 6,
    borderRadius: 5,
    background: '#FFFFFF',
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: runnerRatingDetails?.length ? runnerRatingDetails[0]?.accuracyRating === 'Poor' ? '#C75227' : '#1D472E' : '#C75227',
    },
  }));

  // Get runners data based on id
  useEffect(() => {
    if (runnerHorsePedigreeDetails.currentData && runnerHorsePedigreeDetails.isSuccess) {
      sethorseDetailsTop(runnerHorsePedigreeDetails?.currentData);
      setCallHorseDetailsApi(true);
    }
  }, [runnerHorsePedigreeDetails.isFetching])

  // Calculate horse rating percentage
  const calculateHorseRating = () => {
    let rating = 0;
    if (runnerRatingDetails?.length) {
      if (runnerRatingDetails[0].accuracyRating === 'Poor') {
        rating = 25;
      }
      if (runnerRatingDetails[0].accuracyRating === 'Good') {
        rating = 50;
      }
      if (runnerRatingDetails[0].accuracyRating === 'Excellent') {
        rating = 75;
      }
      if (runnerRatingDetails[0].accuracyRating === 'Outstanding') {
        rating = 100;
      }
    }

    if (!state.horseUuid) {
      rating = 0;
    }

    return rating;
  }

  // Validate form
  let validateForm = () => {
    /*eslint-disable */
    let fields = state;
    let errors = {};
    let formIsValid = true;
    //@ts-ignore
    if (!fields["horseName"]) {
      formIsValid = false;  //@ts-ignore
      errors["horseName"] = `Horse Name is required`;
    }
    if (!fields["number"]) {
      formIsValid = false;  //@ts-ignore
      errors["number"] = `number is required`;
    }
    if (!fields["barrier"]) {
      formIsValid = false;  //@ts-ignore
      errors["barrier"] = `Barrier required`;
    }
    if (!fields["finalPositionId"]) {
      formIsValid = false;  //@ts-ignore
      errors["finalPositionId"] = `Final Position required`;
    }
    if (!fields["margin"]) {
      formIsValid = false;  //@ts-ignore
      errors["margin"] = `Margin required`;
    }
    if (!fields["weight"]) {
      formIsValid = false;  //@ts-ignore
      errors["weight"] = `weight required`;
    }
    if (!fields["weightUnitId"]) {
      formIsValid = false;  //@ts-ignore
      errors["weightUnitId"] = `Weight Unit required`;
    }
    if (!fields["jockeyId"]) {
      formIsValid = false;  //@ts-ignore
      errors["jockeyId"] = `Jockey required`;
    }
    if (!fields["raceId"]) {
      formIsValid = false;  //@ts-ignore
      errors["raceId"] = `Race name is required`;
    }
    if (!fields["trainerId"]) {
      formIsValid = false;  //@ts-ignore
      errors["trainerId"] = `Trainer required`;
    }
    if (!fields["currencyId"]) {
      formIsValid = false;  //@ts-ignore
      errors["currencyId"] = `Currency required`;
    }
    if (!fields["prizemoneyWon"]) {
      formIsValid = false;  //@ts-ignore
      errors["prizemoneyWon"] = `prizemoney required`;
    }
    if (!fields["ownerId"]) {
      formIsValid = false;  //@ts-ignore
      errors["ownerId"] = `Owner required`;
    }
    if (!fields["startingPrice"]) {
      formIsValid = false;  //@ts-ignore
      errors["startingPrice"] = `Starting Price required`;
    }
    if (!fields["sourceId"]) {
      formIsValid = false;  //@ts-ignore
      errors["sourceId"] = `Source required`;
    }
    setErrors(errors)
    return formIsValid
    /*eslint-enable */
  }

  // Submit form
  const onSubmit = async (e: any) => {
    e.preventDefault();
    // console.log(state, rowId, 'STATE in submit')
    if (!validateForm()) return

    try {
      const finalData = {
        "raceId": state.raceId,
        "horseId": state.horseId,
        "number": Number(state.number),
        "barrier": Number(state.barrier),
        "finalPositionId": state.finalPositionId,
        "margin": Number(state.margin),
        "weight": Number(state.weight),
        "weightUnitId": state.weightUnitId,
        "jockeyId": state.jockeyId,
        "trainerId": state.trainerId,
        "ownerId": state.ownerId,
        "currencyId": state.currencyId,
        "prizemoneyWon": Number(state.prizemoneyWon),
        "startingPrice": Number(state.startingPrice),
        "sourceId": state.sourceId,
        // "isEligible": state.isEligible,
        "isApprentice": state.isApprentice,
        "isScratched": state.isScratched,
      }
      let res: any = isEdit ? await editRunner({ ...finalData, id: rowId }) : await addRunner({ ...finalData });
      if (res.error) {
        setApiStatusMsg({ 'status': 422, 'message': `${Object.values(res?.error?.data?.errors)}` });
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

  // Handle On Eligible Success or Error
  const handleOnEligibleSuccess = (res: any) => {
    if (res?.data?.statusCode) {
      if (res?.data?.statusCode === 200) {
        setOnYesClick(true);
        // setApiStatusMsg({ 'status': 201, 'message': res?.data?.message });
        // setApiStatus(true);
        setOpenRunnerEligibleWrapper(false);
        setTimeout(() => {
          setOnYesClick(false);
        }, 1500);
      }
    } else {
      if (res.error) {
        // setApiStatusMsg({ 'status': 422, 'message': res?.error?.data?.message });
        // setApiStatus(true);
      }
    }
  }

  // Handle On Eligible Modal close
  const handleOnEligibleClose = () => {
    if (!onYesClick) {
      setStateValue({
        ...state,
        isEligible: !state.isEligible
      })
    }
    setOnYesClick(false);
  }

  // Country and state list 
  const [countryID, setCountryID] = React.useState((currentRunner?.countryId > 0) ? currentRunner?.countryId : 0);
  const [isCountrySelected, setIsCountrySelected] = React.useState((currentRunner?.countryId > 0) ? true : false);
  const [openMergeFarmAccountsWrapper, setOpenMergeFarmAccountsWrapper] = useState(false);
  const handlecountryChange = (event: any) => {
    setCountryID(event.target.value);
    setIsCountrySelected(true);
  };

  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: (!isCountrySelected) });

  // Close merge runner popup
  const handleCloseMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(false);
  };

  // Open merge runner popup
  const handleOpenMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(true);
  };

  // Close Eligible runner popup
  const handleCloseRunnerEligibleWrapper = () => {
    setOpenRunnerEligibleWrapper(false);
  };

  // open Eligible runner popup
  const handleOpenRunnerEligibleWrapper = () => {
    setOpenRunnerEligibleWrapper(true);
  };

  // Navigate to pedigree
  const handleViewPedigree = () => {
    if (state.horseId) {
      if (!raceAndRunnerModuleAccessAddBtn?.horse_list) {
        setClickedPopover(true);
      } else {
        navigate(PATH_DASHBOARD.horsedetails.edit(state.horseId));
      }
    }
  }

  // navigate to race page
  const handleRedirectToRaceFilter = () => {
    if (!raceAndRunnerModuleAccessAddBtn?.raceAndRunner_list) {
      setClickedPopover(true);
    } else {
      // navigate(PATH_DASHBOARD.race.filter(state.raceName))
      window.open(PATH_DASHBOARD.race.filter(state.raceName), '_blank');
    }
  }

  // navigate to horse page
  const handleRedirectToRaceFilterWithTotalRaces = () => {
    if (!raceAndRunnerModuleAccessAddBtn?.horse_list) {
      setClickedPopover(true);
    } else {
      navigate(PATH_DASHBOARD.race.horseIdfilter(state.horseUuid))
    }
  }

  // navigate to race page with stake filter applied
  const handleRedirectToRaceFilterwinnerORStakes = (type: string) => {
    if (!raceAndRunnerModuleAccessAddBtn?.raceAndRunner_list) {
      setClickedPopover(true);
    } else {
      navigate(PATH_DASHBOARD.race.winnerORStakesfilter(state.horseUuid, type))
    }
  }

  // Get the currency symbol
  const getCurrencySymbol = (currId: number) => {
    let currDetails: any = currencyList?.filter((v, i) => v.id === currId)[0];
    return `${currDetails?.currencySymbol}`
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
      className='DrawerRightModal RaceEditModal RunnerNewEditModal'
    >
      <Scrollbar
        className='DrawerModalScroll'
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: "100vh",
            background: "#E2E7E1",
          },
        }}
      >
        <CssBaseline />
        {/* Drawer Header */}
        <DrawerHeader className='DrawerHeader'>
          <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}>
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>
        {/* End Drawer Header */}
        {isEdit === undefined && raceAndRunnerModuleAccessAddBtn.raceAndRunner_add === false && <UnAuthorized />}
        {isEdit === true && raceAndRunnerModuleAccessAddBtn.raceAndRunner_edit === false && <UnAuthorized />}
        {((isSuccess && raceAndRunnerModuleAccessAddBtn.raceAndRunner_edit === true) || (isEdit === undefined && raceAndRunnerModuleAccessAddBtn.raceAndRunner_add === true)) && (
        <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
          {/* Runners Add/Edit Form  */}
          <form onSubmit={onSubmit}>
            <Box px={0}>
              <Grid container spacing={2.3} mt={0} pt={0} className='RaceListModalBox'>

                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Typography variant="h4" className='ImportedHeader'>Runner Details</Typography>

                  <Box className='FormGroup'>
                    <Stack className='accuracy-rating' my={2}>
                      <Box mb={1} sx={{ display: 'flex' }}>
                        <Typography variant="h6" flexGrow={1}>
                          Pedigree Accuracy Rating: <b>{runnerRatingDetails && state.horseUuid && runnerRatingDetails[0]?.accuracyRating}</b>
                        </Typography>
                      </Box>
                      <Box className='ProgressBar-Line'>
                        <Box sx={{ flexGrow: 1 }}>
                          <BorderLinearProgress variant="determinate" value={calculateHorseRating()} />
                        </Box>
                      </Box>
                    </Stack>
                    <Box mb={1} className='edit-field half-custom-Autocomplete'>
                      {isEdit ?
                        <RunnersEditrunnerListAutoComplete
                          // validateForm={validateForm}
                          horseName={toPascalCase(state.horseName)}
                          raceUuid={state.raceUuid}
                          sex={'M'}
                          isEdit={isEdit}
                          isExist={isEdit ? true : false}
                          isOpen={open || openAddEditForm}
                          runnersModuele={true}
                          setStateValueId={(value: any) => {
                            setStateValue({ ...state, horseId: value.horseId, horseUuid: value.horseId, horseName: value.horseName });
                            if (value?.horseId !== '') { setCallHorseDetailsApi(false) };
                            sethorseDetailsTop({});
                          }}
                          isError={errors.horseName}
                        />
                        :
                        <RunnersHorseAutoFilter
                          // validateForm={validateForm}
                          horseName={toPascalCase(state.horseName)}
                          sex={'M'}
                          isEdit={isEdit}
                          isExist={isEdit ? true : false}
                          isOpen={open || openAddEditForm}
                          runnersModuele={true}
                          setStateValueId={(value: any) => {
                            setStateValue({ ...state, horseId: value.horseId, horseName: value.horseName, horseUuid: value.horseId });
                            if (value?.horseId !== '') { setCallHorseDetailsApi(false) };
                            sethorseDetailsTop({});
                          }}
                          isError={errors.horseName}
                        />
                      }
                      {/* <RHFTextField name="matchedHorseName" placeholder='Matched Horse Name' className='edit-field' /> */}
                    </Box>
                    {(state.horseId === null || state.horseId === "") && <p className="error-text">{errors.horseName}</p>}

                    <a href={state.horseUuid ? (PATH_DASHBOARD.horsedetails.edit(state.horseUuid)) : ''} target="_blank" style={{ marginTop: '7px !important' }} type='button' className={`${state.horseUuid && state.horseUuid ? '' : 'gray-out'} link-btn viewPedegree-btn`}>View Pedigree</a>
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className={`racelistgroup RawDataGroup ${isEdit ? '' : 'disabledClass'}`}>
                  <Typography variant="h4" className='ImportedHeader'>RAW Data</Typography>

                  <Box className='FormGroup'>
                    <List className='RawDataList'>
                      <ListItem>
                        <ListItemText
                          primary="Name:"
                          secondary={(horseDetailsTop?.horseName) ? toPascalCase(horseDetailsTop?.horseName) : '--'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Sire:"
                          secondary={(horseDetailsTop?.sireName) ? toPascalCase(horseDetailsTop?.sireName) : '--'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Dam:"
                          secondary={(horseDetailsTop?.damName) ? toPascalCase(horseDetailsTop?.damName) : '--'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="YOB:"
                          secondary={horseDetailsTop?.yob ? horseDetailsTop?.yob : '--'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="COB:"
                          secondary={horseDetailsTop?.cob ? horseDetailsTop?.cob : '--'}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={2} className='racelistgroup number-barrier'>
                  <Box className='FormGroup number-barrier-left'>
                    <Box className='edit-field' sx={{ margin: '0px !important' }}>
                      <TextField
                        name="number"
                        placeholder='Number'
                        value={state.number}
                        error={(errors?.number && (state?.number === '' || state?.number === null)) ? true : false}
                        onChange={(e: any) => handleChangeField("number", e.target.value)}
                        className='edit-field' />
                      {/* <RHFTextField name="number" placeholder='Number' className='edit-field' /> */}
                    </Box>
                    {(state?.number === '' || state?.number === null) && <p className="error-text">{errors.number}</p>}
                  </Box>
                  <Box className='FormGroup number-barrier-right'>
                    <Box className='edit-field' sx={{ margin: '0px !important' }}>
                      <TextField
                        name="barrier"
                        placeholder='Barrier'
                        value={state.barrier}
                        error={(errors?.barrier && (state?.barrier === '' || state?.barrier === null)) ? true : false}
                        onChange={(e: any) => handleChangeField("barrier", e.target.value)}
                        className='edit-field' />
                      {/* <RHFTextField name="barrier" placeholder='Barrier' className='edit-field' /> */}
                    </Box>
                    {(state?.barrier === '' || state?.barrier === null) && <p className="error-text">{errors.barrier}</p>}
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={2} className='racelistgroup'>
                  {!isEdit && <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <RaceNameAutoComplete
                        // setFarmId={handleFarmChange}
                        searchedName={state.raceName}
                        setStateValueId={(value: any) => { setStateValue({ ...state, raceId: value.id, raceName: value.displayName, isEligible: value.isEligible }); setIsRaceEligible(value.isEligible) }}
                        pageType={'RaceName'}
                        isEdit={isEdit}
                        isOpen={open || openAddEditForm}
                        isError={errors.raceId}
                      />
                      {(state.raceId === null || state.raceId === "") && <p className="error-text">{errors.raceId}</p>}
                      {/* <RHFTextField name="Barrier" placeholder='Barrier' className='edit-field'/> */}
                    </Box>
                  </Box>}
                </Grid>

                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    {/* <TextField
                      name="finalPositionId"
                      placeholder='Final Position'
                      value={state.finalPositionId}
                      onChange={(e: any) => handleChangeField("finalPositionId", e.target.value)}
                      className='edit-field' /> */}
                    <Box className='edit-field'>
                      <Select
                        // onChange={(v) => { setValue('weightUnit', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        value={state.finalPositionId === '' ? 'none' : state.finalPositionId}
                        error={(errors?.finalPositionId && state?.finalPositionId === "") ? true : false}
                        onChange={(e: any) => { handleChangeField("finalPositionId", e.target.value) }}
                        // value={isEdit && getValues('weightUnit')}
                        defaultValue="none" name="finalPositionId"

                        MenuProps={{
                          className: 'common-scroll-lock',

                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          ...MenuProps
                        }}

                      >
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Final Position</em></MenuItem>
                        {runnerFinalPositionList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" value={v.id} key={v.id}>
                              {v.displayName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </Box>
                    {/* <RHFTextField name="position" placeholder='Final Position' className='edit-field' /> */}
                  </Box>
                  {state?.finalPositionId === "" && <p className="error-text">{errors.finalPositionId}</p>}
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <TextField
                      name="margin"
                      placeholder='Margin'
                      value={state.margin}
                      error={(errors?.margin && (state?.margin === '' || state?.margin === null)) ? true : false}
                      onChange={(e: any) => handleChangeField("margin", e.target.value)}
                      className='edit-field' />
                    {/* <RHFTextField name="margin" placeholder='Margin' className='edit-field' /> */}
                    {(state?.margin === '' || state?.margin === null) && <p className="error-text">{errors.margin}</p>}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <TextField
                      name="weight"
                      placeholder='Weight'
                      value={state.weight}
                      error={(errors?.weight && (state?.weight === '' || state?.weight === null)) ? true : false}
                      onChange={(e: any) => handleChangeField("weight", e.target.value)}
                      className='edit-field' />
                    {(state?.weight === '' || state?.weight === null) && <p className="error-text">{errors.weight}</p>}
                    {/* <RHFTextField name="weight" placeholder='Weight' className='edit-field' /> */}
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        // onChange={(v) => { setValue('weightUnit', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        value={state.weightUnitId === '' ? 'none' : state.weightUnitId}
                        error={(errors?.weightUnitId && state?.weightUnitId === "") ? true : false}
                        onChange={(e: any) => { handleChangeField("weightUnitId", e.target.value) }}
                        // value={isEdit && getValues('weightUnit')}
                        defaultValue="none" name="weightUnit"
                        MenuProps={{
                          className: 'common-scroll-lock',

                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          ...MenuProps
                        }}

                      >
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Weight Unit</em></MenuItem>
                        {weightUnitList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" value={v.id} key={v.id}>
                              {v.weightUnitName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {/* {errors.weightUnit && <p>{errors.weightUnit.message}</p>} */}
                    </Box>
                    {state?.weightUnitId === "" && <p className="error-text">{errors.weightUnitId}</p>}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field half-custom-Autocomplete'>
                      {/* <Select
                        MenuProps={MenuProps}
                        // onChange={(v) => { setValue('jockey', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('jockey')}
                        defaultValue="none" name="jockey">
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Jockey</em></MenuItem>
                        <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                        <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                      </Select> */}
                      {/* {errors.jockey && <p>{errors.jockey.message}</p>} */}
                      <JockeyAutoFilter
                        // setFarmId={handleFarmChange}
                        searchedName={state.displayName}
                        setStateValueId={(value: any) => setStateValue({ ...state, jockeyId: value.id, displayName: value.displayName })}
                        pageType={'Jockey'}
                        isEdit={isEdit}
                        isOpen={open || openAddEditForm}
                        isError={errors.jockeyId}
                      />
                    </Box>
                    {(state.jockeyId === null || state.jockeyId === "") && <p className="error-text">{errors.jockeyId}</p>}
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={0} className='racelistgroup ApprenticeList'>
                  <Box className='FormGroup'>
                    {/* <RHFSwitch
                      className='RHF-Switches'
                      name="apprentice"
                      labelPlacement="start"
                      value={isEdit && getValues('apprentice')}
                      label={
                        <>
                          <Typography variant="h4" sx={{ mb: 0.5 }}>
                            Apprentice
                          </Typography>
                        </>
                      }
                      defaultValue="false"
                      sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                    /> */}
                    <div className='swith-container'>
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Apprentice{' '}
                      </Typography>
                      <label className="switch">
                        <input type="checkbox"
                          checked={state.isApprentice}
                          onChange={(e) => handleChangeField("isApprentice", e.target.checked)}
                          name="isApprentice"
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field custom-100'>
                      <TrainerAutoComplete
                        // setFarmId={handleFarmChange}
                        searchedName={state.trainerName}
                        setStateValueId={(value: any) => setStateValue({ ...state, trainerId: value.id, trainerName: value.displayName })}
                        pageType={'Jockey'}
                        isEdit={isEdit}
                        isOpen={open || openAddEditForm}
                        isError={errors.trainerId}
                      />
                      {/* {errors.trainer && <p>{errors.trainer.message}</p>} */}
                    </Box>
                    {(state.trainerId === null || state.trainerId === "") && <p className="error-text">{errors.trainerId}</p>}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        value={state.currencyId === '' ? 'none' : state.currencyId}
                        error={(errors?.currencyId && state?.currencyId === "") ? true : false}
                        className="filter-slct"
                        onChange={(e: any) => { handleChangeField("currencyId", e.target.value) }}
                        defaultValue="none" name="expiredStallion"

                        MenuProps={{
                          className: 'common-scroll-lock',

                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          ...MenuProps
                        }}
                      >
                        <MenuItem className="selectDropDownList" value="none" disabled><em>Currency</em></MenuItem>
                        {currencyList?.map(({ id, currencyName }) => {
                          return (
                            <MenuItem className="selectDropDownList" value={id} key={id}>
                              {currencyName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {/* {errors.currency && <p>{errors.currency.message}</p>} */}
                    </Box>
                    {state?.currencyId === "" && <p className="error-text">{errors.currencyId}</p>}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <TextField
                      name="prizemoneyWon"
                      placeholder='Prizemoney'
                      value={state.prizemoneyWon}
                      error={(errors?.prizemoneyWon && (state?.prizemoneyWon === '' || state?.prizemoneyWon === null)) ? true : false}
                      onChange={(e: any) => handleChangeField("prizemoneyWon", parseInt(e.target.value) ? e.target.value: '')}
                      className='edit-field' />
                    {/* <RHFTextField name="prizeMoney" placeholder='Prizemoney' className='edit-field' /> */}

                    {(state?.prizemoneyWon === '' || state?.prizemoneyWon === null) && <p className="error-text">{errors.prizemoneyWon}</p>}
                  </Box>
                </Grid>
                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field custom-100'>
                      {/* <Select
                        MenuProps={MenuProps}
                        // onChange={(v) => { setValue('owner', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        // value={isEdit && getValues('owner')}
                        defaultValue="none" name="owner">
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Owner(s)</em></MenuItem>
                        <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                        <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                      </Select> */}
                      <OwnerAutoComplete
                        // setFarmId={handleFarmChange}
                        searchedName={state.ownerName}
                        setStateValueId={(value: any) => setStateValue({ ...state, ownerId: value.id, ownerName: value.displayName })}
                        pageType={'Jockey'}
                        isEdit={isEdit}
                        isOpen={open || openAddEditForm}
                        isError={errors.ownerId}
                      />
                      {/* {errors.owner && <p>{errors.owner.message}</p>} */}
                    </Box>
                    {(state.ownerId === null || state.ownerId === "") && <p className="error-text">{errors.ownerId}</p>}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <TextField
                      name="startingPrice"
                      placeholder='Starting Price'
                      value={state.startingPrice}
                      error={(errors?.startingPrice && (state?.startingPrice === '' || state?.startingPrice === null)) ? true : false}
                      onChange={(e: any) => handleChangeField("startingPrice", e.target.value)}
                      className='edit-field' />
                    {(state?.startingPrice === '' || state?.startingPrice === null) && <p className="error-text">{errors.startingPrice}</p>}
                    {/* <RHFTextField name="startingPrize" placeholder='Starting Price' className='edit-field' /> */}
                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        // onChange={(v) => { setValue('weightUnit', v?.target?.value, { shouldValidate: true }) }}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        value={state.sourceId === '' ? 'none' : state.sourceId}
                        error={(errors?.sourceId && state?.sourceId === "") ? true : false}
                        onChange={(e: any) => { handleChangeField("sourceId", e.target.value) }}
                        // value={isEdit && getValues('weightUnit')}
                        defaultValue="none" name="weightUnit"
                        MenuProps={{
                          className: 'common-scroll-lock',

                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          ...MenuProps
                        }}
                      >
                        <MenuItem className="selectDropDownList" value="none" disabled selected><em>Source</em></MenuItem>
                        {sourceList?.map((v: any, i: number) => {
                          return (
                            <MenuItem className="selectDropDownList" value={v.id} key={v.id}>
                              {v.displayName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                      {/* {errors.source && <p className='Mui-error'>{errors.source.message}</p>} */}
                    </Box>
                    {state?.sourceId === "" && <p className="error-text">{errors.sourceId}</p>}
                  </Box>
                </Grid>

                <Grid item xs={4} md={4} mt={1} className='racelistgroup'>
                  <Box className='FormGroup'>
                    {/* <RHFSwitch
                      className='RHF-Switches'
                      name="scratched"
                      labelPlacement="start"
                      value={isEdit && getValues('scratched')}
                      defaultValue="false"
                      label={
                        <>
                          <Typography variant="h4" sx={{ mb: 0.5 }}>
                            Scratched
                          </Typography>
                        </>
                      }
                      sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                    /> */}
                    <div className='swith-container'>
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Scratched{' '}
                      </Typography>
                      <label className="switch">
                        <input type="checkbox"
                          checked={state.isScratched}
                          onChange={(e) => handleChangeField("isScratched", e.target.checked)}
                          name="isScratched"
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>

                    {/* <RHFSwitch
                      onClick={handleOpenRunnerEligibleWrapper}
                      className='RHF-Switches'
                      name="isEligible"
                      value={isEdit && getValues('isEligible')}
                      defaultValue="false"
                      labelPlacement="start"
                      label={
                        <>
                          <Typography variant="h4" sx={{ mb: 0.5 }}>
                            Eligible
                          </Typography>
                        </>
                      }
                      sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                    /> */}
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
                        <input type="checkbox"
                          checked={state.isEligible}
                          onChange={(e) => handleChangeField("isEligible", e.target.checked)}
                          name="isEligible"
                          disabled={!isEdit && isRaceEligible === false}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </Box>
                </Grid>


                {isEdit && <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Grid item xs={6} md={6} mt={0} className='racelistgrouplist'>
                    <Box className='FormGroup'>
                      <Accordion className='accordionDrawer' defaultExpanded={true} onChange={handleChange('panel1')}>
                        <AccordionSummary
                          sx={{ paddingRight: '35px !important' }}
                          expandIcon={<KeyboardArrowDownRoundedIcon />}
                          aria-controls="panel4bh-content"
                          id="panel4bh-header"
                        >
                          <Typography variant='h4' sx={{ flexShrink: 0 }}>Details</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Stack className='FormGroupList runner-details-label'>
                            <Typography component='p' sx={{ whiteSpace: 'nowrap' }}>Runner ID: <span> {state.runnerId ? <u onClick={
                              handleRedirectToRaceFilter
                            }>{state.runnerId}</u> : '--'}</span></Typography>
                            <Typography component='p'>Total Runs: <span>{horseDetailsTop?.totalRun ? <u onClick={
                              handleRedirectToRaceFilterWithTotalRaces
                            }>{horseDetailsTop?.totalRun}</u> : '--'}  </span></Typography>
                            <Typography component='p'>Total Wins: <span>{horseDetailsTop?.totalWins ? <u onClick={
                              () => handleRedirectToRaceFilterwinnerORStakes('totalWins')
                            }>{horseDetailsTop?.totalWins}</u> : '--'} </span></Typography>
                            <Typography component='p'>Total Stakes Wins: <span>{horseDetailsTop?.totalStakeWins ? <u onClick={
                              () => handleRedirectToRaceFilterwinnerORStakes('totalStakeWins')
                            }>{horseDetailsTop?.totalStakeWins}</u> : '--'}  </span></Typography>
                            <Typography component='p'>Total Prizemoney: <span>{horseDetailsTop?.totalPrizemoneyWon ? getCurrencySymbol(state.currencyId) + '' + horseDetailsTop?.totalPrizemoneyWon?.toLocaleString() : '--'}</span></Typography>
                            <Typography component='p'>Created: <span>{state.createdOn ? formatInTimeZone(new Date(state.createdOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') + ' AEST' : '--'}</span></Typography>
                            <Typography component='p'>Created by:  <span>{state.createdBy ? state.createdBy : '--'}</span></Typography>
                            <Typography component='p'>Updated: <span>{state?.modifiedOn ? formatInTimeZone(new Date(state?.modifiedOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') + ' AEST' : '--'}</span></Typography>
                            <Typography component='p'>Race Time: <span>{state?.raceTime ? formatInTimeZone(new Date(state?.raceTime), "Australia/Sydney", 'h:mma') + ' AEST' : '--'}</span></Typography>
                            <Typography component='p'>Silks Color: <span>{state.silksColor ? state.silksColor : '--'}</span></Typography>
                            <Typography component='p'>Horse Weight: <span>{state.weight ? state.weight + ' ' + state.weightUnit : '--'}</span></Typography>
                            <Typography component='p'>Horse Weight Unit: <span>{state.weightUnit ? state.weightUnit : '--'}</span></Typography>
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
                          {!isEdit ? 'Create Runner' : 'Save'}
                        </LoadingButton>

                      </Grid>
                      <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                        <Button fullWidth type='button' className='add-btn' onClick={handleOpenMergeFarmAccountsWrapper} disabled>Transfer</Button>
                      </Grid>
                    </Grid>
                  </Stack>

                </Grid>
              </Grid>
            </Box>
          </form>
          {/* End Runners Add/Edit Form  */}
        </Box>
        )}
        <RunnerEligibleWrapperDialog title="Are you sure?" open={openRunnerEligibleWrapper} close={handleCloseRunnerEligibleWrapper} state={state} isEdit={isEdit} handleOnEligibleSuccess={handleOnEligibleSuccess} handleOnEligibleClose={handleOnEligibleClose} />
        <MergeFarmAccountsWrapperDialog title="Merge Farm Accounts" open={openMergeFarmAccountsWrapper} close={handleCloseMergeFarmAccountsWrapper} />
      </Scrollbar>
    </Drawer>
  );
}

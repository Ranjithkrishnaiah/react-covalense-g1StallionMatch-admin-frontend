import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton, Autocomplete, Stack, StyledEngineProvider, Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import './horsewrapper.css';
import '../../sections/@dashboard/horse/pedegree.css'
import { useDamAutocompleteQuery, useSireAutocompleteQuery } from 'src/redux/splitEndpoints/horseSplit';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import {useSeachByRaceHorseNameQuery, useAddRaceHorseMutation} from 'src/redux/splitEndpoints/raceHorseSplit';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';
import { LoadingButton } from '@mui/lab';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
/////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

export const RaceHorseWrapperDialog = (props: any) => {  
  const { open, close, apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, valuesExist, setValuesExist } = props;
  
/**
 * On change text of Autocomplete for stallion filter
*/
let [runnerHorseName, setRunnerHorseName] = useState('');
let [isRunnerHorseSearch, setRunnerHorseSearch] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [isClearRunnerHorse, setIsClearRunnerHorse] = useState(0);
const [isRunnerHorseFakeLoading, setIsRunnerHorseFakeLoading] = useState(false);
const [selectedRunnerHorseId, setSelectedRunnerHorseId] = useState('');
const [isSubmitLoading, setIsSubmitLoading] = useState(false);

// initial state of userModuleAccessAddBtn
const [userModuleAccessAddBtn, setUserModuleAccessAddBtn] = useState({
  marketing_update: false,
});

// call on valuesExist
useEffect(() => {
  setUserModuleAccessAddBtn({
    ...userModuleAccessAddBtn,
    marketing_update: !valuesExist?.hasOwnProperty('MARKETING_RACEHORSE_PAGE') ? false : true,
  });
}, [valuesExist]);

const [addRaceHorse] = useAddRaceHorseMutation();

const { data, isSuccess, isFetching, refetch } = useSeachByRaceHorseNameQuery(runnerHorseName, {skip: (!isRunnerHorseSearch)});
const horseNameList = (runnerHorseName == '') ? [] : data;

// Debounce functionality to restrict concurrent api call
const debouncedHorseName = React.useRef(
  debounce(async (horseName) => {
    if (horseName.length >= 3 && isClearRunnerHorse === 0) {
      await setRunnerHorseName(horseName);
      await setRunnerHorseSearch(true);
      refetch();
    }  else if (horseName?.length === 0 && isClearRunnerHorse === 0) {
      setRunnerHorseSearch(false);
      setIsRunnerHorseFakeLoading(false);
      await setRunnerHorseName("");
    } else {
      setRunnerHorseSearch(false);
      setIsRunnerHorseFakeLoading(true);
      await setRunnerHorseName(horseName);
    }
  }, 250)
).current;

// Handle stallion input change
const handleRunnerHorseInput = (e: any) => {
  setIsClearRunnerHorse(0);
    if (e.target.value && isClearRunnerHorse === 0) {
      debouncedHorseName(e.target.value);
    }
    if (e?.target?.value === "") {
      setRunnerHorseSearch(false);
      setIsRunnerHorseFakeLoading(false);
      setRunnerHorseName("");
      setIsClearRunnerHorse(1);
    }
};

// Select the horse info
const handleHorseSelect = (selectedOptions: any) => {
  setSelectedRunnerHorseId(selectedOptions.horseId);
}

// Stallion reset method to remove option list
const handleRaceHorseOptionsReset = (blurVal: number, ) => {
  setRunnerHorseName('');
  setRunnerHorseSearch(false);
  setIsClearRunnerHorse(blurVal);
  setIsRunnerHorseFakeLoading(false);
};

// On select, capture race horse info
const handleSelectNew = async() => {
  setIsSubmitLoading(true);
  const data = {
    horseId: selectedRunnerHorseId
   };        
   let res: any = await addRaceHorse(data);
   setIsSubmitLoading(false);
   handleRaceHorseOptionsReset(0);
   if (res?.data) {
    setApiStatusMsg({
      status: 201,
      message: `<b>Race horse has been created successfully.`,
    });
    setApiStatus(true);
   }
   else{
    setApiStatusMsg({ status: 422, message: `<b>${res?.error?.data?.message}</b>` });
    setApiStatus(true);
   }
  //  if (res?.error) {
  //   const error: any = res.error;
  //   if (res?.error.status === 422) {
  //     var obj = error?.data?.error;
  //     for (const key in obj) {
  //       if (Object.prototype.hasOwnProperty.call(obj, key)) {
  //         const element = obj[key];
  //         setApiStatusMsg({ status: 422, message: element });
  //         setApiStatus(true);
  //       }
  //     }
  //   }
  //  }
  close();
}


  return (
    <StyledEngineProvider injectFirst>
      <Dialog
        open={props.open}
        className="dialogPopup selecthorseModal"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        <CustomDialogTitle>
          {props.title}

          <IconButton
            onClick={close}
            sx={{
              position: 'absolute',
              right: 12,
              width: 36,
              height: 36,
              top: 18,
              color: (theme) => '#1D472E',
            }}
          >
            <i className="icon-Cross" />
          </IconButton>
        </CustomDialogTitle>

        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>  
          {userModuleAccessAddBtn.marketing_update === false ? <UnAuthorized /> :        
            <Box py={2} mt={1} className='edit-section selectHorseDropdown'>
            <Box className='FormGroup'>
              <Box className='edit-field'>
                <Box className='CustomAutoComplete-Wrapper'>
                <Autocomplete
                  disablePortal
                  popupIcon={<KeyboardArrowDownRoundedIcon />}
                  options={horseNameList || []}
                  noOptionsText={
                    runnerHorseName != '' &&
                    isClearRunnerHorse === 0 && (
                      <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                        <span className="fw-bold sorry-message">
                        {isFetching || isRunnerHorseFakeLoading ? 'Loading...' : `Sorry, we couldn't find any matches for "${runnerHorseName}"`}
                        </span>                    
                      </Box>
                    )
                  }
                  onInputChange={handleRunnerHorseInput}
                  getOptionLabel={(option: any) => `${toPascalCase(option?.horseName)?.toString()} (${option?.yob}, ${option?.countryCode})`}
                  renderOption={(props, option: any) => (
                    <li className="searchstallionListBox" {...props}>
                      <Stack className="stallionListBoxHead">
                        {toPascalCase(option.horseName)} ({option.yob},{' '}
                        <span>{option.countryCode}</span>){' '}
                      </Stack>
                      <Stack className="stallionListBoxpara">
                        <strong>X</strong>
                        <p>
                          {toPascalCase(option.sireName)} ({option.sireYob},{' '}
                          <span>{option.sireCountryCode}</span>),{' '}{toPascalCase(option.damName)} (
                          {option.damYob}, <span>{option.damCountryCode}</span>)
                        </p>
                      </Stack>
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} placeholder={`Enter Horse Name`} />
                  )}
                  onChange={(e:any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
                  onBlur={() => handleRaceHorseOptionsReset(1)}
                  className="mareBlockInput"
                />     
                </Box>
                </Box>
                <Box className="selectBtn" >
                  <LoadingButton type="button" fullWidth  size="large" className="lr-btn" disabled={!selectedRunnerHorseId} loading={isSubmitLoading} onClick={handleSelectNew}>
                      Save
                  </LoadingButton>
                </Box>              
              </Box> 
            </Box>      
          }    
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};

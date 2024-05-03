import React, { useState } from 'react'
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { InputLabel, StyledEngineProvider, Button, Autocomplete, TextField, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { ValidationConstants } from '../constants/ValidationConstants';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useNavigate } from 'react-router-dom';
// Redux services
import { LoadingButton } from '@mui/lab';
import './LRpopup.css';
import { useDamAutocompleteSearchQuery, useSireAutocompleteSearchQuery, useNewPedigreeAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';

type ListSchema = {
    id: string;
}

export const initialState: State = {  
  page: 1,
  order: 'ASC',
  limit: 1,
}
type State =  {
  page: number;
  order: any;
  limit: number;
}

type Props = {
  progenyId: string;
  prevPedigreeId: string;
  param: string;
  generationId: number;
  close: VoidFunction;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  getHorseDetails: VoidFunction,
  openConfirm: VoidFunction,
  newPedigreeName: any,
  setNewPedigreeName: React.Dispatch<React.SetStateAction<any>>,
  updatePedigreeData: any,
  setUpdatePedigreeData: React.Dispatch<React.SetStateAction<any>>,
  pedigreeHorseId: any,
  setPedigreeHorseId: React.Dispatch<React.SetStateAction<any>>,
  currentPedigree: any,
  setCurrentPedigree: React.Dispatch<React.SetStateAction<any>>,
  isPedigreeHorseSearch: boolean,
  setIsPedigreeHorseSearch: React.Dispatch<React.SetStateAction<boolean>>,
  horseType: string,
  newHorsePedigreeClicked: boolean
  setNewHorsePedigreeClicked: React.Dispatch<React.SetStateAction<boolean>>,
  reloadPedigreeAfterSaveOrUpdate: VoidFunction
};

function SelectSireOrDam({
  progenyId,
  prevPedigreeId,
  param,
  generationId,
  close,
  setOpen,
  getHorseDetails,
  openConfirm,
  newPedigreeName,
  setNewPedigreeName,
  updatePedigreeData,
  setUpdatePedigreeData,
  pedigreeHorseId,
  setPedigreeHorseId,
  currentPedigree,
  setCurrentPedigree,
  isPedigreeHorseSearch,
  setIsPedigreeHorseSearch,
  horseType, 
  newHorsePedigreeClicked, 
  setNewHorsePedigreeClicked,
  reloadPedigreeAfterSaveOrUpdate
}: Props) {
    const isStallion = true;
       
    const searchedFieldName = ValidationConstants.stallionName
    const loginSchema = Yup.object().shape({
        id: Yup.string().required(searchedFieldName),
    })

    const methods = useForm<ListSchema>({
      resolver: yupResolver(loginSchema),
      mode: "onTouched",
      criteriaMode: "all"  
    })

    const {
        register,
        reset,
        handleSubmit,
        formState: {  errors,isSubmitting }
      } = methods;


    const [horseId, setHorseId] = useState("");
    const [isDisable, setIsDisable] = useState(true);
    const isDisabled = () => (horseId === "") ? true : false    
    const handleSetId =(value : any) =>{
      setHorseId(value);
      setIsDisable(false);
    }

    const navigate = useNavigate();	

    // Search Autocomplete 
    const [stallionname, setStallionName] = useState<string>("");
    const [mareName, setMareName] = useState<any>("");
    const [stallionListSelected, setStallionListSelected] = useState<any>();
    const [mareListSelected, setMareListSelected] = useState<any>();
    const [isStallionSearch, setIsStallionSearch] = useState(false);
    const [isMareSearch, setIsMareSearch] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [isClearHorse, setIsClearHorse] = useState(0);
    const [isHorseFakeLoading, setIsHorseFakeLoading] = useState(false);

    // Debounce functionality to restrict concurrent api call
    const debouncedHorseName = React.useRef(
      debounce(async (horseName, horseType) => {
        if (horseName?.length >= 3 && isClearHorse === 0) {       
          if(horseType == 'Sire') {
            setStallionName(horseName);
            setIsStallionSearch(true);
            setIsLoading(false);
            refetchSire();
          } else {
            setMareName(horseName);
            setIsMareSearch(true);
            setIsLoading(false);
            refetchMare();
          } 
          setIsHorseFakeLoading(false);
        } else if (horseName?.length === 0 && isClearHorse === 0) {
          if(horseType == 'Sire') {
            setIsStallionSearch(false);
            await setStallionName("");
          } else {
            setIsMareSearch(false);
            await setMareName("");
          }
          setIsHorseFakeLoading(false);
          // await setStallionName("");
        } else {
          setIsLoading(false)
          setMareName(horseName);
          setStallionName(horseName);
          setIsHorseFakeLoading(true);
        }
      }, 1000)
    ).current;

    // Reset mare
  const handleHorseOptionsReset = (blurVal: number, selectedOptions: any) => {
    setMareName('');
    setStallionName("");
    setIsMareSearch(false);
    setIsStallionSearch(false);
    setIsClearHorse(blurVal);    
    setIsHorseFakeLoading(false);
  };
    
    // Handle stallion input change
    const handleHorseInput = (e: any) => {
      setIsClearHorse(0);
      // setIsLoading(true)
      if (e?.target?.value && isClearHorse === 0) {
        debouncedHorseName(e?.target?.value, param);
      } 
      if (e?.target?.value === "") {
        setIsHorseFakeLoading(false);
        setStallionName("");
        setMareName('');
        setIsStallionSearch(false);
        setIsMareSearch(false);    
        setIsClearHorse(1);
      }
      // debouncedHorseName(e.target.value, param); 
    };

    // Stallion payload
    const stallionNameData : any = {
      horseName:  stallionname,
      sex: 'M'
    }

    // Mare payload
    const mareNameData : any = {
      horseName :  mareName,
      sex: 'F'
    }

    // Select the horse info
    const handleHorseSelect = (selectedOptions: any) => {
      const horseId = selectedOptions.horseId;
      // setNewPedigreeName(selectedOptions.horseName);
      handleHorseOptionsReset(0, selectedOptions); 
      handleSetId(horseId);
    }
    
    // Sire search api call
    const { data: stallionNamesList, isFetching: isSireFetching, refetch: refetchSire } = useNewPedigreeAutocompleteSearchQuery(stallionNameData, {skip: (!isStallionSearch)});
    
    // Mare search api call
    const { data: mareNamesList, isFetching: isMareFetching, refetch: refetchMare } = useNewPedigreeAutocompleteSearchQuery(mareNameData, {skip: (!isMareSearch)});
    
    const isFetching = (param == 'Sire') ? isSireFetching : isMareFetching;

    // Assign Stallion search response

    let stallionNameOptionsList = (isStallionSearch && isClearHorse === 0 && !isFetching) ? stallionNamesList : [] ;
    let mareNameOptionsList = (isMareSearch && isClearHorse === 0 && !isFetching) ? mareNamesList : [];
    const horseNameList = (param === 'Sire') ? stallionNameOptionsList : mareNameOptionsList;
    
    // On select new, capture horse info
    const handleSelectNew = async() => {
      setIsSubmitLoading(true);
      const data = {
        newPedigreeId: horseId,
        progenyId: progenyId,
        prevPedigreeId: prevPedigreeId
       }   
      setIsSubmitLoading(false);
      setPedigreeHorseId({pedigreeId: horseId, tag: horseType});
      // setIsPedigreeHorseSearch(true);
      reloadPedigreeAfterSaveOrUpdate();
      reset();
      close();
      // getHorseDetails();
    }

    const nameText = mareName || stallionname;

    // Open new stallion navigation
    const handleOpenCreatePedigreeModal = () => {
      close();
      setNewHorsePedigreeClicked(true);
      setNewPedigreeName((param == 'Sire') ? stallionname : mareName);
      setPedigreeHorseId("0");
      setOpen(true);
    };

  return (
    <StyledEngineProvider injectFirst>
          <Box className='search-stallion-pop-box selectSire'>
            <InputLabel>Search for a {param}</InputLabel>
            <p className='search-stallion-error'>{errors.id?.message}</p>
            <Box className='search-stallion-pop-box-inner'>
              <Autocomplete
                disablePortal
                popupIcon={<KeyboardArrowDownRoundedIcon />}
                options={horseNameList}
                noOptionsText={ 
                  (nameText != '' && isClearHorse === 0 && 
                  <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
                    <Box>
                      <span className="fw-bold sorry-message">
                        {isFetching || isHorseFakeLoading 
                        ? "loading..." 
                        : `Sorry, we couldn't find any matches for "${stallionname || mareName}"`
                        }
                      </span>
                    </Box>
                    {!isHorseFakeLoading && <Box className='submit-new-bg'><Button variant="text" className='lr-btn lr-btn-outline' color="primary" type="button" disabled={nameText === ''} onClick = {() => handleOpenCreatePedigreeModal()}>Add New</Button></Box>}
                  </Box>
                  )}
                onInputChange={handleHorseInput}
                getOptionLabel={(option: any) => `${toPascalCase(option?.horseName)?.toString()} (${option?.yob}, ${option?.countryCode})`}
                renderOption={(props, option: any) => (
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
                renderInput={(params) => (
                  <TextField {...params} placeholder={`Enter ${param} Name`} />
                )}
                onChange={(e:any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
                onBlur={() => handleHorseOptionsReset(1, '')}
                className="mareBlockInput"
              />
              </Box> 
            <Box className="selectBtn">
              <LoadingButton type="button" fullWidth  size="large" className="lr-btn" loading={isSubmitLoading} onClick={handleSelectNew}>
                Select
              </LoadingButton>
            </Box>
          </Box>   
    </StyledEngineProvider>
  )
}

export default SelectSireOrDam

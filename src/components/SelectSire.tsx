import React, { useState } from 'react'
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { InputLabel, StyledEngineProvider, Button, Autocomplete,
  TextField, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { ValidationConstants } from '../constants/ValidationConstants';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { useNavigate } from 'react-router-dom';
// Redux services
import { LoadingButton } from '@mui/lab';
import './LRpopup.css';
import { useDamAutocompleteSearchQuery, useSireAutocompleteSearchQuery, useUpdateHorsePedigreeMutation } from 'src/redux/splitEndpoints/horseSplit';
import PedigreeAddModal from 'src/sections/@dashboard/horse/PedigreeAddModal';
import { debounce } from 'lodash';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { toPascalCase } from 'src/utils/customFunctions';

type ListSchema = {
    id: string;
}

type Option = {
  id: string;
  name: string;
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
  pedigreePosition: string,
};

function SelectStallion({
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
  pedigreePosition,
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

    // Debounce functionality to restrict concurrent api call
    const debouncedHorseName = React.useRef(
      debounce(async (horseName, horseType) => {
        if (horseName?.length >= 3) {       
          if(horseType == 'Sire') {
            setStallionName(horseName);
            setIsStallionSearch(true);
            setIsLoading(false)
          } else {
            setMareName(horseName);
            setIsMareSearch(true);
            setIsLoading(false)
          } 
        }else {
          setIsLoading(false)
          setMareName(horseName);
        }
      }, 1000)
    ).current;
    
    // Handle stallion input change
    const handleStallionInput = (e: any) => {
      setIsLoading(true)
      debouncedHorseName(e.target.value, param); 
    };

    // Stallion payload
    const stallionNameData : any = {
      sireName :  stallionname
    }

    // Mare payload
    const mareNameData : any = {
      damName :  mareName
    }

    // Select the horse info
    const handleHorseSelect = (selectedOptions: any) => {
      const horseId = selectedOptions.horseId;
      setNewPedigreeName(selectedOptions.horseName);
      handleSetId(horseId);
    }
    
    // Sire search api call
    const { data: stallionNamesList } = useSireAutocompleteSearchQuery(stallionNameData, {skip: (!isStallionSearch)});
    
    // Mare search api call
    const { data: mareNamesList, isFetching } = useDamAutocompleteSearchQuery(mareNameData, {skip: (!isMareSearch)});
    const horseNameList = (param == 'Sire') ? stallionNamesList : mareNamesList;
    const accessToken = localStorage.getItem('accessToken');
    const isLoggedIn = (accessToken) ? true : false; 
    const [openPedigreeModal, setOpenPedigreeModal] = useState(false);
    const handleClose = () => setOpenPedigreeModal(false); 

    // Open new stallion navigation
    const handleOpenCreatePedigreeModal = () => {
      close();
      // navigate(PATH_DASHBOARD.horsedetails.add((param == 'Sire') ? stallionname : mareName, progenyId, generationId));
      // setOpenPedigreeModal(true);
      setNewPedigreeName((param == 'Sire') ? stallionname : mareName);
      setPedigreeHorseId("0");
      setOpen(true);
    };
    const handleClosePedigreeStallion = () => {
      setOpenPedigreeModal(false);
    };

    const handleSelectOld = () => {
      const data = {
        newPedigreeId: horseId,
        progenyId: progenyId,
        prevPedigreeId: prevPedigreeId
       }    
    }
    const [updatePedigree] = useUpdateHorsePedigreeMutation();

    // On select new, capture horse info
    const handleSelectNew = async() => {
      setIsSubmitLoading(true);
      const data = {
        newPedigreeId: horseId,
        progenyId: progenyId,
        prevPedigreeId: prevPedigreeId,
        pedigreePosition: pedigreePosition
       }        
      // await updatePedigree(data);
      setIsSubmitLoading(false);
      reset();
      close();
      openConfirm();
      setUpdatePedigreeData(data);
      // getHorseDetails();
    }

    const nameText = mareName || stallionname;

  return (
    <StyledEngineProvider injectFirst>
          <Box className='search-stallion-pop-box selectSire'>
            <InputLabel>Search for a {param}</InputLabel>
            <p className='search-stallion-error'>{errors.id?.message}</p>

            { isStallion &&   
            <Box className='search-stallion-pop-box-inner'>
              <Autocomplete
              disablePortal
              popupIcon={<KeyboardArrowDownRoundedIcon />}
              options={horseNameList || []}
              noOptionsText={ ((stallionname != 'abc' || mareName != 'str')  && <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
              <Box><span className="fw-bold sorry-message">{isFetching ? "loading..." : ((nameText && nameText?.length < 3) ? "Please Enter minimum 3 words" :  `Sorry, we couldn't find any matches for ${(stallionname || mareName) && toPascalCase(`${stallionname || mareName}`)}`)}</span></Box>
              <Box className='submit-new-bg'><Button variant="text" className='lr-btn lr-btn-outline' color="primary" type="button" disabled={nameText === ''} onClick = {() => handleOpenCreatePedigreeModal()}>Add New</Button></Box>
              </Box>)}
              onInputChange={handleStallionInput}
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
                      {toPascalCase(option.sireName)} ({option.sireyob},{' '}
                      <span>{option.sirecountry}</span>),{' '} {toPascalCase(option.damName)} (
                      {option.damyob}, <span>{option.damcountry}</span>)
                    </p>
                  </Stack>
                </li>
              )}
              renderInput={(params) => (
                <TextField {...params} placeholder={`Enter ${param} Name`} />
              )}
              onChange={(e:any, selectedOptions: any) => handleHorseSelect(selectedOptions)}
              className="mareBlockInput"
            />
              </Box>
                              
            }
            <Box className="selectBtn">
              <LoadingButton type="button" fullWidth  size="large" className="lr-btn" loading={isSubmitLoading} onClick={handleSelectNew}>
                Save
              </LoadingButton>
            </Box>
          </Box>    
          {/* <PedigreeAddModal open={openPedigreeModal} rowId={""} isEdit={true}  handleClose={handleClosePedigreeStallion} genId={0} progenyId={progenyId} />   */}
        
    </StyledEngineProvider>
  )
}

export default SelectStallion

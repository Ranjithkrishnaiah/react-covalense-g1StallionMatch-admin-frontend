import * as React from 'react';
import { useStallionAutocompleteSearchQuery } from 'src/redux/splitEndpoints/stallionAutocompleteSplit';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { toPascalCase } from 'src/utils/customFunctions';
import { Stack, Box, Autocomplete, TextField } from '@mui/material';
import { debounce } from 'lodash';

export default function StallionAutoFilter(props: any) {
  const [stallionname, setStallionName] = React.useState<string>("");
  const [isStallionSearch, setIsStallionSearch] = React.useState(false);
  const [isClearHorse, setIsClearHorse] = React.useState(0);
  const [isHorseFakeLoading, setIsHorseFakeLoading] = React.useState(false);

  // Debounce functionality to restrict concurrent api call
  const debouncedHorseName = React.useRef(
    debounce(async (horseName) => {
      if (horseName?.length >= 3 && isClearHorse === 0) {
        setStallionName(horseName);
        setIsStallionSearch(true);
        setIsHorseFakeLoading(false);
        refetch();    
      } else if (horseName?.length === 0 && isClearHorse === 0) {        
        setIsStallionSearch(false);
        await setStallionName("");        
        setIsHorseFakeLoading(false);
      } 
    }, 1000)
  ).current;

  // Reset mare
  const handleHorseOptionsReset = (blurVal: number, selectedOptions: any) => {
    setStallionName("");
    setIsStallionSearch(false);
    setIsClearHorse(blurVal);    
    setIsHorseFakeLoading(false);
  };
  
  // Handle stallion input change
  const handleHorseInput = (e: any) => {
    setIsClearHorse(0);
    if (e?.target?.value && isClearHorse === 0) {
      debouncedHorseName(e?.target?.value);
    } 
    if (e?.target?.value === "") {
      setIsHorseFakeLoading(false);
      setStallionName("");
      setIsStallionSearch(false);   
      setIsClearHorse(1);
    }
  };   

  const { data: stallionNamesList, isFetching, isSuccess, refetch } = useStallionAutocompleteSearchQuery(stallionname, { skip: (!isStallionSearch) });
  let stallionFilterOptions = (isStallionSearch && isClearHorse === 0 && !isFetching) ? stallionNamesList : [] ;

  const handleStallionSelect = (selectedOptions: any) => {
    props.setStallionId(selectedOptions ? selectedOptions.stallionId : '');
    handleHorseOptionsReset(0, selectedOptions); 
  }
  
  return (
    <Box className='search-stallion-pop-box-inner'>
      <Autocomplete
        disablePortal
        popupIcon={<KeyboardArrowDownRoundedIcon />}
        options={stallionFilterOptions}
        noOptionsText={ 
          (stallionname != '' && isClearHorse === 0 && 
          <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
            <Box>
              <span className="fw-bold sorry-message">
                {isFetching || isHorseFakeLoading 
                ? "loading..." 
                : `Sorry, we couldn't find any matches for "${stallionname}"`
                }
              </span>
            </Box>
          </Box>
        )}
        onInputChange={handleHorseInput}
        getOptionLabel={(option: any) => `${toPascalCase(option?.stallionName)} (${option?.countryCode}, ${option?.yob}) `}
        renderOption={(props, option: any) => (
          <li className="searchstallionListBox" style={{ color: '#000 !important' }} {...props}>
            <Stack className="stallionListBoxHead">
              {toPascalCase(option.stallionName)} ({option.yob},{' '}
              <span>{option.countryCode}</span>){' '} - {option.farmName}
            </Stack>
            <Stack className="stallionListBoxpara">
              <strong>X</strong>
              <p>
                {toPascalCase(option.sireName)} ({option.sireYob},{' '}
                <span>{option.sireCountryCode}</span>),{' '} {toPascalCase(option.damName)} (
                {option.damYob}, <span>{option.damCountryCode}</span>)
              </p>
            </Stack>
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} placeholder={`Select Stallion`} />
        )}
        onChange={(e:any, selectedOptions: any) => handleStallionSelect(selectedOptions)}
        onBlur={() => handleHorseOptionsReset(1, '')}
        className="mareBlockInput"
      />
    </Box> 
  )
}
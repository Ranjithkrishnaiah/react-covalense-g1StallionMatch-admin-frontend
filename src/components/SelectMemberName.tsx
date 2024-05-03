import * as React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useNameAutocompleteSearchQuery } from 'src/redux/splitEndpoints/memberSplit';
import { debounce } from 'lodash';
import { Autocomplete, TextField, SxProps, InputAdornment, IconButton, Stack, Box} from '@mui/material';
import { Images } from 'src/assets/images';
import { toPascalCase } from 'src/utils/customFunctions';

export default function SelectMemberName (props: any){
    const [isName, setIsName] = React.useState(false);

    const [inputValue, setInputValue] = React.useState("");
    const [value, setValue] = React.useState({
      fullName: ""
    });
    const [isClearName,setIsClearName] = React.useState(0);
    const [isToggleClass, setIsToggleClass]= React.useState(false);

    React.useEffect(() => {
      if(props?.nameValue){
        handleNameSelect(props.nameValue)
      }
    }, [props?.nameValue])

    // On name select event
    const handleNameSelect = (selectedOptions: any) => {
      if(selectedOptions){
        setValue(selectedOptions);
        props.setName(selectedOptions);
      }
      setIsName(false); 
    }
    
    // On input text change event
    const handleNameInput = (targetValue: any) => {
      setIsClearName(0);
      debouncedMemberName(targetValue);          
    };

    // Debounce functionality to restrict concurrent api call
    const debouncedMemberName = React.useRef(
      debounce(async (name) => {
        setInputValue(name);
        if (name.length >= 3) {
          setIsName(true); 
        } else {
          setIsName(false);
        }      
      }, 10)
    ).current;

    const handleNameToggle = () => {
      setIsToggleClass(!isToggleClass)
    };
    
    // Member name search api call
    const { data, error, isFetching, isLoading, isSuccess } = useNameAutocompleteSearchQuery(`${inputValue}?isNameExactSearch=${isToggleClass}`, {skip: (!isName)}); 
    const nameFilterOptions = (inputValue == '') ? [] : data;
    let toggleClass = (isToggleClass) ? 'matched-active' : 'matched-inactive';

    return(
      <>
     <Box className='search-stallion-pop-box-inner'>
    <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          handleNameSelect(newValue);
        }}
        popupIcon={<KeyboardArrowDownIcon/>}
        className="filter-at"
        id="customAutocomplete"
        disablePortal
        options={nameFilterOptions || []}
        getOptionLabel={(option:any) => option && option?.fullName}
        onInputChange={(event, newInputValue) => {
          handleNameInput(newInputValue);
        }}
        noOptionsText={
          inputValue != '' &&
          isClearName === 0 && (
            <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp">
              <span className="fw-bold sorry-message">
              {isFetching ? 'Loading...' : `Sorry, we couldn't find any matches for "${inputValue}"`}
              </span>
            </Box>
          )
        }
        renderOption={(props:any, option: any) => (
          <li className="searchstallionListBox" {...props}>
            <Stack className="stallionListBoxHead">
              {toPascalCase(option.fullName)}
            </Stack>
            <Stack className="stallionListBoxpara">
              <strong>X</strong>
               <p>
                {toPascalCase(option.fullName)} ({option.email},{' '}
                )
              </p> 
            </Stack>
          </li>
        )}
        renderInput={params => {
          return (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Name"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    <InputAdornment position="start" className='matchcase'>
                      <IconButton
                        className = {`matchcase-first ${toggleClass}`} 
                        aria-label="toggle password visibility"
                        edge="end"
                        onClick={handleNameToggle}
                        sx={{ marginRight: '0px', padding: '0px' }}>
                        <img src={Images.Aa} alt='Aa'/>
                      </IconButton>
            
                      <IconButton
                        className = {`matchcase-second ${toggleClass}`} 
                        aria-label="toggle password visibility"
                        edge="end"
                        onClick={handleNameToggle}
                        sx={{ marginRight: '0px', padding: '0px' }}>
                        <img src={Images.ab} alt='ab'/>
                      </IconButton>
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                )
              }}
            />
          );
        }}
      />
      </Box>
      </>
    )
}
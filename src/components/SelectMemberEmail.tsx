import * as React from 'react';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionSplit';
import CustomAutocomplete from '../components/CustomAutocomplete'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useEmailAutocompleteSearchQuery } from 'src/redux/splitEndpoints/memberSplit';
import { debounce } from 'lodash';
import { Autocomplete, TextField, SxProps, InputAdornment, IconButton} from '@mui/material';
import { Images } from 'src/assets/images';

export default function SelectMemberEmail (props: any){
    const [isEmail, setIsEmail] = React.useState(false);
    
    const [inputValue, setInputValue] = React.useState("");
    const [value, setValue] = React.useState({
      email: ""
    });
    const [isToggleClass, setIsToggleClass]= React.useState(false);

    React.useEffect(() => {
      if(props?.emailValue){
        handleEmailSelect(props.emailValue)
      }
    }, [props?.emailValue])
    
    // On email select event
    const handleEmailSelect = (selectedOptions: any) => {
      if(selectedOptions){
        setValue(selectedOptions);
        props.setEmail(selectedOptions);
      }
      setIsEmail(false); 
    }

    // On input text change event
    const handleEmailInput = (targetValue: any) => {
      debouncedMemberEmail(targetValue);        
    };

    // Debounce functionality to restrict concurrent api call
    const debouncedMemberEmail = React.useRef(
      debounce(async (email) => {
        setInputValue(email);
        if (email.length >= 3) {
            setIsEmail(true); 
        } else {
          setIsEmail(false);
        }
      }, 10)
    ).current;

    const handleEmailToggle = () => {
      props.getIsExactEmail(!isToggleClass)
      setIsToggleClass(!isToggleClass)
    };

    // Member email search api call
    const { data, error, isFetching, isLoading, isSuccess } = useEmailAutocompleteSearchQuery(`${inputValue}?isEmailAddressExactSearch=${isToggleClass}`, {skip: (!isEmail)}); 
    const emailFilterOptions = (inputValue == '') ? [] : data;
    let toggleClass = (isToggleClass) ? 'matched-active' : 'matched-inactive';

    return(
    
    <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          handleEmailSelect(newValue);
        }}
        popupIcon={<KeyboardArrowDownIcon/>}
        className="filter-at"
        id="customAutocomplete"
        disablePortal
        options={emailFilterOptions || []}
        getOptionLabel={(option:any) => option.email}
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          handleEmailInput(newInputValue);
        }}
        renderInput={params => {
          return (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Email Address"
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
                        onClick={handleEmailToggle}
                        sx={{ marginRight: '0px', padding: '0px' }}>
                        <img src={Images.Aa} alt='Aa'/>                        
                      </IconButton>
                   
                      <IconButton
                        className = {`matchcase-second ${toggleClass}`} 
                        aria-label="toggle password visibility"
                        edge="end"
                        onClick={handleEmailToggle}
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
    )
}
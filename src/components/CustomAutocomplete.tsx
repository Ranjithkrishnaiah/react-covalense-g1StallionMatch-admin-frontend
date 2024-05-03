import { Autocomplete, TextField, SxProps } from '@mui/material';
import { Box } from '@mui/system';

export type VoidFunctionType = () => void;
// AutoCompleteProps interface
interface AutoCompleteProps {
  placeholder: string;
  options: any;
  popupIcon?: any;
  sx?: SxProps;
  getOptionLabel?: any;
  className?: string;
  noOptionsText?: any;
  onInputChange?: (e: any, value: string, reason: string) => void;
  onChange?: (e: any, selectedOptions: any) => void;
  value?: any;
  freeSoloValue?: any;
  clearOnBlur?: boolean;
  disableField?: boolean;
  onBlur?: any;
  clearIcon?: any;
  renderOption?: any;
  renderInput?: any;
}
function CustomAutocomplete(props: AutoCompleteProps) {
  // Autocomplete
  return (
    <Box className="CustomAutoComplete-Wrapper">
      <Autocomplete
        freeSolo={props.freeSoloValue ? true : false}
        className="CustomAutoComplete"
        fullWidth
        {...props}
        disablePortal
        autoComplete
        id="customAutocomplete"
        disabled={props.disableField ? props.disableField : false}
        renderInput= {props?.renderInput ? props?.renderInput : (params) => <TextField {...params} placeholder={props.placeholder} />}
      />
    </Box>
  );
}

export default CustomAutocomplete;

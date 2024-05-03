import { TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Controller, useFormContext } from "react-hook-form";
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface IProps {
    name : any,
    rules : any,
    options : any,
    getOptionLabel :any,
    handleStallionInput : any,
    placeholder : string,
    optionName: string
    
}


export default function AutoCompleteSearch({
    name,
    rules,
    options,
    getOptionLabel,
    handleStallionInput,
    placeholder ,
    optionName,
    ...rest
  } : IProps) {
    const { control } = useFormContext();
  
    return (
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({
          field: { ref, ...field },
          fieldState: { error, invalid }
        }) => {
          return (
            <Autocomplete
            disableCloseOnSelect
              {...field}
              options={options || []}
              noOptionsText={'Loading'}
              defaultValue={null}
              getOptionLabel={getOptionLabel}
              onInputChange={(event, newInputValue) => {
                handleStallionInput(newInputValue);
              }}

              renderOption={(props, option, { selected }) => (
                <li {...props} key={option?.id}>
                  <Checkbox
                    icon={icon}
                    checkedIcon={checkedIcon}
                    style={{ marginRight: 8 }}
                    checked={selected}
                  />
                  {option?.[optionName]}
                </li>
              )}
            
              renderInput={(params) => (
                <TextField
                  {...params}
                  {...rest}
                  inputRef={ref}
                  error={invalid}
                  helperText={error?.message}
                />
              )}
              onChange={(e, value) => field.onChange(value)}
             
            />
          );
        }}
      />
    );
  }
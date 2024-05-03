import { TextField, Box } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Controller, useFormContext } from "react-hook-form";
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { MenuItem, MenuList } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import { Images } from 'src/assets/images';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

interface IProps {
    name : any,
    rules : any,
    options : any,
    getOptionLabel :any,
    handleStallionInput : any,
    placeholder : string,
    optionName: string,
    labelName : string,
    
}

export default function AutoCompleteTest({
    name,
    rules,
    options,
    getOptionLabel,
    handleStallionInput,
    placeholder ,
    optionName,
    labelName,
    ...rest
  } : IProps) {
  const {  control } = useFormContext();

  const icon = <CheckBoxOutlineBlankIcon className="check-box-icon" fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const newCategories = [
    { id: 1, title: "Categoria 1" },
    { id: 2, title: "Categoria 2" },
    { id: 3, title: "Categoria 3" }
  ];


  return (
    <Box className="SDmultiselect">
        <Controller
          name={name}
          control={control}
          defaultValue={[]}
          render={({ field: { value, onChange } }) => (
            <Autocomplete
            
            ChipProps={{ deleteIcon: <CloseIcon /> }}
            className="AutoCompleteBox"
              id="checkboxes-tags-demo"
              sx={{ margin:'0px', padding:'0px' }}
              popupIcon={<KeyboardArrowDownRoundedIcon/>}
              // fullWidth
              multiple
              // limitTags={2}
              value={value}
              onChange={(event, selectedOptions) => onChange(selectedOptions)}
              onInputChange={(event, newInputValue) => {
                handleStallionInput(newInputValue);
              }}
              
              getOptionLabel={getOptionLabel}
              disableCloseOnSelect
              noOptionsText=""
              options={options}
              renderOption={(props,option, { selected }) => {
                return (
                    <li className="autocompleteList" {...props} key={option?.id}>
                    
                    <Box className="autocompleteBox">
                      <Box className="autocompletetext">{option?.[optionName]}</Box>
                      <Checkbox
                        className="autocompletecheckbox"
                        // icon={icon}
                        // checkedIcon={checkedIcon}
                        checkedIcon={<img src={Images.checked}/>} 
                        icon={<img src={Images.unchecked}/>}

                        style={{ marginRight: 0 }}
                        checked={selected}
                      />
                    </Box>
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={labelName}
                  placeholder={placeholder}
                />
              )}
            />
          )}
        />
      </Box>

  );
}



import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionSplit';
import { useFormContext, Controller } from 'react-hook-form';

export default function StallionAuto() {
  const { control } = useFormContext();
  let [stallionFilterData, setStallionFilterData] = React.useState('');

  const handleAutocompleteTextChangeForStallion = (value: string) => {
    if (value && value.length >= 3) {
      setStallionFilterData((stallionFilterData = value));
    }
  };


  const { data, error, isFetching, isLoading, isSuccess } =
  useStallionAutocompleteQuery(stallionFilterData);


  const stallionFilterOptions = stallionFilterData == '' ? [] : data;
  return (
    // <Controller
    // name="horseName"
    //   control={control}
    //   render={({ field }) => (
    //     <Autocomplete
    //       id="stallion-filter"
    //       sx={{ width: 200 }}
    //       options={stallionFilterOptions}
    //       getOptionLabel={(option: any) => option?.horseName || ''}
    //       renderInput={(params) => (
    //         <TextField
    //           {...params}
    //           label="Select Stallion"
    //           margin="normal"
    //           onChange={(ev) => {
    //             // dont fire API if the user delete or not entered anything
    //             if (ev.target.value !== '' || ev.target.value !== null) {
    //               handleAutocompleteTextChangeForStallion(ev.target.value);
    //             }
    //           }}
    //         />
    //       )}
    //        {...field}
    //         // onChange={(_event, data) => field.onChange(data?.horseName ?? '')}
    //           onChange={(_event, data) => console.log(_event,data,"ganesh event")}
    //       renderOption={(props, option, { inputValue }) => {
    //         const matches = match(option.horseName, inputValue);
    //         const parts = parse(option.horseName, matches);
    //         return (
    //           <li {...props}>
    //             <div>
    //               {parts.map((part, index) => (
    //                 <span
    //                   key={index}
    //                   style={{
    //                     fontWeight: part.highlight ? 700 : 400,
    //                   }}
    //                 >
    //                   {part.text}
    //                 </span>
    //               ))}
    //             </div>
    //           </li>
    //         );
    //       }}
    //     />
    //   )}
    // />
   
    <Controller
    render={props => (
      <Autocomplete
        {...props}
        options={stallionFilterOptions}
        getOptionLabel={(option : any) => option?.horseName}
        renderInput={params => (
          <TextField
            {...params}
            label="Country"
            placeholder="Select a Country"
            InputLabelProps={{
              shrink: true
            }}
            variant="outlined"
          />
        )}
        onChange={(_, data) => props.field.onChange(data)}
      />
    )}
    name="horse"
    control={control}
  />


  );
}

// form
import { useFormContext, Controller } from 'react-hook-form';
// @mui
import { Checkbox, FormControlLabel, FormGroup, FormControlLabelProps } from '@mui/material';
import Iconify from 'src/components/Iconify';
import { Images } from 'src/assets/images';

// ----------------------------------------------------------------------

interface RHFCheckboxProps extends Omit<FormControlLabelProps, 'control'> {
  name: string;
  options: boolean;
}

export default function RHFCheckboxWithRadio({ name, options, ...other }: RHFCheckboxProps) {
  const { control } = useFormContext();
  const handleCheckboToggle = (options: boolean) => {
    options = !options;
  }
  return (
    <FormControlLabel
      control={
        <Controller
          name={name}
          control={control}
          render={({ field }) => <Checkbox {...field} checked={field.value} disableRipple          
          checkedIcon={<img src={Images.Radiochecked}/>}
          icon={<img src={Images.Radiounchecked} />}
          />
        } 
        />
      }
      {...other}
    />
  );
}




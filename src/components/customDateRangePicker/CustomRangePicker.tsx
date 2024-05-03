import * as React from 'react';
import './CustomDaterangepicker.css';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  StyledEngineProvider,
  Popper,
  ClickAwayListener,
} from '@mui/material';
import { Images } from 'src/assets/images';
import { dateHypenConvert } from 'src/utils/customFunctions';
import { Calendar, DateObject } from 'react-multi-date-picker';
import { format } from 'date-fns';

export default function CustomRangePicker(props: any) {
  const outlinedInputRef = React.useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectionRange, setSelectionRange] = React.useState<any>([
    {
      startDate: new Date(),
      endDate: null,
      key: 'selection',
    },
  ]);

  const [openPopper, setOpenPopper] = React.useState(false);
  const handleDateRangeCalander = () => {
    setOpenPopper((openPopper) => !openPopper);
    setSelectionRange([
      {
        startDate: new Date(),
        endDate: null,
        key: 'selection',
      },
    ]);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpenPopper((openPopper) => !openPopper);
    setIsOpen(true);
    setSelectionRange([
      {
        startDate: new Date(),
        endDate: null,
        key: 'selection',
      },
    ]);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  const canBeOpen = openPopper && Boolean(anchorEl);
  const popperId = canBeOpen ? 'simple-popper' : undefined;
  
  //hides the popover
  const hidePopover = () => {
    setAnchorEl(null);
    setOpenPopper(false);
  };

  const [values, setValues]: any = React.useState([]);

  React.useEffect(() => {
    if (values[0] && values[1]) {
      const startDate = values[0] ? dateHypenConvert(values[0]) : '';
      const endDate = values[1] ? dateHypenConvert(values[1]) : '';
      props.setConvertedDateRangeValue(startDate + ' - ' + endDate);
      props.setConvertedYobDateValue([startDate, endDate]);
      hidePopover();
      setIsOpen(false);

      // Set focus back to the OutlinedInput
      if (outlinedInputRef.current) {
        outlinedInputRef.current.focus();
      }
    }
  }, [values]);

  //updated values when ever the convertedDateRangeValue is updated
  React.useEffect(() => {
    if (props.convertedDateRangeValue.length > 4) {
      const startDate = new DateObject(props.convertedDateRangeValue.substr(0, 11));
      const endDate = new DateObject(props.convertedDateRangeValue.substr(13));
      setValues([startDate, endDate]);
    } else {
      setValues([]);
    }
  }, [props.convertedDateRangeValue]);

  const handleReset = () =>{
    props.setConvertedDateRangeValue('');
    props.setConvertedYobDateValue([null, null]);
  }

  return (
    <StyledEngineProvider injectFirst>
      <Box className="customDate">
        <FormControl className="datepicker" variant="filled">
          <OutlinedInput
            id="outlined-adornment-password"
            placeholder={props.placeholderText}
            disabled={props.disabled}
            value={(values[0] && values[1]) ? props?.type === "memberTypeFormat" ? `${values[0] && format(new Date(values[0]), 'dd-MM-yyyy')} - ${values[1] && format(new Date(values[1]), 'dd-MM-yyyy')}` : `${values[0] && format(new Date(values[0]), 'dd-MM-yyyy')} - ${values[1] && format(new Date(values[1]), 'dd-MM-yyyy')}` : ''}
            className="DP-input"
            endAdornment={
              <InputAdornment position="end" sx={{ paddingLeft: '0px' }}>
                {props.convertedDateRangeValue.length > 0 && <IconButton 
                  onClick={handleReset}> 
                  <img src={Images.close} alt="Close" width="11px" height="11px"/>
                </IconButton>}
                <IconButton
                  aria-describedby={popperId}
                  onClick={handleClick}
                  aria-label="toggle password visibility"
                  edge="end"
                  sx={{ marginRight: '3px', padding: '0px' }}
                  disabled={props.disabled}
                >
                  <img
                    src={Images.Datepicker}
                    style={{ opacity: props.disabled ? 0.5 : 1 }}
                    alt="Date Picker"
                  />
                </IconButton>
              </InputAdornment>
            }
            inputRef={outlinedInputRef}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                // Backspace key is pressed, clear the date manually
                handleReset();
              }
            }}
          />
        </FormControl>
      </Box>

      {isOpen && (
        <Popper
          id={popperId}
          open={openPopper}
          anchorEl={anchorEl}
          className="customDateRangepicker"
          placement="auto"
          style={{ zIndex: 9 }}
          modifiers={[
            {
              name: 'offset',
              options: {
                enabled: true,
                offset: [0, 10],
              },
            },
          ]}
        >
          <ClickAwayListener onClickAway={(e: any) => hidePopover()}>
            <Box className="customDRpicker" sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
              <Calendar
                value={values}
                onChange={setValues}
                range
                rangeHover
                disabled={props.disabled ? props.disabled : false}
              />
            </Box>
          </ClickAwayListener>
        </Popper>
      )}
    </StyledEngineProvider>
  );
}

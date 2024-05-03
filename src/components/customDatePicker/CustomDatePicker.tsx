import * as React from 'react';
import {
    Box,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    StyledEngineProvider,
    SxProps,
    TextField,
    Tooltip,
    Popper,
    Popover,
    ClickAwayListener,
    Fade
} from '@mui/material';
import { Images } from 'src/assets/images';
import { format } from 'date-fns';
import { yearOnlyConvert, dateHypenConvert } from 'src/utils/customFunctions';
import DatePicker, { Calendar, DateObject } from "react-multi-date-picker"

export default function CustomDatePicker(props: any) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [values, setValues]: any = React.useState<any>();

    // const [convertedDateRangeValue, setConvertedDateRangeValue] = React.useState("");

    const [openPopper, setOpenPopper] = React.useState(false);
    const handleDateRangeCalander = () => {
        setOpenPopper((openPopper) => !openPopper);
        // props.setConvertedDateRangeValue("");
    }

    const handleReset = () => {
        setValues(props.handleChange(null));
    }

    // const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
        setOpenPopper((openPopper) => !openPopper);
        setIsOpen(true);
        // props.setConvertedDateRangeValue("");
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const canBeOpen = openPopper && Boolean(anchorEl);
    const popperId = canBeOpen ? 'simple-popper' : undefined;

    const hidePopover = () => {
        setAnchorEl(null);
        setOpenPopper(false);
    }

    const handleValue = (val: any) => {
        setValues(val);
    }

    React.useEffect(() => {
        if (values) {
            //   const startDate = values[0] ? dateHypenConvert(values[0]) : ''
            //   const endDate =  values[1] ? dateHypenConvert(values[1]) : ''
            //   props.setConvertedDateRangeValue(startDate + " - " + endDate);
            //   props.setConvertedYobDateValue([startDate, endDate])
            props.handleChange(dateHypenConvert(values));
            hidePopover();
            setIsOpen(false);
        }
    }, [values]);

    React.useEffect(() => {
        if (props?.value?.length > 4) {
            setValues(new DateObject(props.value.substr(0, 11)))
        }
    }, [props?.value]);

    const parsedDate = new Date(props?.value);

    // Check the year of the date
    const year = parsedDate.getUTCFullYear();

    let formattedDate;
    if (!isNaN(parsedDate.getTime())) {
        // Check if parsedDate is a valid date
        formattedDate = format(parsedDate, 'dd-MM-yyyy');
    } else {
        // Handle invalid date gracefully
        formattedDate = "Invalid Date";
    }

    return (
        <StyledEngineProvider injectFirst>

            <Box className="customDate">
                <FormControl className="datepicker" variant="filled">

                    <OutlinedInput
                        id="outlined-adornment-password"
                        placeholder={props.placeholderText}
                        value={`${props?.value?.length > 4 ? formattedDate : ''}`}
                        error={props?.isError ? props?.value?.length ? false : true : false}
                        disabled={props?.disabled !== undefined ? props?.disabled : false}
                        className="DP-input"
                        endAdornment={
                            <InputAdornment position="end" sx={{ paddingLeft: '0px' }}>
                                {props?.value?.length > 0 && <IconButton
                                    onClick={handleReset}>
                                    <img src={Images.close} alt="Close" width="11px" height="11px" />
                                </IconButton>
                                }
                                <IconButton
                                    aria-describedby={popperId}
                                    onClick={handleClick}
                                    aria-label="toggle password visibility"
                                    edge="end"
                                    sx={{padding: '0px' }}
                                    disabled={props?.disabled !== undefined ? props?.disabled : false}
                                >
                                    <img src={Images.Datepicker} alt="Date Picker" />
                                </IconButton>
                            </InputAdornment>
                        }
                    />
                </FormControl>
            </Box>

            {/* {isOpen && */}
            <Popper
                id={popperId}
                open={openPopper}
                anchorEl={anchorEl}
                //  onClose={handleClose}
                className='customDateRangepicker'
                placement='auto'
                style={{ zIndex: 9 }}
                modifiers={[
                    {
                        name: "offset",
                        options: {
                            enabled: true,
                            offset: [0, 10],
                        },
                    },
                ]}
            >
                <ClickAwayListener onClickAway={(e: any) => hidePopover()}>
                    <Box className='customDRpicker' sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>

                        <Calendar
                            value={values}
                            onChange={(date: any) => { handleValue(date) }}
                            disabled={props.disabled ? props.disabled : false}
                            minDate={props.minDate ? props.minDate : ''}
                            maxDate={props.maxDate ? props.maxDate : ''}
                        // format='DD/MM/YYYY'
                        />
                    </Box>
                </ClickAwayListener>
            </Popper>
            {/* } */}

        </StyledEngineProvider>
    );
}
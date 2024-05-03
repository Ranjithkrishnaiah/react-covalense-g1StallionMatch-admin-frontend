import { format } from 'date-fns';
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
} from '@mui/material';
import {
  MobileDateRangePicker,
  DateRangePickerDay as MuiDateRangePickerDay,
  DateRangePickerDayProps,
} from '@mui/lab';
import {
  dateConvert,
  getLastFourWeek,
  getLastWeek,
  useDatePicker,
} from '../../utils/customFunctions';
import { Images } from 'src/assets/images';
import './Daterangepicker.css';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Iconify from '../Iconify';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

import { styled } from '@mui/material/styles';
import useAuth from 'src/hooks/useAuth';
import { useEffect, useState } from 'react';

type DisplayTimeProps = {
  startTime: number | string;
  endTime: number | string;
  onOpenPicker: VoidFunction;
  sx?: SxProps;
  dateSortSelected: string;
};

// const DateRangePickerDay = styled(MuiDateRangePickerDay)(
//   ({ theme, isHighlighting, isStartOfHighlighting, isEndOfHighlighting }) => ({
//     ...(isHighlighting && {
//       borderRadius: 0,
//       backgroundColor: "white",
//       color: "black",
//       '&:hover, &:focus': {
//         backgroundColor: "gray",
//       },
//     }),
//     ...(isStartOfHighlighting && {
//       borderTopLeftRadius: '50%',
//       borderBottomLeftRadius: '50%',
//     }),
//     ...(isEndOfHighlighting && {
//       borderTopRightRadius: '50%',
//       borderBottomRightRadius: '50%',
//     }),
//   }),
// ) as React.ComponentType<DateRangePickerDayProps<number | Date>>;

export default function CustomDateRangePicker(props: any) {
  const { dueDate, startTime, endTime, onChangeDueDate, openPicker, onOpenPicker, onClosePicker } =
    useDatePicker({
      date: [null, null],
    });
  // const renderWeekPickerDay = (
  //   date: number,
  //   dateRangePickerDayProps: DateRangePickerDayProps<any>,
  // ) => {
  //   return <DateRangePickerDay {...dateRangePickerDayProps} />;
  // };
  const { handleDueDate } = props;
  const [dateRangeValue, setDateRangeValue] = useState(dueDate)
  // console.log(dateRangeValue,dueDate,'dateRangeValue')

  const today = new Date();
  const lastWeek = getLastWeek();
  const lastFourWeek = getLastFourWeek();
  const [maxDate, setMaxDate] = useState(props?.maxDate);

  const maxDateTemp = dateConvert(maxDate);

  // const getTodayHandler = () => {
  //   onChangeDueDate([today, today]);
  // };

  // const getMonthHandler = () => {
  //   onChangeDueDate([lastFourWeek, today]);
  // };

  // const getWeekHandler = () => {
  //   onChangeDueDate([lastWeek, today]);
  // };

  useEffect(() => {
    if (props?.isTrends) {
      onChangeDueDate([lastWeek, today]);
      handleDueDate([lastWeek, today]);
    }

    if (props?.roster) {
      onChangeDueDate(props.dueDate);
      handleDueDate(props.dueDate);
      setDateRangeValue(props.dueDate);
      props.setDueDate(props.dueDate);
      // onChangeDueDate([lastFourWeek, today]);
      // handleDueDate([lastFourWeek, today]);
    }
  }, [props.dueDate]);
  

  // useEffect(() => {
  //   if (props?.roster) {
  //     let executeFunction: any = null;
  //     switch (props.dateSortSelected) {
  //       case 'Today':
  //         executeFunction = getTodayHandler;
  //         executeFunction();
  //         break;

  //       case 'This month':
  //         executeFunction = getMonthHandler;
  //         executeFunction();
  //         break;

  //       case 'This week':
  //         executeFunction = getWeekHandler;
  //         executeFunction();
  //         break;

  //       default:
  //         return executeFunction;
  //     }
  //   }
  // }, [props.dateSortSelected]);

  const handleDueDateChange = (value: any) => {
    // console.log(value, 'VV')
    handleDueDate(value);
    onChangeDueDate(value);
    setDateRangeValue(value)
  };

  const disableIfbothdateSame = (date: any) => {
    if (props?.roster) {
      if (dateRangeValue.length) {
        // console.log(String(dateRangeValue[0]),String(date), 'DDD')
        if (String(dateRangeValue[0]) === String(date)) {
          return true;
        } else {
          return false;
        }
      }
      return false;
    }
    return false;
  }

  const { authentication, setLogout } = useAuth();

  return (
    <StyledEngineProvider injectFirst>
      <Box className="customDate">
        {startTime && endTime ? (
          <DisplayTime
            startTime={startTime}
            endTime={endTime}
            onOpenPicker={onOpenPicker}
            dateSortSelected={props.dateSortSelected}
          />
        ) : (
          <FormControl className="datepicker" variant="filled">
            <OutlinedInput
              onClick={
                !authentication ? () => { } : onOpenPicker
              }
              disabled={!authentication}
              id="outlined-adornment-password"
              placeholder={(props.placeholderText === 'undefined') ? 'Enter date range' : props.placeholderText}
              className="DP-input"
              endAdornment={
                <InputAdornment position="end" sx={{ paddingLeft: '0px' }}>
                  <IconButton
                    aria-label="toggle password visibility"
                    edge="end"
                    sx={{ marginRight: '3px', padding: '0px' }}
                  >
                    {!authentication ? (
                      <img src={Images.Datepickerdisable} alt="Date Picker" />
                    ) : (
                      <img src={Images.Datepicker} alt="Date Picker" />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          // <Tooltip title="Select Date Range">
          //   <IconButton size="small" onClick={onOpenPicker}>
          //     <Iconify icon={'eva:calendar-fill'} width={20} height={20} />
          //   </IconButton>
          // </Tooltip>
        )}
        <MobileDateRangePicker
        DialogProps={{
          sx: {
            "& .MuiDialog-paper": { width: "382px",borderRadius: '8px !important',
            boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)', minHeight: '431px' },
            
            "&  .MuiDialogActions-root": { padding: '0 !important' },

            "& .PrivatePickersSlideTransition-root": {minHeight: '274px'},

            "& .mobiledatepicker .css-1dozdou": { minHeight: '50px',maxHeight: '50px', padding: '0px 24px', marginTop: '36px',position: 'relative', marginBottom: '14px'},
          }
        }}

        components={{
          LeftArrowIcon: ArrowBackIosNewRoundedIcon,
          RightArrowIcon: ArrowForwardIosRoundedIcon,
        }}
          className="mobiledatepicker"
          disablePast={props?.disabledPast && props?.disabledPast}
          maxDate={props.disableFuture ? null : today}
          // maxDate={props?.roster ? new Date() : new Date(maxDateTemp)}
          disabled={!authentication || props.disabled ? props.disabled : false}
          open={openPicker}
          onClose={onClosePicker}
          onOpen={onOpenPicker}
          value={dateRangeValue}
          defaultValue={dueDate}
          //onChange={onChangeDueDate}
          onChange={handleDueDateChange}
          showToolbar={false}
          disableCloseOnSelect={false}
          okText=""
          cancelText=""
          shouldDisableDate={disableIfbothdateSame}
          // @ts-ignore
          renderInput={() => { }}
        />
      </Box>
    </StyledEngineProvider>
  );
}

export function DisplayTime({
  startTime,
  endTime,
  onOpenPicker,
  sx,
  dateSortSelected,
}: DisplayTimeProps) {
  const style = {
    typography: 'caption',
    cursor: 'pointer',
    '&:hover': { opacity: 0.72 },
  };

  return (
    <StyledEngineProvider injectFirst>
      <Box sx={{ ...style, ...sx }}>
        <FormControl className="datepicker" variant="standard">
          <OutlinedInput
            onClick={onOpenPicker}
            // disabled={dateSortSelected !== 'Custom'}
            id="outlined-adornment-password"
            placeholder="Enter date range"
            value={`${format(new Date(startTime), 'dd MMM')} - ${format(
              new Date(endTime),
              'dd MMM'
            )}`}
            className="DP-input"
            endAdornment={
              <InputAdornment position="end" sx={{ paddingLeft: '0px' }}>
                <IconButton
                  aria-label="toggle password visibility"
                  edge="end"
                  sx={{ marginRight: '3px', padding: '0px' }}
                >
                  <img src={Images.Datepicker} alt="Date Picker" />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>

        {/* {format(new Date(startTime), 'dd MMM')} - {format(new Date(endTime), 'dd MMM')} */}
      </Box>
    </StyledEngineProvider>
  );
}

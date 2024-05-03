import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { StyledEngineProvider, Typography, Stack } from '@mui/material';
// form
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Autocomplete from '@mui/material/Autocomplete';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionSplit';
import Scrollbar from '../../../../components/Scrollbar';
import 'src/sections/@dashboard/css/filter.css';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch, { SwitchProps } from '@mui/material/Switch';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Slider from '@mui/material/Slider';
import { MenuProps } from 'src/constants/MenuProps';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import format from 'date-fns/format';
import { debounce } from 'lodash';
import { dateHypenConvert, toPascalCase } from 'src/utils/customFunctions';
import CustomAutocomplete from 'src/components/CustomAutocomplete';
import { useDamAutocompleteSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { useFarmAutocompleteQuery } from 'src/redux/splitEndpoints/farmAutocompleteSplit';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router';
import CustomFilterRangePicker from 'src/components/customDateRangePicker/CustomFilterRangePicker';
// ----------------------------------------------------------------------
// Html Tooltip
const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

const drawerWidth = 290;

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme: any) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

// Drawer Header handler
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

// IOSSwitch SwitchProps
const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 46,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2.5,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(22px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

// Drawer handler
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }: any) => {
    return {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
      ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
      }),
      ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
      }),
    };
  }
);

export default function MessagesFilterSidebar(props: any) {
  const {
    handleFilter,
    handleFilterApplied,
    setIsSearchClicked,
    isFilterApplied,
    rowCount,
    page,
    limit,
    state,
    setStateValue,
    convertedSentDateRangeValue,
    setConvertedSentDateRangeValue,
    convertedSentDateDateValue,
    setConvertedSentDateDateValue,
  } = props;
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  // sidebar filter open
  React.useEffect(() => {
    props.handleOpenFilterParam(open);
  }, [open]);

  const [isDisplayBox, setIsDisplayBox] = React.useState(false);
  // drawer handler
  const handleDrawerOpen = () => {
    setOpen(true);
    setIsDisplayBox(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  // handleChangeField for field onChange
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });

    setIsOpenSelectBox({
      fromToName: false,
      fromEmail: false,
      toEmail: false,
      stallionId: false,
      farmId: false,
      mareName: false,
      sentDateValue: false,
      messageStatus: false,
      nominationStatus: false,
      originStatus: false,
      isFlagged: false,
      isFlaggedClicked: false,
    });
  };

  // handleIsFlaggedCheck for switch onChange
  const handleIsFlaggedCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStateValue({
      ...state,
      isFlagged: event.target.checked ? true : false,
      isFlaggedClicked: true,
    });
  };

  // filter applied handler
  const checkFilterApplied = () => {
    if (
      state?.fromToName !== '' ||
      state?.fromEmail !== '' ||
      state?.toEmail !== '' ||
      state?.stallionId !== '' ||
      state?.farmId !== '' ||
      state?.mareName !== '' ||
      state?.sentDateValue !== null ||
      state?.messageStatus !== 'none' ||
      state?.nominationStatus !== 'none' ||
      state?.originStatus !== 'none' ||
      state?.isFlaggedClicked ||
      state?.nominationRange.join('-') !== '0-100' ||
      dateHypenConvert(convertedSentDateDateValue[1]) !== undefined
    ) {
      return false;
    } else {
      return true;
    }
  };

  const [isOpenSelectBox, setIsOpenSelectBox] = React.useState({
    fromToName: false,
    fromEmail: false,
    toEmail: false,
    stallionId: false,
    farmId: false,
    mareName: false,
    sentDateValue: false,
    messageStatus: false,
    nominationStatus: false,
    originStatus: false,
    isFlagged: false,
    isFlaggedClicked: false,
  });

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFilterData();
      setIsOpenSelectBox({
        fromToName: false,
        fromEmail: false,
        toEmail: false,
        stallionId: false,
        farmId: false,
        mareName: false,
        sentDateValue: false,
        messageStatus: false,
        nominationStatus: false,
        originStatus: false,
        isFlagged: false,
        isFlaggedClicked: false,
      });
    }
  };

  // filter data handler
  const handleFilterData = () => {
    const data = {
      ...{ page: page },
      ...{ limit: limit },
      ...{ order: props.order },
      ...{ sortBy: props.orderBy },
      ...(state?.fromToName !== '' && { fromOrToName: state?.fromToName }),
      ...(state?.fromEmail !== '' && { fromEmail: state?.fromEmail }),
      ...(state?.toEmail !== '' && { toEmail: state?.toEmail }),
      ...(state?.stallionId !== '' && { stallionId: state?.stallionId }),
      ...(state?.farmId !== '' && { farmId: state?.farmId }),
      ...(state?.mareName !== '' && { mareName: state?.mareName }),
      ...(state?.sentDateValue !== null && {
        sentDate: format(new Date(state?.sentDateValue), 'yyyy-MM-dd'),
      }),
      ...(dateHypenConvert(convertedSentDateDateValue[1]) !== undefined && {
        sentDate:
          dateHypenConvert(convertedSentDateDateValue[0]) +
          '/' +
          dateHypenConvert(convertedSentDateDateValue[1]),
      }),
      ...(state?.messageStatus !== 'none' && { messageStatus: state?.messageStatus }),
      ...(state?.nominationStatus !== 'none' && { nominationStatus: state?.nominationStatus }),
      ...(state?.originStatus !== 'none' && { origin: state?.originStatus }),
      ...(state?.isFlaggedClicked && { isFlagged: state?.isFlagged }),
      ...(state?.nominationRange.join('-') !== '0-100' && {
        nominationRange: state?.nominationRange.join('-'),
      }),
    };
    handleFilter(data);
    handleFilterApplied();
    setIsSearchClicked(true);
    handleDrawerClose();
  };

  // clear all data handler
  const handleClearAll = () => {
    setStateValue({
      fromToName: '',
      fromEmail: '',
      toEmail: '',
      stallionId: '',
      farmId: '',
      mareName: '',
      sentDateValue: null,
      messageStatus: 'none',
      nominationStatus: 'none',
      originStatus: 'none',
      isFlagged: false,
      isFlaggedClicked: false,
      nominationRange: [0, 100],
      page: page,
      limit: limit,
      order: props.order,
      sortBy: props.orderBy,
    });
    setHorseNameSearch({ horseName: '' });
    setFarmNameSearch({ farmName: '' });
    setDamNameSearch({ horseName: '' });
    setConvertedSentDateRangeValue('');
    setConvertedSentDateDateValue([null, null]);
    props.handleRemoveFilterApplied();
    props.setPage(1);
    navigate(PATH_DASHBOARD.messages.data);
  };

  React.useEffect(() => {
    if (!isFilterApplied) {
      setHorseNameSearch({ horseName: '' });
      setFarmNameSearch({ farmName: '' });
    }
  }, [isFilterApplied]);

  // slider functions hanlder
  const minDistance = 5;
  function valuetext1(value: number) {
    return `${value}°C`;
  }
  const handleChange3 = (event: Event, newValue: number | number[], activeThumb: number) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (newValue[1] - newValue[0] < minDistance) {
      if (activeThumb === 0) {
        const clamped = Math.min(newValue[0], 100 - minDistance);
        setStateValue({
          ...state,
          nominationRange: [clamped, clamped + minDistance],
        });
      } else {
        const clamped = Math.max(newValue[1], minDistance);
        setStateValue({
          ...state,
          nominationRange: [clamped - minDistance, clamped],
        });
      }
    } else {
      setStateValue({
        ...state,
        nominationRange: newValue as number[],
      });
    }
  };

  // stallionName customAutoComplete starts
  const [horseFilterData, setHorseFilterData] = React.useState('');
  const [horseNameSearch, setHorseNameSearch] = React.useState({ horseName: '' });
  const [isHorse, setIsHorse] = React.useState(false);
  // API call to get stallions data
  const { data: dataHorse } = useStallionAutocompleteQuery(horseFilterData, {
    skip: !isHorse,
  });
  const stallionFilterOptions = isHorse ? dataHorse?.data : [];

  const debouncedHorseName = React.useRef(
    debounce(async (horseName) => {
      if (horseName.length >= 3) {
        setHorseFilterData(horseName);
        setIsHorse(true);
      } else {
        setIsHorse(false);
      }
    }, 1000)
  ).current;

  const handleStallionInput = (e: any) => {
    if (e && e.target.value) {
      setHorseNameSearch({
        ...horseNameSearch,
        horseName: e.target.value,
      });
      debouncedHorseName(e.target.value);
    }
  };

  const handleHorseSelect = (selectedOptions: any) => {
    setHorseNameSearch(selectedOptions);
    setStateValue({
      ...state,
      stallionId: selectedOptions ? selectedOptions?.stallionId : '',
    });
  };

  const handleHorseOptionsReset = () => {
    setIsHorse(false);
  };

  React.useEffect(() => {
    if (state?.stallionId === '') {
      setHorseNameSearch({ horseName: '' });
    }
  }, [state?.stallionId]);
  // stallionName customAutoComplete ends

  // farmName customAutoComplete starts
  const [farmFilterData, setFarmFilterData] = React.useState({
    farmName: '',
    isFarmNameExactSearch: false,
  });
  const [farmNameSearch, setFarmNameSearch] = React.useState({ farmName: '' });
  const [isFarm, setIsFarm] = React.useState(false);
  // API call to get farms data
  const { data: dataFarm } = useFarmAutocompleteQuery(farmFilterData, {
    skip: !isFarm,
  });

  const farmFilterOptions = isFarm ? dataFarm : [];

  const debouncedFarmName = React.useRef(
    debounce(async (farmName) => {
      if (farmName.length >= 3) {
        setFarmFilterData({ farmName: farmName, isFarmNameExactSearch: false });
        setIsFarm(true);
      } else {
        setIsFarm(false);
      }
    }, 1000)
  ).current;

  const handleFarmInput = (e: any) => {
    if (e && e.target.value) {
      setFarmNameSearch({
        ...farmNameSearch,
        farmName: e.target.value,
      });
      debouncedFarmName(e.target.value);
    }
  };

  const handleFarmSelect = (selectedOptions: any) => {
    setFarmNameSearch(selectedOptions);
    setStateValue({
      ...state,
      farmId: selectedOptions ? selectedOptions.farmId : '',
    });
  };

  const handleFarmOptionsReset = () => {
    setIsFarm(false);
  };

  React.useEffect(() => {
    if (state?.farmId === '') {
      setFarmNameSearch({ farmName: '' });
    }
  }, [state?.farmId]);
  // farmName customAutoComplete ends

  // mareName customAutoComplete starts
  const [damFilterData, setDamFilterData] = React.useState({
    damName: '',
  });
  const [damNameSearch, setDamNameSearch] = React.useState({ horseName: '' });
  const [isDam, setIsDam] = React.useState(false);
  const [damName, setDamName] = React.useState<any>('');
  // API call to get mares data
  const { data: dataDam, isFetching } = useDamAutocompleteSearchQuery(damFilterData, {
    skip: !isDam,
  });
  const damFilterOptions = isDam ? dataDam : [];

  const debouncedMareName = React.useRef(
    debounce(async (damName) => {
      if (damName.length >= 3) {
        setDamFilterData({
          damName: damName,
        });
        setIsDam(true);
      } else {
        setIsDam(false);
      }
    }, 1000)
  ).current;

  const handleDamInput = (e: any) => {
    if (e && e.target.value) {
      setDamNameSearch({
        ...damNameSearch,
        horseName: e.target.value,
      });
      setDamName(e.target.value);
      setStateValue({
        ...state,
        mareName: e.target.value,
      });
      debouncedMareName(e.target.value);
    }
  };

  const handleDamSelect = (selectedOptions: any) => {
    setDamNameSearch(selectedOptions);
    setStateValue({
      ...state,
      mareName: selectedOptions ? selectedOptions.horseId : '',
    });
  };

  const handleMareOptionsReset = () => {
    setDamName('');
    setIsDam(false);
  };

  React.useEffect(() => {
    if (state?.mareName === '') {
      setDamNameSearch({ horseName: '' });
    }
  }, [state?.mareName]);
  // mareName customAutoComplete ends

  return (
    <StyledEngineProvider injectFirst>
      {/* drawer section */}
      <Drawer
        variant="permanent"
        open={open}
        className="filter-section DrawerLeftModal messages-leftbar"
      >
        <Scrollbar
          className="filter-scrollbar"
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >
          {/* clear all button */}
          <DrawerHeader className="filter-drawer-head">
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">{rowCount} Results</Typography>
              <Button className="clearBtn" onClick={handleClearAll}>
                Clear all
              </Button>
            </Box>

            <IconButton
              className="handleMenuOpen"
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                position: 'relative',
                fontSize: '18px',
                background: '#e2e7e1 !important',
                left: '65px',
                zIndex: '9999',
                ...(open && { display: 'none' }),
              }}
            >
              <i className="icon-filter-open" />
            </IconButton>
            <IconButton className="handleMenuBack" onClick={handleDrawerClose}>
              <i className="icon-menu-back" />
            </IconButton>
          </DrawerHeader>

          {/* filter components  */}
          {open && (
            <Box>
              <Box
                className="edit-section"
                pt={4}
                sx={{
                  ...(!isDisplayBox && { display: 'none' }),
                }}
              >
                <Box className="FormGroup">
                  {/* from /To Name */}
                  <TextField
                    name="fromToName"
                    value={state?.fromToName}
                    placeholder="From/To Name"
                    onChange={(e: any) => handleChangeField('fromToName', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                    className="edit-field clientName"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <i className="icon-Search"></i>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {/* from Email */}
                  <TextField
                    name="fromEmail"
                    value={state?.fromEmail}
                    placeholder="From Email"
                    onChange={(e: any) => handleChangeField('fromEmail', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                    className="edit-field clientName"
                  />

                  {/* toEmail */}
                  <TextField
                    name="toEmail"
                    value={state?.toEmail}
                    placeholder="To Email"
                    onChange={(e: any) => handleChangeField('toEmail', e.target.value)}
                    onKeyDown={handleSelectKeyDown}
                    className="edit-field clientName"
                  />

                  <Box className="edit-field " onKeyDown={handleSelectKeyDown}>
                    {/* Stallion Name */}
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={stallionFilterOptions || []}
                      renderOption={(props, option: any) => (
                        <li
                          className="searchstallionListBox"
                          {...props}
                          key={`${option?.horseId}${option?.horseName}`}
                        >
                          <Stack className="stallionListBoxHead">
                            {toPascalCase(option.horseName)} - {option.farmName}
                          </Stack>
                          <Stack className="stallionListBoxpara">
                            <strong>X</strong>
                            <p>
                              {toPascalCase(option.sireName)} (<span>{option.sireCountryCode}</span>){' '}
                              {option.sireYob} - {toPascalCase(option.damName)} (
                              <span>{option.damCountryCode}</span>) {option.damYob}
                            </p>
                          </Stack>
                        </li>
                      )}
                      onInputChange={handleStallionInput}
                      getOptionLabel={(option: any) =>
                        `${toPascalCase(option?.horseName)?.toString()}`
                      }
                      value={horseNameSearch ? horseNameSearch : null}
                      renderInput={(params) => (
                        <TextField {...params} placeholder={`Stallion Name`} />
                      )}
                      onChange={(e: any, selectedOptions: any) =>
                        handleHorseSelect(selectedOptions)
                      }
                      onBlur={() => handleHorseOptionsReset()}
                      className="mareBlockInput"
                    />
                  </Box>

                  <Box className="edit-field " onKeyDown={handleSelectKeyDown}>
                    {/* Farm Name */}
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={farmFilterOptions || []}
                      renderOption={(props, option: any) => (
                        <li
                          className="searchstallionListBox"
                          {...props}
                          key={`${option?.farmId}${option?.farmName}`}
                        >
                          <Stack className="stallionListBoxHead">
                            {toPascalCase(option.farmName)}
                          </Stack>
                        </li>
                      )}
                      onInputChange={handleFarmInput}
                      getOptionLabel={(option: any) =>
                        `${toPascalCase(option?.farmName)?.toString()}`
                      }
                      value={farmNameSearch ? farmNameSearch : null}
                      renderInput={(params) => <TextField {...params} placeholder={`Farm Name`} />}
                      onChange={(e: any, selectedOptions: any) => handleFarmSelect(selectedOptions)}
                      onBlur={() => handleFarmOptionsReset()}
                      className="mareBlockInput"
                    />
                  </Box>

                  <Box className="calender-wrapper" onKeyDown={handleSelectKeyDown}>
                    {/* Custom Range Picker */}
                    <Box className="edit-field">
                      <CustomFilterRangePicker
                        placeholderText="Sent Date"
                        convertedDateRangeValue={convertedSentDateRangeValue}
                        setConvertedDateRangeValue={setConvertedSentDateRangeValue}
                        convertedDateValue={convertedSentDateDateValue}
                        setConvertedYobDateValue={setConvertedSentDateDateValue}
                        handleSelectKeyDown={handleSelectKeyDown}
                      />
                    </Box>
                  </Box>
                  <Box className="edit-field mareDropdown" onKeyDown={handleSelectKeyDown}>
                    {/* Mare Name */}
                    <Autocomplete
                      disablePortal
                      popupIcon={<KeyboardArrowDownRoundedIcon />}
                      options={damFilterOptions || []}
                      renderOption={(props, option: any) => (
                        // <li
                        //   className="searchstallionListBox"
                        //   {...props}
                        //   key={`${option?.horseId}${option?.horseName}`}
                        // >
                        //   <Stack className="stallionListBoxHead">
                        //     {toPascalCase(option.horseName)}
                        //   </Stack>
                        // </li>

                        <li className="searchstallionListBox" style={{ color: '#000 !important' }} {...props}>
                          <Stack className="stallionListBoxHead">
                            {toPascalCase(option.horseName)} ({option.yob},{' '}
                            <span>{option.countryCode}</span>){' '}
                          </Stack>
                          <Stack className="stallionListBoxpara">
                            <strong>X</strong>
                            <p>
                              {toPascalCase(option.sireName)} ({option.sireYob},{' '}
                              <span>{option.sirecountry}</span>),{' '} {toPascalCase(option.damName)} (
                              {option.damYob}, <span>{option.damcountry}</span>)
                            </p>
                          </Stack>
                        </li>
                      )}
                      onInputChange={handleDamInput}
                      getOptionLabel={(option: any) =>
                        `${toPascalCase(option?.horseName)?.toString()}`
                      }
                      value={damNameSearch ? damNameSearch : null}
                      renderInput={(params) => <TextField {...params} placeholder={`Mare Name`} />}
                      onChange={(e: any, selectedOptions: any) => handleDamSelect(selectedOptions)}
                      onBlur={() => handleMareOptionsReset()}
                      className="mareBlockInput"
                    />
                  </Box>

                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    {/* Message Status */}
                    <Select

                      MenuProps={{
                        className: 'common-scroll-lock',
                        disableScrollLock: true,
                        ...MenuProps,
                        onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, messageStatus: false }),
                      }}
                      open={isOpenSelectBox.messageStatus}
                      onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, messageStatus: true })}
                      onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, messageStatus: false })}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      onChange={(e: any) => handleChangeField('messageStatus', e.target.value)}
                      className="filter-slct"
                      value={state?.messageStatus ? state?.messageStatus : 'none'}
                      name="messageStatus"
                    >
                      <MenuItem className="selectDropDownList disabled" value="none" disabled>
                        <em>Message Status</em>
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Read">
                        Read
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Unread">
                        Unread
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Pending">
                        Pending (For Nominations)
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Deleted">
                        Deleted
                      </MenuItem>
                    </Select>
                  </Box>

                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    {/* Nomination Status */}
                    <Select
                      MenuProps={{
                        className: 'common-scroll-lock',
                        disableScrollLock: true,
                        ...MenuProps,
                        onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, nominationStatus: false }),
                      }}
                      open={isOpenSelectBox.nominationStatus}
                      onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, nominationStatus: true })}
                      onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, nominationStatus: false })}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      onChange={(e: any) => handleChangeField('nominationStatus', e.target.value)}
                      className="filter-slct"
                      value={state?.nominationStatus ? state?.nominationStatus : 'none'}
                      name="nominationStatus"
                    >
                      <MenuItem className="selectDropDownList disabled" value="none" disabled>
                        <em>Nomination Status</em>
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Rejected">
                        Rejected
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Accepted">
                        Accepted
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Pending">
                        Pending
                      </MenuItem>
                      <MenuItem className="selectDropDownList" value="Countered">
                        Countered
                      </MenuItem>
                    </Select>
                  </Box>

                  <Box className="edit-field" onKeyDown={handleSelectKeyDown}>
                    {/* originStatus */}
                    <Select
                      MenuProps={{
                        className: 'common-scroll-lock',
                        disableScrollLock: true,
                        ...MenuProps,
                        onClose: () => setIsOpenSelectBox({ ...isOpenSelectBox, originStatus: false }),
                      }}
                      open={isOpenSelectBox.originStatus}
                      onOpen={() => setIsOpenSelectBox({ ...isOpenSelectBox, originStatus: true })}
                      onClose={() => setIsOpenSelectBox({ ...isOpenSelectBox, originStatus: false })}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      onChange={(e: any) => handleChangeField('originStatus', e.target.value)}
                      className="countryDropdown filter-slct"
                      value={state?.originStatus ? state?.originStatus : 'none'}
                      name="originStatus"
                    >
                      <MenuItem
                        className="selectDropDownList countryDropdownList disabled"
                        value="none"
                        disabled
                      >
                        <em>Origin</em>
                      </MenuItem>
                      <MenuItem
                        className="selectDropDownList countryDropdownList"
                        value="Farm Page"
                      >
                        Farm Page
                      </MenuItem>
                      <MenuItem
                        className="selectDropDownList countryDropdownList"
                        value="Stallion Page"
                      >
                        Stallion Page
                      </MenuItem>
                      <MenuItem
                        className="selectDropDownList countryDropdownList"
                        value="Local Boost"
                      >
                        Local Boost
                      </MenuItem>
                      <MenuItem
                        className="selectDropDownList countryDropdownList"
                        value="Extended Boost"
                      >
                        Extended Boost
                      </MenuItem>
                      <MenuItem
                        className="selectDropDownList countryDropdownList"
                        value="Direct Message"
                      >
                        Direct Message
                      </MenuItem>
                    </Select>
                  </Box>

                  <Box className="FormGroup" mt={1} >
                    {/* Flagged Message */}
                    <Box className="RHF-Switches flagged-message-wrp" onKeyDown={handleSelectKeyDown}>
                      <FormControlLabel
                        control={<IOSSwitch defaultChecked />}
                        label="Flagged Message"
                        name="FlaggedMessage"
                        labelPlacement="start"
                        checked={state?.isFlagged}
                        onChange={(event: any) => handleIsFlaggedCheck(event)}
                      />
                      <HtmlTooltip
                        placement="bottom-start"
                        className="tableTooltip breachof-tooltip"
                        title={
                          <React.Fragment>
                            <Box className="tooltipPopoverBody breachof-tos">
                              <p>Breach of TOS:</p>
                              <ul>
                                <li>• includes personal details including email & phone number.</li>
                                <li>• includes expletives.</li>
                              </ul>
                            </Box>
                          </React.Fragment>
                        }
                      >
                        <i className="icon-Info-circle tooltip-table breach-icon" />
                      </HtmlTooltip>
                    </Box>
                  </Box>

                  {/* Nomination Range */}
                  <Box className="edit-field rangeSliderFilter" onKeyDown={handleSelectKeyDown}>
                    <Box className="feerange">
                      <label>
                        Nomination Range ({state?.nominationRange[0].toLocaleString()} -{' '}
                        {state?.nominationRange[1].toLocaleString()}){' '}
                      </label>
                    </Box>

                    <Slider
                      getAriaLabel={() => 'Minimum distance shift'}
                      value={state?.nominationRange}
                      onChange={handleChange3}
                      valueLabelDisplay="auto"
                      getAriaValueText={valuetext1}
                      disableSwap
                    />
                  </Box>
                </Box>

                {/* search button */}
                <Stack sx={{ mt: 2 }} className="DrawerBtnWrapper">
                  <Button
                    disabled={checkFilterApplied()}
                    onClick={handleFilterData}
                    className="search-btn"
                    fullWidth
                  >
                    Search
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
}

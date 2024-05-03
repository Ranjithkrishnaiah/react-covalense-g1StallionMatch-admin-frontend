import IconButton from '@mui/material/IconButton';
import 'src/sections/@dashboard/css/list.css';
import Scrollbar from 'src/components/Scrollbar';
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import { useEffect, useMemo, useState } from 'react';
import { 
    Box, 
    Grid, 
    Stack, 
    Switch, 
    Typography, 
    FormControlLabel, 
    TextField, 
    StyledEngineProvider,
    CssBaseline,
    SxProps,
    RadioGroup,
    Radio,
    Select,
    MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { HorseForm } from 'src/@types/horse';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
// redux
import { useDispatch } from 'react-redux';
import { useHorseQuery, useHorseDetailsByIdQuery, useAddHorseMutation, useEditHorseMutation } from 'src/redux/splitEndpoints/horseSplit';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useColoursQuery } from 'src/redux/splitEndpoints/coloursSplit';
import { useHorseTypesQuery } from 'src/redux/splitEndpoints/horseTypesSplit';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Images } from 'src/assets/images';
import "src/sections/@dashboard/css/filter.css";
import './HorseGen.css';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { SwitchProps } from '@mui/material/Switch';
import { dateConvertHypen } from 'src/utils/customFunctions';
import { toPascalCase } from 'src/utils/customFunctions';
import { formatInTimeZone } from 'date-fns-tz';
import CustomDatePicker from 'src/components/customDatePicker/CustomDatePicker';
import { CircularSpinner } from "src/components/CircularSpinner";

/////////////////////////////////

// Set modal sidebar width
const drawerWidth = 290;
type FormValuesProps = HorseForm;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

// Set Switch style
const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 46,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: '0px 1px 0px',
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#1D472E',
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
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
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
    backgroundColor: theme.palette.mode === 'light' ? '#B0B6AF' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

const ITEM_HEIGHT = 35;
const ITEM_PADDING_TOP = 8;
const MenuPropss : any =  {
      PaperProps: {
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            marginTop:'-1px',
            boxShadow: 'none',
            border: 'solid 1px #161716',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            boxSizing: 'border-box',
          },
        },  
  };

export default function PedigreeEditModal(props: any) {
  const theme = useTheme();
  const {
    open,
    rowId,
    isEdit,
    handleClose,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    genId,
    progenyId,
    selectedIndex,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, getHorseDetails,
  } = props;
  
  // const { data, error, isFetching, isLoading, isSuccess } = useHorseQuery(rowId);
  const { data, error, isFetching, isLoading, isSuccess } = useHorseDetailsByIdQuery(rowId);
  const currentPedigreeHorse = data;

  // Post horse api call
  const [addHorse] = useAddHorseMutation();

  // Patch horse api call
  const [editHorse] = useEditHorseMutation();

  // Get all country list
  const { data: countriesList } = useCountriesQuery();

  // Get all colour list
  const { data: coloursList } = useColoursQuery();

  // Get all horse type list
  const { data: horseTypeList } = useHorseTypesQuery();

  // Get all currency list
  const { data: currencyList } = useCurrenciesQuery();
  const [sex, setSex] = React.useState<any>(null);  
  const [gelding, setGelding] = React.useState(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [countryId, setCountryId] = useState(
    currentPedigreeHorse?.countryId > 0 ? currentPedigreeHorse?.countryId : "none"
  );
  const [yob, setYob] = useState(
    currentPedigreeHorse?.yob > 0 ? currentPedigreeHorse?.yob : "none"
  );  
  const [colourId, setColourId] = useState(
    currentPedigreeHorse?.colourId > 0 ? currentPedigreeHorse?.colourId : "none"
  ); 
  const [horseTypeId, setHorseTypeId] = useState(
    currentPedigreeHorse?.horseTypeId > 0 ? currentPedigreeHorse?.horseTypeId : "none"
  );    
  const [currencyId, setCurrencyId] = useState(
    (currentPedigreeHorse?.currencyId) > 0 ? currentPedigreeHorse?.currencyId : "none"
  );

  const [dateValue, setDateValue] = React.useState('');
  
  const NewHorseSchema = Yup.object().shape({
    // horseName: Yup.string().required('Horse Name is required'),  
  }); 

  const [errors, setErrors] = React.useState<any>({});

  const [isValidDoB, setIsValidDoB] = useState(true);
  const [isValidPrizeMoney, setIsValidPrizeMoney] = useState(true);
  // Create a state variable to capture form element value in post or patch request
  const [state, setStateValue] = useState({
    id: "",
    horseName: '',
    yob:  "",
    dob:  "",
    countryId:  "",
    colourId:  "",
    sex:  "",
    gelding:  "",
    horseTypeId:  "",
    isLocked: false,
    currencyId:  "", 
    totalPrizeMoneyEarned:  "",
    isSexTouched: false,
  });

  const defaultValues = useMemo(
    () => ({
      horseName: (isEdit && currentPedigreeHorse?.horseName) ? toPascalCase(currentPedigreeHorse?.horseName)?.toString() : '',
      yob: (isEdit && currentPedigreeHorse?.yob) ? currentPedigreeHorse?.yob : 0,
      dob: (isEdit && currentPedigreeHorse?.dob) ? currentPedigreeHorse?.dob : '',
      countryId: (isEdit && currentPedigreeHorse?.countryId) ? currentPedigreeHorse?.countryId : 0,
      colourId: (isEdit && currentPedigreeHorse?.colourId) ? currentPedigreeHorse?.colourId : 0,
      sex: (isEdit && currentPedigreeHorse?.sex) ? currentPedigreeHorse?.sex : '',
      gelding: (isEdit && currentPedigreeHorse?.gelding) ? currentPedigreeHorse?.gelding : false,
      horseTypeId: (isEdit && currentPedigreeHorse?.horseTypeId) ? currentPedigreeHorse?.horseTypeId : 0,
      isLocked: (isEdit && currentPedigreeHorse?.isLocked) ? currentPedigreeHorse?.isLocked : false,
      currencyId: (isEdit && currentPedigreeHorse?.currencyId) ? currentPedigreeHorse?.currencyId : 0, 
      totalPrizeMoneyEarned: (isEdit && currentPedigreeHorse?.totalPrizeMoneyEarned) ? currentPedigreeHorse?.totalPrizeMoneyEarned : 0,     
      id: (isEdit && currentPedigreeHorse?.horseId) ? currentPedigreeHorse?.horseId : '',
    }),
    [currentPedigreeHorse]
  );  

  // form method
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewHorseSchema),
    defaultValues,
  });

  const {
    register,
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const values = watch();

  const handleDefaultValues = () => {
    setStateValue({
      ...state,
      id: defaultValues.id,
      horseName: defaultValues?.horseName|| '',      
      yob: defaultValues.yob,
      dob: defaultValues.dob,
      countryId: defaultValues.countryId,
      sex: defaultValues.sex,
      gelding: defaultValues.gelding,
      horseTypeId: defaultValues.horseTypeId,
      isLocked: defaultValues.isLocked,
      currencyId: defaultValues.currencyId,
      totalPrizeMoneyEarned: defaultValues.totalPrizeMoneyEarned
    })
  }

  useEffect(() => {
    handleDefaultGender();
  }, [selectedIndex])

  const handleDefaultGender = () => {
    if(selectedIndex){
      if(parseInt(selectedIndex) === 0){
        setSex("M")
        setStateValue({
          ...state,
          ['isSexTouched']: true,
        })
      }else {
        setSex("F")
        setStateValue({
          ...state,
          ['isSexTouched']: true,
        })
      }
    }
  }

  useEffect(() => {
    if (isEdit && currentPedigreeHorse) {
      handleDefaultValues()
      setCountryId(defaultValues.countryId);
      setYob(defaultValues.yob);
      setColourId(defaultValues.colourId);
      setSex(defaultValues.sex);
      setGelding(defaultValues.gelding);
      setHorseTypeId(defaultValues.horseTypeId);
      // setCurrencyId(defaultValues.currencyId);
      setCurrencyId(defaultValues?.currencyId > 0 ? defaultValues?.currencyId : "none")
      setIsLocked(defaultValues.isLocked);
      //setDateValue(defaultValues.dob);
      setIsGeldingDisable((defaultValues.sex === "F") ? true : false);
      setStateValue({
        ...state,
        totalPrizeMoneyEarned: defaultValues.totalPrizeMoneyEarned,
        yob: defaultValues.yob,
        dob: defaultValues.dob,
        ['isSexTouched']: true,
      })
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentPedigreeHorse]);

  // Remove form validation
  useEffect(() => {
    let temp = { ...errors }
    if (state.horseName) {
      delete temp.horseName;
    }
    if (state.countryId) {
      delete temp.countryId;
    }
    if (state.yob) {
      delete temp.yob;
    }
    if (state.colourId) {
      delete temp.colourId;
    }
    if (state.isSexTouched) {
      delete temp.sex;
    }
    if (state.horseTypeId) {
      delete temp.horseTypeId;
    }
    if (!isValidDoB) {
      delete temp.dob;
    }
    if (!isValidPrizeMoney) {
      delete temp.prizemoney;
    }
    if(state.gelding) {
      delete temp.gelding;
    }
    setErrors(temp);
  }, [state]);
  
  // Update state variable while form element value is typed or choosen
  const handleChangeField = (type: any, targetValue: any) => {    
    setStateValue({
      ...state,
      [type]: targetValue
    })
  }

  // Check full year from date of birth and validate with YoB
  let isValidYear = (value:any) => {
    const dobYear: any = value && new Date(value).getFullYear();
    let yearOfBirth: any = Number(yob || state.yob);

    if(yearOfBirth === dobYear) {
      return true;
    }else {
      return false;
    }
  }

  const [isValidYoB, setIsValidYoB] = useState(false);
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };
  
  // Form validation
  let validateForm = (data: any) => {
    /*eslint-disable */    
    let errors = {};
    let formIsValid = true;
    //@ts-ignore

    // Check if the value is empty or a 4-digit number and not a future year
    const isValid4DigitYear = /^\d{4}$/.test(data.yob) && parseInt(data.yob, 10) <= getCurrentYear();
    setIsValidYoB(isValid4DigitYear);

    if (data.horseName === '') {
      formIsValid = false;  //@ts-ignore
      errors["horseName"] = `Horse Name is required`;
    }
    if (data.countryId === 0) {
      formIsValid = false;  //@ts-ignore
      errors["countryId"] = `Country of Birth is required`;
    }
    if (data.yob === null)  {      
      formIsValid = false;  //@ts-ignore
      errors["yob"] = `Year of Birth is required`;
    } 
    if (data.yob !== null && isNaN(data?.yob)) {
      formIsValid = false;  //@ts-ignore
      errors["yob"] = `Year of Birth accept upto 4 digits number`;
    } 
    if (data.yob !== null && !isNaN(data?.yob) && data.yob > 0) {      
      if (!isValid4DigitYear) {
        formIsValid = false;  //@ts-ignore
        errors["yob"] = `Year of Birth must be less than current year`;
      }      
    }
    if (data.colourId === 0) {
      formIsValid = false;  //@ts-ignore
      errors["colourId"] = `Colour is required`;
    }
    if (!state.isSexTouched) {
      formIsValid = false;  //@ts-ignore
      errors["sex"] = `Gender is required`;
    }
    if (state.sex === 'M' && state.gelding === '') {
      formIsValid = false;  //@ts-ignore
      errors["gelding"] = `Gelding is required`;
    }
    if (data.horseTypeId === 0) {
      formIsValid = false;  //@ts-ignore
      errors["horseTypeId"] = `Horse Breed is required`;
    }
    if (isValid4DigitYear && (data.dob && data.yob !== 0) ) {
      if(!isValidYear(data.dob)) {
        formIsValid = false;  //@ts-ignore
        errors["dob"] = `Year of Birth must be same`;
        setIsValidDoB(false);
      }      
    } 
    if (isNaN(data?.totalPrizeMoneyEarned)) {
      formIsValid = false;  //@ts-ignore
      errors["prizemoney"] = `The prize money accept upto 16 digits number`;
      setIsValidPrizeMoney(false);
    }
    setErrors(errors);
    return formIsValid
  }

  // Reset state variable on close 
  const resetData = () => {
    setStateValue({
      id: "",
      horseName: '',
      yob:  "",
      dob:  "",
      countryId:  "",
      colourId:  "",
      sex:  "",
      gelding:  "",
      horseTypeId:  "",
      isLocked: false,
      currencyId:  "", 
      totalPrizeMoneyEarned:  "",
      isSexTouched: false,
    })
    setIsValidPrizeMoney(true);
    setIsValidDoB(true);
    reset()
    setErrors({})
    setExpanded(false)
  }
  
  const handleResetAndClose = () => {
    resetData();
    handleDrawerCloseRow();
  };
  
  // Patch api call based on save button clicked and display toaster message
  const onSubmit = async (data: FormValuesProps) => {  
    if(data?.currencyId === 0) {
      delete data?.currencyId;
    }
    if(data?.yob === '' || data?.yob === 0) {
      delete data?.yob;
    }
    if(!dateValue) {
      delete data?.dob;
    }    
    const finalData = { ...data, yob: (!data?.yob) ? null : Number(yob), sex: sex, gelding: (gelding === 'true') ? true : false, dob: (!dateValue) ? null : dateValue, generation:parseInt(genId), progenyId: progenyId, totalPrizeMoneyEarned: (Number(data.totalPrizeMoneyEarned) === 0) ? null : Number(data.totalPrizeMoneyEarned), currencyId: (!state?.currencyId) ? null : Number(state?.currencyId) }
    if (!validateForm(finalData)) return
    try { 
      let res:any = !isEdit ?  await addHorse(finalData) : await editHorse({...finalData, id: rowId});
      if (res?.data) { 
        setApiStatusMsg({'status': 201, 'message': !isEdit ? '<b>Pedigree data created successfully!</b>' : '<b>Pedigree data updated successfully!</b>'});        
        setApiStatus(true);
      }
      if (res?.error) {
        if (res?.error.status === 422 || res?.error.status === 500) {
          setApiStatusMsg({ 'status': res?.error.status, 'message': '<b>There was a problem updating the horse!</b>' });
          setApiStatus(true);
        }
      }         
      if(res?.data){
        handleClose();
        resetData();
        getHorseDetails();
      }      
    } catch (error) {
      console.error(error);
    }
  };

  
  // Show or hide accordian
  const [expanded, setExpanded] = React.useState<string | false>(false);
  
  const Icon : any = () =>   <IconButton
    aria-label="toggle password visibility"
    edge="end"
    sx={{ marginRight: '3px', padding: '0px' }}>
  <img src={Images.Datepicker} alt='Date Picker'/>
  </IconButton>;

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const [isGeldingDisable, setIsGeldingDisable] = React.useState<boolean>(false);    
  const handleGenderChange = (event: any) => {
    setSex(event.target.value);
    const clickedGenderValue = event.target.value;
    setIsGeldingDisable((clickedGenderValue === "F") ? true : false);
    handleChangeField("sex", event.target.value);
    setStateValue({
      ...state,
      ['isSexTouched']: true,
      ['sex']: event.target.value
    })
  };

  const handleChangeDOB = (value:any) => {
    setDateValue(value);
  }

  const paperSx: SxProps = {
    "& .MuiPaper-root": {
      paddingBottom: '10px !important',
      borderRadius: '8px !important',
    },

    "& .css-epd502": {
      width: '382px',
      maxHeight: '431px',
    },
    "& .MuiCalendarPicker-root": {
      backgroundColor: "#ffffff",
      borderRadius: '8px !important',
      maxHeight: '431px',
      width: '100%',
    },
    
    "& .MuiCalendarPicker-root .css-1dozdou": {
      marginTop:'33px',
      paddingLeft: '39px',
      marginBottom: '24px',
    },

    "& .MuiCalendarPicker-root .css-e8k8r9": {
      marginLeft: 'auto',
      color: '#005632',
      fontFamily: 'synthese-bold',
      fontWeight: '700',
      fontSize: '16px',
      lineHeight: '24px',
      letterSpacing: '-0.01em',
      textTransform:'uppercase',
    },

    "& .MuiCalendarPicker-root .PrivatePickersSlideTransition-root": {
      overflow: 'hidden',
      paddingBottom: '10px',
      minHeight: '310px',
    },
    "& .MuiCalendarPicker-root .PrivatePickersSlideTransition-root .css-mvmu1r": {
      overflow: 'hidden',
      margin: '0px'
    },

    "& .MuiIconButton-edgeEnd": {
      position: 'absolute',
      top: '24px',
      left: '24px',
      width: '49px',
      height: '49px',
      border: 'solid 1px #F2F2F2',
      borderRadius: '4px',
      color: '#005632',
      background:'none',
    },

    "& .MuiIconButton-edgeStart": {
      position: 'absolute',
      top: '24px',
      right: '24px',
      width: '49px',
      height: '49px',
      border: 'solid 1px #F2F2F2',
      borderRadius: '4px',
      color: '#005632',
      background:'none',
    },

  
    "& .MuiCalendarPicker-root .css-195v8y8": {
      margin: 'auto',
      marginTop: '12px',
      fontFamily: 'synthese-bold',
      fontSize: '16px',
      textTransform: 'uppercase',
      color: '#005632'
    },

    "& .MuiCalendarPicker-viewTransitionContainer ": {
      overflowY: 'hidden'
    },

    "& .MuiTypography-root": {
      margin: '0 2px',
      padding: '0px 2px',
      fontWeight: '400',
      fontSize: '11px',
      lineHeight: '16px',
      color: '#979797',
      fontFamily: 'synthese-Regular',
      width: '45px',
      height: '30px',
    },

    "& .MuiPickersDay-dayWithMargin": {
      fontFamily: 'synthese-bold',
      fontSize: '16px',
      margin: '2px',
      color: "#161716",
      backgroundColor: "#ffffff",
      padding: '10px 0px 12px',
      lineHeight: '23px',
      width: '45px',
      height: '45px'
    },

    "& .MuiPickersDay-dayWithMargin:hover": {
      backgroundColor: "#F4F1EF",
      borderRadius: '4px'
    },

    "& .MuiPickersDay-root.Mui-selected": {
      backgroundColor: "#007142",
      borderRadius: '4px',
      color: '#ffffff'
    },

    "& .MuiPickersDay-root.Mui-disabled": {
      color: '#CCCCCC'
    },

    "& .MuiPickersDay-today": {
      border: '0 !important',
      backgroundColor: '#F4F1EF',
      borderRadius: '4px'
    },

    "& .MuiPickersDay-today:hover": {
      backgroundColor: '#d4d4d4',
    },
    "& .MuiTabs-root": { backgroundColor: "rgba(120, 120, 120, 0.4)" }
  };

  
  return (
    <StyledEngineProvider injectFirst> 
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root':
          {
            height: 'auto !important',
          },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className='filter-section horse-leftbar horse-rightbar'
    >      
        <CssBaseline />
        <Scrollbar
        className='filter-scrollbar'
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        > 
        <DrawerHeader className='filter-drawer-head' sx={{minHeight:'inherit !important'}}>
           <Box sx={{position: 'relative', marginRight: 'auto'}}>
                <Typography variant="h3">Horse Name</Typography>
            </Box>
            <IconButton className='closeBtn' onClick={handleClose}>
              <i style={{color: '#161716'}} className="icon-Cross" />
            </IconButton>
        </DrawerHeader>
        {isFetching ? 
          <Box pt={2} className="edit-section horse-edit"><CircularSpinner /></Box>
        :
        (isSuccess && 
        <Box pt={2} className="edit-section">
        <form onSubmit={handleSubmit(onSubmit)}>
        <Box className='FormGroup'>
          <Box className='userIconRight-wrap'>
            <Box className='userIconRight'>
              <TextField error={errors.horseName ? true : false} {...register(`horseName`)} placeholder="Horse Name" className="form-control edit-field" defaultValue={defaultValues.horseName} onChange={(e) => handleChangeField("horseName", e.target.value)}/>
            </Box>
            {errors.horseName && <div className="errorMsg">{errors.horseName}</div>}  
          </Box>
            <Box className='userIconRight'>
                <Box className='edit-field'>
                     <Select 
                        {...register(`countryId`)}
                        error={errors.countryId ? true : false}
                        IconComponent = {KeyboardArrowDownRoundedIcon}
                        value={countryId}  
                        onChange={(e: any) => {setCountryId(e.target.value); handleChangeField("countryId", e.target.value)}}                        
                        className="countryDropdown filter-slct"
                        MenuProps={{
                          className:'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          ...MenuPropss
                        }}>
                       <MenuItem className="selectDropDownList countryDropdownList" value={"none"} disabled><em>Country of Birth</em></MenuItem>
                      {countriesList?.map(({ id, countryName }) => {
                        return (
                          <MenuItem className="selectDropDownList countryDropdownList" value={id} key={id}>
                            {countryName}
                          </MenuItem>
                        );
                      })}
                   </Select>
                   {errors.countryId && <div className="errorMsg">{errors.countryId}</div>}
                   </Box>
                
            </Box>
            <Box className='edit-field'>
              <TextField {...register(`yob`)}
                error={errors.yob ? true : false}
                placeholder="Year of Birth"
                className="form-control edit-field"
                value={state.yob}
                onChange={(e: any) => { setYob(e.target.value); handleChangeField("yob", e.target.value) }}
              />      
              {errors.yob && <div className="errorMsg">{errors.yob}</div>}                
            </Box>
                   <Box className='edit-field'>
                     <Select 
                        {...register(`colourId`)}
                        error={errors.colourId ? true : false}
                        IconComponent = {KeyboardArrowDownRoundedIcon}
                        value={colourId}  
                        onChange={(e: any) => {setColourId(e.target.value); handleChangeField("colourId", e.target.value)}}                       
                        className="filter-slct"
                        MenuProps={{
                          className:'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuPropss
                        }}>
                       <MenuItem className="selectDropDownList" value={"none"} disabled><em>Colour</em></MenuItem>
                      {coloursList?.map(({ id, colourName }) => {
                        return (
                          <MenuItem className="selectDropDownList" value={id} key={id}>
                            {colourName}
                          </MenuItem>
                        );
                      })}
                   </Select>     
                   {errors.colourId && <div className="errorMsg">{errors.colourId}</div>}              
                   </Box>        
                                  
        <Box className='FormGroup' mt={2}>
          <Typography variant="h5" className="radio-filter">Horse Filter</Typography> 
          <Box className='RadioGroupWrapper' mb={0} sx={{paddingTop:'3px !important'}}>
          <RadioGroup
            {...register(`sex`)}
            aria-labelledby="demo-radio-buttons-group-label"
            value={sex}
            name="radio-buttons-group"
            sx={{margin:'0px !important'}} className='RadioList gelding-display'
            onChange={(e: any) => handleGenderChange(e)} 
          >
            <FormControlLabel value="M" disabled={true} control={<Radio checkedIcon={<img src={Images.Radiochecked}/>} icon={<img src={Images.Radiounchecked}/>} />} label="Male" />
            <FormControlLabel value="F" disabled={true} control={<Radio checkedIcon={<img src={Images.Radiochecked}/>} icon={<img src={Images.Radiounchecked}/>}/>} label="Female" />
          </RadioGroup>
            </Box>
            </Box>

          {!isGeldingDisable && <Accordion defaultExpanded={true} onChange={handleChange('panel1')} className="accordionDrawer" sx={{mb:1}}>
              <AccordionSummary
                expandIcon={<KeyboardArrowDownRoundedIcon />}
                aria-controls="panel4bh-content"
                id="panel4bh-header"
              >
                <Typography variant="h4">Gelding</Typography>
              </AccordionSummary>
              <AccordionDetails>
              <Box className='RadioGroupWrapper' mb={1} sx={{paddingTop:'0px !important'}}>
                <RadioGroup
                  {...register(`gelding`)}
                  aria-labelledby="demo-radio-buttons-group-label"
                  value={gelding}
                  name="radio-buttons-group"
                  sx={{margin:'0px !important'}} className='RadioList gelding-display'
                  onChange={(e: any) => { setGelding(e.target.value); handleChangeField("gelding", e.target.value) }} 
                >
                  <FormControlLabel value={true} control={<Radio checkedIcon={<img src={Images.Radiochecked}/>} icon={<img src={Images.Radiounchecked}/>} />} label="Yes" />
                  <FormControlLabel value={false} control={<Radio checkedIcon={<img src={Images.Radiochecked}/>} icon={<img src={Images.Radiounchecked}/>} />} label="No" />
                </RadioGroup>
                <div className="errorMsg">{errors.gelding}</div>
              </Box>                      
              </AccordionDetails>
          </Accordion>
          }

                <Accordion  defaultExpanded={true}  onChange={handleChange('panel2')} className="accordionDrawer advanced-horse">
                    <AccordionSummary
                      expandIcon={<KeyboardArrowDownRoundedIcon />}
                      aria-controls="panel4bh-content"
                      id="panel4bh-header"
                    >
                      <Typography variant="h4">Advanced</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box className='edit-field'>
                     <Select 
                        {...register(`horseTypeId`)}
                        error={errors.horseTypeId ? true : false}
                        IconComponent = {KeyboardArrowDownRoundedIcon}
                        value={horseTypeId}  
                        onChange={(e: any) => {setHorseTypeId(e.target.value); handleChangeField("horseTypeId", e.target.value)}}                    
                        className="filter-slct"
                        MenuProps={{
                          className:'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuPropss
                        }}>
                       <MenuItem className="selectDropDownList" value={"none"} disabled><em>Horse Breed</em></MenuItem>
                      {horseTypeList?.map(({ id, horseTypeName }) => {
                        return (
                          <MenuItem className="selectDropDownList" value={id} key={id}>
                            {horseTypeName}
                          </MenuItem>
                        );
                      })}
                   </Select>  
                   {errors.horseTypeId && <div className="errorMsg">{errors.horseTypeId}</div>}                      
                   </Box>
                    <Box className='edit-field'>
                      <Box className='calender-wrapper'>
                        <CustomDatePicker
                          placeholderText='Date of Birth'
                          value={state?.dob ? state?.dob : ''}
                          handleChange={handleChangeDOB}
                        />
                      </Box>
                      {errors?.dob && <div className="errorMsg">{errors.dob}</div>}
                    </Box>
                    </AccordionDetails>
                </Accordion>
               
                <Box className="edit-field IosSwitches-Common">
                  <FormControlLabel
                    {...register(`isLocked`)}
                    control={<IOSSwitch checked={isLocked} />}
                    label={
                      <>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                          Locked
                        </Typography>
                      </>
                    }
                    sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}   
                    onChange={(e: any) => setIsLocked((e.target.checked) ? true : false)}                  
                    labelPlacement="start"
                  />
                  </Box>


              <Accordion defaultExpanded={true} onChange={handleChange('panel3')} className="accordionDrawer price-money-block">
                  <AccordionSummary
                    expandIcon={<KeyboardArrowDownRoundedIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Typography variant="h4">Prizemoney</Typography>
                  </AccordionSummary>
                  <AccordionDetails className='common-arrow-drop'><Box className='edit-field'>
                     <Select 
                        {...register(`currencyId`)}
                        IconComponent = {KeyboardArrowDownRoundedIcon}
                        value={currencyId}  
                        onChange={(e: any) => {setCurrencyId(e.target.value); handleChangeField("currencyId", e.target.value)}}                      
                        className="filter-slct"
                        MenuProps={{
                          className:'common-scroll-lock',
                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuPropss
                        }}>
                       <MenuItem className="selectDropDownList" value={"none"} disabled><em>Prizemoney Currency</em></MenuItem>
                      {currencyList?.map(({ id, currencyName }) => {
                        return (
                          <MenuItem className="selectDropDownList" value={id} key={id}>
                            {currencyName}
                          </MenuItem>
                        );
                      })}
                   </Select>                  
                   </Box>
                   <TextField {...register(`totalPrizeMoneyEarned`)}
                        placeholder="Prizemoney"
                        className="form-control edit-field"
                        value={state.totalPrizeMoneyEarned}
                        onChange={(e: any) => handleChangeField("totalPrizeMoneyEarned", e.target.value)}
                        inputProps={{
                          maxLength: 16, // Maximum length of 16 characters
                        }}
                      />
                      {errors?.prizemoney && <div className="errorMsg">{errors.prizemoney}</div>}
              </AccordionDetails>
              </Accordion>
                  
                {isEdit && 
                <Accordion defaultExpanded={true} onChange={handleChange('panel4')}  className="accordionDrawer information-horse-block">
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Typography variant="h4">Information</Typography>
                  </AccordionSummary>
                    <AccordionDetails>
                      <Typography>Runs: <label><u>{currentPedigreeHorse?.runs}</u></label></Typography>
                      <Typography>Group 1 Wins: <label><u>{currentPedigreeHorse?.group_1_wins}</u></label></Typography>
                      <Typography>Group 2 Wins: <label><u>{currentPedigreeHorse?.group_2_wins}</u></label></Typography>
                      <Typography>Group 3 Wins: <label><u>{currentPedigreeHorse?.group_3_wins}</u></label></Typography>
                      <Typography>Listed Wins: <label><u>{currentPedigreeHorse?.listedWins}</u></label></Typography>
                      <Typography>Total Wins(Career): <label><u>{currentPedigreeHorse?.totalWins}</u></label></Typography>
                      <Typography>Created: <label>{currentPedigreeHorse?.createdOn ? formatInTimeZone(new Date(currentPedigreeHorse?.createdOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Created by: <label>{currentPedigreeHorse?.createdBy ? currentPedigreeHorse?.createdBy : '--'}</label></Typography>
                        <Typography>Verified: <label>{currentPedigreeHorse?.verifiedOn ? formatInTimeZone(new Date(currentPedigreeHorse?.verifiedOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Verified by: <label>{currentPedigreeHorse?.verifiedBy ? currentPedigreeHorse?.verifiedBy : '--'}</label></Typography>
                        <Typography>Last Updated: <label>{currentPedigreeHorse?.modifiedOn ? formatInTimeZone(new Date(currentPedigreeHorse?.modifiedOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Last Updated by: <label>{currentPedigreeHorse?.modifiedBy ? currentPedigreeHorse?.modifiedBy : '--'}</label></Typography>
                        <Typography>Eligibility: <label>{currentPedigreeHorse?.eligibility ? 'Yes' : 'No'}</label></Typography>
                        <Typography>My Mares: <label><u>{currentPedigreeHorse?.myMares ? 'Yes' : 'No'}</u></label></Typography>
                        <Typography>Favourite Stallions: <label><u>{currentPedigreeHorse?.favouriteStallion ? 'Yes' : 'No'}</u></label></Typography>
                        <Typography>Favourite Boodmare Sire: <label><u>{currentPedigreeHorse?.favBroodmareSire ? 'Yes' : 'No'}</u></label></Typography>
                    </AccordionDetails>
                </Accordion>
                }
          </Box>               
            <Stack sx={{ mt: 3 }} className='DrawerBtnWrapper'>
              <LoadingButton  className='search-btn' type="submit" variant="contained" loading={isSubmitting}>
                  {!isEdit ? 'Save' : 'Update'}
              </LoadingButton>
              <Grid container spacing={1} className='DrawerBtnBottom'>
                <Grid item xs={12} md={12} sx={{paddingTop:'10px !important'}}>
                  <LoadingButton type="submit" variant="contained" className='expand-btn'>
                    Expand
                  </LoadingButton>
                </Grid>
              </Grid>
            </Stack>
        </form>  
        </Box>
        )}
        </Scrollbar>
    </Drawer>
    </StyledEngineProvider> 
  );
}
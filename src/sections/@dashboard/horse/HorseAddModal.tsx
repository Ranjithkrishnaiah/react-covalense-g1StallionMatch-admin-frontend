import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
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
    Button,
    IconButton,
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
import { useAddHorseMutation, useEditHorseMutation, useCreateHorseWithPedigreeMutation } from 'src/redux/splitEndpoints/horseSplit';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useColoursQuery } from 'src/redux/splitEndpoints/coloursSplit';
import { useHorseTypesQuery } from 'src/redux/splitEndpoints/horseTypesSplit';
import { range } from 'src/utils/formatYear';
import { LoadingButton } from '@mui/lab';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Scrollbar from 'src/components/Scrollbar';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SwitchProps } from '@mui/material/Switch';
import "src/sections/@dashboard/css/filter.css";
import { Images } from 'src/assets/images';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { HorseNameAlias } from 'src/components/horse-modal/HorseNameAlias';
import { dateConvertHypen } from 'src/utils/customFunctions';
import './HorseGen.css';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
import { formatInTimeZone } from 'date-fns-tz';
import { v4 as uuid } from 'uuid';
////////////////////////

// Set modal sidebar width
const drawerWidth = 290;
type FormValuesProps = HorseForm;

type Props = {
    name: string;
    horseId: string;
    currentHorse?: HorseForm;
    isEdit: boolean; 
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

export default function HorseAddModal(props: any) {  
  const paramData:any = useParams();
  const parentProgenyId = paramData?.progenyId
  const parentHorseId = localStorage.getItem("parentHorseId");
  const {
    name,
    sex:horseSex,
    countryId:sCoB,
    yob:sYoB,
    horseId,
    requestId,
    currentHorse,
    isEdit,
    genId,
    progenyId,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg,
    newHorseFormData, setNewHorseFormData, errors, setErrors, 
    newHorsePedigreeData, setNewHorsePedigreeData,
    isNotSireAndDam, setIsNotSireAndDam
  } = props;
  const navigate = useNavigate();

  // Post horse api call
  const [addHorse] = useAddHorseMutation();

  const [addHorseWithPedigree] = useCreateHorseWithPedigreeMutation();

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
  
  const [sex, setSex] = React.useState<any>(horseSex || null);
  const [CoB, setCoB] = React.useState<any>(sCoB || null);  
  const [YoB, setYoB] = React.useState<any>(sYoB || null);  
  const [gelding, setGelding] = React.useState<any>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const NewHorseSchema = Yup.object().shape({
    // horseName: Yup.string().required('Horse Name is required'),
  });   
 
  // const [errors, setErrors] = React.useState<any>({});

  const [isValidDoB, setIsValidDoB] = useState(true);
  const [isValidPrizeMoney, setIsValidPrizeMoney] = useState(true);
  // Create a state variable to capture form element value in post or patch request
  const [state, setStateValue] = useState({
    id: "",
    horseName: '',
    yob:  sYoB || "",
    dob:  "",
    countryId:  "",
    colourId:  "",
    sex:  "",
    gelding:  "",
    horseTypeId:  "",
    isLocked: false,
    currencyId:  "", 
    totalPrizeMoneyEarned:  "",
    isSexTouched: horseSex ? true : false,
  });

  // useEffect(() => {
  //   if(horseSex) {
  //     setNewHorseFormData({
  //       ...newHorseFormData,
        
  //       ['isSexTouched']: true,
  //     })
  //   }
  // },[horseSex])

  const defaultValues = useMemo(
    () => ({
      horseName: currentHorse?.horseName || name,
      yob: currentHorse?.yob || sYoB || 0,
      dob: dateConvertHypen(currentHorse?.dob) || '',
      countryId: currentHorse?.countryId || CoB || 0,
      colourId: currentHorse?.colourId || 0,
      sex: currentHorse?.sex || horseSex || 'M',
      gelding: currentHorse?.gelding || "",
      horseTypeId: currentHorse?.horseTypeId || 0,
      isLocked: currentHorse?.isLocked || false,
      currencyId: currentHorse?.currencyId || 0, 
      totalPrizeMoneyEarned: currentHorse?.totalPrizeMoneyEarned || "",     
      id: currentHorse?.id || '',
    }),
    [currentHorse]
  );
  
  // form method
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewHorseSchema),
    mode: 'onTouched',
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

  useEffect(() => {
    if (isEdit && currentHorse) {
      setCountryId(defaultValues.countryId);
      setYob(defaultValues.yob);
      setColourId(defaultValues.colourId);
      setSex(defaultValues.sex);
      setGelding(defaultValues.gelding);
      setHorseTypeId(defaultValues.horseTypeId);
      setCurrencyId(defaultValues.currencyId);
      setIsLocked(defaultValues.isLocked);
      setDateValue(defaultValues.dob);
      reset(defaultValues);
    }
    if (!isEdit) {
      resetData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentHorse]);

  // Check and remove form validation
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
    setCountryId("none");
    setYob("none");
    setColourId("none");
    setSex("");
    setGelding("");
    setHorseTypeId("none");
    setCurrencyId("none");
    setIsLocked(false);
    setDateValue(null);
    setIsGeldingDisable(false);
    setIsValidPrizeMoney(true);
    setIsValidDoB(true);
    reset()
  }  

  // Update state variable while form element value is typed or choosen
  const handleChangeField = (type: any, targetValue: any) => {    
    setStateValue({
      ...state,
      [type]: targetValue
    });
    setNewHorseFormData({
      ...newHorseFormData,
      ['isLocked']: isLocked,
      ['dob']: (!dateValue) ? null : dateValue,
      [type]: targetValue
    })
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
    if (data.yob === null) {
      formIsValid = false;  //@ts-ignore
      errors["yob"] = `Year of Birth is required`;
    }
    if (data.yob !== null && isNaN(data?.yob)) {
      formIsValid = false;  //@ts-ignore
      errors["yob"] = `Year of Birth accept upto 4 digits number1`;
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
    if(!horseSex) {
      if (!state.isSexTouched) {
        formIsValid = false;  //@ts-ignore
        errors["sex"] = `Gender is required`;
      }
    }
    if (state.sex === 'M' && state.gelding === '') {
      formIsValid = false;  //@ts-ignore
      errors["gelding"] = `Gelding is required`;
    }
    if (data.horseTypeId === 0) {
      formIsValid = false;  //@ts-ignore
      errors["horseTypeId"] = `Horse Breed is required`;
    }
    if (isValid4DigitYear && (data.dob && data.yob !== 0)) {
      if (!isValidYear(data.dob)) {
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
  
  const horseBatchUuid: any = uuid();

  // Post or Patch api call based on save button clicked and display toaster message
  const onSubmit = async (data: FormValuesProps) => { 
    if (data?.currencyId === 0) {
      delete data?.currencyId;
    }
    if (data?.yob === '' || data?.yob === 0) {
      delete data?.yob;
    }
    if (!dateValue) {
      delete data?.dob;
    }
    let finalData = (progenyId === 0) ? { ...data, sex: sex,  yob: (!data?.yob) ? null : Number(yob), gelding: (sex === 'M' && gelding === 'true') ? true : false, dob: (!dateValue) ? null : dateValue, generation: parseInt(genId), totalPrizeMoneyEarned: Number(data.totalPrizeMoneyEarned) } : { ...data, sex: sex, yob: (!data?.yob) ? null : Number(yob), gelding: gelding, dob: (!dateValue) ? null : dateValue, generation: parseInt(genId), progenyId: parseInt(progenyId), totalPrizeMoneyEarned: Number(data.totalPrizeMoneyEarned) }

    let finalNewData = { ...newHorseFormData, sex: sex,  yob: (!newHorseFormData?.yob) ? null : Number(newHorseFormData.yob), gelding: (newHorseFormData.sex === 'M' && newHorseFormData.gelding === 'true') ? true : false, dob: (!dateValue) ? null : dateValue, totalPrizeMoneyEarned: Number(newHorseFormData.totalPrizeMoneyEarned), requestId: (requestId) ? requestId : null } 

    // Replace the horseData element in the first array with the finalNewData object
    if (newHorsePedigreeData.length > 0 && newHorsePedigreeData[0].length > 0) {      
      const horseData = newHorsePedigreeData[0][0].horseData;
      // Merge the replacementData object with the existing horseData, excluding the 'id' property
      newHorsePedigreeData[0][0].horseData = { ...horseData, ...finalNewData };
      // Remove the 'id' property if it exists
      delete newHorsePedigreeData[0][0].horseData.id;
      delete newHorsePedigreeData[0][0].horseData.isSexTouched;
      if(newHorsePedigreeData[0][0].horseData.currencyId === "") {
        delete newHorsePedigreeData[0][0].horseData.currencyId;
      }
      if(newHorsePedigreeData[0][0].horseData.totalPrizeMoneyEarned === "") {
        delete newHorsePedigreeData[0][0].horseData.totalPrizeMoneyEarned;
      }
    }

    const addNewHorseData = {
      batch: horseBatchUuid,
      data: newHorsePedigreeData
    }
    
    if (!validateForm((requestId) ? finalNewData : finalData)) return

    try {      
      let res:any = !isEdit ? await addHorseWithPedigree({...addNewHorseData})  : await editHorse({...finalData, id: horseId});
      if (res?.data) { 
        setApiStatusMsg({'status': 201, 'message': !isEdit ? '<b>Horse data created successfully!</b>' : '<b>Horse data updated successfully!</b>'});        
        setApiStatus(true);
      }
      if (res?.error) {
        if(res?.error.status === 422 || res?.error.status === 500) {
          setApiStatusMsg({'status': res?.error.status, 'message': '<b>There was a problem updating the horse!</b>'});
          setApiStatus(true);
        }
      }
      resetData();
      if(parentHorseId && !requestId){
        setTimeout(() => {
          // navigate(PATH_DASHBOARD.horsedetails.edit(parentHorseId));
          navigate(PATH_DASHBOARD.horsedetails.data);
        }, 1000)
       
      }else {
        // navigate(PATH_DASHBOARD.horsedetails.edit(res?.data?.horseUuid));
        navigate(PATH_DASHBOARD.horsedetails.data);
      }
     
    } catch (error) {
      console.error(error);
    }
  }; 
 
  const yobList = range(2000, 2050);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',      
    p: 4,
  };

  // Show or hide accordian
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

    const [dateValue, setDateValue] = React.useState(null);

  // Add style for drawer header 
  const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }));
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [openPopper, setOpenPopper] = React.useState(false);

  const [isNameAliasClicked, setIsNameAliasClicked] = React.useState<boolean>(false);
  const [isCOBAliasClicked, setIsCOBAliasClicked] = React.useState<boolean>(false);
  const [isGeldingDisable, setIsGeldingDisable] = React.useState<boolean>(false);    


  const canBeOpen = openPopper && Boolean(anchorEl);
  const popperId = canBeOpen ? 'simple-popper' : undefined;  
  const hidePopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpenPopper(false);
  } 

  const enterhorsename = [
    { label: 'Yarraman Park', year: 1994 },
    { label: 'Darley', year: 1972 },
    { label: 'Darley', year: 1974 },    
  ];  
  const Icon : any = () =>   <IconButton
  aria-label="toggle password visibility"
  edge="end"
  sx={{ marginRight: '3px', padding: '0px' }}>
 <img src={Images.Datepicker} alt='Date Picker'/>
</IconButton>;

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

const ITEM_HEIGHT = 48;
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
  }
  const [countryId, setCountryId] = useState(
    currentHorse?.countryId > 0 ? currentHorse?.countryId : "none"
  );
  const [yob, setYob] = useState(
    currentHorse?.yob > 0 ? currentHorse?.yob : "none"
  );  
  const [colourId, setColourId] = useState(
    currentHorse?.colourId > 0 ? currentHorse?.colourId : "none"
  ); 

  // Check and remove form validation
  useEffect(() => {
    if (CoB > 0) {
      setStateValue({...state, countryId: CoB});
      setCountryId(CoB);
    }
    if (YoB > 0) {
      setStateValue({...state, yob: YoB});
    }
  }, [CoB, YoB]);  
  const handleChangeDOB = (value:any) => {
    setDateValue(value);
  }

  // Check full year from date of birth and validate with YoB
  let isValidYear = (value:any) => {
    const dobYear:any = value && new Date(value).getFullYear();
    let yearOfBirth:any = yob || state.yob;
    
    if(yearOfBirth == dobYear) {
      return true;
    }else {
      return false;
    }
  }

  // Check gender update and update the state variable
  const handleGenderChange = (event: any) => {
    setSex(event.target.value);
    const clickedGenderValue = event.target.value;
    setIsGeldingDisable((clickedGenderValue === "F") ? true : false);
    handleChangeField("sex", event.target.value);
    setStateValue({
      ...state,
      ['isSexTouched']: true,
      ['sex']: event.target.value
    });
    setNewHorseFormData({
      ...newHorseFormData,
      ['isLocked']: isLocked,
      ['dob']: (!dateValue) ? null : dateValue,
      ['sex']: event.target.value,
      ['isSexTouched']: true,
    })
  };
  
  const [horseTypeId, setHorseTypeId] = useState(
    currentHorse?.horseTypeId > 0 ? currentHorse?.horseTypeId : "none"
  );    
  const [currencyId, setCurrencyId] = useState(
    currentHorse?.currencyId > 0 ? currentHorse?.currencyId : "none"
  );

  const [showDrawer, setShowDrawer] = React.useState<any>(true)
  const handleDrawerClose = () => {
    // if(parentHorseId){
    //   navigate(PATH_DASHBOARD.horsedetails.edit(parentHorseId));
    // }else {
    //   navigate(PATH_DASHBOARD.horsedetails.data);
    // }
    setShowDrawer(false);
    // resetData();
  }

  useEffect(() => {
    handleDefaultGender();
    setIsGeldingDisable((requestId && sex === 'F') ? true : false);
  }, [requestId])

  const handleDefaultGender = () => {
    if(requestId){
      if(sex === 'M'){
        setSex("M")
        setStateValue({
          ...state,
          ['isSexTouched']: true,
        })
        setNewHorseFormData({
          ...newHorseFormData,
          ['isLocked']: isLocked,
          ['dob']: (!dateValue) ? null : dateValue,
          ['isSexTouched']: true,
        })
      }else {
        setSex("F")
        setStateValue({
          ...state,
          ['isSexTouched']: true,
        })
        setNewHorseFormData({
          ...newHorseFormData,
          ['isLocked']: isLocked,
          ['dob']: (!dateValue) ? null : dateValue,
          ['isSexTouched']: true,
        })
      }
    }
  }  

  return (   
    <StyledEngineProvider injectFirst> 
      <Drawer
        sx={{
          width: drawerWidth,          
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,           
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        className='filter-section horse-leftbar'
        open={showDrawer}
        onClose={handleDrawerClose}
      >   
       <Scrollbar
        className='filter-scrollbar'
          sx={{
            height: 1,
            '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
          }}
        >     
          <DrawerHeader className='filter-drawer-head' sx={{ minHeight: 'inherit !important', position: "relative" }}>
            <Box sx={{ position: 'relative', marginRight: 'auto' }}>
              <Typography variant="h3">Horse Details</Typography>
            </Box>
              <i className="icon-menu-back" style={{ color: "rgb(22, 23, 22)", cursor: "pointer", position: "relative", top: "16px", right: "-15px" }} onClick={handleDrawerClose}></i>
            </DrawerHeader>
        
        <Box  pt={2}  className="edit-section">
        
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
                          disableScrollLock: false,
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
            value={sex || horseSex}
            name="radio-buttons-group"
            sx={{margin:'0px !important'}} className='RadioList gelding-display'
            onChange={(e: any) => handleGenderChange(e)} 
          >
            <FormControlLabel value="M" disabled={(requestId) ? true : false} control={<Radio checkedIcon={<img src={Images.Radiochecked}/>} icon={<img src={Images.Radiounchecked}/>} />} label="Male" />
            <FormControlLabel value="F" disabled={(requestId) ? true : false} control={<Radio checkedIcon={<img src={Images.Radiochecked}/>} icon={<img src={Images.Radiounchecked}/>}/>} label="Female" />
          </RadioGroup>
          <div className="errorMsg">{errors.sex}</div>
            </Box>
            </Box>
          {!isGeldingDisable &&
          <Accordion defaultExpanded={true} onChange={handleChange('panel1')} className="accordionDrawer" sx={{mb:1}}>
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
                          disableScrollLock: false,
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
                        <LocalizationProvider dateAdapter={AdapterDateFns} >
                          <DatePicker
                          className='edit-field calender-box'                          
                            value={dateValue}
                            onChange={(newValue) => {
                              handleChangeDOB(newValue)
                            }}
                            disableFuture={true}
                            components={{
                              OpenPickerIcon: Icon ,
                            }}
                            PopperProps={{
                              placement: 'auto'
                            }}
                            PaperProps={{
                              sx: paperSx, 
                            }}
                            renderInput={(params : any) => <TextField  className="datepicker"  {...params}   inputProps={{
                              ...params.inputProps,
                              placeholder: "Date of Birth"
                      
                            }}
                            />}
                          />
                        </LocalizationProvider>
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
                        onChange={(e: any) => setCurrencyId(e.target.value)}                       
                        className="filter-slct"
                        MenuProps={{
                          disableScrollLock: false,
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
                   <TextField {...register(`totalPrizeMoneyEarned`)} placeholder="Prizemoney" className="form-control edit-field" defaultValue={defaultValues.totalPrizeMoneyEarned}/>
              </AccordionDetails>
              </Accordion>
                  
                {isEdit && 
                <Accordion defaultExpanded={true} onChange={handleChange('panel4')}  className="accordionDrawer information-horse-block">
                  <AccordionSummary
                    expandIcon={<KeyboardArrowDownRoundedIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Typography variant="h4">Information</Typography>
                  </AccordionSummary>
                    <AccordionDetails>
                      <Typography>Runs: <label><u>{currentHorse?.runs}</u></label></Typography>
                      <Typography>Group 1 Wins: <label><u>{currentHorse?.group_1_wins}</u></label></Typography>
                      <Typography>Group 2 Wins: <label><u>{currentHorse?.group_2_wins}</u></label></Typography>
                      <Typography>Group 3 Wins: <label><u>{currentHorse?.group_3_wins}</u></label></Typography>
                      <Typography>Listed Wins: <label><u>{currentHorse?.listedWins}</u></label></Typography>
                      <Typography>Total Wins(Career): <label><u>{currentHorse?.totalWins}</u></label></Typography>
                      <Typography>Created: <label>{currentHorse?.createdOn ? formatInTimeZone(new Date(currentHorse?.createdOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Created by: <label>{currentHorse?.createdBy ? currentHorse?.createdBy : '--'}</label></Typography>
                        <Typography>Verified: <label>{currentHorse?.verifiedOn ? formatInTimeZone(new Date(currentHorse?.verifiedOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Verified by: <label>{currentHorse?.verifiedBy ? currentHorse?.verifiedBy : '--'}</label></Typography>
                        <Typography>Last Updated: <label>{currentHorse?.modifiedOn ? formatInTimeZone(new Date(currentHorse?.modifiedOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Last Updated by: <label>{currentHorse?.modifiedBy ? currentHorse?.modifiedBy : '--'}</label></Typography>
                        <Typography>Eligibility: <label>{currentHorse?.eligibility ? 'Yes' : 'No'}</label></Typography>
                        <Typography>My Mares: <label><u>{currentHorse?.myMares ? 'Yes' : 'No'}</u></label></Typography>
                        <Typography>Favourite Stallions: <label><u>{currentHorse?.favouriteStallion ? 'Yes' : 'No'}</u></label></Typography>
                        <Typography>Favourite Boodmare Sire: <label><u>{currentHorse?.favBroodmareSire ? 'Yes' : 'No'}</u></label></Typography>
                    </AccordionDetails>
                </Accordion>
                }


          </Box>   


            
            <Stack sx={{ mt: 3 }} className='DrawerBtnWrapper'>
              <LoadingButton  className='search-btn' type="submit" disabled={isNotSireAndDam} variant="contained" loading={isSubmitting}>
                  {!isEdit ? 'Save' : 'Save'}
              </LoadingButton>

              <Grid container spacing={1.5} className='DrawerBtnBottom'>
                  <Grid item xs={6} md={6} sx={{paddingTop:'12px !important'}}>
                    <Button disabled={true} fullWidth type='button' className='search-btn'>Merge</Button>
                  </Grid>
                  <Grid item xs={6} md={6} sx={{paddingTop:'12px !important'}}>
                    <Button disabled={true} fullWidth type='button' className='add-btn'>Delete</Button>
                  </Grid>
                 </Grid>
            </Stack>
        {/* </FormProvider>  */}
        </form>
        </Box>
        </Scrollbar>
      </Drawer>     
      
       <HorseNameAlias 
          popperId={popperId}
          openPopper={openPopper}
          hidePopover={hidePopover}
          enterhorsename = {enterhorsename}  
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}  
          horseId={horseId}    
          isNameAliasClicked={isNameAliasClicked}
          setIsNameAliasClicked={setIsNameAliasClicked}
          isCOBAliasClicked={isCOBAliasClicked}
          setIsCOBAliasClicked={setIsCOBAliasClicked} 
       /> 

      </StyledEngineProvider> 
  );
}

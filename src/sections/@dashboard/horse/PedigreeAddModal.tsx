import IconButton from '@mui/material/IconButton';
import 'src/sections/@dashboard/css/list.css';
import Scrollbar from 'src/components/Scrollbar';
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import { useEffect, useState } from 'react';
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
// redux
import { useDispatch } from 'react-redux';
import { useAddHorseMutation } from 'src/redux/splitEndpoints/horseSplit';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useColoursQuery } from 'src/redux/splitEndpoints/coloursSplit';
import { useHorseTypesQuery } from 'src/redux/splitEndpoints/horseTypesSplit';
import { LoadingButton } from '@mui/lab';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Images } from 'src/assets/images';
import "src/sections/@dashboard/css/filter.css";
import './HorseGen.css';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { SwitchProps } from '@mui/material/Switch';
import CustomDatePicker from 'src/components/customDatePicker/CustomDatePicker';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
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

export default function PedigreeAddModal(props: any) {
  const navigate = useNavigate();
  const parentHorseId = localStorage.getItem("parentHorseId");
  const theme = useTheme();
  const {
    open, rowId, isEdit, handleClose, openAddEditForm, handleDrawerCloseRow,
    handleCloseEditState, genId, progenyId, selectedIndex,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, getHorseDetails,
    pedigreeHorseName, pedigreeHorseSex, newPedigreeName, setNewPedigreeName, 
    newHorseFormData, setNewHorseFormData, pedigreeHorseId, setPedigreeHorseId,
    horseType, isPedigreeHorseSearch, setIsPedigreeHorseSearch,
    reloadPedigreeAfterSaveOrUpdate
  } = props;      

  // Post horse api call
  const [addHorse] = useAddHorseMutation();

  // Get all country list
  const { data: countriesList } = useCountriesQuery(); 

  // Get all colour list
  const { data: coloursList } = useColoursQuery();

  // Get all horse type list
  const { data: horseTypeList } = useHorseTypesQuery();

  // Get all currency list
  const { data: currencyList } = useCurrenciesQuery();

  const [sex, setSex] = React.useState<any>(pedigreeHorseSex);
  const [gelding, setGelding] = React.useState(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [countryId, setCountryId] = useState("none");
  const [yob, setYob] = useState("none"); 
  const [colourId, setColourId] = useState("none");
  const [horseTypeId, setHorseTypeId] = useState("none");
  const [currencyId, setCurrencyId] = useState("none");
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
    horseName: pedigreeHorseName,
    yob:  "",
    dob:  "",
    countryId:  "",
    colourId:  "",
    sex:  pedigreeHorseSex,
    gelding:  "",
    horseTypeId:  "",
    isLocked: false,
    currencyId:  "", 
    totalPrizeMoneyEarned:  "",
    isSexTouched: false,
  });

  const defaultValues = {
      horseName: pedigreeHorseName,
      yob: 0,
      dob: '',
      countryId: 0,
      colourId: 0,
      sex: pedigreeHorseSex,
      gelding: false,
      horseTypeId: 0,
      isLocked: false,
      currencyId: 0, 
      totalPrizeMoneyEarned: "",     
      id: '',
    };
    
    // form method
  const methods = useForm<FormValuesProps>();

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
    
    if(parseInt(yearOfBirth) === dobYear) {
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
    if (data.countryId === 'none') {
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
    if (data.colourId === 'none') {
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
    if (data.horseTypeId === 'none') {
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
      ...state,
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
    setErrors({});
    setExpanded(false);
  }
  
  // Post api call based on save button clicked and display toaster message
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
    
    //generation:parseInt(pedigreeHorseGen), progenyId: progenyId, 
    const finalData = {...data, sex: sex, currencyId: (!state?.currencyId) ? null : Number(state?.currencyId), yob: (!data?.yob) ? null : Number(yob), gelding: (gelding === 'true') ? true : false, dob: (!dateValue) ? null : dateValue, totalPrizeMoneyEarned: (Number(data.totalPrizeMoneyEarned) === 0) ? null : Number(data.totalPrizeMoneyEarned)};
    
    if (!validateForm(finalData)) return
    
    try {       
      let res:any = await addHorse(finalData);
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
      // setIsPedigreeHorseSearch(true);
      setPedigreeHorseId({
        pedigreeId: res?.data?.horseUuid, 
        tag: horseType
      })
      reloadPedigreeAfterSaveOrUpdate();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }finally{
      
    }
  };  

  const handleChangeDOB = (value:any) => {
    setDateValue(value);
  }

  useEffect(() => {
    handleDefaultGender();
    setIsGeldingDisable((pedigreeHorseSex === "F") ? true : false);
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

  // CLose pedigree modal
  const handleCloseModal = () => {
    handleClose()
    setStateValue({
      ...state,
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
    setYob("none")
    setColourId("none")
    setHorseTypeId("none")
    setCurrencyId("none")
    setSex(null)
    setGelding(null)
    setDateValue("")
    setIsLocked(false)
    reset();
    setApiStatusMsg({});
    setNewPedigreeName("");
  }

  console.log('defaultValues>>>', defaultValues, 'state>>>', state);
  
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
            <IconButton className='closeBtn' onClick={handleCloseModal}>
              <i style={{color: '#161716'}} className="icon-Cross" />
            </IconButton>
        </DrawerHeader>
        <Box  pt={2} className="edit-section">
        <form onSubmit={handleSubmit(onSubmit)}>
        <Box className='FormGroup'>
          <Box className='userIconRight-wrap'>
            <Box className='userIconRight'>
              <TextField error={errors.horseName ? true : false}{...register(`horseName`)} placeholder="Horse Name" className="form-control edit-field" defaultValue={defaultValues.horseName} onChange={(e) => handleChangeField("horseName", e.target.value)}/>
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
                          <CustomDatePicker
                            placeholderText='Date of Birth'
                            value={dateValue ? dateValue : ''}
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
        </Scrollbar>
    </Drawer>
    </StyledEngineProvider> 
  );
}
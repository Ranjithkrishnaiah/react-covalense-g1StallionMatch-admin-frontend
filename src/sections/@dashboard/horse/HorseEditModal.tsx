import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
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
// redux
import { useDispatch } from 'react-redux';
import { useAddHorseMutation, useEditHorseMutation, useHorseNameDefaultAliasQuery, useHorseCoBDefaultAliasQuery, useHorseMergeExistsQuery, useCreateHorseWithPedigreeMutation } from 'src/redux/splitEndpoints/horseSplit';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useColoursQuery } from 'src/redux/splitEndpoints/coloursSplit';
import { useHorseTypesQuery } from 'src/redux/splitEndpoints/horseTypesSplit';
import { LoadingButton } from '@mui/lab';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Scrollbar from 'src/components/Scrollbar';
import { SwitchProps } from '@mui/material/Switch';
import "src/sections/@dashboard/css/filter.css";
import { Images } from 'src/assets/images';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { HorseNameAlias } from 'src/components/horse-modal/HorseNameAlias';
// routes
import { PATH_DASHBOARD } from 'src/routes/paths';
import axios from '../../../utils/axios';
import { api } from 'src/api/apiPaths';
import { toPascalCase } from 'src/utils/customFunctions';
import { formatInTimeZone } from 'date-fns-tz';
import CustomDatePicker from 'src/components/customDatePicker/CustomDatePicker';
import { MergeHorseWrapper } from 'src/components/horse-modal/MergeHorseWrapper';
import { MergeHorseResponseWrapper } from 'src/components/horse-modal/MergeHorseResponseWrapper';
import { v4 as uuid } from 'uuid';
import { PedigreeConstants } from 'src/constants/PedigreeConstants';
////////////////////////

// Set modal sidebar width
const drawerWidth = 290;
type FormValuesProps = HorseForm;

type Props = {
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

export default function HorseEditModal(props: any) {
  const {
    horseId,
    currentHorse,
    isEdit,
    genId,
    progenyId,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, toggleAddModal, showAddModal,
    newHorseFormData, setNewHorseFormData, errors, setErrors, isNotSireAndDam, setIsNotSireAndDam,
    newHorsePedigreeData, setNewHorsePedigreeData, generationsArray, setGenerationsArray,
    horseModuleAccess, setHorseModuleAccess, clickedPopover, setClickedPopover
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

  // Get all merge horse list
  // const { data: existHorseData, isFetching: isMergeFetching, isSuccess: isMergeSuccess } = useHorseMergeExistsQuery({horseId: horseId, name: currentHorse?.horseName}, { skip: (!isEdit), refetchOnMountOrArgChange: true });
  const [sex, setSex] = React.useState("");
  const [gelding, setGelding] = React.useState("");
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [dateValue, setDateValue] = React.useState(null);
  const NewHorseSchema = Yup.object().shape({
    // horseName: Yup.string().required('Horse Name is required'),
  });
  // console.log(isLocked, 'isLocked')
  // console.log(newHorseFormData, 'isLocked newHorseFormData')

  const [isValidDoB, setIsValidDoB] = useState(true);
  const [isValidPrizeMoney, setIsValidPrizeMoney] = useState(true);
  // Create a state variable to capture form element value in post or patch request
  const [state, setStateValue] = useState({
    id: "",
    horseName: '',
    yob: "",
    dob: "",
    countryId: "",
    colourId: "",
    sex: "",
    gelding: "",
    horseTypeId: "",
    isLocked: false,
    currencyId: "",
    totalPrizeMoneyEarned: "",
    isSexTouched: false,
  });

  const defaultValues = useMemo(
    () => ({
      horseName: currentHorse?.horseName || '',
      yob: currentHorse?.yob || '',
      dob: (currentHorse?.dob) || '',
      countryId: currentHorse?.countryId || 0,
      colourId: currentHorse?.colourId || 0,
      sex: currentHorse?.sex || "",
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
    formState: { isSubmitting, },
  } = methods;
  const values = watch();

  useEffect(() => {
    if (isEdit && currentHorse) {
      setCountryId(defaultValues.countryId);
      setYob(defaultValues.yob);
      setColourId(defaultValues.colourId);
      setSex(defaultValues.sex);
      setStateValue({
        ...state,
        horseName: defaultValues.horseName,
        totalPrizeMoneyEarned: defaultValues.totalPrizeMoneyEarned,
        yob: defaultValues.yob,
        ['isSexTouched']: defaultValues.sex ? true : false,
        ['sex']: defaultValues.sex,
        ['gelding']: currentHorse?.gelding ? currentHorse?.gelding : false,
      })
      setGelding(currentHorse.gelding);
      setHorseTypeId(defaultValues.horseTypeId);
      setCurrencyId(defaultValues.currencyId);
      setIsLocked(defaultValues.isLocked);
      setDateValue(defaultValues.dob);
      setIsGeldingDisable((defaultValues.sex === "F") ? true : false);
      reset(defaultValues);
      setShowDrawer(true)
    }
    if (!isEdit) {
      resetData();
      setDateValue(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentHorse]);

  // Reset state variable on close 
  const resetData = () => {
    setStateValue({
      id: "",
      horseName: '',
      yob: "",
      dob: "",
      countryId: "",
      colourId: "",
      sex: "",
      gelding: "",
      horseTypeId: "",
      isLocked: false,
      currencyId: "",
      totalPrizeMoneyEarned: "",
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
    if (state.gelding) {
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

  useEffect(() => {
    if (isEdit) {
      setNewHorseFormData({
        ...newHorseFormData,
        ['isLocked']: isLocked
      })
    }
  }, [isLocked])

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
    let finalData = (progenyId === 0) ? { ...data, sex: sex, yob: (!data?.yob) ? null : Number(yob), gelding: (sex === 'M' && gelding === 'true') ? true : false, dob: (!dateValue) ? null : dateValue, generation: parseInt(genId), totalPrizeMoneyEarned: Number(data.totalPrizeMoneyEarned) } : { ...data, sex: sex, yob: (!data?.yob) ? null : Number(yob), gelding: gelding, dob: (!dateValue) ? null : dateValue, generation: parseInt(genId), progenyId: parseInt(progenyId), totalPrizeMoneyEarned: Number(data.totalPrizeMoneyEarned) }
    let finalNewData = { ...data, sex: sex, yob: (!data?.yob) ? null : Number(yob), gelding: (sex === 'M' && gelding === 'true') ? true : false, dob: (!dateValue) ? null : dateValue, generation: parseInt(genId), totalPrizeMoneyEarned: Number(data.totalPrizeMoneyEarned) }

    // Replace the horseData element in the first array with the finalNewData object
    if (newHorsePedigreeData.length > 0 && newHorsePedigreeData[0].length > 0) {
      const horseData = newHorsePedigreeData[0][0].horseData;
      // Merge the replacementData object with the existing horseData, excluding the 'id' property
      newHorsePedigreeData[0][0].horseData = { ...horseData, ...finalNewData };
      // Remove the 'id' property if it exists
      delete newHorsePedigreeData[0][0].horseData.id;
    }

    const addNewHorseData = {
      batch: horseBatchUuid,
      data: newHorsePedigreeData
    }

    if (!validateForm(finalData)) return

    try {
      let res: any = !isEdit ? await addHorseWithPedigree(addNewHorseData) : await editHorse({ ...finalData, id: horseId });
      if (res?.data) {
        setApiStatusMsg({ 'status': 201, 'message': !isEdit ? '<b>Horse data created successfully!</b>' : '<b>Horse data updated successfully!</b>' });
        setApiStatus(true);
      }
      if (res?.error) {
        if (res?.error.status === 422 || res?.error.status === 500) {
          setApiStatusMsg({ 'status': res?.error.status, 'message': !isEdit ? '<b>There was a problem while creating the horse!</b>' : '<b>There was a problem while updating the horse!</b>' });
          setApiStatus(true);
        }
      }

      resetData();
      if (res?.data?.horseUuid) {
        setGenerationsArray([]);
        setNewHorsePedigreeData([]);
        // navigate(PATH_DASHBOARD.horsedetails.edit(res?.data?.horseUuid));
        setTimeout(() => {
          window.location.replace(PATH_DASHBOARD.horsedetails.data);
        }, 100)
        // navigate(PATH_DASHBOARD.horsedetails.data)
      }
    } catch (error) {
      resetData();
      console.error(error);
    }
  };

  const navigateToMemberList = (e: any, type: string) => {
    window.open((PATH_DASHBOARD.members.memberFilter({ horseId, favourite: type })), '_blank');
  }

  // Show or hide accordian
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

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

  // Open Horse name alias modal
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpenPopper((previousOpen) => !previousOpen);
    setIsNameAliasClicked(true);
    setIsCOBAliasClicked(false);
  };

  // Open Horse CoB alias modal
  const handleCoBClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpenPopper((previousOpen) => !previousOpen);
    setIsNameAliasClicked(false);
    setIsCOBAliasClicked(true);
  };

  let newState = {
    page: 1,
    limit: 2,
    order: "ASC"
  };

  // Horse name default alias api call 
  const { data: horseNameDefaultAliasList, isSuccess: isNameDefaultSuccess } = useHorseNameDefaultAliasQuery({ ...newState, horseId: horseId });

  // Horse CoB default alias api call
  const { data: horseCOBDefaultAliasList, isSuccess: isCoBDefaultSuccess } = useHorseCoBDefaultAliasQuery({ ...newState, horseId: horseId });
  const horseDefaultNameAlias = (isNameDefaultSuccess) ? horseNameDefaultAliasList?.horseName : "";
  const horseDefaultCoBAlias = (isCoBDefaultSuccess) ? horseCOBDefaultAliasList?.countryNames + "_" + horseCOBDefaultAliasList?.countryId : "";

  const canBeOpen = openPopper && Boolean(anchorEl);
  const popperId = canBeOpen ? 'simple-popper' : undefined;
  const hidePopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
    setOpenPopper(false);
  }


  const handleChangeDOB = (value: any) => {
    setDateValue(value);
    setStateValue({
      ...state,
      ['dob']: value
    })
    setNewHorseFormData({
      ...newHorseFormData,
      ['dob']: value
    })
  }

  // Check full year from date of birth and validate with YoB
  let isValidYear = (value: any) => {
    const dobYear: any = value && new Date(value).getFullYear();
    let yearOfBirth: any = Number(yob || state.yob);

    if (yearOfBirth === dobYear) {
      return true;
    } else {
      return false;
    }
  }

  const enterhorsename = [
    { label: 'Yarraman Park', year: 1994 },
    { label: 'Darley', year: 1972 },
    { label: 'Darley', year: 1974 },
  ];

  // Select box style
  const ITEM_HEIGHT = 35;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-1px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  }
  const [showDrawer, setShowDrawer] = React.useState<any>(false)
  const [countryId, setCountryId] = useState(
    currentHorse?.countryId === undefined ? "none" : currentHorse?.countryId > 0 ? currentHorse?.countryId : "none"
  );
  const [yob, setYob] = useState(
    currentHorse?.yob > 0 ? currentHorse?.yob : "none"
  );
  const [colourId, setColourId] = useState(
    currentHorse?.colourId > 0 ? currentHorse?.colourId : "none"
  );

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
    })
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

  useEffect(() => {
    setCurrencyId(currentHorse?.currencyId > 0 ? currentHorse?.currencyId : "none")
  }, [currentHorse])

  useEffect(() => {
    if (window.location.pathname === "/dashboard/horsedetails/data/new") {
      setShowDrawer(true)
    }
    if (showAddModal) {
      setShowDrawer(true)
    }
  }, [window.location.pathname, showAddModal])

  // Handle drawer close
  const handleDrawerClose = () => {
    setShowDrawer(false)
    toggleAddModal(false)
    resetData();
    if (window.location.pathname === "/dashboard/horsedetails/data/new") {
      navigate(PATH_DASHBOARD.horsedetails.data);
      resetData();
    }
  }

  // Delete horse api call
  const deleteHorse = async () => {
    const accessToken = localStorage.getItem("accessToken")
    var config: any = {
      method: 'patch',
      url: `${api.baseUrl}/horses/${horseId}/remove-horse`,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };

    await axios(config).then((res: any) => {
      if (res?.data) {
        setApiStatusMsg({ 'status': 201, 'message': "<b>Horse is deleted successfully</b>" });
        setApiStatus(true);
        setTimeout(() => {
          navigate(PATH_DASHBOARD.horsedetails.data);
        }, 2000)
      }
      if (res?.error) {
        setApiStatusMsg({ 'status': res?.error.status, 'message': res?.error.message || '<b>There was a problem updating the horse!</b>' });
        setApiStatus(true);
      }
    })
  }

  const [openMergeHorseWrapper, setOpenMergeHorseWrapper] = useState(false);
  // close Merge Horse Wrapper handler
  const handleCloseMergeHorseWrapper = () => {
    setOpenMergeHorseWrapper(false);
  };
  // open Merge Horse Wrapper handler
  const handleOpenMergeHorseWrapper = () => {
    if (!horseModuleAccess?.horse_merge) {
      setClickedPopover(true);
    } else {
      setOpenMergeHorseWrapper(true);
    }
  };

  const [isExist, setIsExist] = React.useState(false);
  const [stateMerge, setStateMerge] = useState({
    horseName: currentHorse?.horseName,
    horseId: horseId,
  });

  const [mergeHorseCustomResMesg, setMergeHorseCustomResMesg] = useState<any>({
    // heading: 'No Request',
    title: 'No Request',
    desc: 'No Request!'
  });

  const [stateMergeResponse, setStateMergeResponse] = useState({
    status: "Not Started",
    statusCode: 100,
    errorType: null,
    title: null
  });

  const [openMergeHorseResponseWrapper, setOpenMergeHorseResponseWrapper] = useState(false);
  const handleCloseMergeHorseResponseWrapper = () => {
    setMergeHorseCustomResMesg({
      // heading: 'No Request',
      title: 'No Request',
      desc: 'No Request!'
    });
    setStateMergeResponse({
      status: "Not Started",
      statusCode: 100,
      errorType: null,
      title: null
    })
    setOpenMergeHorseResponseWrapper(false);
  };


  // Farm Change handler
  const handleHorseChange = (val: any) => {
    const updatedData = { ...stateMerge, ...val };
    setStateMerge({ ...updatedData, isOpen: true });
  };

  const [existHorseList, setExistHorseList] = useState<any>([]);

  useEffect(() => {
    if (stateMergeResponse.statusCode === 422) {
      setMergeHorseCustomResMesg({
        // heading: 'Merge Requested',
        title: (stateMergeResponse.errorType === 'STALLION_EXISTS_ON_HORSE') ? stateMergeResponse.title : 'Request already initiated!',
        desc: stateMergeResponse.status
      })
      setOpenMergeHorseResponseWrapper(true);
    } else if (stateMergeResponse.statusCode === 200) {
      setMergeHorseCustomResMesg({
        // heading: 'Merge Requested',
        title: 'Horse Merge Initiated',
        desc: 'Horse merge request initiated. It will automatically processed shortly!'
      })
      setOpenMergeHorseResponseWrapper(true);
    }
  }, [stateMergeResponse])

  return (
    <StyledEngineProvider injectFirst >
      <div className='backArrowBtnwrapper' style={{ position: "relative", backgroundColor: "#e2e7e1" }}>
        <Typography
          variant='body2'
          className='backArrowBtn'
          onClick={() => setShowDrawer(true)}
          style={{
            background: "#e2e7e1",
            padding: "24px 20px",
            cursor: "pointer"
          }}
        >
          <i className='icon-filter-open' style={{ fontSize: "26px" }} />
        </Typography>
        <Drawer
          open={showDrawer}
          onClose={handleDrawerClose}
          sx={{
            width: showDrawer ? drawerWidth : 0,
            display: showDrawer ? "block" : "none",
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          className='filter-section horse-leftbar'
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

            <Box pt={2} className="edit-section">
              <form onSubmit={handleSubmit(onSubmit)}>
                <Box className='FormGroup'>
                  <Box className='userIconRight-wrap'>
                    <Box className='userIconRight'>
                      <TextField
                        {...register(`horseName`)}
                        error={errors.horseName ? true : false}
                        placeholder="Horse Name"
                        className="form-control edit-field"
                        value={toPascalCase(state.horseName)}
                        disabled={(isLocked === true && isEdit === true ? true : false)}
                        onChange={(e: any) => handleChangeField("horseName", e.target.value)} />
                      {isEdit && <Button aria-describedby={popperId} onClick={handleClick} className='alias-btn'>
                        <i className='user-ico-right' ><img src={Images.AliasIcon} alt="" /></i>
                      </Button>
                      }
                    </Box>
                    {/* <div className="errorMsg">{errors.horseName}</div> */}
                    {errors.horseName && <div className="errorMsg">{errors.horseName}</div>}
                  </Box>
                  <Box className='userIconRight'>
                    <Box className='edit-field'>
                      <Select
                        {...register(`countryId`)}
                        error={errors.countryId ? true : false}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        value={countryId}
                        onChange={(e: any) => { setCountryId(e.target.value); handleChangeField("countryId", e.target.value) }}
                        disabled={(isLocked === true && isEdit === true ? true : false)}
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
                      {isEdit && <Button aria-describedby={popperId} onClick={handleCoBClick} className='alias-btn'>
                        <i className='user-ico-right' ><img src={Images.AliasIcon} alt="" /></i>
                      </Button>
                      }
                      {errors.countryId && <div className="errorMsg">{errors.countryId}</div>}
                    </Box>

                  </Box>
                  <Box className='edit-field'>
                    <TextField {...register(`yob`)}
                      error={errors.yob ? true : false}
                      placeholder="Year of Birth"
                      className="form-control edit-field"
                      value={state.yob}
                      disabled={(isLocked === true && isEdit === true ? true : false)}
                      onChange={(e: any) => { setYob(e.target.value); handleChangeField("yob", e.target.value) }}
                    />
                    {errors.yob && <div className="errorMsg">{errors.yob}</div>}
                  </Box>
                  <Box className='edit-field'>
                    <Select
                      {...register(`colourId`)}
                      error={errors.colourId ? true : false}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      value={colourId}
                      disabled={(isLocked === true && isEdit === true ? true : false)}
                      onChange={(e: any) => { setColourId(e.target.value); handleChangeField("colourId", e.target.value) }}
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
                    <Box className='RadioGroupWrapper' mb={0} sx={{ paddingTop: '3px !important' }}>
                      <RadioGroup
                        {...register(`sex`)}
                        aria-labelledby="demo-radio-buttons-group-label"
                        value={sex}
                        name="radio-buttons-group"
                        sx={{ margin: '0px !important' }} className='RadioList gelding-display'
                        onChange={(e: any) => handleGenderChange(e)}
                      >
                        <FormControlLabel value="M" disabled={(isLocked === true && isEdit === true ? true : false)} control={<Radio checkedIcon={<img src={Images.Radiochecked} />} icon={<img src={Images.Radiounchecked} />} />} label="Male" />
                        <FormControlLabel value="F" disabled={(isLocked === true && isEdit === true ? true : false)} control={<Radio checkedIcon={<img src={Images.Radiochecked} />} icon={<img src={Images.Radiounchecked} />} />} label="Female" />
                      </RadioGroup>
                      <div className="errorMsg">{errors.sex}</div>
                    </Box>
                  </Box>
                  {!isGeldingDisable && <Accordion defaultExpanded={true} onChange={handleChange('panel1')} className="accordionDrawer" sx={{ mb: 1 }}>
                    <AccordionSummary
                      expandIcon={<KeyboardArrowDownRoundedIcon />}
                      aria-controls="panel4bh-content"
                      id="panel4bh-header"
                    >
                      <Typography variant="h4">Gelding</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box className='RadioGroupWrapper' mb={1} sx={{ paddingTop: '0px !important' }}>
                        <RadioGroup
                          {...register(`gelding`)}
                          aria-labelledby="demo-radio-buttons-group-label"
                          value={gelding}
                          name="radio-buttons-group"
                          sx={{ margin: '0px !important' }} className='RadioList gelding-display'
                          onChange={(e: any) => { setGelding(e.target.value); handleChangeField("gelding", e.target.value) }}
                        >
                          <FormControlLabel value={true} disabled={(isLocked === true && isEdit === true ? true : false)} control={<Radio checkedIcon={<img src={Images.Radiochecked} />} icon={<img src={Images.Radiounchecked} />} />} label="Yes" />
                          <FormControlLabel value={false} disabled={(isLocked === true && isEdit === true ? true : false)} control={<Radio checkedIcon={<img src={Images.Radiochecked} />} icon={<img src={Images.Radiounchecked} />} />} label="No" />
                        </RadioGroup>
                        <div className="errorMsg">{errors.gelding}</div>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                  }

                  <Accordion defaultExpanded={true} onChange={handleChange('panel2')} className="accordionDrawer advanced-horse">
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
                          IconComponent={KeyboardArrowDownRoundedIcon}
                          value={horseTypeId}
                          onChange={(e: any) => { setHorseTypeId(e.target.value); handleChangeField("horseTypeId", e.target.value) }}
                          disabled={(isLocked === true && isEdit === true ? true : false)}
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
                            disabled={(isLocked === true && isEdit === true ? true : false)}
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
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        value={currencyId}
                        onChange={(e: any) => { setCurrencyId(e.target.value); handleChangeField("currencyId", e.target.value) }}
                        disabled={(isLocked === true && isEdit === true ? true : false)}
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
                        disabled={(isLocked === true && isEdit === true ? true : false)}
                        inputProps={{
                          maxLength: 16, // Maximum length of 16 characters
                        }}
                      />
                      {errors?.prizemoney && <div className="errorMsg">{errors.prizemoney}</div>}
                    </AccordionDetails>
                  </Accordion>

                  {isEdit &&
                    <Accordion defaultExpanded={false} onChange={handleChange('panel4')} className="accordionDrawer information-horse-block">
                      <AccordionSummary
                        expandIcon={<KeyboardArrowDownRoundedIcon />}
                        aria-controls="panel4bh-content"
                        id="panel4bh-header"
                      >
                        <Typography variant="h4">Information</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography>Runs: <label>{currentHorse?.runs ? <u>{currentHorse?.runs}</u> : '--'}</label></Typography>
                        <Typography>Group 1 Wins: <label>{currentHorse?.group_1_wins ? <u>{currentHorse?.group_1_wins}</u> : '--'}</label></Typography>
                        <Typography>Group 2 Wins: <label>{currentHorse?.group_2_wins ? <u>{currentHorse?.group_2_wins}</u> : '--'}</label></Typography>
                        <Typography>Group 3 Wins: <label>{currentHorse?.group_3_wins ? <u>{currentHorse?.group_3_wins}</u> : '--'}</label></Typography>
                        <Typography>Listed Wins: <label>{currentHorse?.listedWins ? <u>{currentHorse?.listedWins}</u> : '--'}</label></Typography>
                        <Typography>Total Wins(Career): <label> {currentHorse?.totalWins ? <u>{currentHorse?.totalWins}</u> : '--'}</label></Typography>
                        <Typography>Created: <label>{currentHorse?.createdOn ? formatInTimeZone(new Date(currentHorse?.createdOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Created by: <label>{currentHorse?.createdBy ? currentHorse?.createdBy : '--'}</label></Typography>
                        <Typography>Verified: <label>{currentHorse?.verifiedOn ? formatInTimeZone(new Date(currentHorse?.verifiedOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Verified by: <label>{currentHorse?.verifiedBy ? currentHorse?.verifiedBy : '--'}</label></Typography>
                        <Typography>Last Updated: <label>{currentHorse?.modifiedOn ? formatInTimeZone(new Date(currentHorse?.modifiedOn), "Australia/Sydney", 'dd.MM.yyyy h:mma') : '--'}</label></Typography>
                        <Typography>Last Updated by: <label>{currentHorse?.modifiedBy ? currentHorse?.modifiedBy : '--'}</label></Typography>
                        <Typography>Eligibility: <label>{currentHorse?.eligibility ? 'Yes' : 'No'}</label></Typography>
                        <Typography>My Mares: <label>{currentHorse?.myMares ? <u onClick={(e) => navigateToMemberList(e, 'favMare')} style={{ cursor: 'pointer' }}>Yes</u> : 'No'}</label></Typography>
                        <Typography>Favourite Stallions: <label>{currentHorse?.favouriteStallion ? <u onClick={(e) => navigateToMemberList(e, 'favStallions')} style={{ cursor: 'pointer' }}>Yes</u> : 'No'}</label></Typography>
                        <Typography>Favourite Boodmare Sire: <label>{currentHorse?.favBroodmareSire ? <u onClick={(e) => navigateToMemberList(e, 'favBroodMare')} style={{ cursor: 'pointer' }}>Yes</u> : 'No'}</label></Typography>
                        <Typography>Horse ID: <label><u>{currentHorse?.id ? currentHorse?.id : '--'}</u></label></Typography>
                      </AccordionDetails>
                    </Accordion>
                  }
                </Box>

                <Stack sx={{ mt: 3 }} className='DrawerBtnWrapper'>
                  <LoadingButton className='search-btn' type="submit" disabled={!isEdit ? isNotSireAndDam : false} variant="contained" loading={isSubmitting}>
                    {!isEdit ? 'Save' : 'Save'}
                  </LoadingButton>

                  <Grid container spacing={1.5} className='DrawerBtnBottom'>
                    <Grid item xs={6} md={6} sx={{ paddingTop: '12px !important' }}>
                      <Button fullWidth type='button' disabled={(isLocked === true && isEdit === true ? true : false) || (!isEdit ? true : false)} className='search-btn' onClick={handleOpenMergeHorseWrapper}>Merge</Button>
                    </Grid>
                    {/* <Grid item xs={6} md={6} sx={{ paddingTop: '12px !important' }}>
                      <Button fullWidth type='button' disabled={!isEdit ? true : false} className='add-btn' onClick={deleteHorse}>Delete</Button>
                    </Grid> */}
                  </Grid>
                </Stack>
              </form>
            </Box>
          </Scrollbar>
        </Drawer>
        {/* Horse name alis modal           */}
        <HorseNameAlias
          popperId={popperId}
          openPopper={openPopper}
          hidePopover={hidePopover}
          enterhorsename={enterhorsename}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          horseId={horseId}
          isNameAliasClicked={isNameAliasClicked}
          setIsNameAliasClicked={setIsNameAliasClicked}
          isCOBAliasClicked={isCOBAliasClicked}
          setIsCOBAliasClicked={setIsCOBAliasClicked}
          countryId={state?.countryId ? state?.countryId : currentHorse?.countryId}
          horseDefaultNameAlias={horseDefaultNameAlias}
          horseDefaultCoBAlias={horseDefaultCoBAlias}
          horseModuleAccess={horseModuleAccess}
          setHorseModuleAccess={setHorseModuleAccess}
          clickedPopover={clickedPopover}
          setClickedPopover={setClickedPopover}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
        />
        {/* Merge Horse Wrapper Dialog */}
        {currentHorse && <MergeHorseWrapper
          title="Please Confirm Action"
          open={openMergeHorseWrapper}
          close={handleCloseMergeHorseWrapper}
          stateMerge={stateMerge}
          setStateMerge={setStateMerge}
          pageType={'horseMerge'}
          setHorseId={handleHorseChange}
          horseName={stateMerge}
          state={state}
          setStateValue={setStateValue}
          horseId={horseId}
          currentHorse={currentHorse}
          existingHorseList={existHorseList}
          setExistingHorseList={setExistHorseList}
          isEdit={isEdit}
          isExist={isExist}
          stateMergeResponse={stateMergeResponse}
          setStateMergeResponse={setStateMergeResponse}
        />}
        <MergeHorseResponseWrapper
          title="Merge Response"
          open={openMergeHorseResponseWrapper}
          close={handleCloseMergeHorseResponseWrapper}
          contents={mergeHorseCustomResMesg}
        />
      </div>
    </StyledEngineProvider>
  );
}

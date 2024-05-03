import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
// @mui
import { LoadingButton } from '@mui/lab';
import { range } from 'src/utils/formatYear';
// redux
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import {
  useStallionQuery,
  useAddStallionMutation,
  useEditStallionMutation,
  useStallionProfileImageUploadMutation,
} from 'src/redux/splitEndpoints/stallionsSplit';
import { useFeestatusQuery } from 'src/redux/splitEndpoints/feestatusSplit';
import { useRetiredReasonQuery } from 'src/redux/splitEndpoints/retiredReasonSplit';
import { useSnackbar } from 'notistack';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import 'src/sections/@dashboard/css/filter.css';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { Images } from 'src/assets/images';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  StyledEngineProvider,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { v4 as uuid } from 'uuid';
import FarmAutoFilter from 'src/components/FarmAutoFilter';
import HorseAutoFilter from 'src/components/HorseAutoFilter';
import StallionHorseAutoFilter from 'src/components/StallionHorseAutoFilter';
import { PromoteStallionWrapperDialog } from 'src/components/stallion-modal/PromoteStallionWrapper';
import { StallionConfirmWrapperDialog } from 'src/components/stallion-modal/StallionConfirmWrapper';
import { getStallionById, getStateById, createStallion, updateStallion } from 'src/redux/splitEndpoints/stallionServiceSplit';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import { useUploadMediaStatusMutation } from 'src/redux/splitEndpoints/mediaSplit';
import CustomDropzoneProfileImage from 'src/components/CustomDropzoneProfileImage';
import CropImageDialogSimple from 'src/components/CropImageDialogSimple';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

const drawerWidth = 364;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function StallionNewEditModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    Reset, setReset,
    apiStatus, setApiStatus, 
    apiStatusMsg, setApiStatusMsg, 
    getStallionDetails, getStallionList,
    valuesExist, setValuesExist
  } = props;

  // initial state of userModuleAccessAddBtn
  const [stallionModuleAccessAddBtn, setStallionModuleAccessAddBtn] = useState({
    stallion_add: false,
    stallion_edit: false,
    stallion_feehistory: false,
  });
  // call on valuesExist
  React.useEffect(() => {
    setStallionModuleAccessAddBtn({
      ...stallionModuleAccessAddBtn,
      stallion_add: !valuesExist?.hasOwnProperty('STALLION_ADMIN_CREATE_A_NEW_STALLION') ? false : true,
      stallion_edit: !valuesExist?.hasOwnProperty('STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION') ? false : true,
      stallion_feehistory: !valuesExist?.hasOwnProperty('STALLION_ADMIN_VIEW_SHARE_FEE_HISTORY') ? false : true,
    });
  }, [valuesExist]);

  // Get stallion info api call by stallion id as payload
  const { data: stallionDataById, error, isFetching, isLoading, isSuccess } = useStallionQuery(rowId, { skip: (!isEdit), refetchOnMountOrArgChange: true });
  const currentStallion = stallionDataById;
  const galleryResolution = { height: 1280, width: 1920 };
  const [errors, setErrors] = React.useState<any>({});

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [isExist, setIsExist] = React.useState(false);
  const [currentFarm, setCurrentFarm] = React.useState(currentStallion);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isPromoted, setIsPromoted] = React.useState(
    currentFarm?.isPromoted === true ? true : false
  );

  // Create a state variable to capture edit info or form element info for post or patch call
  const [state, setStateValue] = useState({
    id: "",
    farmName: "",
    farmId: "",
    horseName: "",
    horseId: "",
    countryId: "",
    currencyId: "",
    reasonId: "",
    isPrivateFee: "",
    fee: "",
    height: "",
    feeYear: "",
    profileImageuuid: null,
    startDate: "",
    stateId: "",
    yearToStud: "",
    yearToRetired: "",
    isActive: false,
    isPromoted: false,
    isPromotionUpdated: false
  })
  const [isStudFeeUpdated, setIsStudFeeUpdated] = useState(false);
  const [startDate, setStartDate] = React.useState(
    !isEdit || currentFarm?.startDate === null ? '' : parseDate(currentFarm?.startDate)
  );
  const [horseError, setHorseError] = useState({
    hName: "",
    farm: ""
  });
  const [cropImageFile, setCropImageFile] = useState<any>('');
  const [imageEditFile, setImageEditFile] = useState<any>(undefined);
  const [cropPrevImg, setCropPrevImg] = useState<any>();
  const [openEditImageDialog, setOpenEditImageDialog] = useState<any>(false);
  const [mediaFile, setMediaFile] = useState<any>();
  const [presignedMediaPath, setPresignedMediaPath] = useState<any>();
  const [mediaImagePreview, setMediaImagePreview] = useState<any>();
  const [mediaImageFile, setMediaImageFile] = useState<any>();
  const inputFile = React.useRef<any>({});

  const navigate = useNavigate();

  // Close the stallion drawer
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  // Close the stallion drawer
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
    removeFileExisting('clear');
  };

  // Format the date
  function parseDate(dateToParse: string) {
    let parsedDate = new Date(dateToParse);
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }

  const theme = useTheme();

  // Post stallion api call
  const [addStallion, addStallionResult] = useAddStallionMutation<any>();

  // Patch stallion api call
  const [editStallion, responseEditStallion] = useEditStallionMutation();
  const { data: countriesList } = useCountriesQuery();
  const { data: currencyList } = useCurrenciesQuery();
  const { data: feeStatusList } = useFeestatusQuery();
  const { data: retiredReasonList } = useRetiredReasonQuery();
  const currentYear: number = new Date().getFullYear();
  const yearsRange: number[] = [];
  for (let year = 2000; year <= currentYear + 1; year++) {
    yearsRange.push(year);
  }
  // const yob = range(2000, new Date().getFullYear());
  const [yob, setYob] = useState<any>(0);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Update the state variable
  const handleDefaultValues = () => {
    getStates(currentStallion?.countryId)
    setStateValue({
      ...state,
      horseName: currentStallion?.horseName,
      farmName: currentStallion?.farmName,
      farmId: currentStallion?.farmId,
      horseId: currentStallion?.horseId,
      countryId: currentStallion?.countryId > 0 ? currentStallion?.countryId : 0,
      stateId: currentStallion?.stateId,
      id: currentStallion?.id,
      isPromoted: currentStallion?.isPromoted,
      isActive: currentStallion?.isActive,
      feeYear: currentStallion?.feeYear,
      currencyId: currentStallion?.currencyId,
      fee: currentStallion?.fee?.toLocaleString(),
      isPrivateFee: (currentStallion?.isPrivateFee) ? "1" : "0",
      height: currentStallion?.height,
      yearToStud: currentStallion?.yearToStud,
      yearToRetired: currentStallion?.yearToRetired,
      reasonId: currentStallion?.reasonId > 0 ? currentStallion?.reasonId : "",
      isPromotionUpdated: currentStallion?.isPromotionUpdated
    })
    setIsStudFeeUpdated(false);
    setYob(currentStallion?.yob);
    setImageEditFile(currentStallion?.profilePic ? currentStallion?.profilePic : undefined);
  }

  React.useEffect(() => {
    if (isEdit && currentStallion) {
      handleDefaultValues();
    }
    if (!isEdit) {
      resetData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentStallion]);

  const [isClosed, setIsClosed] = useState(false);

  // Reset the state variable
  const resetData = () => {
    setStateValue({
      id: "",
      farmName: "",
      farmId: "",
      horseName: "",
      horseId: "",
      countryId: "",
      currencyId: "",
      reasonId: "",
      isPrivateFee: "",
      fee: "",
      height: "",
      feeYear: "",
      profileImageuuid: null,
      startDate: "",
      stateId: "",
      yearToStud: "",
      yearToRetired: "",
      isActive: false,
      isPromoted: false,
      isPromotionUpdated: false
    })
    setErrors({})
    setExpanded(false)
    setIsStudFeeUpdated(false);
    setImageEditFile(undefined);
  }

  // Reset and close the stallion modal 
  const handleResetAndClose = () => {
    resetData();
    handleDrawerCloseRow();
    setIsClosed(true);
    removeFileExisting('clear');
  };

  const [fileUpload, setFileUpload] = useState<any>();
  // const fileDetails = currentStallion?.profilePic ? currentStallion?.profilePic : null;
  // const heroImages = {
  //   setFileUpload,
  //   fileDetails,
  //   Reset
  // };
  const fileuuid: any = uuid();

  // Post stallion profile image api call
  const [setHeroImagesStallion] = useStallionProfileImageUploadMutation();

  // Get stallion profile image status api call
  const [uploadMediaStatus] = useUploadMediaStatusMutation();
  const [uploadInProgress, setUploadInProgress] = useState<any>(false);
  let [galleryImages, setGalleryImages] = useState<any>([]);
  const [presignedProfilePath, setPresignedProfilePath] = useState<any>();
  const [profileImageFile, setProfileImageFile] = useState<any>();
  const [isProfileDeleted, setIsProfileDeleted] = useState(false);

  // Check if image is uploaded or deleted
  // useEffect(() => {
  //   if (fileUpload && fileUpload.isDeleted) {
  //     setIsProfileDeleted(true);
  //   }
  //   if (fileUpload && !fileUpload.isDeleted && fileUpload.path && fileUpload.size) {
  //     try {
  //       setHeroImages({
  //         fileName: fileUpload.path,
  //         fileuuid: fileuuid,
  //         fileSize: fileUpload.size,

  //       }).then(async (res: any) => {
  //         const details = { fileUpload, fileuuid };
  //         setProfileImageFile(details);
  //         setPresignedProfilePath(res.data.url);
  //       });
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  // }, [fileUpload]);

  // Convert the date
  function convert(str: any) {
    var date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join('-');
  }

  const [existStallionList, setExistStallionList] = useState<any>([]);
  const [existStallionOpen, setExistStallionOpen] = useState(false);
  const [createStallionData, setCreateStallionData] = useState({});
  const [forceCreateNew, setForceCreateNew] = useState(false);
  const [stateList, setStateList] = useState<any>([]);

  // Check after stallion is exist or not after post call
  useEffect(() => {
    if (addStallionResult?.data !== undefined) {
      if (addStallionResult && addStallionResult?.data?.message === 'CONFLICT_ERROR') {
        setExistStallionOpen(true);
        setForceCreateNew(true);
        setExistStallionList(addStallionResult?.data?.data);
      }
    }
  }, [addStallionResult]);

  useEffect(() => {
    if (responseEditStallion.isError) {
      let isError: any = responseEditStallion;
      setApiStatusMsg({ 'status': 422, 'message': `${isError?.error?.data?.message}` });
      setApiStatus(true);
    }
  }, [responseEditStallion]);

  // Post or patch api call based on save button clicked
  const onSubmit = async (event: any) => {
    event.preventDefault();
    if (!validateForm()) return
    try {
      setLoading(true);
      let stallionHorseId = state?.horseId ? state?.horseId : currentFarm?.horseId
      let haveName = !!stallionHorseId == true ? true : false;

      if (haveName) {
        setHorseError({ ...horseError, hName: "" })
      } else {
        setHorseError({ ...horseError, hName: "isHorseError" })
      }

      let stallionfarmId = state?.farmId ? state?.farmId : currentFarm?.farmId
      if (stallionfarmId) {
        setHorseError({ ...horseError, farm: "" })
      } else {
        setHorseError({ ...horseError, farm: "isFarmError" })
      }

      const statDate = startDate !== null ? convert(startDate) : null;

      const finalData = {
        countryId: parseInt(state?.countryId),
        currencyId: parseInt(state?.currencyId),
        reasonId: parseInt(state?.reasonId),
        isPrivateFee: (state?.isPrivateFee.toString() === "1") ? true : false,
        fee: parseFloat(state?.fee.split(',').join('')),
        height: state?.height,
        feeYear: Number(state?.feeYear),
        profileImageuuid: (presignedProfilePath !== "" && profileImageFile?.fileuuid) ? profileImageFile?.fileuuid : null,
        isProfileImageDeleted: isProfileDeleted,
        farmId: state.farmId ? state.farmId : null,
        horseId: state.horseId,
        startDate: state.startDate,
        stateId: parseInt(state?.stateId),
        isPromoted: state.isPromoted,
        isActive: state.isActive,
        yearToRetired: state.yearToRetired,
        yearToStud: state.yearToStud,
        isStudFeeUpdated: isStudFeeUpdated,
        isPromotionUpdated: state.isPromotionUpdated
      };
      setCreateStallionData(finalData);

      let response =
        isEdit
          ?
          await editStallion({ ...finalData, id: rowId })
          :
          await addStallion({ ...finalData, forceCreateNew: forceCreateNew });


      if (addStallionResult && addStallionResult.message === 'CONFLICT_ERROR') {
        setExistStallionOpen(true);
        setForceCreateNew(true);
        setExistStallionList(addStallionResult?.data);
      } else {
        //@ts-ignore      
        if (response.status == '200' || response.status == '201' || response?.data?.status == '200') {  //@ts-ignore
          // PUT request for image upload
          if (profileImageFile) {
            const uploadOptions = { method: 'Put', body: cropImageFile }
            const result = await fetch(presignedProfilePath, uploadOptions);
          }
          // Check and validate the s3 for image upload
          // if (presignedProfilePath !== "" && profileImageFile?.fileuuid) {
          // uploadMediaStatus([profileImageFile?.fileuuid]);
          let count = 1;
          const interval = setInterval(async () => {
            if (count >= 1) {
              let data: any = await uploadMediaStatus([profileImageFile?.fileuuid]);
              if (data.error.data != 'SUCCESS') {
                count++;
                if (count === 10) {
                  clearInterval(interval);
                }
              } else {
                count = 0;
                setUploadInProgress(false);
              }
            }
          }, 3000);
          // }
          setApiStatusMsg({ 'status': 201, 'message': !isEdit ? '<b>Stallion data created successfully!</b>' : '<b>Stallion data updated successfully!</b>' });
          setApiStatus(true);
          (isEdit) ? handleCloseModal() : handleResetAndClose();
          resetData();
          handleResetAndClose();
          setIsProfileDeleted(false);
        } else {    //@ts-ignore
          setApiStatusMsg({ 'status': 422, 'message': `${Object.values(response?.error?.data?.errors)}` });
          setApiStatus(true);
        }
      }
    } catch (error) {
      setLoading(false);
      // resetData();
    } finally {
      setLoading(false);
      // resetData();
    }
  };

  const [isCountrySelected, setIsCountrySelected] = useState(
    currentFarm?.countryId > 0 ? true : false
  );

  useEffect(() => {
    setIsCountrySelected(currentFarm?.countryId > 0 ? true : false);
    getStates(currentFarm?.countryId || state?.countryId)
  }, [currentFarm?.countryId || state?.countryId]);

  useEffect(() => {
    let temp = { ...errors }
    if (state.horseId) {
      delete temp.horseId;
    }
    if (state.farmId) {
      delete temp.farmId;
    }
    if (state.countryId) {
      delete temp.countryId;
    }
    if (state.currencyId) {
      delete temp.currencyId;
    }
    if (state.fee) {
      delete temp.fee;
    }
    if (state.isPrivateFee !== 'none') {
      delete temp.isPrivateFee;
    }
    if (state.height) {
      delete temp.height;
    }
    if (state.feeYear) {
      delete temp.feeYear;
    }
    if (state.yearToStud) {
      delete temp.yearToStud;
    }
    if (state.feeYear) {
      delete temp.feeYear;
    }
    setErrors(temp)
  }, [state]);

  const [openPromoteStallionWrapper, setOpenPromoteStallionWrapper] = useState(false);
  const handleClosePromoteStallionWrapper = () => {
    setIsPromoted(false);
    setStartDate('');
    setOpenPromoteStallionWrapper(false);
  };  

  // Check the  form element once value is inserted or updated, update the state variable
  const handleChangeField = (type: any, targetValue: any) => {
    if (type == 'yearToRetired') {
      setStateValue({
        ...state,
        yearToRetired: targetValue,
        isActive: targetValue <= currentYear ? false : true
      })
    }
    else if (type == 'isPrivateFee') {
      setStateValue({
        ...state,
        isPrivateFee: targetValue
      })
    } else {
      setStateValue({
        ...state,
        [type]: targetValue
      })
    }
    if (type == 'fee') {
      const formatNumberCommas = parseInt(targetValue.replace(/,/g, '')).toLocaleString('en-US');
      setStateValue({
        ...state,
        [type]: targetValue ? formatNumberCommas : targetValue
      })
    }

    if (type == 'countryId') {
      getStates(targetValue);
      setStateValue({
        ...state,
        [type]: targetValue,
        stateId: 'none'
      })
    }
    else {
      setStateValue({
        ...state,
        [type]: targetValue
      })
    }

    if (type === "feeYear" || type === "currencyId" || type === "fee" || type === "isPrivateFee") {
      setIsStudFeeUpdated(true);
    }


    if (type == 'height') {
      let newValue = targetValue.replace(/[^0-9.-\s/]/g, '');
      // Restrict input to max four characters
      if (newValue.length > 8) {
        newValue = newValue.slice(0, 8);
      }
      // Add decimal point after the first two characters
      if (newValue.length === 3 && newValue.indexOf('.') === -1) {
        newValue = newValue.slice(0, 2) + '.' + newValue.slice(2);
      }
      if (newValue.length === 5 && newValue.indexOf(' ') === -1) {
        newValue = newValue.slice(0, 4) + ' ' + newValue.slice(4)
      }
      if (newValue.length === 7 && newValue.indexOf('/') === -1) {
        newValue = newValue.slice(0, 6) + '/' + newValue.slice(6)
      }      

      setStateValue({
        ...state,
        [type]: targetValue ? newValue : targetValue
      })
    }
  }

  // Close the exist stallion modal
  const handleCloseExistStallionWrapper = () => {
    setExistStallionOpen(false);
  };

  // Get the stallion by id
  const getStallionId = async (id: any) => {
    let res = await getStallionById(id);
    if (res) {
      setIsExist(true) // @ts-ignore
      getStates(res?.countryId)// @ts-ignore
      setStateValue(res) // @ts-ignore
    }
  }

  // Get the state by country id
  const getStates = async (id: any) => {
    let res = await getStateById(id);
    if (res) {
      setStateList(res)
    }
  }

  // set the farm id in state variable
  const handleFarmChange = (val: any) => {
    const updatedData = { ...state, ...val }
    setStateValue(updatedData);
  }

  // set the isPromoted in state variable
  const handlePromoteChange = (val: any) => {
    setStateValue({
      ...state,
      isPromotionUpdated: true,
      isPromoted: val.value !== 'true' ? true : false
    })
    if (val.value !== 'true') {
      setIsPromoted(true);
      setOpenPromoteStallionWrapper(true);
    }
  }

  // set the isActive in state variable
  const handleActiveChange = (val: any) => {
    setStateValue({
      ...state,
      isActive: (state?.yearToRetired && Number(state?.yearToRetired) <= currentYear) ? false : val.value !== 'true' ? true : false
    })
  }

  // set the startDate in state variable
  const handleStartDateChange = (val: any) => {
    setStateValue({
      ...state,
      startDate: val
    })
  }

  // Style for dropdown
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
  
  // Validate the form once user clicks the submit button
  let validateForm = () => {
    /*eslint-disable */
    let fields = state;
    let errors = {};
    let formIsValid = true;
    //@ts-ignore
    if (!fields["horseId"]) {
      formIsValid = false;  //@ts-ignore
      errors["horseId"] = `Horse required`;
    }
    if (!fields["farmId"]) {
      formIsValid = false; //@ts-ignore
      errors["farmId"] = `Farm required`;
    }
    if (!fields["countryId"]) {
      formIsValid = false;  //@ts-ignore
      errors["countryId"] = `Country required`;
    }
    if (!fields["countryId"]) {
      formIsValid = false;  //@ts-ignore
      errors["countryId"] = `Country required`;
    }
    if (!fields["currencyId"]) {
      formIsValid = false;  //@ts-ignore
      errors["currencyId"] = `Currency required`;
    }
    if (!fields["fee"]) {
      formIsValid = false;  //@ts-ignore
      errors["fee"] = `Service fee required`;
    }
    if (fields["isPrivateFee"] === '') {
      formIsValid = false;  //@ts-ignore
      errors["isPrivateFee"] = `Fee Status required`;
    }

    if (!fields["height"]) {
      formIsValid = false;  //@ts-ignore
      errors["height"] = `Height required`;
    } else {
      const heightValue = parseFloat(fields["height"]);
      if (isNaN(heightValue)) {
        formIsValid = false;  //@ts-ignore
        errors["height"] = `Invalid height value`;
      } else if (heightValue < 12 || heightValue > 20) {
        formIsValid = false;  //@ts-ignore
        errors["height"] = `Must be between 12hh - 20hh`;
      }
    }

    if (!fields["yearToStud"]) {
      formIsValid = false;  //@ts-ignore
      errors["yearToStud"] = `Year required`;
    }else if(state?.yearToStud < yob){
      formIsValid = false; //@ts-ignore
      errors["yearToStud"] = `Please Enter Valid Year to Stud.`;
    }

    if (!fields["feeYear"]) {
      formIsValid = false;  //@ts-ignore
      errors["feeYear"] = `Year required`;
    }

    if (stateList?.length > 0) {
      if (state?.stateId === 'none') {
        formIsValid = false; //@ts-ignore
        errors['stateId'] = `State is required`;
      }
    }

    setErrors(errors)
    return formIsValid
    /*eslint-enable */
  }

  const [clickedPopover, setClickedPopover] = useState(false);
  // Navigate to the stud fee history if user clicks on graph
  const handleStallionFeeHistory = () => {
    if (stallionModuleAccessAddBtn?.stallion_feehistory === false) {
      setClickedPopover(true);
    } else { 
      handleCloseModal();
      navigate(PATH_DASHBOARD.stallions.feehistory(rowId));
    }
  };

  // Navigate to the farm profile page if user clicks on Promoted
  const BaseAPI = process.env.REACT_APP_PUBLIC_URL;
  const handlePromotoStallionUrl = () => {
    window.open(`${BaseAPI}stallions/${currentStallion.horseName}/${rowId}/View`, '_blank');
  }
  const openModal = open ? open : openAddEditForm ? openAddEditForm : false

  // Navigate to the member page if farm is choosen or available in edit
  const handleMemberFarm = () => {
    window.open(PATH_DASHBOARD.members.filter(state.farmId), '_blank');
  }

  //-------- cropping functionality --------
  const onChangeFile = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    const imageFormats = ['jpg', 'jpeg', 'png'];
    var file = event.target.files[0];
    // setMediaImagePreviewIndex(i);
    const type = file.type.split('/')[1];

    if (file.size < 10000000) {
      validateResolution(file);
    } else {
      alert('File size exceeded. Maximum upload file size is 10MB');
      // toast.error('File size exceeded. Maximum upload file size is 10MB');
    }
  }

  const validateResolution = (file: any) => {
    //Read the contents of Image File.

    var reader = new FileReader();
    var flag = '';
    reader.readAsDataURL(file);
    reader.onload = function (e: any) {
      //Initiate the JavaScript Image object.
      var image = new Image();

      //Set the Base64 string return from FileReader as source.
      image.src = e.target.result;

      //Validate the File Height and Width.
      image.onload = function (this: any) {
        var height = this.height;
        var width = this.width;
        setMediaFile(file);
        const details = { file, fileuuid }
        // setPresignedMediaPath(res.data.url);
        // { height: 1280, width: 1920 }
        if (height > 126 && width > 189) {
          setMediaImageFile(details);
          // setIsMediaUploaded(true);
          setMediaImagePreview(URL.createObjectURL(file));
          callProfileAPI(file);
        } else {
          alert(`The image dimensions must be at least 189px*126px.`)
        }
      };
    }
  }

  useEffect(() => {
    if (mediaFile != undefined) {
      setOpenEditImageDialog(true);
    };
    // if(mediaFile === undefined) {
    //   setIsProfileDeleted(true);
    // }
  }, [mediaFile])

  const callProfileAPI = (file: any) => {
    try {
      setHeroImagesStallion({
        fileName: file.name,
        fileuuid: fileuuid,
        fileSize: file.size,
      }).then(async (res: any) => {
        const details = { file, fileuuid };
        setProfileImageFile(details);
        setPresignedProfilePath(res.data.url);
      });
    } catch (error) {
      console.error(error);
    }
  }

  const profileMediaUpload = async () => {
    if (inputFile) {
      inputFile?.current?.click();
    }
  }

  // clear the selected file after closing crop modal
  useEffect(() => {
    if (openEditImageDialog === false) {
      if (isEdit) {
        if ((cropImageFile === '' || cropImageFile === undefined) && currentStallion?.profilePic === undefined) {          
          removeFileExisting('clear');
        }
      } else {
        if (openAddEditForm === false || cropImageFile === '' || cropImageFile === undefined) {          
          removeFileExisting('clear');
        }
      }
    }
  }, [openEditImageDialog]);

  const removeFileExisting = (type: string) => {
    setMediaFile(undefined);
    setCropImageFile(undefined);
    setCropPrevImg(undefined);
    setImageEditFile(undefined);
    if (type === 'remove') {
      setIsProfileDeleted(true);
    }
  }
  
  return (
    <StyledEngineProvider injectFirst>
      <Drawer
        sx={{
          width: (isEdit && openModal) ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: openModal ? drawerWidth : 0,
            height: '100vh',
            // overflow: 'scroll',
            background: '#E2E7E1',
          },

          '.MuiInputBase-root-MuiOutlinedInput-root': {
            height: 'auto !important',
          },
        }}
        variant="persistent"
        anchor="right"
        open={openModal}
        className="DrawerRightModal stallion-rightbar"
      >
        <Scrollbar
          className="DrawerModalScroll"
          sx={{
            width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: open || openAddEditForm ? drawerWidth : 0,
              height: '100vh',
              background: '#E2E7E1',
            },
          }}
        >
          <CssBaseline />
          <DrawerHeader>
            <IconButton
              className="closeBtn"
              onClick={isEdit ? handleCloseModal : handleResetAndClose}
            >
              <i style={{ color: '#161716' }} className="icon-Cross" />
            </IconButton>
          </DrawerHeader>
          {isEdit === false && stallionModuleAccessAddBtn.stallion_add === false && <UnAuthorized />}
          {isEdit === true && stallionModuleAccessAddBtn.stallion_edit === false && <UnAuthorized />}
          {((isSuccess && stallionModuleAccessAddBtn.stallion_edit === true) || (isEdit === false && stallionModuleAccessAddBtn.stallion_add === true)) && (
            <Box px={5} className="edit-section">
              <form onSubmit={onSubmit}>
                <Box px={0}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={12} className="addphoto-drag">
                      <Box className="add-photo">
                        <Box className="cropped-image-stallion">
                          {/* Cropping imag */}
                          {(cropPrevImg || imageEditFile) && <i className="icon-Incorrect" onClick={(e) => removeFileExisting('remove')} />}
                          {(cropPrevImg || imageEditFile) &&
                            <Box className="hero-pic" key={imageEditFile?.fileName}>
                              {/* <i className="icon-Incorrect" onClick={(e) => removeFile()} /> */}
                              {isEdit === true && isFetching === false && <img src={cropPrevImg || `${imageEditFile}?w=126&h=126`} alt={"Cropped Media"}/>
                              }
                              {(isEdit === false || isEdit === undefined) && <img src={cropPrevImg || `${imageEditFile}?w=126&h=126`} alt={"Cropped Media"}/>
                              }
                            </Box>
                          }
                        </Box>
                        {
                          <><Box className="draganddrop-farms" sx={{ height: '136px' }} onClick={profileMediaUpload}>
                            <input
                              type='file'
                              id='file'
                              ref={inputFile}
                              style={{ display: 'none' }}
                              onChange={(e: any) => onChangeFile(e)}
                              onClick={(event: any) => {
                                event.target.value = null;

                              }}
                            />
                            <img src={Images.uploadicon} alt="Photograph" />
                            <Typography variant="h6">
                              Drag and drop your images here
                            </Typography>
                            <span>
                              or <a href="#">upload</a> from your computer
                            </span></Box></>
                        }
                        {/* <CustomDropzoneProfileImage data={heroImages} galleryResolution={galleryResolution} isStallion={true} /> */}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={12}>
                      <Box>
                        <Box className="FormGroup">
                          <Typography variant="h4" mt={0} sx={{ mb: 0.5 }}>
                            Stallion Details{' '}
                          </Typography>
                          <Box className="edit-field horseDropdown">
                            <StallionHorseAutoFilter
                              disablePortal
                              validateForm={validateForm}
                              setHorseId={(id: string) => {
                                setStateValue({
                                  ...state,
                                  horseId: id
                                })
                              }}
                              horseName={state}
                              setYob={setYob}
                              currentStallion={currentStallion}
                              setHorseName={(name: string) => {
                                setStateValue({
                                  ...state,
                                  horseName: name
                                })
                              }}
                              sex={'M'}
                              isEdit={isEdit}
                              isExist={isExist}
                              isOpen={open || openAddEditForm}
                              className={errors.horseId ? 'Mui-error' : ''}
                            />
                            {errors.horseId && <div className="errorMsg">{errors.horseId}</div>}
                          </Box>
                          <Box className="userIconRight">
                            <Box className="edit-field matchcasetext">
                              <FarmAutoFilter
                                setFarmId={handleFarmChange}
                                farmName={state}
                                setStateValueId={(value: any) => setStateValue({ ...state, stateId: value })}
                                pageType={'stallionForm'}
                                isEdit={isEdit}
                                isExist={isExist}
                                isOpen={open || openAddEditForm}
                                className={errors.farmId ? 'Mui-error' : ''}
                              />
                              <div className="errorMsg">{errors.farmId}</div>
                              {state?.farmId && <i className="user-ico-right" style={{ cursor: 'pointer' }} onClick={handleMemberFarm}>
                                <img src={Images.User} alt="" />
                              </i>}
                              {!state?.farmId && <i className="user-ico-right">
                                <img src={Images.userfillgray} alt="" />
                              </i>}
                            </Box>
                          </Box>

                          <Box className='switch-container' my={0}>
                            <div className='swith-container'>
                              <Typography variant="h4" sx={{ mb: 0.5 }}>
                                Promoted {(isEdit && state.isPromoted) && <i style={{ color: '#007142', fontSize: '24px', marginLeft: '8px' }} className='icon-Link-green' onClick={handlePromotoStallionUrl} />}
                              </Typography>
                              <label className="switch">
                                <input type="checkbox" checked={state.isPromoted} name='isPromoted' value={state.isPromoted ? 'true' : 'false'} onChange={(e) => handlePromoteChange(e.target)} />
                                <span className="slider round"></span>
                              </label>
                            </div>

                            <div className='swith-container'>
                              <Typography variant="h4" sx={{ mb: 0.5 }}>
                                Active{' '}
                              </Typography>
                              <label className="switch">
                                <input type="checkbox" checked={state.isActive} name='isActive' value={state.isActive ? 'true' : 'false'} onChange={(e) => handleActiveChange(e.target)} />
                                <span className="slider round"></span>
                              </label>
                            </div>
                          </Box>

                          <Box className="FormGroup" >
                            <Typography variant="h4" sx={{ mb: 1 }}>
                              Location{' '}
                            </Typography>
                            <Box className='edit-field scroll-lock-country'>
                              <Select
                                name="countryId"
                                error={errors.countryId ? true : false}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                placeholder="Country"
                                className="countryDropdown filter-slct"
                                value={(state?.countryId === "") ? 'none' : state?.countryId}
                                onChange={(e) => handleChangeField("countryId", e.target.value)}
                                MenuProps={{
                                  className: 'common-scroll-lock',
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
                                }}
                              >
                                <MenuItem className="selectDropDownList countryDropdownList" value={'none'} disabled><em>Country</em></MenuItem>
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
                            {stateList && stateList?.length > 0 &&
                              <Box className='edit-field scroll-lock-country'>
                                <Select
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  name="stateId"
                                  error={errors.stateId ? true : false}
                                  placeholder="State"
                                  className="filter-slct"
                                  MenuProps={{
                                    className: 'common-scroll-lock',
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
                                  }}
                                  value={(state?.stateId === "") ? 'none' : state?.stateId}
                                  onChange={(e) => handleChangeField("stateId", e.target.value)}
                                >
                                  <MenuItem value={'none'} className="selectDropDownList countryDropdownList" disabled><em>State</em></MenuItem>
                                  {stateList.length ? stateList?.map((val: any) => {
                                    return (
                                      <MenuItem className="selectDropDownList countryDropdownList" value={val.id} key={val.id}>
                                        {val.stateName}
                                      </MenuItem>
                                    );
                                  })
                                    : null
                                  }
                                </Select>
                                {errors.stateId && <div className="errorMsg">{errors.stateId}</div>}
                              </Box>
                            }
                          </Box>

                          <Box className="FormGroup">
                            <Typography variant="h4" sx={{ mb: 0.5 }}>
                              Stud Fee{' '}
                              {isEdit && <i className="filter-ico" onClick={handleStallionFeeHistory}>
                                <img src={Images.Linechart} alt="" />
                              </i>
                              }
                            </Typography>

                            <Box className='edit-field scroll-lock-country'>
                              <Select
                                MenuProps={{
                                  className: 'common-scroll-lock',
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
                                }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                name="feeYear"
                                error={errors.feeYear ? true : false}
                                placeholder="feeYear" className="filter-slct"
                                value={(state?.feeYear === "") ? 'none' : state?.feeYear}
                                onChange={(e) => handleChangeField("feeYear", e.target.value)}>
                                <MenuItem value={'none'} className="selectDropDownList" disabled><em>Service Fee Year</em></MenuItem>
                                {yearsRange.slice(0).reverse().map((year) => (
                                  <MenuItem className="selectDropDownList" value={year} key={year}>
                                    {year}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors.feeYear && <div className="errorMsg">{errors.feeYear}</div>}
                            </Box>
                            <Box className='edit-field scroll-lock-country'>
                              <Select
                                MenuProps={{
                                  className: 'common-scroll-lock',
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
                                }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                name="currencyId"
                                error={errors.currencyId ? true : false}
                                placeholder="currency"
                                className="filter-slct"
                                value={(state?.currencyId === "") ? 'none' : state?.currencyId}
                                onChange={(e) => handleChangeField("currencyId", e.target.value)}
                              >
                                <MenuItem className="selectDropDownList" value={'none'} disabled><em>Currency</em></MenuItem>
                                {currencyList?.map(({ id, currencyName }) => {
                                  return (
                                    <MenuItem className="selectDropDownList" value={id} key={id}>
                                      {currencyName}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                              {errors.currencyId && <div className="errorMsg">{errors.currencyId}</div>}
                            </Box>
                            <TextField
                              name="fee"
                              error={errors.fee ? true : false}
                              placeholder="Service Fee"
                              className="edit-field"
                              autoComplete="off"
                              value={state?.fee}
                              onChange={(e) => handleChangeField("fee", parseInt(e.target.value) ? e.target.value : '')}
                            />
                            {errors.fee && <div className="errorMsg">{errors.fee}</div>}
                            <Box className='edit-field scroll-lock-country'>
                              <Select
                                MenuProps={{
                                  className: 'common-scroll-lock',
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
                                }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                name="isPrivateFee"
                                error={errors.isPrivateFee ? true : false}
                                placeholder="Fee Status"
                                className="filter-slct"
                                value={(state?.isPrivateFee === "") ? 'none' : state?.isPrivateFee}
                                onChange={(e) => handleChangeField("isPrivateFee", e.target.value)}
                              >
                                <MenuItem className="selectDropDownList" value={'none'} disabled><em>Fee Status</em></MenuItem>
                                {feeStatusList?.map(({ id, name }) => {
                                  return (
                                    <MenuItem className="selectDropDownList" value={id} key={id}>
                                      {name}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                              {errors.isPrivateFee && <div className="errorMsg">{errors.isPrivateFee}</div>}
                            </Box>
                          </Box>

                          <Box className="FormGroup">
                            <Typography variant="h4" sx={{ mb: 0.5 }}>
                              Height (hh)
                            </Typography>
                            <TextField
                              error={errors.height ? true : false}
                              name="height"
                              placeholder="Enter Height"
                              className="edit-field"
                              autoComplete="off"
                              value={state?.height}
                              onChange={(e) => handleChangeField("height", e.target.value ? e.target.value : '')}
                            />
                            {errors.height && <div className="errorMsg">{errors.height}</div>}
                          </Box>

                          <Box className="FormGroup">
                            <Typography variant="h4" sx={{ mb: 0.5 }}>
                              Year to Stud{' '}
                              {/* {console.log(state)} */}
                            </Typography>
                            {/* <Box className='edit-field scroll-lock-country'>
                              <Select
                                MenuProps={{
                                  className: 'common-scroll-lock',
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
                                }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                name="yearToStud"
                                error={errors.yearToStud ? true : false}
                                placeholder="yearToStud"
                                className="filter-slct"
                                value={(state?.yearToStud) ? state?.yearToStud : 'none'}
                                onChange={(e) => handleChangeField("yearToStud", e.target.value)}
                              >
                                <MenuItem className="selectDropDownList" value={'none'} disabled><em>Enter Year</em></MenuItem>
                                {yearsRange.slice(0).reverse().map((year) => (
                                  <MenuItem className="selectDropDownList" value={year} key={year}>
                                    {year}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors.yearToStud && <div className="errorMsg">{errors.yearToStud}</div>}
                            </Box> */}
                            <TextField
                              name="yearToStud"
                              inputProps={{maxlength:4}}
                              error={errors.yearToStud ? true : false}
                              placeholder="Year To Stud"
                              className="edit-field"
                              autoComplete="off"
                              value={(state?.yearToStud) ? state?.yearToStud : ''}
                              onChange={(e) => handleChangeField("yearToStud", parseInt(e.target.value) ? e.target.value : '')}
                            />
                              {errors.yearToStud && <div className="errorMsg">{errors.yearToStud}</div>}
                          </Box>

                          <Box className="FormGroup">
                            <Accordion
                              className="accordionDrawer"
                              expanded={expanded === 'panel1'}
                              onChange={handleChange('panel1')}
                            >
                              <AccordionSummary
                                expandIcon={<KeyboardArrowDownRoundedIcon />}
                                aria-controls="panel5bh-content"
                                id="panel5bh-header"
                              >
                                <Typography variant="h4" sx={{ flexShrink: 0 }}>
                                  Year Retired
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Box className='edit-field scroll-lock-country'>
                                  <Select
                                    MenuProps={{
                                      className: 'common-scroll-lock',
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
                                    }}
                                    IconComponent={KeyboardArrowDownRoundedIcon}
                                    name="yearToRetired"
                                    placeholder="yearToRetired"
                                    className="filter-slct"
                                    value={(state?.yearToRetired) ? state?.yearToRetired : 'none'}
                                    onChange={(e) => handleChangeField("yearToRetired", e.target.value)}
                                  >
                                    <MenuItem className="selectDropDownList" value={'none'} disabled><em>Enter Year</em></MenuItem>
                                    {yearsRange.slice(0).reverse().map((year) => (
                                      <MenuItem className="selectDropDownList" value={year} key={year}>
                                        {year}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </Box>
                                <div className="errorMsg">{errors.yearToRetired}</div>
                                <Box className='edit-field scroll-lock-country'>
                                  <Select
                                    MenuProps={{
                                      className: 'common-scroll-lock',
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
                                    }}
                                    IconComponent={KeyboardArrowDownRoundedIcon}
                                    name="reasonId"

                                    placeholder="Select Reason"
                                    className="filter-slct"
                                    value={(state?.reasonId === "") ? 'none' : state?.reasonId}
                                    onChange={(e) => handleChangeField("reasonId", e.target.value)}
                                  >
                                    <MenuItem className="selectDropDownList" value={'none'} disabled><em>Select Reason</em></MenuItem>
                                    {retiredReasonList?.map(({ id, reasonName }) => {
                                      return (
                                        <MenuItem className="selectDropDownList" value={id} key={id}>
                                          {reasonName}
                                        </MenuItem>
                                      );
                                    })}
                                  </Select>
                                  <div className="errorMsg">{errors.reasonId}</div>
                                </Box>
                              </AccordionDetails>
                            </Accordion>

                            <Accordion
                              className="accordionDrawer"
                              expanded={expanded === 'panel2'}
                              onChange={handleChange('panel2')}
                              disabled={isEdit === false}
                            >
                              <AccordionSummary
                                expandIcon={<KeyboardArrowDownRoundedIcon />}
                                aria-controls="panel4bh-content"
                                id="panel4bh-header"
                              >
                                <Typography variant="h4" sx={{ width: '33%', flexShrink: 0 }}>
                                  Information
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography>
                                  Created: <span>{parseDateAsDotFormat(currentStallion?.createdOn)}</span>
                                </Typography>
                                <Typography>
                                  Created by: <span>{currentStallion?.createdBy ? currentStallion?.createdBy : '--'}</span>
                                </Typography>
                                <Typography>
                                  Updated: <span>{parseDateAsDotFormat(currentStallion?.modifiedOn)}</span>
                                </Typography>
                                <Typography>
                                  Updated by: <span>{currentStallion?.modifiedBy ? currentStallion?.modifiedBy : '--'}</span>
                                </Typography>
                                <Typography>
                                  Stallion ID: <span>{currentStallion?.id}</span>
                                </Typography>
                              </AccordionDetails>
                            </Accordion>
                          </Box>
                        </Box>
                      </Box>

                      <Stack sx={{ mt: 3 }} className="DrawerBtnWrapper">
                        <LoadingButton
                          className="search-btn"
                          type="submit"
                          variant="contained"
                          loading={loading}
                        >
                          {!isEdit ? 'Create Stallion' : 'Save'}
                        </LoadingButton>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </form>
            </Box>
          )}

          <CropImageDialogSimple
            open={openEditImageDialog}
            title={`${props.isEdit ? 'Edit' : 'Add'} Stallion logo`}
            onClose={() => setOpenEditImageDialog(false)}
            imgSrc={mediaImagePreview ? mediaImagePreview : ""}
            imgName={mediaFile?.name || ""}
            imgFile={mediaFile}
            awsUrl={presignedMediaPath}
            setCropPrevImg={setCropPrevImg}
            setCropImageFile={setCropImageFile}
          // circularCrop={un}
          />

          {/* Promote stallion modal */}
          <PromoteStallionWrapperDialog
            title="Promote Stallion"
            open={openPromoteStallionWrapper}
            close={handleClosePromoteStallionWrapper}
            setStartDate={handleStartDateChange}
            startDate={state.startDate}
            isPromoted={state.isPromoted}
            setIsPromoted={setIsPromoted}
          />

          {/* Stallion Exists modal */}
          <StallionConfirmWrapperDialog
            title="Stallion Exists"
            openExists={existStallionOpen}
            closeExists={handleCloseExistStallionWrapper}
            existStallionList={existStallionList}
            setExistStallionList={setExistStallionList}
            createStallionData={createStallionData}
            setCreateStallionData={setCreateStallionData}
            forceCreateNew={forceCreateNew}
            setForceCreateNew={setForceCreateNew}
            open={open}
            handleEditPopup={handleEditPopup}
            rowId={rowId}
            isEdit={rowId}
            openAddEditForm={openAddEditForm}
            handleDrawerCloseRow={handleDrawerCloseRow}
            handleCloseEditState={handleCloseEditState}
            getStallionIdModal={getStallionId}
          />
          {/* Download Unauthorized Popover */}
          {clickedPopover && !stallionModuleAccessAddBtn.stallion_feehistory && (
            <DownloadUnauthorizedPopover
              clickedPopover={clickedPopover}
              setClickedPopover={setClickedPopover}
            />
          )}
        </Scrollbar>
      </Drawer>
    </StyledEngineProvider>
  );
}

function handleDefaultValues() {
  throw new Error('Function not implemented.');
}

function setValue(arg0: string, arg1: any) {
  throw new Error('Function not implemented.');
}
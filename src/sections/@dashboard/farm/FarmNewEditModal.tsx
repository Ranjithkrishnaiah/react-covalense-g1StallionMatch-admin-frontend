import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Farm } from 'src/@types/farm';
import * as Yup from 'yup';
// redux
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import {
  useFarmQuery,
  useAddFarmMutation,
  useEditFarmMutation,
  useProfileImageUploadMutation,
  useFarmMareListQuery,
} from 'src/redux/splitEndpoints/farmSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Switch,
  Typography,
  FormControlLabel,
  CssBaseline,
  Drawer,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { FarmMergeWrapperDialog } from 'src/components/farm-modal/FarmMergeWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import { InviteNewFarmUserWrapperDialog } from 'src/components/farm-modal/InviteNewFarmUserWrapper';
import CustomDropzoneProfileImage from 'src/components/CustomDropzoneProfileImage';
import { v4 as uuid } from 'uuid';
import { SwitchProps } from '@mui/material/Switch';
import { toPascalCase } from 'src/utils/customFunctions';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { useUploadMediaStatusMutation } from 'src/redux/splitEndpoints/mediaSplit';
import { PATH_DASHBOARD } from 'src/routes/paths';
import CropImageDialogSimple from 'src/components/CropImageDialogSimple';
import { Images } from 'src/assets/images';
////////////////////////////////////
const drawerWidth = 354;
// DrawerHeader handler
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));
// FormValuesProps type
type FormValuesProps = Farm;
// Props type
type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};
// IOSSwitch SwitchProps
const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 46,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: '0px 0px 0px',
    margin: '2px 3px',
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
    backgroundColor: theme.palette.mode === 'light' ? '#B0B6AF' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));
// MenuProps
const ITEM_HEIGHT = 35;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function FarmNewEditModal(props: any) {
  // props data
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    apiStatus,
    setApiStatus,
    apiStatusMsg,
    setApiStatusMsg,
    valuesExist,
    setValuesExist,
  } = props;
  const [errors, setErrors] = React.useState<any>({});
  const navigate = useNavigate();
  // Close Drawer handler
  const handleDrawerClose = () => {
    handleEditPopup();
  };
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
    removeFileExisting('clear');
  };
  const theme = useTheme();
  const [addFarm] = useAddFarmMutation();
  const [editFarm] = useEditFarmMutation();
  const { data: countriesList } = useCountriesQuery();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  // Change handler
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  // initial state of userModuleAccessAddBtn
  const [userModuleAccessAddBtn, setUserModuleAccessAddBtn] = useState({
    farm_add: false,
    farm_edit: false,
    farm_merge: false,
    farm_invite: false,
  });
  // call on valuesExist
  React.useEffect(() => {
    setUserModuleAccessAddBtn({
      ...userModuleAccessAddBtn,
      farm_add: !valuesExist?.hasOwnProperty('FARM_ADMIN_CREATE_A_NEW_FARM') ? false : true,
      farm_edit: !valuesExist?.hasOwnProperty('FARM_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_FARM') ? false : true,
      farm_merge: !valuesExist?.hasOwnProperty('FARM_ADMIN_MERGE_FARMS') ? false : true,
      farm_invite: !valuesExist?.hasOwnProperty('FARM_ADMIN_INVITE_A_NEW_FARM_USER') ? false : true,
    });
  }, [valuesExist]);

  // API call to get farm Data
  const {
    data: farmData,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useFarmQuery(rowId, { skip: !isEdit, refetchOnMountOrArgChange: true });
  let currentFarm = farmData;
  const [isCountrySelected, setIsCountrySelected] = useState<boolean>(false);
  const [isProfileDeleted, setIsProfileDeleted] = useState(false);


  const inputFile = React.useRef<any>({});
  const [mediaFile, setMediaFile] = useState<any>();
  const [mediaImageFile, setMediaImageFile] = useState<any>();
  const [presignedMediaPath, setPresignedMediaPath] = useState<any>();
  const [mediaImagePreview, setMediaImagePreview] = useState<any>();
  const [mediaImagePreviewIndex, setMediaImagePreviewIndex] = useState<any>();
  const [mediaImagePreviewUuid, setMediaImagePreviewUuid] = useState<any>("");
  const [cropImageFile, setCropImageFile] = useState<any>('');
  const [imageEditFile, setImageEditFile] = useState<any>(undefined);
  const [cropPrevImg, setCropPrevImg] = useState<any>();
  const [openEditImageDialog, setOpenEditImageDialog] = useState<any>(false);
  console.log(cropPrevImg, 'cropPrevImg')
  console.log(cropImageFile, 'cropPrevImg cropImageFile')
  const NewFarmSchema = Yup.object().shape({});
  // initial states
  const [state, setStateValue] = useState({
    id: '',
    farmName: '',
    countryId: 'none',
    stateId: 'none',
    website: '',
    isActive: false,
    isPromoted: false,
  });
  // error state handler
  useEffect(() => {
    let temp = { ...errors };
    if (state.farmName) {
      delete temp.farmName;
    }
    if (state.countryId) {
      delete temp.countryId;
    }
    if (state.website) {
      delete temp.website;
    }
    setErrors(temp);
  }, [state]);
  // stallion search handler
  const handleStallionSearch = () => {
    window.open(PATH_DASHBOARD.stallions.filter(rowId), '_blank');
  };
  // Member search handler
  const handleMemberSearch = () => {
    window.open(PATH_DASHBOARD.members.filter(rowId), '_blank');
  };
  // Messages search handler
  const handleMessagesSearch = () => {
    window.open(PATH_DASHBOARD.messages.isRedirectFarmFilter(rowId), '_blank');
  };
  // onChange input fields set values
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });
  };

  // validate Website Url
  const validateWebsiteUrl = (url: string): boolean => {
    const pattern = /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.[a-z]{2,})(\/[^\s]*)?$/i;
    return pattern.test(url);
  };

  // Check for special character
  function containsSpecialChars(str: string) {
    const specialChars = /[`@#%^&\=\[\]{};:"\\|<>\/?~]/;
    return specialChars.test(str);
  }

  // validate Form handler
  let validateForm = (data: any) => {
    /*eslint-disable */
    let errors = {};
    let formIsValid = true;
    //@ts-ignore
    if (data.farmName === '') {
      formIsValid = false; //@ts-ignore
      errors['farmName'] = `Farm Name is required`;
    }
    if (data.countryId === 'none') {
      formIsValid = false; //@ts-ignore
      errors['countryId'] = `Country is required`;
    }
    if (stateList?.length) {
      if (state?.stateId === 'none') {
        formIsValid = false; //@ts-ignore
        errors['stateId'] = `State is required`;
      }
    }
    if (data.website === '' && validateWebsiteUrl(data.website) === false) {
      formIsValid = false; //@ts-ignore
      errors['website'] = `Website is invalid`;
    }
    if (state.farmName?.length !== 0) {
      if (containsSpecialChars(state.farmName)) {
        formIsValid = false; //@ts-ignore
        errors['farmName'] = `Only $-_.+!*'(), special characters allowed`;
        // errors['farmName'] = `Invalid special characters are not allowed and following are only allowed $-_.+!*'(),`;
      }
    }
    setErrors(errors);
    return formIsValid;
  };

  // defaultValues for form
  let defaultValues = React.useMemo(
    () => ({
      farmName: currentFarm?.farmName || '',
      countryId: currentFarm?.countryId || 'none',
      stateId: currentFarm?.stateId || 'none',
      website: currentFarm?.website || '',
      totalStallions: currentFarm?.totalStallions || 0,
      serviceFeeStatus: currentFarm?.serviceFeeStatus || 0,
      promoted: currentFarm?.promoted || 0,
      users: currentFarm?.users || 0,
      id: currentFarm?.id || '',
      recieved: currentFarm?.recieved || 0,
      sent: currentFarm?.sent || 0,
      isPromoted: currentFarm?.isPromoted || false,
      isActive: currentFarm?.isActive || false,
      image: currentFarm?.image || null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm]
  );

  // methods for form
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
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
  // call if edit state
  React.useEffect(() => {
    if (isEdit && currentFarm) {
      setIsCountrySelected(true);
      reset(defaultValues);
      setStateValue({
        ...state,
        farmName: currentFarm?.farmName,
        countryId: currentFarm?.countryId > 0 ? currentFarm?.countryId : 'none',
        stateId: currentFarm?.stateId > 0 ? currentFarm?.stateId : 'none',
        website: currentFarm?.website,
        isPromoted: currentFarm?.isPromoted,
        isActive: currentFarm?.isActive,
      });
      setImageEditFile(currentFarm?.image);
    }
    if (!isEdit) {
      setIsCountrySelected(false);
      reset(defaultValues);
    }
    setCropPrevImg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentFarm]);

  // file upload related
  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = currentFarm?.image ? currentFarm?.image : undefined; //state?.image;
  const heroImages = {
    setFileUpload,
    fileDetails,
  };
  const fileuuid: any = uuid();
  const [setHeroImages] = useProfileImageUploadMutation();
  const [uploadMediaStatus] = useUploadMediaStatusMutation();
  const [uploadInProgress, setUploadInProgress] = useState<any>(false);
  const [presignedProfilePath, setPresignedProfilePath] = useState<any>('');
  const [profileImageFile, setProfileImageFile] = useState<any>();
  // call on file upload
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
  //     } catch (error) { }
  //   }
  // }, [fileUpload]);
  const publicURL = process.env.REACT_APP_PUBLIC_URL;

  console.log(presignedProfilePath, profileImageFile, 'profileImageFile')
  // on Submit handler for farm form submit
  const onSubmit = async (data: FormValuesProps) => {
    if (!validateForm(data)) return;
    try {
      const finalData = {
        ...data,
        profileImageuuid:
          presignedProfilePath !== '' && profileImageFile?.fileuuid
            ? profileImageFile?.fileuuid
            : null,
        stateId: countryStateList?.length > 0 && state?.stateId !== 'none' ? state.stateId : null,
        isPromoted: state.isPromoted,
        isActive: state.isActive,
        isProfileImageDeleted: isProfileDeleted,
      };

      let res: any = isEdit
        ? await editFarm({
          ...finalData,
          url: publicURL + 'stud-farm/' + state?.farmName + '/' + rowId,
          id: rowId,
        })
        : await addFarm(finalData);
      if (res?.data) {
        if (profileImageFile) {
          const uploadOptions = { method: 'Put', body: cropImageFile };
          const result = await fetch(presignedProfilePath, uploadOptions);
          // }
          // if (presignedProfilePath !== '' && profileImageFile?.fileuuid) {
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
          // uploadMediaStatus([profileImageFile?.fileuuid]);
          // }
          setApiStatusMsg({
            status: 201,
            message: !isEdit
              ? '<b>New farm created successfully!</b>'
              : '<b>Farm data updated successfully!</b>',
          });
        }
        setApiStatus(true);
        setIsProfileDeleted(false);
      }
      if (res?.error) {
        if (res?.error.status === 422) {
          setApiStatusMsg({
            status: res?.error.status,
            message: 'There was a problem updating the farm!',
          });
          setApiStatus(true);
        }
      }
      isEdit ? handleCloseModal() : handleResetAndClose();
      reset();
    } catch (error) { }
  };

  // country Change handler
  const handlecountryChange = (event: any) => {
    // setStateValue({
    //   ...state,
    //   stateId: 'none',
    // });
    setIsCountrySelected(true);
  };

  const [countryStateList, setCountryStateList] = useState<any>([]);
  // API call to get states List
  const { data: stateList, isSuccess: isStatesByIdSuccess } = useStatesByCountryIdQuery(
    state?.countryId ? state?.countryId : currentFarm?.countryId,
    { skip: !isCountrySelected }
  );
  React.useEffect(() => {
    setCountryStateList(stateList);
  }, [stateList, isStatesByIdSuccess]);
  // API call to get mare List
  const { data: mareList, isSuccess: isFarmMareListSuccess } = useFarmMareListQuery(rowId, {
    skip: !isEdit,
    refetchOnMountOrArgChange: true,
  });
  const farmMareList = isFarmMareListSuccess ? mareList : [];
  const [openMergeFarmAccountsWrapper, setOpenMergeFarmAccountsWrapper] = useState(false);
  // close Merge Farm Accounts Wrapper handler
  const handleCloseMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(false);
  };
  // open Merge Farm Accounts Wrapper handler
  const handleOpenMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(true);
  };

  const [openFarmMergeWrapper, setOpenFarmMergeWrapper] = useState(false);
  // Close Farm Merge Wrappe handler
  const handleCloseFarmMergeWrapper = () => {
    setOpenFarmMergeWrapper(false);
  };
  // open Farm Merge Wrappe handler
  const handleOpenFarmMergeWrapper = () => {
    setOpenFarmMergeWrapper(true);
  };

  const [openInviteNewFarmUserWrapper, setOpenInviteNewFarmUserWrapper] = useState(false);

  // Close Invite New Farm User Wrapper
  const handleCloseInviteNewFarmUserWrapper = () => {
    setOpenInviteNewFarmUserWrapper(false);
  };
  // open Invite New Farm User Wrapper
  const handleOpenInviteNewFarmUserWrapper = () => {
    setOpenInviteNewFarmUserWrapper(true);
  };
  // MenuPropss
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-1px',
        marginLeft: '0px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  };

  // Reset And Close handler
  const handleResetAndClose = () => {
    setIsCountrySelected(false);
    setStateValue({
      ...state,
      id: '',
      farmName: '',
      countryId: 'none',
      website: '',
      isActive: false,
      isPromoted: false,
    });
    handleDrawerCloseRow();
    removeFileExisting('clear');
  };

  // Promoto Farm Url handler
  const BaseAPI = process.env.REACT_APP_PUBLIC_URL;
  const handlePromotoFarmUrl = () => {
    window.open(`${BaseAPI}stud-farm/${currentFarm?.farmName}/${rowId}`, '_blank');
  };

  const [isExist, setIsExist] = React.useState(false);
  const [stateMerge, setStateMerge] = useState({
    farmName: '',
    farmId: '',
    countryId: '',
    stateId: '',
    isOpen: false,
  });
  // Farm Change handler
  const handleFarmChange = (val: any) => {
    const updatedData = { ...stateMerge, ...val };
    setStateMerge({ ...updatedData, isOpen: true });
  };

  const profileMediaUpload = async () => {
    if (inputFile) {
      inputFile?.current?.click();
    }
  }

  const onChangeFile = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    const videoFormats = ['mp4'];
    const imageFormats = ['jpg', 'jpeg', 'png'];
    var file = event.target.files[0];
    // setMediaImagePreviewIndex(i);
    const type = file.type.split('/')[1];

    const videoFileSize = 50000000; // 10MB change to 50MB 
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
  }, [mediaFile])

  const callProfileAPI = (file: any) => {
    console.log(file, 'FILE');
    try {
      setHeroImages({
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

  // call on stateMerge
  useEffect(() => {
    if (stateMerge.isOpen === true) {
      handleCloseMergeFarmAccountsWrapper();
      handleOpenFarmMergeWrapper();
    }
  }, [stateMerge]);

  // clear the selected file after closing crop modal
  useEffect(() => {
    if (openEditImageDialog === false) {
      if (isEdit) {
        if ((cropImageFile === '' || cropImageFile === undefined) && currentFarm?.image === undefined) {
          console.log('callleddd')
          removeFileExisting('clear');
        }
      } else {
        if (openAddEditForm === false || cropImageFile === '' || cropImageFile === undefined) {
          console.log('callleddd else')
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

  // console.log(cropPrevImg ,imageEditFile,'imageEditFile')

  return (
    // Drawer section
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root': {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className="filter-section DrawerRightModal farm-rightbar"
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
          {/* close icon */}
          <IconButton
            className="closeBtn"
            onClick={isEdit ? handleCloseModal : handleResetAndClose}
          >
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>
        {isEdit === undefined && userModuleAccessAddBtn.farm_add === false && <UnAuthorized />}
        {isEdit === true && userModuleAccessAddBtn.farm_edit === false && <UnAuthorized />}
        {((isSuccess && userModuleAccessAddBtn.farm_edit === true) || (isEdit === undefined && userModuleAccessAddBtn.farm_add === true)) && (
          <Box px={5} className="edit-section">
            {/* edit form section starts */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box px={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12} className="addphoto-drag">
                    <Box className="add-photo">
                      {/* Cropping imag */}
                      <Box className='cropped-image-farm'>
                        {(cropPrevImg || imageEditFile) && <i className="icon-Incorrect" onClick={(e) => removeFileExisting('remove')} />}
                        {(cropPrevImg || imageEditFile) &&
                          <Box className="hero-pic" key={imageEditFile?.fileName}>
                            {/* <i className="icon-Incorrect" onClick={(e) => removeFile()} /> */}
                            {<img src={cropPrevImg || `${imageEditFile}?w=200&h=200`} alt={"Cropped Media"} />
                            }
                          </Box>
                        }
                      </Box>
                      {
                        <><Box className="draganddrop-farms dropfarm" onClick={profileMediaUpload}>
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

                      {/* {(isEdit === true && isFetching === false) && <CustomDropzoneProfileImage data={heroImages} isEdit={isEdit} />}
                      {(isEdit === false || isEdit === undefined) && <CustomDropzoneProfileImage data={heroImages} isEdit={isEdit} />} */}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12}>
                    <Box>
                      <Box className="FormGroup">
                        {/* Name */}
                        <TextField
                          {...register(`farmName`)}
                          error={errors.farmName ? true : false}
                          placeholder="Name"
                          className="form-control edit-field"
                          value={toPascalCase(state.farmName)}
                          onChange={(e) => handleChangeField('farmName', e.target.value)}
                        />
                        {errors.farmName && <div className="errorMsg">{errors.farmName}</div>}
                        <Box className="edit-field scroll-lock-country">
                          {/* country */}
                          <Select
                            {...register(`countryId`)}
                            error={errors.countryId ? true : false}
                            IconComponent={KeyboardArrowDownRoundedIcon}
                            value={state?.countryId}
                            onChange={(e: any) => {
                              handlecountryChange(e);
                              handleChangeField('countryId', e.target.value);
                            }}
                            className="form-control countryDropdown filter-slct"
                            MenuProps={{
                              className: 'common-scroll-lock',

                              disableScrollLock: true,
                              anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                              },
                              transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                              },
                              ...MenuPropss,
                            }}
                          >
                            <MenuItem
                              className="selectDropDownList countryDropdownList mem-country"
                              value={'none'}
                              disabled
                            >
                              <em>Country</em>
                            </MenuItem>
                            {countriesList?.map(({ id, countryName }) => {
                              return (
                                <MenuItem
                                  className="selectDropDownList countryDropdownList mem-country"
                                  value={id}
                                  key={id}
                                >
                                  {countryName}
                                </MenuItem>
                              );
                            })}
                          </Select>
                          {errors.countryId && <div className="errorMsg">{errors.countryId}</div>}
                        </Box>
                        {state?.countryId !== 'none' && countryStateList?.length > 0 && (
                          <Box className="edit-field scroll-lock-country">
                            {/* State */}
                            <Select
                              {...register(`stateId`)}
                              error={errors.stateId ? true : false}
                              IconComponent={KeyboardArrowDownRoundedIcon}
                              value={state?.stateId}
                              className="form-control countryDropdown filter-slct"
                              onChange={(e: any) => {
                                handleChangeField('stateId', e.target.value);
                              }}
                              name="width-dropdown"
                              MenuProps={{
                                className: 'common-scroll-lock',
                                disableScrollLock: true,
                                anchorOrigin: {
                                  vertical: 'bottom',
                                  horizontal: 'left',
                                },
                                transformOrigin: {
                                  vertical: 'top',
                                  horizontal: 'left',
                                },
                                ...MenuPropss,
                              }}
                            >
                              <MenuItem className="selectDropDownList" value={'none'} disabled>
                                <em>State</em>
                              </MenuItem>
                              {stateList?.map(({ id, stateName }) => {
                                return (
                                  <MenuItem className="selectDropDownList" value={id} key={id}>
                                    {stateName}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                            {errors.stateId && <div className="errorMsg">{errors.stateId}</div>}
                          </Box>
                        )}
                        {/* Website */}
                        <TextField
                          {...register(`website`)}
                          error={errors.website ? true : false}
                          placeholder="Website"
                          className="edit-field"
                          value={state.website}
                          onChange={(e) => handleChangeField('website', e.target.value)}
                        />
                        {errors.website && <div className="errorMsg">{errors.website}</div>}
                        <Box className="edit-field IosSwitches-Common">
                          {/* Promoted Farm */}
                          <FormControlLabel
                            {...register(`isPromoted`)}
                            control={<IOSSwitch checked={state?.isPromoted} />}
                            label={
                              <>
                                <Typography variant="h4" sx={{ mb: 0.5 }}>
                                  Promoted Farm{' '}
                                  {isEdit && state.isPromoted && (
                                    <i
                                      style={{
                                        color: '#007142',
                                        fontSize: '24px',
                                        marginLeft: '8px',
                                        cursor: 'pointer',
                                      }}
                                      className="icon-Link-green"
                                      onClick={handlePromotoFarmUrl}
                                    />
                                  )}
                                </Typography>
                              </>
                            }
                            sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                            onChange={(e: any) =>
                              handleChangeField('isPromoted', e.target.checked ? true : false)
                            }
                            labelPlacement="start"
                          />
                        </Box>
                        <Box className="edit-field IosSwitches-Common">
                          <Box className="RHF-Switches">
                            <Typography variant="h4" sx={{ mb: 0.5 }}>
                              Active
                            </Typography>
                            <IOSSwitch
                              {...register(`isActive`)}
                              onChange={(e: any) =>
                                handleChangeField('isActive', e.target.checked ? true : false)
                              }
                              checked={state?.isActive}
                            />
                          </Box>
                        </Box>
                      </Box>
                      {isEdit && (
                        <Box className="FormGroup">
                          <Grid container spacing={3} className="count-numbers">
                            <Grid item xs={6} md={6} sx={{ paddingTop: '20px !important' }}>
                              <Typography variant="h3" onClick={() => handleStallionSearch()} style={{ cursor: 'pointer' }}>
                                <b>{defaultValues?.totalStallions}</b> <span>Stallions</span>
                              </Typography>
                            </Grid>
                            <Grid item xs={6} md={6} sx={{ paddingTop: '20px !important' }}>
                              <Typography variant="h3" onClick={() => handleMemberSearch()} style={{ cursor: 'pointer' }}>
                                <b>{defaultValues?.users}</b> <span>Users</span>
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}
                      {isEdit && (
                        <Box className="FormGroup" mt={1}>
                          <Accordion
                            className="accordionDrawer"
                            defaultExpanded={true}
                            onChange={handleChange('panel1')}
                          >
                            <AccordionSummary
                              expandIcon={<KeyboardArrowDownRoundedIcon />}
                              aria-controls="panel4bh-content"
                              id="panel4bh-header"
                            >
                              <Typography variant="h4" sx={{ flexShrink: 0 }}>
                                Message &nbsp;<span> (This Year)</span>
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                              <Grid container spacing={3} className="count-numbers">
                                <Grid item xs={6} md={6} sx={{ paddingTop: '15px !important' }}>
                                  <Typography variant="h3" onClick={() => handleMessagesSearch()} style={{ cursor: 'pointer', whiteSpace: "nowrap" }}>
                                    <b>{defaultValues?.recieved}</b> <span>Received</span>
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} md={6} sx={{ paddingTop: '15px !important' }}>
                                  <Typography variant="h3" onClick={() => handleMessagesSearch()} style={{ cursor: 'pointer' }}>
                                    <b>{defaultValues?.sent}</b> <span>Sent</span>
                                  </Typography>
                                </Grid>
                              </Grid>

                              <Box className="edit-field">
                                {/* Mare Lists */}
                                <Stack mt={2} mb={2}>
                                  <Select
                                    IconComponent={KeyboardArrowDownRoundedIcon}
                                    value={'none'}
                                    className="form-controlcountryDropdown filter-slct"
                                    name="width-dropdown"
                                    MenuProps={{
                                      className: 'common-scroll-lock',
                                      disableScrollLock: true,
                                      anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                      },
                                      transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                      },
                                      ...MenuPropss,
                                    }}
                                  >
                                    <MenuItem
                                      className="selectDropDownList"
                                      value={'none'}
                                      disabled
                                    >
                                      <em>Mare Lists</em>
                                    </MenuItem>
                                    {farmMareList?.map(({ mareListInfoId, listname }) => {
                                      return (
                                        <MenuItem
                                          className="selectDropDownList"
                                          value={mareListInfoId}
                                          key={mareListInfoId}
                                        >
                                          {listname}
                                        </MenuItem>
                                      );
                                    })}
                                  </Select>
                                </Stack>
                              </Box>

                              <Stack className="FormGroupList" mt={2}>
                                <Typography component="p">
                                  Farm ID: <u>{defaultValues?.id}</u>
                                </Typography>
                              </Stack>
                            </AccordionDetails>
                          </Accordion>
                        </Box>
                      )}
                    </Box>

                    <Stack sx={{ mt: 3 }} className="DrawerBtnWrapper">
                      {/* save button */}
                      <LoadingButton
                        className="search-btn"
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                      >
                        {!isEdit ? 'Create Farm' : 'Save'}
                      </LoadingButton>
                      <Grid container spacing={1.5} className="DrawerBtnBottom">
                        {/* Merge button */}
                        <Grid item xs={6} md={6} sx={{ paddingTop: '12px !important' }}>
                          <Button
                            fullWidth
                            type="button"
                            className="search-btn"
                            onClick={handleOpenMergeFarmAccountsWrapper}
                            disabled
                          >
                            Merge
                          </Button>
                        </Grid>
                        <Grid item xs={6} md={6} sx={{ paddingTop: '12px !important' }}>
                          {/* Invite User button */}
                          <Button
                            fullWidth
                            type="button"
                            className="add-btn"
                            onClick={handleOpenInviteNewFarmUserWrapper}
                          >
                            Invite User
                          </Button>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </form>
            {/* edit form section ends */}
          </Box>
        )}

        <CropImageDialogSimple
          open={openEditImageDialog}
          title={`${props.isEdit ? 'Edit' : 'Add'} Farm Logo`}
          onClose={() => setOpenEditImageDialog(false)}
          imgSrc={mediaImagePreview ? mediaImagePreview : ""}
          imgName={mediaFile?.name || ""}
          imgFile={mediaFile}
          awsUrl={presignedMediaPath}
          setCropPrevImg={setCropPrevImg}
          setCropImageFile={setCropImageFile}
          circularCrop={false}
        />
        {/* Farm Merge Wrapper Dialog */}
        <FarmMergeWrapperDialog
          title="Are you sure?"
          open={openFarmMergeWrapper}
          close={handleCloseFarmMergeWrapper}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
        />
        {/* Merge Farm Accounts Wrapper Dialog */}
        <MergeFarmAccountsWrapperDialog
          title="Merge Farm Accounts"
          open={openMergeFarmAccountsWrapper}
          close={handleCloseMergeFarmAccountsWrapper}
          stateMerge={stateMerge}
          setStateMerge={setStateMerge}
          pageType={'farmMerge'}
          setFarmId={handleFarmChange}
          farmName={stateMerge}
          isEdit={isEdit}
          isExist={isExist}
          isOpen={open || openAddEditForm}
        />
        {/* Invite New Farm User Wrapper Dialog */}
        <InviteNewFarmUserWrapperDialog
          title="Invite New Farm User"
          open={openInviteNewFarmUserWrapper}
          close={handleCloseInviteNewFarmUserWrapper}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
          farmId={rowId}
          userModuleAccessAddBtn={userModuleAccessAddBtn}
          setUserModuleAccessAddBtn={setUserModuleAccessAddBtn}
        />
      </Scrollbar>
    </Drawer>
    // Drawer section ends
  );
}

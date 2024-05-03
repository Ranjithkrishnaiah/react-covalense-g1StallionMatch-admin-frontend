import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { useState, useEffect, useRef, SetStateAction, useMemo } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  Container,
  Select,
  MenuItem,
  Button,
  Badge,
  TextField,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useAuth from '../../../src/hooks/useAuth';
import { MenuProps } from 'src/constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Avatar from '@mui/material/Avatar';
import { Images } from 'src/assets/images';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import DashboardHeader from 'src/layouts/dashboard/header';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import Page from 'src/components/Page';
import useSettings from 'src/hooks/useSettings';
import uuidv4 from 'src/utils/uuidv4';
import { useUserImageUploadMutation } from 'src/redux/splitEndpoints/mediaUplodeSplit';
import { useSaveMemberDetailsMutation, useAuthMeProfileDetailsQuery } from 'src/redux/splitEndpoints/saveMemberDetailsSplit'
import localStorage from 'redux-persist/es/storage';
import { useUpdatePasswordUserMutation } from 'src/redux/splitEndpoints/updatePasswordSplit';
import { useGetUserDetailsByTokenQuery } from 'src/redux/splitEndpoints/usersSplit';
import CropUserImageDialog from 'src/components/CropUserImageDialog';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import 'src/sections/@dashboard/horse/HorseGen.css';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import useCounter from 'src/hooks/useCounter';
import { Spinner } from 'src/components/Spinner';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
// ----------------------------------------------------------------------

type FormValuesProps = {
  fullName: string;
  email: string;
  photoURL: File | any;
  phoneNumber: string | null;
  countryId: string | null;
  addresses: string | null;
  stateId: number | null;
  city: string | null;
  zipCode: string | null;
  about: string | null;
  isPublic: boolean;
  password: string;
};

export default function UserProfileData() {
  const { enqueueSnackbar } = useSnackbar();
  const fileuuid: any = uuid();
  const { data, isFetching, isSuccess } = useGetUserDetailsByTokenQuery();

  // const user = localStorage.getItem('user'); 
  const userData = data;
  const filterCounterhook = useCounter(0);
  const { data: countriesList } = useCountriesQuery();
  const [isCountrySelected, setIsCountrySelected] = useState<boolean>(false);
  const [countryId, setCountryId] = useState(0);
  const [stateId, setStateId] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [img, setImg] = useState("");
  const [filename, setFilename] = useState<string>('');
  const [mediauuid, setMediauuid] = useState('');
  const [filesize, setFileSize] = useState('0');
  const [imageupload] = useUserImageUploadMutation();
  const [updateMenbersDetails] = useSaveMemberDetailsMutation()
  const [password, setPassword] = useState("");
  const [updatePassword] = useUpdatePasswordUserMutation();
  const [imgss, setImgss] = useState();
  const [UserFieldDisable, setUserFieldDisable] = useState(false);
  const [test, setTest] = useState(true);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [adminMemberProfileModuleAccess, setAdminMemberProfileModuleAccess] = useState({
    admin_MemberProfile: false,
  });
  const [valuesExist, setValuesExist] = useState<any>({});

  // Check permission to access the member module
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
      let list: any = [];
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: true,
          }));
        } else {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: false,
          }));
        }
      }
    }
  }, [isSuccessAccessLevel, isFetchingAccessLevel]);

  useEffect(() => {
    if (valuesExist.hasOwnProperty('ADMIN_MEMBER_PROFILE')) {
      setUserModuleAccess(true);
    }
    setAdminMemberProfileModuleAccess({
      ...adminMemberProfileModuleAccess,
      admin_MemberProfile: !valuesExist?.hasOwnProperty('ADMIN_MEMBER_PROFILE') ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const handlePassword = (event: { target: { value: SetStateAction<string>; }; }) => {
    setPassword(event.target.value)
  }
  const handelChangePassword = async (event: any) => {
    event.preventDefault();
    const isValidPassword = validatePassword();
    if (!validatePassword()) return;
    // if(password!=""){
    let data = { "password": password }
    let res = await updatePassword(data);
    enqueueSnackbar('Password Updated Successfully');
    setPassword('');
    // }  
  }

  const handleInput = () => {
    inputRef.current?.click();
  };

  // Validates Password
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  let validatePassword = () => {
    const userPwd = password;
    const userFullName = userData?.fullName;
    const userEmail = userData?.email;
    const minLength = 6;

    if (userPwd.length < minLength) {
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      return false;
    }

    if (!/[a-zA-Z]/.test(userPwd)) {
      setPasswordErrorMessage('Password must contain at least one letter.');
      return false;
    }

    if (!/\d/.test(userPwd)) {
      setPasswordErrorMessage('Password must contain at least one number.');
      return false;
    }

    if (password.includes(userFullName) || password.includes(userEmail)) {
      setPasswordErrorMessage('Password must not contain your email, first name or last name.');
      return false;
    }
    setPasswordErrorMessage('');
    return true;
  }

  const handleFileChange = (e: any) => {
    let file = e.target.files[0];
    setImg(URL.createObjectURL(e.target.files[0]));
    setFilename(file.name);
    setMediauuid(fileuuid);
    setFileSize(file);
    try {
      imageupload({
        fileName: file.name,
        fileuuid: fileuuid,
        fileSize: file.size,
      }).then(async (res: any) => {
        setTest(false);
        //setImgss(img);//res.data.url
        const testimg = { ...userData, memberprofileimages: res.data.url }
        localStorage.setItem("user", JSON.stringify(testimg));
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handlecountryChange = (event: any) => {
    setCountryId(event.target.value);
    setIsCountrySelected(true);
  };
  const handelstatechange = (event: any) => {
    setStateId(event.target.value);
    // console.log(event.target);
    defaultValues.stateId = event.target.value;
    // console.log(defaultValues.state);
  };
  useEffect(() => {
    if (stateList?.length === 0) {
      setStateId(0);
    }
    if (defaultValues.countryId != 0) {
      setCountryId(defaultValues.countryId);
      setIsCountrySelected(true);
      setStateId(defaultValues.stateId);
    }
    // if(userData.roleName==="SuperAdmin"){
    //   setUserFieldDisable(true);
    // }

    // if(!userData?.memberprofileimages && getAuthMeUserData?.memberprofileimages != "") {
    //   const imageUpdateToLocalStaorage = {...userData, memberprofileimages:getAuthMeUserData?.memberprofileimages}
    //   localStorage.setItem("user",JSON.stringify(imageUpdateToLocalStaorage));
    // }
  }, [isFetching]);

  const { data: stateList, isSuccess: isStatesByIdSuccess } = useStatesByCountryIdQuery(countryId, {
    skip: !isCountrySelected,
  });

  // User profile image upload action
  const [isImageUpload, setIsImageUpload] = useState<boolean>(false);
  const inputFile = useRef<any>({});
  const [profileImageFile, setProfileImageFile] = useState<any>();
  const [profileImagePreview, setProfileImagePreview] = useState<any>(userData?.memberprofileimages);
  const [presignedProfilePath, setPresignedProfilePath] = useState<any>();
  const [openEditImageDialog, setOpenEditImageDialog] = useState<any>(false);
  const [imageFile, setImageFile] = useState<File>();
  const [cropImageFile, setCropImageFile] = useState<File>();
  const [cropPrevImg, setCropPrevImg] = useState<any>();
  const [uploadInProgress, setUploadInProgress] = useState<any>(false);
  const [croppedImageUuid, setCroppedImageUuid] = useState('');
  const [profileImage, response] = useUserImageUploadMutation();

  const profileImageUpload = async () => {
    inputFile.current.click();
  };

  // On uploading a image, validate the uploaded image size
  const onChangeFile = async (event: any) => {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    if (file.size < 10000000) {
      validateResolution(file);
    } else {
      toast.error('File size is exceeded');
    }
  };

  // Validate the resolution
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
        if (height > 120 && width > 120) {
          setImageFile(file);
          // prevProps.setSetChanges(true);
          callProfileAPI(file);
        } else {
          toast.error(`The image dimensions must be at least 120px*120px.`)
        }
      };
    }
  }

  const callProfileAPI = (file: any) => {
    try {
      profileImage({
        fileName: file.name,
        fileuuid,
        fileSize: file.size,
      }).then(async (res: any) => {
        const details = { file, fileuuid };
        setCroppedImageUuid(fileuuid);
        setProfileImageFile(details);
        setProfileImagePreview(URL.createObjectURL(file));
        setPresignedProfilePath(res.data.url);
      });
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (imageFile != undefined) {
      setOpenEditImageDialog(true);
    }
  }, [imageFile]);

  const UpdateUserSchema = Yup.object().shape({
    fullName: Yup.string().required('Name is required'),
    // email: Yup.string().email('Enter a valid email address').required('Enter an email address'),
  });

  const defaultValues = useMemo(
    () => ({
      fullName: userData?.fullName || '',
      email: userData?.email || '',
      photoURL: userData?.memberprofileimages || '',
      phoneNumber: userData?.phoneNumber || '',
      countryId: userData?.countryId || '',
      addresses: userData?.addresses || '',
      stateId: userData?.stateId || '',
      city: userData?.city || '',
      zipCode: userData?.zipCode || '',
      about: userData?.about || '',
      isPublic: userData?.isPublic || false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, isFetching]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
    // defaultValues,
  });

  const {
    register,
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  const onSubmit = async (data: FormValuesProps) => {
    data.stateId = stateId;
    let memberDetails = {
      "fullName": data.fullName,
      "email": data.email,
      "address": data.addresses,
      "countryId": data.countryId,
      "stateId": data.stateId,
    }
    try {
      const resss = updateMenbersDetails(memberDetails);
      const dummy = { ...userData, fullName: data.fullName, addresses: data.addresses, countryId: data.countryId, stateId: data.stateId }
      localStorage.setItem("user", JSON.stringify(dummy));

      setApiStatusMsg({ 'status': 201, 'message': '<b>User profile updated successfully!</b>' });
      setApiStatus(true);
      // enqueueSnackbar('Profile Updated Successfully');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAlphabateOnly = (event: any) => {
    // var regex = new RegExp("^[a-zA-Z ]+$");
    var key = event.which;
    if (!(key >= 65 && key <= 123) && key != 32 && key != 0 && key != 8 && key != 37 && key != 39) {
      event.preventDefault();
      return false;
    }
  };

  return (
    <>
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />
      <Page title="User Profile" sx={{ display: 'flex' }} className="UserProfileDataDashboard">
        {(!isFetching) &&
          <Box className="MessageDataDashboardRight" sx={{ width: '100%' }} px={2}>
            <Container>
              {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
              <Stack direction="row" className="MainTitleHeader">
                <Grid container mt={0}>
                  <Grid item lg={6} sm={6}>
                    <Typography variant="h6" className="MainTitle">
                      Member Details
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
              {isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                <Box className="Spinner-Wrp">
                  <Spinner />
                </Box>
              ) : filterCounterhook.value >= 2 && adminMemberProfileModuleAccess.admin_MemberProfile === false ? (
                <UnAuthorized />
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box className="UserProfileData" mt={4}>
                    <Box className="form-group">
                      <Grid container className="userprofileform">
                        <Grid item xs={6} md={6}>
                          <Grid container spacing={0.5}>
                            <Grid item xs={6} md={6} className="userprofileitem">
                              <TextField
                                {...register(`fullName`, { required: true })}
                                name="fullName"
                                onKeyDown={(e) => handleAlphabateOnly(e)}
                                placeholder="Full Name"
                                className="edit-field"
                                defaultValue={defaultValues?.fullName}
                              />
                              {errors.fullName && errors.fullName.type === 'required' && (
                                <p style={{ color: 'red', fontSize: '10px' }}>Name field is Required</p>
                              )}
                            </Grid>
                            <Grid item xs={11} md={11} className="userprofileitem">
                              <TextField
                                {...register(`email`)}
                                name="email"
                                placeholder="Email Address"
                                className="edit-field"
                                disabled={true}
                                defaultValue={defaultValues?.email}
                              />
                            </Grid>
                            <Grid item xs={11} md={11} className="userprofileitem">
                              <TextField
                                {...register(`addresses`)}
                                name="addresses"
                                placeholder="Address"
                                className="edit-field"
                                defaultValue={defaultValues?.addresses}
                              />
                            </Grid>
                            <Grid item xs={6} md={6} className="userprofileitem">
                              <Box className="edit-field">
                                <Select
                                  {...register(`countryId`)}
                                  name="countryId"
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  defaultValue={defaultValues?.countryId === '' ? 0 : defaultValues?.countryId}
                                  placeholder="Country"
                                  onChange={(e: any) => {
                                    handlecountryChange(e);
                                  }}
                                  className="form-control countryDropdown filter-slct"
                                  MenuProps={MenuProps}
                                >
                                  <MenuItem
                                    className="selectDropDownList countryDropdownList lg"
                                    value={0}
                                    disabled
                                  >
                                    <em>Country</em>
                                  </MenuItem>
                                  {countriesList?.map(({ id, countryName }) => {
                                    return (
                                      <MenuItem
                                        className="selectDropDownList countryDropdownList"
                                        value={id}
                                        key={id}
                                      >
                                        {countryName}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </Box>
                            </Grid>
                            <Grid item xs={6} md={6} className="userprofileitem">
                              <Box className="edit-field">
                                <Select
                                  {...register(`stateId`)}
                                  name="stateId"
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  className="form-control countryDropdown filter-slct"
                                  defaultValue={defaultValues?.stateId === '' ? 0 : defaultValues?.stateId}
                                  placeholder="State"
                                  onChange={(e: any) => {
                                    handelstatechange(e);
                                  }}
                                  MenuProps={MenuProps}
                                >
                                  <MenuItem className="selectDropDownList" value={0} disabled>
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
                              </Box>
                            </Grid>

                            {!UserFieldDisable && <><Grid item xs={6} md={6} className="userprofileitem" mt={6}>
                              <TextField
                                {...register(`password`)}
                                name="password"
                                value={password}
                                onChange={handlePassword}
                                type="password"
                                placeholder="Pass****** "
                                className="edit-field" />
                            </Grid><Grid
                              item
                              xs={6}
                              md={6}
                              className="userprofileitem"
                              alignItems="center"
                              display="flex"
                              mt={6}
                            >
                                <Button
                                  type="button"
                                  onClick={handelChangePassword}
                                  className="link-btn"
                                  sx={{
                                    marginLeft: '10px !important',
                                    fontWeight: '400',
                                    fontFamily: 'Synthese-Light !important',
                                  }}
                                >
                                  Change
                                </Button>
                              </Grid>
                              <div className="errorMsg">{passwordErrorMessage}</div>
                            </>
                            }

                            <Grid item xs={12} md={12} mt={5} className="userprofileitem">
                              <Stack spacing={3} alignItems="start" display="flex" flexDirection="row">
                                <LoadingButton
                                  type="submit"
                                  className="search-btn"
                                  loading={isSubmitting}
                                >
                                  Save
                                </LoadingButton>
                                <Button
                                  type="button"
                                  className="search-btn-outline"
                                  onClick={() => window.location.reload()}
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={4} md={4}>
                          <Stack direction="row" spacing={2} className="EditProfile">
                            <Badge overlap="circular">
                              <Avatar
                                src={
                                  cropPrevImg ? cropPrevImg : userData?.memberprofileimages ? `${userData?.memberprofileimages}` : profileImagePreview ? profileImagePreview : Images?.UserSign
                                }
                                style={{ width: '126px', height: '126px' }}
                                alt={userData?.fullName}
                              />
                              <input
                                type="file"
                                id="file"
                                ref={inputFile}
                                style={{ display: 'none' }}
                                onChange={onChangeFile}
                                onClick={(event: any) => {
                                  event.target.value = null;
                                }}
                              />
                            </Badge>
                            <Box sx={{ margin: "10px !important" }}>
                              <Button type="button" className="EditBtn" onClick={profileImageUpload}>
                                {userData?.memberprofileimages ? 'Edit' : 'Add'}
                              </Button>
                            </Box>
                            <input
                              type="file"
                              ref={inputRef}
                              onChange={handleFileChange}
                              style={{ display: 'none' }}
                            />
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </form>
              )
              }

              <CropUserImageDialog
                open={openEditImageDialog}
                title={`${userData?.memberprofileimages ? 'Edit' : 'Add'} User Profile Image`}
                onClose={() => setOpenEditImageDialog(false)}
                imgSrc={profileImagePreview ? profileImagePreview : ''}
                imgName={imageFile?.name || ''}
                imgFile={imageFile}
                awsUrl={presignedProfilePath}
                setCropPrevImg={setCropPrevImg}
                setCropImageFile={setCropImageFile}
                uniqueUuid={croppedImageUuid}
              // isImageUpload={isImageUpload}
              // setIsImageUpload={setIsImageUpload}
              />
            </Container>
          </Box>
        }
      </Page >
    </>
  );
}

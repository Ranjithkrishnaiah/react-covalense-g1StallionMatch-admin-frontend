// @mu
import { useEffect, useState } from 'react';
import React from "react";
import {
    Box,
    Typography,
    Container,
    Grid,
    Stack,
    Divider,
    MenuItem,
    Button,
    TextField,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    InputAdornment,
    StyledEngineProvider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom'
import Page from 'src/components/Page';
import CustomDropzone from 'src/components/CustomDropzone';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import 'src/sections/@dashboard/marketing/marketing.css'
import MarketingFilterSidebar from 'src/sections/@dashboard/marketing/filter/MarketingFilterSidebar';
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from 'src/constants/MenuProps';
import {
    useEditFarmPageMutation,
    useFarmGalleryImagesUploadStatusMutation,
    useFarmPageGalleryImageQuery,
    useFarmPageMediaQuery,
    useFarmPageProfileQuery,
    usePatchFarmProfileGalleryimageMutation,
    usePostFarmGalleryimageUploadMutation,
    useGetFarmMediaQuery
} from 'src/redux/splitEndpoints/marketingSplit';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import FarmAutoComplete from 'src/components/FarmAutoComplete';
import { toPascalCase, isObjectEmpty } from 'src/utils/customFunctions';
import { StallionSpinner } from 'src/components/StallionSpinner';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useFarmQuery, useProfileImageUploadMutation } from 'src/redux/splitEndpoints/farmSplit';
import { v4 as uuid } from 'uuid';
import FarmMediaEditModal from 'src/sections/@dashboard/marketing/farmpage/FarmMediaEditModal';
import FarmMediaListTableRow from 'src/sections/@dashboard/marketing/farmpage/list/FarmMediaListTableRow';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import { useLocation, useParams } from 'react-router';
import { useUploadMediaStatusMutation } from 'src/redux/splitEndpoints/mediaSplit';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';

export default function MarketingFarmData() {
    const filterCounterhook = useCounter(0);
    const [valuesExist, setValuesExist] = useState<any>({});
    const [clickedPopover, setClickedPopover] = useState(false);
    const [userModuleAccess, setUserModuleAccess] = useState(false);
    const [marketingModuleAccess, setMarketingModuleAccess] = useState({
        marketing_viewonly: false,
        marketing_update: false,
        marketing_promoted_farm: false,
    });

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
        if (valuesExist.hasOwnProperty('MARKETING_FARM_PAGE_PROMOTED')) {
            setUserModuleAccess(true);
        }
        setMarketingModuleAccess({
            ...marketingModuleAccess,
            marketing_viewonly: !valuesExist?.hasOwnProperty('MARKETING_FARM_PAGE_PROMOTED') ? false : true,
            marketing_update: !valuesExist?.hasOwnProperty('MARKETING_FARM_PAGE_PROMOTED') ? false : true,        });
        filterCounterhook.increment();
    }, [valuesExist]);

    const farmPageId = process.env.REACT_APP_MARKETING_FARM_PAGE_ID;
    const navigate = useNavigate();
    const fileuuid: any = uuid();
    const [open, setOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [rowId, setRowId] = useState("");
    const [state, setStateValue] = useState<any>({
        countryId: ''
    });
    const [apiStatus, setApiStatus] = useState(false);
    const [apiStatusMsg, setApiStatusMsg] = useState({});
    const BaseAPI = process.env.REACT_APP_PUBLIC_URL;
    const [isExist, setIsExist] = React.useState(false);
    const [farmId, setFarmId] = useState('');
    const [fileUpload, setFileUpload] = useState<any>();
    const [farmOverview, setFarmOverview] = useState<any>(null);
    const galleryResolution = { height: 946, width: 1920 }
    const [uploadInProgress, setUploadInProgress] = useState<any>(false);
    const [galleryImages, setGalleryImages] = useState<any>([]);
    const [heroImagesDeletedId, setHeroImagesDeletedId] = useState<any>([]);
    const [presignedProfilePath, setPresignedProfilePath] = useState<any>();
    const [profileImageFile, setProfileImageFile] = useState<any>();
    const [profileFileUpload, setProfileFileUpload] = useState<any>();
    const [openTestimonail, setOpenMedia] = useState(false);
    const [isEditMedia, setEditMedia] = useState(false);
    const [openMediaModal, SetOpenMediaModal] = useState(false);
    const [isFarmImageChange, setIsFarmImageChange] = useState(false);
    const [detailedInfo, setDetailedInfo] = useState({
        farmName: "",
        farmId: "",
        countryId: "",
        stateId: "",
        email: "",
        website: "",
        profilePic: "",
        profileImageuuid: "",
        isPromoted: false,
        promotedUrl: "",
    });
    const [overviewInfo, setOverviewInfo] = useState({
        overview: "",
    });
    const [checkUpdatetDetailedInfo, setCheckUpdatetDetailedInfo] = useState(false);
    const [checkUpdateOverviewInfo, setCheckUpdateOverviewInfo] = useState(false);
    const [count, setCount] = useState(0);

    const { pathname } = useLocation();
    const currentPage = pathname.split("/");
    const farmSubModule = currentPage[6];
    const farmID: any = (farmSubModule === 'filterbyfarmid') ? currentPage[5] : "";


    // Api calls
    const { data: countriesList } = useCountriesQuery();
    const { data: farmProfileData, isFetching: farmProfileFetching, isSuccess: farmProfileSuccess, currentData: farmProfileCurrentData } = useFarmPageProfileQuery({ pageId: farmPageId, farmId: farmId }, { skip: !farmId, refetchOnMountOrArgChange: true });
    const { data: farmMediaData, isFetching: farmMediaFetching, isSuccess: farmMediaSuccess, refetch: refetchFarmMedia } = useFarmPageMediaQuery({ pageId: farmPageId, farmId: farmId }, { skip: (farmId === '') });
    const farmMediaList: any = (farmMediaSuccess) ? farmMediaData : [];
    const { data: farmMediaByIdData, isFetching: isMediaFetching, isLoading: isMediaLoading, isSuccess: isMediaSuccess } = useGetFarmMediaQuery({ pageId: farmPageId, farmId: farmId, mediaId: rowId }, { skip: (!isEditMedia), refetchOnMountOrArgChange: true });

    const { data: farmGalleryImageData, isFetching: farmGalleryImageFetching, isSuccess: farmGalleryImageSuccess } = useFarmPageGalleryImageQuery({ pageId: farmPageId, farmId: farmId }, { skip: !farmId, refetchOnMountOrArgChange: true });
    const [uploadMediaStatus] = useUploadMediaStatusMutation();
    const [editFarmPage] = useEditFarmPageMutation();
    const [postHeroImages] = usePostFarmGalleryimageUploadMutation();
    const [heroImagesUpdate] = usePatchFarmProfileGalleryimageMutation();
    const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();
    const [setFarmPrifileImages] = useProfileImageUploadMutation();
    const [isProfileDeleted, setIsProfileDeleted] = useState(false);
    // const { data: currentStallion, isFetching, isLoading, isSuccess } = useStallionQuery(stallionId, { skip: (stallionId === '') });
    const {
        data: currentFarm,
        error,
        isFetching,
        isLoading,
        isSuccess,
    } = useFarmQuery(farmId, { skip: (farmId === '') });
    const [errors, setErrors] = useState<any>({});

    // validate Website Url
    const validateWebsiteUrl = (url: string): boolean => {
        // const pattern = /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.[a-z]{2,})(\/[^\s]*)?$/i;
        const pattern = /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;

        return pattern.test(url);
    };

    const validateEmail = (email: string): boolean => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    };

    // validate Form handler
    let validateForm = (data: any) => {
        /*eslint-disable */
        let errors = {};
        let formIsValid = true;
        //@ts-ignore    
        if (data.website !== '' && validateWebsiteUrl(data.website) === false) {
            formIsValid = false; //@ts-ignore
            errors['website'] = `Website is invalid`;
        }
        if (data.email !== '' && validateEmail(data.email) === false) {
            formIsValid = false; //@ts-ignore
            errors['email'] = `Incorrect email address`;
        }
        setErrors(errors);
        return formIsValid;
    };

    // error state handler
    useEffect(() => {
        let temp = { ...errors };
        if (detailedInfo.website) {
            delete temp.website;
        }
        if (detailedInfo.email) {
            delete temp.email;
        }
        setErrors(temp);
    }, [state]);

    const fileDetails = farmProfileCurrentData?.image ? farmProfileCurrentData?.image : null;
    const { data: stateList } = useStatesByCountryIdQuery(detailedInfo?.countryId, { skip: !detailedInfo?.countryId });
    const heroImages1 = {
        setFileUpload: setProfileFileUpload,
        fileDetails
    };

    // Call the function and get the result
    const [editedFarmMedia, setEditedFarmMedia] = React.useState({});
    const [mediaImage, setMediaImage] = useState<any>(null);
    React.useEffect(() => {
        if (editedFarmMedia && isMediaSuccess && !isMediaFetching) {
            setEditedFarmMedia(farmMediaByIdData);
            setMediaImage(farmMediaByIdData?.media?.length > 0 ? farmMediaByIdData?.media[0].mediaUrl : null);
        }
        if (editedFarmMedia && isMediaFetching && isMediaSuccess) {
            setEditedFarmMedia({});
            setMediaImage(null);
        }
    }, [isMediaFetching]);
    const isMediaModalHasData = isObjectEmpty(editedFarmMedia);

    // Set farm id
    React.useEffect(() => {
        setFarmId(farmID)
    }, [farmID]);

    // Set farm info
    React.useEffect(() => {
        if (farmProfileData) {
            setDetailedInfo({
                ...detailedInfo,
                farmName: farmProfileData.farmName,
                farmId: farmProfileData.farmId,
                countryId: farmProfileData.countryId,
                stateId: farmProfileData.stateId,
                email: farmProfileData.email,
                website: farmProfileData.website,
                profilePic: profileImageFile?.image ? profileImageFile?.image : null,
                isPromoted: profileImageFile?.isPromoted,
                promotedUrl: (farmProfileData?.isPromoted) ? `${BaseAPI}stud-farm/${farmProfileData.farmName}/${farmProfileData?.farmId}` : "",
            });
            setOverviewInfo({
                overview: farmProfileData?.overview,
            });
        }
    }, [farmProfileSuccess, farmProfileData]);

    // Handle farm form
    const handleCheckDetailedInfoChange = (type: string, event: any) => {

        if (type == 'countryId') {
            setDetailedInfo({
                ...detailedInfo,
                [type]: event.target.value,
                stateId: "none"
            })
          }else{
        setDetailedInfo({
            ...detailedInfo,
            [type]: event.target.value,
        })
    }
        setCheckUpdatetDetailedInfo(true);
    }

    // handle farm overview
    const handleCheckOverviewInfoChange = (type: string, event: any) => {
        setOverviewInfo({
            ...overviewInfo,
            [type]: event.target.value
        })
        setCheckUpdateOverviewInfo(true);
        setCount(event.target.value.length);
    }

    // Navigate to farm page in portal
    const handlePromotedFarmUrl = () => {
        window.open(`${BaseAPI}stud-farm/${farmProfileData.farmName}/${farmProfileData?.farmId}`, '_blank');
    }

    // Set the farm gallery image
    useEffect(() => {
        if (farmGalleryImageFetching === false && farmGalleryImageSuccess)
            if (farmGalleryImageData) {
                // let arr: any = [];
                // farmGalleryImageData?.map((res: any) => {
                //     if (!galleryImages.find((o: any) => o.mediauuid == res.mediauuid)) {
                //         arr.push(res);
                //     }
                // })
                setGalleryImages(farmGalleryImageData);
            }
        setIsFarmImageChange(false);
        setUploadInProgress(false);
    }, [farmGalleryImageSuccess, farmGalleryImageFetching])

    // Set farm profile image
    useEffect(() => {
        if (farmProfileFetching === false && farmProfileSuccess && farmProfileCurrentData) {
            setStateValue(
                {
                    ...state,
                    ...farmProfileCurrentData
                }
            );
            setFarmOverview(farmProfileData?.overview);
        }
        setCount((farmProfileCurrentData?.overview?.length) ? farmProfileCurrentData?.overview?.length : 0);
    }, [farmProfileFetching, farmProfileSuccess])

    // On farm change reset the value
    useEffect(() => {
        if (!farmId) {
            setStateValue({
                countryId: ''
            });
            setDetailedInfo({
                ...detailedInfo,
                countryId: ''
            });
            setFarmOverview('');
        }
    }, [farmId])

    // Farm profile Call upload api
    React.useEffect(() => {
        if (profileFileUpload && !profileFileUpload.isDeleted && profileFileUpload.path && profileFileUpload.size) {
            setCheckUpdatetDetailedInfo(true);
            try {
                setFarmPrifileImages({
                    fileName: profileFileUpload.path,
                    fileuuid: fileuuid,
                    fileSize: profileFileUpload.size,
                }).then(async (res: any) => {
                    const details = { profileFileUpload, fileuuid };
                    setProfileImageFile(details);
                    setPresignedProfilePath(res?.data?.url);
                    const uploadOptions = { method: 'Put', body: profileFileUpload };
                    const result = await fetch(res?.data?.url, uploadOptions);
                });
            } catch (error) {
            }
        }
        if (profileFileUpload && 'isDeleted' in profileFileUpload) {
            setCheckUpdatetDetailedInfo(true);
            setIsProfileDeleted(true);
            setProfileImageFile({ ...profileImageFile, fileuuid: null })
        }
    }, [profileFileUpload]);

    // Call farm gallery image upload api
    useEffect(() => {

        if (fileUpload && !fileUpload.isDeleted && fileUpload.path && fileUpload.size) {
            const fileAsDataURL = window.URL.createObjectURL(fileUpload)
            const img = new Image();
            img.src = fileAsDataURL;
            img.onload = function (this: any) {
                var height = this.height;
                var width = this.width;
                if (
                    height >= galleryResolution.height &&
                    width >= galleryResolution.width
                ) {
                    try {
                        postHeroImages({
                            fileName: fileUpload.path,
                            fileuuid: fileuuid,
                            farmId: farmId,
                            fileSize: fileUpload.size
                        }).then(async (res: any) => {
                            let galleryImagesTemp = galleryImages.filter((res: any) => res.position != fileUpload.position)
                            setGalleryImages([...galleryImages, {
                                file: fileUpload,
                                mediauuid: fileuuid,
                                url: res.data.url,
                                isNew: true,
                                position: fileUpload.position
                            }]);
                            const uploadOptions = { method: 'Put', body: fileUpload };
                            const result = await fetch(res.data.url, uploadOptions);
                            setIsFarmImageChange(true);
                        });

                    } catch (error) {
                    }
                }
            }
        }
        if (fileUpload && 'isDeleted' in fileUpload) {
            setIsFarmImageChange(true);
            let imagesDeletedId = [...heroImagesDeletedId, fileUpload.mediauuid];
            setHeroImagesDeletedId(imagesDeletedId);
            const removeSpecificFile = galleryImages.map((res: any) => {
                return {
                    ...res,
                    isDeleted: imagesDeletedId.includes(res.mediauuid) ? true : false
                }
            });
            setGalleryImages([...removeSpecificFile]);
        }
    }, [fileUpload])
    console.log(galleryImages, 'galleryImages');

    const CHARACTER_LIMIT = 1180;
    const [openHeader, setOpenHeader] = useState(false);
    const { collapseClick, isCollapse } = useCollapseDrawer();

    // Handle form state
    const handleChangeField = (type: any, targetValue: any) => {
        setStateValue({
            ...state,
            [type]: targetValue
        })
    }

    // Save farm page data
    const handleOnSave = async (saveType: string) => {
        let reqObj: any = {
            pageId: farmPageId,
            farmId: farmId,
        }
        // console.log(galleryImages, 'galleryImages')
        if (saveType === 'overview') {
            reqObj.overview = overviewInfo?.overview;
        }
        if (saveType === 'farmImages') {
            let arr: any = []
            let isProfile = profileImageFile?.fileuuid ? profileImageFile?.fileuuid : null;
            galleryImages?.map((element: any) => {
                let galleryObj: any = {};
                if (element.isDeleted === true) {
                    galleryObj.isDeleted = true;
                    galleryObj.mediauuid = element.mediauuid;
                }
                if (element.isNew === true) {
                    galleryObj.isDeleted = false;
                    galleryObj.mediauuid = element.mediauuid;
                }

                if (!(element.isNew === true && element.isDeleted === true)) {
                    arr.push(galleryObj);
                }
            });
            let filteredArr: any = [];
            filteredArr = arr.filter((v: any) => JSON.stringify(v) !== '{}');
            // console.log(filteredArr, 'filteredArr')
            reqObj.galleryImages = [...filteredArr];
        }
        if (saveType === 'farmDetails') {
            if (!validateForm(detailedInfo)) return;
            let isProfile = profileImageFile?.fileuuid ? profileImageFile?.fileuuid : null;
            reqObj.profile = {
                farmName: detailedInfo.farmName,
                countryId: detailedInfo.countryId,
                stateId: detailedInfo.stateId,
                email: detailedInfo.email,
                website: detailedInfo.website,
                profileImageuuid: isProfile,
                isProfileImageDeleted: isProfileDeleted
            }
        }
        // console.log(reqObj, 'galleryImages reqObj')
        let res: any = await editFarmPage(reqObj);
        if (res?.data) {
            setIsProfileDeleted(false);
            setIsFarmImageChange(false);
            sendGallary();
            setGalleryImages([]);
            if (profileImageFile?.fileuuid) {
                uploadMediaStatus([profileImageFile?.fileuuid]);
            }
        }
        setApiStatusMsg({ 'status': 201, 'message': '<b>Farm details successfully updated!</b>' });
        setApiStatus(true);
        setCheckUpdatetDetailedInfo(false);
        setCheckUpdateOverviewInfo(false);
    }

    const sendGallary = async () => {
        setUploadInProgress(true);
        const updatedFields = galleryImages.filter((image: any) => {
            if (image.isDeleted || image.isNew) {
                return {
                    isDeleted: image.isDeleted ? image.isDeleted : false,
                    mediauuid: image.mediauuid,
                };
            }
        });

        const mediaFileuuid: any = updatedFields
            ?.filter((res: any) => res.isNew)
            .map((res: any) => res.mediauuid);


        galleryImages.map(async (image: any) => {
            if (image.url) {
                const uploadOptions = { method: 'Put', body: image.file };
                const result = await fetch(image.url, uploadOptions);
            }
        });

        let count = 1;
        const interval = setInterval(async () => {
            if (count >= 1) {
                let data: any = await mediaUploadSuccess(
                    mediaFileuuid
                );
                if (data.error.data != 'SUCCESS') {
                    count++;
                    if (count === 10) {
                        clearInterval(interval);
                    }
                } else {
                    count = 0;
                    editFarmPage({});
                }
            }
        }, 3000);
    }

    // Open edit media
    const handleEditPopup = () => {
        setOpenMedia(true);
    }

    // Open Edit popup
    const handleEditState = () => {
        setEditMedia(true);
    }

    // Close edit popup
    const handleEditPopupClose = () => {
        setOpenMedia(false);
        setEditMedia(false);
        setEditedFarmMedia({});
    }

    // Close media popup
    const handleCloseTestimonialModal = () => {
        SetOpenMediaModal(false);
        setEditedFarmMedia({});
    };
    const ITEM_HEIGHT = 35;
    const ITEM_PADDING_TOP = 8;
    const MenuPropss: any = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                minWidth: '357px',
                marginTop: '-1px',
                marginLeft: '0px',
                boxShadow: 'none',
                border: 'solid 1px #161716',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                boxSizing: 'border-box',
            },
        },

    }

    return (
        <StyledEngineProvider injectFirst>
            <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
            <Page title="Farm Page" sx={{ display: 'flex' }} className='HomepageData'>
                {/* Marketing filter side bar for navigating to different pages  */}
                {/* <MarketingFilterSidebar /> */}
                <Box className='HomepageDataRight' sx={{ width: '100%' }} px={2}>
                    <Container>
                        {/* Show success or error toast message */}
                        {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
                        {filterCounterhook.value >= 2 && marketingModuleAccess.marketing_viewonly === false ? (
                            <UnAuthorized />
                        ) :
                            <Box mt={3} className='HomepageDataBody'>
                                {/* Farm AutoComplete to select farm */}
                                {(farmID === '') && <Box className='HomeBlockWrapper'>
                                    <Grid container spacing={2} className='hp-heading-block'>
                                        <Grid item lg={9} sm={9} className='hp-heading-block-left'>
                                            <Grid className='hp-form-block' container>
                                                <Grid item lg={6} sm={6} className='hp-form-item'>
                                                    <Box className='edit-field'>
                                                        <FarmAutoComplete
                                                            horseName={toPascalCase(state.horseName)}
                                                            farmName={toPascalCase(state?.farmName)}
                                                            sex={'M'}
                                                            isEdit={isEdit}
                                                            isExist={isEdit ? true : false}
                                                            isOpen={open}
                                                            runnersModuele={true}
                                                            setStateValueId={(value: any) => {
                                                                setStateValue({ ...state, farmId: value.farmId, farmName: value.farmName });
                                                                setFarmId(value.farmId);
                                                            }}
                                                        />
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Box>}
                                {/* Farm AutoComplete to select farm */}

                                {!farmProfileSuccess === true ?
                                    <Box className='Spinner-Wrp' sx={{ minHeight: 350 }} > <StallionSpinner /> </Box> :
                                    <Box className='HomeBlockWrapper' mt={4}>
                                        <Grid container spacing={0} className='hp-heading-block'>
                                            {/* Farm details */}
                                            <Grid item lg={10} sm={10} pr={7} className='hp-heading-block-left'>
                                                <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Farm Details</Typography>

                                                <Grid className='hp-form-block' container spacing={3}>
                                                    <Grid item lg={6} sm={6} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name=""
                                                                placeholder='Farm Name'
                                                                value={toPascalCase(detailedInfo?.farmName)}
                                                                onChange={(e: any) => handleCheckDetailedInfoChange("farmName", e)}
                                                                className='hp-form-input'
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={6} sm={6} className='hp-form-item'>
                                                    </Grid>
                                                    <Grid item lg={6} sm={6} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <Select
                                                                IconComponent={KeyboardArrowDownRoundedIcon}
                                                                MenuProps={MenuProps}
                                                                onChange={(e) => handleCheckDetailedInfoChange("countryId", e)}
                                                                value={detailedInfo?.countryId === '' ? 'none' : detailedInfo?.countryId}
                                                                className="filter-slct" name="countryId">
                                                                <MenuItem className="selectDropDownList" value="none" disabled><em>Country</em></MenuItem>
                                                                {countriesList?.map((val: any) => {
                                                                    return (
                                                                        <MenuItem className="selectDropDownList countryDropdownList farmCountry" value={val.id} key={val.id}>{val.countryName}</MenuItem>
                                                                    );
                                                                })}
                                                            </Select>
                                                        </Box>
                                                    </Grid>
                                                    {stateList && stateList?.length > 0 && <Grid item lg={6} sm={6} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <Select IconComponent={KeyboardArrowDownRoundedIcon}
                                                                MenuProps={MenuPropss}
                                                                onChange={(e) => handleCheckDetailedInfoChange("stateId", e)}
                                                                value={(detailedInfo?.stateId === '' || detailedInfo?.stateId === null )? 'none' : stateList?.length === 0 ? 'none' : detailedInfo?.stateId}
                                                                className="filter-slct" name="stateId">
                                                                <MenuItem className="selectDropDownList" value="none" disabled><em>State</em></MenuItem>
                                                                {stateList?.map((v: any, i: number) => {
                                                                    return <MenuItem className="selectDropDownList" value={v?.id} key={v?.id}>{v?.stateName}</MenuItem>
                                                                })}
                                                            </Select>
                                                        </Box>
                                                    </Grid>}
                                                    <Grid item lg={6} sm={6} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField
                                                                error={errors.email ? true : false}
                                                                className='hp-form-input'
                                                                name=""
                                                                placeholder='Email Address'
                                                                value={detailedInfo?.email}
                                                                onChange={(e) => handleCheckDetailedInfoChange("email", e)}
                                                            />
                                                            {errors.email && <div className="errorMsg">{errors.email}</div>}
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={6} sm={6} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField
                                                                error={errors.website ? true : false}
                                                                name=""
                                                                placeholder='Website'
                                                                value={detailedInfo?.website}
                                                                onChange={(e) => handleCheckDetailedInfoChange("website", e)}
                                                                className='hp-form-input'
                                                            />
                                                            {errors.website && <div className="errorMsg">{errors.website}</div>}
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={6} sm={6} className='hp-form-item'>
                                                        <Box className='edit-field url-icon'>
                                                            <TextField
                                                                name=""
                                                                placeholder='Stallion Match URL'
                                                                value={detailedInfo?.promotedUrl}
                                                                disabled
                                                                onChange={(e: any) => handleChangeField("url", e.target.value)}
                                                                InputProps={{
                                                                    endAdornment: <InputAdornment position="end" className='end-link'>{(state.isPromoted) && <i className='icon-Link-green' onClick={handlePromotedFarmUrl} />}</InputAdornment>,
                                                                }}
                                                                className='hp-form-input'
                                                            />

                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={6} sm={6} className='hp-form-item' sx={{ display: 'flex', alignItems: 'center' }}>
                                                        &nbsp;&nbsp;&nbsp;
                                                        <Button type='button' className='link-btn'
                                                            onClick={
                                                                () => {
                                                                    // navigate(PATH_DASHBOARD.farms.filter(state.farmName));
                                                                    window.open(PATH_DASHBOARD.farms.filter(state.farmName), '_blank');
                                                                }
                                                            }
                                                        >View Farm Details</Button>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            {/* End Farm details */}
                                            {/* Farm Profile */}
                                            <Grid item lg={2} sm={2} className='hp-heading-block-right'>
                                                <Box className='bg-image-uploader sm'>
                                                    {farmProfileFetching === false && <CustomDropzone data={heroImages1} size={{ h: 250, w: 250 }} />}
                                                </Box>
                                            </Grid>
                                            {/* End Farm Profile */}
                                            {checkUpdatetDetailedInfo && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '9px !important', }}>
                                                <Stack className='home-btn  save-btn-wrpr'>
                                                    <Button variant='contained' className='search-btn' type='button' onClick={() => handleOnSave('farmDetails')}>Save</Button>
                                                </Stack>
                                            </Grid>}
                                        </Grid>
                                        {/* Farm Gallery image list */}
                                        {farmGalleryImageSuccess && farmGalleryImageFetching === false &&
                                            <Box className='HomeBlockWrapper farmImagesWrapper' mt={4}>
                                                <Grid container spacing={0} className='hp-heading-block'>
                                                    <Grid item lg={12} sm={12} className='hp-heading-block-left'>
                                                        <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Farm Images</Typography>

                                                        <Grid className='hp-image-block' container spacing={1.5}>
                                                            {!uploadInProgress && new Array(8).fill(0).map((item: any, index: any) => {
                                                                console.log(farmGalleryImageData, galleryImages, index, 'fileDetails>>>')
                                                                const fileDetails = farmGalleryImageData?.length ? farmGalleryImageData[index] : null;
                                                                const heroImages = {
                                                                    setFileUpload,
                                                                    fileDetails,
                                                                    position: index
                                                                };
                                                                // console.log(fileDetails, 'fileDetails1234')
                                                                return (
                                                                    <Grid item lg={1.5} sm={1.5} className='hp-image-item' key={index}>
                                                                        <Box className='bg-image-uploader sm' >
                                                                            <CustomDropzone data={heroImages} galleryResolution={galleryResolution} size={{ h: 200, w: 200 }} />
                                                                        </Box>
                                                                    </Grid>
                                                                )
                                                            }
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                    {isFarmImageChange && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '9px !important', }}>
                                                        <Stack className='home-btn  save-btn-wrpr'>
                                                            <Button variant='contained' className='search-btn' type='button' onClick={() => handleOnSave('farmImages')}>Save</Button>
                                                        </Stack>
                                                    </Grid>}
                                                </Grid>
                                            </Box>
                                        }
                                        {/* End Farm Gallery image list */}

                                        {/* Farm overview  */}
                                        <Box className='HomeBlockWrapper' mt={4}>
                                            <Grid container spacing={0} className='hp-heading-block'>
                                                <Grid item lg={12} sm={12} pr={7} className='hp-heading-block-left'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Overview</Typography>

                                                    <Grid className='hp-form-block' container spacing={3}>
                                                        <Grid item lg={12} sm={12} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField
                                                                    name=""
                                                                    placeholder='Enter Overview'
                                                                    className='hp-form-input'
                                                                    multiline
                                                                    rows={7}
                                                                    // defaultValue={farmOverview}
                                                                    inputProps={{
                                                                        maxLength: CHARACTER_LIMIT
                                                                    }}
                                                                    helperText={`${count}/${CHARACTER_LIMIT}`}
                                                                    // onChange={(e: any) => setFarmOverview(e.target.value)}
                                                                    defaultValue={overviewInfo?.overview}
                                                                    onChange={(e: any) => handleCheckOverviewInfoChange("overview", e)}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        {checkUpdateOverviewInfo && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '0px !important', }}>
                                                            <Stack className='home-btn  save-btn-wrpr'>
                                                                <Button variant='contained' className='search-btn' onClick={() => handleOnSave('overview')} type='button'>Save</Button>
                                                            </Stack>
                                                        </Grid>}

                                                    </Grid>

                                                </Grid>
                                            </Grid>
                                        </Box>
                                        {/* End Farm overview  */}

                                        {false && <Box className='HomeBlockWrapper Media-Tiles-Wrapper' mt={4}>
                                            <Grid container spacing={0} className='hp-heading-block'>
                                                <Grid item lg={9} sm={9} pr={0} className='hp-heading-block-left'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Media Tiles</Typography>

                                                    <Grid className='hp-form-block' container spacing={3}>
                                                        <Grid item lg={8} sm={8} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField name="" placeholder='Media 1 Title' defaultValue='' className='hp-form-input' />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item lg={4} sm={4} className='hp-form-item' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                                                            <Button type='button' className='href-btn'>Clear Media Tile</Button>
                                                        </Grid>
                                                        <Grid item lg={12} sm={12} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField name="" placeholder='' defaultValue='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ultrices nunc, sit enim a. Pellentesque augue odio blandit eget. Enim duis viverra amet maecenas nibh massa. Fusce pretium tristique ut sagittis purus scelerisque sit. Diam nisl semper id diam rutrum ornare. Scelerisque blandit ornare risus lacus. Id at convallis ultrices posuere mauris. Fusce pretium tristique ut sagittis purus scelerisque sit. Diam nisl semper id diam rutrum ornare. Scelerisque blandit ornare risus lacus. Id at convallis ultrices posuere mauris' className='hp-form-input' multiline rows={5.4} />
                                                            </Box>
                                                        </Grid>

                                                    </Grid>

                                                </Grid>
                                                <Grid item lg={3} sm={3} pl={2} className='hp-heading-block-right'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}></Typography>
                                                    <Box className='bg-image-uploader md'>
                                                        <Box className='draganddrop'>
                                                            <i className="icon-Photograph"></i>
                                                            <Typography variant='h6'>Drag and drop your images here</Typography>
                                                            <span>or <a href='#'>upload</a> from your computer</span>
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                                <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '15px !important', }}>
                                                    <Stack className='home-btn  save-btn-wrpr'>
                                                        <Button variant='contained' className='search-btn' type='button'>Save</Button>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        }

                                        {false && <Box className='HomeBlockWrapper Media-Tiles-Wrapper' mt={4}>
                                            <Grid container spacing={0} className='hp-heading-block'>
                                                <Grid item lg={9} sm={9} pr={0} className='hp-heading-block-left'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Media Tiles</Typography>

                                                    <Grid className='hp-form-block' container spacing={3}>
                                                        <Grid item lg={8} sm={8} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField name="" placeholder='Media 2 Title' defaultValue='' className='hp-form-input' />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item lg={4} sm={4} className='hp-form-item' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                                                            <Button type='button' className='href-btn'>Clear Media Tile</Button>
                                                        </Grid>
                                                        <Grid item lg={12} sm={12} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField name="" placeholder='' defaultValue='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ultrices nunc, sit enim a. Pellentesque augue odio blandit eget. Enim duis viverra amet maecenas nibh massa. Fusce pretium tristique ut sagittis purus scelerisque sit. Diam nisl semper id diam rutrum ornare. Scelerisque blandit ornare risus lacus. Id at convallis ultrices posuere mauris. Fusce pretium tristique ut sagittis purus scelerisque sit. Diam nisl semper id diam rutrum ornare. Scelerisque blandit ornare risus lacus. Id at convallis ultrices posuere mauris' className='hp-form-input' multiline rows={5.4} />
                                                            </Box>
                                                        </Grid>

                                                    </Grid>

                                                </Grid>
                                                <Grid item lg={3} sm={3} pl={2} className='hp-heading-block-right'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}></Typography>
                                                    <Box className='bg-image-uploader md'>
                                                        {/* <CustomDropzone data={heroImages} /> */}

                                                        <Box className='draganddrop'>
                                                            <i className="icon-Photograph"></i>
                                                            <Typography variant='h6'>Drag and drop your images here</Typography>
                                                            <span>or <a href='#'>upload</a> from your computer</span>
                                                        </Box>
                                                        {/* <Typography variant="subtitle2" textAlign='center'>1920px x 1080px 144dpi</Typography> */}
                                                    </Box>
                                                </Grid>
                                                <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '15px !important', }}>
                                                    <Stack className='home-btn  save-btn-wrpr'>
                                                        <Button variant='contained' className='search-btn' type='button'>Save</Button>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Box>}

                                        {false && <Box className='HomeBlockWrapper Media-Tiles-Wrapper' mt={4}>
                                            <Grid container spacing={0} className='hp-heading-block'>
                                                <Grid item lg={9} sm={9} pr={0} className='hp-heading-block-left'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Media Tiles</Typography>

                                                    <Grid className='hp-form-block' container spacing={3}>
                                                        <Grid item lg={8} sm={8} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField name="" placeholder='Media 3 Title' defaultValue='' className='hp-form-input' />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item lg={4} sm={4} className='hp-form-item' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
                                                            <Button type='button' className='href-btn'>Clear Media Tile</Button>
                                                        </Grid>
                                                        <Grid item lg={12} sm={12} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField name="" placeholder='' defaultValue='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ultrices nunc, sit enim a. Pellentesque augue odio blandit eget. Enim duis viverra amet maecenas nibh massa. Fusce pretium tristique ut sagittis purus scelerisque sit. Diam nisl semper id diam rutrum ornare. Scelerisque blandit ornare risus lacus. Id at convallis ultrices posuere mauris. Fusce pretium tristique ut sagittis purus scelerisque sit. Diam nisl semper id diam rutrum ornare. Scelerisque blandit ornare risus lacus. Id at convallis ultrices posuere mauris' className='hp-form-input' multiline rows={5.4} />
                                                            </Box>
                                                        </Grid>

                                                    </Grid>

                                                </Grid>
                                                <Grid item lg={3} sm={3} pl={2} className='hp-heading-block-right'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}></Typography>
                                                    <Box className='bg-image-uploader md'>
                                                        {/* <CustomDropzone data={heroImages} /> */}

                                                        <Box className='draganddrop'>
                                                            <i className="icon-Photograph"></i>
                                                            <Typography variant='h6'>Drag and drop your images here</Typography>
                                                            <span>or <a href='#'>upload</a> from your computer</span>
                                                        </Box>
                                                        {/* <Typography variant="subtitle2" textAlign='center'>1920px x 1080px 144dpi</Typography> */}
                                                    </Box>
                                                </Grid>

                                            </Grid>
                                        </Box>}

                                        {/* Farm Media */}
                                        <Box className='hp-table-wrapper'>
                                            <TableContainer className='datalist' sx={{ minWidth: 800 }}>
                                                <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="left">Tile</TableCell>
                                                            <TableCell align="left">Description</TableCell>
                                                            <TableCell align="center">Image</TableCell>
                                                            <TableCell align="left"></TableCell>
                                                        </TableRow>
                                                    </TableHead>

                                                    {farmMediaFetching === false && farmMediaSuccess && <TableBody>
                                                        {farmMediaList?.map((row: any, index: number) => (
                                                            <FarmMediaListTableRow
                                                                key={row.mediaInfoId}
                                                                row={row}
                                                                farmId={farmId}
                                                                pageId={farmPageId}
                                                                selected={row.mediaInfoId}
                                                                onSelectRow={row.mediaInfoId}
                                                                onEditPopup={() => handleEditPopup()}
                                                                onSetRowId={() => setRowId(row.mediaInfoId)}
                                                                handleEditState={() => handleEditState()}
                                                                apiStatus={true}
                                                                setApiStatus={setApiStatus}
                                                                apiStatusMsg={apiStatusMsg}
                                                                setApiStatusMsg={setApiStatusMsg}
                                                                refetchFarmMedia={refetchFarmMedia}
                                                            />
                                                        ))}
                                                    </TableBody>}
                                                </Table>
                                            </TableContainer>
                                        </Box>
                                        {/* End Farm Media */}

                                        <Box className='HomeBlockWrapper' mt={2}>
                                            <Grid container spacing={2} className='hp-heading-block'>
                                                <Grid item lg={12} sm={12} className='hp-heading-block-bottom hp-heading-block-twobutton' sx={{ paddingTop: '15px !important', }}>
                                                    <Box className='addCarouselwrapper farmMedia' mt={0} textAlign='center'>
                                                        <Button type='button' className='addcarousel-btn' onClick={() => SetOpenMediaModal(true)}>Add Media</Button>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Box>
                                }
                            </Box>
                        }
                    </Container>
                </Box>
                {/* Farm Add/Edit Media modal */}
                {!isEditMedia &&
                    <FarmMediaEditModal
                        openAddEditForm={openMediaModal}
                        handleDrawerCloseRow={handleCloseTestimonialModal}
                        handleCloseEditState={handleEditPopupClose}
                        pageId={farmPageId}
                        farmId={farmId}
                        isEdit={undefined}
                        apiStatus={true}
                        setApiStatus={setApiStatus}
                        apiStatusMsg={apiStatusMsg}
                        setApiStatusMsg={setApiStatusMsg}
                        refetchFarmMedia={refetchFarmMedia}
                        editedFarmMedia={editedFarmMedia}
                        setEditedFarmMedia={setEditedFarmMedia}
                        mediaImage={mediaImage}
                        setMediaImage={setMediaImage}
                        isMediaFetching={isMediaFetching}
                    />
                }
                {isEditMedia && openTestimonail && isMediaSuccess && isMediaModalHasData && !isMediaFetching &&
                    <FarmMediaEditModal
                        pageId={farmPageId}
                        farmId={farmId}
                        openAddEditForm={openTestimonail}
                        rowId={rowId}
                        isEdit={isEditMedia}
                        handleEditPopup={handleEditState}
                        handleCloseEditState={handleEditPopupClose}
                        apiStatus={true}
                        setApiStatus={setApiStatus}
                        apiStatusMsg={apiStatusMsg}
                        setApiStatusMsg={setApiStatusMsg}
                        refetchFarmMedia={refetchFarmMedia}
                        editedFarmMedia={editedFarmMedia}
                        setEditedFarmMedia={setEditedFarmMedia}
                        mediaImage={mediaImage}
                        setMediaImage={setMediaImage}
                        isMediaFetching={isMediaFetching}
                    />
                }

            </Page>
        </StyledEngineProvider>
    );
}

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { v4 as uuid } from 'uuid';
// mui
import {
    Box,
    Typography,
    Container,
    Grid,
    Stack,
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
import Select from '@mui/material/Select';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Page from 'src/components/Page';
// import CustomDropzonewithcrop from 'src/components/CustomDropzone';
import 'src/sections/@dashboard/marketing/marketing.css'
import MarketingFilterSidebar from 'src/sections/@dashboard/marketing/filter/MarketingFilterSidebar';
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import StallionAutoFilter from 'src/components/StallionAutoFilter';
import { useStallionQuery, useProfileImageUploadMutation } from 'src/redux/splitEndpoints/stallionsSplit';
import { range } from 'src/utils/formatYear';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useColoursQuery } from 'src/redux/splitEndpoints/coloursSplit';
import { StallionSpinner } from 'src/components/StallionSpinner';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useNavigate } from 'react-router-dom';
import {
    useStallionTestimonialsQuery,
    useStallionTestimonialQuery,
    useEditMarketingStallionMutation,
    useGetStallionGalleryImagesQuery,
    usePatchStallionProfileGalleryimageMutation,
    useFarmGalleryImagesUploadStatusMutation
} from 'src/redux/splitEndpoints/marketingSplit';
import StallionTestimonialListTableRow from 'src/sections/@dashboard/marketing/stallionpage/list/StallionTestimonialListTableRow';
import StallionTestimonialEditModal from 'src/sections/@dashboard/marketing/stallionpage/StallionTestimonialEditModal';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import StallionFarmAutoComplete from 'src/components/StallionFarmAutoComplete';
import { toPascalCase, isObjectEmpty } from 'src/utils/customFunctions';
import { Spinner } from 'src/components/Spinner';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import CustomDropzone from 'src/components/CustomDropzone';
import CustomDropzonewithcrop from 'src/components/CustomDropzonewithcrop';


export default function MarketingStallionData() {
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

    React.useEffect(() => {
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

    React.useEffect(() => {
        if (valuesExist.hasOwnProperty('MARKETING_STALLION_PAGE_PROMOTED')) {
            setUserModuleAccess(true);
        }
        setMarketingModuleAccess({
            ...marketingModuleAccess,
            marketing_viewonly: !valuesExist?.hasOwnProperty('MARKETING_STALLION_PAGE_PROMOTED') ? false : true,
            marketing_update: !valuesExist?.hasOwnProperty('MARKETING_STALLION_PAGE_PROMOTED') ? false : true,
        });
        filterCounterhook.increment();
    }, [valuesExist]);

    const stallionPageId = process.env.REACT_APP_MARKETING_STALLION_PAGE_ID;
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
    const BaseAPI = process.env.REACT_APP_PUBLIC_URL;

    const navigate = useNavigate();
    const [open, setOpen] = useState(true);
    const [isEdit, setEdit] = useState(true);
    const [rowId, setRowId] = useState("");
    const [openTestimonail, setOpenTestimonail] = useState(false);
    const [isEditTestimonail, setEditTestimonail] = useState(false);
    const [openTestimonialModal, SetOpenTestimonialModal] = useState(false);
    const [profileFileUpload, setProfileFileUpload] = useState<any>();
    const [heroImagesDeletedId, setHeroImagesDeletedId] = useState<any>([]);
    const [isStallionHeroImageChange, setIsStallionHeroImageChange] = useState(false);
    const [apiStatus, setApiStatus] = useState(false);
    const [apiStatusMsg, setApiStatusMsg] = useState({});
    const [openHeader, setOpenHeader] = useState(false);
    const { collapseClick, isCollapse } = useCollapseDrawer();
    const [stallionId, setStallionId] = React.useState("");
    const [isClearAutoComplete, setIsClearComplete] = React.useState(false);
    const [fileUpload, setFileUpload] = useState<any>();
    const [galleryImages, setGalleryImages] = useState<any>([]);
    const [presignedProfilePath, setPresignedProfilePath] = useState<any>();
    const [profileImageFile, setProfileImageFile] = useState<any>();
    const [checkUpdatetDetailedInfo, setCheckUpdatetDetailedInfo] = useState(false);
    const [checkUpdateOverviewInfo, setCheckUpdateOverviewInfo] = useState(false);
    const [detailedInfo, setDetailedInfo] = useState({
        horseName: "",
        farmName: "",
        farmId: "",
        currencyId: "",
        colourId: "",
        fee: "",
        feeYear: "",
        height: "",
        yearToStud: "",
        profilePic: "",
        profileImageuuid: "",
        promotedUrl: "",
        yob: "",
    });
    const [overviewInfo, setOverviewInfo] = useState({
        overview: "",
    });
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
        yob: "",
        colourId: "",
        profileImageuuid: null,
        startDate: "",
        stateId: "",
        yearToStud: "",
        yearToRetired: "",
        isActive: false,
        isPromoted: false,
        promotedUrl: "",
        overview: "",
        profilePic: ""
    });

    const [changeState, setChangeState] = useState({
        id: "",
        farmId: "",
        currencyId: "",
        fee: "",
        height: "",
        feeYear: "",
        profileImageuuid: null,
        yearToStud: "",
        overview: "",
        profilePic: ""
    });
    const [count, setCount] = useState(0);

    // Constanst
    const galleryResolution = { height: 1280, width: 1920 };
    const fileuuid: any = uuid();
    const { pathname } = useLocation();
    const currentPage = pathname.split("/");
    const stallionSubModule = currentPage[6];
    const stallionID: any = (stallionSubModule === 'filterbystallionid') ? currentPage[5] : "";
    const yob = range(1990, 2050);
    const CHARACTER_LIMIT = 1180;

    // Set stallion id
    React.useEffect(() => {
        setStallionId(stallionID)
    }, [stallionID]);

    // Api calls
    const { data: currencyList } = useCurrenciesQuery();
    const { data: coloursList } = useColoursQuery();
    const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();
    const [postHeroImages] = usePatchStallionProfileGalleryimageMutation();
    const [updateStallion] = useEditMarketingStallionMutation();
    const [setStallionProfileImages] = useProfileImageUploadMutation();
    const { data: stallionGalleryImages, isSuccess: isStallionGalleryImagesSuccess, isFetching: isStallionGalleryImagesFetching } = useGetStallionGalleryImagesQuery({ stallionId: stallionId, pageId: stallionPageId }, { skip: (stallionId === '') });
    const { data: currentStallion, isFetching, isLoading, isSuccess } = useStallionQuery(stallionId, { skip: (stallionId === '') });
    const { data: currentStallionTestimonial, isFetching: isStallionTestimonialFetching, isLoading: isStallionTestimonialLoading, isSuccess: isStallionTestimonialSuccess, refetch: refetchStallionTestimonial } = useStallionTestimonialsQuery({ stallionId: stallionId, pageId: stallionPageId }, { skip: (stallionId === '') });
    const stallionTestimonialList: any = (isStallionTestimonialSuccess) ? currentStallionTestimonial : [];

    const { data: stallionTestimonialData, isFetching: isTestimonialFetching, isLoading: isTestimonialLoading, isSuccess: isTestimonialSuccess, refetch: refetchTestimonial } = useStallionTestimonialQuery({ pageId: stallionPageId, stallionId: stallionId, testimonialId: rowId }, { skip: (!isEditTestimonail), refetchOnMountOrArgChange: true });

    // Call the function and get the result
    const [editedStallionTestimonial, setEditedStallionTestimonial] = React.useState({});
    const [testimonialImage, setTestimonialImage] = useState<any>(null);
    React.useEffect(() => {
        if (isEditTestimonail && isTestimonialSuccess && !isTestimonialFetching) {
            setEditedStallionTestimonial(stallionTestimonialData);
            setTestimonialImage(stallionTestimonialData?.media?.length > 0 ? stallionTestimonialData?.media[0].mediaUrl : null);
        }
        if (isEditTestimonail && isTestimonialFetching && isTestimonialSuccess) {
            setEditedStallionTestimonial({});
            setTestimonialImage(null);
        }
    }, [isTestimonialFetching]);
    const isTestimonialModalHasData = isObjectEmpty(editedStallionTestimonial);

    // Set gallery image
    React.useEffect(() => {
        if (isStallionGalleryImagesSuccess) {
            setGalleryImages(stallionGalleryImages);
            setIsStallionHeroImageChange(false);
        }
    }, [isStallionGalleryImagesSuccess, isStallionGalleryImagesFetching]);

    //Upload stallion profile image upload and delete
    React.useEffect(() => {
        if (profileFileUpload && !profileFileUpload.isDeleted && profileFileUpload.path && profileFileUpload.size) {
            try {
                setStallionProfileImages({
                    fileName: profileFileUpload.path,
                    fileuuid: fileuuid,
                    fileSize: profileFileUpload.size,
                }).then(async (res: any) => {
                    const details = { profileFileUpload, fileuuid };
                    setProfileImageFile(details);
                    setPresignedProfilePath(res.data.url);
                    setCheckUpdatetDetailedInfo(true);
                });
            } catch (error) {
            }
        }
        if (profileFileUpload && profileFileUpload.isDeleted) {
            try {
                setProfileImageFile('');
                setCheckUpdatetDetailedInfo(true);
            } catch (error) {
            }
        }
    }, [profileFileUpload]);

    // Call stallion hero image upload api and check if delete
    React.useEffect(() => {
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
                            stallionId: stallionId,
                            fileSize: fileUpload.size,
                            pageId: stallionPageId
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
                            setIsStallionHeroImageChange(true);
                        });

                    } catch (error) {
                    }
                }
            }
        }
        if (fileUpload && 'isDeleted' in fileUpload) {
            setIsStallionHeroImageChange(true);
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

    // Stallion pic variable
    const fileDetails = currentStallion?.profilePic ? currentStallion?.profilePic : null;
    const heroImages = {
        setFileUpload: setProfileFileUpload,
        fileDetails
    };

    // Open Testimonial popup
    const handleEditPopup = () => {
        setOpenTestimonail(true);
    }

    // Edit testimonial
    const handleEditState = () => {
        setEditTestimonail(true);
    }

    // Close testimonial
    const handleEditPopupClose = () => {
        setOpenTestimonail(false);
        setEditTestimonail(false);
        setEditedStallionTestimonial({});
    }

    // Close testimonial modal
    const handleCloseTestimonialModal = () => {
        SetOpenTestimonialModal(false);
        setEditedStallionTestimonial({});
    };

    // handle default value
    const handleDefaultValues = () => {
        setStateValue({
            ...state,
            horseName: currentStallion?.horseName,
            farmName: currentStallion?.farmName,
            farmId: currentStallion?.farmId,
            horseId: currentStallion?.horseId,
            countryId: currentStallion?.countryId > 0 ? currentStallion?.countryId : 0,
            stateId: currentStallion?.stateId > 0 ? currentStallion?.stateId : 0,
            id: currentStallion?.stallionId,
            isPromoted: currentStallion?.isPromoted,
            isActive: currentStallion?.isActive,
            feeYear: currentStallion?.feeYear,
            yob: currentStallion?.yob,
            colourId: currentStallion?.colourId,
            currencyId: currentStallion?.currencyId,
            fee: currentStallion?.fee,
            isPrivateFee: (currentStallion?.isPrivateFee) ? "1" : "0",
            height: currentStallion?.height,
            yearToStud: currentStallion?.yearToStud,
            yearToRetired: currentStallion?.yearToRetired,
            reasonId: currentStallion?.reasonId > 0 ? currentStallion?.reasonId : "",
            promotedUrl: (currentStallion?.isPromoted) ? `${BaseAPI}stallions/${currentStallion.horseName}/${currentStallion?.stallionId}/View` : "",
            overview: currentStallion?.overview,
            profilePic: currentStallion?.profilePic,
        });

        setChangeState({
            ...changeState,
            farmId: currentStallion?.farmId,
            id: currentStallion?.stallionId,
            feeYear: currentStallion?.feeYear,
            currencyId: currentStallion?.currencyId,
            fee: currentStallion?.fee,
            height: currentStallion?.height,
            yearToStud: currentStallion?.yearToStud,
            overview: currentStallion?.overview,
            profilePic: currentStallion?.profilePic,
        })
        setCount((currentStallion?.overview?.length) ? currentStallion?.overview?.length : 0);
        setDetailedInfo({
            ...detailedInfo,
            horseName: currentStallion?.horseName,
            farmName: currentStallion?.farmName,
            farmId: currentStallion?.farmId,
            feeYear: currentStallion?.feeYear,
            colourId: currentStallion?.colourId,
            currencyId: currentStallion?.currencyId,
            fee: currentStallion?.fee,
            height: currentStallion?.height,
            yearToStud: currentStallion?.yearToStud,
            profilePic: currentStallion?.profilePic,
            yob: currentStallion?.yob,
            profileImageuuid: profileImageFile?.fileuuid ? profileImageFile?.fileuuid : null,
            promotedUrl: (currentStallion?.isPromoted) ? `${BaseAPI}stallions/${currentStallion.horseName}/${currentStallion?.stallionId}/View` : "",
        })
        setOverviewInfo({
            overview: currentStallion?.overview,
        })

    }

    // Handle stallion form
    const handleCheckDetailedInfoChange = (type: string, event: any) => {
        setDetailedInfo({
            ...detailedInfo,
            [type]: event.target.value
        })
        setCheckUpdatetDetailedInfo(true);
    }

    // Handle stallion overview
    const handleCheckOverviewInfoChange = (type: string, event: any) => {
        setOverviewInfo({
            ...overviewInfo,
            [type]: event.target.value
        })
        setCheckUpdateOverviewInfo(true);
        setCount(event.target.value.length);
    }

    // Prefilled stallion details
    React.useEffect(() => {
        if (currentStallion) {
            handleDefaultValues()
        }
    }, [isSuccess, currentStallion]);

    // Navigate to stallion page
    const handleStallionDetailPage = () => {
        window.open(PATH_DASHBOARD.stallions.marketingfilter(currentStallion?.farmId, currentStallion?.stallionId), '_blank');
        // navigate(PATH_DASHBOARD.stallions.marketingfilter(currentStallion?.farmId, currentStallion?.stallionId));
    };

    // Navigate to stallion page
    const handlePromotoStallionUrl = () => {
        window.open(`${BaseAPI}stallions/${currentStallion.horseName}/${currentStallion?.stallionId}/View`, '_blank');
    }

    // Navigate to portal stallion page
    const handleHorsePedigreeUrl = () => {
        window.open(PATH_DASHBOARD.horsedetails.edit(currentStallion?.horseId), '_blank');
        // navigate(PATH_DASHBOARD.horsedetails.edit(currentStallion?.horseId));
    }

    // Handle stallion profile data
    const handleStallionProfile = async () => {
        await updateStallion({
            pageId: stallionPageId,
            stallionId: stallionId,
            profile: {
                farmId: detailedInfo?.farmId,
                feeYear: detailedInfo?.feeYear,
                currencyId: detailedInfo?.currencyId,
                fee: detailedInfo?.fee,
                height: detailedInfo?.height,
                yearToStud: detailedInfo?.yearToStud,
                // isProfileImageDeleted: profileImageFile?.fileuuid == null ? true : false,
                profileImageuuid: profileImageFile?.fileuuid ? profileImageFile?.fileuuid : null,
                isProfileImageDeleted: profileImageFile?.fileuuid ? false : true,
            }
        });
        // console.log(typeof(profileImageFile),'profileImageFile')
        if (profileImageFile) {
            if (profileImageFile?.fileuuid) {
                const uploadOptions = { method: 'Put', body: profileImageFile.profileFileUpload };
                const result = await fetch(presignedProfilePath, uploadOptions);
                mediaUploadSuccess([profileImageFile?.fileuuid]);
            }
        }
        setCheckUpdatetDetailedInfo(false);
        setApiStatusMsg({ 'status': 201, 'message': '<b>Stallion details successfully updated!</b>' });
        setApiStatus(true);
    }

    // Save stallion overview
    const handleSaveOverviewData = async () => {
        await updateStallion({
            pageId: stallionPageId,
            stallionId: stallionId,
            overview: overviewInfo?.overview
        });
        setApiStatusMsg({ 'status': 201, 'message': '<b>Stallion overview successfully updated!</b>' });
        setApiStatus(true);
        setCheckUpdatetDetailedInfo(false);
        setCheckUpdateOverviewInfo(false);
    };

    const [uploadInProgress, setUploadInProgress] = useState<any>(false);

    // Save gallery image
    const handleSaveGalleryImages = async () => {
        let reqObj: any = {
            pageId: stallionPageId,
            stallionId: stallionId,
        }
        let arr: any = [];

        galleryImages?.map((element: any) => {
            let galleryObj: any = {};
            if (element.isDeleted === true) {
                galleryObj.isDeleted = true;
                galleryObj.mediauuid = element.mediauuid;
                galleryObj.position = element.position;
            }
            if (element.isNew === true) {
                galleryObj.isDeleted = false;
                galleryObj.mediauuid = element.mediauuid;
                galleryObj.position = element.position;
            }

            if (!(element.isNew === true && element.isDeleted === true)) {
                arr.push(galleryObj);
            }
        });
        let filteredArr: any = [];
        filteredArr = arr.filter((v: any) => JSON.stringify(v) !== '{}');
        reqObj.galleryImages = [...filteredArr];
        // const gallery
        let res: any = await updateStallion(reqObj);
        if (res?.data) {
            setIsStallionHeroImageChange(false);
            sendGallary();
            setGalleryImages([]);
        }
        setApiStatusMsg({ 'status': 201, 'message': '<b>Gallery images successfully updated!</b>' });
        setApiStatus(true);
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
                    //setUploadInProgress(false);
                    updateStallion({});
                }
            }
        }, 3000);
    }



    return (
        <StyledEngineProvider injectFirst>
            <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
            <Page title="Stallion Page" sx={{ display: 'flex' }} className='HomepageData'>
                {/* Marketing filter side bar for navigating to different pages */}
                {/* <MarketingFilterSidebar /> */}
                <Box className='HomepageDataRight' sx={{ width: '100%' }} px={2}>
                    <Container>
                        {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
                        {filterCounterhook.value >= 2 && marketingModuleAccess.marketing_viewonly === false ? (
                            <UnAuthorized />
                        ) :
                            <Box mt={3} className='HomepageDataBody'>
                                {/* Stallion AutoComplete to select stallion */}
                                {(stallionID === '') && <Box className='HomeBlockWrapper'>
                                    <Grid container spacing={2} className='hp-heading-block'>
                                        <Grid item lg={10} sm={10} className='hp-heading-block-left' sx={{ pr: "52px" }}>
                                            <Grid className='hp-form-block' container>
                                                <Grid item lg={12} sm={12} className='hp-form-item'>
                                                    {/* Select Stallion from search list */}
                                                    <Box className='edit-field horseDropdown'>
                                                        <StallionAutoFilter
                                                            disablePortal
                                                            setIsClearComplete={setIsClearComplete}
                                                            isClearAutoComplete={isClearAutoComplete}
                                                            setStallionId={setStallionId}
                                                            stallionId={stallionId}
                                                            isFilterApplied={false}
                                                            type="stallions"
                                                        />
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Box>}
                                {/* End Stallion AutoComplete to select stallion */}

                                {!isSuccess ? <Box className='Spinner-Wrp' sx={{ minHeight: 350 }} > <StallionSpinner /> </Box> :
                                    <>
                                        {/* Stallion details */}
                                        <Box className='HomeBlockWrapper' mt={4}>
                                            <Grid container spacing={0} className='hp-heading-block'>
                                                <Grid item lg={10} sm={10} pr={7} className='hp-heading-block-left'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Stallion Details</Typography>

                                                    <Grid className='hp-form-block' container spacing={3}>
                                                        <Grid item lg={6} sm={6} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField
                                                                    name="horseName"
                                                                    disabled
                                                                    placeholder='Stallion Name'
                                                                    autoComplete="off"
                                                                    value={toPascalCase(state?.horseName)}
                                                                    className='hp-form-input'
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        {/* Select the farm */}
                                                        <Grid item lg={6} sm={6} className='hp-form-item marketingSelect'>
                                                            <Box className='edit-field'>
                                                                <StallionFarmAutoComplete
                                                                    disablePortal
                                                                    horseName={toPascalCase(state.horseName)}
                                                                    sex={'M'}
                                                                    farmName={state?.farmName}
                                                                    isEdit={isEdit}
                                                                    isExist={isEdit ? true : false}
                                                                    isOpen={open}
                                                                    runnersModuele={true}
                                                                    setStateValueId={(value: any) => {
                                                                        setStateValue({ ...state, farmId: value.farmId, farmName: value.farmName });
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item lg={6} sm={6} className='hp-form-item'>
                                                            <Grid container spacing={1}>
                                                                <Grid item xs={4}>
                                                                    <Box className='edit-field scroll-lock-country'>
                                                                        <Select
                                                                            IconComponent={KeyboardArrowDownRoundedIcon}
                                                                            name="feeYear"
                                                                            placeholder="Fee Year" 
                                                                            className="filter-slct"
                                                                            MenuProps={{
                                                                                className: 'common-scroll-lock',
                                                                                // disableScrollLock: true,
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
                                                                            value={(detailedInfo?.feeYear === "") ? 'none' : detailedInfo?.feeYear}
                                                                            onChange={(e) => handleCheckDetailedInfoChange("feeYear", e)}>
                                                                            <MenuItem value={'none'} className="selectDropDownList" disabled><em>Fee Year</em></MenuItem>
                                                                            {yob.slice(0).reverse().map((year) => (
                                                                                <MenuItem className="selectDropDownList" value={year} key={year}>
                                                                                    {year}
                                                                                </MenuItem>
                                                                            ))}
                                                                        </Select>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Box className='edit-field'>
                                                                        <Select
                                                                            MenuProps={{
                                                                                className: 'common-scroll-lock',
                                                                                // disableScrollLock: true,
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
                                                                            placeholder="Currency" className="filter-slct"
                                                                            value={(detailedInfo?.currencyId === "") ? 'none' : detailedInfo?.currencyId}
                                                                            onChange={(e) => handleCheckDetailedInfoChange("currencyId", e)}>
                                                                            <MenuItem value={'none'} className="selectDropDownList" disabled><em>Currency</em></MenuItem>
                                                                            {currencyList?.map(({ id, currencyName }) => {
                                                                                return (
                                                                                    <MenuItem className="selectDropDownList stallion-currency" value={id} key={id}>
                                                                                        {currencyName}
                                                                                    </MenuItem>
                                                                                );
                                                                            })}
                                                                        </Select>
                                                                    </Box>
                                                                </Grid>
                                                                <Grid item xs={4}>
                                                                    <Box className='edit-field'>
                                                                        <TextField
                                                                            name="fee"
                                                                            placeholder='Stud Fee'
                                                                            autoComplete="off"
                                                                            value={detailedInfo?.fee}
                                                                            onChange={(e) => handleCheckDetailedInfoChange("fee", e)}
                                                                            className='hp-form-input'
                                                                        />
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item lg={6} sm={6} className='hp-form-item'>
                                                            <Box className='edit-field url-icon'>
                                                                <TextField
                                                                    name="promotedUrl"
                                                                    disabled
                                                                    placeholder='Stallion Match URL'
                                                                    value={detailedInfo?.promotedUrl}
                                                                    className='hp-form-input'
                                                                    InputProps={{
                                                                        endAdornment: <InputAdornment position="end" className='end-link'>{(state.isPromoted) && <i className='icon-Link-green' onClick={handlePromotoStallionUrl} />}</InputAdornment>,
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item lg={6} sm={6} className='hp-form-item'>
                                                            <Grid container spacing={1}>
                                                                <Grid item xs={6}>
                                                                    <Box className='edit-field'>
                                                                        <TextField
                                                                            name="yob"
                                                                            placeholder='Year of Birth'
                                                                            disabled
                                                                            autoComplete="off"
                                                                            value={detailedInfo?.yob}
                                                                            className='hp-form-input'
                                                                        />
                                                                    </Box>
                                                                </Grid>

                                                                <Grid item xs={6}>
                                                                    <Box className='edit-field'>
                                                                        <TextField
                                                                            name="height"
                                                                            placeholder='Height'
                                                                            autoComplete="off"
                                                                            value={detailedInfo?.height}
                                                                            onChange={(e) => handleCheckDetailedInfoChange("height", e)}
                                                                            className='hp-form-input'
                                                                        />
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item lg={6} sm={6} className='hp-form-item' sx={{ display: 'flex', alignItems: 'center' }}>
                                                            &nbsp;&nbsp;&nbsp;
                                                            <Button type='button' className='link-btn' onClick={handleStallionDetailPage}>View Stallion Details</Button>
                                                        </Grid>

                                                        <Grid item lg={6} sm={6} className='hp-form-item'>
                                                            <Grid container spacing={1}>
                                                                <Grid item xs={7}>
                                                                    <Box className='edit-field'>
                                                                        <Select
                                                                            name="colourId"
                                                                            disabled
                                                                            IconComponent={KeyboardArrowDownRoundedIcon}
                                                                            className="filter-slct"
                                                                            MenuProps={{
                                                                                disableScrollLock: 'false',
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
                                                                            value={(detailedInfo?.colourId === "") ? 'none' : detailedInfo?.colourId}
                                                                            onChange={(e) => handleCheckDetailedInfoChange("colourId", e)}>
                                                                            <MenuItem className="selectDropDownList" value={"none"} disabled><em>Colour</em></MenuItem>
                                                                            {coloursList?.map(({ id, colourName }) => {
                                                                                return (
                                                                                    <MenuItem className="selectDropDownList" value={id} key={id}>
                                                                                        {colourName}
                                                                                    </MenuItem>
                                                                                );
                                                                            })}
                                                                        </Select>
                                                                    </Box>
                                                                </Grid>

                                                                <Grid item xs={5}>
                                                                    <Box className='edit-field'>
                                                                        <TextField
                                                                            name="yearToStud"
                                                                            placeholder='Year To Stud'
                                                                            autoComplete="off"
                                                                            value={detailedInfo?.yearToStud}
                                                                            onChange={(e) => handleCheckDetailedInfoChange("yearToStud", e)}
                                                                            className='hp-form-input'
                                                                        />
                                                                    </Box>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item lg={6} sm={6} className='hp-form-item' sx={{ display: 'flex', alignItems: 'center' }}>
                                                            &nbsp;&nbsp;&nbsp;
                                                            <Button type='button' className='link-btn' onClick={handleHorsePedigreeUrl}>View Pedigree</Button>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item lg={2} sm={2} className='hp-heading-block-right'>
                                                    <Box className='bg-image-uploader stallion-bg-image sm'>
                                                        <CustomDropzonewithcrop data={heroImages} size={{ h: 250, w: 250 }} />
                                                    </Box>
                                                </Grid>


                                                {checkUpdatetDetailedInfo && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '9px !important', }}>
                                                    <Stack className='home-btn  save-btn-wrpr'>
                                                        <Button onClick={handleStallionProfile} variant='contained' className='search-btn' type='button'>Save</Button>
                                                    </Stack>
                                                </Grid>}
                                            </Grid>
                                        </Box>
                                        {/* End Stallion details */}

                                        {/* Stallion Gallery */}
                                        <Box className='HomeBlockWrapper farmImagesWrapper' mt={4}>
                                            <Grid container spacing={0} className='hp-heading-block'>
                                                <Grid item lg={12} sm={12} className='hp-heading-block-left'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Hero Image Gallery</Typography>

                                                    {isStallionGalleryImagesSuccess && isStallionGalleryImagesFetching === false && <Grid className='hp-image-block' container spacing={1.5}>
                                                        {new Array(8).fill(0).map((item: any, index: any) => {
                                                            const fileDetails = stallionGalleryImages.find((res: any) => res.position == index);
                                                            const galleryImages = {
                                                                setFileUpload,
                                                                fileDetails: fileDetails ? fileDetails : null,
                                                                position: index
                                                            };
                                                            return (
                                                                <Grid item lg={1.5} sm={1.5} className='hp-image-item' key={index}>
                                                                    <Box className='bg-image-uploader sm' key={index}>
                                                                        <CustomDropzone data={galleryImages} galleryResolution={galleryResolution} size={{ h: 200, w: 200 }} />
                                                                    </Box>
                                                                </Grid>
                                                            );
                                                        })}
                                                        {isStallionHeroImageChange && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '9px !important', }}>
                                                            <Stack className='home-btn  save-btn-wrpr'>
                                                                <Button variant='contained' className='search-btn' type='button' onClick={handleSaveGalleryImages}>Save</Button>
                                                            </Stack>
                                                        </Grid>}
                                                    </Grid>}

                                                </Grid>
                                            </Grid>
                                        </Box>
                                        {/* End Stallion Gallery */}

                                        {/* Stallion Overview */}
                                        <Box className='HomeBlockWrapper' mt={8}>
                                            <Grid container spacing={0} className='hp-heading-block'>
                                                <Grid item lg={12} sm={12} pr={7} className='hp-heading-block-left'>
                                                    <Typography variant="h6" pb={.5} sx={{ fontSize: '18px !important' }}>Overview</Typography>

                                                    <Grid className='hp-form-block' container spacing={3}>
                                                        <Grid item lg={12} sm={12} className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <TextField
                                                                    name="overview"
                                                                    placeholder='Overview'
                                                                    autoComplete="off"
                                                                    defaultValue={overviewInfo?.overview}
                                                                    onChange={(e: any) => handleCheckOverviewInfoChange("overview", e)}
                                                                    className='hp-form-input'
                                                                    multiline
                                                                    rows={7}
                                                                    inputProps={{
                                                                        maxlength: CHARACTER_LIMIT
                                                                    }}
                                                                    helperText={`${count}/${CHARACTER_LIMIT}`}
                                                                />
                                                            </Box>
                                                        </Grid>

                                                        {checkUpdateOverviewInfo && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '9px !important', }}>
                                                            <Stack className='home-btn  save-btn-wrpr'>
                                                                <Button variant='contained' className='search-btn' type='button' onClick={handleSaveOverviewData}>Save</Button>
                                                            </Stack>
                                                        </Grid>}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        {/* End Stallion Overview */}

                                        {/* Testimonial Table */}
                                        {isStallionTestimonialFetching &&
                                            <Box className="Spinner-Wrp">
                                                <Spinner />
                                            </Box>}
                                        {isStallionTestimonialSuccess &&
                                            <Box className='hp-table-wrapper'>
                                                <TableContainer className='datalist' sx={{ minWidth: 800 }}>
                                                    <Table sx={{ borderCollapse: 'separate', borderSpacing: '0 4px', background: '#FAF8F7' }}>
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell align="left">Name</TableCell>
                                                                <TableCell align="left">Testimonial</TableCell>
                                                                <TableCell align="left">Company</TableCell>
                                                                <TableCell align="center">Image</TableCell>
                                                                <TableCell align="left"></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {stallionTestimonialList.map((row: any, index: number) => (
                                                                <StallionTestimonialListTableRow
                                                                    key={row.testimonialId}
                                                                    row={row}
                                                                    stallionId={stallionId}
                                                                    pageId={stallionPageId}
                                                                    selected={row.testimonialId}
                                                                    onSelectRow={row.testimonialId}
                                                                    onEditPopup={() => handleEditPopup()}
                                                                    onSetRowId={() => setRowId(row.testimonialId)}
                                                                    handleEditState={() => handleEditState()}
                                                                    apiStatus={true}
                                                                    setApiStatus={setApiStatus}
                                                                    apiStatusMsg={apiStatusMsg}
                                                                    setApiStatusMsg={setApiStatusMsg}
                                                                    refetchStallionTestimonial={refetchStallionTestimonial}
                                                                />
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Box>
                                        }

                                        {stallionTestimonialList?.length < 3 && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '9px !important', }}>
                                            <Stack className='home-btn  save-btn-wrpr'>
                                                <Button type='button' className='addcarousel-btn' onClick={() => SetOpenTestimonialModal(true)}>Add Testimonial</Button>
                                            </Stack>
                                        </Grid>
                                        }
                                        {/* End Testimonial Table */}
                                    </>
                                }
                            </Box>
                        }
                    </Container>
                </Box>




                {!isEditTestimonail && openTestimonialModal && <StallionTestimonialEditModal
                    openAddEditForm={openTestimonialModal}
                    handleDrawerCloseRow={handleCloseTestimonialModal}
                    pageId={stallionPageId}
                    stallionId={stallionId}
                    isEdit={undefined}
                    apiStatus={true}
                    setApiStatus={setApiStatus}
                    apiStatusMsg={apiStatusMsg}
                    setApiStatusMsg={setApiStatusMsg}
                    refetchStallionTestimonial={refetchStallionTestimonial}
                    editedStallionTestimonial={editedStallionTestimonial}
                    setEditedStallionTestimonial={setEditedStallionTestimonial}
                    testimonialImage={testimonialImage}
                    setTestimonialImage={setTestimonialImage}
                    isTestimonialFetching={false}
                />}
                {isEditTestimonail && openTestimonail && isTestimonialSuccess && isTestimonialModalHasData && !isTestimonialFetching && <StallionTestimonialEditModal
                    pageId={stallionPageId}
                    stallionId={stallionId}
                    openAddEditForm={openTestimonail}
                    rowId={rowId}
                    isEdit={isEditTestimonail}
                    handleEditPopup={handleEditState}
                    handleCloseEditState={handleEditPopupClose}
                    apiStatus={true}
                    setApiStatus={setApiStatus}
                    apiStatusMsg={apiStatusMsg}
                    setApiStatusMsg={setApiStatusMsg}
                    refetchStallionTestimonial={refetchStallionTestimonial}
                    editedStallionTestimonial={editedStallionTestimonial}
                    setEditedStallionTestimonial={setEditedStallionTestimonial}
                    testimonialImage={testimonialImage}
                    setTestimonialImage={setTestimonialImage}
                    isTestimonialFetching={isTestimonialFetching}
                />}
            </Page>
        </StyledEngineProvider>
    );
}

// @mui
import React, { useEffect, useMemo, useState } from "react";
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
    StyledEngineProvider,
} from '@mui/material';
import Page from 'src/components/Page';
import CustomDropzoneHeadingImage from 'src/components/CustomDropzoneHeadingImage';
import CustomDropzoneBannerImage2 from 'src/components/CustomDropzoneBannerImage2';
import Select from '@mui/material/Select';
import 'src/sections/@dashboard/marketing/marketing.css'
import MarketingFilterSidebar from 'src/sections/@dashboard/marketing/filter/MarketingFilterSidebar';
import CarouselEditModal from 'src/sections/@dashboard/marketing/homepage/CarouselEditModal';
import TestimonialEditModal from 'src/sections/@dashboard/marketing/homepage/TestimonialEditModal';
import { useAddHomePageMutation, useMarketingPageQuery, useUploadImageMutation, useDeleteImageByUuidMutation, useFarmGalleryImagesUploadStatusMutation, useMarketingMainHomePageQuery } from 'src/redux/splitEndpoints/marketingSplit';
import { MarketingAddHomePage } from 'src/@types/marketing';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { v4 as uuid } from 'uuid';
import { MaterialTable } from "src/sections/@dashboard/marketing/homepage/list/MaterialTable";
import { TestimonialMaterialTable } from "src/sections/@dashboard/marketing/homepage/list/TestimonialMaterialTable";
import { Spinner } from "src/components/Spinner";
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from '../../hooks/useSettings';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from 'src/constants/MenuProps';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

type FormValuesProps = MarketingAddHomePage;

// Type declaration for carausel list
export interface DataItem {
    id: string;
    uuid: string;
    title: string | null;
    description: string | null;
    isActive: boolean;
    orientation: string | null;
    imageUrl: string | null;
    buttonText: string | null;
    buttonUrl: string | null;
    position: number
}

// Type declaration for testimonial list
export interface TestimonialDataItem {
    id: string;
    name: string | null;
    testimonial: string | null;
    isActive: boolean;
    company: string;
    companyUrl: string | null;
    imageUrl: string | null;
    position: number
}

export default function HomeData() {

    const filterCounterhook = useCounter(0);
    const [valuesExist, setValuesExist] = useState<any>({});
    const [clickedPopover, setClickedPopover] = useState(false);
    const [userModuleAccess, setUserModuleAccess] = useState(false);
    const [marketingModuleAccess, setMarketingModuleAccess] = useState({
        marketing_viewonly: false,
        marketing_update: true,
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

    React.useEffect(() => {
        // if (valuesExist.hasOwnProperty('MARKETING_LANDING_PAGE')) {
        //     setUserModuleAccess(true);
        // }
        setMarketingModuleAccess({
            ...marketingModuleAccess,
            marketing_viewonly: (!valuesExist?.hasOwnProperty('MARKETING_LANDING_PAGE') && !valuesExist?.hasOwnProperty('MARKETING_HOME_PAGE')) ? false : true,
            marketing_update: (!valuesExist?.hasOwnProperty('MARKETING_LANDING_PAGE') && !valuesExist?.hasOwnProperty('MARKETING_HOME_PAGE')) ? false : true,
        });
        filterCounterhook.increment();
    }, [valuesExist]);

    const homePageId = process.env.REACT_APP_MARKETING_HOME_PAGE_ID;
    const [apiStatus, setApiStatus] = useState<boolean>(false);
    const [apiStatusMsg, setApiStatusMsg] = useState<any>({});
    const { themeLayout } = useSettings();
    const [openHeader, setOpenHeader] = useState(false);
    const { collapseClick, isCollapse } = useCollapseDrawer();
    const verticalLayout = themeLayout === 'vertical';
    const DESC1_CHARACTER_LIMIT = 100;
    const DESC2_CHARACTER_LIMIT = 100;
    const DESC3_CHARACTER_LIMIT = 100;
    const [count1, setCount1] = useState(0);
    const [count2, setCount2] = useState(0);
    const [count3, setCount3] = useState(0);
    const [onSuccessCallApi, setOnSuccessCallApi] = useState(false);

    // Patch home page api call
    const [addHomePage] = useAddHomePageMutation();

    // Patch media upload status
    const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();

    const successResonse:any = mediaUploadSuccessResponse;
    const obj = {
        matchPageId: homePageId,
        flag: successResonse?.loading === false ? onSuccessCallApi : successResonse?.loading
    };
    // Get home page api call
    const data = useMarketingMainHomePageQuery(obj, { refetchOnMountOrArgChange: true });
    const currentHome = (data?.isSuccess) ? data?.data : [];

    const HomeCarouselList: Array<DataItem> = (data?.isSuccess) ? currentHome?.carasouls?.list : [];
    const HomeTestimonialList: any = (data?.isSuccess) ? currentHome?.testimonials?.list : [];
    const CaraoulSectionUuid: any = (data?.isSuccess) ? currentHome.carasouls.marketingPageSectionUuid : '';
    const TestimonailSectionUuid: any = (data?.isSuccess) ? currentHome?.testimonials?.marketingPageSectionUuid : '';
    const [checkInputChange, setCheckInputChange] = useState(false);
    const [checkUpdateHeroText, setCheckUpdateHeroText] = useState(false);
    const [checkUpdateBanner1Text, setCheckUpdateBanner1Text] = useState(false);
    const [checkUpdateBanner2Text, setCheckUpdateBanner2Text] = useState(false);

    // State variable for heading, hero, banner1 and banner2
    const [headingText, setHeadingText] = useState({
        mainHeading: "",
        description: "",
        bgImage: "",
    });
    const [heroImageText, setHeroImageText] = useState({
        heroImageText: "",
    });
    const [benner1Text, setBanner1Text] = useState({
        title: "",
        description1: "",
        description2: "",
        description3: "",
        bgImage: "",
    });
    const [benner2Text, setBanner2Text] = useState({
        title: "",
        description: "",
        buttonText: "",
        bgImage: "",
        buttonTarget: ""
    });

    // Validation
    const NewFarmSchema = Yup.object().shape({
        headingTitle: Yup.string().required('Heading Title is required'),
        headingDescription: Yup.string().required('Heading Description is required'),
        heroImageTitle: Yup.string().required('Hero Image Title is required'),
        b1Title: Yup.string().required('Banner1 Title is required'),
        b1Description1: Yup.string().required('Banner1 Description1 is required'),
        b1Description2: Yup.string().required('Banner1 Description2 is required'),
        b1Description3: Yup.string().required('Banner1 Description3 is required'),
        b2Title: Yup.string().required('Banner2 Title is required'),
        b2Description: Yup.string().required('Banner2 Description is required'),
        b2ButtonText: Yup.string().required('Banner2 Button Text is required'),
        b2ButtonTarget: Yup.string().required('Banner2 Button Text is required'),
    });

    const defaultValues = useMemo(
        () => ({
            headingTitle: currentHome?.mainHeading?.title || '',
            headingDescription: currentHome?.mainHeading?.description || '',
            heroImageTitle: currentHome?.heroImage?.title || '',
            b1Title: currentHome?.banner1?.title || '',
            b1Description1: currentHome?.banner1?.description1 || '',
            b1Description2: currentHome?.banner1?.description2 || '',
            b1Description3: currentHome?.banner1?.description3 || '',
            b2Title: currentHome?.banner2?.title || '',
            b2Description: currentHome?.banner2?.description || '',
            b2ButtonText: currentHome?.banner2?.buttonText || '',
            b2ButtonTarget: currentHome?.banner2?.buttonTarget || "",
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentHome]
    );


    const methods = useForm<FormValuesProps>({
        resolver: yupResolver(NewFarmSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        control,
        setValue,
        getValues,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    // Update the state variable 
    React.useEffect(() => {
        if (currentHome) {
            reset(defaultValues);
            setHeadingText({
                mainHeading: currentHome?.mainHeading?.title,
                description: currentHome?.mainHeading?.description,
                bgImage: currentHome?.heroImage?.bgImage
            });
            setHeroImageText({
                heroImageText: currentHome?.heroImage?.title,
            });
            setBanner1Text({
                title: currentHome?.banner1?.title,
                description1: currentHome?.banner1?.description1,
                description2: currentHome?.banner1?.description2,
                description3: currentHome?.banner1?.description3,
                bgImage: currentHome?.banner1?.bgImage
            });
            setBanner2Text({
                title: currentHome?.banner2?.title,
                description: currentHome?.banner2?.description,
                buttonText: currentHome?.banner2?.buttonText,
                bgImage: currentHome?.banner2?.bgImage,
                buttonTarget: currentHome?.banner2?.buttonTarget
            });
            setCount1((currentHome?.banner1?.description1?.length) ? currentHome?.banner1?.description1?.length : 0);
            setCount2((currentHome?.banner1?.description2?.length) ? currentHome?.banner1?.description2?.length : 0);
            setCount3((currentHome?.banner1?.description3?.length) ? currentHome?.banner1?.description3?.length : 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentHome]);


    const [isEdit, setEdit] = useState(false);

    const [isCarouselEdit, setCarouselEdit] = useState(false);
    const [isEditTestimonial, setEditTestimonial] = useState(false);

    const [openTestimonialModal, setOpenTestimonialModal] = useState(false);
    const [openCarouselModal, setOpenCarouselModal] = useState(false);

    const [rowCarouselId, setRowCarouselId] = useState("");
    const [rowTestimonialId, setRowTestimonialId] = useState("");

    // Close carousel modal
    const handleCloseCarouselModal = () => {
        setOpenCarouselModal(false);
        setCarouselEdit(false);
    };

    // Close testimonial modal
    const handleCloseTestimonialModal = () => {
        setOpenTestimonialModal(false);
        setEditTestimonial(false);
    };

    const CHARACTER_LIMIT = 100;
    const [values, setValues] = React.useState({
        name: ""
    });

    const handleChange = (name: string) => (event: { target: { value: any; }; }) => {
        setValues({ ...values, [name]: event.target.value });
    };

    // Check any data updated in banner1, then display Save button
    const handleChekBanner1Change = (event: any, type: string) => {
        setBanner1Text({
            ...benner1Text,
            [type]: event.target.value
        })
        if (type === 'description1') {
            setCount1(event.target.value.length);
        }
        if (type === 'description2') {
            setCount2(event.target.value.length);
        }
        if (type === 'description3') {
            setCount3(event.target.value.length);
        }
        setCheckUpdateBanner1Text(true);
    }

    // Check any data updated in banner2, then display Save button
    const handleChekBanner2Change = (event: any, type: string) => {
        setBanner2Text({
            ...benner2Text,
            [type]: event.target.value
        })
        setCheckUpdateBanner2Text(true);
    }

    // Check any data updated in hero image or main heading, then display Save button
    const handleCheckChange = (event: any, type: string) => {

        if (event.target.value) {
            if (type === "heroImageText") {
                setHeroImageText({
                    ...heroImageText,
                    [type]: event.target.value
                })
                setCheckUpdateHeroText(true);
            }
            else {
                setHeadingText({
                    ...headingText,
                    [type]: event.target.value
                })
                setCheckInputChange(true)
            }
        }
    }

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;
    const MenuPropss: any = {
        PaperProps: {
            style: {
                maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                marginRight: '0px',
                marginTop: '0px',
                width: '228px',
                borderRadius: '6px 6px 6px 6px',
                boxSizing: 'border-box',
            },
        },
    };

    const headingImageFileuuid: any = uuid();
    const [setHeadingImages] = useUploadImageMutation();
    const [deleteBGImages] = useDeleteImageByUuidMutation();
    const [headingImageFileUpload, setHeadingImageFileUpload] = useState<any>();
    const galleryResolution = { height: 1280, width: 1920 };
    const [reportOverviewImageFile, setReportOverviewImageFile] = useState<any>();
    const headingImagesDetails = currentHome?.mainHeading?.bgImage ? currentHome?.mainHeading?.bgImage : null;
    const [presignedheadingImagePath, setPresignedHeadingImagePath] = useState<any>();
    const [headingImageFile, setHeadingImageFile] = useState<any>();
    const [headingImageUploadFileData, setHeadingImageUploadFileData] = useState<any>({});
    const headingImages = {
        setHeadingImageFileUpload,
        headingImagesDetails,
    };

    // Patch api call post heading image upload
    useEffect(() => {
        if (headingImageFileUpload && !headingImageFileUpload.isDeleted) {
            try {
                // Step 1- Upload Image api call
                setHeadingImages({
                    marketingPageSectionUuid: currentHome?.mainHeading?.marketingPageSectionUuid,
                    fileName: headingImageFileUpload.path,
                    fileuuid: headingImageFileuuid,
                    fileSize: headingImageFileUpload.size,
                }).then(async (res: any) => {
                    const details = { headingImageFileUpload, headingImageFileuuid };
                    setOnSuccessCallApi(false);
                    if (details) {
                        // Step 2- Update aws s3 url
                        const uploadOptions = { method: 'Put', body: details.headingImageFileUpload };
                        const imageresult = await fetch(res.data.url, uploadOptions);
                        // Step 3- Image status api call
                        // mediaUploadSuccess([headingImageFileuuid]);
                    }
                    let count = 1;
                    const interval = setInterval(async () => {
                        if (count >= 1) {
                            let data: any = await mediaUploadSuccess([headingImageFileuuid]);
                            
                            if (data.error.data != 'SUCCESS') {
                                count++;
                                if (count === 10) {
                                    clearInterval(interval);
                                }
                            } else {
                                count = 0;
                                setOnSuccessCallApi(true);
                            }
                        }
                    }, 3000);

                    setHeadingImageFile(details);
                    setPresignedHeadingImagePath(res.data.url);
                    setHeadingImageUploadFileData(
                        {
                            fileName: res.data.url,
                            fileuuid: headingImageFileuuid,
                            fileSize: headingImageFileUpload.size
                        }
                    );
                });
            } catch (error) {
                console.error(error);
            }
        }
        if (headingImageFileUpload && headingImageFileUpload.isDeleted) {
            try {
                deleteBGImages({ pageSectionUuId: currentHome?.mainHeading?.marketingPageSectionUuid });
            } catch (error) {
                console.error(error);
            }
        }
    }, [headingImageFileUpload]);

    const banner2ImageFileuuid: any = uuid();
    const [setBanner2Images] = useUploadImageMutation();
    const [banner2ImageFileUpload, setBanner2ImageFileUpload] = useState<any>();
    const banner2Resolution = { height: 1280, width: 1920 };
    const banner2ImagesDetails = currentHome?.banner2?.bgImage ? currentHome?.banner2?.bgImage : null;
    const [presignedBanner2ImagePath, setPresignedBanner2ImagePath] = useState<any>();
    const [banner2ImageFile, setBanner2ImageFile] = useState<any>();
    const [banner2ImageUploadFileData, setBanner2ImageUploadFileData] = useState<any>({});
    const banner2Images = {
        setBanner2ImageFileUpload,
        banner2ImagesDetails,
    };

    // Patch api call post banner2 media upload
    useEffect(() => {
        if (banner2ImageFileUpload && !banner2ImageFileUpload.isDeleted) {
            try {
                // Step 1- Upload Image api call
                setBanner2Images({
                    marketingPageSectionUuid: currentHome?.banner2?.marketingPageSectionUuid,
                    fileName: banner2ImageFileUpload.path,
                    fileuuid: banner2ImageFileuuid,
                    fileSize: banner2ImageFileUpload.size,
                }).then(async (res: any) => {
                    const details = { banner2ImageFileUpload, banner2ImageFileuuid };
                    setOnSuccessCallApi(false);
                    if (details) {
                        // Step 2- Update aws s3 url
                        const uploadOptions = { method: 'Put', body: details.banner2ImageFileUpload };
                        const imageresult = await fetch(res.data.url, uploadOptions);
                        // Step 3- Image status api call
                        // mediaUploadSuccess([banner2ImageFileuuid]);
                    }
                    let count = 1;
                    const interval = setInterval(async () => {
                        if (count >= 1) {
                            let data: any = await mediaUploadSuccess([banner2ImageFileuuid]);
                            
                            if (data.error.data != 'SUCCESS') {
                                count++;
                                if (count === 10) {
                                    clearInterval(interval);
                                }
                            } else {
                                count = 0;
                                setOnSuccessCallApi(true);
                            }
                        }
                    }, 3000);
                    setBanner2ImageFile(details);
                    setPresignedBanner2ImagePath(res.data.url);
                    setBanner2ImageUploadFileData(
                        {
                            fileName: res.data.url,
                            fileuuid: banner2ImageFileuuid,
                            fileSize: banner2ImageFileUpload.size
                        }
                    );
                });
            } catch (error) {
                console.error(error);
            }
        }
        if (banner2ImageFileUpload && banner2ImageFileUpload.isDeleted) {
            try {
                deleteBGImages({ pageSectionUuId: currentHome?.banner2?.marketingPageSectionUuid });
            } catch (error) {
                console.error(error);
            }
        }
    }, [banner2ImageFileUpload]);


    // Patch api call post home page for updating main heading 
    const handleMainHeadingData = async () => {
        if (!marketingModuleAccess?.marketing_update) {
            setApiStatusMsg({
                status: 422,
                message: '<b>You do not have sufficient privileges to access this module!</b>',
            });
            setApiStatus(true);
        } else {
            let response: any = await addHomePage({
                pageId: homePageId,
                mainHeading: {
                    title: headingText?.mainHeading,
                    description: headingText?.description
                }
            });
            setCheckInputChange(false);
            setApiStatusMsg({ 'status': 201, 'message': '<b>Main Heading data successfully updated!</b>' });
            setApiStatus(true);
        }
    }

    // Patch api call post home page for updating Hero image 
    const handleHeroImageData = async () => {
        if (!marketingModuleAccess?.marketing_update) {
            setApiStatusMsg({
                status: 422,
                message: '<b>You do not have sufficient privileges to access this module!</b>',
            });
            setApiStatus(true);
        } else {
            await addHomePage({
                pageId: homePageId,
                heroImage: {
                    title: heroImageText?.heroImageText,
                }
            });
            setCheckUpdateHeroText(false);
            setApiStatusMsg({ 'status': 201, 'message': '<b>Hero image data successfully updated!</b>' });
            setApiStatus(true);
        }
    }

    // Patch api call post home page for updating banner1
    const handleBanner1Data = async () => {
        if (!marketingModuleAccess?.marketing_update) {
            setApiStatusMsg({
                status: 422,
                message: '<b>You do not have sufficient privileges to access this module!</b>',
            });
            setApiStatus(true);
        } else {
            await addHomePage({
                pageId: homePageId,
                banner1: {
                    title: benner1Text?.title,
                    bannerDescription1: benner1Text?.description1,
                    bannerDescription2: benner1Text?.description2,
                    bannerDescription3: benner1Text?.description3,
                }
            });
            setCheckUpdateBanner1Text(false);
            setApiStatusMsg({ 'status': 201, 'message': '<b>Banner1 data successfully updated!</b>' });
            setApiStatus(true);
        }
    }

    // Patch api call post home page for updating banner2  
    const handleBanner2Data = async () => {
        if (!marketingModuleAccess?.marketing_update) {
            setApiStatusMsg({
                status: 422,
                message: '<b>You do not have sufficient privileges to access this module!</b>',
            });
            setApiStatus(true);
        } else {
            let response: any = await addHomePage({
                pageId: homePageId,
                banner2: {
                    title: benner2Text?.title,
                    description: benner2Text?.description,
                    buttonText: benner2Text?.buttonText,
                    buttonTarget: benner2Text?.buttonTarget
                }
            });
            if (!response?.error) {
                if (banner2ImageFile) {
                    const uploadOptions = { method: 'Put', body: banner2ImageFile.fileUpload };
                    const imageresult = await fetch(presignedBanner2ImagePath, uploadOptions);
                }
            }
            setCheckUpdateBanner2Text(false);
            setApiStatusMsg({ 'status': 201, 'message': '<b>Banner2 data successfully updated!</b>' });
            setApiStatus(true);
        }
    }

    const handleHomeAddNewCarousel = () => {
        if (!marketingModuleAccess?.marketing_update) {
            setClickedPopover(true);
        } else {
            setOpenCarouselModal(true);
        }
    }

    const handleHomeAddNewTestimonial = () => {
        if (!marketingModuleAccess?.marketing_update) {
            setClickedPopover(true);
        } else {
            setOpenTestimonialModal(true);
        }
    }

    return (
        <StyledEngineProvider injectFirst>
            {/* Header component */}
            <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
            <Page title="Homepage" sx={{ display: 'flex' }} className='HomepageData'>
                {/* Leftbar component */}
                {/* <MarketingFilterSidebar /> */}
                <Box className='HomepageDataRight' sx={{ width: '100%' }} px={2}>
                    <Container>
                        {/* Toaster component render here based on api response */}
                        {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
                        <Stack direction='row' className='MainTitleHeader'>
                            <Grid container mt={0}>
                                <Grid item lg={12} sm={12}>
                                    <Typography variant="h6" className='MainTitle'>Stallion Match Marketing Page</Typography>
                                </Grid>

                            </Grid>
                        </Stack>
                        {/* 
                            Home page componentif data is loading it loads spinner component
                            if data is present the data table component loads
                        */}
                        {filterCounterhook.value >= 2 && marketingModuleAccess.marketing_viewonly === false ? (
                            <UnAuthorized />
                        ) :
                            (data?.isFetching) ?
                                <Box className='Spinner-Wrp'>  <Spinner /></Box> :
                                <Box mt={3} className='HomepageDataBody'>

                                    <Box className='HomeBlockWrapper'>
                                        <Grid container spacing={10} className='hp-heading-block'>
                                            <Grid item lg={10} sm={10} className='hp-heading-block-left' sx={{ paddingRight: '10px !important', }}>
                                                <Typography variant="h6">Main Heading</Typography>

                                                <Grid className='hp-form-block' container>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="headingTitle" value={headingText?.mainHeading} onChange={(event) => handleCheckChange(event, "mainHeading")} placeholder='Heading Title' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="headingDescription" value={headingText?.description} onChange={(event) => handleCheckChange(event, "description")} placeholder='Enter your description.' className='edit-field hp-form-input' multiline rows={3.4} />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '6px !important' }}>
                                                        {checkInputChange && <Stack className='home-btn  save-btn-wrpr'>
                                                            <Button variant='contained' className='search-btn' type='button' onClick={handleMainHeadingData}>Save</Button>
                                                        </Stack>}
                                                    </Grid>
                                                </Grid>

                                            </Grid>
                                            <Grid item lg={2} sm={2} className='hp-heading-block-right' sx={{ paddingLeft: '1px !important', }}>
                                                <Typography variant="h6">Background Image</Typography>
                                                <Box className='bg-image-uploader'>
                                                    <Box className='draganddrop-wrapper'>
                                                        <CustomDropzoneHeadingImage data={headingImages} size={{ h: 250, w: 250 }} />
                                                    </Box>
                                                    <Typography variant="subtitle2" textAlign='center'>1920px x 1080px 144dpi</Typography>
                                                </Box>
                                            </Grid>

                                        </Grid>
                                    </Box>

                                    <Box className='HomeBlockWrapper' mt={3}>
                                        <Grid container spacing={10} className='hp-heading-block'>
                                            <Grid item lg={10} sm={10} className='hp-heading-block-left'sx={{ paddingRight: '10px !important', }}>
                                                <Typography variant="h6">Hero Image</Typography>

                                                <Grid className='hp-form-block' container>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="heroImageTitle" value={heroImageText?.heroImageText} onChange={(event) => handleCheckChange(event, "heroImageText")} placeholder='Hero Image Title' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    {checkUpdateHeroText &&
                                                        <Grid item lg={3} sm={3} className='hp-heading-block-right' style={{ padding: "4px 0 0 10px" }}>
                                                            <Stack className='home-btn  save-btn-wrpr'>
                                                                <Button variant='contained' className='search-btn' type='button' onClick={handleHeroImageData}>Save</Button>
                                                            </Stack>
                                                        </Grid>
                                                    }
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        <Box className='hp-table-wrapper' mt={2}>
                                            <MaterialTable
                                                items={HomeCarouselList}
                                                CaraoulSectionUuid={data?.data?.carasouls?.marketingPageSectionId}
                                                openAddEditForm={openCarouselModal}
                                                handleDrawerCloseRow={handleCloseCarouselModal}
                                                apiStatus={true}
                                                setApiStatus={setApiStatus}
                                                apiStatusMsg={apiStatusMsg}
                                                setApiStatusMsg={setApiStatusMsg}
                                                marketingModuleAccess={marketingModuleAccess}
                                                setMarketingModuleAccess={setMarketingModuleAccess}
                                                clickedPopover={clickedPopover}
                                                setClickedPopover={setClickedPopover}
                                            />
                                        </Box>
                                        <Grid item lg={12} sm={12} className='hp-heading-block-bottom hp-heading-block-twobutton' sx={{ paddingTop: '9px !important', }}>
                                            <Box className='addCarouselwrapper' mt={1} textAlign='center'>
                                                <Button
                                                    type='button'
                                                    className='addcarousel-btn'
                                                    onClick={() => handleHomeAddNewCarousel()}
                                                >Add Carousel</Button>
                                            </Box>
                                        </Grid>
                                    </Box>

                                    <Box className='HomeBlockWrapper zindex-minus' mt={4}>
                                        <Grid container spacing={2} className='hp-heading-block'>
                                            <Grid item lg={12} sm={12} className='hp-heading-block-left'>
                                                <Typography variant="h6">Banner 1</Typography>
                                                <Grid className='hp-form-block' container spacing={1.5}>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b1Title" value={benner1Text?.title} onChange={(event) => handleChekBanner1Change(event, "title")} placeholder='Banner 1 Title' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={4} sm={4} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b1Description1" value={benner1Text?.description1}
                                                                onChange={(event) => handleChekBanner1Change(event, "description1")}
                                                                placeholder='Enter your description.'
                                                                className='edit-field hp-form-input' multiline rows={3.4}
                                                                inputProps={{
                                                                    maxlength: DESC1_CHARACTER_LIMIT
                                                                }}
                                                                helperText={`${count1}/${DESC1_CHARACTER_LIMIT}`}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={4} sm={4} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b1Description2" value={benner1Text?.description2}
                                                                onChange={(event) => handleChekBanner1Change(event, "description2")}
                                                                placeholder='Enter your description.' className='edit-field hp-form-input' multiline rows={3.4}
                                                                inputProps={{
                                                                    maxlength: DESC2_CHARACTER_LIMIT
                                                                }}
                                                                helperText={`${count2}/${DESC2_CHARACTER_LIMIT}`}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={4} sm={4} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b1Description3" value={benner1Text?.description3}
                                                                onChange={(event) => handleChekBanner1Change(event, "description3")}
                                                                placeholder='Enter your description.' className='edit-field hp-form-input' multiline rows={3.4}
                                                                inputProps={{
                                                                    maxlength: DESC3_CHARACTER_LIMIT
                                                                }}
                                                                helperText={`${count3}/${DESC3_CHARACTER_LIMIT}`}
                                                            />
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                            </Grid>

                                            {checkUpdateBanner1Text && <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '9px !important', }}>
                                                <Stack className='home-btn  save-btn-wrpr'>
                                                    <Button variant='contained' className='search-btn' type='button' onClick={handleBanner1Data}>Save</Button>
                                                </Stack>
                                            </Grid>}

                                        </Grid>

                                        <Box className='hp-table-wrapper' mt={3}>
                                            <TestimonialMaterialTable
                                                items={HomeTestimonialList}
                                                TestimonialSectionUuid={currentHome?.testimonials?.marketingPageSectionId}
                                                apiStatus={true}
                                                setApiStatus={setApiStatus}
                                                apiStatusMsg={apiStatusMsg}
                                                setApiStatusMsg={setApiStatusMsg}
                                                marketingModuleAccess={marketingModuleAccess}
                                                setMarketingModuleAccess={setMarketingModuleAccess}
                                                clickedPopover={clickedPopover}
                                                setClickedPopover={setClickedPopover}
                                            />
                                        </Box>
                                        <Grid item lg={12} sm={12} className='hp-heading-block-bottom hp-heading-block-twobutton' sx={{ paddingTop: '9px !important', }}>

                                            <Box className='addCarouselwrapper' mt={1} textAlign='center'>
                                                <Button type='button' className='addcarousel-btn' onClick={() => handleHomeAddNewTestimonial()}>Add Testimonial</Button>
                                            </Box>
                                        </Grid>
                                    </Box>

                                    <Box className='HomeBlockWrapper zindex-minus' mt={3}>
                                        <Grid container spacing={10} className='hp-heading-block'>
                                            <Grid item lg={10} sm={10} className='hp-heading-block-left' sx={{ paddingRight: '10px !important', }}>
                                                <Typography variant="h6">Banner 2</Typography>

                                                <Grid className='hp-form-block' spacing={1} container>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b2Title" value={benner2Text?.title} onChange={(event) => handleChekBanner2Change(event, "title")} placeholder='Banner2 Title' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b2Description" value={benner2Text?.description} onChange={(event) => handleChekBanner2Change(event, "description")} placeholder='Enter your description.' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={6} sm={6} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b2ButtonText" value={benner2Text?.buttonText} onChange={(event) => handleChekBanner2Change(event, "buttonText")} placeholder='Enter your button text.' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={6} sm={6} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b2ButtonTarget" value={benner2Text?.buttonTarget} onChange={(event) => handleChekBanner2Change(event, "buttonTarget")} placeholder='Button Target' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    {/* <Grid item lg={6} sm={6} className='hp-form-item'>
                                                    <Box className='edit-field'>
                                                        <Select name="b2ButtonTarget"
                                                            onChange={(event) => {handleChekBanner2Change(event, "buttonTarget");setValue('b2ButtonTarget',event?.target?.value)}}
                                                            value={getValues('b2ButtonTarget')}
                                                            MenuProps={MenuProps}
                                                            IconComponent={KeyboardArrowDownRoundedIcon}
                                                            defaultValue="''"
                                                            className="filter-slct">
                                                            <MenuItem className="selectDropDownList" value="none" disabled selected><em>Button Target</em></MenuItem>
                                                            <MenuItem className="selectDropDownList" key={'blank'} value="blank">Blank</MenuItem>
                                                            <MenuItem className="selectDropDownList" key={'parent'} value="parent">Parent</MenuItem>
                                                            <MenuItem className="selectDropDownList" key={'self'} value="self">Self</MenuItem>
                                                        </Select>
                                                    </Box>
                                                </Grid> */}
                                                    {checkUpdateBanner2Text && <Grid item lg={12} sm={12} mt={1} className='hp-form-item home-btn'>
                                                        <Button variant='contained' className='search-btn' type='button' onClick={handleBanner2Data}>Save</Button>
                                                    </Grid>}
                                                </Grid>

                                            </Grid>
                                            <Grid item lg={2} sm={2} className='hp-heading-block-right' sx={{ paddingLeft: '1px !important', }}>
                                                <Typography variant="h6">Background Image</Typography>
                                                <Box className='bg-image-uploader'>
                                                    <Box className='draganddrop-wrapper'>
                                                        <CustomDropzoneBannerImage2 data={banner2Images} size={{ h: 250, w: 250 }} />
                                                    </Box>
                                                    <Typography variant="subtitle2" textAlign='center'>1440px x 524px 144dpi</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                        }
                    </Container>
                </Box>

                {/* open carousel modal */}
                {openCarouselModal &&
                    <CarouselEditModal
                        openAddEditForm={openCarouselModal}
                        handleDrawerCloseRow={handleCloseCarouselModal}
                        sectionUuid={currentHome?.carasouls?.marketingPageSectionId}
                        apiStatus={true}
                        setApiStatus={setApiStatus}
                        apiStatusMsg={apiStatusMsg}
                        setApiStatusMsg={setApiStatusMsg}
                    />
                }
                {/* {open TestimonialModal */}
                <TestimonialEditModal
                    openAddEditForm={openTestimonialModal}
                    handleDrawerCloseRow={handleCloseTestimonialModal}
                    sectionUuid={currentHome?.testimonials?.marketingPageSectionId}
                    apiStatus={true}
                    setApiStatus={setApiStatus}
                    apiStatusMsg={apiStatusMsg}
                    setApiStatusMsg={setApiStatusMsg}
                />
                {clickedPopover &&
                    <DownloadUnauthorizedPopover
                        clickedPopover={clickedPopover}
                        setClickedPopover={setClickedPopover}
                    />
                }
                {/* } */}
            </Page>
        </StyledEngineProvider>
    );
}
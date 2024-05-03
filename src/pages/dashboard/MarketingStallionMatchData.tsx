// @mu
import { useState } from 'react';
import React from "react";
import Carousel from 'react-material-ui-carousel'
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
    Popover,
    StyledEngineProvider,
} from '@mui/material';
import Page from 'src/components/Page';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import Select, { SelectChangeEvent } from '@mui/material/Select';
// ----------------------------------------------------------------------
import 'src/sections/@dashboard/marketing/marketing.css'
import MarketingFilterSidebar from 'src/sections/@dashboard/marketing/filter/MarketingFilterSidebar';
import StallionMatchCarouselEditModal from 'src/sections/@dashboard/marketing/stallionmatchpage/StallionMatchCarouselEditModal';
import StallionMatchTestimonialEditModal from 'src/sections/@dashboard/marketing/stallionmatchpage/StallionMatchTestimonialEditModal';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack';
import { MarketingStallionMatch } from 'src/@types/marketing';
import {
    useMarketingPageQuery,
    useAddPricingTileMutation,
    useDeletePricingTileMutation,
    useUpdateFarmMarketingPageMutation,
    useUploadImageMutation,
    useDeleteImageByUuidMutation,
    useFarmGalleryImagesUploadStatusMutation,
    useMarketingStallionMatchPageQuery
} from 'src/redux/splitEndpoints/marketingSplit';
import { MaterialTable } from "src/sections/@dashboard/marketing/stallionmatchpage/list/MaterialTable";
import { TestimonialMaterialTable } from "src/sections/@dashboard/marketing/stallionmatchpage/list/TestimonialMaterialTable";
import { v4 as uuid } from 'uuid';
import { Spinner } from "src/components/Spinner";
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from 'src/constants/MenuProps';
import useSettings from 'src/hooks/useSettings';
import CustomDropzoneHeadingImage from 'src/components/CustomDropzoneHeadingImage';
import CustomDropzoneBannerImage1 from 'src/components/CustomDropzoneBannerImage1';
import CustomDropzoneBannerImage2 from 'src/components/CustomDropzoneBannerImage2';
import CustomLogoUploadDropZone from 'src/components/CustomLogoUploadDropZone';
import CustomDropzoneHeroImage from 'src/components/CustomDropzoneHeroImage';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

type FormValuesProps = MarketingStallionMatch;

// Type declaration for carousel
export interface CarasoulDataItem {
    id: string;
    title: string | null;
    description: string | null;
    isActive: boolean;
    orientation: string | null;
    imageUrl: string | null;
    buttonText: string | null;
    buttonUrl: string | null;
    position: number
}

// Type declaration for testimonial
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


export default function MarketingStallionMatchData() {
    const filterCounterhook = useCounter(0);
    const [valuesExist, setValuesExist] = useState<any>({});
    const [clickedPopover, setClickedPopover] = useState(false);
    const [userModuleAccess, setUserModuleAccess] = useState(false);
    const [onSuccessCallApi, setOnSuccessCallApi] = useState(false);
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
        if (valuesExist.hasOwnProperty('MARKETING_STALLION_MATCH_PAGE_FOR_FARMS')) {
            setUserModuleAccess(true);
        }
        setMarketingModuleAccess({
            ...marketingModuleAccess,
            marketing_viewonly: !valuesExist?.hasOwnProperty('MARKETING_STALLION_MATCH_PAGE_FOR_FARMS') ? false : true,
            marketing_update: !valuesExist?.hasOwnProperty('MARKETING_STALLION_MATCH_PAGE_FOR_FARMS') ? false : true,
        });
        filterCounterhook.increment();
    }, [valuesExist]);

    const matchPageId = process.env.REACT_APP_MARKETING_STALLION_MATCH_PAGE_ID;
    var items = [
        {
            name: "Random Name #1",
            description: ""
        },
        {
            name: "Random Name #2",
            description: ""
        },
    ];

    const [index, setIndex] = React.useState(0);
    // Upload image api call
    const [postHeroImages] = useUploadImageMutation();

    const handleChange1 = (cur: number, prev: number) => {
        setIndex(cur);
    };

    // Patch media status api call
    const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();
    // console.log(mediaUploadSuccessResponse,onSuccessCallApi,'mediaUploadSuccessResponse')
    // Patch marketing match api call
    const [addFarmMarketingPage] = useUpdateFarmMarketingPageMutation();

    // Add tile price api call
    const [addPricingTile] = useAddPricingTileMutation();

    // Delete tile price api call
    const [deletePricingTile] = useDeletePricingTileMutation();

    const successResonse:any = mediaUploadSuccessResponse;
    const obj = {
        matchPageId: matchPageId,
        flag: successResonse?.loading === false ? onSuccessCallApi : successResonse?.loading
    };
    // Get marketing match api call
    const data = useMarketingStallionMatchPageQuery(obj, { refetchOnMountOrArgChange: true });
    const currentForFarm = (data?.isSuccess) ? data?.data : [];
    const StallionMatchCarouselList: Array<CarasoulDataItem> = (data?.isSuccess) ? currentForFarm?.carasouls?.list : [];
    const StallionMatchTestimonialList: Array<TestimonialDataItem> = (data?.isSuccess) ? currentForFarm?.testimonials?.list : [];
    const freePricingTile = (data?.isSuccess) ? currentForFarm?.freePricingTile?.list : [];
    const promotedPricingTile = (data?.isSuccess) ? currentForFarm?.promotedPricingTile?.list : [];

    const [fileUpload, setFileUpload] = useState<any>();
    const fileDetails = currentForFarm?.mainHeading?.bgImage ? currentForFarm?.mainHeading?.bgImage : null;

    const fileuuid: any = uuid();

    // Delete image by id api call
    const [deleteBGImages] = useDeleteImageByUuidMutation();

    const headingImageFileuuid: any = uuid();

    // Upload image api call
    const [setHeadingImages] = useUploadImageMutation();
    const [headingImageFileUpload, setHeadingImageFileUpload] = useState<any>();
    const galleryResolution = { height: 1280, width: 1920 };
    const [reportOverviewImageFile, setReportOverviewImageFile] = useState<any>();
    const headingImagesDetails = currentForFarm?.mainHeading?.bgImage ? currentForFarm?.mainHeading?.bgImage : null;
    const [presignedheadingImagePath, setPresignedHeadingImagePath] = useState<any>();
    const [headingImageFile, setHeadingImageFile] = useState<any>();
    const [headingImageUploadFileData, setHeadingImageUploadFileData] = useState<any>({});
    const headingImages = {
        setHeadingImageFileUpload,
        headingImagesDetails,
    };
    const [heroImagesDeletedId, setHeroImagesDeletedId] = useState<any>([]);
    let [galleryImages, setGalleryImages] = useState<any>([]);

    React.useEffect(() => {
        if (headingImageFileUpload && !headingImageFileUpload.isDeleted) {
            try {
                // Step 1- Upload Image api call
                setHeadingImages({
                    marketingPageSectionUuid: currentForFarm?.mainHeading?.marketingPageSectionUuid,
                    fileName: headingImageFileUpload.path,
                    fileuuid: headingImageFileuuid,
                    fileSize: headingImageFileUpload.size,
                }).then(async (res: any) => {
                    const details = { headingImageFileUpload, headingImageFileuuid };
                    if (details) {
                        // Step 2- Update aws s3 url
                        const uploadOptions = { method: 'Put', body: details.headingImageFileUpload };
                        const imageresult = await fetch(res.data.url, uploadOptions);
                        // Step 3- Image status api call
                        mediaUploadSuccess([headingImageFileuuid]);
                    }
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
                deleteBGImages({ pageSectionUuId: currentForFarm?.mainHeading?.marketingPageSectionUuid });
            } catch (error) {
                console.error(error);
            }
        }
    }, [headingImageFileUpload]);

    const banner1ImageFileuuid: any = uuid();
    const [setBanner1Images] = useUploadImageMutation();
    const [banner1ImageFileUpload, setBanner1ImageFileUpload] = useState<any>();
    const banner1Resolution = { height: 1280, width: 1920 };
    const banner1ImagesDetails = currentForFarm?.banner1?.bgImage ? currentForFarm?.banner1?.bgImage : null;
    const [presignedBanner1ImagePath, setPresignedBanner1ImagePath] = useState<any>();
    const [banner1ImageFile, setBanner1ImageFile] = useState<any>();
    const [banner1ImageUploadFileData, setBanner1ImageUploadFileData] = useState<any>({});
    const banner1Images = {
        setBanner1ImageFileUpload,
        banner1ImagesDetails,
    };

    React.useEffect(() => {
        if (banner1ImageFileUpload && !banner1ImageFileUpload.isDeleted) {
            try {
                // Step 1- Upload Image api call
                setBanner1Images({
                    marketingPageSectionUuid: currentForFarm?.banner1?.marketingPageSectionUuid,
                    fileName: banner1ImageFileUpload.path,
                    fileuuid: banner1ImageFileuuid,
                    fileSize: banner1ImageFileUpload.size,
                }).then(async (res: any) => {
                    const details = { banner1ImageFileUpload, banner1ImageFileuuid };
                    setOnSuccessCallApi(false)
                    if (details) {
                        // Step 2- Update aws s3 url
                        const uploadOptions = { method: 'Put', body: details.banner1ImageFileUpload };
                        const imageresult = await fetch(res.data.url, uploadOptions);
                        // Step 3- Image status api call
                        //mediaUploadSuccess([banner1ImageFileuuid]);
                    }
                    let count = 1;
                    const interval = setInterval(async () => {
                        if (count >= 1) {
                            let data: any = await mediaUploadSuccess([banner1ImageFileuuid]);
                            
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
                    setBanner1ImageFile(details);
                    setPresignedBanner1ImagePath(res.data.url);
                    setBanner1ImageUploadFileData(
                        {
                            fileName: res.data.url,
                            fileuuid: banner1ImageFileuuid,
                            fileSize: banner1ImageFileUpload.size
                        }
                    );
                });
            } catch (error) {
                console.error(error);
            }
        }
        if (banner1ImageFileUpload && banner1ImageFileUpload.isDeleted) {
            try {
                deleteBGImages({ pageSectionUuId: currentForFarm?.banner1?.marketingPageSectionUuid });
            } catch (error) {
                console.error(error);
            }
        }
    }, [banner1ImageFileUpload]);

    const banner2ImageFileuuid: any = uuid();
    const [setBanner2Images] = useUploadImageMutation();
    const [banner2ImageFileUpload, setBanner2ImageFileUpload] = useState<any>();
    const banner2Resolution = { height: 1280, width: 1920 };
    const banner2ImagesDetails = currentForFarm?.banner2?.bgImage ? currentForFarm?.banner2?.bgImage : null;
    const [presignedBanner2ImagePath, setPresignedBanner2ImagePath] = useState<any>();
    const [banner2ImageFile, setBanner2ImageFile] = useState<any>();
    const [banner2ImageUploadFileData, setBanner2ImageUploadFileData] = useState<any>({});
    const banner2Images = {
        setBanner2ImageFileUpload,
        banner2ImagesDetails,
    };

    React.useEffect(() => {
        if (banner2ImageFileUpload && !banner2ImageFileUpload.isDeleted) {
            try {
                // Step 1- Upload Image api call
                setBanner2Images({
                    marketingPageSectionUuid: currentForFarm?.banner2?.marketingPageSectionUuid,
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
                        //mediaUploadSuccess([banner2ImageFileuuid]);
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
                deleteBGImages({ pageSectionUuId: currentForFarm?.banner2?.marketingPageSectionUuid });
            } catch (error) {
                console.error(error);
            }
        }
    }, [banner2ImageFileUpload]);

    // State variable for heading, hero, banner1 and banner2
    const [clientLogosList, setClientLogosList] = useState<any>([]);
    const [ClientLogosPageSectionId, setClientLogosPageSectionId] = useState<any>('');
    const [checkInputChange, setCheckInputChange] = useState(false);
    const [checkUpdateHeroText, setCheckUpdateHeroText] = useState(false);
    const [checkUpdateBanner1Text, setCheckUpdateBanner1Text] = useState(false);
    const [checkUpdateBanner2Text, setCheckUpdateBanner2Text] = useState(false);
    const [headingText, setHeadingText] = useState({
        title: "",
        description: "",
        buttonText: "",
        buttonTarget: "",
        bgImage: "",
    });

    const [benner1Text, setBanner1Text] = useState({
        title: "",
        description: "",
        bgImage: "",
    });
    const [benner2Text, setBanner2Text] = useState({
        title: "",
        description: "",
        buttonText: "",
        bgImage: "",
        buttonTarget: "",
    });
    const [isStateUpdated, setIsStateUpdated] = useState(false);
    React.useEffect(() => {
        if (data?.isSuccess) {
            setHeadingText({
                title: currentForFarm?.mainHeading?.title,
                description: currentForFarm?.mainHeading?.description,
                buttonText: currentForFarm?.mainHeading?.emailAddress,
                bgImage: currentForFarm?.mainHeading?.bgImage,
                buttonTarget: currentForFarm?.mainHeading?.buttonTarget,
            })

            setBanner1Text({
                title: currentForFarm?.banner1?.title,
                description: currentForFarm?.banner1?.description,
                bgImage: currentForFarm?.banner1?.bgImage
            })
            setBanner2Text({
                title: currentForFarm?.banner2?.title,
                description: currentForFarm?.banner2?.description,
                buttonText: currentForFarm?.banner2?.buttonText,
                bgImage: currentForFarm?.banner2?.bgImage,
                buttonTarget: currentForFarm?.banner2?.buttonTarget,
            })

            if (currentForFarm?.clientLogos?.list) {
                let arr: any = [];
                currentForFarm?.clientLogos?.list?.map((res: any) => {
                    if (!galleryImages.find((o: any) => o.id == res.id)) {
                        arr.push(res);
                    }
                })
                setGalleryImages(arr);
            }

            let arr = currentForFarm?.clientLogos?.list?.filter((v: any) => v.imageUrl);
            setClientLogosList(arr);
            setClientLogosPageSectionId(currentForFarm?.clientLogos?.marketingPageSectionId);

            setIsStateUpdated(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [currentForFarm]);


    function Item(props: any) {
        let { item, key, index: i } = props;

        return (
            <div className='client-logo-slider-list' style={{ width: "100%", height: "100%" }}>
                {/* {item.description} */}
                <Grid className='client-logo-section' container spacing={1}>
                    {
                        new Array(8).fill(0).map((item: any, index: any) => {
                            let pos = (i * 8) + index;
                            const fileDetails = clientLogosList?.length ? clientLogosList[pos] : null;

                            const heroImages = {
                                fileDetails,
                                position: pos,
                                galleryImages
                            };
                            return (
                                <Grid item lg={3} sm={3} className='client-logo-item' key={pos}>
                                    <Box className='bg-image-uploader' >
                                        <CustomLogoUploadDropZone data={heroImages} size={{ h: 150, w: 150 }} />
                                    </Box>
                                </Grid>
                            )
                        }
                        )
                    }
                </Grid>
            </div>
        )

    }

    const [deleteHeroImages] = useDeleteImageByUuidMutation();
    const HeroImageFileuuid: any = uuid();
    const [setHeroImages] = useUploadImageMutation();
    const [heroImageFileUpload, setHeroFileUpload] = useState<any>();
    const heroResolution = { height: 1280, width: 1920 };
    const heroImagesDetails = currentForFarm?.heroImage?.imageName ? currentForFarm?.heroImage?.imageName : null;
    const [presignedHero2ImagePath, setPresignedHeroImagePath] = useState<any>();
    const [heroImageFile, setHeroImageFile] = useState<any>();
    const [heroImageUploadFileData, setHeroImageUploadFileData] = useState<any>({});
    const heroMainImages = {
        setHeroFileUpload,
        heroImagesDetails,
    };

    React.useEffect(() => {
        if (heroImageFileUpload && !heroImageFileUpload.isDeleted) {
            try {
                setHeroImages({
                    marketingPageSectionUuid: currentForFarm?.heroImage?.marketingPageSectionUuid,
                    fileName: heroImageFileUpload.path,
                    fileuuid: HeroImageFileuuid,
                    fileSize: heroImageFileUpload.size,
                }).then(async (res: any) => {
                    const details = { heroImageFileUpload, HeroImageFileuuid };
                    setHeroImageFile(details);
                    setPresignedHeroImagePath(res.data.url);
                    setOnSuccessCallApi(false);
                    const uploadOptions = { method: 'Put', body: details.heroImageFileUpload };
                    const imageresult = await fetch(res.data.url, uploadOptions);
                    let count = 1;
                    const interval = setInterval(async () => {
                        if (count >= 1) {
                            let data: any = await mediaUploadSuccess([HeroImageFileuuid]);
                            
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
                    setHeroImageUploadFileData(
                        {
                            fileName: res.data.url,
                            fileuuid: HeroImageFileuuid,
                            fileSize: heroImageFileUpload.size
                        }
                    );
                    
                });
            } catch (error) {
                console.error(error);
            }
        }
        if (heroImageFileUpload && heroImageFileUpload.isDeleted) {
            try {
                deleteHeroImages({ pageSectionUuId: currentForFarm?.heroImage?.marketingPageSectionUuid });
            } catch (error) {
                console.error(error);
            }
        }
    }, [heroImageFileUpload]);

    // Check any data updated in banner1, then display Save button
    const handleChekBanner1Change = (event: any, type: string) => {
        setBanner1Text({
            ...benner1Text,
            [type]: event.target.value
        })
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

    const isValidHttpUrl = (str: string) => {
        let url;

        try {
            url = new URL(str);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    // Check any data updated in input, then display Save button
    const handleCheckChange = (event: any, type: string) => {
        setHeadingText({
            ...headingText,
            [type]: event.target.value
        })
        setCheckInputChange(true)
    }

    // Check any data updated in main heading and Save button clicked
    const handleMainHeadingData = async () => {
        if (!marketingModuleAccess?.marketing_update) {
            setApiStatusMsg({
                status: 422,
                message: '<b>You do not have sufficient privileges to access this module!</b>',
            });
            setApiStatus(true);
        } else {
            await addFarmMarketingPage({
                pageId: matchPageId,
                mainHeading: {
                    title: headingText?.title,
                    description: headingText?.description,
                    emailAddress: headingText?.buttonText,
                    buttonTarget: headingText?.buttonTarget,
                }
            });
            setCheckInputChange(false);
            setCheckUpdateBanner2Text(false);
            setApiStatusMsg({ 'status': 201, 'message': '<b>Main heading data successfully updated!</b>' });
            setApiStatus(true);
        }
    }

    // Check any data updated in banner1 and Save button clicked
    const handleBanner1Data = async () => {
        if (!marketingModuleAccess?.marketing_update) {
            setApiStatusMsg({
                status: 422,
                message: '<b>You do not have sufficient privileges to access this module!</b>',
            });
            setApiStatus(true);
        } else {
            await addFarmMarketingPage({
                pageId: matchPageId,
                banner1: {
                    title: benner1Text?.title,
                    description: benner1Text?.description,
                }
            });
            setCheckUpdateBanner1Text(false);
            setCheckUpdateBanner2Text(false);
            setApiStatusMsg({ 'status': 201, 'message': '<b>Banner1 data successfully updated!</b>' });
            setApiStatus(true);
        }
    }

    // Check any data updated in banner2 and Save button clicked
    const handleBanner2Data = async () => {
        if (!marketingModuleAccess?.marketing_update) {
            setApiStatusMsg({
                status: 422,
                message: '<b>You do not have sufficient privileges to access this module!</b>',
            });
            setApiStatus(true);
        } else {
            await addFarmMarketingPage({
                pageId: matchPageId,
                banner2: {
                    title: benner2Text?.title,
                    description: benner2Text?.description,
                    buttonText: benner2Text?.buttonText,
                    buttonTarget: benner2Text?.buttonTarget,
                }
            });
            setCheckUpdateBanner2Text(false);
            setCheckUpdateBanner2Text(false);
            setApiStatusMsg({ 'status': 201, 'message': '<b>Banner2 data successfully updated!</b>' });
            setApiStatus(true);
        }
    }

    const NewFarmSchema = Yup.object().shape({
        mhTitle: Yup.string().required('Title is required'),
        mhDescription: Yup.string().required('Description is required'),
        mhEmailAddress: Yup.string().required('Email is required'),
        hButtonTarget: Yup.string().required('Button Target is required'),
        b1Title: Yup.string().required('Title is required'),
        b1Description: Yup.string().required('Description is required'),
        b1ButtonText: Yup.string().required('Button text is required'),
        b1ButtonTarget: Yup.string().required('Button Target is required'),
        b2Title: Yup.string().required('Title is required'),
        b2Description: Yup.string().required('Description is required'),
        b2ButtonText: Yup.string().required('Button text is required'),
        b2ButtonTarget: Yup.string().required('Button Target is required'),
    });

    const defaultValues = React.useMemo(
        () => ({
            mhTitle: currentForFarm?.mainHeading?.title || '',
            mhDescription: currentForFarm?.mainHeading?.description || '',
            mhEmailAddress: currentForFarm?.mainHeading?.emailAddress || '',
            hButtonTarget: currentForFarm?.mainHeading?.buttonTarget || '',
            b1Title: currentForFarm?.banner1?.title || '',
            b1Description: currentForFarm?.banner1?.description || '',
            b1ButtonText: currentForFarm?.banner1?.buttonText || '',
            b1ButtonTarget: currentForFarm?.banner1?.buttonTarget || '',
            b2Title: currentForFarm?.banner2?.title || '',
            b2Description: currentForFarm?.banner2?.description || '',
            b2ButtonText: currentForFarm?.banner2?.buttonText || '',
            b2ButtonTarget: currentForFarm?.banner2?.buttonTarget || '',
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [currentForFarm]
    );

    const [open, setOpen] = useState(false);
    const [isEdit, setEdit] = useState(false);
    const [rowId, setRowId] = useState("");

    const handleEditPopup = () => {
        setOpen(!open);
    }

    const handleEditState = () => {
        setEdit(true);
    }

    const handleCloseEditState = () => {
        setEdit(!isEdit);
    }

    const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
    const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
        setOpenMenuActions(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setOpenMenuActions(null);
    };

    const [openTestimonialModal, SetOpenTestimonialModal] = useState(false);
    const handleCloseTestimonialModal = () => {
        SetOpenTestimonialModal(false);
    };
    const [openCarouselModal, SetOpenCarouselModal] = useState(false);
    const handleCloseCarouselModal = () => {
        SetOpenCarouselModal(false);
    };

    const CHARACTER_LIMIT = 100;
    const [values, setValues] = React.useState({
        name: ""
    });

    const handleChange = (name: string) => (event: { target: { value: any; }; }) => {
        setValues({ ...values, [name]: event.target.value });
    };

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const openFreePopover = Boolean(anchorEl);
    const idFree = openFreePopover ? 'simple-popover' : undefined;

    const [anchorE2, setAnchorE2] = useState<HTMLButtonElement | null>(null);
    const openPromotedPopover = Boolean(anchorE2);
    const idPromoted = openPromotedPopover ? 'simple-popover' : undefined;

    // Add price tile in free save clicked
    const handleFreeAddClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!marketingModuleAccess?.marketing_update) {
            setClickedPopover(true);
        } else {
            setAnchorEl(event.currentTarget);
        }
    };

    // Add price tile in promoted save clicked
    const handlePromotedAddClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!marketingModuleAccess?.marketing_update) {
            setClickedPopover(true);
        } else {
            setAnchorE2(event.currentTarget);
        }
    };

    const [freePricingTileText, setFreePricingTileText] = useState('');
    const [promotedPricingTileText, setPromotedPricingTileText] = useState('');

    // Post price tile in free or promoted
    const handlePricingTileSubmit = async (pricingTileType: any) => {
        await addPricingTile(
            {
                marketingPageSectionId: (pricingTileType === 'free') ? currentForFarm?.freePricingTile?.marketingPageSectionId : currentForFarm?.promotedPricingTile?.marketingPageSectionId,
                title: (pricingTileType === 'free') ? freePricingTileText : promotedPricingTileText,
                pricingTileType: pricingTileType,
            });
        if (pricingTileType === 'free') {
            setAnchorEl(null);
            setFreePricingTileText('');
        } else {
            setAnchorE2(null);
            setPromotedPricingTileText('');
        }
    };

    // Close free add popup 
    const handleFreeAddClose = () => {
        setAnchorEl(null);
        setFreePricingTileText('');
    };

    // Close promoted add popup 
    const handlePromotedAddClose = () => {
        setAnchorE2(null);
        setPromotedPricingTileText('');
    };

    // delete free or promoted api call 
    const handleDeletePricingTile = async (pricingTileType: any, uuid: any) => {
        if (!marketingModuleAccess?.marketing_update) {
            setApiStatusMsg({
                status: 422,
                message: '<b>You do not have sufficient privileges to access this module!</b>',
            });
            setApiStatus(true);
        } else {
            await deletePricingTile({ tileId: uuid, pricingTileType: pricingTileType, });
        }
    }

    const [apiStatus, setApiStatus] = useState(false);
    const [apiStatusMsg, setApiStatusMsg] = useState({});
    const { themeLayout } = useSettings();
    const [openHeader, setOpenHeader] = useState(false);
    const { collapseClick, isCollapse } = useCollapseDrawer();
    const verticalLayout = themeLayout === 'vertical';

    const ITEM_HEIGHT = 35;
    const ITEM_PADDING_TOP = 8;
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
    }

    const handleStallionMatchAddNewCarousel = () => {
        if (!marketingModuleAccess?.marketing_update) {
            setClickedPopover(true);
        } else {
            SetOpenCarouselModal(true);
        }
    }

    const handleStallionMatchAddNewTestimonial = () => {
        if (!marketingModuleAccess?.marketing_update) {
            setClickedPopover(true);
        } else {
            SetOpenTestimonialModal(true);
        }
    }

    return (
        <StyledEngineProvider injectFirst>
            <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
            <Page title="Stallion Match Page" sx={{ display: 'flex' }} className='HomepageData'>
                {/* <MarketingFilterSidebar /> */}
                <Box className='HomepageDataRight' sx={{ width: '100%' }} px={2}>
                    <Container>
                        {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}

                        <Stack direction='row' className='MainTitleHeader'>
                            <Grid container mt={0}>
                                <Grid item lg={12} sm={12}>
                                    <Typography variant="h6" className='MainTitle'>Stallion Match Farm Marketing Page</Typography>
                                </Grid>

                            </Grid>
                        </Stack>
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

                                                <Grid className='hp-form-block' spacing={1} container>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b2Title" value={headingText?.title} onChange={(event) => handleCheckChange(event, "title")} placeholder='Heading Title' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="b2Description" value={headingText?.description} onChange={(event) => handleCheckChange(event, "description")} placeholder='Enter your description.' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>

                                                    <Grid item lg={12} sm={12} sx={{ paddingTop: '0 !important' }}>
                                                        <Box className='SMFmarketing'>
                                                            <Box className='hp-form-item'>
                                                                <Box className='edit-field'>
                                                                    <TextField name="b2ButtonText" value={headingText?.buttonText} onChange={(event) => handleCheckChange(event, "buttonText")} placeholder='Enter Email Address' className='edit-field hp-form-input' />
                                                                </Box>
                                                            </Box>
                                                            <Box className='hp-form-item'>
                                                                <Box className='edit-field'>
                                                                    <TextField name="b2ButtonText" value={headingText?.buttonTarget} onChange={(event) => handleCheckChange(event, "buttonTarget")} placeholder='Button Target' className='edit-field hp-form-input' />
                                                                </Box>
                                                            </Box>
                                                            {/* <Box className='hp-form-item'>
                                                    <Box className='edit-field'>
                                                        <Select name="b2ButtonTarget"
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
                                                              }}
                                                            IconComponent={KeyboardArrowDownRoundedIcon}
                                                            defaultValue="none"
                                                            className="filter-slct">
                                                            <MenuItem className="selectDropDownList" value="none" disabled><em>Button Target</em></MenuItem>
                                                            <MenuItem className="selectDropDownList" value="yes">Blank</MenuItem>
                                                            <MenuItem className="selectDropDownList" value="no">Parent</MenuItem>
                                                            <MenuItem className="selectDropDownList" value="no">Self</MenuItem>
                                                        </Select>
                                                    </Box>
                                                </Box> */}
                                                        </Box>
                                                    </Grid>
                                                    {checkInputChange && <Grid item lg={12} sm={12} mt={1} className='hp-form-item home-btn'>
                                                        <Button variant='contained' className='search-btn' type='button' onClick={handleMainHeadingData}>Save</Button>
                                                    </Grid>}
                                                </Grid>

                                            </Grid>
                                            <Grid item lg={2} sm={2} className='hp-heading-block-right' sx={{ paddingLeft: '1px !important', }}>
                                                <Typography variant="h6">Background Image</Typography>
                                                <Box className='bg-image-uploader'>
                                                    <Box className='draganddrop-wrapper'>
                                                        <CustomDropzoneHeadingImage data={headingImages} size={{ h: 200, w: 200 }} />
                                                    </Box>
                                                    <Typography variant="subtitle2" textAlign='center'>1440px x 524px 144dpi</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Box className='HomeBlockWrapper' mt={3}>
                                        <Grid container spacing={2} className='hp-heading-block'>
                                            <Grid item lg={4} sm={4} className='hp-heading-block-right' pr={7}>
                                                <Typography variant="h6">Hero Image</Typography>
                                                <Box className='bg-image-uploader lg'>
                                                    <CustomDropzoneHeroImage data={heroMainImages} size={{ h: 500, w: 500 }} />

                                                    <Typography variant="subtitle2" textAlign='center'>814px x 675px 144dpi</Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item lg={8} sm={8} className='hp-heading-block-left'>
                                                <Typography variant="h6" sx={{ marginBottom: "0px !important" }}>Client Logos
                                                    <Typography variant="subtitle2" textAlign='center' className='quote-text' sx={{ paddingBottom: "0px !important" }}>182px x 105px 144dpi</Typography>
                                                </Typography>

                                                <Box className='client-logo-wrapper'>
                                                    <Carousel
                                                        index={index}
                                                        onChange={() => handleChange1}
                                                        interval={4000}
                                                        animation="slide"
                                                        autoPlay={false}
                                                        indicators={false}
                                                        stopAutoPlayOnHover
                                                        swipe={true}
                                                        navButtonsAlwaysVisible={true}
                                                        navButtonsWrapperProps={{ className: "carouselArrowBtnwrp" }}
                                                        navButtonsProps={{ className: "carouselArrowBtn" }}
                                                        className="my-carousel"
                                                        NextIcon={<ArrowForwardIosRoundedIcon />}
                                                        PrevIcon={<ArrowBackIosNewRoundedIcon />}
                                                        cycleNavigation={false}
                                                    >
                                                        {items.map((item, i) => (
                                                            <Stack className='client-logo-slider' key={i}><Item key={i} index={i} item={item} /></Stack>
                                                        ))}
                                                    </Carousel>
                                                    {items.map((item, i) => (
                                                        <Stack className='carousel-btn-wrapper' key={i}>
                                                            <button
                                                                className='carousel-btn'
                                                                onClick={() => setIndex(i)}
                                                                style={{ background: i === index ? "#ccc" : "#fff" }}
                                                            >
                                                                key={i}
                                                            </button>
                                                        </Stack>
                                                    ))}
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Box className='hp-table-wrapper' mt={4}>
                                            <MaterialTable
                                                items={StallionMatchCarouselList}
                                                CaraoulSectionUuid={currentForFarm?.carasouls?.marketingPageSectionId}
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
                                                    onClick={() => handleStallionMatchAddNewCarousel()}
                                                >Add Carousel
                                                </Button>
                                            </Box>
                                        </Grid>

                                    </Box>

                                    <Box className='pricing-tile-wrapper' pt={4.5}>
                                        <Grid container spacing={15} className='pricing-grid-block'>
                                            <Grid item lg={6} sm={6} className='pricing-grid-block-left'>
                                                <Typography variant="h6">Free Pricing Tile</Typography>

                                                <Box className='pricing-table-wrapper' mt={2}>
                                                    <TableContainer className='pricinglist' sx={{ Width: '100% ' }}>
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left"></TableCell>
                                                                    <TableCell align="left"></TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {freePricingTile.map((row: any, index: number) => (
                                                                    <TableRow key={row.id} className='pricinglistRow'>
                                                                        <TableCell align="left">
                                                                            {row?.title}
                                                                        </TableCell>
                                                                        <TableCell align="left">
                                                                            <Button type='button' className='link-btn' onClick={() => handleDeletePricingTile('free', row?.id)}>Delete</Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                                <TableRow className='pricinglistRow add-button-price'>
                                                                    <TableCell align="left">
                                                                        <Button
                                                                            type='button'
                                                                            className='link-btn'
                                                                            id={currentForFarm?.freePricingTile?.marketingPageSectionId}
                                                                            onClick={handleFreeAddClick}
                                                                        >Add +</Button>
                                                                    </TableCell>
                                                                    <TableCell align="left"></TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                    <Popover
                                                        id={idFree}
                                                        open={openFreePopover}
                                                        anchorEl={anchorEl}
                                                        className="Add-price-table-modal"
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'left',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'left',
                                                        }}
                                                    >
                                                        <Box className='add-price-table'>
                                                            <i className="icon-Incorrect" onClick={handleFreeAddClose} />
                                                            <Box className='add-price-table-inner'>

                                                                <TextField
                                                                    className='edit-field '
                                                                    fullWidth
                                                                    type="text"
                                                                    value={freePricingTileText}
                                                                    placeholder="Enter Title"
                                                                    onChange={(e: any) => setFreePricingTileText(e.target.value)}
                                                                />

                                                                <Button className="search-btn" onClick={() => handlePricingTileSubmit('free')}>
                                                                    Submit
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    </Popover>
                                                </Box>
                                            </Grid>
                                            <Grid item lg={6} sm={6} className='pricing-grid-block-left'>
                                                <Typography variant="h6">Promoted Pricing Tile</Typography>
                                                <Box className='pricing-table-wrapper' mt={2}>
                                                    <TableContainer className='pricinglist' sx={{ Width: '100% ' }}>
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell align="left">Description</TableCell>
                                                                    <TableCell align="left"></TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {promotedPricingTile.map((row: any, index: number) => (
                                                                    <TableRow key={row.id} className='pricinglistRow'>
                                                                        <TableCell align="left">
                                                                            {row?.title}
                                                                        </TableCell>
                                                                        <TableCell align="left">
                                                                            <Button type='button' className='link-btn' onClick={() => handleDeletePricingTile('promoted', row?.id)}>Delete</Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                                <TableRow className='pricinglistRow add-button-price'>
                                                                    <TableCell align="left">
                                                                        <Button
                                                                            type='button'
                                                                            className='link-btn'
                                                                            id={currentForFarm?.promotedPricingTile?.marketingPageSectionId}
                                                                            onClick={handlePromotedAddClick}
                                                                        >Add +</Button>
                                                                    </TableCell>
                                                                    <TableCell align="left"></TableCell>
                                                                </TableRow>
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                    <Popover
                                                        id={idPromoted}
                                                        open={openPromotedPopover}
                                                        anchorEl={anchorE2}
                                                        className="Add-price-table-modal"
                                                        anchorOrigin={{
                                                            vertical: 'bottom',
                                                            horizontal: 'left',
                                                        }}
                                                        transformOrigin={{
                                                            vertical: 'top',
                                                            horizontal: 'left',
                                                        }}
                                                    >
                                                        <Box className='add-price-table'>
                                                            <i className="icon-Incorrect" onClick={handlePromotedAddClose} />
                                                            <Box className='add-price-table-inner'>

                                                                <TextField
                                                                    fullWidth
                                                                    className='edit-field '
                                                                    type="text"
                                                                    value={promotedPricingTileText}
                                                                    placeholder="Enter Title"
                                                                    onChange={(e: any) => setPromotedPricingTileText(e.target.value)}
                                                                />

                                                                <Button className="search-btn" onClick={() => handlePricingTileSubmit('promoted')}>
                                                                    Submit
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    </Popover>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>


                                    <Box className='HomeBlockWrapper' mt={3}>
                                        <Grid container spacing={10} className='hp-heading-block'>
                                            <Grid item lg={10} sm={10} className='hp-heading-block-left' sx={{ paddingRight: '10px !important', }}>
                                                <Typography variant="h6">Banner 1</Typography>

                                                <Grid className='hp-form-block' container>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="headingTitle" value={benner1Text?.title} onChange={(event) => handleChekBanner1Change(event, "title")} placeholder='Banner1 Title' className='edit-field hp-form-input' />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={12} sm={12} className='hp-form-item'>
                                                        <Box className='edit-field'>
                                                            <TextField name="headingDescription" value={benner1Text?.description} onChange={(event) => handleChekBanner1Change(event, "description")} placeholder='Enter your description.' className='edit-field hp-form-input' multiline rows={3.4} />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item lg={12} sm={12} className='hp-heading-block-bottom' sx={{ paddingTop: '6px !important' }}>
                                                        {checkUpdateBanner1Text && <Stack className='home-btn  save-btn-wrpr'>
                                                            <Button variant='contained' className='search-btn' type='button' onClick={handleBanner1Data}>Save</Button>
                                                        </Stack>}
                                                    </Grid>
                                                </Grid>

                                            </Grid>
                                            <Grid item lg={2} sm={2} className='hp-heading-block-right' sx={{ paddingLeft: '1px !important', }}>
                                                <Typography variant="h6">Background Image</Typography>
                                                <Box className='bg-image-uploader'>
                                                    <Box className='draganddrop-wrapper'>
                                                        <CustomDropzoneBannerImage1 data={banner1Images} size={{ h: 200, w: 200 }} />
                                                    </Box>
                                                    <Typography variant="subtitle2" textAlign='center'>1920px x 1080px 144dpi</Typography>
                                                </Box>
                                            </Grid>

                                        </Grid>

                                        <Box className='hp-table-wrapper' mt={3}>
                                            <TestimonialMaterialTable
                                                items={StallionMatchTestimonialList}
                                                TestimonialSectionUuid={currentForFarm?.testimonials?.marketingPageSectionId}
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
                                                <Button type='button' className='addcarousel-btn' onClick={() => handleStallionMatchAddNewTestimonial()}>Add Testimonial</Button>
                                            </Box>
                                        </Grid>

                                    </Box>

                                    <Box className='HomeBlockWrapper' mt={3}>
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
                                                    <Grid item lg={12} sm={12} sx={{ paddingTop: '0 !important' }}>
                                                        <Box className="SMFmarketing">
                                                            <Box className='hp-form-item'>
                                                                <Box className='edit-field'>
                                                                    <TextField name="b2ButtonText" value={benner2Text?.buttonText} onChange={(event) => handleChekBanner2Change(event, "buttonText")} placeholder='Button Text' className='edit-field hp-form-input' />
                                                                </Box>
                                                            </Box>
                                                            <Box className='hp-form-item'>
                                                                <Box className='edit-field'>
                                                                    <TextField name="buttonTarget" value={benner2Text?.buttonTarget} onChange={(event) => handleChekBanner2Change(event, "buttonTarget")} placeholder='Button Target' className='edit-field hp-form-input' />
                                                                    {(benner2Text?.buttonTarget?.trim() !== '' && isValidHttpUrl(benner2Text?.buttonTarget) === false) && <p>Enter valid url</p>}
                                                                </Box>
                                                            </Box>
                                                            {/* <Box className='hp-form-item'>
                                                            <Box className='edit-field'>
                                                                <Select name="b2ButtonTarget"
                                                                    MenuProps={MenuProps}
                                                                    IconComponent={KeyboardArrowDownRoundedIcon}
                                                                    defaultValue="none"
                                                                    className="filter-slct">
                                                                    <MenuItem className="selectDropDownList" value="none" disabled><em>Button Target</em></MenuItem>
                                                                    <MenuItem className="selectDropDownList" value="yes">Blank</MenuItem>
                                                                    <MenuItem className="selectDropDownList" value="no">Parent</MenuItem>
                                                                    <MenuItem className="selectDropDownList" value="no">Self</MenuItem>
                                                                </Select>
                                                            </Box>
                                                        </Box> */}
                                                        </Box>
                                                    </Grid>
                                                    {checkUpdateBanner2Text && <Grid item lg={12} sm={12} mt={1} className='hp-form-item home-btn'>
                                                        <Button variant='contained' className='search-btn' type='button' onClick={handleBanner2Data}>Save</Button>
                                                    </Grid>}
                                                </Grid>

                                            </Grid>
                                            <Grid item lg={2} sm={2} className='hp-heading-block-right' sx={{ paddingLeft: '1px !important', }}>
                                                <Typography variant="h6">Background Image</Typography>
                                                <Box className='bg-image-uploader'>
                                                    <Box className='draganddrop-wrapper'>
                                                        <CustomDropzoneBannerImage2 data={banner2Images} size={{ h: 200, w: 200 }} />
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
                {/* Carousel popup component */}
                <StallionMatchCarouselEditModal
                    openAddEditForm={openCarouselModal}
                    handleDrawerCloseRow={handleCloseCarouselModal}
                    sectionUuid={currentForFarm?.carasouls?.marketingPageSectionId}
                    apiStatus={true}
                    setApiStatus={setApiStatus}
                    apiStatusMsg={apiStatusMsg}
                    setApiStatusMsg={setApiStatusMsg}
                />
                {/* Testimonial popup component */}
                <StallionMatchTestimonialEditModal
                    openAddEditForm={openTestimonialModal}
                    handleDrawerCloseRow={handleCloseTestimonialModal}
                    sectionUuid={currentForFarm?.testimonials?.marketingPageSectionId}
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
            </Page>
        </StyledEngineProvider>
    );
}
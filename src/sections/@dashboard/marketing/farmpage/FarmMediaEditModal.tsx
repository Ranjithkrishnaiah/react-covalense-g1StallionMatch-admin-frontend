import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';

// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    FormProvider,
    RHFTextField,
} from 'src/components/hook-form';
import * as Yup from 'yup';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { LoadingButton } from '@mui/lab';
import {
    Box,
    Grid,
    Stack,
    Typography,
    CssBaseline,
    Drawer,
} from '@mui/material';

import { useGetFarmMediaQuery, useAddFarmMediaMutation, useEditFarmPageMutation, useFarmGalleryImagesUploadStatusMutation } from 'src/redux/splitEndpoints/marketingSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import { HeroImages } from 'src/@types/marketing';
import CustomDropzone from 'src/components/CustomDropzone';
import { useMediaImageUploadMutation } from 'src/redux/splitEndpoints/farmSplit';
// ----------------------------------------------------------------------
const drawerWidth = 360;

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
}));

type FormValuesProps = HeroImages;

export default function FarmMediaEditModal(props: any) {
    const {
        open,
        handleEditPopup,
        rowId,
        isEdit,
        openAddEditForm,
        handleDrawerCloseRow,
        handleCloseEditState,
        pageId,
        farmId,
        apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg,
        refetchFarmMedia, editedFarmMedia, setEditedFarmMedia, mediaImage, setMediaImage, isMediaFetching
    } = props;

    const [fileUpload, setFileUpload] = useState<any>();
    const [deleteMediaFile, setDeleteMediaFile] = useState<any>(null);
    const [reportOverviewImageFile, setReportOverviewImageFile] = useState<any>();
    const [presignedTestimonialImagePath, setPresignedTestimonialImagePath] = useState<any>();
    const [testimonialImageUploadFileData, setTestimonialImageUploadFileData] = useState<any>({});
    const [testimonialImageFile, setTestimonialImageFile] = useState<any>();
    const [farmMediaFileImages, setFarmMediaFileImages] = useState<any>([]);
    const [deletedTestimonialsImages, setDeletedTestimonialsImages] = React.useState<any>([]);
    console.log('editedFarmMedia', editedFarmMedia)
    console.log('farmMediaFileImages', farmMediaFileImages)
    console.log('farmMediaFileImages deletedTestimonialsImages', deletedTestimonialsImages)
    // Close drawer
    const handleDrawerClose = () => {
        handleEditPopup();
    };

    // Close popup
    const handleCloseModal = () => {
        handleDrawerClose();
        handleCloseEditState();
    };

    // Api call
    const [addFarmMedia] = useAddFarmMediaMutation();
    const [editFarmMedia] = useEditFarmPageMutation();
    const [setStallionTestimonialImages] = useMediaImageUploadMutation();
    const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();
    // const { data: farmMediaData, error, isFetching, isLoading, isSuccess } = useGetFarmMediaQuery({ pageId: pageId, farmId: farmId, mediaId: rowId }, { skip: (!isEdit), refetchOnMountOrArgChange: true });
    // const currentFarmMedia = farmMediaData;
    const currentFarmMedia = editedFarmMedia;
    const [uploadInProgress, setUploadInProgress] = useState<any>(false);
    // Form schema
    const NewTestimonialSchema = Yup.object().shape({
        title: Yup.string().required('Title is required'),
        description: Yup.string().required('Description is required'),
    });

    // form default value
    const defaultValues = React.useMemo(
        () => ({
            title: currentFarmMedia?.title || '',
            description: currentFarmMedia?.description || '',
            isDeleted: false,
        }),
        [currentFarmMedia]
    );

    // form element
    const methods = useForm<FormValuesProps>({
        resolver: yupResolver(NewTestimonialSchema),
        defaultValues,
    });

    // Form parameter
    const {
        reset,
        watch,
        control,
        setValue,
        getValues,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    // Reset form
    React.useEffect(() => {
        if (isEdit && currentFarmMedia) {
            reset(defaultValues);
        }
        if (!isEdit) {
            reset(defaultValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, currentFarmMedia]);

    const fileDetails = currentFarmMedia?.media?.length > 0 ? currentFarmMedia?.media[0].mediaUrl : null;
    const heroImages = {
        setFileUpload,
        fileDetails
    };
    const fileuuid: any = uuid();
    // const galleryResolution = { height: 1280, width: 1920 };

    // Upload media image
    useEffect(() => {
        if (fileUpload && !fileUpload.isDeleted) {
            try {
                setStallionTestimonialImages({
                    pageId: pageId,
                    farmId: farmId,
                    fileName: fileUpload.path,
                    fileuuid: fileuuid,
                    fileSize: fileUpload.size,
                }).then(async (res: any) => {
                    const details = { fileUpload, fileuuid };
                    // let uuidList: any = [];
                    // uuidList.push(fileuuid);
                    setDeletedTestimonialsImages([...deletedTestimonialsImages, fileuuid]);
                    setFarmMediaFileImages([
                        ...farmMediaFileImages,
                        {
                            file: fileUpload,
                            mediauuid: fileuuid,
                            url: res?.data?.url,
                            //   mediaInfoId: mediaInfoId,
                            isNew: true,
                        },
                    ]);
                    setTestimonialImageFile(details);
                    setPresignedTestimonialImagePath(res.data.url);
                    setTestimonialImageUploadFileData(
                        {
                            fileName: res.data.url,
                            fileuuid: fileuuid,
                            fileSize: fileUpload.size
                        }
                    );
                });
            } catch (error) {
                console.error(error);
            }
        }
        if (fileUpload && fileUpload.isDeleted) {
            try {
                let imagesDeletedId = [...deletedTestimonialsImages];
                setDeletedTestimonialsImages(imagesDeletedId);
                // const removeSpecificFile = farmMediaFileImages.map((res: any) => {
                //     return {
                //         ...res,
                //         isDeleted: imagesDeletedId.includes(res?.mediauuid) ? true : false,
                //     };
                // });
                let removeSpecificFile: any = [];
                if (farmMediaFileImages?.length) {
                    removeSpecificFile = farmMediaFileImages.map((res: any) => {
                        return {
                            ...res,
                            isDeleted: imagesDeletedId.includes(res?.mediauuid) ? true : false,
                        };
                    });
                } else {
                    removeSpecificFile = [{
                        isDeleted: true,
                        mediauuid: currentFarmMedia?.media[0]?.mediauuid
                    }]
                }
                console.log(removeSpecificFile, currentFarmMedia, 'removeSpecificFile');
                setFarmMediaFileImages([...removeSpecificFile]);
                if (currentFarmMedia?.media) {
                    setDeleteMediaFile({ isDeleted: true, mediauuid: currentFarmMedia?.media[0]?.mediauuid });
                }
            } catch (error) {
                console.error(error);
            }
        }
    }, [fileUpload]);
    // Submit farm media form
    const onSubmit = async (data: FormValuesProps) => {
        try {
            if (testimonialImageFile?.fileuuid) {
                const uploadOptions = { method: 'Put', body: testimonialImageFile.fileUpload };
                const imageresult = await fetch(presignedTestimonialImagePath, uploadOptions);
            }

            const mediaInfoMedia = farmMediaFileImages
                .map((res: any) => {
                    if (res) {
                        return {
                            isDeleted: res.isDeleted ? res.isDeleted : false,
                            mediauuid: res.isDeleted || res.isNew ? res.mediauuid : null,
                            // mediaInfoId: res.mediaInfoId,
                        };
                    }
                })
                .filter((res: any) => res);
            console.log(data, mediaInfoMedia, 'DATAT!!!')


            let editFinalData;
            if (!testimonialImageFile?.fileuuid && !deleteMediaFile?.isDeleted) {
                editFinalData = {
                    pageId: pageId,
                    farmId: farmId,
                    mediaInfos: [{
                        ...data,
                        mediaInfoId: rowId,
                        mediaInfoFiles: null,
                    }],
                }
                    ;
            } else {
                editFinalData = {
                    pageId: pageId,
                    farmId: farmId,
                    mediaInfos: [{
                        ...data,
                        mediaInfoId: rowId,
                        mediaInfoFiles: mediaInfoMedia,
                    }],
                }
                    ;
            }

            let finalData;
            if (!isEdit) {
                finalData = {
                    ...data,
                    mediaInfoFiles: mediaInfoMedia,
                    pageId: pageId,
                    farmId: farmId
                }
            }

            let res: any = isEdit ? await editFarmMedia(editFinalData) : await addFarmMedia(finalData);

            if (res?.data) {
                if (presignedTestimonialImagePath !== '' && testimonialImageFile) {
                    const uploadOptions = { method: 'Put', body: testimonialImageFile.fileUpload };
                    const imageresult = await fetch(presignedTestimonialImagePath, uploadOptions);

                    let count = 1;
                    const interval = setInterval(async () => {
                        if (count >= 1) {
                            let data: any = await mediaUploadSuccess([testimonialImageFile?.fileuuid]);
                            if (data.error.data != 'SUCCESS') {
                                count++;
                                if (count === 10) {
                                    clearInterval(interval);
                                }
                            } else {
                                // refetchTestimonial();
                                const urlWithoutQueryParams = presignedTestimonialImagePath.split('?')[0];
                                setMediaImage(urlWithoutQueryParams);
                                refetchFarmMedia();
                                count = 0;
                                setUploadInProgress(false);
                            }
                        }
                    }, 3000);

                } else {
                    refetchFarmMedia();
                }
                setApiStatusMsg({ 'status': 201, 'message': isEdit ? '<b>Farm Media data updated successfully!</b>' : '<b>Farm Media data created successfully!</b>' });
                setApiStatus(true);
                setFarmMediaFileImages([]);
                setDeletedTestimonialsImages([]);
                isEdit ? handleCloseModal() : handleDrawerCloseRow();
                reset();
            }
        } catch (error) {
        }
    };

    return (
        <Drawer
            sx={{
                width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open || openAddEditForm ? drawerWidth : 0,
                    height: '100vh',
                    // overflow: 'scroll',
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
            className='filter-section DrawerRightModal RaceEditModal CarouseleditEditModal'
        >
            <Scrollbar
                className='DrawerModalScroll'
                sx={{
                    width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: open || openAddEditForm ? drawerWidth : 0,
                        height: "100vh",
                        background: "#E2E7E1",
                    },
                }}
            >
                <CssBaseline />
                <DrawerHeader className='DrawerHeader'>
                    <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}>
                        <i style={{ color: '#161716' }} className="icon-Cross" />
                    </IconButton>
                </DrawerHeader>
                {(openAddEditForm) &&
                    <Box px={6} className="edit-section" sx={{ paddingTop: '0px !important' }}>
                        {/* Farm media form  */}
                        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                            <Box px={0}>
                                <Grid container spacing={3} mt={0} pt={0} className='HomeListModalBox'>

                                    <Grid item xs={12} md={12} mt={0} className='homelistgroup' sx={{ paddingTop: '0px !important' }}>
                                        <Box className='bg-image-uploader'>
                                            <Box className='draganddrop-wrapper'>
                                                {/* Farm media image dropzone  */}
                                                <CustomDropzone data={heroImages} />
                                            </Box>
                                            <Typography variant="subtitle2" textAlign='left'>60px x 60px 144dpi</Typography>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={12} mt={2} className='homelistgroup'>
                                        <Box className='FormGroup'>
                                            <Box className='edit-field'>
                                                <RHFTextField name="title" placeholder='Title' className='input-item' />
                                            </Box>
                                        </Box>
                                    </Grid>

                                    {/* <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>
                    <RHFTextField name="company" placeholder='Company' className='input-item'/>
                  </Box>
                </Box>                
            </Grid>             */}

                                    <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                                        <Box className='FormGroup'>
                                            <Box className='edit-field rhf-editor-wrapper'>
                                                {/* <RHFEditor className='rhf-editor-block' name='description' />           */}
                                                <RHFTextField name="description" placeholder='Description' className='input-item' multiline maxRows={15} />
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>
                                        <Stack sx={{ mt: 1 }} className='DrawerBtnWrapper'>
                                            <Grid container spacing={1} className='DrawerBtnBottom'>
                                                <Grid item xs={12} md={12} sx={{ paddingTop: '10px !important' }}>
                                                    <LoadingButton fullWidth className='search-btn' type="submit" variant="contained" loading={isSubmitting}>
                                                        {!isEdit ? 'Save' : 'Update'}
                                                    </LoadingButton>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Box>
                        </FormProvider>
                        {/* End Farm media form  */}
                    </Box>
                }
            </Scrollbar>
        </Drawer>
    );
}

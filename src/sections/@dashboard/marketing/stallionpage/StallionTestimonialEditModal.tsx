import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
    FormProvider,
    RHFTextField,
  } from 'src/components/hook-form';
  import * as Yup from 'yup';
  // redux
import { useDispatch } from 'react-redux';
import { useStallionTestimonialQuery, useAddStallionTestimonialMutation, useEditStallionTestimonialMutation, useUploadStallionTestimonialImageMutation, useFarmGalleryImagesUploadStatusMutation } from 'src/redux/splitEndpoints/marketingSplit';
import { useSnackbar } from 'notistack';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
} from '@mui/material';
import { HeroImages } from 'src/@types/marketing';
import CustomDropzone from 'src/components/CustomDropzone';
import { v4 as uuid } from 'uuid';
////////////////////////////////////
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

export default function StallionTestimonialEditModal(props: any) {  
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    pageId,
    stallionId,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, refetchStallionTestimonial, editedStallionTestimonial, setEditedStallionTestimonial, testimonialImage, setTestimonialImage, isTestimonialFetching
  } = props;
  
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };
  
  const [addStallionTestimonial] = useAddStallionTestimonialMutation();
  const [editStallionTestimoniall] = useEditStallionTestimonialMutation();
  const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();
  // const { data: stallionTestimonialData, isFetching, isLoading, isSuccess, refetch } = useStallionTestimonialQuery({pageId: pageId, stallionId: stallionId, testimonialId: rowId}, { skip: (!isEdit) }); //, refetchOnMountOrArgChange: true  
  // const currentStallionTestimonial = (isSuccess) ? stallionTestimonialData : {};
  
  const currentStallionTestimonial = editedStallionTestimonial;

  const NewTestimonialSchema = Yup.object().shape({
    title: Yup.string().required('Full Name is required'),
    description: Yup.string().required('Testimonial is required'),
    company: Yup.string().required(' Company is required')
  });

  const defaultValues = React.useMemo(
    () => ({
      title: currentStallionTestimonial?.title || '',
      description: currentStallionTestimonial?.description || '',
      company: currentStallionTestimonial?.company || '',
      isDeleted: false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStallionTestimonial]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewTestimonialSchema),
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

  const values = watch();

  React.useEffect(() => {
    if (isEdit && currentStallionTestimonial) {
      reset(defaultValues);
    }
    // if (!isEdit) {
    //   reset(defaultValues);
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentStallionTestimonial]);

  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = (isEdit) ? testimonialImage : null;
  
  const heroImages = {
    setFileUpload,
    fileDetails
  };

  const fileuuid: any = uuid();
  const [setStallionTestimonialImages] = useUploadStallionTestimonialImageMutation();
  const galleryResolution = { height: 1280, width: 1920 };
  const [reportOverviewImageFile, setReportOverviewImageFile] = useState<any>();
  const [presignedTestimonialImagePath, setPresignedTestimonialImagePath] = useState<any>();
  const [testimonialImageFile, setTestimonialImageFile] = useState<any>();
  const [testimonialImageUploadFileData, setTestimonialImageUploadFileData] = useState<any>({});
  const [deleteMediaFile, setDeleteMediaFile] = useState<any>(null);
  const [uploadInProgress, setUploadInProgress] = useState<any>(false);
  useEffect(() => {
    if (fileUpload && !fileUpload.isDeleted) {
      try {
        setStallionTestimonialImages({
          pageId: pageId,
          stallionId: stallionId,
          fileName: fileUpload.path,
          fileuuid: fileuuid,
          fileSize: fileUpload.size,
        }).then(async (res: any) => {
          const details = { fileUpload, fileuuid };
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
        setDeleteMediaFile({isDeleted: true, mediauuid: currentStallionTestimonial?.media[0]?.mediauuid});
        setTestimonialImage(null);
      } catch (error) {
          console.error(error);
      }
  }
  }, [fileUpload]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      let finalData;
      if(!testimonialImageFile?.fileuuid && !deleteMediaFile?.isDeleted) {
        finalData = { ...data, 
          testimonialMedia: null,
            pageId: pageId,
            stallionId: stallionId
          }
        ;
      } else {
        finalData = { ...data, 
          testimonialMedia: 
            (testimonialImageFile?.fileuuid) ?
            {
              isDeleted: false,
              mediauuid: testimonialImageFile?.fileuuid
            }
            : (deleteMediaFile.isDeleted) ? deleteMediaFile : null,
            pageId: pageId,
            stallionId: stallionId
          }
        ;
      }
      
      let res: any = isEdit ? await editStallionTestimoniall({ ...finalData, testimonialId: rowId }) : await addStallionTestimonial(finalData);
      if (res?.data) {
        if (presignedTestimonialImagePath !== '' && testimonialImageFile) {
          const uploadOptions = { method: 'Put', body: testimonialImageFile.fileUpload };
          const imageresult = await fetch(presignedTestimonialImagePath, uploadOptions);
          // mediaUploadSuccess([fileuuid]);
        } 

        if (presignedTestimonialImagePath !== '' && testimonialImageFile?.fileuuid) {
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
                setTestimonialImage(urlWithoutQueryParams);
                refetchStallionTestimonial();                
                count = 0;
                setUploadInProgress(false);
              }
            }
          }, 3000);
        } else {
          // refetchTestimonial();
          refetchStallionTestimonial();
        }        
        setApiStatusMsg({'status': 201, 'message': isEdit ? '<b>Stallion testimonial data updated successfully!</b>' : '<b>Stallion testimonial data created successfully!</b>'});  
        setApiStatus(true);
        isEdit ? handleCloseEditState() : handleDrawerCloseRow();
        reset();
      }
      // enqueueSnackbar(isEdit ? 'Update success!' : 'Create success!');
    } catch (error) {
      console.error(error);
    }
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss : any =  {
      PaperProps: {
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            marginRight: '0px',
            marginTop: '0px',
            width:'228px',
            borderRadius:'6px 6px 6px 6px',
            boxSizing: 'border-box',
          },
        },  
  }  
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
          width: (isEdit && open ) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: "100vh",
            // overflow: "scroll",
            background: "#E2E7E1",
          },
        }}
      >
        <CssBaseline />
        <DrawerHeader className='DrawerHeader'>            
          <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}>
            <i style={{color: '#161716'}} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>
        {(openAddEditForm) &&
        <Box px={6} className="edit-section" sx={{paddingTop:'0px !important'}}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box px={0}>
            <Grid container spacing={3} mt={0} pt={0} className='HomeListModalBox'>

            <Grid item xs={12} md={12} mt={0} className='homelistgroup' sx={{paddingTop:'0px !important'}}>
                <Box className='bg-image-uploader'>                    
                    <Box className='draganddrop-wrapper'>
                        {(isEdit && !isTestimonialFetching) && <CustomDropzone data={heroImages} size={{h:250,w:250}}/>}
                        {!isEdit && <CustomDropzone data={heroImages} size={{h:250,w:250}}/>}
                    </Box>
                    <Typography variant="subtitle2" textAlign='left'>60px x 60px 144dpi</Typography>
                </Box>
            </Grid>

            <Grid item xs={12} md={12} mt={2} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>
                    <RHFTextField name="title" placeholder='Full Name' className='input-item'/>
                  </Box>
                </Box>                
            </Grid>            
            
            <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field rhf-editor-wrapper'>                    
                    <RHFTextField name="description" placeholder='Description' className='input-item' multiline maxRows={15}/>
                  </Box>
                </Box>
            </Grid>  

            <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>                    
                    <RHFTextField name="company" placeholder='Company' className='input-item'/>
                  </Box>
                </Box>
            </Grid>  



            <Grid item xs={12} md={12} mt={0} sx={{paddingTop:'0px !important'}}>
                <Stack sx={{ mt: 1 }} className='DrawerBtnWrapper'>
                 <Grid container spacing={1} className='DrawerBtnBottom'>
                  <Grid item xs={12} md={12} sx={{paddingTop:'10px !important'}}>
                  <LoadingButton fullWidth className='search-btn'  type="submit" variant="contained" loading={isSubmitting}>
                    {!isEdit ? 'Save' : 'Save'}
                </LoadingButton>
                  </Grid>
                 </Grid>
                </Stack>            
            </Grid>
        </Grid>
        </Box>
        </FormProvider>
        </Box>
      }
      </Scrollbar>
    </Drawer>
  );
}

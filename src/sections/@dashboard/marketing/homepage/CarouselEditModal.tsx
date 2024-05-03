import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
    FormProvider,
    RHFSwitch,
    RHFTextField,
    RHFEditor,
    RHFRadioGroup
  } from 'src/components/hook-form';
  import * as Yup from 'yup';
import { 
  useHomeCarasoulQuery, 
  useUploadImageMutation, 
  useAddHomePageCarasoulMutation, 
  useEditHomePageCarasoulMutation, 
  useFarmGalleryImagesUploadStatusMutation,
  useDeleteCarouselImageByUuidMutation
 } from 'src/redux/splitEndpoints/marketingSplit';
import 'src/sections/@dashboard/css/list.css';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  Drawer,
  Button,
  CssBaseline
} from '@mui/material';
import CustomDropzone from 'src/components/CustomDropzone';
import { v4 as uuid } from 'uuid';
import { Stallion } from 'src/@types/stallion';
import Scrollbar from 'src/components/Scrollbar';

// Modal width style
const drawerWidth = 360;
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

type FormValuesProps = Stallion;

export default function CarouselEditModal(props: any) {  
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    sectionUuid,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg
  } = props;
  
  const [loading, setLoading] = React.useState<boolean>(false);

  // Modal close
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  // Modal close for edit
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };  
  
  // Post carousel api call
  const [addCarasoul] = useAddHomePageCarasoulMutation();

  // Patch carousel api call
  const [editCarasoul] = useEditHomePageCarasoulMutation();

  // Delete carousel api call
  const [deleteCarasoul] = useDeleteCarouselImageByUuidMutation();

  // Media upload status api call
  const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();

  // Carousel by id api call
  const { data: currentFarm, error, isFetching, isLoading, isSuccess } = useHomeCarasoulQuery(rowId, { skip: (!isEdit) }); 

  const websiteValidationSchema = Yup.string().test('is-valid-url', 'Invalid Button URL', (value) => {
    if (!value || value.trim() === '') {
      // Allow blank value
      return true;
    }      
    // Regular expression to match a valid URL
    const urlPattern = /^((http|https):\/\/)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/)?.([\w\?[a-zA-Z-_%\/@?]+)*([^\/\w\?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/;
  
    return urlPattern.test(value);
  });

  // Yup validation
  const NewFarmSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    buttonText: Yup.string().required('Button text is required'),
    buttonUrl: websiteValidationSchema,
    orientation: Yup.string().required('Orientation is required'),
  });

  // Set the default value
  const defaultValues = React.useMemo(
    () => ({
      title: currentFarm?.title || '',
      description: currentFarm?.description || '',
      buttonText: currentFarm?.buttonText || '',
      buttonUrl: currentFarm?.buttonUrl || '',
      orientation: currentFarm?.orientation || '',
      isActive: currentFarm?.isActive || false,
      id: currentFarm?.id || '',   
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm]
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

  const values = watch();
  const [isActiveChecked, setIsActiveChecked] = useState(false);
  React.useEffect(() => {
    if (isEdit && currentFarm) {
      setIsActiveChecked(currentFarm?.isActive);
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentFarm]);

  const fileuuid: any = uuid();
  const [setTestimonialProfileImages] = useUploadImageMutation();
  const [presignedProfilePath, setPresignedProfilePath] = useState<any>();
  const [profileImageFile, setProfileImageFile] = useState<any>();
  const [profileImageUploadFileData, setProfileImageUploadFileData] = useState<any>({});

  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = currentFarm?.imageUrl ? currentFarm?.imageUrl : null;;
  const heroImages = {
    setFileUpload,
    fileDetails
  };

  // Check if image is uploaded or deleted
  useEffect(() => {
    if (fileUpload && !fileUpload.isDeleted) {
      try {
        setTestimonialProfileImages({   
          marketingPageSectionUuid: sectionUuid,       
          fileName: fileUpload.path,
          fileuuid: fileuuid,
          fileSize: fileUpload.size,
        }).then(async (res: any) => {
          const details = { fileUpload, fileuuid };
          
          setProfileImageFile(details);
          setPresignedProfilePath(res.data.url);
          setProfileImageUploadFileData(
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
          deleteCarasoul(currentFarm?.id);
      } catch (error) {
          console.error(error);
      }
    }
  }, [fileUpload]);
  
  // Post or Patch carousel api 
  const onSubmit = async (data: FormValuesProps) => {    
    try {
      setLoading(true);
      const finalData = { 
        ...data, 
        fileuuid: profileImageFile?.fileuuid ? profileImageFile?.fileuuid : null,
        marketingPageSectionId: sectionUuid
      };       
      isEdit ? await editCarasoul({ ...finalData, id: rowId}) : await addCarasoul({...finalData});
      if (profileImageFile) {
          const uploadOptions = { method: 'Put', body: profileImageFile.fileUpload };
          const result = await fetch(presignedProfilePath, uploadOptions);
          mediaUploadSuccess([profileImageFile?.fileuuid]);
      }
      setApiStatusMsg({'status': 201, 'message': isEdit ? '<b>Carousel data updated successfully!</b>' : '<b>Carousel data created successfully!</b>'});  
      setApiStatus(true);
      isEdit ? handleCloseEditState() : handleDrawerCloseRow();
      reset();
    } catch (error) {
      setLoading(false);
      reset();
    } finally {
      setLoading(false);
      reset();
    }
  };

  const Orientation_Options = ['Left', 'Right'];
  const Orientation_Options_Value = ["left", "right"];
  
  return (
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
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
        { (isSuccess || (isEdit === undefined)) && 
        <Box px={6} className="edit-section" sx={{paddingTop:'0px !important'}}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box px={0}>
            <Grid container spacing={3} mt={0} pt={0} className='HomeListModalBox'>

            <Grid item xs={12} md={12} mt={0} className='homelistgroup' sx={{paddingTop:'0px !important'}}>
                <Box className='bg-image-uploader'>
                    <CustomDropzone data={heroImages} />  
                    <Typography variant="subtitle2" textAlign='center'>440px x 440px 144dpi</Typography>
                </Box>
            </Grid>

            <Grid item xs={12} md={12} mt={2} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>
                     <RHFTextField name="title" placeholder='Title' className='input-item hp-form-input' />
                  </Box>
                </Box>
            </Grid>
            <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field add-carousel'>    
                    <RHFEditor className='rhf-editor-block hp-form-input' name='description' /> 
                  </Box>
                </Box>
            </Grid>
            
            <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>
                    <RHFTextField name="buttonText" placeholder='Button Text' className='input-item hp-form-input'/>
                  </Box>
                </Box>
            </Grid> 

            <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>
                     <RHFTextField name="buttonUrl" placeholder='Button URL' className='input-item hp-form-input'/>
                  </Box>
                </Box>
            </Grid>

            <Grid item xs={12} md={12} mt={2} className='homelistgroup'>
              <Box className='FormGroup'>
              <Typography variant="h4" sx={{ mb: 0 }}>Orientation </Typography>   
                  <Box className='RadioGroupWrapper' sx={{paddingTop:'10px !important'}}>
                      <RHFRadioGroup sx={{margin:'0px !important'}} className='RadioList gelding-display' name="orientation" options={Orientation_Options_Value} getOptionLabel={Orientation_Options} row={false} />
                  </Box>
              </Box>
            </Grid>
          
            <Grid item xs={7} md={7} mt={1} className='homelistgroup'>
                <Box className='FormGroup'>
                    <RHFSwitch
                    className='RHF-Switches'
                    name="isActive"
                    labelPlacement="start"  
                    checked={isActiveChecked}
                    onClick={()=>setIsActiveChecked(!isActiveChecked)}                   
                    label={
                        <>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Active
                        </Typography>
                        </>
                    }
                    sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                    />
                </Box>
            </Grid>

            <Grid item xs={12} md={12} mt={0} sx={{paddingTop:'0px !important'}}>
                <Stack sx={{ mt: 3 }} className='DrawerBtnWrapper'>
                 <Grid container spacing={1} className='DrawerBtnBottom'>
                  <Grid item xs={12} md={12} sx={{paddingTop:'10px !important'}}>
                  <LoadingButton 
                    fullWidth 
                    className='search-btn'  
                    type="submit" 
                    variant="contained" 
                    loading={loading}
                    >
                    Save
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

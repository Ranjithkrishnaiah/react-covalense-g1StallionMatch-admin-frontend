import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
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
  // redux
import { useDispatch } from 'react-redux';
import { 
  useHomeCarasoulQuery, 
  useUploadImageMutation, 
  useAddHomePageCarasoulMutation, 
  useEditHomePageCarasoulMutation, 
  useFarmGalleryImagesUploadStatusMutation,
  useDeleteCarouselImageByUuidMutation
 } from 'src/redux/splitEndpoints/marketingSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Switch,
  Typography,
  CssBaseline,
  Drawer,
} from '@mui/material';
import { HeroImages } from 'src/@types/marketing';
import CustomDropzone from 'src/components/CustomDropzone';
import { v4 as uuid } from 'uuid';
// ----------------------------------------------------------------------

// Style for drawer header
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

type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

export default function StallionMatchCarouselEditModal(props: any) {  
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
  
  // Handle the edit modal
  const handleDrawerClose = () => {
    handleEditPopup();
  };

   // Reset And Close handler
   const handleResetAndClose = () => {
    reset(defaultValues);
    handleDrawerCloseRow();
  };

  // Close the modal
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };
  
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  
  // Api call for image upload status  
  const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation(); 
  
  // Post api call
  const [addCarasoul] = useAddHomePageCarasoulMutation();

  // Patch api call
  const [editCarasoul] = useEditHomePageCarasoulMutation();

  // Delete api call
  const [deleteCarasoul] = useDeleteCarouselImageByUuidMutation();

  // Get carousel by id api call
  const { data: farmData, error, isFetching, isLoading, isSuccess } = useHomeCarasoulQuery(rowId, { skip: (!isEdit) }); 
  const currentFarm = farmData;
  
  const websiteValidationSchema = Yup.string().test('is-valid-url', 'Invalid Button URL', (value) => {
    if (!value || value.trim() === '') {
      // Allow blank value
      return true;
    }
      
    // Regular expression to match a valid URL
    const urlPattern = /^((http|https):\/\/)?(www.)?(?!.*(http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+(\/)?.([\w\?[a-zA-Z-_%\/@?]+)*([^\/\w\?[a-zA-Z0-9_-]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/;
  
    return urlPattern.test(value);
  });

  // Validation
  const NewFarmSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    buttonText: Yup.string().required('Button text is required'),
    buttonUrl: websiteValidationSchema,
    orientation: Yup.string().required('Orientation is required'),
  });

  // Store the default values
  const defaultValues = React.useMemo(
    () => ({
      title: currentFarm?.title || '',
      description: currentFarm?.description || '',
      buttonText: currentFarm?.buttonText || '',
      buttonUrl: currentFarm?.buttonUrl || '',
      orientation: currentFarm?.orientation || '',
      isActive: currentFarm?.isActive || false,
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

  React.useEffect(() => {
    if (isEdit && currentFarm) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentFarm]);

  const fileuuid: any = uuid();
  const [setCarouselProfileImages] = useUploadImageMutation();
  const [presignedProfilePath, setPresignedProfilePath] = useState<any>();
  const [profileImageFile, setProfileImageFile] = useState<any>();
  const [profileImageUploadFileData, setProfileImageUploadFileData] = useState<any>({});

  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = currentFarm?.imageUrl ? currentFarm?.imageUrl : null;;
  const heroImages = {
    setFileUpload,
    fileDetails
  };

  // Check if any is image is uploaded or deleted
  useEffect(() => {
    if (fileUpload && !fileUpload.isDeleted) {
      try {
        setCarouselProfileImages({   
          marketingPageSectionUuid: sectionUuid,       
          fileName: fileUpload.path,
          fileuuid: fileuuid,
          fileSize: fileUpload.size,
        }).then(async (res: any) => {
          const details = { fileUpload, fileuuid };
          setProfileImageFile(details);
          setPresignedProfilePath(res?.data?.url);
          setProfileImageUploadFileData(
            {
              fileName: res?.data?.url,
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

  // Save functionality
  const onSubmit = async (data: FormValuesProps) => {
    try {
      const finalData = { 
        ...data, 
        fileuuid: profileImageFile?.fileuuid ? profileImageFile?.fileuuid : null,
        marketingPageSectionId: sectionUuid
      };
      isEdit ? await editCarasoul({ ...finalData, id: rowId }) : await addCarasoul({...finalData, marketingPageSectionId: sectionUuid});
      if (profileImageFile) {
        const uploadOptions = { method: 'Put', body: profileImageFile.fileUpload };
        const result = await fetch(presignedProfilePath, uploadOptions);
        mediaUploadSuccess([profileImageFile?.fileuuid]);
    }
      setApiStatusMsg({'status': 201, 'message': isEdit ? '<b>Carousel data updated successfully!</b>' : '<b>Carousel data created successfully!</b>'});  
      setApiStatus(true);
      isEdit ? handleCloseEditState() : handleResetAndClose();
      reset();
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
  const [localBoostMessage, setLocalBoostMessage] = useState<any>();
  const save = (data: any) => {
    // console.log(data);
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
          <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : handleResetAndClose}>
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
                    <Box className='draganddrop-wrapper'>
                        
                        <CustomDropzone data={heroImages} />
                    </Box>
                    <Typography variant="subtitle2" textAlign='center'>440px x 440px 144dpigg</Typography>
                </Box>
            </Grid>
            
            <Grid item xs={12} md={12} mt={2} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>
                     <RHFTextField name="title" placeholder='Title' className='input-item' multiline />
                  </Box>
                </Box>                
            </Grid>
            
            <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field rhf-editor-wrapper'>                    
                    <RHFEditor className='rhf-editor-block' name='description' />          
                  </Box>
                </Box>
            </Grid>
            
            <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>
                     <RHFTextField name="buttonText" placeholder='Button Text' className='input-item'/>
                  </Box>
                </Box>
            </Grid>
            <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                <Box className='FormGroup'>
                   <Box className='edit-field'>
                     <RHFTextField name="buttonUrl" placeholder='Button URL' className='input-item'/>
                  </Box>
                </Box>
            </Grid>
            <Grid item xs={12} md={12} mt={1} className='homelistgroup'>
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

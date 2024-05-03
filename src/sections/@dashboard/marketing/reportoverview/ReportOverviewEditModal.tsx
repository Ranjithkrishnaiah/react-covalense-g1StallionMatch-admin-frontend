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
  RHFSwitch,
  RHFTextField,
  RHFEditor
} from 'src/components/hook-form';
import { Stallion } from 'src/@types/stallion';
import * as Yup from 'yup';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from '../../../../constants/MenuProps';
// redux
import { useDispatch } from 'react-redux';
import {
  useReportOverviewPageQuery,
  useEditReportOverviewMutation,
  useAddReportOverviewMutation,
  useUploadImageMutation,
  useUploadPdfMutation,
  useFarmGalleryImagesUploadStatusMutation,
  useDeleteReportOverviewImageByUuidMutation
} from 'src/redux/splitEndpoints/marketingSplit'
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
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { v4 as uuid } from 'uuid';
import CustomDropzone from 'src/components/CustomDropzone';
import CustomDropzonePdf from 'src/components/CustomDropzonePdf';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { useProductListQuery } from 'src/redux/splitEndpoints/productSplit';
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

type FormValuesProps = Stallion;

type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

export default function ReportOverviewEditModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    ReportOverviewSectionUuid,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg
  } = props;
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<boolean>(false);


  const handleDrawerClose = () => {
    handleEditPopup();
  };

  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  // Post report overview api call
  const [addReport] = useAddReportOverviewMutation();

  // Patch report overview api call
  const [editReport] = useEditReportOverviewMutation();

  // Delete report overview image api call
  const [deleteReport] = useDeleteReportOverviewImageByUuidMutation();

  // Patch report overview image status api call
  const [mediaUploadSuccess, mediaUploadSuccessResponse] = useFarmGalleryImagesUploadStatusMutation();

  // Get report overview by id api call
  const { data: currentFarm, error, isFetching, isLoading, isSuccess } = useReportOverviewPageQuery(rowId, { skip: (!isEdit) });

  // Validation
  const NewFarmSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    buttonText: Yup.string().required('Button Text is required'),
    // productCode: Yup.string(),
  });

  // Set default value for form element
  const defaultValues = React.useMemo(
    () => ({
      title: currentFarm?.title || '',
      description: currentFarm?.description || '',
      buttonText: currentFarm?.buttonText || '',
      isActive: currentFarm?.isActive || false,
      id: currentFarm?.id || '',
      productCode: currentFarm?.productCode || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm]
  );

  const methods: any = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
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

  // Post report overview image api call
  const [setReportImages] = useUploadImageMutation();

  const [fileUpload, setFileUpload] = useState<any>();
  const galleryResolution = { height: 1280, width: 1920 };
  const [reportOverviewImageFile, setReportOverviewImageFile] = useState<any>();
  const fileDetails = currentFarm?.imageUrl ? currentFarm?.imageUrl : null;
  const [presignedImagePath, setPresignedImagePath] = useState<any>();
  const [reportImageFile, setReportImageFile] = useState<any>();
  const [reportImageUploadFileData, setReportImageUploadFileData] = useState<any>({});
  const profileImages = {
    setFileUpload,
    fileDetails,
  };

  // Check if any image is uploaded or deleted from the modal
  useEffect(() => {
    if (fileUpload && !fileUpload.isDeleted) {
      try {
        setReportImages({
          marketingPageSectionUuid: ReportOverviewSectionUuid,
          fileName: fileUpload.path,
          fileuuid: fileuuid,
          fileSize: fileUpload.size,
        }).then(async (res: any) => {
          const details = { fileUpload, fileuuid };
          setReportImageFile(details);
          setPresignedImagePath(res.data.url);
          setReportImageUploadFileData(
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
        deleteReport({ reportOverviewlId: currentFarm?.id, fileType: 'image' });
      } catch (error) {
        console.error(error);
      }
    }
  }, [fileUpload]);

  const pdfuuid: any = uuid();
  const [pdfUpload, setPdfUpload] = useState<any>();

  // Post report overview pdf upload api call
  const [setReportPdf] = useUploadPdfMutation();
  const pdfDetails = currentFarm?.pdfUrl ? currentFarm?.pdfUrl : null;
  const pdfLinkIconClass = (pdfDetails !== null) ? 'attachButtonReportoverview' : 'attachButtonReportoverview disabled-icon';
  const [presignedPdfPath, setPresignedPdfPath] = useState<any>();
  const [reportPdfFile, setReportPdfFile] = useState<any>();
  const [reportPdfUploadFileData, setReportPdfUploadFileData] = useState<any>({});

  const heroPdf = {
    setPdfUpload,
    pdfDetails
  };

  // Check if any pdf is uploaded or deleted 
  useEffect(() => {
    if (pdfUpload && !pdfUpload.isDeleted) {
      try {
        setReportPdf({
          marketingPageSectionUuid: ReportOverviewSectionUuid,
          fileName: pdfUpload.path,
          fileuuid: pdfuuid,
          fileSize: pdfUpload.size,

        }).then(async (res: any) => {
          const details = { pdfUpload, pdfuuid };
          setReportPdfFile(details);
          setPresignedPdfPath(res.data.url);
          setReportPdfUploadFileData(
            {
              fileName: res.data.url,
              fileuuid: pdfuuid,
              fileSize: fileUpload.size
            }
          );
        });
      } catch (error) {
        console.error(error);
      }
    }
    if (pdfUpload && pdfUpload.isDeleted) {
      try {
        deleteReport({ reportOverviewlId: currentFarm?.id, fileType: 'pdf' });
      } catch (error) {
        console.error(error);
      }
    }
  }, [pdfUpload]);

  // Post or patch report overview on save
  const onSubmit = async (data: FormValuesProps) => {
    try {
      setLoading(true);
      let response: any = isEdit ? await editReport({ ...data, fileuuid: reportImageFile?.fileuuid ? reportImageFile?.fileuuid : null, pdfuuid: reportPdfFile?.pdfuuid ? reportPdfFile?.pdfuuid : null }) : await addReport({ ...data, marketingPageSectionId: ReportOverviewSectionUuid, fileuuid: reportImageFile?.fileuuid ? reportImageFile?.fileuuid : null, pdfuuid: reportPdfFile?.pdfuuid ? reportPdfFile?.pdfuuid : null });
      if (!response?.error) {
        if (reportImageFile) {
          const uploadOptions = { method: 'Put', body: reportImageFile.fileUpload };
          const imageresult = await fetch(presignedImagePath, uploadOptions);
          mediaUploadSuccess([reportImageFile?.fileuuid]);
        }
        if (reportPdfFile) {
          const uploadPdfOptions = { method: 'Put', body: reportPdfFile.pdfUpload };
          const pdfresult = await fetch(presignedPdfPath, uploadPdfOptions);
          mediaUploadSuccess([reportPdfFile?.pdfuuid]);
        }
      }
      setApiStatusMsg({ 'status': 201, 'message': isEdit ? '<b>Report overview data updated successfully!</b>' : '<b>Report overview data created successfully!</b>' });
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
  }
  console.log(getValues('productCode'),'productCode')
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
      className='filter-section DrawerRightModal RaceEditModal marketingReportEditModal'
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
        {(isSuccess || (isEdit === undefined)) &&
          <Box px={6} className="edit-section" sx={{ paddingTop: '0px !important' }}>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Box px={0}>
                <Grid container spacing={3} mt={0} pt={0} className='HomeListModalBox'>

                  <Grid item xs={12} md={12} mt={0} className='homelistgroup' sx={{ paddingTop: '0px !important' }}>
                    <Box className='bg-image-uploader'>
                      <CustomDropzone data={profileImages} galleryResolution={galleryResolution} size={{ h: 200, w: 200 }} />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={2} className='homelistgroup' sx={{ paddingTop: '0px !important' }}>
                    <Box className='edit-field'>
                      <RHFTextField name="productCode" placeholder='Product Name' value={getValues('productCode')} className='input-item hp-form-input' disabled/>
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
                      <Box className='edit-field'>
                        <RHFEditor className='rhf-editor-block hp-form-input' name='description' />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={12} mt={0} className='homelistgroup'>
                    <Box className='FormGroup'>
                      <Box className='edit-field'>
                        <RHFTextField name="buttonText" placeholder='Button Text' className='input-item hp-form-input' />
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
                        onClick={() => setIsActiveChecked(!isActiveChecked)}
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

                  <Grid item xs={12} md={12} mt={3} className='homelistgroup link-btn-icon-box' sx={{ paddingTop: '0px !important' }}>
                    <Box className='bg-image-uploader'>
                      <CustomDropzonePdf data={heroPdf} />
                    </Box>
                    <Button disableRipple disableElevation disableFocusRipple type='button' className={pdfLinkIconClass}><i className='icon-Link-green'></i></Button>
                  </Grid>


                  <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>
                    <Stack sx={{ mt: 3 }} className='DrawerBtnWrapper'>
                      <Grid container spacing={1} className='DrawerBtnBottom'>
                        <Grid item xs={12} md={12} sx={{ paddingTop: '10px !important' }}>
                          <LoadingButton
                            fullWidth
                            className='search-btn'
                            type="submit"
                            variant="contained"
                            loading={loading}
                          >
                            {!isEdit ? 'Create Report' : 'Save'}
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
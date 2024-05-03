import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import photograph from 'src/assets/Images/Photograph.svg'
import { useNavigate } from 'react-router';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import {
  FormProvider,
  RHFEditor,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';

import { range } from "src/utils/formatYear";
import { fData } from 'src/utils/formatNumber';
import { Stallion } from 'src/@types/stallion';
import * as Yup from 'yup';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useFarmQuery, useAddFarmMutation, useEditFarmMutation } from 'src/redux/splitEndpoints/farmSplit'
import { useFeestatusQuery } from 'src/redux/splitEndpoints/feestatusSplit';
import { useRetiredReasonQuery } from 'src/redux/splitEndpoints/retiredReasonSplit';
import { useSnackbar } from 'notistack';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { CancelRefundWrapperDialog } from 'src/components/reports-modal/CancelRefundWrapper';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Switch,
  Typography,
  FormControlLabel,
  CssBaseline,
  Drawer,
  Link,
  Button,
  SelectChangeEvent,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Avatar,
  TextField,
  InputAdornment,
  Autocomplete,
  MenuList,
  Checkbox
} from '@mui/material';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { DeleteConversationWrapperDialog } from 'src/components/messages-modal/DeleteConversationWrapper';
import CustomDropzone from 'src/components/CustomDropzone';


import { Images } from 'src/assets/images';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { MenuProps } from 'src/constants/MenuProps';
import AutoCompleteTest from 'src/components/hook-form/AutoCompleteTest';
// ----------------------------------------------------------------------


const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  background: '#FFFFFF',
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#C75227' : '#1D472E',
  },
}));
const BorderLinearProgress1 = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  background: '#FFFFFF',
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1D472E' : '#1D472E',
  },
}));

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }: any) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 346,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
  },
}));


////////////////////////////////////
const drawerWidth = 654;

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

export default function ReportQueueModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    dataDetails,
    apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg
  } = props;
  const navigate = useNavigate();

  const handleDrawerClose = () => {
    handleEditPopup();
  };

  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  const theme = useTheme();
  const [addFarm] = useAddFarmMutation();
  const [editFarm] = useEditFarmMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: countriesList } = useCountriesQuery();

  const dispatch = useDispatch();

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [stallionList, setStallionList] = React.useState<any>([]);
  const [selectedStallion, setSelectedStallion] = React.useState<any>("");
  const [inputValue, setInputValue] = React.useState<any>("");

  // useEffect(() => {
  //   setStallionList(defaultlist)
  // }, [])


  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const { data: farmData, error, isFetching, isLoading, isSuccess } = useFarmQuery(rowId, { skip: (!isEdit) });
  const currentFarm = farmData;

  const NewFarmSchema = Yup.object().shape({
    farmName: Yup.string().required('Farm Name is required'),
    countryId: Yup.number().required('country is required'),
    stateId: Yup.number().required('State is required'),
    website: Yup.string().required('Website is required'),
  });

  const defaultValues = React.useMemo(
    () => ({
      farmName: currentFarm?.farmName || '',
      countryId: currentFarm?.countryId || 0,
      stateId: currentFarm?.stateId || 0,
      website: currentFarm?.website || '',
      totalStallions: currentFarm?.totalStallions || 0,
      serviceFeeStatus: currentFarm?.serviceFeeStatus || 0,
      promoted: currentFarm?.promoted || 0,
      users: currentFarm?.users || 0,
      id: currentFarm?.id || '',
      received: currentFarm?.received || 0,
      sent: currentFarm?.sent || 0,
      isPromoted: currentFarm?.isPromoted || false,
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

  const onSubmit = async (data: FormValuesProps) => {
    try {
      const finalData = { ...data, countryId: parseInt(countryID) }
      //console.log('Post Farm Data', finalData, 'country id', countryID);return false;
      isEdit ? await editFarm({ ...finalData, id: rowId }) : await addFarm(finalData);
      reset();
      // enqueueSnackbar(isEdit ? 'Update success!' : 'Create success!');
      setApiStatusMsg({ 'status': 201, 'message': isEdit ? 'Update success!' : 'Create success!' });
      setApiStatus(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = React.useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      // console.log(file);
      if (file) {
        setValue(
          'avatarUrl',
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );

  const [countryID, setCountryID] = React.useState((currentFarm?.countryId > 0) ? currentFarm?.countryId : 0);
  const [isCountrySelected, setIsCountrySelected] = React.useState((currentFarm?.countryId > 0) ? true : false);
  const handlecountryChange = (event: any) => {
    setCountryID(event.target.value);
    setIsCountrySelected(true);
  };
  //console.log('country ID', currentFarm?.countryId, 'state ID', currentFarm?.stateId, 'set country id', countryID, 'is set farm country', isCountrySelected);

  //, { skip: (!isCountrySelected) }
  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: (!isCountrySelected) });


  const [openDeleteConversationWrapper, setOpenDeleteConversationWrapper] = useState(false);

  const handleCloseDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(false);
  };

  const handleOpenDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(true);
  };



  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = null;
  const heroImages = {
    setFileUpload,
    fileDetails
  };


  const [openCancelRefundWrapper, setOpenCancelRefundWrapper] = useState(false);

  const handleCloseCancelRefundWrapper = () => {
    setOpenCancelRefundWrapper(false);
  };

  const handleOpenCancelRefundWrapper = () => {
    setOpenCancelRefundWrapper(true);
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
      className='filter-section DrawerRightModal RaceEditModal reportQueueModal'
    >
      <Scrollbar
        className='DrawerModalScroll'
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
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
        <DrawerHeader className='DrawerHeader' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>

          <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}>
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>

          {/* <Button type='button' className='ShareBtn'><i className='icon-Share'></i></Button> */}
        </DrawerHeader>

        <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box px={0}>

              {/* SM PRO Report - Needs to Approval */}
              <Grid container spacing={3} mt={0} pt={0} className='RaceListModalBox'>

                <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                  <Typography variant="h4">Report Details</Typography>

                  <Box className='FormGroup'>
                    <Stack className='accuracy-rating' my={2}>
                      <Box mb={1} sx={{ display: 'flex' }}>
                        <Typography variant="h6" flexGrow={1} sx={{ display: 'flex', alignItems: 'end' }}>
                          Status:  <b>{dataDetails?.status}</b>
                          <span className='link-green link-disable'><img src={Images.Link} alt='' /></span>
                        </Typography>
                        {/* <HtmlTooltip
                            placement="bottom"
                                className="CommonTooltip"
                                sx={{width:'346px !important'}}
                                title={
                                <Box>
                                    {
                                    'This looks at the pedigree’s completeness and takes into account the horse, sire, dam along with the required data points for each (YoB, CoB, Colour, Sex, etc).'
                                    }{' '}
                                </Box>
                                }
                            >
                                <i className="icon-Info-circle" style={{ fontSize: '16px' }} />
                            </HtmlTooltip> */}
                      </Box>
                      <Box className='ProgressBar-Line'>
                        <Box sx={{ flexGrow: 1 }}>
                          <BorderLinearProgress variant="determinate" value={20} />
                        </Box>
                      </Box>
                    </Stack>

                  </Box>
                </Grid>
                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>

                  <Box className='FormGroup'>
                    <List className='RawDataList'>
                      <ListItem>
                        <ListItemText
                          primary="Order ID:"
                          secondary={dataDetails?.orderId}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Name:"
                          secondary={dataDetails?.clientName}
                        />
                      </ListItem>
                      <ListItem sx={{ marginTop: '16px' }}>
                        <ListItemText
                          primary="Mare Name:"
                          secondary={<Typography style={{ textDecoration: 'underline', textDecorationThickness: '1.5px', textUnderlineOffset: '3px', }}>Time To Leave</Typography>}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="YOB:"
                          secondary="2016"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Sire:"
                          secondary="AUS"
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={0} className='racelistgroup'>

                  <Box className='FormGroup'>
                    <List className='RawDataList'>
                      <ListItem>
                        <ListItemText
                          primary="Report Type:"
                          secondary={dataDetails?.productName}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Email:"
                          secondary={dataDetails?.email}
                        />
                      </ListItem>
                      <ListItem sx={{ marginTop: '16px' }}>
                        <ListItemText
                          primary="Horse ID:"
                          secondary="123456"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="COB:"
                          secondary="2016"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Dam:"
                          secondary="AUS"
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>

                <Grid item xs={11} md={11} mt={0} className='racelistgroup'>

                  <Box className='FormGroup'>
                    <Stack className='accuracy-rating' my={2} mt={0}>
                      <Box mb={1} sx={{ display: 'flex' }}>
                        <Typography variant="h6" flexGrow={1}>
                          Accuracy Rating:   <b>Good</b>
                        </Typography>
                        <HtmlTooltip
                          placement="bottom"
                          className="CommonTooltip"
                          sx={{ width: '346px !important' }}
                          title={
                            <Box>
                              {
                                'This looks at the pedigree’s completeness and takes into account the horse, sire, dam along with the required data points for each (YoB, CoB, Colour, Sex, etc).'
                              }{' '}
                            </Box>
                          }
                        >
                          <i className="icon-Info-circle" style={{ fontSize: '16px' }} />
                        </HtmlTooltip>
                      </Box>
                      <Box className='ProgressBar-Line'>
                        <Box sx={{ flexGrow: 1 }}>
                          <BorderLinearProgress1 variant="determinate" value={50} />
                        </Box>
                      </Box>
                    </Stack>

                  </Box>
                </Grid>


                <Grid item xs={12} md={12} mt={2} className='racelistgroup'>
                  <Typography variant="h4" className='' mb={.5}>Stallion Location(s)</Typography>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        MenuProps={MenuProps}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        defaultValue="none" name="expiredStallion">
                        <MenuItem className="selectDropDownList" value="none" disabled><em>Selected Regions</em></MenuItem>
                        <MenuItem className="selectDropDownList" value="yes">Nil</MenuItem>
                        <MenuItem className="selectDropDownList" value="no">Nil</MenuItem>
                      </Select>
                    </Box>
                  </Box>
                </Grid>


                <Grid item xs={12} md={12} mt={2} className='racelistgroup'>
                  <Typography variant="h4" className='' mb={.5}>Stud Fee Range</Typography>

                  <Grid container spacing={1}>
                    <Grid item xs={4} md={4}>
                      <Box className='FormGroup'>
                        <Box className='edit-field'>
                          <Select
                            MenuProps={MenuProps}
                            IconComponent={KeyboardArrowDownRoundedIcon}
                            className="filter-slct"
                            defaultValue="none" name="expiredStallion">
                            <MenuItem className="selectDropDownList" value="none" disabled><em>Selected Currency</em></MenuItem>
                            <MenuItem className="selectDropDownList" value="yes">Nil</MenuItem>
                            <MenuItem className="selectDropDownList" value="no">Nil</MenuItem>
                          </Select>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={4} md={4}>
                      <Box className='FormGroup'>
                        <Box className='edit-field'>
                          <Select
                            MenuProps={MenuProps}
                            IconComponent={KeyboardArrowDownRoundedIcon}
                            className="filter-slct"
                            defaultValue="none" name="expiredStallion">
                            <MenuItem className="selectDropDownList" value="none" disabled><em>Min Amount</em></MenuItem>
                            <MenuItem className="selectDropDownList" value="yes">Nil</MenuItem>
                            <MenuItem className="selectDropDownList" value="no">Nil</MenuItem>
                          </Select>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={4} md={4}>
                      <Box className='FormGroup'>
                        <Box className='edit-field'>
                          <Select
                            MenuProps={MenuProps}
                            IconComponent={KeyboardArrowDownRoundedIcon}
                            className="filter-slct"
                            defaultValue="none" name="expiredStallion">
                            <MenuItem className="selectDropDownList" value="none" disabled><em>Max Amount</em></MenuItem>
                            <MenuItem className="selectDropDownList" value="yes">Nil</MenuItem>
                            <MenuItem className="selectDropDownList" value="no">Nil</MenuItem>
                          </Select>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                </Grid>


                <Grid item xs={12} md={12} mt={5} className='racelistgroup'>
                  <Typography variant="h4" className='' mb={.5}>Confirm Stallions Selected (32)</Typography>
                  <Box className='FormGroup'>
                    <Box className="edit-field">
                      <AutoCompleteTest

                        name="horseMultiple"
                        rules=""
                        placeholder="Select Stallions"
                        labelName=""
                        //   options={stallionOption}
                        options=""
                        getOptionLabel={(option: any) => option?.horseName || ''}
                        optionName="horseName" handleStallionInput={undefined}
                      //   handleStallionInput={debouncedChangeHandlerStallion} 

                      />

                    </Box>
                  </Box>
                </Grid>


                <Grid item xs={6} md={6} mt={1} className='racelistgroup'>

                  <Box className='FormGroup'>
                    <List className='RawDataList'>
                      <ListItem>
                        <ListItemText
                          primary="Subtotal:"
                          secondary={`${dataDetails?.currencyCode?.substring(0, 2)}${dataDetails?.currencySymbol}${dataDetails?.subTotal}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Discount:"
                          secondary={`${dataDetails?.currencyCode?.substring(0, 2)}${dataDetails?.currencySymbol}${dataDetails?.discount}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Total:"
                          secondary={`${dataDetails?.currencyCode?.substring(0, 2)}${dataDetails?.currencySymbol}${dataDetails?.total}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Payment Status:"
                          primaryTypographyProps={{
                            minWidth: '120px !important'
                          }}
                          secondary={dataDetails?.paymentStatus}
                          secondaryTypographyProps={{
                            minWidth: '210px !important',
                            whiteSpace: 'nowrap',
                          }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={1} className='racelistgroup'>

                  <Box className='FormGroup'>
                    <List className='RawDataList'>
                      <ListItem>
                        <ListItemText
                          primary="Tax:"
                          secondary="US$64"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Promo Code:"
                          secondary="HAPPYDAYS"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Gateway:"
                          secondary={dataDetails?.paymentMethod}
                        />
                      </ListItem>

                    </List>
                  </Box>
                </Grid>


                <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>


                  <Stack sx={{ mt: 4 }} className='DrawerBtnWrapper'>
                    <Grid container spacing={4} className='DrawerBtnBottom'>
                      <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                        <LoadingButton fullWidth className='search-btn' type="submit" variant="contained" loading={isSubmitting}>
                          {!isEdit ? 'Approve' : 'Approve'}
                        </LoadingButton>

                      </Grid>
                      <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                        <Button fullWidth type='button' className='add-btn' onClick={handleOpenCancelRefundWrapper}>Cancel</Button>
                      </Grid>
                    </Grid>
                  </Stack>

                </Grid>
              </Grid>





            </Box>



          </FormProvider>
        </Box>
        <CancelRefundWrapperDialog title="Are you sure?" open={openCancelRefundWrapper} close={handleCloseCancelRefundWrapper} />
      </Scrollbar>
    </Drawer>
  );
}

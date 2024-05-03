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
  ListItemText
} from '@mui/material';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { ConfirmReportWrapperDialog } from 'src/components/sales-modal/ConfirmReportWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import CustomDropzone from 'src/components/CustomDropzone';


import { Images } from "src/assets/images";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionSplit';
import debounce from 'lodash.debounce';
import AutoCompleteTest from 'src/components/hook-form/AutoCompleteTest';

import DatePicker from 'src/components/DatePicker';
import { MenuProps } from '../../../constants/MenuProps';
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




export default function SalesViewDetailsModalEdit(props: any) {  

  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
  } = props;
  const navigate = useNavigate();  

  const handleDrawerClose = () => {
    handleEditPopup();
  };

  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };
  const [value] = React.useState<Date | null>(null);
  const theme = useTheme();
  const [addFarm] = useAddFarmMutation();
  const [editFarm] = useEditFarmMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: countriesList } = useCountriesQuery();
  
  const dispatch = useDispatch();

  const [expanded, setExpanded] = React.useState<string | false>(false);

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
      enqueueSnackbar(isEdit ? 'Update success!' : 'Create success!');
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


  const [openConfirmReportWrapper, setOpenConfirmReportWrapper] = useState(false);
  
  const handleCloseConfirmReportWrapper = () => {
    setOpenConfirmReportWrapper(false);
  };

  const handleOpenConfirmReportWrapper = () => {
    setOpenConfirmReportWrapper(true);
  };


  
  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = null;
  const heroImages = {
    setFileUpload,
    fileDetails
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
      className='filter-section DrawerRightModal members-rightbar sales-rightbar'
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
        <DrawerHeader className='member-header'>
          
          <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}>
          <i style={{color: '#161716'}} className="icon-Cross" />
          </IconButton>
          <Box>
            <Typography variant="h3" pl={1}>Sales Details</Typography>
          </Box>
        </DrawerHeader>

        <Box px={2} className="edit-section" sx={{paddingTop:'0px !important'}}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box px={1} mt={0}>

            {/* SM PRO Report - Needs to Approval */}
            <Grid container spacing={3} mt={0} pt={0} className='RaceListModalBox'>

                
            <Grid item xs={12} md={12} mt={2} className='racelistgroup'>
                     <RHFTextField name="Salename" placeholder='Sale Name' className='edit-field' />
            </Grid>


            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                    <Box className='edit-field'>
                <Select 
                     MenuProps={{
                      className:'common-scroll-lock',

                      disableScrollLock: true,
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                      },
                      ...MenuProps
                    }}
                     IconComponent = {KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Company</em></MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Nil</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Nil</MenuItem>
                </Select>
                </Box>
            </Grid>


            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                     <RHFTextField name="Code" placeholder='Code' className='edit-field' />
            </Grid>


            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                    <Box className='edit-field'>
                <Select 
                     MenuProps={{
                      className:'common-scroll-lock',

                      disableScrollLock: true,
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                      },
                      ...MenuProps
                    }}
                     IconComponent = {KeyboardArrowDownRoundedIcon}
                    className="filter-slct countryDropdown"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList countryDropdownList" value="none" disabled><em>Country</em></MenuItem>
                    <MenuItem className="selectDropDownList countryDropdownList" value="yes">Nil</MenuItem>
                    <MenuItem className="selectDropDownList countryDropdownList" value="no">Nil</MenuItem>
                </Select>
                </Box>
            </Grid>

            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                    <Box className='edit-field'>
                <Select 
                     MenuProps={{
                      className:'common-scroll-lock',

                      disableScrollLock: true,
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                      },
                      ...MenuProps
                    }}
                     IconComponent = {KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Type</em></MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Nil</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Nil</MenuItem>
                </Select>
                </Box>
            </Grid>

            

            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                <Box className='calender-wrapper'>
                <Box className='edit-field'>
                    <DatePicker placeholder='Select Dates' value={value} handleChange={handleChange} />
                    </Box>
                </Box>
            </Grid>



            <Grid item xs={12} md={12} my={.5} mt={1} className='racelistgroup'>
            <RHFSwitch
                    className='RHF-Switches'
                      name="verifiedAccount"
                      labelPlacement="start"
                      label={
                        <>
                          <Typography variant="h4" sx={{ mb: 0.5 }}>
                          Online Sale
                          </Typography>
                          {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Disabling this will automatically send the user a verification email
                  </Typography> */}
                        </>
                      }
                      sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                    />
                    </Grid>

                    <Grid item xs={12} md={12} mb={2} className='racelistgroup'>
                      <Box className='edit-field' sx={{display:'flex', alignItems:'center' }}>
                        <Typography variant="h4" sx={{display: 'flex', flexDirection: 'row', alignItems:' center'}}>Source Data URL 
                        <i style={{ color:'#007142', fontSize:'22px', marginLeft:'10px', position:'relative', top:'0px' }} className='icon-Link-green' />
                        <Button sx={{ marginLeft:'23px'}} className='bold-link' type='button'>Edit</Button>
                        </Typography>
                      </Box>
                    </Grid>


                    <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                    <Box className='edit-field'>
                <Select 
                     MenuProps={{
                      className:'common-scroll-lock',

                      disableScrollLock: true,
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                      },
                      ...MenuProps
                    }}
                     IconComponent = {KeyboardArrowDownRoundedIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none" disabled><em>Status</em></MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Nil</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Nil</MenuItem>
                </Select>
                </Box>
            </Grid>

            <Grid item xs={12} md={12} mt={.5} className='racelistgroup'>
            <RHFSwitch
                    className='RHF-Switches'
                      name="Public"
                      labelPlacement="start"
                      label={
                        <>
                          <Typography variant="h4" sx={{ mb: 0.5 }}>
                          Public
                          </Typography>
                        </>
                      }
                      sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                    />
              </Grid>


              <Grid item xs={12} md={12} mb={2} className='racelistgroup'>
                      <Box className='edit-field' sx={{display:'flex', alignItems:'center' }}>
                        <Typography variant="h4">View Sales Report <i style={{ color:'#007142', fontSize:'22px', marginLeft:'10px', position:'relative', top:'3px' }} className='icon-Link-green' /></Typography>
                      </Box>

                                <List className='RawDataList' sx={{py:'0'}}>
                                <ListItem>
                                    <ListItemText
                                    secondaryTypographyProps={{
                                        px:'0px !important'
                                    }}
                                        secondary="Created 12.01.2022"
                                    />
                                </ListItem>
                               
                       </List>
                    </Grid>

 
      



            <Grid item xs={12} md={12} mt={0} sx={{paddingTop:'0px !important'}}>            
           

                <Stack sx={{ mt: 0 }} className='DrawerBtnWrapper'>
                 <Grid container spacing={4} className='DrawerBtnBottom'>
                  <Grid item xs={12} md={12} sx={{paddingTop:'10px !important'}}>
                  <LoadingButton fullWidth className='search-btn'  type="submit" variant="contained" loading={isSubmitting}>
                    {!isEdit ? 'Save' : 'Save'}
                </LoadingButton>
                   
                  </Grid>
                  <Grid item xs={12} md={12} sx={{paddingTop:'12px !important'}}>
                   <Button fullWidth type='button' className='add-btn green'>View Lots</Button>
                  </Grid>
                  <Grid item xs={12} md={12} sx={{paddingTop:'12px !important'}}>
                   <Button fullWidth type='button' className='add-btn' onClick={handleOpenConfirmReportWrapper}>Run Report</Button>
                  </Grid>
                 </Grid>
                </Stack>
            
            </Grid>
           </Grid>


          


        </Box>
        </FormProvider>
        </Box>
        <ConfirmReportWrapperDialog  title="" open={openConfirmReportWrapper} close={handleCloseConfirmReportWrapper}/>
      
      </Scrollbar>
    </Drawer>
  );
}

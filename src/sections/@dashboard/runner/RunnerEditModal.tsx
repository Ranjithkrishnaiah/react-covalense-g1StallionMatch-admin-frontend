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

import { RunnerEligibleWrapperDialog } from 'src/components/runner-modal/RunnerEligibleWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import CustomDropzone from 'src/components/CustomDropzone';



import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

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

export default function RunnerEditModal(props: any) {  
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
  const [openMergeFarmAccountsWrapper, setOpenMergeFarmAccountsWrapper] = useState(false);
  
  const handleCloseMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(false);
  };

  const handleOpenMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(true);
  };


  
  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = null;
  const heroImages = {
    setFileUpload,
    fileDetails
  };



  const [openRunnerEligibleWrapper, setOpenRunnerEligibleWrapper] = useState(false);

  const handleCloseRunnerEligibleWrapper = () => {
    setOpenRunnerEligibleWrapper(false);
  };

  const handleOpenRunnerEligibleWrapper = () => {
    setOpenRunnerEligibleWrapper(true);
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
      className='DrawerRightModal RaceEditModal'
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

        <Box px={5} className="edit-section" sx={{paddingTop:'0px !important'}}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box px={0}>
            <Grid container spacing={3} mt={0} pt={0} className='RaceListModalBox'>

            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
             <Typography variant="h4" className='ImportedHeader'>Runner Details</Typography> 

                <Box className='FormGroup'>
                <Stack className='accuracy-rating' my={2}>
                        <Box mb={1} sx={{ display: 'flex' }}>
                            <Typography variant="h6" flexGrow={1}>
                            Pedigree Accuracy Rating: <b>Poor</b>
                            </Typography>
                            <HtmlTooltip
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
                            </HtmlTooltip>
                        </Box>
                        <Box className='ProgressBar-Line'>
                            <Box sx={{ flexGrow: 1 }}>
                            <BorderLinearProgress variant="determinate" value={20} />
                            </Box>
                        </Box>
                     </Stack>
                     <Box mb={1}>
                      <RHFTextField name="text" placeholder='Matched Horse Name' className='edit-field'/>
                     </Box>

                    <Button type='button' className='link-btn'>View Pedigree</Button>
                </Box>
            </Grid> 
            <Grid item xs={6} md={6} mt={0} className='racelistgroup RawDataGroup'>
             <Typography variant="h4" className='ImportedHeader'>RAW Data</Typography> 

                <Box className='FormGroup'>
                    <List className='RawDataList'>
                            <ListItem>
                                <ListItemText
                                    primary="Name:"
                                    secondary="Coolangatta"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Sire:"
                                    secondary="I Am Invincible"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemText
                                    primary="Dam:"
                                    secondary="La Lova"
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
                                    primary="COB:"
                                    secondary="AUS"
                                />
                            </ListItem>
                    </List>
                </Box>
            </Grid>  
       

            <Grid item xs={6} md={6} mt={2} className='racelistgroup number-barrier'>
                <Box className='FormGroup number-barrier-left'>
                    <Box className='edit-field' sx={{margin:'0px !important'}}>
                        <RHFTextField name="Number" placeholder='Number' className='edit-field'/>
                    </Box>
                </Box>
                <Box className='FormGroup number-barrier-right'>
                    <Box className='edit-field' sx={{margin:'0px !important'}}>
                        <RHFTextField name="Barrier" placeholder='Barrier' className='edit-field'/>
                    </Box>
                </Box>
            </Grid>

            <Grid item xs={6} md={6} mt={3} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                        {/* <RHFTextField name="Barrier" placeholder='Barrier' className='edit-field'/> */}
                    </Box>
                </Box>
            </Grid>

            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                   <RHFTextField name="Final Position" placeholder='Final Position' className='edit-field'/>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                   <RHFTextField name="Margin" placeholder='Margin' className='edit-field'/>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                   <RHFTextField name="Weight" placeholder='Weight' className='edit-field'/>
                </Box>
            </Grid>
            
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                <Select 
                    MenuProps={{
                        disableScrollLock: true,
                      }}
                     IconComponent = {KeyboardArrowDownIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none">Weight Unit</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                <Select 
                    MenuProps={{
                        disableScrollLock: true,
                      }}
                     IconComponent = {KeyboardArrowDownIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none">Jockey</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>

            <Grid item xs={6} md={6} mt={0} className='racelistgroup ApprenticeList'>
            <Box className='FormGroup'>
                    <RHFSwitch
                    className='RHF-Switches'
                    name="Apprentice"
                    labelPlacement="start"
                    label={
                        <>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Apprentice
                        </Typography>
                        </>
                    }
                    sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                    />
                </Box>
            </Grid>


            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                <Select 
                    MenuProps={{
                        disableScrollLock: true,
                      }}
                     IconComponent = {KeyboardArrowDownIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none">Trainer</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                <Select 
                    MenuProps={{
                        disableScrollLock: true,
                      }}
                     IconComponent = {KeyboardArrowDownIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none">Currency</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                <Select 
                    MenuProps={{
                        disableScrollLock: true,
                      }}
                     IconComponent = {KeyboardArrowDownIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none">Prizemoney</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>
            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                <Select 
                    MenuProps={{
                        disableScrollLock: true,
                      }}
                     IconComponent = {KeyboardArrowDownIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none">Owner(s)</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                  <RHFTextField name="Starting Price" placeholder='Starting Price' className='edit-field'/>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                <Select 
                    MenuProps={{
                        disableScrollLock: true,
                      }}
                     IconComponent = {KeyboardArrowDownIcon}
                    className="filter-slct"
                     defaultValue="none" name="expiredStallion">
                    <MenuItem className="selectDropDownList" value="none">Source</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>
          
            <Grid item xs={4} md={4} mt={1} className='racelistgroup'>
                <Box className='FormGroup'>
                    <RHFSwitch
                    className='RHF-Switches'
                    name="Scratched"
                    labelPlacement="start"
                    label={
                        <>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Scratched
                        </Typography>
                        </>
                    }
                    sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                    />
                    <RHFSwitch
                    onClick={handleOpenRunnerEligibleWrapper}
                    className='RHF-Switches'
                    name="Eligible"
                    labelPlacement="start"
                    label={
                        <>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Eligible
                        </Typography>
                        </>
                    }
                    sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                    />
                </Box>
            </Grid>
       

            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
             <Grid item xs={6} md={6} mt={0} className='racelistgrouplist'>
                 <Box className='FormGroup'>     
                <Accordion className='accordionDrawer' defaultExpanded={true} onChange={handleChange('panel1')}>
                  <AccordionSummary
                  sx={{paddingRight:'35px !important'}}
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Typography  variant='h4' sx={{  flexShrink: 0 }}>Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack className='FormGroupList'>
                     <Typography component='p'>Runner ID:  <u>22</u></Typography>
                     <Typography component='p'>Total Runs:  <u>22</u></Typography>
                     <Typography component='p'>Total Wins:  <u>3</u></Typography>
                     <Typography component='p'>Total Stakes Wins:  <u>3</u></Typography>
                     <Typography component='p'>Total Prizemoney: <u>346,000</u></Typography>
                     <Typography component='p'>Created:<u>13.02.2022 12:51AM AEST</u></Typography>
                     <Typography component='p'>Created by:  <u>Matthew Ennis</u></Typography>
                     <Typography component='p'>Updated: <u>22.02.2022 4:31PM AEST</u></Typography>
                     <Typography component='p'>Updated by: <u>Matthew Ennis</u></Typography>
                  </Stack>
                          </AccordionDetails>
                </Accordion>
                  </Box>
              </Grid>
            </Grid>

            <Grid item xs={12} md={12} mt={0} sx={{paddingTop:'0px !important'}}>            
           

                <Stack sx={{ mt: 3 }} className='DrawerBtnWrapper'>
                 <Grid container spacing={1} className='DrawerBtnBottom'>
                  <Grid item xs={6} md={6} sx={{paddingTop:'10px !important'}}>
                  <LoadingButton fullWidth className='search-btn'  type="submit" variant="contained" loading={isSubmitting}>
                    {!isEdit ? 'Create Race' : 'Save'}
                </LoadingButton>
                   
                  </Grid>
                  <Grid item xs={6} md={6} sx={{paddingTop:'10px !important'}}>
                   <Button fullWidth type='button' className='add-btn' onClick={handleOpenMergeFarmAccountsWrapper} disabled>Transfer</Button>
                  </Grid>
                 </Grid>
                </Stack>
            
            </Grid>
        </Grid>
        </Box>
        </FormProvider>
        </Box>
        <RunnerEligibleWrapperDialog title="Are you sure?" open={openRunnerEligibleWrapper} close={handleCloseRunnerEligibleWrapper} />
        <MergeFarmAccountsWrapperDialog title="Merge Farm Accounts" open={openMergeFarmAccountsWrapper} close={handleCloseMergeFarmAccountsWrapper} />
      </Scrollbar>
    </Drawer>
  );
}

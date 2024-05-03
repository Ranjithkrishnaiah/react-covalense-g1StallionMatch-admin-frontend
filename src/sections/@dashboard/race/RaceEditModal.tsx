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
  MenuItem
} from '@mui/material';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { RaceEligibleWrapperDialog } from 'src/components/race-modal/RaceEligibleWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import CustomDropzone from 'src/components/CustomDropzone';

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

export default function RaceEditModal(props: any) {  
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



  const [openRaceEligibleWrapper, setOpenRaceEligibleWrapper] = useState(false);

  const handleCloseRaceEligibleWrapper = () => {
    setOpenRaceEligibleWrapper(false);
  };

  const handleOpenRaceEligibleWrapper = () => {
    setOpenRaceEligibleWrapper(true);
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
        <Typography variant="h4" className='ImportedHeader'>Imported <i className="icon-Confirmed-24px"></i></Typography>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box px={0}>
            <Grid container spacing={3} mt={0} pt={0} className='RaceListModalBox'>

            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                     <RHFTextField name="date" placeholder='Date' className='edit-field'/>
                </Box>
            </Grid> 
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                     <RHFTextField name="time" placeholder='Time' className='edit-field'/>
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
                    <MenuItem className="selectDropDownList" value="none">Venue</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                
                </Box>
            </Grid> 
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                {/* <RHFSelect                     
                      name="countryId" 
                      placeholder="Country" 
                      className='edit-field'
                      value={countryID}
                      onChange={handlecountryChange}
                    >
                      <option value=""> Country </option>
                      {
                      countriesList?.map(({id, countryName}) => {
                          return <option value={id} key= {id}>{countryName}</option>
                      })}
                    </RHFSelect>   */}


                    <Box className='edit-field'>
                    <Select 
                       name="country" 
                        IconComponent = {KeyboardArrowDownIcon}
                        defaultValue="none" 
                        className="filter-slct"
                        MenuProps={{
                            disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "right"
                          },
                          ...MenuPropss
                        }}>
                       <MenuItem className="selectDropDownList" value="none">Country</MenuItem>
                      {countriesList?.map(({ id, countryName }) => {
                        return (
                          <MenuItem className="selectDropDownList mem-country" value={id} key={id}>
                            {countryName}
                          </MenuItem>
                        );
                      })}
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
                    <MenuItem className="selectDropDownList" value="none">Track Type</MenuItem>
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
                    <MenuItem className="selectDropDownList selectTrack" value="none">Track Condition</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>


            <Grid item xs={4} md={4} mt={4} className='racelistgroup'>
                <Box className='FormGroup'>
                    <Box className='edit-field'>
                    <Select 
                        MenuProps={{
                            disableScrollLock: true,
                        }}
                        IconComponent = {KeyboardArrowDownIcon}
                        className="filter-slct"
                        defaultValue="none" name="expiredStallion">
                        <MenuItem className="selectDropDownList" value="none">Race #</MenuItem>
                        <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                        <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                    </Select>
                    </Box>
                </Box>
            </Grid>
            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                   <RHFTextField name="Race Name" placeholder='Race Name' className='edit-field'/>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                   <RHFTextField name="Distance" placeholder='Distance' className='edit-field'/>
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
                    <MenuItem className="selectDropDownList" value="none">Distance Unit</MenuItem>
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
                    <MenuItem className="selectDropDownList" value="none">Class</MenuItem>
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
                    <MenuItem className="selectDropDownList" value="none">Stakes</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                  <RHFTextField name="Age Restriction" placeholder='Age Restriction' className='edit-field'/>
                </Box>
            </Grid>
            <Grid item xs={6} md={6} mt={0} className='racelistgroup'>
                <Box className='FormGroup'>
                  <RHFTextField name="Sex Restriction" placeholder='Sex Restriction' className='edit-field'/>
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
                    <RHFTextField name="Prizemoney" placeholder='Prizemoney' className='edit-field'/>
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
                    <MenuItem className="selectDropDownList" value="none">Race Type</MenuItem>
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
                    <MenuItem className="selectDropDownList" value="none">Race Status</MenuItem>
                    <MenuItem className="selectDropDownList" value="yes">Active</MenuItem>
                    <MenuItem className="selectDropDownList" value="no">Inactive</MenuItem>
                </Select>
                </Box>
                </Box>
            </Grid>

            <Grid item xs={5} md={5} mt={1} className='racelistgroup'>
                <Box className='FormGroup'>
                    <RHFSwitch
                    onClick={handleOpenRaceEligibleWrapper}
                    className='RHF-Switches'
                    name="isPromoted"
                    labelPlacement="start"
                    label={
                        <>
                        <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Eligible
                        </Typography>
                        </>
                    }
                    sx={{ mx: 0, width: 1, mt: 1, justifyContent: 'space-between' }}
                    />
                </Box>
            </Grid>

            <Grid item xs={12} md={12} mt={0} className='racelistgroup'>
             <Grid item xs={6} md={6} mt={0} className='racelistgrouplist'>
                 <Box className='FormGroup'>     
                <Accordion className='accordionDrawer' defaultExpanded={true} onChange={handleChange('panel1')}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Typography  variant='h4' sx={{  flexShrink: 0 }}>Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack className='FormGroupList'>
                     <Typography component='p'>Race ID:  <u>22</u></Typography>
                     <Typography component='p'>Total Runners:  <u>22</u></Typography>
                     <Typography component='p'>Created:<u>22.02.2022 4:31PM AEST</u></Typography>
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
                   <Button fullWidth type='button' className='add-btn' onClick={handleOpenMergeFarmAccountsWrapper} disabled>Merge</Button>
                  </Grid>
                 </Grid>
                </Stack>
            
            </Grid>
        </Grid>
        </Box>
        </FormProvider>
        </Box>
        <RaceEligibleWrapperDialog title="Are you sure?" open={openRaceEligibleWrapper} close={handleCloseRaceEligibleWrapper} />
        <MergeFarmAccountsWrapperDialog title="Merge Farm Accounts" open={openMergeFarmAccountsWrapper} close={handleCloseMergeFarmAccountsWrapper} />
      </Scrollbar>
    </Drawer>
  );
}

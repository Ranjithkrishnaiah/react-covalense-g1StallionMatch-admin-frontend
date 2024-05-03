import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import photograph from '../../../../assets/Images/Photograph.svg'

// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Card, Grid, Stack, Link, Switch, FormControlLabel, StyledEngineProvider } from '@mui/material';

import {
    FormProvider,
    RHFSelect,
    RHFSwitch,
    RHFTextField,
    RHFUploadAvatar,
  } from '../../../../components/hook-form';
  import { range } from "../../../../utils/formatYear";
  import { fData } from '../../../../utils/formatNumber';
  import { Stallion } from '../../../../@types/stallion';
  import * as Yup from 'yup';
  // redux
import { useDispatch, useSelector } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { usePromotionstatusQuery } from 'src/redux/splitEndpoints/promotionstatusSplit';
import { useFeestatusQuery } from 'src/redux/splitEndpoints/feestatusSplit';
import { useStallionQuery, useAddStallionMutation, useEditStallionMutation } from 'src/redux/splitEndpoints/stallionSplit'
import { useRetiredReasonQuery } from 'src/redux/splitEndpoints/retiredReasonSplit';
import { useSnackbar } from 'notistack';
import Scrollbar from '../../../../components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
///////////////////

type FormValuesProps = Stallion;

type Props = {
    openAddEditForm: boolean;
    handleDrawerCloseRow: VoidFunction;
    isEdit: boolean;
    editId: string;
  };

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function StallionNewEditFormSidebar({ openAddEditForm, handleDrawerCloseRow, isEdit, editId }: Props) {
  
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [addStallion] = useAddStallionMutation();
  const [editStallion] = useEditStallionMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: countriesList } = useCountriesQuery();
  const { data: stateList } = useStatesQuery();
  const { data: currencyList } = useCurrenciesQuery();
  const { data: feeStatusList } = useFeestatusQuery();
  const { data: retiredReasonList } = useRetiredReasonQuery();
  const dispatch = useDispatch();
  const yob = range(2000, 2050);

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };
  
  const { data, error, isFetching, isLoading, isSuccess } = useStallionQuery(editId); 
  
  const currentStallion = {
    "id": 9,
    "stallionUuid": "C324CF74-FED4-EC11-B1E6-00155D01EE2B",
    "horseId": "A0CC3700-6EC1-EC11-B1E4-00155D01EE2B",
    "horseName": "horse1",
    "farmId": "3B0B6170-7ACC-EC11-B1E4-00155D01EE2B",
    "farmName":"aditya",
    "countryId": 12,
    "stateId": 12,
    "currencyId": 2,
    "serviceFeeYear": 2021,
    "serviceFee": 12345,
    "serviceFeeStatus": 2,
    "reason": 1,
    "url": "https://www.smportal.com/stallion/4cf0a2ee-6a3f-41e1-ba31-81df1fc4853b",
    "image": "1652790536575..jpg",
    "yearToStud": 2001,
    "height": 123,
    "yearToRetired": 2012,
    "isPromoted": false,
    "isVerified": false,
    "isActive": false,
    "createdBy": 2,
    "createdOn": "2022-05-16T15:26:29.826Z",
    "verifiedBy": null,
    "verifiedOn": null,
    "modifiedBy": null,
    "modifiedOn": "2022-05-17T17:58:56.793Z",
    "__entity": "Stallion"
  };  ;  
  //const isEdit = true;

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
      handleDrawerCloseRow();
  };

  const NewStallionSchema = Yup.object().shape({
    name: Yup.string().required('Stallion Name is required'),
    farmName: Yup.string().required('Farm Name is required'),
    countryName: Yup.string().required('country is required'),
    state: Yup.string().required('State is required'),
    currency: Yup.string().required('Currency is required'),    
    serviceFee: Yup.string().required('Service Fee is required'),
    status: Yup.string().required('Status is required'),
    yearToStud: Yup.string().required('Year to Stud is required'),
    yearToRetired: Yup.string().required('Year To Retired is required'),
  });

  const defaultValues = React.useMemo(
    () => ({
      horseName: currentStallion?.horseName || '',
      farmName: currentStallion?.farmName || '',
      countryId: currentStallion?.countryId || 0,
      stateId: currentStallion?.stateId || 0,
      currencyId: currentStallion?.currencyId || 0,
      serviceFee: currentStallion?.serviceFee || 0,
      serviceFeeStatus: currentStallion?.serviceFeeStatus || 0,
      yearToStud: currentStallion?.yearToStud || 0,
      yearToRetired: currentStallion?.yearToRetired || 0,
      id: currentStallion?.id || '',
      serviceFeeYear: currentStallion?.serviceFeeYear || 0,
      height: currentStallion?.height || 0,
      reason: currentStallion?.reason || 0,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentStallion]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewStallionSchema),
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
    if (isEdit && currentStallion) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentStallion]);

  const onSubmit = async (data: FormValuesProps) => {    
    try {
        // console.log(data);
        return false;      
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

  return (
     
      <Drawer
        sx={{
          width: '360px',
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: '360px',
            height: "100vh",
            overflow: "scroll"
          },
        }}
        variant="persistent"
        anchor="right"
        open={openAddEditForm}
      >
        <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
      
    >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <i className='icon-Cross'/>
          </IconButton>
        </DrawerHeader>
        <Box px={5} className='edit-section'>
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Box px={2}>
            <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Box className='add-photo'>
                <img src={photograph} alt='Photograph'/>
                <Typography component='span'>Drag and drop your images here</Typography>
                <Typography component='body'>or <Link href='#'>upload</Link> from your computer </Typography>
            </Box>
                {/* <Box sx={{ mb: 5 }}>
                <RHFUploadAvatar
                    name="avatarUrl"
                    accept="image/*"
                    maxSize={3145728}
                    onDrop={handleDrop}
                    helperText={
                    <Typography
                        variant="caption"
                        sx={{
                        mt: 2,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.secondary',
                        }}
                    >
                        Drag and drop your images here
                        <br /> or upload from your computer
                    </Typography>
                    }
                />
                </Box>                 */}
            
            </Grid>

            <Grid item xs={12} md={12}>
            
                <Box
                // sx={{
                //     display: 'grid',
                //     columnGap: 2,
                //     rowGap: 3,
                //     gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                // }}
                >
                <Typography variant="h4" sx={{ mb: 0.5 }}>Stallion Details   
                    <RHFTextField name="horsename" placeholder='Stallion Name' className='edit-field'/>
                    <RHFTextField name="farmName" placeholder="Farm Name" className='edit-field' />
                </Typography>

              <Box className='edit-field'>
                <RHFSwitch
                  name="isPromoted"
                  labelPlacement="start"
                  label={
                    <>
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                      Promoted <i className='icon-Link' />
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                <RHFSwitch
                  name="sso"
                  labelPlacement="start"
                  label={
                    <>
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        Active
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                />
                </Box>
                <Typography variant="h4" sx={{ mb: 1 }}>Location       
                <RHFSelect name="countryName" placeholder="Country" className='edit-field'>
                    <option value="0"> Country </option>
                    {
                    countriesList?.map(({id, countryName}) => {
                        return <option value={id} key= {id}>{countryName}</option>
                    })}
                </RHFSelect>    

                <RHFSelect name="state" placeholder="state">
                    <option value="0">State</option>
                    {
                    stateList?.map(({stateId, stateName}) => {
                        return <option value={stateId} key= {stateId}>{stateName}</option>
                    })}
                </RHFSelect>
                </Typography>
                
                <Typography variant="h4" sx={{ mb: 0.5 }}>Stud Fee<i className='icon-bar-chart' />
                <RHFSelect name="servicefeeyear" placeholder="servicefeeyear" className='edit-field'>
                    <option value="0">Service Fee Year</option>
                        {yob.map(year => (
                        <option value={year} key={year}>{year}</option>
                        ))}  
                </RHFSelect>   
                <RHFSelect name="currency" placeholder="currency">
                <option value="0">Currency</option>
                    {
                    currencyList?.map(({id, currencyName}) => {
                        return <option value={id} key= {id}>{currencyName}</option>
                    })}
                </RHFSelect>              
                <RHFTextField name="serviceFee"  className='edit-field' />
                <RHFSelect name="status" placeholder="status" >
                    <option value="0">Fee Status</option>
                    {
                    feeStatusList?.map(({id, name}) => {
                        return <option value={id} key= {id}>{name}</option>
                    })}
                </RHFSelect>
                </Typography>

                <Typography variant="h4" sx={{ mb: 0.5 }}>Height
                <RHFTextField name="height" placeholder="Enter Height"  className='edit-field'/>
                </Typography>    
                <Typography variant="h4" sx={{ mb: 0.5 }}>Year to Stud    
                <RHFSelect name="yearToStud" placeholder="yearToStud"  className='edit-field'>
                    <option value="0">Enter Year</option>
                        {yob.map(year => (
                        <option value={year} key={year}>{year}</option>
                        ))}   
                </RHFSelect>
                </Typography>

                <Typography variant="h4" sx={{ mb: 0.5 }}>Year to Retired    
                <RHFSelect name="yearToRetired" placeholder="yearToRetired" className='edit-field'>
                <option value="0">Enter Year</option>
                        {yob.map(year => (
                        <option value={year} key={year}>{year}</option>
                        ))} 
                </RHFSelect>
                <RHFSelect name="reason" placeholder="Enter Reason" className='edit-field'>
                    <option value="0">Enter Reason</option>                    
                    {
                    retiredReasonList?.map(({id, reasonName}) => {
                        return <option value={id} key= {id}>{reasonName}</option>
                    })}   
                </RHFSelect>                
                </Typography>

                <div>      
                <Accordion  expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                  >
                    <Typography sx={{ width: '33%', flexShrink: 0 }}>Personal data</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                            <Typography>Created</Typography>
                            <Typography>Created by</Typography>
                            <Typography>Updated</Typography>
                            <Typography>Updated by</Typography>
                          </AccordionDetails>
                </Accordion>
              </div>
                </Box>

                <Stack sx={{ mt: 3 }}>
                <LoadingButton  type="submit" variant="contained" loading={isSubmitting}>
                    {!isEdit ? 'Create Stallion' : 'Save'}
                </LoadingButton>
                </Stack>
            
            </Grid>
        </Grid>
        </Box>
        </FormProvider>
        </Box>
        </Scrollbar>
      </Drawer>

  );
}
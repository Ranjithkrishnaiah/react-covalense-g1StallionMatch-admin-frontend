import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Box, Card, Grid, Stack, Switch, Typography, FormControlLabel } from '@mui/material';
// utils
import { fData } from '../../../utils/formatNumber';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { UserManager } from '../../../@types/user';
import { Stallion } from '../../../@types/stallion';
// components
import Label from '../../../components/Label';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useStallionsQuery, useAddStallionMutation, useEditStallionMutation } from 'src/redux/splitEndpoints/stallionSplit'
import {
  FormProvider,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from '../../../components/hook-form';
import { copyFile } from 'fs';
import { range } from "../../../utils/formatYear";
//import Select from "@mui/material/Select";
//import Select from 'react-select';

// ----------------------------------------------------------------------

type FormValuesProps = Stallion;

type Props = {
  isEdit: boolean;
  currentStallion?: Stallion;
  id: string | number;
};

export default function StallionNewEditForm({ isEdit, currentStallion, id }: Props) {
  const navigate = useNavigate();
  const [addStallion] = useAddStallionMutation();
  const [editStallion] = useEditStallionMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: countriesList } = useCountriesQuery();
  const { data: stateList } = useStatesQuery();
  const { data: currencyList } = useCurrenciesQuery();
  const dispatch = useDispatch();
  const yob = range(2000, 2050);
  
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

  const defaultValues = useMemo(
    () => ({
      name: currentStallion?.name || '',
      farmName: currentStallion?.farmName || '',
      countryName: currentStallion?.countryName || '',
      state: currentStallion?.state || '',
      currency: currentStallion?.currency || '',
      serviceFee: currentStallion?.serviceFee || 0,
      status: currentStallion?.status || '',
      yearToStud: currentStallion?.yearToStud || 0,
      yearToRetired: currentStallion?.yearToRetired || 0,
      id: currentStallion?.id || '',
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

  useEffect(() => {
    if (isEdit && currentStallion) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentStallion]);
  //console.log(id);return false;
  const onSubmit = async (data: FormValuesProps) => {    
    try {
      {!isEdit ?  await addStallion(data) : await editStallion(data)}
      reset();
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_DASHBOARD.stallions.list);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

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

  const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' },
  ];  

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3 }}>            

            <Box sx={{ mb: 5 }}>
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
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> max size of {fData(3145728)}
                  </Typography>
                }
              />
            </Box>
            
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                display: 'grid',
                columnGap: 2,
                rowGap: 3,
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <RHFTextField name="name" label="Stallion Name" />
              <RHFTextField name="farmName" label="Farm Name" />

              <RHFSelect name="countryName" label="Country" placeholder="Country">
                <option value="" />
                {
                  countriesList?.map(({id, countryName}) => {
                    return <option value={id} key= {id}>{countryName}</option>
                })}
              </RHFSelect>     

              <RHFSelect name="state" label="State" placeholder="state">
                <option value="" />
                {
                  stateList?.map(({stateId, stateName}) => {
                    return <option value={stateId} key= {stateId}>{stateName}</option>
                })}
              </RHFSelect>

              <RHFSelect name="currency" label="Currency" placeholder="currency">
              <option value="" />
                {
                  currencyList?.map(({id, currencyName}) => {
                    return <option value={id} key= {id}>{currencyName}</option>
                })}
              </RHFSelect>               
              <RHFTextField name="serviceFee" label="Service Fee" />
              <RHFSelect name="status" label="Status" placeholder="status">
                <option value="" />
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </RHFSelect>
              <RHFSelect name="yearToStud" label="Year to Stud" placeholder="yearToStud">
                <option value="" />
                    {yob.map(year => (
                      <option value={year} key={year}>{year}</option>
                    ))}   
              </RHFSelect>
              <RHFSelect name="yearToRetired" label="Year to Retired" placeholder="yearToRetired">
                <option value="" />
                    {yob.map(year => (
                      <option value={year} key={year}>{year}</option>
                    ))} 
              </RHFSelect>
              
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? 'Create Stallion' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

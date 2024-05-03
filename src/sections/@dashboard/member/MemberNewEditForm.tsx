import * as Yup from 'yup';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useParams, useNavigate } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { 
    Box, 
    Card, 
    Grid, 
    Stack, 
    Typography, 
    FormControlLabel,
    Table,
    TableRow,
    TableBody,
    TableHead,
    TableCell,
    TableContainer } from '@mui/material';
// utils
import { fData } from '../../../utils/formatNumber';
// routes
import { PATH_DASHBOARD } from '../../../routes/paths';
// @types
import { Member } from '../../../@types/member';
// components
import Label from '../../../components/Label';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useMemberQuery, useAddMemberMutation, useEditMemberMutation } from 'src/redux/splitEndpoints/memberSplit'
import {
  FormProvider,
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
  RHFRadioGroup,
} from '../../../components/hook-form';
import Scrollbar from '../../../components/Scrollbar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// ----------------------------------------------------------------------

type FormValuesProps = Member;

type Props = {
  isEdit: boolean;
  currentMember?: Member;
  id: string | number;
};

export default function MemberNewEditForm({ isEdit, currentMember, id }: Props) {
  const navigate = useNavigate();
  const [addMember] = useAddMemberMutation();
  const [editMember] = useEditMemberMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: countriesList } = useCountriesQuery();
  const dispatch = useDispatch();
  
  const NewMemberSchema = Yup.object().shape({
    fullName: Yup.string().required('Member Name is required'),
    email: Yup.string().required('Email is required').email("Invalid email address format"),
    businessName: Yup.string().required('Business name is required'),
    address: Yup.string().required('Address is required'),
    country: Yup.string().required('Country is required'),    
    mobile: Yup.string().required('Mobile Fee is required'),
    farm: Yup.string().required('Farm is required'),
    isEmail: Yup.string().required('Choose your email option'),
    isSms: Yup.string().required('Choose your sms option'),
    isPromotional: Yup.string().required('Choose your promotion option'),
  });

  const defaultValues = useMemo(
    () => ({
      fullName: currentMember?.fullName || '',
      email: currentMember?.email || '',
      address: currentMember?.address || '',
      country: currentMember?.country || '',
      id: currentMember?.id || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentMember]
  );

  
 
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewMemberSchema),
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
    if (isEdit && currentMember) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentMember]);
  
  const onSubmit = async (data: FormValuesProps) => {   
    //console.log(data);return false; 
    try {
      {!isEdit ?  await addMember(data) : await editMember(data)}
      reset();
      enqueueSnackbar(!isEdit ? 'Create success!' : 'Update success!');
      navigate(PATH_DASHBOARD.members.list);
    } catch (error) {
      console.error(error);
    }
  };
  //const fs = require('fs');
  // const handleDrop = useCallback(    
  //   (acceptedFiles) => {
  //     const file = acceptedFiles[0];  
  //     if (file) {
  //       setValue(
  //         'image',
  //         Object.assign(file, {
  //           preview: URL.createObjectURL(file),
  //         })
  //       );
  //     }
  //   },
  //   [setValue]
  // );

  const MEMBER_COMMON_OPTIONS = ['Yes', 'No'];
  
  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3 }}>            

            <Box sx={{ mb: 5 }}>
              {/* <RHFUploadAvatar
                name="image"
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
              /> */}
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
              <RHFTextField name="fullName" label="Full Name" />
              <RHFTextField name="email" label="Email" />
              <RHFTextField name="businessName" label="Business Name" />
              <RHFTextField name="address" label="Address" multiline rows={3} />
              <RHFSelect 
              
              name="country" label="Country" placeholder="Country">
              <option value="" />
                {
                  countriesList?.map(({id, countryName}) => {
                    return <option value={id} key= {id}>{countryName}</option>
                })}
              </RHFSelect>
              <RHFTextField name="mobile" label="Mobile" />
              <RHFTextField name="farm" label="Farm Name" />

              <Stack spacing={1}>
                <Typography variant="subtitle1">Is Email</Typography>
                <RHFRadioGroup name="isEmail" options={MEMBER_COMMON_OPTIONS} row={false} />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle1">Is SMS</Typography>
                <RHFRadioGroup name="isSms" options={MEMBER_COMMON_OPTIONS} row={false} />
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle1">Is Promotional</Typography>
                <RHFRadioGroup name="isPromotional" options={MEMBER_COMMON_OPTIONS} row={false} />
              </Stack>
            </Box>

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!isEdit ? 'Create Member' : 'Save Changes'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}

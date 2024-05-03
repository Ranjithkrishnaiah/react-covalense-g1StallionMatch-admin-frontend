import * as Yup from 'yup';
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Link, Stack, Alert, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// routes
import { PATH_AUTH } from '../../../routes/paths';
// hooks
import useAuth from '../../../hooks/useAuth';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
// components
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField, RHFCheckbox } from '../../../components/hook-form';
import './loginform.css'
import { Box } from '@mui/system';
import { LoginSchema } from '../../../@types/login';
import { useLoginMutation } from 'src/redux/splitEndpoints/loginSplit';
import { PATH_DASHBOARD } from '../../../routes/paths';
// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  password: string;
  remember: boolean;
  afterSubmit?: string;
};

export default function LoginForm() {
  //const { login } = useAuth();
  const [ login, response ] = useLoginMutation();
  const navigate = useNavigate();
  
  
  React.useEffect(() => {
    if(response.isSuccess){
      window.localStorage.setItem("accessToken", response?.data?.accessToken);
      window.localStorage.setItem("user", JSON.stringify(response?.data?.member));
      window.localStorage.setItem("fullName", response?.data?.member.fullName);
      window.localStorage.setItem("roleName", response?.data?.member.roleName);
      window.localStorage.setItem("isTokenExpired", "No");
      // window.localStorage.setItem("user", response?.data?.member);
      setUser(response?.data?.member)
      setAuthentication(true)
      reset();
      navigate(PATH_DASHBOARD.general.app);
      //close();
    }
  },[response])
  const { setAuthentication, setUser } = useAuth();

  const isMountedRef = useIsMountedRef();

  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
    remember: true,
  };
  //matthew.ennis@yopmail.com
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const SubmitLogin = async (loginData: LoginSchema) => {
    try {    
      let res:any = await login(loginData);
      
      if (res?.error) {
        if(res?.error.status === 422) {
          if (res?.error.data?.errors?.email === 'notFound') {
            setError('afterSubmit', { message: 'Your account is currently inactive, Please contact Admin' });
          } else {
            setError('afterSubmit', { message: 'Invalid credentials' });
          }
        }
      }
    } catch (error) {alert(111);
      console.error(error);
      reset();
      if (isMountedRef.current) {
        setError('afterSubmit', { ...error, message: error.message });
      }
    }
  };

  return (
    <Box className='login-form'>
    <FormProvider methods={methods} onSubmit={handleSubmit(SubmitLogin)}>
      <Stack spacing={4}>
        {!!errors.afterSubmit && <Alert severity="error">{errors.afterSubmit.message}</Alert>}

        <RHFTextField name="email" 
        placeholder='Email address'/>
       {/* label="Email address"  */}

        <RHFTextField
          name="password"
          placeholder='Password'
          // label="Password"
          type={showPassword ? 'text' : 'password'}
          // InputProps={{
          //   endAdornment: (
          //     <InputAdornment position="end">
          //       <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
          //         <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
          //       </IconButton>
          //     </InputAdornment>
          //   ),
          // }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between"  sx={{ my: 2, mb:3, }}>
        <RHFCheckbox name="remember" label="Remember me" />
        {/* <Link component={RouterLink} variant="subtitle2" to={PATH_AUTH.resetPassword}>
          Forgot password?
        </Link> */}
      </Stack>

      <LoadingButton
        fullWidth
        className='login-btn'
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </FormProvider>
    </Box>
  );
}

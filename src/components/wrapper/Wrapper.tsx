import { Dialog, DialogTitle, DialogContent, IconButton, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import './wrapper.css';
import 'src/sections/@dashboard/css/list.css';
import * as Yup from 'yup';
import { useEffect, useMemo, useState, forwardRef } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui

// redux
import { useDispatch, useSelector } from 'react-redux';

//import { usePedigreesQuery } from '../../../redux/services/horsePedigree';
import { FormProvider, RHFTextField } from '../hook-form';
import {
  Box,
  Grid,
  Modal,
  StyledEngineProvider,
  Card,
  Stack,
  Button,
  InputLabel,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useMemberInvitationMutation } from 'src/redux/splitEndpoints/memberSplit';
import { CustomToasterMessage } from '../toasterMessage/customToasterMessage';
import { PATH_DASHBOARD } from 'src/routes/paths';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
////////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

interface InviteModal {
  name: string;
  email: string;
}

const drawerWidth = 240;
type FormValuesProps = InviteModal;

export const WrapperDialog = (props: any) => {
  const navigate = useNavigate();
  const { open, close, apiStatus, setApiStatus, apiStatusMsg, setApiStatusMsg, valuesExist, setValuesExist } = props;
  const [inviteMember, inviteMemberResponse] = useMemberInvitationMutation();
  const { enqueueSnackbar } = useSnackbar();
  const NewMemberInviteSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    email: Yup.string().email('Email must be a valid email address').required('Email is required'),
  });

  // initial state of userModuleAccessAddBtn
  const [userModuleAccessAddBtn, setUserModuleAccessAddBtn] = useState({
    member_invite: false,
  });

  // call on valuesExist
  useEffect(() => {
    setUserModuleAccessAddBtn({
      ...userModuleAccessAddBtn,
      member_invite: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_INVITE_A_NEW_USER') ? false : true,
    });
  }, [valuesExist]);

  const defaultValues = useMemo(
    () => ({
      fullName: '',
      email: '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const handleReset = () => {
    
    reset(defaultValues);
    close();
  }
  const handleNotificationLink = () => {
    navigate(PATH_DASHBOARD.notifications.list);
  };
  const onSubmit = async (inviteData: any) => {
    try {
      let res: any = await inviteMember(inviteData);

      if (res?.data) {
        setApiStatusMsg({ 'status': 201, 'message': '<b>Member successfully invited!</b> Member has 48hrs to accept otherwise invitation will expire. Please check <a href="/dashboard/notifications/list">Notifications</a> for updates.' });
        setApiStatus(true);
        close();
        // enqueueSnackbar('Invitation sends successfully')
        // Reset the form fields
        methods.reset();
      }
      if (res?.error) {
        if (res?.error.status === 422) {
          setApiStatusMsg({ 'status': res?.error.status, 'message': res?.error.data.message });
          setApiStatus(true);
          close();
        }
      }
    } catch (error) {
      // console.log(error, 'ERR')
      if (error?.error) {
        enqueueSnackbar(error?.error?.error);
      }
    }
  };
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewMemberInviteSchema),
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
  // console.log('chk status in wrapper', apiStatus);
  return (
    <StyledEngineProvider injectFirst>
      {/* {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}   */}
      <Dialog
        open={props.open}
        className="dialogPopup"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        <CustomDialogTitle>
          {props.title}

          <IconButton
            onClick={handleReset}
            sx={{
              position: 'absolute',
              right: 12,
              width: 36,
              height: 36,
              top: 18,
              color: (theme) => '#1D472E',
            }}
          >
            <i className="icon-Cross" />
          </IconButton>
        </CustomDialogTitle>

        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
        {userModuleAccessAddBtn.member_invite === false ? <UnAuthorized /> :
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box py={2} pt={3} className='edit-section'>
              <Box className='FormGroup'>
                <InputLabel>Full Name</InputLabel>
                <RHFTextField fullWidth name="fullName" placeholder="Enter Full Name" className='edit-field' />
              </Box>

              <Box className='FormGroup'>
                <InputLabel>Email Address</InputLabel>
                <RHFTextField
                  name="email"
                  fullWidth
                  placeholder="Enter Email Address"
                  className="custfield edit-field"
                />
              </Box>
              <Box className='FormGroup'>
                <Typography className='modal-des' pb={2}>
                  An invitation will be sent to the member above email. They have <b>48hrs</b> to accept and complete the registration process.
                </Typography>
              </Box>
              <LoadingButton type="submit" fullWidth className="lr-btn">
                Send
              </LoadingButton>
            </Box>
          </FormProvider>
        }
        </DialogContent>
      </Dialog>
    </StyledEngineProvider>
  );
};

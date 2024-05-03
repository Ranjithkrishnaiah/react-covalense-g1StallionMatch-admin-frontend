import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  MenuItem,
  Select,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import 'src/components/wrapper/wrapper.css';
import 'src/sections/@dashboard/css/list.css';
import * as Yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, StyledEngineProvider, InputLabel, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useFarmAccessLevelQuery } from 'src/redux/splitEndpoints/farmAccessLevelSplit';
import { useFarmUserInvitationMutation } from 'src/redux/splitEndpoints/farmSplit';
import AutocompleteMultiSelectChip from '../AutocompleteMultiSelectChip';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PATH_DASHBOARD } from 'src/routes/paths';
///////////////////////////////////////////////////////////////////////
export const CustomDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: '#E2E7E1',
}));

// InviteModal interface
interface InviteModal {
  fullName: string;
  email: string;
  accessLevelId: string;
}
// FormValues Props type
type FormValuesProps = InviteModal;

export const InviteNewFarmUserWrapperDialog = (props: any) => {
  // props
  const {
    open,
    close,
    apiStatus,
    setApiStatus,
    apiStatusMsg,
    setApiStatusMsg,
    farmId,
    userModuleAccessAddBtn,
    setUserModuleAccessAddBtn,
  } = props;
  // Schema for form
  const NewHorseSchema = Yup.object().shape({});
  // initial states
  const [state, setStateValue] = useState({
    fullName: '',
    email: '',
    accessLevelId: 'none',
  });
  const [errors, setErrors] = useState<any>({});
  const [accessLevelId, setAccessLevelId] = useState<any>('none');
  const [farmStallions, setFarmStallions] = useState([]);
  // defaultValues
  let defaultValues = useMemo(
    () => ({
      fullName: '',
      email: '',
      accessLevelId: 'none',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // onSubmit form handler
  const onSubmit = async (state: any) => {
    if (!validateForm()) return;
    try {
      const finalData = {
        fullName: state?.fullName,
        email: state?.email,
        accessLevelId: parseInt(state?.accessLevelId),
        farmId: props.farmId,
        stallionIds:
          farmStallions.length > 0 && parseInt(state?.accessLevelId) > 0 ? farmStallions : [],
      };

      let res: any = await inviteFarmUser(finalData);
      if (res?.data) {
        setApiStatusMsg({
          status: 201,
          message: `<b>User successfully invited!</b> User has 48hrs to accept otherwise invitation will expire. Please check <a href=${PATH_DASHBOARD.system.notifications} target="_blank">Notifications</a> for updates.`,
        });
        setApiStatus(true);
        handleClose();
      }
      if (res?.error) {
        const error: any = res.error;
        if (res?.error.status === 422) {
          var obj = error?.data?.errors;
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const element = obj[key];
              setApiStatusMsg({ status: 422, message: element });
              setApiStatus(true);
            }
          }
          handleClose();
        }
      }
      reset();
    } catch (error) {}
  };
  // methods handler
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewHorseSchema),
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
  const accessLevel = watch('accessLevelId');
  const fullName = watch('fullName');
  // API to select access level
  const { data: selectaccesslevel } = useFarmAccessLevelQuery();
  const [inviteFarmUser] = useFarmUserInvitationMutation();

  // Close modal handler
  const handleClose = () => {
    setStateValue({
      ...state,
      fullName: '',
      email: '',
      accessLevelId: 'none',
    });
    setFarmStallions([]);
    setErrors({});
    setAccessLevelId('none');
    close();
  };

  // onChange field handler
  const handleChangeField = (type: any, targetValue: any) => {
    setStateValue({
      ...state,
      [type]: targetValue,
    });
  };

  // validate Form handler
  let validateForm = () => {
    /*eslint-disable */
    let errors = {};
    let formIsValid = true;
    //@ts-ignore
    if (state.fullName === '') {
      formIsValid = false; //@ts-ignore
      errors['fullName'] = `Full Name is required`;
    }
    if (state.accessLevelId === 'none') {
      formIsValid = false; //@ts-ignore
      errors['accessLevelId'] = `Access Level is required`;
    }
    if (state.email === '') {
      formIsValid = false; //@ts-ignore
      errors['email'] = `Email is required`;
    }
    if (state.email !== '' && isValidEmail(state.email) === false) {
      formIsValid = false; //@ts-ignore
      errors['email'] = `Email is invalid`;
    }
    setErrors(errors);
    return formIsValid;
  };

  // isValid Email reg expression
  const isValidEmail = (urlString: any) => {
    let test = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(urlString);
    return test;
  };
  // error state handler
  useEffect(() => {
    let temp = { ...errors };
    if (state.fullName) {
      delete temp.fullName;
    }
    if (state.email) {
      delete temp.email;
    }
    if (state.accessLevelId !== 'none') {
      delete temp.accessLevelId;
    }
    setErrors(temp);
  }, [state]);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    disableScrollLock: 'false',
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-2px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* Dialog */}
      <Dialog
        open={props.open}
        className="dialogPopup"
        maxWidth={props.maxWidth || 'sm'}
        sx={props.sx}
      >
        <CustomDialogTitle>
          {props.title}

          <IconButton
            onClick={handleClose}
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

        {/* form starts */}
        <DialogContent className="popup-cnt" sx={{ p: '2rem' }}>
          {userModuleAccessAddBtn.farm_invite === false ? (
            <UnAuthorized />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box py={2} pt={3} mt={1} className="edit-section">
                <Box className="FormGroup">
                  <InputLabel>Full Name</InputLabel>
                  <TextField
                    {...register(`fullName`)}
                    value={state?.fullName}
                    onChange={(e) => handleChangeField('fullName', e.target.value)}
                    fullWidth
                    placeholder="Enter Full Name"
                    className="edit-field"
                  />
                  <div className="errorMsg">{errors.fullName}</div>
                </Box>

                <Box className="FormGroup">
                  <InputLabel>Email Address</InputLabel>
                  <TextField
                    {...register(`email`)}
                    value={state?.email}
                    onChange={(e) => handleChangeField('email', e.target.value)}
                    fullWidth
                    placeholder="Enter Email Address"
                    className="edit-field"
                  />
                  <div className="errorMsg">{errors.email}</div>
                </Box>
                <Box className="FormGroup">
                  <InputLabel>Access Level</InputLabel>
                  <Box className="edit-field">
                    <Select
                      {...register(`accessLevelId`)}
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      value={state?.accessLevelId}
                      onChange={(e: any) => {
                        setAccessLevelId(e.target.value);
                        handleChangeField('accessLevelId', e.target.value);
                      }}
                      className="form-control  filter-slct"
                      MenuProps={{
                        disableScrollLock: 'false',
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'right',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'right',
                        },
                        ...MenuPropss,
                      }}
                    >
                      <MenuItem className="selectDropDownList" value={'none'} disabled>
                        <em>Select Access Level</em>
                      </MenuItem>
                      {selectaccesslevel?.map(({ id, accessName }) => {
                        return (
                          <MenuItem className="selectDropDownList" value={id} key={id}>
                            {accessName}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <div className="errorMsg">{errors.accessLevelId}</div>
                    {accessLevelId === 3 && (
                      <Box mt={2.5} className="forThisUserInvite">
                        <InputLabel>Select Stallions for this User</InputLabel>
                        <Typography className="modal-des" mb={1}>
                          Please select the stallion(s) that{' '}
                          <strong>{fullName || 'this user'}</strong> will have access to view only.
                        </Typography>
                        <Box className="edit-field autoCompleteChip">
                          <AutocompleteMultiSelectChip
                            placeholder={'FarmStallions'}
                            farmStallions={farmStallions}
                            setFarmStallions={setFarmStallions}
                            farmId={props.farmId}
                          />
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
                <Box className="FormGroup">
                  <Typography className="modal-des" pb={2}>
                    An invitation will be sent to the user above email. They have <b>48hrs</b> to
                    accept and complete the registration process.
                  </Typography>
                </Box>
                <LoadingButton type="submit" fullWidth className="lr-btn">
                  Send
                </LoadingButton>
              </Box>
            </form>
          )}
        </DialogContent>
        {/* form ends */}
      </Dialog>
      {/* Dialog ends */}
    </StyledEngineProvider>
  );
};

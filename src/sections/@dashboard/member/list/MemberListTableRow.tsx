import React, { useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { TableRow, Checkbox, TableCell, Typography, MenuItem, StyledEngineProvider } from '@mui/material';
// @types
import { Member } from 'src/@types/member';
// components
import { TableMoreMenu } from 'src/components/table';
import { Divider } from '@mui/material';
import { useForgotPassworduserMutation } from 'src/redux/splitEndpoints/forgotPasswordSplit';
import { useSnackbar } from 'notistack';
import { useResendConfirmEmailMutation } from 'src/redux/splitEndpoints/resendConfirmEmailSplit';
import { useNavigate } from 'react-router';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
import { PATH_DASHBOARD } from 'src/routes/paths';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
// ----------------------------------------------------------------------

type Props = {
  row: Member;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
  apiStatus: boolean;
  setApiStatus: React.Dispatch<React.SetStateAction<boolean>>;
  apiStatusMsg: any;
  setApiStatusMsg: React.Dispatch<React.SetStateAction<any>>;
  memberModuleAccess?: any;
  setMemberModuleAccess?: React.Dispatch<React.SetStateAction<any>>;
  clickedPopover?: any;
  setClickedPopover?: React.Dispatch<React.SetStateAction<any>>;
};

export default function MemberListTableRow({
  row,
  selected,
  onSelectRow,
  onEditPopup,
  onSetRowId,
  handleEditState,
  apiStatus,
  setApiStatus,
  apiStatusMsg,
  setApiStatusMsg,
  memberModuleAccess,
  setMemberModuleAccess,
  clickedPopover,
  setClickedPopover,
}: Props) {
  const theme = useTheme();

  const {
    id,
    fullName,
    emailAddress,
    countryCode,
    memberSince,
    lastActive,
    roleName,
    isVerified,
    statusId,
    memberId,
    memberUuid,
    roleId,
    accessLevel,
  } = row;

  const [resetOrResendPopover, setResetOrResendPopover] = useState(false);
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);

  // Post member Forgot Password api call
  const [forgotPasswordApiCall, response] = useForgotPassworduserMutation();

  // Post member Resend Confirm Email api call
  const [resendConfirmEmailApiCall, resendResponse] = useResendConfirmEmailMutation();

  const navigate = useNavigate();

  // Open the meatball menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };

  // Close the meatball menu
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  // Based on isVerified and statusId value, display the icon style class
  let promotediconClass = isVerified == true ? 'icon-Confirmed-24px' : 'icon-NonPromoted';
  let nameStatusClass = 'name-active';
  let permission = '';
  switch (statusId) {
    case 1:
      nameStatusClass = 'name-active';
      break;
    case 2:
      nameStatusClass = 'name-suspended';
      break;
    case 4:
      nameStatusClass = 'name-closed';
      break;
  }

  // Based on accessLevel id, show permission Text
  switch (accessLevel) {
    case 1:
      permission = 'Full Access';
      break;
    case 2:
      permission = 'View Only';
      break;
    case 3:
      permission = 'Third Party';
      break;
  }

  // On click Reset password link, do APi call and display toaster message
  const onResetPassword = async () => {
    if (!memberModuleAccess?.member_reset) {
      setResetOrResendPopover(true);
    } else {      
      let resetPasswordObj = {
        email: emailAddress,
      };
      let res: any = await forgotPasswordApiCall(resetPasswordObj);
      if (res?.error) {
        const error: any = res.error;
        var obj = error?.data?.errors;
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const element = obj[key];
            setApiStatusMsg({ status: 422, message: element });
            setApiStatus(true);
          }
        }
      } else {
        setApiStatusMsg({ status: 201, message: res?.data?.message });
        setApiStatus(true);
        handleCloseMenu();
      }
    }    
  };

  // On click Resend password link, do APi call and display toaster message
  const onResendConfirmEmail = async () => {
    if (!memberModuleAccess?.member_resend) {
      setResetOrResendPopover(true);
    } else {  
      let res: any = await resendConfirmEmailApiCall(memberUuid);
      if (res?.error) {
        setApiStatusMsg({ status: 422, message: res?.error?.data?.message });
        setApiStatus(true);
      } else {
        setApiStatusMsg({ status: 201, message: res?.data?.message });
        setApiStatus(true);
        handleCloseMenu();
      }
    }
  };

  return (
    <StyledEngineProvider injectFirst>
    <TableRow hover selected={selected}>
      <TableCell align="left" className={nameStatusClass}>
        {fullName}
      </TableCell>
      <TableCell align="left">{emailAddress}</TableCell>
      <TableCell align="left">{countryCode}</TableCell>
      <TableCell align="left">{parseDateAsDotFormat(memberSince)}</TableCell>
      <TableCell align="left">{parseDateAsDotFormat(lastActive)}</TableCell>
      <TableCell align="left">{permission}</TableCell>
      <TableCell align="center">
        <i className={promotediconClass} />
      </TableCell>
      <TableCell align="right" className="table-more-btn">
        <TableMoreMenu
          open={openMenu}
          onOpen={handleOpenMenu}
          onClose={handleCloseMenu}
          actions={
            <>
              <MenuItem
                onClick={() => {
                  onEditPopup();
                  onSetRowId();
                  handleCloseMenu();
                  handleEditState();
                }}
              >
                Edit Member
              </MenuItem>
              <Divider style={{ margin: '0' }} />
              <MenuItem
                onClick={() => {
                  window.open(PATH_DASHBOARD.systemActivity.userFilter(fullName));
                  handleCloseMenu();
                }}
              >
                View Activity
              </MenuItem>
              <Divider style={{ margin: '0' }} />
              <MenuItem
                onClick={() => {
                  onResetPassword();
                }}
              >
                Reset Password
              </MenuItem>
              <Divider style={{ margin: '0' }} />
              <MenuItem
                className={`${isVerified && 'isVerifiedClass'}`}
                onClick={() => {
                  onResendConfirmEmail();
                }}
              >
                Resend Verification
              </MenuItem>
            </>
          }
        />
      </TableCell>
    </TableRow>

    {/* Download Unauthorized Popover section */}
    <DownloadUnauthorizedPopover
    clickedPopover={resetOrResendPopover}
    setClickedPopover={setResetOrResendPopover}
    />
    </StyledEngineProvider>
  );
}

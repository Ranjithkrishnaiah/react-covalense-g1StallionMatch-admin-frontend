import { useEffect, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  TableRow,
  TableCell,
  MenuItem,
  StyledEngineProvider,
  Divider,
  Box,
  styled,
} from '@mui/material';
// components
import { TableMoreMenu } from '../../../../../components/table';
import 'src/sections/@dashboard/css/list.css';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import React from 'react';
import { toPascalCase, parseDateAsDotFormat } from 'src/utils/customFunctions';
import { useNavigate } from 'react-router';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { useForgotPassworduserMutation } from 'src/redux/splitEndpoints/forgotPasswordSplit';
import { useDeleteUserMutation, useUpdateUserStatusMutation } from 'src/redux/splitEndpoints/usermanagementSplit';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    background: 'none',
    fontSize: theme.typography.pxToRem(12),
    fontFamily: 'Synthese-Regular !important',
  },
}));

type Props = {
  row: any;
  selected: boolean;
  onSelectRow: VoidFunction;
  onEditPopup: VoidFunction;
  onSetRowId: VoidFunction;
  handleEditState: VoidFunction;
};

export default function UserManagementListTableRow({
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
  valuesExist
}: any) {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    locations,
    memberId,
    emailAddress,
    fullName,
    roleName,
    memberSince,
    isActive,
    lastActive,
    memberUuid,
    countryName,
  } = row;
  //delete the user Api
  const [deleteUser, deleteUserResponse] = useDeleteUserMutation();
  const [updateUser, updateUserResponse] = useUpdateUserStatusMutation();
  const [openMenu, setOpenMenuActions] = useState<HTMLElement | null>(null);
  //Rest  password Api
  const [forgotPasswordApiCall, response] = useForgotPassworduserMutation();
  // opens menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenuActions(event.currentTarget);
  };
  //close the menu
  const handleCloseMenu = () => {
    setOpenMenuActions(null);
  };

  let ImportediconClass = isActive == true ? 'icon-Confirmed-24px' : 'icon-Incorrect';

  useEffect(() => {
    if (updateUserResponse.isSuccess) {
      setApiStatusMsg({ status: 201, message: `Status updated successfully!` });
      setApiStatus(true);
    }
  }, [updateUserResponse.isLoading])
  //Deletes the user  using Api
  const handleDeleteUser = async () => {
    let res: any = await deleteUser({ id: memberUuid });
    if (res?.error) {
      setApiStatusMsg({ status: 422, message: 'There is an error while deleting the user!' });
      setApiStatus(true);
    } else {
      setApiStatusMsg({ status: 201, message: 'User has been deleted successfully!' });
      setApiStatus(true);
    }
    handleCloseMenu();
  };

  //Resets the Pasword
  const onResetPassword = async () => {
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
  };

  return (
    <StyledEngineProvider injectFirst>
      <TableRow hover selected={selected}>
        {/* Member Id cell  */}
        <TableCell align="left">{memberId}</TableCell>
        {/* FullName Cell  */}
        <TableCell align="left">{toPascalCase(fullName)}</TableCell>
        {/* Email Address cell  */}
        <TableCell align="left">{emailAddress}</TableCell>
        {/* Location cell  */}
        <TableCell align="left">{countryName ? countryName : '--'}</TableCell>
        {/* Joined Date cell  */}
        <TableCell align="left">
          <HtmlTooltip
            placement="bottom"
            className="tableTooltip tablist-tooltip"
            title={
              <React.Fragment>
                <Box className="tooltipPopoverBody">
                  <p>
                    Last Active: {lastActive === null ? 'N/A' : parseDateAsDotFormat(lastActive)}
                  </p>
                </Box>
              </React.Fragment>
            }
          >
            <i className="emailNote">{parseDateAsDotFormat(memberSince)}</i>
          </HtmlTooltip>
        </TableCell>
        {/* Permission Role cell  */}
        <TableCell align="left">
          <b style={{ color: '#C75227', fontFamily: 'Synthese-Regular', fontWeight: '400' }}>
            {toPascalCase(roleName)}
          </b>
        </TableCell>
        {/* Active cell  */}
        <TableCell align="center">
          <Box style={{ cursor: 'pointer' }} onClick={() => updateUser({ memberUuid: memberUuid, status: !isActive })}>
            <i className={ImportediconClass} />
          </Box>
        </TableCell>

        {/* Meat Ball Menu  */}
        <TableCell align="right" sx={{ textAlign: 'right !important' }}>
          <TableMoreMenu
            open={openMenu}
            onOpen={handleOpenMenu}
            onClose={handleCloseMenu}
            actions={
              <>
                {/* Edit Menu  */}
                <MenuItem
                  onClick={() => {
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                  }}
                >
                  Edit
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                {/* Delete Menu  */}
                <MenuItem
                  onClick={() => {
                    handleDeleteUser();
                  }}
                  disabled={valuesExist?.hasOwnProperty('ADMIN_USER_MANAGEMENT_EDIT_EXISTING_USER') === true ? false : true}
                >
                  Delete
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                {/* Reset Password menu  */}
                <MenuItem
                  onClick={() => {
                    // onResetPassword();
                    onEditPopup();
                    onSetRowId();
                    handleCloseMenu();
                    handleEditState();
                  }}
                >
                  Reset Password
                </MenuItem>
                <Divider style={{ margin: '0' }} />
                {/* View activity menu  */}
                <MenuItem
                  onClick={() => {
                    window.open(PATH_DASHBOARD.systemActivity.userFilter(fullName));
                    handleCloseMenu();
                  }}
                >
                  View Activity
                </MenuItem>
              </>
            }
          />
        </TableCell>
        {/* Ends Meat Ball Menu  */}
      </TableRow>
    </StyledEngineProvider>
  );
}

import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
// form
// @mui
import { LoadingButton } from '@mui/lab';
import { RHFSwitch } from 'src/components/hook-form';
// redux
import { useDispatch } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useSnackbar } from 'notistack';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';
import DropdownTreeSelect from 'react-dropdown-tree-select';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  TextField,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from 'src/constants/MenuProps';
import {
  useAdminModulePermissionAccessLevelQuery,
  useRoleBasedAccessLevelQuery,
  useRoleQuery,
  useGetUserQuery,
  useAddUserMutation,
  useEditUserMutation,
} from 'src/redux/splitEndpoints/usermanagementSplit';
import { CircularSpinner } from 'src/components/CircularSpinner';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { parseDateAsDotFormat } from 'src/utils/customFunctions';
// ----------------------------------------------------------------------
const drawerWidth = 997;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

export default function UserManagementEditModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    apiStatus,
    setApiStatus,
    apiStatusMsg,
    setApiStatusMsg,
    valuesExist,
    setValuesExist,
  } = props;
  const navigate = useNavigate();

  //closes the edit popUp
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  //closes the Edit / New user Model
  const handleCloseModal = () => {
    resetData();
    if (isEdit) {
      handleDrawerClose();
      handleCloseEditState();
    } else {
      handleResetAndClose();
    }
  };

  const custom_roleId = 'CB4F2E01-8AFD-4430-AE02-6603639A44B3';
  const theme = useTheme();
  const [addUser] = useAddUserMutation();
  const [editUser] = useEditUserMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: countriesList } = useCountriesQuery();
  const treeDropdownRef = React.useRef<any>();
  const [isRoleChanged, setIsRoleChanged] = React.useState<boolean>(false);
  const [roleID, setRoleID] = React.useState('');
  const [isEditPassword, setIsEditPassword] = React.useState<boolean>(false);
  const { data: roleList } = useRoleQuery();
  console.log(roleID, 'roleID')
  //Api call for Getting the Acces levels list
  const {
    data: adminAccessLevelList,
    isFetching: isFetchingAdminAccessLevel,
    isLoading: isLoadingAdminAccessLevel,
    isSuccess: isSuccessAdminAccessLevel,
    refetch: refetchAdminAccessLevel,
  } = useAdminModulePermissionAccessLevelQuery();
  //Api for getting the role based access level List
  const {
    data: adminRoleBasedAccessLevelList,
    isFetching: isFetchingRoleBasedAdminAccessLevel,
    isLoading: isLoadingRoleBasedAdminAccessLevel,
    isSuccess: isSuccessRoleBasedAdminAccessLevel,
    refetch: refetchRoleBasedAdminAccessLevel,
  } = useRoleBasedAccessLevelQuery(roleID, { skip: !isRoleChanged });
  //Api call to User details
  const {
    data: userData,
    isFetching,
    refetch,
    isLoading,
    isSuccess,
  } = useGetUserQuery(rowId, { skip: !isEdit });
  const currentUser = userData;
  const editUserRolePermissionList = currentUser?.permissions;
  const [state, setStateValue] = useState({
    fullName: '',
    countryId: '',
    email: '',
    password: '',
    roleId: '',
  });

  const [changedRoleAcessLevel, setChangedRoleAcessLevel] = useState<any>([]);
  const [moduleAccessData, setModuleAccessData] = useState<any>([]);
  const [editModuleAccessData, setEditModuleAccessData] = useState<any>([]);
  const [saveLoader, setSaveLoader] = useState(false);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = React.useState<string | false>(false);
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
  //when ever access level data is fetched it updates the moduleAccessData 
  useEffect(() => {
    let list: any = [];
    if (isSuccessAdminAccessLevel && adminAccessLevelList) {
      adminAccessLevelList?.map((record: any, index: number) => {
        list.push({
          label: record.label,
          value: record.value,
          children: record.children,
          id: index,
          checked: record.checked,
        });
      });
      setModuleAccessData(list);
    }
  }, [isFetchingAdminAccessLevel, isFetchingAdminAccessLevel]);

  useEffect(() => {
    let list: any = [];
    if (
      isSuccessRoleBasedAdminAccessLevel &&
      adminRoleBasedAccessLevelList &&
      roleID !== custom_roleId
    ) {
      adminRoleBasedAccessLevelList?.map((record: any, index: number) => {
        list.push({
          label: record.label,
          value: record.value,
          children: record.children,
          checked: record.checked,
          id: index,
        });
      });
      !isEdit ? setModuleAccessData(list) : setEditModuleAccessData(list);
      if (list.length === 0) {
        treeDropdownRef?.current?.searchInput?.setAttribute('placeholder', 'Permission Settings');
      } else {
        treeDropdownRef?.current?.searchInput?.setAttribute('placeholder', '  ');
      }
    }
  }, [isSuccessRoleBasedAdminAccessLevel, isFetchingRoleBasedAdminAccessLevel]);

  useEffect(() => {
    let list: any = [];
    if (isSuccess && editUserRolePermissionList) {
      editUserRolePermissionList?.map((record: any, index: number) => {
        list.push({
          label: record.label,
          value: record.value,
          children: record.children,
          id: index,
          checked: record.checked,
        });
      });
      setEditModuleAccessData(list);
      if (list?.length === 0) {
        treeDropdownRef?.current?.searchInput?.setAttribute('placeholder', 'Permission Settings');
      } else {
        treeDropdownRef?.current?.searchInput?.setAttribute('placeholder', '  ');
      }
    }
  }, [isSuccess, isFetching]);

  React.useEffect(() => {
    if (isEdit && currentUser) {
      setStateValue({
        ...state,
        fullName: currentUser?.fullName,
        countryId: currentUser?.countryId,
        email: currentUser?.email,
        password: '',
        roleId: currentUser?.roleId,
      });
    }
  }, [isEdit, currentUser]);

  // Updates the Form Values based on target value 
  const handleChangeField = (type: any, targetValue: any) => {
    if (type == 'roleId') {
      setIsRoleChanged(targetValue ? true : false);
      setRoleID(targetValue);
    }
    if (type == 'password') {
      if (targetValue?.trim()?.length === 0) {
        setIsEditPassword(false);
      } else {
        setIsEditPassword(true);
      }
    }
    setStateValue({
      ...state,
      [type]: targetValue,
    });
  };
  const [errors, setErrors] = React.useState<any>({});
  //validates Form Values
  let validateForm = () => {
    /*eslint-disable */
    let fields = state;
    let errors = {};
    let formIsValid = true;

    //@ts-ignore
    if (!fields['fullName']) {
      formIsValid = false; //@ts-ignore
      errors['fullName'] = `Fullname is required`;
    }
    if (!fields['email']) {
      formIsValid = false; //@ts-ignore
      errors['email'] = `Email is required`;
    }
    if (fields['email'] !== '' && validateEmail(fields.email) === false) {
      formIsValid = false; //@ts-ignore
      errors['email'] = `Email is invalid`;
    }
    if (!fields['countryId']) {
      formIsValid = false; //@ts-ignore
      errors['countryId'] = `Country is required`;
    }
    if (!isEdit && !fields['password']) {
      formIsValid = false; //@ts-ignore
      errors['password'] = `Password is required`;
    }
    if (
      fields['password'] !== '' &&
      validatePassword(fields.password, fields.fullName, fields.email) === false
    ) {
      formIsValid = false; //@ts-ignore
      errors['password'] = `Password is invalid`;
    }
    if (!fields['roleId']) {
      formIsValid = false; //@ts-ignore
      errors['roleId'] = `Role is required`;
    }
    // console.log(fields, validatePassword(fields.password, fields.fullName, fields.email), errors, isEdit, 'fields')
    setErrors(errors);
    return formIsValid;
    /*eslint-enable */
  };

  console.log(state, 'RESET')
  //resets the data to previous values
  const resetData = () => {
    setStateValue({
      fullName: '',
      countryId: '',
      email: '',
      password: '',
      roleId: '',
    });
    setIsEditPassword(false);
    setIsRoleChanged(false);
    setRoleID('');
    setErrors({});
    setExpanded(false);
    if (isEdit) {
      refetch();
    } else {
      refetchAdminAccessLevel();
    }
    refetchRoleBasedAdminAccessLevel();
  };

  useEffect(() => {
    let temp = { ...errors };
    if (state.fullName) {
      delete temp.fullName;
    }
    if (state.email) {
      delete temp.email;
    }
    if (state.countryId) {
      delete temp.countryId;
    }
    if (state.password) {
      delete temp.password;
    }
    if (state.roleId) {
      delete temp.roleId;
    }
    setErrors(temp);
  }, [state]);

  //Reset and closes the Drawer
  const handleResetAndClose = () => {
    resetData();
    handleDrawerCloseRow();
  };

  //submits the user data  using api
  const handleSubmitUserData = async (event: any) => {
    console.log('RESET calledin')
    event.preventDefault();
    if (!validateForm()) return;
    setSaveLoader(true);
    const data = state;
    const finalData: any = {
      ...data,
      isResetPassword: state?.password?.length ? true : false,
      permissions: changedRoleAcessLevel,
    };
    // if(state?.password?.length === 0) {
    //   delete finalData?.password;
    // }
    let res: any = isEdit ? await editUser({ ...finalData, userId: rowId }) : await addUser({ ...finalData });
    // console.log(res, 'RESSS')
    if (res?.data) {
      setApiStatusMsg({
        status: 201,
        message: isEdit
          ? '<b>User data updated successfully!</b>'
          : '<b>User data created successfully!</b>',
      });
      resetData();
      isEdit ? handleCloseModal() : handleResetAndClose();
    } else {
      if (res?.error) {
        console.log(res, 'ERRRR')
        if (res?.error?.data?.errors) {
          setApiStatusMsg({
            status: 422,
            // message: `<b>${res?.error?.data?.message}</b>`
            message: `${Object.values(res?.error?.data?.errors)}`
          });
          isEdit ? handleCloseModal() : handleResetAndClose();
        } else {
          setApiStatusMsg({
            status: 422,
            // message: `<b>${res?.error?.data?.message}</b>`
            message: `${res?.error?.data?.message}`
          });
          isEdit ? handleCloseModal() : handleResetAndClose();
        }
      }
    }
    setSaveLoader(false);
    setApiStatus(true);
    // setApiStatusMsg({
    //   status: 201,
    //   message: isEdit
    //     ? '<b>User data updated successfully!</b>'
    //     : '<b>User data created successfully!</b>',
    // });
  };

  // formates the date 
  function parseDate(dateToParse: string) {
    let parsedDate = dateToParse ? new Date(dateToParse) : new Date();
    const formattedDate = `${parsedDate.getDate().toString().padStart(2, '0')}.${(
      parsedDate.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}.${parsedDate.getFullYear()}`;
    return formattedDate;
  }

  const onChange = async (currentNode: any, selectedNodes: any) => {
    const selectedData = await selectedNodes.map((res: any) => res.label);
    const selectedList: any = [];
    console.log(selectedNodes, 'RESET STATE')
    setStateValue((state) => ({
      ...state,
      roleId: custom_roleId,
    }))
    // setStateValue({
    //   ...state,
    //   roleId: custom_roleId,
    // });
    let selectedNodesList = selectedNodes;
    selectedNodesList?.map((v: any) => {
      if (v.hasOwnProperty('id')) {

      }
    })

    selectedNodes?.map(async (selectedRecord: any, index: number) => {
      if (selectedRecord.hasOwnProperty('_children')) {
        let listA = selectedRecord['id'];
        // console.log(listA, moduleAccessData, 'moduleAccessData')
        moduleAccessData[listA]?.children?.map((v: any) => {
          selectedList.push(v.childId);
        })
      } else {
        if (Array.isArray(selectedRecord?.value)) {
          await selectedRecord?.value.reduce(async (promise: any, rec: any) => {
            await promise;
            selectedList.push(rec.value || rec.childId || rec.label);
          }, Promise.resolve());
        } else {
          selectedList.push(selectedRecord.value || selectedRecord.childId || selectedRecord.label);
        }
      }
      setChangedRoleAcessLevel(selectedList.filter((v: any) => v != null));
    });
    console.log(selectedList, 'RESET selectedList')
    if (selectedNodes.length === 0) {
      treeDropdownRef.current.searchInput.setAttribute('placeholder', 'Permission Settings');
    } else {
      treeDropdownRef.current.searchInput.setAttribute('placeholder', '  ');
    }
  };

  const onFocus = async () => {
    treeDropdownRef.current.searchInput.setAttribute('style', 'display:block');
  };

  //premissions Rople dropdown component
  const DropDownTreeSelect = useMemo(() => {
    return (
      <Box className='user-permission'>
        <DropdownTreeSelect
          data={moduleAccessData || []}
          className={'mdl-demo '}
          onChange={onChange}
          onFocus={onFocus}
          texts={{ placeholder: 'Permission Settings' }}
          ref={treeDropdownRef}
          showDropdown="always"
        />
      </Box>
    );
  }, [moduleAccessData]);

  //premissions ROle dropdown component
  const EditDropDownTreeSelect = useMemo(() => {
    return (
      <Box className='user-permission'>
        <DropdownTreeSelect
          data={editModuleAccessData || []}
          className={'mdl-demo '}
          onChange={onChange}
          onFocus={onFocus}
          texts={{ placeholder: 'Permission Settings' }}
          ref={treeDropdownRef}
          showDropdown="always"
        />
      </Box>
    );
  }, [editModuleAccessData]);
  // validates Emails
  function validateEmail(email: string): boolean {
    const regex = /^[A-Za-z0-9_.-]+@[A-Za-z0-9-]+\.[A-Za-z0-9-.]+$/;
    return regex.test(email);
  }

  //Validates Password
  function validatePassword(password: string, email: string, fullName: string): boolean {
    const minLength = 8;
    // console.log(password, email, fullName, 'fullName')
    if (password.length < minLength) {
      // console.log(password, email, fullName, 'fullName min')
      return false;
    }

    if (!/[a-zA-Z]/.test(password)) {
      // console.log(password, email, fullName, 'fullName az')
      return false;
    }

    if (!/[0-9]/.test(password)) {
      // console.log(password, email, fullName, 'fullName digit')
      return false;
    };

    if (!/\d/.test(password)) {
      // console.log(password, email, fullName, 'fullName d')
      return false;
    }

    if (password.includes(email) || password.includes(fullName)) {
      // console.log(password, email, fullName, 'fullName email')
      return false;
    }

    return true;
  }

  return (
    // edit user / new user component
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root': {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className="DrawerRightModal RaceEditModal userManagementEditModal"
    >
      <Scrollbar
        className="DrawerModalScroll"
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: '100vh',
            background: '#E2E7E1',
          },
        }}
      >
        <CssBaseline />
        {/* Drawer header component  */}
        <DrawerHeader
          className="DrawerHeader"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          <IconButton
            className="closeBtn"
            onClick={isEdit ? handleCloseModal : handleResetAndClose}
          >
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>
        {/*  Ends Drawer header component  */}
        {console.log(valuesExist, 'valuesExist111')}
        {/* if there is no permission it showes unauthorized component else show Edit user content */}
        <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
          {(isEdit ? !valuesExist?.hasOwnProperty('ADMIN_USER_MANAGEMENT_EDIT_EXISTING_USER') :
            !valuesExist?.hasOwnProperty('ADMIN_USER_MANAGEMENT_CREATE_NEW_USER')) ? (
            <UnAuthorized />
          ) : (
            <Box px={0}>
              <Typography variant="h4" className="" mb={1}>
                User Details
              </Typography>
              <Grid container spacing={1} mt={0} pt={0} className="RaceListModalBox">
                {/* Full name Text field  */}
                <Grid item xs={4.5} md={4.5} mt={0} className="racelistgroup">
                  <Box className="FormGroup">
                    <TextField
                      error={errors.fullName ? true : false}
                      placeholder="Enter Full Name"
                      type="text"
                      name="fullName"
                      id="fullName"
                      className="edit-field"
                      value={state?.fullName}
                      onChange={(e) => handleChangeField('fullName', e.target.value)}
                    />
                  </Box>
                  <div className="errorMsg">{errors.fullName}</div>
                </Grid>
                {/* Email Text field  */}
                <Grid item xs={4.5} md={4.5} mt={0} className="racelistgroup">
                  <Box className="FormGroup">
                    <TextField
                      error={errors.email ? true : false}
                      placeholder="Enter Email Address"
                      type="text"
                      name="email"
                      id="email"
                      className="edit-field"
                      value={state?.email}
                      onChange={(e) => handleChangeField('email', e.target.value)}
                    />
                  </Box>
                  <div className="errorMsg">{errors.email}</div>
                </Grid>
                {/* Joined date and last updated  display */}
                <Grid item xs={3} md={3} mt={0} className="racelistgroup">
                  {isEdit && (
                    <Box className="FormGroup usermanagementlist" sx={{ marginLeft: '20px' }}>
                      <List className="RawDataList">
                        <ListItem>
                          <ListItemText
                            primary="Joined:"
                            secondary={parseDate(currentUser?.createdOn || '')}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Last Active:"
                            secondary={
                              currentUser?.lastActive === null
                                ? 'N/A'
                                : parseDateAsDotFormat(currentUser?.lastActive)
                            }
                            secondaryTypographyProps={{
                              paddingLeft: '10px !important',
                            }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}
                </Grid>
                {/* Country dropdown  */}
                <Grid item xs={4.5} md={4.5} mt={0} className="racelistgroup">
                  <Box className="FormGroup">
                    <Box className="edit-field">
                      <Select
                        error={errors.countryId ? true : false}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="countryDropdown filter-slct"
                        value={state?.countryId === '' ? 'none' : state?.countryId}
                        onChange={(e) => handleChangeField('countryId', e.target.value)}
                        MenuProps={{
                          className: 'common-scroll-lock',

                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          ...MenuProps,
                        }}
                      >
                        <MenuItem
                          className="selectDropDownList countryDropdownList usercountry-dropdown"
                          value="none"
                          disabled
                        >
                          <em>Location</em>
                        </MenuItem>
                        {countriesList?.map(({ id, countryName }) => {
                          return (
                            <MenuItem
                              className="selectDropDownList countryDropdownList usercountry-dropdown"
                              value={id}
                              key={id}
                            >
                              {countryName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </Box>
                    <div className="errorMsg">{errors.countryId}</div>
                  </Box>
                </Grid>
                <Grid item xs={7.5} md={7.5} mt={0} className="racelistgroup">
                  <Box className="FormGroup usermanagementlist" sx={{ marginTop: '3px' }}>
                    <Box className="edit-field"></Box>
                  </Box>
                </Grid>
                {/* Password field  */}
                <Grid item xs={4.5} md={4.5} mt={0} className="racelistgroup">
                  <Box className="FormGroup">
                    <TextField
                      error={errors.password ? true : false}
                      placeholder="Password"
                      type="password"
                      name="password"
                      id="password"
                      className="edit-field"
                      value={state?.password}
                      onChange={(e) => handleChangeField('password', e.target.value)}
                    />
                  </Box>
                  <div className="errorMsg">{errors.password}</div>
                </Grid>
                {/* Reset Password display  */}
                {isEdit && (
                  <Grid item xs={7.5} md={7.5} mt={0} className="racelistgroup">
                    <Box className="FormGroup reset-password-usermng">
                      <Box className="edit-field">
                        <Button
                          type="button"
                          disableRipple
                          disableElevation
                          disableFocusRipple
                          className="link-btn"
                          onClick={handleSubmitUserData}
                          disabled={(isEditPassword === false || validatePassword(state.password, state.fullName, state.email) === false)}
                        >
                          Reset Password
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {/* Permissions Roles  */}
                <Grid item xs={12} md={12} mt={3} className="racelistgroup">
                  <Typography variant="h4" className="" mb={1}>
                    Permission Role
                  </Typography>
                </Grid>
                <Grid item xs={4.5} md={4.5} mt={0} className="racelistgroup">
                  <Box className="FormGroup">
                    <Box className="edit-field">
                      <Select
                        error={errors.roleId ? true : false}
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        value={state?.roleId === '' ? 'none' : state?.roleId}
                        onChange={(e) => handleChangeField('roleId', e.target.value)}
                        defaultValue="none"
                        name="expiredStallion"
                        MenuProps={{
                          className: 'common-scroll-lock',

                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          ...MenuProps,
                        }}
                      >
                        <MenuItem className="selectDropDownList" value="none" disabled>
                          <em>Select Permission Role</em>
                        </MenuItem>
                        {roleList?.map((v: any, i: any) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.Id} value={v.Id}>
                              {v.RoleName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </Box>
                    <div className="errorMsg">{errors.roleId}</div>
                  </Box>
                </Grid>
                {/* Single sign on Switch  */}
                {false && (
                  <Grid item xs={1.5} md={1.5} mt={0} className="racelistgroup sso-switch">
                    <Box className="FormGroup" px={1}>
                      <RHFSwitch
                        checked
                        className="RHF-Switches"
                        name="SSO"
                        labelPlacement="start"
                        label={
                          <>
                            <Typography variant="h4" sx={{ mb: 0.5 }}>
                              SSO
                            </Typography>
                          </>
                        }
                        sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                      />
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} md={12} mt={3} className="racelistgroup">
                  <Typography variant="h4" className="" mb={1}>
                    Permissions
                  </Typography>
                  <Box className="FormGroup">
                    {!isEdit && (
                      <Box className="edit-field">
                        <Box className="SDmultiselect CountrySDmultiselect">
                          {DropDownTreeSelect}
                        </Box>
                      </Box>
                    )}
                    {isEdit && (
                      <Box className="edit-field">
                        {isFetching && (
                          <Box className="dottedmap">
                            <CircularSpinner />
                          </Box>
                        )}
                        {!isFetching && (
                          <Box className="SDmultiselect CountrySDmultiselect">
                            {EditDropDownTreeSelect}
                          </Box>
                        )}
                      </Box>
                    )}
                  </Box>
                </Grid>
                {/* Save and Cancel Butoon DIsplay  */}
                <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                  <Stack sx={{ mt: 3 }} className="DrawerBtnWrapper">
                    <Grid container spacing={4} className="DrawerBtnBottom">
                      <Grid item xs={4} md={4} sx={{ paddingTop: '10px !important' }}>
                        <LoadingButton
                          fullWidth
                          variant="contained"
                          className="search-btn"
                          type="button"
                          loading={saveLoader}
                          onClick={handleSubmitUserData}
                        >
                          Save
                        </LoadingButton>
                      </Grid>
                      <Grid item xs={4} md={4} sx={{ paddingTop: '10px !important' }}>
                        <Button
                          fullWidth
                          type="button"
                          className="add-btn"
                          onClick={handleCloseModal}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Scrollbar>
    </Drawer>
  );
}

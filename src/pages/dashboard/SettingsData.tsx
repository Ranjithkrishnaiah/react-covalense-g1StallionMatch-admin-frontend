import * as Yup from 'yup';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { Box, Grid, Stack, Typography, Container, Select, MenuItem, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// hooks
import useAuth from '../../../src/hooks/useAuth';
// utils
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
// components
import { FormProvider, RHFSwitch } from 'src/components/hook-form';
import Page from 'src/components/Page';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
import { useState } from 'react';
import {
  useSmSettingQuery,
  useUpdateSettingsMutation,
} from 'src/redux/splitEndpoints/smSettingsSplit';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from 'src/constants/MenuProps';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';

//Form values propes types
type FormValuesProps = {
  displayName: string;
  email: string;
  photoURL: File | any;
  phoneNumber: string | null;
  country: string | null;
  address: string | null;
  state: string | null;
  city: string | null;
  zipCode: string | null;
  about: string | null;
  isPublic: boolean;
};

export default function SettingsData() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';
  //fetch settings data api
  const { data: response, error, status } = useSmSettingQuery();

  const [countries, setCountries] = useState<any>(null);
  const [dataCalcMethod, setDataCalcMethod] = useState<any>(null);
  const [loginAttemptLimit, setLoginAttemptLimit] = useState<any>(null);
  const [loginSuspensionLength, setLoginSuspensionLength] = useState<any>(null);
  const [maxAllowedSessionLength, setMaxAllowedSessionLength] = useState<any>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [updateSettings] = useUpdateSettingsMutation();
  const updateStallionMatchSettingsSchema = Yup.object().shape({
  });

  const defaultValues = {
    dataCalcMethod: '',
    loginAttemptLimit: '',
    loginSuspensionLength: '',
    maxAllowedSessionLength: '',
    countries: '',
  };
  const methods = useForm<any>({
    resolver: yupResolver(updateStallionMatchSettingsSchema),
    defaultValues,
  });

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  //saves the setting data to the database
  const onSubmit = async (data: any) => {
    try {
      const finalData = {
        settingData: [
          {
            smSettingKey: 'SM_DATA_CALC_METHOD',
            smSettingValue: dataCalcMethod,
          },
          {
            smSettingKey: 'SM_PORTAL_LOGIN_ATTEMPT_LIMIT',
            smSettingValue: loginAttemptLimit,
          },
          {
            smSettingKey: 'SM_ACCONT_SUSPENSION_LENGTH',
            smSettingValue: loginSuspensionLength,
          },
          {
            smSettingKey: 'SM_MAX_ALLOWED_SESSION_LENGTH',
            smSettingValue: maxAllowedSessionLength,
          },
        ],
        blockedCountries: [countries],
      };
      let res: any = await updateSettings(finalData);
      enqueueSnackbar('Settings Updated Successfully');
      if (res?.data) {
        setApiStatusMsg({ status: 201, message: '<b>invited data!</b>' });
        setApiStatus(true);
      }
      if (res?.error) {
        if (res?.error.status === 422) {
          setApiStatusMsg({ status: res?.error.status, message: res?.error.data.message });
          setApiStatus(true);
        }
      }
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }: any) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 346,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));
  const [cancelbtn, setCancelbtn] = useState(false);

  //updates the cancelbtn value
  const handelCancel = () => {
    setCancelbtn(!cancelbtn);
  };

  // resets the setting data by calling api when cancelbtn or response updated 
  React.useEffect(() => {
    setLoginSuspensionLength(
      response?.SM_ACCONT_SUSPENSION_LENGTH.find((res: any) => res.selected)?.id
    );
    setDataCalcMethod(response?.SM_DATA_CALC_METHOD.find((res: any) => res.selected)?.id);
    setMaxAllowedSessionLength(
      response?.SM_MAX_ALLOWED_SESSION_LENGTH.find((res: any) => res.selected)?.id
    );
    setLoginAttemptLimit(
      response?.SM_PORTAL_LOGIN_ATTEMPT_LIMIT.find((res: any) => res.selected)?.id
    );
    
    if (
      response?.countries.find(
        (res: any) => res.blackListFromAdminPortal === undefined || countries === 'none'
        )
        ) {
          setCountries('none');
    } else {
      setCountries(response?.countries.find((res: any) => res.blackListFromAdminPortal)?.id);
    }
    setIsChecked(false);
  }, [response, cancelbtn]);

  return (
    <>
      {/* Header sections */}
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />
      {/* Ends header content */}
      <Page
        title="Stallion Match Settings"
        sx={{ display: 'flex' }}
        className="SettingsDataDashboard"
      >
        {/* if there is no permission it showes unauthorized component else show Setting content */}
        {status === 'rejected' ? (
          <UnAuthorized />
        ) : (
          <>
            {/* Setting Page Main component  */}
            <Box className="MessageDataDashboardRight" sx={{ width: '100%' }} px={2}>
              <Container>
                <Stack direction="row" className="MainTitleHeader">
                  <Grid container mt={0}>
                    <Grid item lg={6} sm={6}>
                      <Typography variant="h6" className="MainTitle">
                        Stallion Match Settings
                      </Typography>
                    </Grid>
                  </Grid>
                </Stack>

                {/* Form Data component  */}
                <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                  <Box className="UserProfileData" mt={4}>
                    <Box className="form-group">
                      <Grid container className="userprofileform">
                        <Grid item xs={6} md={6}>
                          <Grid container spacing={1}>
                            <Grid item xs={12} md={12} className="userprofileitem">
                              <Typography variant="h4" className="ImportedHeader">
                                Data Calculation Method
                              </Typography>
                            </Grid>
                            <Grid item xs={8} md={8} className="userprofileitem">
                              
                              {/* Calculation method dropdown  */}
                              <Box className="edit-field">
                                <Select
                                  {...register(`dataCalcMethod`)}
                                  MenuProps={MenuProps}
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  className="filter-slct"
                                  onChange={(e: any) => setDataCalcMethod(e.target.value)}
                                  value={dataCalcMethod}
                                >
                                  <MenuItem className="selectDropDownList" value="none" disabled>
                                    <em>Select Calculation Method</em>
                                  </MenuItem>
                                  {response?.SM_DATA_CALC_METHOD?.map((res: any) => {
                                    return (
                                      <MenuItem
                                        className="selectDropDownList"
                                        value={res.id}
                                        key={res.id}
                                      >
                                        {res.name}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                                &nbsp;
                                <HtmlTooltip
                                  placement="right"
                                  className="tableTooltip boost-tooltip settings-tooltip "
                                  title={
                                    <React.Fragment>
                                      <Box className="tooltipPopoverBody">
                                        <p>
                                          Site wide stats configuration of runners based on country
                                          of race or country of birth of each runner.
                                        </p>
                                      </Box>
                                    </React.Fragment>
                                  }
                                >
                                  <i className="icon-Info-circle tooltip-table" />
                                </HtmlTooltip>
                              </Box>
                            </Grid>
                            <Grid item xs={4} md={4} className="userprofileitem"></Grid>

                            {/* Faild logins dropdown  */}
                            <Grid item xs={4} md={4} className="userprofileitem">
                              <Box className="edit-field">
                                <Select
                                  {...register(`loginAttemptLimit`)}
                                  MenuProps={MenuProps}
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  className="filter-slct"
                                  onChange={(e: any) => setLoginAttemptLimit(e.target.value)}
                                  value={loginAttemptLimit}
                                >
                                  <MenuItem className="selectDropDownList" value="none" disabled>
                                    <em># of Logins</em>
                                  </MenuItem>
                                  {response?.SM_PORTAL_LOGIN_ATTEMPT_LIMIT?.map((res: any) => {
                                    return (
                                      <MenuItem
                                        className="selectDropDownList"
                                        value={res.id}
                                        key={res.id}
                                      >
                                        {res.name}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </Box>
                            </Grid>
                            <Grid
                              item
                              xs={8}
                              md={8}
                              className="userprofileitem"
                              alignItems="center"
                              display="flex"
                            >
                              <Button
                                type="button"
                                className="link-btn"
                                sx={{
                                  marginLeft: '10px !important',
                                  color: '#1D472E !important',
                                  fontFamily: 'Synthese-Bold !important',
                                }}
                              >
                                Failed login # before suspending account
                              </Button>
                            </Grid>

                            {/* Account suspension length  */}
                            <Grid item xs={4} md={4} className="userprofileitem">
                              <Box className="edit-field">
                                <Select
                                  {...register(`loginSuspensionLength`)}
                                  MenuProps={MenuProps}
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  className="filter-slct"
                                  onChange={(e: any) => setLoginSuspensionLength(e.target.value)}
                                  value={loginSuspensionLength}
                                >
                                  <MenuItem className="selectDropDownList" value="none" disabled>
                                    <em> Duration(hrs)</em>
                                  </MenuItem>
                                  {response?.SM_ACCONT_SUSPENSION_LENGTH?.map((res: any) => {
                                    return (
                                      <MenuItem
                                        className="selectDropDownList"
                                        value={res.id}
                                        key={res.id}
                                      >
                                        {res.name}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </Box>
                            </Grid>
                            <Grid
                              item
                              xs={8}
                              md={8}
                              className="userprofileitem"
                              alignItems="center"
                              display="flex"
                            >
                              <Button
                                type="button"
                                className="link-btn"
                                sx={{
                                  marginLeft: '10px !important',
                                  color: '#1D472E !important',
                                  fontFamily: 'Synthese-Bold !important',
                                }}
                              >
                                Account suspension length (hrs)
                              </Button>
                            </Grid>

                            {/* Active Session length dropdown  */}
                            <Grid item xs={4} md={4} className="userprofileitem">
                              <Box className="edit-field">
                                <Select
                                  {...register(`maxAllowedSessionLength`)}
                                  MenuProps={MenuProps}
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  className="filter-slct"
                                  onChange={(e: any) => setMaxAllowedSessionLength(e.target.value)}
                                  value={maxAllowedSessionLength}
                                >
                                  <MenuItem className="selectDropDownList" value="none" disabled>
                                    <em>Duration(hrs)</em>
                                  </MenuItem>
                                  {response?.SM_MAX_ALLOWED_SESSION_LENGTH?.map((res: any) => {
                                    return (
                                      <MenuItem
                                        className="selectDropDownList"
                                        value={res.id}
                                        key={res.id}
                                      >
                                        {res.name}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </Box>
                            </Grid>
                            <Grid
                              item
                              xs={8}
                              md={8}
                              className="userprofileitem"
                              alignItems="center"
                              display="flex"
                            >
                              <Button
                                type="button"
                                className="link-btn"
                                sx={{
                                  marginLeft: '10px !important',
                                  color: '#1D472E !important',
                                  fontFamily: 'Synthese-Bold !important',
                                }}
                              >
                                Active session length (hrs)
                              </Button>
                            </Grid>

                            {/* Single sign on Switch  */}
                            <Grid item xs={12} md={12} className="userprofileitem">
                              <Box className="FormGroup" px={0} py={1}>
                                <RHFSwitch
                                  className="RHF-Switches"
                                  name="PreviouslyOrderedReports"
                                  labelPlacement="end"
                                  checked={isChecked}
                                  onClick={() => setIsChecked(!isChecked)}
                                  label={
                                    <>
                                      <Typography
                                        variant="h4"
                                        sx={{ marginLeft: '20px !important' }}
                                      >
                                        Single Sign On for all sessions as default
                                      </Typography>
                                    </>
                                  }
                                  sx={{ mx: 0, width: 1, mt: 0, justifyContent: 'space-between' }}
                                />
                              </Box>
                            </Grid>

                            {/* country dropdown  */}
                            <Grid item xs={5} md={5} className="userprofileitem">
                              <Box className="edit-field">
                                <Select
                                  {...register(`countries`)}
                                  MenuProps={{
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
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  className="countryDropdown filter-slct"
                                  onChange={(e: any) => setCountries(e.target.value)}
                                  defaultValue="none"
                                  value={countries}
                                  placeholder="Select Countries"
                                >
                                  <MenuItem
                                    className="selectDropDownList settingCountry"
                                    value="none"
                                    disabled
                                  >
                                    <em>Select Countries</em>
                                  </MenuItem>
                                  {response?.countries?.map((res: any) => {
                                    return (
                                      <MenuItem
                                        className="selectDropDownList settingCountry"
                                        value={res.id}
                                        key={res.id}
                                      >
                                        {res.countryName}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </Box>
                            </Grid>
                            <Grid
                              item
                              xs={7}
                              md={7}
                              className="userprofileitem"
                              alignItems="center"
                              display="flex"
                            >
                              <Button
                                type="button"
                                className="link-btn"
                                sx={{
                                  marginLeft: '10px !important',
                                  color: '#1D472E !important',
                                  fontFamily: 'Synthese-Bold !important',
                                }}
                              >
                                Country Black List for Admin Portal
                              </Button>
                            </Grid>

                            {/* Save and cancel button component  */}
                            <Grid item xs={12} md={12} mt={5} className="userprofileitem">
                              <Stack
                                spacing={3}
                                alignItems="start"
                                display="flex"
                                flexDirection="row"
                              >
                                <LoadingButton
                                  type="submit"
                                  className="search-btn"
                                  loading={isSubmitting}
                                >
                                  Save
                                </LoadingButton>
                                <Button
                                  type="button"
                                  onClick={handelCancel}
                                  className="search-btn-outline"
                                >
                                  Cancel
                                </Button>
                              </Stack>
                            </Grid>
                            {/* End Save and cancel button component  */}

                          </Grid>
                        </Grid>
                        <Grid item xs={5} md={5}></Grid>
                      </Grid>
                    </Box>
                  </Box>
                </FormProvider>
              </Container>
            </Box>
          </>
        )}
      </Page>
    </>
  );
}

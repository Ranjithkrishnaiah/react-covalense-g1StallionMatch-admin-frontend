import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { FormProvider, RHFSwitch, RHFTextField } from 'src/components/hook-form';
import { Stallion } from 'src/@types/stallion';
import * as Yup from 'yup';
// redux
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import {
  useFarmQuery,
  useAddFarmMutation,
  useEditFarmMutation,
} from 'src/redux/splitEndpoints/farmSplit';
import { useSnackbar } from 'notistack';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';
import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  FormControlLabel,
  CssBaseline,
  Drawer,
  Button,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  RadioGroup,
  Radio,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { RunnerEligibleWrapperDialog } from 'src/components/runner-modal/RunnerEligibleWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import DatePicker from 'src/components/DatePicker';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
// ----------------------------------------------------------------------
const drawerWidth = 654;
// DrawerHeader method
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));
// FormValuesProps type
type FormValuesProps = Stallion;
// Props type
type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

export default function PromoCodesNewEditModal(props: any) {
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
  } = props;
  const navigate = useNavigate();

  // close Drawer handler
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  // close modal handler
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  const theme = useTheme();
  const [addFarm] = useAddFarmMutation();
  const [editFarm] = useEditFarmMutation();
  const { enqueueSnackbar } = useSnackbar();

  const [expanded, setExpanded] = React.useState<string | false>(false);
  const [value] = React.useState<Date | null>(null);
  // handle change for datepicker
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // API call to get farm data
  const {
    data: farmData,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useFarmQuery(rowId, { skip: !isEdit });
  const currentFarm = farmData;

  // New Farm Schema for form
  const NewFarmSchema = Yup.object().shape({
    farmName: Yup.string().required('Farm Name is required'),
    countryId: Yup.number().required('country is required'),
    stateId: Yup.number().required('State is required'),
    website: Yup.string().required('Website is required'),
  });

  // defaultValues
  const defaultValues = React.useMemo(
    () => ({
      farmName: currentFarm?.farmName || '',
      countryId: currentFarm?.countryId || 0,
      stateId: currentFarm?.stateId || 0,
      website: currentFarm?.website || '',
      totalStallions: currentFarm?.totalStallions || 0,
      serviceFeeStatus: currentFarm?.serviceFeeStatus || 0,
      promoted: currentFarm?.promoted || 0,
      users: currentFarm?.users || 0,
      id: currentFarm?.id || '',
      received: currentFarm?.received || 0,
      sent: currentFarm?.sent || 0,
      isPromoted: currentFarm?.isPromoted || false,
      isActive: currentFarm?.isActive || false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm]
  );

  // methods for form
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
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

  // on edit and currentFarm available call this hook
  React.useEffect(() => {
    if (isEdit && currentFarm) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentFarm]);

  // on Submit form handler
  const onSubmit = async (data: FormValuesProps) => {
    try {
      const finalData = { ...data, countryId: parseInt(countryID) };
      isEdit ? await editFarm({ ...finalData, id: rowId }) : await addFarm(finalData);
      reset();
      enqueueSnackbar(isEdit ? 'Update success!' : 'Create success!');
    } catch (error) {}
  };

  const [countryID, setCountryID] = React.useState(
    currentFarm?.countryId > 0 ? currentFarm?.countryId : 0
  );
  const [isCountrySelected, setIsCountrySelected] = React.useState(
    currentFarm?.countryId > 0 ? true : false
  );

  // API call to get States By CountryId
  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: !isCountrySelected });
  const [openMergeFarmAccountsWrapper, setOpenMergeFarmAccountsWrapper] = useState(false);

  // close merge farms accounts popup
  const handleCloseMergeFarmAccountsWrapper = () => {
    setOpenMergeFarmAccountsWrapper(false);
  };

  const [openRunnerEligibleWrapper, setOpenRunnerEligibleWrapper] = useState(false);
  // close merge Runner Eligible popup
  const handleCloseRunnerEligibleWrapper = () => {
    setOpenRunnerEligibleWrapper(false);
  };

  return (
    // Drawer
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
      className="DrawerRightModal RaceEditModal"
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
        <DrawerHeader className="DrawerHeader">
          {/* close icon */}
          <IconButton
            className="closeBtn"
            onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}
          >
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>

        <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
          {/* Promo Codes form section */}
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box px={0} className="PromoCodesEditModal">
              <Typography variant="h4" className="ImportedHeader">
                Promo Codes
              </Typography>
              <Grid container spacing={1} mt={0} pt={0} className="RaceListModalBox">
                <Grid item xs={8} md={8} mt={0} className="racelistgroup">
                  <Grid container spacing={2} className="" sx={{ marginTop: '0px !important' }}>
                    <Grid item xs={5} md={5} mt={0} className="racelistgroup">
                      {/* ID */}
                      <Box className="FormGroup">
                        <RHFTextField name="ID" placeholder="ID" className="edit-field" />
                      </Box>
                    </Grid>
                    <Grid item xs={3} md={3} mt={0} className="racelistgroup"></Grid>
                    <Grid item xs={4} md={4} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        <RHFSwitch
                          checked
                          className="RHF-Switches"
                          name="Apprentice"
                          labelPlacement="start"
                          label={
                            <>
                              <Typography variant="h4" sx={{ m: 0 }}>
                                Active
                              </Typography>
                            </>
                          }
                          sx={{ mx: 0, width: 1, mt: 0, mb: 0, justifyContent: 'space-between' }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={12} mt={0} className="racelistgroup">
                    <Box className="FormGroup">
                      {/* Name */}
                      <RHFTextField name="Name" placeholder="Name" className="edit-field" />
                    </Box>
                  </Grid>
                </Grid>

                <Grid item xs={4} md={4} mt={0} className="racelistgroup RawDataGroup">
                  <Box className="FormGroup">
                    <List className="RawDataList" sx={{ padding: '0px', paddingBottom: '0px' }}>
                      <ListItem>
                        <ListItemText primary="Created:" secondary="02.12.2021" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Updated:" secondary="02.12.2021" />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Redemptions:" secondary=" 0" />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} mt={1} pt={0}>
                  <Typography variant="h4" className="">
                    Type*
                  </Typography>{' '}
                </Grid>
                <Grid
                  item
                  xs={5}
                  md={5}
                  mt={0}
                  pt={0}
                  className="promocodeRadio"
                  sx={{ alignItems: 'start' }}
                >
                  {/* radio group */}
                  <Box className="">
                    <RadioGroup
                      sx={{
                        paddingLeft: '5px',
                        paddingTop: '0px',
                      }}
                      className="RadioList"
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="PercentageDiscount"
                    >
                      <FormControlLabel
                        value="female"
                        control={<Radio />}
                        label="Percentage Discount"
                      />
                    </RadioGroup>
                    <RadioGroup
                      sx={{
                        paddingLeft: '5px',
                      }}
                      className="RadioList"
                      row
                      aria-labelledby="demo-row-radio-buttons-group-label"
                      name="FixedDiscount"
                    >
                      <FormControlLabel
                        value="female"
                        control={<Radio />}
                        label="Fixed $ Discount"
                      />
                    </RadioGroup>
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={0} pt={0} className="promocodeRadio">
                  <Grid container spacing={0.5}>
                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        {/* Name */}
                        <RHFTextField name="Name" placeholder="%" className="edit-field" />
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={6} mt={0} className="racelistgroup"></Grid>
                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        <Box className="edit-field">
                          {/* Currency */}
                          <Select
                            MenuProps={{
                              disableScrollLock: true,
                            }}
                            IconComponent={KeyboardArrowDownIcon}
                            className="filter-slct"
                            defaultValue="none"
                            name="expiredStallion"
                          >
                            <MenuItem className="selectDropDownList" value="none">
                              Currency
                            </MenuItem>
                            <MenuItem className="selectDropDownList" value="yes">
                              Nil
                            </MenuItem>
                            <MenuItem className="selectDropDownList" value="no">
                              Nil
                            </MenuItem>
                          </Select>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        {/* Price */}
                        <RHFTextField name="Name" placeholder="Price" className="edit-field" />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={6} md={6} mt={2} className="racelistgroup">
                  {/* Apply to specific products */}
                  <Box className="FormGroup">
                    <RHFSwitch
                      checked
                      className="RHF-Switches"
                      name="Apply"
                      labelPlacement="end"
                      label={
                        <>
                          <Typography
                            variant="h4"
                            sx={{
                              m: 0,
                              pl: 1,
                              fontWeight: '400 !important',
                              fontFamily: 'Synthese-Regular !important',
                              color: '#161716 !important',
                            }}
                          >
                            Apply to specific products
                          </Typography>
                        </>
                      }
                      sx={{ mx: 0, width: 1, mt: 0, mb: 0, justifyContent: 'inherit !important' }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={6} md={6} mt={2} className="racelistgroup">
                  <Box className="FormGroup">
                    {/* Select Product */}
                    <Box className="edit-field">
                      <Select
                        MenuProps={{
                          disableScrollLock: true,
                        }}
                        IconComponent={KeyboardArrowDownIcon}
                        className="filter-slct"
                        defaultValue="none"
                        name="expiredStallion"
                      >
                        <MenuItem className="selectDropDownList" value="none">
                          Select Product
                        </MenuItem>
                        <MenuItem className="selectDropDownList" value="yes">
                          Nil
                        </MenuItem>
                        <MenuItem className="selectDropDownList" value="no">
                          Nil
                        </MenuItem>
                      </Select>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                  <Typography variant="h4" className="">
                    Duration*
                  </Typography>
                </Grid>
                {/* Select Duration */}
                <Grid item xs={5} md={5} mt={1} className="racelistgroup">
                  <Box className="FormGroup" pr={6}>
                    <Box className="edit-field">
                      <Select
                        MenuProps={{
                          disableScrollLock: true,
                        }}
                        IconComponent={KeyboardArrowDownIcon}
                        className="filter-slct"
                        defaultValue="none"
                        name="expiredStallion"
                      >
                        <MenuItem className="selectDropDownList" value="none">
                          Select Duration
                        </MenuItem>
                        <MenuItem className="selectDropDownList" value="yes">
                          Forever
                        </MenuItem>
                        <MenuItem className="selectDropDownList" value="no">
                          Once
                        </MenuItem>
                        <MenuItem className="selectDropDownList" value="no">
                          Multiple{' '}
                        </MenuItem>
                      </Select>
                    </Box>
                  </Box>
                </Grid>
                {/* Select Duration ends */}

                <Grid item xs={7} md={7} mt={1} className="racelistgroup">
                  <Grid container spacing={1} mt={0}>
                    <Grid item xs={6} md={6} className="racelistgroup">
                      {/* placeholder="Enter Number" */}
                      <Box className="FormGroup">
                        <RHFTextField
                          name="Name"
                          placeholder="Enter Number"
                          className="edit-field"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={6} className="racelistgroup">
                      <Box className="FormGroup">
                        <Box className="edit-field">
                          <Select
                            MenuProps={{
                              disableScrollLock: true,
                            }}
                            IconComponent={KeyboardArrowDownIcon}
                            className="filter-slct"
                            defaultValue="none"
                            name="expiredStallion"
                          >
                            <MenuItem className="selectDropDownList" value="none">
                              Select
                            </MenuItem>
                            <MenuItem className="selectDropDownList" value="yes">
                              Nil
                            </MenuItem>
                            <MenuItem className="selectDropDownList" value="no">
                              Nil
                            </MenuItem>
                          </Select>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                  <Grid container spacing={5} mt={0}>
                    <Grid item xs={6} md={6} mt={0.5} className="racelistgroup">
                      <Typography variant="h4" className="" mb={1}>
                        Date Range Restrictions*
                      </Typography>
                      <Box className="FormGroup">
                        <Box className="calender-wrapper1">
                          {/* Date Range Restrictions* */}
                          <Box className="edit-field">
                            <DatePicker value={value} handleChange={handleChange} />
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6} md={6} mt={0.5} className="racelistgroup">
                      <Typography variant="h4" className="" mb={1}>
                        Max Redemtions
                      </Typography>
                      <Box className="FormGroup">
                        {/* Max Redemtions */}
                        <RHFTextField
                          name="Name"
                          placeholder="Max # Redemtions"
                          className="edit-field"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                  <Typography variant="h4" className="" mb={1}>
                    Restrict to Specific User
                  </Typography>
                  <Box className="FormGroup">
                    {/* Restrict to Specific User */}
                    <Box className="edit-field">
                      <Select
                        MenuProps={{
                          disableScrollLock: true,
                        }}
                        IconComponent={KeyboardArrowDownIcon}
                        className="filter-slct"
                        defaultValue="none"
                        name="expiredStallion"
                      >
                        <MenuItem className="selectDropDownList" value="none">
                          Restrict to specific user
                        </MenuItem>
                        <MenuItem className="selectDropDownList" value="yes">
                          Nil
                        </MenuItem>
                        <MenuItem className="selectDropDownList" value="no">
                          Nil
                        </MenuItem>
                      </Select>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '5px !important' }}>
                  <Stack sx={{ mt: 3 }} className="DrawerBtnWrapper">
                    {/* save and cancel buttons */}
                    <Grid container spacing={4} className="DrawerBtnBottom">
                      <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                        <LoadingButton
                          fullWidth
                          className="search-btn"
                          type="submit"
                          variant="contained"
                          loading={isSubmitting}
                        >
                          {!isEdit ? 'Save' : 'Save'}
                        </LoadingButton>
                      </Grid>
                      <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                        <Button fullWidth type="button" className="add-btn">
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </FormProvider>
          {/* Promo Codes form section ends */}
        </Box>

        {/* Runner Eligible WrapperDialog */}
        <RunnerEligibleWrapperDialog
          title="Are you sure?"
          open={openRunnerEligibleWrapper}
          close={handleCloseRunnerEligibleWrapper}
        />
        {/* Merge Farm Accounts WrapperDialog */}
        <MergeFarmAccountsWrapperDialog
          title="Merge Farm Accounts"
          open={openMergeFarmAccountsWrapper}
          close={handleCloseMergeFarmAccountsWrapper}
        />
      </Scrollbar>
    </Drawer>
  );
}

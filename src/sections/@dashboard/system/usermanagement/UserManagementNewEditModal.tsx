import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import photograph from 'src/assets/Images/Photograph.svg'
import { useNavigate } from 'react-router';
// form
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Autocomplete } from '@mui/material';
import {
  FormProvider,
  RHFSelect,
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
} from 'src/components/hook-form';
import './dropdown.css';

import { range } from "src/utils/formatYear";
import { fData } from 'src/utils/formatNumber';
import { Stallion } from 'src/@types/stallion';
import * as Yup from 'yup';
// redux
import { useDispatch, useSelector } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import { useCurrenciesQuery } from 'src/redux/splitEndpoints/currenciesSplit';
import { useFarmQuery, useAddFarmMutation, useEditFarmMutation } from 'src/redux/splitEndpoints/farmSplit'
import { useFeestatusQuery } from 'src/redux/splitEndpoints/feestatusSplit';
import { useRetiredReasonQuery } from 'src/redux/splitEndpoints/retiredReasonSplit';
import { useSnackbar } from 'notistack';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import Select from '@mui/material/Select';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MenuProps } from 'src/constants/MenuProps';
import CloseIcon from '@mui/icons-material/Close';


import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Switch,
  Typography,
  FormControlLabel,
  CssBaseline,
  Drawer,
  Link,
  Button,
  SelectChangeEvent,
  MenuItem,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { PATH_DASHBOARD } from 'src/routes/paths';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { CancelRefundWrapperDialog } from 'src/components/reports-modal/CancelRefundWrapper';
import { MergeFarmAccountsWrapperDialog } from 'src/components/farm-modal/MergeFarmAccountsWrapper';
import CustomDropzone from 'src/components/CustomDropzone';


import { Images } from "src/assets/images";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { useStallionAutocompleteQuery } from 'src/redux/splitEndpoints/stallionSplit';
import debounce from 'lodash.debounce';
import AutoCompleteTest from 'src/components/hook-form/AutoCompleteTest';
import { useAdminModuleAccessLevelQuery, useRoleQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { toPascalCase } from 'src/utils/customFunctions';
import { Checkbox } from '@mui/material';
import { TextField } from '@mui/material';
import DropdownTreeSelect from 'react-dropdown-tree-select';

// ----------------------------------------------------------------------


const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  background: '#FFFFFF',
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#C75227' : '#1D472E',
  },
}));


const BorderLinearProgress1 = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 5,
  background: '#FFFFFF',
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: theme.palette.mode === 'light' ? '#1D472E' : '#1D472E',
  },
}));

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


////////////////////////////////////
const drawerWidth = 997;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

type FormValuesProps = any;

type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

export default function UserManagementNewEditModal(props: any) {

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

  const handleDrawerClose = () => {
    handleEditPopup();
  };

  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
    reset();
  };


  const { data: countriesList } = useCountriesQuery();
  const { data: roleList } = useRoleQuery();
  const { data: adminAccessLevelList } = useAdminModuleAccessLevelQuery();
  const [moduleAccessData, setModuleAccessData] = useState([]);
  const treeDropdownRef = React.useRef<any>();

  useEffect(() => {
    let list: any = [];
    if (adminAccessLevelList) {
      adminAccessLevelList?.map((record: any) => {
        list.push({
          label: record.label,
          checked: false,
          children: record.children,
          id: record.id
        })
      })
      setModuleAccessData(list);
    }
  }, [adminAccessLevelList])

  const onChange = async (currentNode: any, selectedNodes: any) => {
    // console.log(currentNode, 'crr any', selectedNodes)
    if (selectedNodes.length === 0) {
      treeDropdownRef.current.searchInput.setAttribute('placeholder', 'Permission Settings');
    } else {
      treeDropdownRef.current.searchInput.setAttribute('placeholder', '  ');
    }
  }

  const onFocus = async () => {
    treeDropdownRef.current.searchInput.setAttribute('style', 'display:block');
  }
  // console.log(roleList, 'ROLE')
  const [state, setStateValue] = useState({
    permission: [],
    permissionRole: ''
  })
  const [roleId, setRoleId] = useState(0);

  const dispatch = useDispatch();

  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const { data: farmData, error, isFetching, isLoading, isSuccess } = useFarmQuery(rowId, { skip: (!isEdit) });
  const currentUser = farmData;

  const NewFarmSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    email: Yup.string().email().required('Email is required'),
    password: Yup.string().required('Password is required').min(8),
    countryId: Yup.number(),
    roleId: Yup.number(),
  });

  const defaultValues = React.useMemo(
    () => ({
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      password: currentUser?.password || '',
      countryId: currentUser?.countryId || 'none',
      roleId: currentUser?.roleId || 'none'
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUser]
  );

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
    register
  } = methods;

  const values = watch();

  React.useEffect(() => {
    if (isEdit && currentUser) {
      reset(defaultValues);
    }
    if (!isEdit) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, currentUser]);

  const onSubmit = async (data: FormValuesProps) => {
    // console.log(data, 'Form DATA')
    try {
      const finalData = { ...data }
      //console.log('Post Farm Data', finalData, 'country id', countryID);return false;
      // isEdit ? await editFarm({ ...finalData, id: rowId }) : await addFarm(finalData);
      // reset();
      // enqueueSnackbar(isEdit ? 'Update success!' : 'Create success!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDrop = React.useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      // console.log(file);
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

  const [countryID, setCountryID] = React.useState((currentUser?.countryId > 0) ? currentUser?.countryId : 0);
  const [isCountrySelected, setIsCountrySelected] = React.useState((currentUser?.countryId > 0) ? true : false);
  const handlecountryChange = (event: any) => {
    setCountryID(event.target.value);
    setIsCountrySelected(true);
  };
  //console.log('country ID', currentUser?.countryId, 'state ID', currentUser?.stateId, 'set country id', countryID, 'is set farm country', isCountrySelected);

  //, { skip: (!isCountrySelected) }
  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: (!isCountrySelected) });


  const [openCancelRefundWrapper, setOpenCancelRefundWrapper] = useState(false);

  const handleCloseCancelRefundWrapper = () => {
    setOpenCancelRefundWrapper(false);
  };

  const handleOpenCancelRefundWrapper = () => {
    setOpenCancelRefundWrapper(true);
  };



  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = null;
  const heroImages = {
    setFileUpload,
    fileDetails
  };

  const DropDownTreeSelect = useMemo(() => {
    return (
      <Box className='user-permission'>
      <DropdownTreeSelect
        data={moduleAccessData || []}
        className={'mdl-demo'}
        onChange={onChange}
        onFocus={onFocus}
        // onBlur={onBlur}
        texts={{ placeholder: 'Permission Settings' }}
        ref={treeDropdownRef}
        showDropdown='always'
      />
      </Box>
    );
  }, [moduleAccessData]);

  return (
    <Drawer
      sx={{
        width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open || openAddEditForm ? drawerWidth : 0,
          height: '100vh',
          // overflow: 'scroll',
          background: '#E2E7E1',
        },

        '.MuiInputBase-root-MuiOutlinedInput-root':
        {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      open={open || openAddEditForm}
      className='DrawerRightModal RaceEditModal userManagementEditModal'
    >
      <Scrollbar
        className='DrawerModalScroll'
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: "100vh",
            // overflow: "scroll",
            background: "#E2E7E1",
          },
        }}
      >
        <CssBaseline />
        <DrawerHeader className='DrawerHeader' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>

          <IconButton className='closeBtn' onClick={isEdit ? handleCloseModal : () => {handleDrawerCloseRow();reset()}}>
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
          {/* <Button type='button' className='ShareBtn'><i className='icon-Share'></i></Button> */}

        </DrawerHeader>

        <Box px={5} className="edit-section" sx={{ paddingTop: '0px !important' }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box px={0}>
              <Typography variant="h4" className='' mb={1}>User Details</Typography>
              <Grid container spacing={1} mt={0} pt={0} className='RaceListModalBox'>

                <Grid item xs={4.5} md={4.5} mt={0} className='racelistgroup'>

                  <Box className='FormGroup'>
                    <RHFTextField name="fullName" placeholder='Enter Full Name' className='edit-field' />
                  </Box>
                </Grid>
                <Grid item xs={4.5} md={4.5} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <RHFTextField name="email" placeholder='Enter Email Address' className='edit-field' />
                  </Box>
                </Grid>
                <Grid item xs={3} md={3} mt={0} className='racelistgroup'>

                  <Box className='FormGroup usermanagementlist' sx={{ marginLeft: '20px' }}>
                    <List className='RawDataList'>
                      <ListItem>
                        <ListItemText
                          primary="Joined:"
                          secondary="--"
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Last Active:"
                          secondary="--"
                          secondaryTypographyProps={{
                            paddingLeft: '15px !important'
                          }}
                        />
                      </ListItem>
                    </List>
                  </Box>
                </Grid>
                <Grid item xs={4.5} md={4.5} mt={0} className='racelistgroup '>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        value={getValues('countryId')}
                        onChange={(e: any) => setValue('countryId', e.target.value)}
                        defaultValue="none"
                        MenuProps={{
                          className: 'common-scroll-lock',

                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          ...MenuProps
                        }}
                        name="countryId"
                      >
                        <MenuItem className="selectDropDownList" value="none" disabled><em>Location</em></MenuItem>
                        {countriesList?.map(({ id, countryName }) => {
                          return (
                            <MenuItem className="selectDropDownList countryDropdownList lg" value={id} key={id}>
                              {countryName}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={7.5} md={7.5} mt={0} className='racelistgroup'>
                  <Box className='FormGroup usermanagementlist' sx={{ marginTop: '3px' }}>
                    <Box className='edit-field'>
                      <List className='RawDataList'>
                        <ListItem>
                          <ListItemText
                            secondary="192.254.254.78"
                          />
                        </ListItem>
                      </List>
                    </Box>
                  </Box>
                </Grid>
                {false && <Grid item xs={4.5} md={4.5} mt={0} className='racelistgroup'>
                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      {/* <TextField type={'password'} placeholder='Password' {...register("password", { pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/ })} /> */}
                      <RHFTextField name="password" placeholder='Password' className='' />
                    </Box>
                  </Box>
                </Grid>}

                {false && <Grid item xs={7.5} md={7.5} mt={0} className='racelistgroup'>
                  <Box className='FormGroup reset-password-usermng'>
                    <Box className='edit-field'>
                      <Button type='button' disableRipple disableElevation disableFocusRipple className='link-btn'>Reset Password</Button>
                    </Box>
                  </Box>
                </Grid>}

                <Grid item xs={12} md={12} mt={3} className='racelistgroup'>
                  <Typography variant="h4" className='' mb={1}>Permission Role</Typography>
                </Grid>
                <Grid item xs={4.5} md={4.5} mt={0} className='racelistgroup'>

                  <Box className='FormGroup'>
                    <Box className='edit-field'>
                      <Select
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        className="filter-slct"
                        value={getValues('roleId')}
                        onChange={(e: any) => setValue('roleId', e.target.value)}
                        defaultValue="none" name="roleId"
                        MenuProps={{
                          className: 'common-scroll-lock',

                          disableScrollLock: true,
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left"
                          },
                          ...MenuProps
                        }}
                      >
                        <MenuItem className="selectDropDownList" value="none" disabled><em>Select Permission Role</em></MenuItem>
                        {roleList?.map((v: any, i: any) => {
                          return (
                            <MenuItem className="selectDropDownList" key={v.Id} value={v.Id}>{v.RoleName}</MenuItem>
                          )
                        })}
                      </Select>
                    </Box>
                  </Box>
                </Grid>

                {false && <Grid item xs={1.5} md={1.5} mt={0} className='racelistgroup sso-switch'>
                  <Box className='FormGroup' px={1}>
                    <RHFSwitch
                      checked
                      className='RHF-Switches'
                      name="SSO"
                      labelPlacement="start"
                      disabled
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
                </Grid>}

                <Grid item xs={12} md={12} mt={3} className='racelistgroup'>
                  <Typography variant="h4" className='' mb={1}>Permissions</Typography>
                  <Box className='FormGroup'>
                    <Box className="edit-field">
                      {/* <AutoCompleteTest

                        name="horseMultiple"
                        rules=""
                        placeholder="Permission Settings"
                        labelName=""
                        //   options={stallionOption}
                        options=""
                        getOptionLabel={(option: any) => option?.horseName || ''}
                        optionName="horseName" handleStallionInput={undefined}
                      //   handleStallionInput={debouncedChangeHandlerStallion} 

                      /> */}

                      {/* <Autocomplete
                        id="checkboxes-tags-demo"
                        options={adminAccessLevelList || []}
                        // defaultValue={defaultList}
                        filterSelectedOptions
                        popupIcon={<KeyboardArrowDownRoundedIcon />}
                        ChipProps={{ deleteIcon: <CloseIcon /> }}
                        disablePortal
                        multiple
                        disableCloseOnSelect
                        // onInputChange={(e) => setInputValue(e)}
                        className="AutoCompleteBox"
                        sx={{ margin: '0px', padding: '0px' }}
                        getOptionLabel={(option: any) => `${toPascalCase(option?.fullName)?.toString()}`}
                        onChange={(e: any, selectedOptions: any) => {
                          console.log(selectedOptions, 'selectedOptions')
                          let arr: any = [];
                          selectedOptions?.map((record: any) => {
                            arr.push(record);
                          });
                          setStateValue({
                            ...state,
                            permission: arr
                          })
                        }}
                        renderOption={(props: any, option: any, { selected }) => {
                          return (
                            <li {...props}>
                              <span className='autocompleteTitle'>
                                {toPascalCase(option?.fullName)?.toString()}
                              </span>
                              <Checkbox
                                checkedIcon={<img src={Images.checked} />}
                                icon={<img src={Images.unchecked} />}
                                style={{ marginRight: 0 }}
                                checked={selected}
                              />
                            </li>
                          );
                        }}
                        renderInput={(params: any) => (
                          <TextField {...params} placeholder={'Permission Settings'} />
                        )}
                      /> */}
                      <Box className="SDmultiselect CountrySDmultiselect">{DropDownTreeSelect}</Box>

                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={12} sx={{ paddingTop: '0px !important' }}>
                  <Stack sx={{ mt: 10}} className='DrawerBtnWrapper'>
                    <Grid container spacing={4} className='DrawerBtnBottom'>
                      <Grid item xs={4} md={4} sx={{ paddingTop: '10px !important' }}>
                        <LoadingButton fullWidth className='search-btn' type="submit" variant="contained" loading={isSubmitting}>
                          {!isEdit ? 'Save' : 'Save'}
                        </LoadingButton>

                      </Grid>
                      <Grid item xs={4} md={4} sx={{ paddingTop: '10px !important' }}>
                        <Button fullWidth type='button' className='add-btn' onClick={ () => {handleDrawerCloseRow();reset()}}>Cancel</Button>
                      </Grid>
                    </Grid>
                  </Stack>

                </Grid>
              </Grid>
            </Box>
          </FormProvider>
        </Box>
        <CancelRefundWrapperDialog title="Are you sure?" open={openCancelRefundWrapper} close={handleCloseCancelRefundWrapper} />

      </Scrollbar>
    </Drawer>
  );
}

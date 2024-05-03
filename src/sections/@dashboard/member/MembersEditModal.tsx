import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import { useEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import {
  Box,
  Grid,
  Stack,
  Typography,
  FormControlLabel,
  CssBaseline,
  Button,
  MenuItem,
  TextField,
  Select,
  ListItemText,
  Checkbox,
} from '@mui/material';
import Switch, { SwitchProps } from '@mui/material/Switch';
import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { range } from '../../../utils/formatYear';
import { LoadingButton } from '@mui/lab';
import { useSnackbar } from 'notistack';
import { Member } from '../../../@types/member';
import {
  useEditMemberMutation,
  useMemberQuery,
  useGetMemberRecentorderQuery,
  useMemberStatusQuery,
  useMemberRecentOrdersQuery,
} from 'src/redux/splitEndpoints/memberSplit';
import Scrollbar from 'src/components/Scrollbar';
import { usePaymentmethodsQuery } from 'src/redux/splitEndpoints/paymentmethodsSplit';
import { useSociallinksQuery } from 'src/redux/splitEndpoints/socialLinksSplit';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { MergeMemberAccountsWrapperDialog } from 'src/components/member-modal/MergeMemberAccountsWrapper';
import React from 'react';
import AutocompleteMultiSelectChip from 'src/components/AutocompleteMultiSelectChip';
import { useFarmAccessLevelQuery } from 'src/redux/splitEndpoints/farmAccessLevelSplit';
import { toPascalCase } from 'src/utils/customFunctions';
import { CustomSelect } from 'src/components/CustomSelect';
import { useMemberFavMareQuery, useMemberFavouriteBroodmareSireQuery, useMemberFavouriteFarmQuery, useMemberFavouriteStallionQuery, useMemberLinkedFarmQuery } from 'src/redux/splitEndpoints/stallionsSplit';
import { Images } from 'src/assets/images';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PATH_DASHBOARD } from 'src/routes/paths';

// Set filter sidebar width
const drawerWidth = 354;

// Set filter sidebar header style
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

type FormValuesProps = Member;

type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

// Set Switch style
const IOSSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 46,
  height: 24,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: '0px 1px 0px',
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(20px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#1D472E',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },  
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 20,
    height: 20,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#B0B6AF' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

export default function MembersEditModal(props: any) {
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

  // initial state of userModuleAccessAddBtn
  const [userModuleAccessAddBtn, setUserModuleAccessAddBtn] = useState({
    member_edit: false,
    member_merge: false,
    member_resend: false,
    member_reset: false,
  });
  // call on valuesExist
  React.useEffect(() => {
    setUserModuleAccessAddBtn({
      ...userModuleAccessAddBtn,
      member_edit: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_EDIT_MEMBER_DETAILS') ? false : true,
      member_merge: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_MERGE_USERS') ? false : true,
      member_resend: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_RESEND_VERIFICATION_EMAIL') ? false : true,
      member_reset: !valuesExist?.hasOwnProperty('MEMBER_ADMIN_RESET_PASSWORD') ? false : true,
    });
  }, [valuesExist]);

  // Get all country list
  const { data: countriesList } = useCountriesQuery();

  // Patch member api call
  const [editMember] = useEditMemberMutation();

  // Get member by id api call
  const { data, error, isFetching, isLoading, isSuccess } = useMemberQuery(rowId, {
    skip: !isEdit,
    refetchOnMountOrArgChange: true,
  });

  // Get Get Member Recent order api call
  const { data: memberRecentOrderList } = useGetMemberRecentorderQuery(rowId, {
    skip: !isEdit,
    refetchOnMountOrArgChange: true,
  });

  // Get all Payment methods api call
  const { data: paymentMethodsData } = usePaymentmethodsQuery();

  // Get all Member Status api call
  const { data: memberStatusList } = useMemberStatusQuery();

  // Get all Social links api call
  const { data: socialLinksData } = useSociallinksQuery();

  // Get all Member Favourite Mares api call
  const { data: mares, isSuccess: isMareSuccess, isFetching: isMareFetching } = useMemberFavMareQuery(data?.memberUuid, {
    skip: (data?.memberUuid === undefined || isEdit === false), refetchOnMountOrArgChange: true
  });

  // Get all Member Favourite Stallion api call
  const { data: stallions, isSuccess: isStallionSuccess, isFetching: isStallionFetching } = useMemberFavouriteStallionQuery(
    data?.memberUuid,
    { skip: (data?.memberUuid === undefined || isEdit === false), refetchOnMountOrArgChange: true }
  );

  // Get all Member Favourite BrrodmareSire api call
  const { data: sires, isSuccess: isBrrodmareSireSuccess, isFetching: isBrrodmareSireFetching } = useMemberFavouriteBroodmareSireQuery(
    data?.memberUuid,
    { skip: (data?.memberUuid === undefined || isEdit === false), refetchOnMountOrArgChange: true }
  );

  // Get all Member Favourite Farm api call
  const { data: farms, isSuccess: isFarmSuccess, isFetching: isFarmFetching } = useMemberFavouriteFarmQuery(data?.memberUuid,
    { skip: (data?.memberUuid === undefined || isEdit === false), refetchOnMountOrArgChange: true }
  );

  // Get all MemberFavouriteStallion api call
  const { data: linkedfarms, isSuccess: isLinkedFarmSuccess, isFetching: isLinkedFarmFetching } = useMemberLinkedFarmQuery(
    data?.memberUuid,
    { skip: (data?.memberUuid === undefined || isEdit === false), refetchOnMountOrArgChange: true }
  );

  // Get member recent-orders by id api call
  const recentOrdersPayload = {
    id: rowId,
    order: 'DESC',
    page: 1,
    limit: 20,
  };
  const { data: recentOrdersdata } = useMemberRecentOrdersQuery(recentOrdersPayload, {
    skip: !isEdit,
  });

  // Get all Farm AccessLevel api call
  const { data: selectaccesslevel } = useFarmAccessLevelQuery();
  const [expanded, setExpanded] = useState<string | false>(false);

  // expand or hide accordian
  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const NewMemberSchema = Yup.object().shape({
    fullName: Yup.string().required('Member Name is required'),
    email: Yup.string().required('Email is required').email('Invalid email address'),
    countryId: Yup.string().required('Country is required'),
    // address: Yup.string().required('Address is required'),
  
  });

  // Create set state for linked farm, my mares, my stallions, my BroodmareSires, my farms and my PreferenceCentre
  const [linkedFarms, setLinkedFarms] = useState([]);
  const [myMares, setMyMares] = useState([]);
  const [myStallions, setMyStallions] = useState([]);
  const [myBroodmareSires, setMyBroodmareSires] = useState([]);
  const [myFarms, setMyFarms] = useState([]);
  const [myPreferenceCentre, setMyPreferenceCentre] = useState([]);

  const [myPreSelectedMares, setPreSelectedMyMares] = useState<any>([]);
  const [myUnSelectedMares, setMyUnSelectedMyMares] = useState<any>([]);

  const [myPreSelectedStallion, setPreSelectedMyStallion] = useState<any>([]);
  const [myUnSelectedStallion, setMyUnSelectedMyStallion] = useState<any>([]);

  const [myPreSelectedBrrodmareSire, setPreSelectedBrrodmareSire] = useState<any>([]);
  const [myUnSelectedBrrodmareSire, setMyUnSelectedBrrodmareSire] = useState<any>([]);

  const [myPreSelectedFarms, setPreSelectedFarms] = useState<any>([]);
  const [myUnSelectedFarms, setMyUnSelectedFarms] = useState<any>([]);

  const [myPreSelectedLinkedFarms, setPreSelectedLinkedFarms] = useState<any>([]);
  const [myUnSelectedLinkedFarms, setMyUnSelectedLinkedFarms] = useState<any>([]);

  useEffect(() => {
    if (isMareSuccess) {
      setPreSelectedMyMares(mares?.map((v: any) => v.horseId));
    }
  }, [mares, isMareFetching])

  useEffect(() => {
    if (isStallionSuccess) {
      setPreSelectedMyStallion(stallions?.map((v: any) => v.stallionId));
    }
  }, [stallions, isStallionFetching])

  useEffect(() => {
    if (isBrrodmareSireSuccess) {
      setPreSelectedBrrodmareSire(sires?.map((v: any) => v.horseId));
    }
  }, [sires, isBrrodmareSireFetching])

  useEffect(() => {
    if (isFarmSuccess) {
      setPreSelectedFarms(farms?.map((v: any) => v.farmId));
    }
  }, [farms, isFarmFetching])

  useEffect(() => {
    if (isLinkedFarmSuccess) {
      setPreSelectedLinkedFarms(linkedfarms?.map((v: any) => v.farmId));
    }
  }, [linkedfarms, isLinkedFarmFetching])

  // linkedfarms, isSuccess: isLinkedFarmSuccess, isFetching: isLinkedFarmFetching
  // console.log(myPreSelectedStallion, 'myPreSelectedStallion')
  // console.log(myUnSelectedStallion, 'myPreSelectedStallion myUnSelectedMares')

  const defaultValues = useMemo(
    () => ({
      fullName: data?.fullName || '',
      email: data?.email || '',
      countryId: data?.countryId || 'none',
      address: data?.address || '',
      isVerified: data?.isVerified || false,
      sso: data?.sso || false,
      statusId: data?.statusId || '',
      socialLinkId: data?.socialLinkId || 'none',
      paymentMethodId: data?.paymentMethodId || 'none',
      accessLevel: data?.accessLevel || '',
      id: data?.id || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  useEffect(() => {
    if (isEdit && data) {
      reset(defaultValues);
      setMyUnSelectedMyMares([]);
      setMyUnSelectedMyStallion([]);
      setMyUnSelectedBrrodmareSire([]);
      setMyUnSelectedFarms([]);
    }
    if (!isEdit) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, data]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewMemberSchema),
    mode: 'onTouched',
    // defaultValues,
  });

  const {
    register,
    reset,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    formState: { isSubmitting, errors},
  } = methods;

  // Reset and close the member modal
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  
  
  
  // Patch api call based on save button clicked and display toaster message
  const onSubmit = async (data: any) => {
    try {
      let finalData = {
        ...data,
        linkedFarms: myUnSelectedLinkedFarms.length > 0 ? myUnSelectedLinkedFarms?.map((v: any) => { return { "farmId": v } }) : null,
        stallions: myUnSelectedStallion.length > 0 ? myUnSelectedStallion?.map((v: any) => { return { "stallionId": v } }) : null,
        myMares: myUnSelectedMares.length > 0 ? myUnSelectedMares?.map((v: any) => { return { "horseId": v } }) : null,
        broodmareSires: myUnSelectedBrrodmareSire.length > 0 ? myUnSelectedBrrodmareSire?.map((v: any) => { return { "horseId": v } }) : null,
        socialLinkId: data.socialLinkId !== 'none' ? data.socialLinkId : null,
        paymentMethodId: data.paymentMethodId !== 'none' ? data.paymentMethodId : null,
        // countryId: data.countryId !== 'none' ? data.countryId : null,
        countryId: !isNaN(data.countryId) ? parseInt(data.countryId) : null,
        accessLevel: data.accessLevel !== 'none' ? data.accessLevel : null,
        statusId: data.statusId !== '' ? data.statusId : null,
        myfarms: myUnSelectedFarms.length > 0 ? myUnSelectedFarms?.map((v: any) => { return { "farmId": v } }) : null,
        preferedCenter: myPreferenceCentre.length > 0 ? myPreferenceCentre : null,
      };
      delete finalData.recentOrders;
      delete finalData.accessLevel;
      let res: any = await editMember({ ...finalData, id: rowId });

      if (res?.data) {
        setApiStatusMsg({ status: 201, message: '<b>Member data successfully updated</b>' });
        setApiStatus(true);
      }
      if (res?.error) {
        if (res?.error.status === 422) {
          setApiStatusMsg({
            status: res?.error.status,
            message: '<b>There was a problem updating the member.</b>',
          });
          setApiStatus(true);
        }
      }
      reset();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  const [openMergeMemberAccountsWrapper, setOpenMergeMemberAccountsWrapper] = useState(false);

  // close merge member modal
  const handleCloseMergeMemberAccountsWrapper = () => {
    setOpenMergeMemberAccountsWrapper(false);
  };

  // Open merge member modal
  const handleOpenMergeMemberAccountsWrapper = () => {
    setOpenMergeMemberAccountsWrapper(true);
  };

  // Set the style for selectbox used in form
  const ITEM_HEIGHT = 35;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-1px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  };
  const locationProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        boxShadow: 'none',
        marginTop: '-2px',
        marginRight: '2px',
        border: 'solid 1px #161716',
        borderRadius: '0 0 6px 6px',
        boxSizing: 'border-box',
      },
    },
  }

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

        '.MuiInputBase-root-MuiOutlinedInput-root': {
          height: 'auto !important',
        },
      }}
      variant="persistent"
      anchor="right"
      className="filter-section DrawerRightModal members-rightbar"
      open={open || openAddEditForm}
    >
      <Scrollbar
        className="DrawerModalScroll"
        sx={{
          width: (isEdit && open) || openAddEditForm ? drawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: open || openAddEditForm ? drawerWidth : 0,
            height: '100vh',
            // overflow: "scroll",
            background: '#E2E7E1',
          },
        }}
      >
        <CssBaseline />
        <DrawerHeader className="member-header">
          <IconButton
            className="closeBtn"
            onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}
          >
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
          <Box>
            <Typography variant="h3">Member Details</Typography>
          </Box>
        </DrawerHeader>
        {isSuccess && userModuleAccessAddBtn.member_edit === false && <UnAuthorized />}
        {(isSuccess && userModuleAccessAddBtn.member_edit === true) && (        
          <Box px={5} className="edit-section" sx={{ paddingTop: 'px !important' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box px={0} mt={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Box>
                      <Box className="FormGroup" sx={{ marginBottom: '0px !important' }}>
                        <TextField
                          {...register("fullName")}
                          placeholder="Name"
                          name="fullName"
                          className="edit-field"
                          defaultValue={data?.fullName}
                        />
                        {errors.fullName && (
                        <div className="errorMsg">{errors.fullName.message}</div>
                        )}
                        <TextField
                          {...register("email")}
                          name="email"
                          placeholder="Email Address"
                          className="edit-field"
                          defaultValue={data?.email}
                        />
                        {errors.email && (
                        <div className="errorMsg">{errors.email.message}</div>
                        )}
                        
                        <Box className="edit-field">
                          <Select
                            {...register('countryId')}
                            name="countryId"
                            IconComponent={KeyboardArrowDownRoundedIcon}
                            defaultValue={data?.countryId > 0 ? data?.countryId : ''}
                            className="countryDropdown filter-slct"
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
                              ...MenuPropss,
                            }}
                          >
                            <MenuItem
                              className="selectDropDownList countryDropdownList mem-country"
                              value={''}
                              disabled
                            >
                              <em>Country</em>
                            </MenuItem>
                            {countriesList?.map(({ id, countryName }) => {
                              return (
                                <MenuItem
                                  className="selectDropDownList countryDropdownList mem-country"
                                  value={id}
                                  key={id}
                                >
                                  {countryName}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </Box>
                        {errors.countryId && (
                        <div className="errorMsg">{errors.countryId.message}</div>
                        )}
                        <TextField
                          {...register('address')}
                          name="address"
                          placeholder="Address"
                          className="edit-field"
                          defaultValue={data?.address}
                        />
                        {/* {errors.address && (
                        <div className="errorMsg">{errors.address.message}</div>
                        )} */}
                        <Box className="edit-field IosSwitches-Common">
                          {isFetching === false && (
                            <FormControlLabel
                              control={
                                <IOSSwitch defaultChecked={data?.isVerified ? true : false} />
                              }
                              label={
                                <>
                                  <Typography variant="h4" sx={{ mb: 0.5 }}>
                                    Verified Account
                                  </Typography>
                                </>
                              }
                              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                              {...register(`isVerified`)}
                              labelPlacement="start"
                            />
                          )}
                          {/* <FormControlLabel
                            control={<IOSSwitch defaultChecked={data?.sso ? true : false} />}
                            label={
                              <>
                                <Typography variant="h4" sx={{ mb: 0.5 }}>
                                  SSO
                                </Typography>
                              </>
                            }
                            sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
                            {...register(`sso`)}
                            labelPlacement="start"
                          /> */}
                        </Box>
                        

                        <Box className="edit-field" pt={0} pb={0}>
                          {isFetching === false && <Select
                            {...register(`statusId`)}
                            IconComponent={KeyboardArrowDownRoundedIcon}
                            defaultValue={data?.statusId > 0 ? data?.statusId : ''}
                            className="filter-slct"
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
                              ...MenuPropss,
                            }}
                          >
                            <MenuItem className="selectDropDownList" value={'none'} disabled>
                              <em>Status</em>
                            </MenuItem>
                            {memberStatusList?.map((value: any) => {
                              return (
                                <MenuItem
                                  className="selectDropDownList"
                                  value={value.id}
                                  key={value.id}
                                >
                                  {value.statusName}
                                </MenuItem>
                              );
                            })}
                          </Select>}
                        </Box>
                      </Box>
                      <Box className="FormGroup">
                        <Accordion
                          defaultExpanded={true}
                          onChange={handleChange('panel1')}
                          className="accordionDrawer"
                        >
                          <AccordionSummary
                            expandIcon={<KeyboardArrowDownRoundedIcon />}
                            aria-controls="panel4bh-content"
                            id="panel4bh-header"
                          >
                            <Typography variant="h4" sx={{ flexShrink: 0 }}>
                              Connected
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box className="edit-field">
                              <Select
                                {...register(`socialLinkId`)}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                defaultValue={data?.socialLinkId ? data?.socialLinkId : 'none'}
                                className="filter-slct"
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
                                  ...MenuPropss,
                                }}
                              >
                                <MenuItem className="selectDropDownList" value={'none'} disabled>
                                  <em>Social Links</em>
                                </MenuItem>
                                {socialLinksData?.map(({ id, socialLinkName }) => {
                                  return (
                                    <MenuItem className="selectDropDownList" value={id} key={id}>
                                      {socialLinkName}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </Box>

                            <Box className="edit-field">
                              <Select
                                {...register(`paymentMethodId`)}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                defaultValue={
                                  data?.paymentMethodId ? data?.paymentMethodId : 'none'
                                }
                                className="filter-slct"
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
                                  ...MenuPropss,
                                }}
                              >
                                <MenuItem className="selectDropDownList" value={'none'} disabled>
                                  <em>Payment Methods</em>
                                </MenuItem>
                                {paymentMethodsData?.map(({ id, paymentMethod }) => {
                                  return (
                                    <MenuItem className="selectDropDownList" value={id} key={id}>
                                      {toPascalCase(paymentMethod)}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </Box>

                            <Box className="edit-field">
                              <AutocompleteMultiSelectChip
                                placeholder={'PreferenceCentre'}
                                memberId={data?.memberUuid}
                                myPreferenceCentre={myPreferenceCentre}
                                setMyPreferenceCentre={setMyPreferenceCentre}
                              />
                            </Box>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion
                          defaultExpanded={true}
                          onChange={handleChange('panel2')}
                          className="accordionDrawer"
                        >
                          <AccordionSummary
                            expandIcon={<KeyboardArrowDownRoundedIcon />}
                            aria-controls="panel4bh-content"
                            id="panel4bh-header"
                          >
                            <Typography variant="h4" sx={{ flexShrink: 0 }}>
                              Stallion Match
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box className="edit-field">
                              {/* <AutocompleteMultiSelectChip
                                placeholder={'Linkedfarms'}
                                memberId={data?.memberUuid}
                                linkedFarms={linkedFarms}
                                setLinkedFarms={setLinkedFarms}
                              /> */}

                              <CustomSelect
                                className="selectDropDownBox"
                                fullWidth
                                sx={{ mb: '1rem' }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                MenuProps={{
                                  disableScrollLock: true,
                                  ...locationProps}}
                                // defaultValue={'none'}
                                displayEmpty
                                multiple
                                value={myPreSelectedLinkedFarms ? myPreSelectedLinkedFarms : []}
                                onChange={(e: any) => {
                                  let currentList = e.target.value;
                                  let allList = linkedfarms?.map((v: any) => v.farmId);
                                  setPreSelectedLinkedFarms(e.target.value);
                                  let list: any = [];
                                  allList?.map((v: any) => {
                                    let removedIds = currentList?.includes(v);
                                    if (!removedIds) {
                                      list.push(v);
                                    }
                                  })
                                  setMyUnSelectedLinkedFarms(list);
                                  // console.log(list, 'RRRR123')
                                }}
                                renderValue={(selected: any) => {
                                  if (selected?.length === 0) {
                                    return <em>Linked farm</em>;
                                  }
                                  return <em>View Linked farm</em>;
                                }}
                              >
                                <MenuItem className="selectDropDownList mobileCountryList" value="none" disabled>
                                  <em>Linked farm</em>
                                </MenuItem>
                                {linkedfarms?.map((v: any) => (
                                  <MenuItem className="selectDropDownList mobileCountryList memberListDropDown" value={v.farmId} key={v.farmId}>
                                    {/* {v.label} */}
                                    <ListItemText primary={`${toPascalCase(v.farmName)} (${v.accessLevel})`} />
                                    {/* <Checkbox checked={getValues('stallionLocation')?.indexOf(v.countryId) > -1} /> */}
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={myPreSelectedLinkedFarms?.indexOf(v?.farmId) > -1}
                                      disableRipple
                                    />
                                  </MenuItem>
                                ))}
                              </CustomSelect>
                             
                            </Box>
                            <Box className="edit-field">
                              {!isFetching && (
                                <Select
                                  {...register(`accessLevel`)}
                                  defaultValue={data?.accessLevel ? data?.accessLevel : 'none'}
                                  IconComponent={KeyboardArrowDownRoundedIcon}
                                  className="filter-slct"
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
                                    ...MenuPropss,
                                  }}
                                >
                                  <MenuItem className="selectDropDownList" value={'none'} disabled>
                                    <em>Access Level</em>
                                  </MenuItem>
                                  {selectaccesslevel?.map(({ id, accessName }) => {
                                    return (
                                      <MenuItem
                                        className="selectDropDownList countryDropdownList accessList"
                                        value={id}
                                        key={id}
                                      >
                                        {accessName}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              )}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                        <Accordion
                          defaultExpanded={true}
                          onChange={handleChange('panel3')}
                          className="accordionDrawer"
                        >
                          <AccordionSummary
                            expandIcon={<KeyboardArrowDownRoundedIcon />}
                            aria-controls="panel4bh-content"
                            id="panel4bh-header"
                          >
                            <Typography variant="h4" sx={{ flexShrink: 0 }}>
                              My Lists
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails className="myList-block">
                            <Box className="edit-field">
                              {/* <AutocompleteMultiSelectChip
                                placeholder={'Mares'}
                                memberId={data?.memberUuid}
                                myMares={myMares}
                                setMyMares={setMyMares}
                              /> */}
                              <CustomSelect
                                className="selectDropDownBox"
                                fullWidth
                                sx={{ mb: '1rem' }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                MenuProps={{disableScrollLock: true,
                                  ...locationProps}}
                                // defaultValue={'none'}
                                displayEmpty
                                multiple
                                value={myPreSelectedMares ? myPreSelectedMares : []}
                                onChange={(e: any) => {
                                  let currentList = e.target.value;
                                  let allList = mares?.map((v: any) => v.horseId);
                                  setPreSelectedMyMares(e.target.value);
                                  let list: any = [];
                                  allList?.map((v: any) => {
                                    let removedIds = currentList?.includes(v);
                                    if (!removedIds) {
                                      list.push(v);
                                    }
                                  })
                                  setMyUnSelectedMyMares(list);
                                  // console.log(list, 'RRRR123')
                                }}
                                renderValue={(selected: any) => {
                                  if (selected?.length === 0) {
                                    return <em>Select My mares</em>;
                                  }
                                  return <em>View Selected My mares</em>;
                                }}
                              >
                                <MenuItem className="selectDropDownList mobileCountryList" value="none" disabled>
                                  <em>Select My Mare</em>
                                </MenuItem>
                                {mares?.map((v: any) => (
                                  <MenuItem className="selectDropDownList mobileCountryList memberListDropDown" value={v.horseId} key={v.horseId}>
                                    {/* {v.label} */}
                                    <ListItemText primary={toPascalCase(v.horseName)} />
                                    {/* <Checkbox checked={getValues('stallionLocation')?.indexOf(v.countryId) > -1} /> */}
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={myPreSelectedMares?.indexOf(v?.horseId) > -1}
                                      disableRipple
                                    />
                                  </MenuItem>
                                ))}
                              </CustomSelect>
                            </Box>

                            <Box className="edit-field">
                              {/* <AutocompleteMultiSelectChip
                                placeholder={'Stallions'}
                                memberId={data?.memberUuid}
                                myStallions={myStallions}
                                setMyStallions={setMyStallions}
                              /> */}
                              <CustomSelect
                                className="selectDropDownBox"
                                fullWidth
                                sx={{ mb: '1rem' }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                MenuProps={{disableScrollLock: true,
                                  ...locationProps}}
                                // defaultValue={'none'}
                                displayEmpty
                                multiple
                                value={myPreSelectedStallion ? myPreSelectedStallion : []}
                                onChange={(e: any) => {
                                  let currentList = e.target.value;
                                  let allList = stallions?.map((v: any) => v.stallionId);
                                  setPreSelectedMyStallion(e.target.value);
                                  let list: any = [];
                                  allList?.map((v: any) => {
                                    let removedIds = currentList?.includes(v);
                                    if (!removedIds) {
                                      list.push(v);
                                    }
                                  })
                                  setMyUnSelectedMyStallion(list);
                                  // console.log(list, 'RRRR123')
                                }}
                                renderValue={(selected: any) => {
                                  if (selected?.length === 0) {
                                    return <em>Select My Stallions</em>;
                                  }
                                  return <em>View Selected Stallions</em>;
                                }}
                              >
                                <MenuItem className="selectDropDownList mobileCountryList" value="none" disabled>
                                  <em>Select Stallion</em>
                                </MenuItem>
                                {stallions?.map((v: any) => (
                                  <MenuItem className="selectDropDownList mobileCountryList memberListDropDown" value={v.stallionId} key={v.stallionId}>
                                    {/* {v.label} */}
                                    <ListItemText primary={toPascalCase(v.horseName)} />
                                    {/* <Checkbox checked={getValues('stallionLocation')?.indexOf(v.countryId) > -1} /> */}
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={myPreSelectedStallion?.indexOf(v?.stallionId) > -1}
                                      disableRipple
                                    />
                                  </MenuItem>
                                ))}
                              </CustomSelect>
                            </Box>

                            <Box className="edit-field">
                              {/* <AutocompleteMultiSelectChip
                                placeholder={'Sires'}
                                memberId={data?.memberUuid}
                                myBroodmareSires={myBroodmareSires}
                                setMyBroodmareSires={setMyBroodmareSires}
                              /> */}

                              <CustomSelect
                                className="selectDropDownBox"
                                fullWidth
                                sx={{ mb: '1rem' }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                MenuProps={{disableScrollLock: true,
                                  ...locationProps}}
                                // defaultValue={'none'}
                                displayEmpty
                                multiple
                                value={myPreSelectedBrrodmareSire ? myPreSelectedBrrodmareSire : []}
                                onChange={(e: any) => {
                                  let currentList = e.target.value;
                                  let allList = sires?.map((v: any) => v.horseId);
                                  setPreSelectedBrrodmareSire(e.target.value);
                                  let list: any = [];
                                  allList?.map((v: any) => {
                                    let removedIds = currentList?.includes(v);
                                    if (!removedIds) {
                                      list.push(v);
                                    }
                                  })
                                  setMyUnSelectedBrrodmareSire(list);
                                  // console.log(list, 'RRRR123')
                                }}
                                renderValue={(selected: any) => {
                                  if (selected?.length === 0) {
                                    return <em>Select Broodmare Sire</em>;
                                  }
                                  return <em>View Selected Broodmare Sire</em>;
                                }}
                              >
                                <MenuItem className="selectDropDownList mobileCountryList" value="none" disabled>
                                  <em>Select My Mare</em>
                                </MenuItem>
                                {sires?.map((v: any) => (
                                  <MenuItem className="selectDropDownList mobileCountryList memberListDropDown" value={v.horseId} key={v.horseId}>
                                    {/* {v.label} */}
                                    <ListItemText primary={toPascalCase(v.horseName)} />
                                    {/* <Checkbox checked={getValues('stallionLocation')?.indexOf(v.countryId) > -1} /> */}
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={myPreSelectedBrrodmareSire?.indexOf(v?.horseId) > -1}
                                      disableRipple
                                    />
                                  </MenuItem>
                                ))}
                              </CustomSelect>
                            </Box>

                            <Box className="edit-field">
                              {/* <AutocompleteMultiSelectChip
                                placeholder={'Farms'}
                                memberId={data?.memberUuid}
                                myFarms={myFarms}
                                setMyFarms={setMyFarms}
                              /> */}

                              <CustomSelect
                                className="selectDropDownBox"
                                fullWidth
                                sx={{ mb: '1rem' }}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                MenuProps={{disableScrollLock: true,
                                  ...locationProps}}
                                // defaultValue={'none'}
                                displayEmpty
                                multiple
                                value={myPreSelectedFarms ? myPreSelectedFarms : []}
                                onChange={(e: any) => {
                                  let currentList = e.target.value;
                                  let allList = farms?.map((v: any) => v.farmId);
                                  setPreSelectedFarms(e.target.value);
                                  let list: any = [];
                                  allList?.map((v: any) => {
                                    let removedIds = currentList?.includes(v);
                                    if (!removedIds) {
                                      list.push(v);
                                    }
                                  })
                                  setMyUnSelectedFarms(list);
                                  // console.log(list, 'RRRR123')
                                }}
                                renderValue={(selected: any) => {
                                  if (selected?.length === 0) {
                                    return <em>Select My Farms</em>;
                                  }
                                  return <em>View Selected Farms</em>;
                                }}
                              >
                                <MenuItem className="selectDropDownList mobileCountryList" value="none" disabled>
                                  <em>Select My Mare</em>
                                </MenuItem>
                                {farms?.map((v: any) => (
                                  <MenuItem className="selectDropDownList mobileCountryList memberListDropDown" value={v.farmId} key={v.farmId}>
                                    {/* {v.label} */}
                                    <ListItemText primary={toPascalCase(v.farmName)} />
                                    {/* <Checkbox checked={getValues('stallionLocation')?.indexOf(v.countryId) > -1} /> */}
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={myPreSelectedFarms?.indexOf(v?.farmId) > -1}
                                      disableRipple
                                    />
                                  </MenuItem>
                                ))}
                              </CustomSelect>

                            </Box>
                          </AccordionDetails>
                        </Accordion>

                        <Accordion
                          defaultExpanded={true}
                          onChange={handleChange('panel4')}
                          className="accordionDrawer"
                        >
                          <AccordionSummary
                            expandIcon={<KeyboardArrowDownRoundedIcon />}
                            aria-controls="panel4bh-content"
                            id="panel4bh-header"
                          >
                            <Typography variant="h4" sx={{ flexShrink: 0 }}>
                              Recent Orders
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails className="myList-block">
                            <Box className="edit-field">
                              <Select
                                defaultValue="none"
                                {...register(`recentOrders`)}
                                IconComponent={KeyboardArrowDownRoundedIcon}
                                className="filter-slct"
                                onChange={(e: any) => {
                                  window.open(e.target.value);
                                }}
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
                                  ...MenuPropss,
                                }}
                              >
                                <MenuItem className="selectDropDownList" value="none" disabled>
                                  <em>Recent Orders</em>
                                </MenuItem>
                                {recentOrdersdata?.map(({ orderId, reportLink, reportName }) => {
                                  return (
                                    <MenuItem
                                      className="selectDropDownList recentOrderList"
                                      value={reportLink}
                                      onClick={() => window.open(PATH_DASHBOARD.systemActivity.emailFilter(data?.email))}
                                      key={orderId}
                                    >
                                      {reportName} -<br />ID {orderId}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    </Box>
                    <Stack sx={{ mt: 3 }} className="DrawerBtnWrapper">
                      <LoadingButton
                        className="search-btn"
                        type="submit"
                        variant="contained"
                        sx={{ boxShadow: 'inherit' }}
                      >
                        {'Save'}
                      </LoadingButton>
                      <Grid container spacing={1} className="DrawerBtnBottom">
                        <Grid item xs={12} md={12} sx={{ paddingTop: '10px !important' }}>
                          <Button
                            type="button"
                            variant="contained"
                            className="expand-btn"
                            onClick={handleOpenMergeMemberAccountsWrapper}
                          >
                            Merge
                          </Button>
                        </Grid>
                      </Grid>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </Box>
        )
        }
        {/* Merge member modal */}
        <MergeMemberAccountsWrapperDialog
          title="Merge Member Accounts"
          open={openMergeMemberAccountsWrapper}
          close={handleCloseMergeMemberAccountsWrapper}
        />
      </Scrollbar >
    </Drawer >
  );
}

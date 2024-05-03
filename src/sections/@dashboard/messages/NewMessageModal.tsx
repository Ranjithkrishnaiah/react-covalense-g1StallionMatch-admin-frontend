import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
// form
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { FormProvider, RHFEditor } from 'src/components/hook-form';
import { Messages } from 'src/@types/messages';
import * as Yup from 'yup';
// redux
import { useDispatch } from 'react-redux';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import {
  useMessageQuery,
  useFarmAutocompleteSearchQuery,
  usePostFarmIdsMutation,
  usePostLocationIdsMutation,
  usePostBroadcastMutation,
} from 'src/redux/splitEndpoints/messagesSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Switch,
  Typography,
  FormControlLabel,
  CssBaseline,
  Drawer,
  TextField,
  Autocomplete,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { DeleteConversationWrapperDialog } from 'src/components/messages-modal/DeleteConversationWrapper';
import { Images } from 'src/assets/images';
import './messages.css';
import CloseIcon from '@mui/icons-material/Close';
import { toPascalCase } from 'src/utils/customFunctions';
import { Checkbox } from '@mui/material';
import { debounce } from 'lodash';
import { useNameAutocompleteSearchQuery } from 'src/redux/splitEndpoints/memberSplit';
import { SwitchProps } from '@mui/material';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
// ----------------------------------------------------------------------
const drawerWidth = 654;
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

type FormValuesProps = Messages;
// props type
type Props = {
  openAddEditForm: boolean;
  handleDrawerCloseRow: VoidFunction;
};

export default function NewMessageModal(props: any) {
  // props
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
  const theme = useTheme();
  const dispatch = useDispatch();

  // initial state of userModuleAccessAddBtn
  const [messageModuleAccessAddBtn, setMessageModuleAccessAddBtn] = useState({
    message_send_within_conversation: false,
    message_send_new_boost: false,
    message_send_new_message: false,
    message_send_tos_message: false,
  });
  // call on valuesExist
  React.useEffect(() => {
    setMessageModuleAccessAddBtn({
      ...messageModuleAccessAddBtn,
      message_send_within_conversation: !valuesExist?.hasOwnProperty(
        'MESSAGING_ADMIN_SEND_MESSAGES_WITHIN_A_CONVERSATION'
      )
        ? false
        : true,
      message_send_new_boost: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_NEW_BOOST')
        ? false
        : true,
      message_send_new_message: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_NEW_MESSAGE')
        ? false
        : true,
      message_send_tos_message: !valuesExist?.hasOwnProperty(
        'MESSAGING_ADMIN_SEND_TOS_WARNING_MESSAGE'
      )
        ? false
        : true,
    });
  }, [valuesExist]);

  const [selectedStallion, setSelectedStallion] = React.useState<any>([]);

  // farmsList autocomplete starts
  const [farmsFilterData, setFarmsFilterData] = React.useState('');
  const [farmsNameSearch, setFarmsNameSearch] = React.useState<any[]>([]);
  const [farmsDefaultNameSearch, setFarmsDefaultNameSearch] = React.useState<any[]>([]);
  const [farmsSelectedNameSearch, setFarmsSelectedNameSearch] = React.useState<any[]>([]);
  const [isFarm, setIsFarm] = React.useState(false);
  const [isFarmCleared, setIsFarmCleared] = React.useState(false);

  // usersList autocomplete starts
  const [usersFilterData, setUsersFilterData] = React.useState('');
  const [usersNameSearch, setUsersNameSearch] = React.useState<any[]>([]);
  const [isName, setIsName] = React.useState(false);

  // countriesList autocomplete starts
  const { data: countriesList } = useCountriesQuery();
  const [userLocationSelected, setUserLocationSelected] = React.useState([]);
  const [farmLocationSelected, setFarmLocationSelected] = React.useState([]);
  const [farmLocationClicked, setFarmLocationClicked] = React.useState<any>([]);
  const [farmUsersSelected, setFarmUsersSelected] = React.useState<any>([]);
  const [farmSelectedList, setFarmSelectedList] = React.useState<any>([]);
  const [farmLocationsList, setFarmLocationsList] = React.useState<any>([]);
  const [farmUsersList, setFarmUsersList] = React.useState<any>([]);
  const [farmStallionsList, setFarmStallionsList] = React.useState<any>([]);
  const [isPromoted, setIsPromoted] = React.useState(false);
  const [fromName, setFromName] = React.useState('');
  const [message, setMessage] = React.useState('');

  // Drawer Close handler
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  // Modal Close handler
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };

  // API call to get messages data
  const {
    data: farmData,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useMessageQuery(rowId, { skip: !isEdit });
  const currentFarm = farmData;

  // IOSSwitch SwitchProps
  const IOSSwitch = styled((props: SwitchProps) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    width: 46,
    height: 24,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(22px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
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
      backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
    },
  }));

  const [countryID, setCountryID] = React.useState(
    currentFarm?.countryId > 0 ? currentFarm?.countryId : 0
  );
  const [isCountrySelected, setIsCountrySelected] = React.useState(
    currentFarm?.countryId > 0 ? true : false
  );
  // country change handler
  const handlecountryChange = (event: any) => {
    setCountryID(event.target.value);
    setIsCountrySelected(true);
  };

  // API call to get States By CountryId
  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: !isCountrySelected });

  // delete conversation wrapper methods
  const [openDeleteConversationWrapper, setOpenDeleteConversationWrapper] = useState(false);
  const handleCloseDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(false);
  };
  const handleOpenDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(true);
  };

  // file upload related
  const [fileUpload, setFileUpload] = useState<any>();
  const fileDetails = null;
  const heroImages = {
    setFileUpload,
    fileDetails,
  };
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginRight: '0px',
        marginTop: '0px',
        width: '228px',
        borderRadius: '6px 6px 6px 6px',
        boxSizing: 'border-box',
      },
    },
  };

  // API call to get user Name Autocomplete Search
  const { data: usersData } = useNameAutocompleteSearchQuery(usersFilterData, {
    skip: !isName,
  });
  const usersFilterLists = isName ? usersData : [];

  const debouncedUsersList = React.useRef(
    debounce(async (usersName) => {
      if (usersName.length >= 3) {
        setUsersFilterData(usersName);
        setIsName(true);
      } else {
        setIsName(false);
      }
    }, 1000)
  ).current;

  const handleUsersInput = (e: any) => {
    if (e && e.target.value) {
      debouncedUsersList(e.target.value);
    }
  };

  const handleUsersSelect = (selectedOptions: any) => {
    setUsersNameSearch(selectedOptions);
  };
  // usersList autocomplete ends

  // API call to get farms Autocomplete Search
  const { data: farmsData } = useFarmAutocompleteSearchQuery(farmsFilterData, {
    skip: !isFarm,
  });
  const farmsFilterLists = isFarm ? farmsData : [];

  const handleFarmsSelected = (farmList: any) => {
    const getSelectedFarmIds: any = farmList?.length
      ? farmList?.map((elem: any) => elem?.farmUuid)
      : [];

    let finalStallions = [];
    if (selectedStallion?.length) {
      finalStallions = selectedStallion?.filter(
        (r: any) => getSelectedFarmIds.includes(r?.farmId) && r
      );
    }
    setSelectedStallion(finalStallions);

    let finalFarmUsers = [];
    if (farmUsersSelected?.length) {
      finalFarmUsers = farmUsersSelected?.filter(
        (r: any) => getSelectedFarmIds.includes(r?.farmId) && r
      );
    }
    setFarmUsersSelected(finalFarmUsers);

    let finalFarmLocations = [];
    if (farmLocationClicked?.length) {
      finalFarmLocations = farmLocationClicked?.filter(
        (r: any) => getSelectedFarmIds.includes(r?.farmId) && r
      );
    }
    setFarmLocationClicked(finalFarmLocations);
  };

  const debouncedFarmsList = React.useRef(
    debounce(async (farmsName) => {
      if (farmsName.length >= 3) {
        setFarmsFilterData(farmsName);
        setIsFarm(true);
      } else {
        setIsFarm(false);
      }
    }, 1000)
  ).current;

  const handleFarmsInput = (e: any) => {
    if (e && e.target.value) {
      debouncedFarmsList(e.target.value);
    }
  };

  const handleFarmsSelect = (selectedOptions: any) => {
    setFarmsNameSearch(selectedOptions);
    setIsFarmCleared(selectedOptions.length < 1 ? true : false);
  };

  const debouncedDefaultFarmsList = React.useRef(
    debounce(async (farmsName) => {
      if (farmsName.length >= 3) {
        setFarmsFilterData(farmsName);
        setIsFarm(true);
      } else {
        setIsFarm(false);
      }
    }, 1000)
  ).current;

  // default farms handler
  const handleDefaultFarmsInput = (e: any) => {
    if (e && e.target.value) {
      debouncedDefaultFarmsList(e.target.value);
    }
  };

  // default farms selected handler
  const handleDefaultFarmsSelect = (selectedOptions: any) => {
    setFarmsDefaultNameSearch(selectedOptions);
    handleFarmsSelected(selectedOptions);
    setIsFarmCleared(selectedOptions.length < 1 ? true : false);
  };

  // selected farms handler
  const handleSelectedFarmsSelect = (selectedOptions: any) => {
    let updatedList: any = selectedOptions;

    const foundDuplicateName = selectedOptions.find((elem: any, index: number) => {
      return selectedOptions?.find(
        (item: any, ind: number) => item.farmId === elem.farmId && index !== ind
      );
    });

    if (foundDuplicateName) {
      updatedList = selectedOptions?.filter(
        (item: any) => item.farmId !== foundDuplicateName?.farmId
      );
    }
    setFarmsSelectedNameSearch(updatedList);
  };
  // farmsList autocomplete ends

  // locations handler
  const handleUserLocationSelect = (selectedOptions: any) => {
    setUserLocationSelected(selectedOptions);
  };

  const handleLocationsSelected = (countryList: any) => {
    const getSelectedCountryIds: any = countryList?.length
      ? countryList?.map((elem: any) => elem?.id)
      : [];

    let finalStallions = [];
    if (selectedStallion?.length) {
      finalStallions = selectedStallion?.filter(
        (r: any) => getSelectedCountryIds.includes(r?.countryId) && r
      );
    }
    setSelectedStallion(finalStallions);

    let finalFarmUsers = [];
    if (farmUsersSelected?.length) {
      finalFarmUsers = farmUsersSelected?.filter(
        (r: any) => getSelectedCountryIds.includes(r?.countryId) && r
      );
    }
    setFarmUsersSelected(finalFarmUsers);

    let finalFarms = [];
    if (farmsSelectedNameSearch?.length) {
      finalFarms = farmsSelectedNameSearch?.filter(
        (r: any) => getSelectedCountryIds.includes(r?.countryId) && r
      );
    }
    setFarmsSelectedNameSearch(finalFarms);
  };

  // farm location handler
  const handleFarmLocationSelect = (selectedOptions: any) => {
    setFarmLocationSelected(selectedOptions);
    handleLocationsSelected(selectedOptions);
  };

  const handleFarmLocationClicked = (selectedOptions: any) => {
    let updatedList: any = selectedOptions;

    const foundDuplicateName = selectedOptions.find((elem: any, index: number) => {
      return selectedOptions?.find(
        (item: any, ind: number) => item.countryId === elem.countryId && index !== ind
      );
    });

    if (foundDuplicateName) {
      updatedList = selectedOptions?.filter(
        (item: any) => item.countryId !== foundDuplicateName?.countryId
      );
    }
    setFarmLocationClicked(updatedList);
  };

  // farm users clicked handler
  const handleFarmUsersClicked = (selectedOptions: any) => {
    let updatedList: any = selectedOptions;

    const foundDuplicateName = selectedOptions.find((elem: any, index: number) => {
      return selectedOptions?.find(
        (item: any, ind: number) => item.memberId === elem.memberId && index !== ind
      );
    });

    if (foundDuplicateName) {
      updatedList = selectedOptions?.filter(
        (item: any) => item.memberId !== foundDuplicateName?.memberId
      );
    }
    setFarmUsersSelected(updatedList);
  };

  // stallions clicked handler
  const handleStallionsClicked = (selectedOptions: any) => {
    let updatedList: any = selectedOptions;

    const foundDuplicateName = selectedOptions.find((elem: any, index: number) => {
      return selectedOptions?.find(
        (item: any, ind: number) => item.stallionId === elem.stallionId && index !== ind
      );
    });

    if (foundDuplicateName) {
      updatedList = selectedOptions?.filter(
        (item: any) => item.stallionId !== foundDuplicateName?.stallionId
      );
    }
    setSelectedStallion(updatedList);
  };
  // countriesList autocomplete ends

  const [postFarmIds] = usePostFarmIdsMutation();
  const [postLocationIds] = usePostLocationIdsMutation();

  const farmIds = farmsDefaultNameSearch?.map((el: any) => el?.farmUuid);
  let farmIdsPayload = {
    farms: farmIds,
  };

  const locationIds = farmLocationSelected?.map((el: any) => el?.id);
  let locationIdsPayload = {
    locations: locationIds,
  };

  // setting data from API farms clicked
  React.useEffect(() => {
    if (farmsDefaultNameSearch.length > 0) {
      postFarmIds(farmIdsPayload).then((res: any) => {
        setFarmLocationsList(res?.data?.locations);
        setFarmUsersList(res?.data?.users);
        setFarmStallionsList(res?.data?.stallions);
      });
    } else {
      setFarmLocationsList([]);
      setFarmUsersList([]);
      setFarmStallionsList([]);
    }
  }, [farmsDefaultNameSearch]);

  // setting data from API farms locations clicked
  React.useEffect(() => {
    if (farmLocationSelected.length > 0) {
      postLocationIds(locationIdsPayload).then((res: any) => {
        setFarmSelectedList(res?.data?.farms);
        setFarmUsersList(res?.data?.users);
        setFarmStallionsList(res?.data?.stallions);
      });
    } else {
      setFarmSelectedList([]);
      setFarmUsersList([]);
      setFarmStallionsList([]);
    }
  }, [farmLocationSelected]);

  // when users selected set farms fields disabled
  React.useEffect(() => {
    if (usersNameSearch.length > 0) {
      setFarmsDefaultNameSearch([]);
      setFarmsSelectedNameSearch([]);
      setFarmLocationClicked([]);
      setFarmLocationSelected([]);
      setFarmUsersSelected([]);
      setSelectedStallion([]);
    }
  }, [usersNameSearch]);

  // setting promoted from API user location clicked
  React.useEffect(() => {
    if (userLocationSelected.length > 0) {
      setIsPromoted(true);
    } else {
      setIsPromoted(false);
    }
  }, [userLocationSelected]);

  // setting is ordered from API farm location clicked
  React.useEffect(() => {
    if (farmLocationSelected.length > 0 || farmLocationsList.length > 0) {
      setIsOrderedReports(true);
    } else {
      setIsOrderedReports(false);
    }
  }, [farmLocationSelected, farmLocationsList]);

  // is promoted handler
  const handleIsPromoted = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPromoted(event.target.checked);
  };

  const [isOrderedReports, setIsOrderedReports] = React.useState(false);
  const handleIsOrderedReports = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsOrderedReports(event.target.checked);
  };

  // reset data handler
  const resetData = () => {
    setFromName('');
    setMessage('');
    setSelectedStallion([]);
    setFarmsDefaultNameSearch([]);
    setFarmsSelectedNameSearch([]);
    setFarmLocationSelected([]);
    setFarmLocationClicked([]);
    setFarmUsersSelected([]);
    setUserLocationSelected([]);
    setUsersNameSearch([]);
    setIsFarmCleared(false);
    setIsPromoted(false);
    setIsOrderedReports(false);
    setFarmsFilterData('');

    setErrors({});
  };

  useEffect(() => {
    if (openAddEditForm === false) {
      resetData();
    }
  }, [openAddEditForm === false]);

  const NewFarmSchema = Yup.object().shape({});

  // default values
  const defaultValues = React.useMemo(
    () => ({
      fromName: currentFarm?.fromName || '',
      message: currentFarm?.message || '',
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm]
  );

  // methods for forms
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
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

  const values = watch();

  const [errors, setErrors] = React.useState<any>({});

  // validations for form
  let validateForm = () => {
    /*eslint-disable */
    // let fields = state;
    let errors = {};
    let formIsValid = true;

    //@ts-ignore
    if (fromName == '') {
      formIsValid = false; //@ts-ignore
      errors['fromName'] = `From Name is required`;
    }
    if (message == '' || message == '<p><br></p>') {
      formIsValid = false; //@ts-ignore
      errors['message'] = `Message is required`;
    }
    setErrors(errors);
    return formIsValid;
    /*eslint-enable */
  };

  // API call for post broadcast message
  const [postBroadcast] = usePostBroadcastMutation();

  const membersIds = usersNameSearch?.map((el: any) => el?.id);
  const userLocationIds = userLocationSelected?.map((el: any) => el?.id);
  const farmsSelectedIds =
    farmsDefaultNameSearch?.length > 0
      ? farmsDefaultNameSearch?.map((el: any) => el?.farmUuid)
      : farmsSelectedNameSearch?.map((el: any) => el?.farmId);
  const farmLocationsIds =
    farmLocationSelected?.length > 0
      ? farmLocationSelected?.map((el: any) => el?.id)
      : farmLocationClicked?.map((el: any) => el?.countryId);
  const farmMembersIds = farmUsersSelected?.map((el: any) => el?.memberId);
  const stallionsIds = selectedStallion?.map((el: any) => el?.stallionId);

  let broadcastPayload = {
    fromName: fromName,
    stallionIds: stallionsIds,
    message: message,
    farmIds: farmsSelectedIds,
    farmMembers: farmMembersIds,
    members: membersIds,
    userLocations: userLocationIds,
    farmLocations: farmLocationsIds,
    promotedStallions: isPromoted === true ? 1 : 0,
    previouslyOrdered: isOrderedReports === true ? 1 : 0,
  };

  // on submit handler for broadcast message
  const onSubmit = async (data: FormValuesProps) => {
    if (!validateForm()) return;
    try {
      let res: any = await postBroadcast(broadcastPayload);
      if (res?.error) {
        setApiStatusMsg({
          status: 422,
          message: '<b>There was a problem in sending Broadcast Announcement!</b>',
        });
        setApiStatus(true);
      } else {
        handleDrawerCloseRow();
        setApiStatusMsg({
          status: 201,
          message: '<b>Broadcast Announcement sent successfully!</b>',
        });
        setApiStatus(true);
      }
    } catch (error) {}
  };

  return (
    // drawer
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
      className="filter-section DrawerRightModal RaceEditModal NewMessagesEditModal"
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
            onClick={isEdit ? handleCloseModal : handleDrawerCloseRow}
          >
            <i style={{ color: '#161716' }} className="icon-Cross" />
          </IconButton>
        </DrawerHeader>
        {isEdit === undefined && messageModuleAccessAddBtn.message_send_new_message === false ? (
          <UnAuthorized />
        ) : (
          <Box px={4} className="edit-section" sx={{ paddingTop: '0px !important' }}>
            {/* form for broadcast message */}
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <Box px={0}>
                <Grid
                  container
                  spacing={3}
                  mt={0}
                  pt={0}
                  className="RaceListModalBox ViewConversationModal"
                >
                  <Grid container spacing={1} mt={0} pt={0} mx={3}>
                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Typography
                        variant="h4"
                        className="ImportedHeader"
                        sx={{ paddingLeft: '0px !important' }}
                      >
                        Broadcast Announcement
                      </Typography>
                      <Box className="FormGroup">
                        <TextField
                          fullWidth
                          error={errors.fromName ? true : false}
                          type="text"
                          placeholder="Enter From Name"
                          className="edit-field"
                          value={toPascalCase(fromName)}
                          onChange={(e: any) => setFromName(e.target.value)}
                        />
                        {errors.fromName && <div className="errorMsg">{errors.fromName}</div>}
                      </Box>
                    </Grid>

                    <Grid item xs={6} md={6} mt={0} className="racelistgroup"></Grid>

                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        <Box className="edit-field">
                          {/* Select User(s) */}
                          <Autocomplete
                            ChipProps={{ deleteIcon: <CloseIcon /> }}
                            popupIcon={<KeyboardArrowDownRoundedIcon />}
                            options={usersFilterLists || []}
                            disablePortal
                            multiple
                            disableCloseOnSelect
                            onInputChange={handleUsersInput}
                            getOptionLabel={(option: any) =>
                              option.label ??
                              `${toPascalCase(option?.fullName)?.toString()} (${option?.email})`
                            }
                            renderOption={(props, option: any, { selected }) => (
                              <li {...props} className="MuiAutocomplete-option">
                                <span
                                  className="autocompleteTitle"
                                  style={{
                                    width: '100%',
                                    whiteSpace: 'break-spaces',
                                  }}
                                >
                                  {`${toPascalCase(option?.fullName)} (${option?.email})`}
                                </span>
                                <Checkbox
                                  checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                  icon={<img src={Images.unchecked} alt="checkbox" />}
                                  checked={selected}
                                  disableRipple
                                />
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={usersNameSearch?.length ? '' : `Select User(s)`}
                              />
                            )}
                            value={usersNameSearch}
                            onChange={(e: any, selectedOptions: any) =>
                              handleUsersSelect(selectedOptions)
                            }
                            className="AutoCompleteBox"
                            sx={{ margin: '0px', padding: '0px' }}
                            disabled={userLocationSelected?.length > 0 ? true : false}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        <Box className="edit-field">
                          {/* Select User Location(s) */}
                          <Autocomplete
                            ChipProps={{ deleteIcon: <CloseIcon /> }}
                            popupIcon={<KeyboardArrowDownRoundedIcon />}
                            options={countriesList || []}
                            disablePortal
                            multiple
                            disableCloseOnSelect
                            getOptionLabel={(option: any) =>
                              option.label ?? toPascalCase(option?.countryName)?.toString()
                            }
                            renderOption={(props, option: any, { selected }) => (
                              <li {...props} className="MuiAutocomplete-option">
                                <span
                                  className="autocompleteTitle"
                                  style={{
                                    width: '100%',
                                    whiteSpace: 'break-spaces',
                                  }}
                                >
                                  {toPascalCase(option?.countryName)}
                                </span>
                                <Checkbox
                                  checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                  icon={<img src={Images.unchecked} alt="checkbox" />}
                                  checked={selected}
                                  disableRipple
                                />
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={
                                  userLocationSelected?.length ? '' : `Select User Location(s)`
                                }
                              />
                            )}
                            value={userLocationSelected}
                            onChange={(e: any, selectedOptions: any) =>
                              handleUserLocationSelect(selectedOptions)
                            }
                            className="AutoCompleteBox"
                            sx={{ margin: '0px', padding: '0px' }}
                            disabled={usersNameSearch?.length > 0 ? true : false}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6} md={6} mt={2} className="racelistgroup">
                      <Box className="FormGroup">
                        <Box className="edit-field">
                          {farmLocationSelected?.length > 0 ? (
                            // selected farms
                            <>
                              <Autocomplete
                                ChipProps={{ deleteIcon: <CloseIcon /> }}
                                popupIcon={<KeyboardArrowDownRoundedIcon />}
                                options={farmSelectedList || []}
                                disablePortal
                                multiple
                                disableCloseOnSelect
                                getOptionLabel={(option: any) =>
                                  option.label ?? toPascalCase(option?.farmName)?.toString()
                                }
                                renderOption={(props, option: any, { selected }) => (
                                  <li {...props} className="MuiAutocomplete-option">
                                    <span
                                      className="autocompleteTitle"
                                      style={{
                                        width: '100%',
                                        whiteSpace: 'break-spaces',
                                      }}
                                    >
                                      {toPascalCase(option?.farmName)}
                                    </span>
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                      icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={farmsSelectedNameSearch.some(
                                        (v: any) => option.farmId == v.farmId
                                      )}
                                      disableRipple
                                    />
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder={
                                      farmsSelectedNameSearch?.length ? '' : `Select Farm(s)`
                                    }
                                  />
                                )}
                                value={farmsSelectedNameSearch}
                                onChange={(e: any, selectedOptions: any) =>
                                  handleSelectedFarmsSelect(selectedOptions)
                                }
                                className="AutoCompleteBox"
                                sx={{ margin: '0px', padding: '0px' }}
                                disabled={usersNameSearch?.length > 0 ? true : false}
                              />
                              <div className="errorMsg">{errors.farmsSelectedNameSearch}</div>
                            </>
                          ) : (
                            // default farms
                            <>
                              <Autocomplete
                                ChipProps={{ deleteIcon: <CloseIcon /> }}
                                popupIcon={<KeyboardArrowDownRoundedIcon />}
                                options={farmsFilterLists || []}
                                disablePortal
                                multiple
                                disableCloseOnSelect
                                onInputChange={handleDefaultFarmsInput}
                                getOptionLabel={(option: any) =>
                                  option.label ?? toPascalCase(option?.farmName)?.toString()
                                }
                                renderOption={(props, option: any, { selected }) => (
                                  <li {...props} className="MuiAutocomplete-option">
                                    <span
                                      className="autocompleteTitle"
                                      style={{
                                        width: '100%',
                                        whiteSpace: 'break-spaces',
                                      }}
                                    >
                                      {toPascalCase(option?.farmName)}
                                    </span>
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                      icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={selected}
                                      disableRipple
                                    />
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder={
                                      farmsDefaultNameSearch?.length ? '' : `Select Farm(s)`
                                    }
                                  />
                                )}
                                value={farmsDefaultNameSearch}
                                onChange={(e: any, selectedOptions: any) =>
                                  handleDefaultFarmsSelect(selectedOptions)
                                }
                                className="AutoCompleteBox"
                                sx={{ margin: '0px', padding: '0px' }}
                                disabled={usersNameSearch?.length > 0 ? true : false}
                              />
                              <div className="errorMsg">{errors.farmsDefaultNameSearch}</div>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={6} mt={2} className="racelistgroup">
                      <Box className="FormGroup">
                        <Box className="edit-field">
                          {farmsDefaultNameSearch?.length > 0 ? (
                            // selected farm locations
                            <>
                              <Autocomplete
                                ChipProps={{ deleteIcon: <CloseIcon /> }}
                                popupIcon={<KeyboardArrowDownRoundedIcon />}
                                options={farmLocationsList || []}
                                disablePortal
                                multiple
                                disableCloseOnSelect
                                getOptionLabel={(option: any) =>
                                  option.label ?? toPascalCase(option?.countryName)?.toString()
                                }
                                renderOption={(props, option: any, { selected }) => (
                                  <li {...props} className="MuiAutocomplete-option">
                                    <span
                                      className="autocompleteTitle"
                                      style={{
                                        width: '100%',
                                        whiteSpace: 'break-spaces',
                                      }}
                                    >
                                      {toPascalCase(option?.countryName)}
                                    </span>
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                      icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={farmLocationClicked.some(
                                        (v: any) => option.countryId == v.countryId
                                      )}
                                      disableRipple
                                    />
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder={
                                      farmLocationClicked?.length ? '' : `Select Farm Location(s)`
                                    }
                                  />
                                )}
                                value={farmLocationClicked}
                                onChange={(e: any, selectedOptions: any) =>
                                  handleFarmLocationClicked(selectedOptions)
                                }
                                className="AutoCompleteBox"
                                sx={{ margin: '0px', padding: '0px' }}
                                disabled={usersNameSearch?.length > 0 ? true : false}
                              />
                              <div className="errorMsg">{errors.farmLocationClicked}</div>
                            </>
                          ) : (
                            // default farm locations
                            <>
                              <Autocomplete
                                ChipProps={{ deleteIcon: <CloseIcon /> }}
                                popupIcon={<KeyboardArrowDownRoundedIcon />}
                                options={countriesList || []}
                                disablePortal
                                multiple
                                disableCloseOnSelect
                                getOptionLabel={(option: any) =>
                                  option.label ?? toPascalCase(option?.countryName)?.toString()
                                }
                                renderOption={(props, option: any, { selected }) => (
                                  <li {...props} className="MuiAutocomplete-option">
                                    <span
                                      className="autocompleteTitle"
                                      style={{
                                        width: '100%',
                                        whiteSpace: 'break-spaces',
                                      }}
                                    >
                                      {toPascalCase(option?.countryName)}
                                    </span>
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                      icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={selected}
                                      disableRipple
                                    />
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder={
                                      farmLocationSelected?.length ? '' : `Select Farm Location(s)`
                                    }
                                  />
                                )}
                                value={farmLocationSelected}
                                onChange={(e: any, selectedOptions: any) =>
                                  handleFarmLocationSelect(selectedOptions)
                                }
                                className="AutoCompleteBox"
                                sx={{ margin: '0px', padding: '0px' }}
                                disabled={usersNameSearch?.length > 0 ? true : false}
                              />
                              <div className="errorMsg">{errors.farmLocationSelected}</div>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        <Box className="edit-field">
                          {/* Select Farm User(s) */}
                          <Autocomplete
                            ChipProps={{ deleteIcon: <CloseIcon /> }}
                            popupIcon={<KeyboardArrowDownRoundedIcon />}
                            options={farmUsersList || []}
                            disablePortal
                            multiple
                            disableCloseOnSelect
                            getOptionLabel={(option: any) =>
                              option.label ?? toPascalCase(option?.fullName)?.toString()
                            }
                            renderOption={(props, option: any, { selected }) => (
                              <li {...props} className="MuiAutocomplete-option">
                                <span
                                  className="autocompleteTitle"
                                  style={{
                                    width: '100%',
                                    whiteSpace: 'break-spaces',
                                  }}
                                >
                                  {toPascalCase(option?.fullName)}
                                </span>
                                <Checkbox
                                  checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                  icon={<img src={Images.unchecked} alt="checkbox" />}
                                  checked={farmUsersSelected.some(
                                    (v: any) => option.memberId == v.memberId
                                  )}
                                  disableRipple
                                />
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={farmUsersSelected?.length ? '' : `Select Farm Users`}
                              />
                            )}
                            value={farmUsersSelected}
                            onChange={(e: any, selectedOptions: any) =>
                              handleFarmUsersClicked(selectedOptions)
                            }
                            className="AutoCompleteBox"
                            sx={{ margin: '0px', padding: '0px' }}
                            disabled={usersNameSearch?.length > 0 ? true : false}
                          />
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Box className="FormGroup" px={3}></Box>
                    </Grid>

                    <Grid item xs={6} md={6} mt={0} className="racelistgroup">
                      <Box className="FormGroup">
                        <Box className="edit-field stallionAutocomplete">
                          {/* select Stallions(s) */}
                          <Autocomplete
                            ChipProps={{ deleteIcon: <CloseIcon /> }}
                            popupIcon={<KeyboardArrowDownRoundedIcon />}
                            options={farmStallionsList || []}
                            disablePortal
                            multiple
                            disableCloseOnSelect
                            getOptionLabel={(option: any) =>
                              option.label ?? toPascalCase(option?.stallionName)?.toString()
                            }
                            value={selectedStallion}
                            renderOption={(props, option: any, { selected }) => {
                              return (
                                <li {...props} className="MuiAutocomplete-option">
                                  <span
                                    className="autocompleteTitle"
                                    style={{
                                      width: '100%',
                                      whiteSpace: 'break-spaces',
                                    }}
                                  >
                                    {toPascalCase(option?.stallionName)}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                    icon={<img src={Images.unchecked} alt="checkbox" />}
                                    checked={selectedStallion.some(
                                      (v: any) => option.stallionId == v.stallionId
                                    )}
                                    disableRipple
                                  />
                                </li>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={selectedStallion?.length ? '' : `Select Stallion(s)`}
                              />
                            )}
                            onChange={(e: any, selectedOptions: any) =>
                              handleStallionsClicked(selectedOptions)
                            }
                            className="AutoCompleteBox"
                            sx={{ margin: '0px', padding: '0px' }}
                            disabled={usersNameSearch?.length > 0 ? true : false}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      md={6}
                      mt={1}
                      className="racelistgroup"
                      sx={{ marginTop: '-32px' }}
                    >
                      {/* isPromoted */}
                      <Box className="FormGroup" px={0} style={{ marginTop: '15px' }}>
                        <Box
                          className="RHF-Switches promote-ST-Switches"
                          style={{ marginBottom: '6px' }}
                        >
                          <FormControlLabel
                            control={<IOSSwitch defaultChecked />}
                            label="Promoted Stallions"
                            name="promotedStallions"
                            labelPlacement="start"
                            checked={isPromoted}
                            onChange={(event: any) => handleIsPromoted(event)}
                          />
                        </Box>
                        {/* isOrderedReports */}
                        <Box className="RHF-Switches" style={{ padding: '2px' }}>
                          <FormControlLabel
                            control={<IOSSwitch defaultChecked />}
                            label="Previously Ordered Reports"
                            name="previouslyOrderedReports"
                            labelPlacement="start"
                            checked={isOrderedReports}
                            onChange={(event: any) => handleIsOrderedReports(event)}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* message box */}
                  <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                    <Typography
                      variant="h4"
                      className="ImportedHeader"
                      sx={{ paddingLeft: '9px !important' }}
                    >
                      Message
                    </Typography>
                    <Box className="FormGroup">
                      <Box
                        className={`rhf-editor-wrapper new-messages-rhf-editor ${
                          errors.message ? 'error' : ''
                        }`}
                      >
                        <RHFEditor
                          placeholder=""
                          className="rhf-editor-block"
                          name="messageNew"
                          value={message}
                          onChange={(e) => setMessage(e)}
                          messageEditor={'messageEditor'}
                        />
                      </Box>
                      {errors.message && <div className="errorMsg">{errors.message}</div>}
                    </Box>
                  </Grid>

                  {/* submit button */}
                  <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>
                    <Stack sx={{ mt: 1 }} className="DrawerBtnWrapper">
                      <Grid container spacing={1} px={2} className="DrawerBtnBottom">
                        <Grid item xs={6} md={6} sx={{ paddingTop: '10px !important' }}>
                          <LoadingButton
                            fullWidth
                            className="search-btn"
                            type="submit"
                            variant="contained"
                            loading={isSubmitting}
                          >
                            {!isEdit ? 'Send' : 'Send'}
                          </LoadingButton>
                        </Grid>
                        <Grid item xs={6} md={6} sx={{ paddingTop: '9px !important' }}></Grid>
                      </Grid>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </FormProvider>
          </Box>
        )}
        {/* Delete Conversation WrapperDialog */}
        <DeleteConversationWrapperDialog
          title="Are you sure?"
          open={openDeleteConversationWrapper}
          close={handleCloseDeleteConversationWrapper}
        />
      </Scrollbar>
    </Drawer>
  );
}

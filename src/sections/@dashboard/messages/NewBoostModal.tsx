import * as React from 'react';
// redux
import { useDispatch } from 'react-redux';
// @mui
import { styled, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router';
import { LoadingButton } from '@mui/lab';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, RHFEditor, RHFRadioGroup } from 'src/components/hook-form';
import * as Yup from 'yup';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useStatesByCountryIdQuery } from 'src/redux/splitEndpoints/statesSplit';
import {
  useMessageQuery,
  useFarmByUsersQuery,
  usePostLocalBoostIdsMutation,
  usePostLocalBoostMutation,
  usePostLocalSearchByUsersMutation,
  usePostExtendedBoostMutation,
  useDamSireByMareQuery,
} from 'src/redux/splitEndpoints/messagesSplit';
import Scrollbar from 'src/components/Scrollbar';
import 'src/sections/@dashboard/css/list.css';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  CssBaseline,
  Drawer,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  Autocomplete,
} from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { DeleteConversationWrapperDialog } from 'src/components/messages-modal/DeleteConversationWrapper';
import { Images } from 'src/assets/images';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import './messages.css';
import { Messages } from 'src/@types/messages';
import { toPascalCase } from 'src/utils/customFunctions';
import { Checkbox } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { debounce } from 'lodash';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
// ----------------------------------------------------------------------

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

export default function NewBoostModal(props: any) {
  // props
  const {
    open,
    handleEditPopup,
    rowId,
    isEdit,
    openAddEditForm,
    handleDrawerCloseRow,
    handleCloseEditState,
    apiStatus, setApiStatus,
    apiStatusMsg, setApiStatusMsg, 
    valuesExist, setValuesExist,
  } = props;

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
      message_send_within_conversation: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_MESSAGES_WITHIN_A_CONVERSATION')? false : true,
      message_send_new_boost: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_NEW_BOOST')? false : true,
      message_send_new_message: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_NEW_MESSAGE')? false : true,
      message_send_tos_message: !valuesExist?.hasOwnProperty('MESSAGING_ADMIN_SEND_TOS_WARNING_MESSAGE')? false : true,
    });
  }, [valuesExist]);

  const navigate = useNavigate();

  // drawer close handler
  const handleDrawerClose = () => {
    handleEditPopup();
  };

  // modal close handler
  const handleCloseModal = () => {
    handleDrawerClose();
    handleCloseEditState();
  };
  const theme = useTheme();
  const dispatch = useDispatch();
  const { data: countriesList } = useCountriesQuery();

  // API call to get messages
  const {
    data: farmData,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useMessageQuery(rowId, { skip: !isEdit });
  const currentFarm = farmData;

  const NewFarmSchema = Yup.object().shape({});

  const [countryID, setCountryID] = React.useState(
    currentFarm?.countryId > 0 ? currentFarm?.countryId : 0
  );
  const [isCountrySelected, setIsCountrySelected] = React.useState(
    currentFarm?.countryId > 0 ? true : false
  );

  // API call to get States By CountryId
  const { data: stateList } = useStatesByCountryIdQuery(countryID, { skip: !isCountrySelected });

  const [openDeleteConversationWrapper, setOpenDeleteConversationWrapper] = useState(false);

  // DeleteConversation handlers
  const handleCloseDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(false);
  };
  const handleOpenDeleteConversationWrapper = () => {
    setOpenDeleteConversationWrapper(true);
  };

  // file upload related methods
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

  const [isExtendedBoostElements, setIsExtendedBoostElements] = React.useState(false);

  // boost type options
  const BOOST_TYPE_OPTIONS = [];
  BOOST_TYPE_OPTIONS[0] = (
    <Box component="div" fontSize={14}>
      Local Boost
      <HtmlTooltip
        placement="bottom"
        className="tableTooltip boost-tooltip"
        title={
          <React.Fragment>
            <Box className="tooltipPopoverBody">
              <p>
                Blast out a group message to all breeders who have contacted a farm within the last
                12 months. Perfect for stallion announcements, fee adjustments, etc at a competitive
                price.
              </p>
            </Box>
          </React.Fragment>
        }
      >
        <i className="icon-Info-circle tooltip-table" />
      </HtmlTooltip>
    </Box>
  );
  BOOST_TYPE_OPTIONS[1] = (
    <Box component="div" fontSize={14}>
      Extended Boost
      <HtmlTooltip
        placement="bottom"
        className="tableTooltip boost-tooltip"
        title={
          <React.Fragment>
            <Box className="tooltipPopoverBody">
              <p>
                Leverage the extended reach of registered users for an announcement and target warm
                leads based location, search history, tracked horses and more.
              </p>
            </Box>
          </React.Fragment>
        }
      >
        <i className="icon-Info-circle tooltip-table" />
      </HtmlTooltip>
    </Box>
  );

  const BOOST_TYPE_OPTIONS_VALUE = ['local', 'extended'];
  const [boostValue, setBoostValue] = React.useState(BOOST_TYPE_OPTIONS_VALUE[0]);

  // change boost handler
  const handleBoostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBoostValue((event.target as HTMLInputElement).value);
    if (boostValue === 'extended') {
      setIsExtendedBoostElements(false);
    } else {
      setIsExtendedBoostElements(true);
    }
  };

  // states
  const [errors, setErrors] = React.useState<any>({});
  const [recipientsCountLocal, setRecipientsCountLocal] = React.useState(0);
  const [countiesCountLocal, setCountiesCountLocal] = React.useState(0);
  const [localFromName, setLocalFromName] = React.useState('');
  const [messageEditorValueLocal, setMessageEditorValueLocal] = React.useState('');
  const [searchedFarmsLocal, setSearchedFarmsLocal] = React.useState([]);
  const [searchedStallionLocal, setSearchedStallionLocal] = React.useState([]);
  const [searchedStallionLocalSelected, setSearchedStallionLocalSelected] = React.useState<any>([]);
  const [recipientsCountExtended, setRecipientsCountExtended] = React.useState(0);
  const [countiesCountExtended, setCountiesCountExtended] = React.useState(0);
  const [extendedFromName, setExtendedFromName] = React.useState('');
  const [messageEditorValueExtended, setMessageEditorValueExtended] = React.useState('');
  const [searchedFarmsExtended, setSearchedFarmsExtended] = React.useState([]);
  const [searchedStallionExtended, setSearchedStallionExtended] = React.useState([]);
  const [searchedStallionExtendedSelected, setSearchedStallionExtendedSelected] =
    React.useState<any>([]);
  const [countriesListExtended, setCountriesListExtended] = React.useState<any>([]);
  const [countriesSelectedExtended, setCountriesSelectedExtended] = React.useState<any>([]);
  const [trackedDamSireList, setTrackedDamSireList] = React.useState<any>([]);
  const [trackedDamSireSelected, setTrackedDamSireSelected] = React.useState<any>([]);
  const [trackedFarmsExtended, setTrackedFarmsExtended] = React.useState([]);
  const [trackedFarmsExtendedSelected, setTrackedFarmsExtendedSelected] = React.useState<any>([]);
  const [trackedStallionsExtended, setTrackedStallionsExtended] = React.useState([]);
  const [trackedStallionsExtendedSelected, setTrackedStallionsExtendedSelected] =
    React.useState<any>([]);
  const [statesListSelected, setStatesListSelected] = React.useState<any>([]);

  const countriesArr = countriesSelectedExtended?.map((el: any) => el?.id);

  let countryIds = countriesArr.length && countriesArr;
  // API call to get States By CountryId
  const { data: statesAPIData, isSuccess: isStatesByIdSuccess } = useStatesByCountryIdQuery(
    countryIds,
    { skip: !countriesArr.length }
  );
  let statesData = countriesArr.length ? statesAPIData : [];

  useEffect(() => {
    if (countriesSelectedExtended?.length > 0) {
      statesData = statesAPIData;
    } else {
      statesData = [];
      setStatesListSelected([]);
    }
  }, [countriesSelectedExtended]);

  // states list handler
  const handlestatesListSelected = (selectedOptions: any) => {
    let updatedList: any = selectedOptions;

    const foundDuplicateName = selectedOptions.find((elem: any, index: number) => {
      return selectedOptions?.find(
        (item: any, ind: number) => item.id === elem.id && index !== ind
      );
    });

    if (foundDuplicateName) {
      updatedList = selectedOptions?.filter((item: any) => item.id !== foundDuplicateName?.id);
    }
    setStatesListSelected(updatedList);
  };

  // reset data handler
  const resetData = () => {
    setBoostValue(BOOST_TYPE_OPTIONS_VALUE[0]);
    setIsExtendedBoostElements(false);
    setLocalFromName('');
    setMessageEditorValueLocal('');
    setMessageEditorValueExtended('');
    setSearchedFarmsLocal([]);
    setSearchedStallionLocal([]);
    setSearchedStallionLocalSelected([]);
    setFarmsFilterData('');
    setExtendedFromName('');
    setSearchedFarmsExtended([]);
    setSearchedStallionExtended([]);
    setSearchedStallionExtendedSelected([]);
    setTrackedFarmsExtended([]);
    setTrackedFarmsExtendedSelected([]);
    setFarmsFilterDataExtended('');
    setCountriesSelectedExtended([]);
    setTrackedDamSireSelected([]);
    setTrackedStallionsExtendedSelected([]);
    setDamSireSearchedSelected([]);
    setErrors({});
  };

  useEffect(() => {
    if (!openAddEditForm) {
      resetData();
    }
  }, [openAddEditForm]);

  // farmsLocalLists starts
  const [farmsFilterData, setFarmsFilterData] = React.useState('');
  const [isFarm, setIsFarm] = React.useState(false);
  // API call to get farms data
  const { data: farmsData } = useFarmByUsersQuery(farmsFilterData, {
    skip: !isFarm,
  });
  const farmsLocalLists = isFarm ? farmsData : [];

  const debouncedLocalFarmsList = React.useRef(
    debounce(async (farmsName) => {
      if (farmsName.length >= 3) {
        setFarmsFilterData(farmsName);
        setIsFarm(true);
      } else {
        setIsFarm(false);
      }
    }, 1000)
  ).current;

  const handleLocalFarmsInput = (e: any) => {
    if (e && e.target.value) {
      debouncedLocalFarmsList(e.target.value);
    }
  };

  const handleSelectedFarmsLocal = (selectedOptions: any) => {
    setSearchedFarmsLocal(selectedOptions);

    handleFarmsLocalSelected(selectedOptions);
  };

  const handleFarmsLocalSelected = (farmList: any) => {
    const getSelectedFarmIds: any = farmList?.length
      ? farmList?.map((elem: any) => elem?.farmId)
      : [];

    let finalStallions = [];
    if (searchedStallionLocalSelected?.length) {
      finalStallions = searchedStallionLocalSelected?.filter(
        (r: any) => getSelectedFarmIds.includes(r?.farmId) && r
      );
    }
    setSearchedStallionLocalSelected(finalStallions);
  };

  const [postLocalBoostIds] = usePostLocalBoostIdsMutation();

  const [postLocalSearchByUsers] = usePostLocalSearchByUsersMutation();

  const farmIds = searchedFarmsLocal?.map((el: any) => el?.farmId);
  const stallionIds = searchedStallionLocalSelected?.map((el: any) => el?.stallionId);
  let localBoostIdsPayload = {
    farms: farmIds,
    stallions: stallionIds,
    countries: [],
    states: [],
    damSireSearched: [],
    damSireTracked: [],
    farmsTracked: [],
    stallionsTracked: [],
  };

  let localSearchByUsersPayload = {
    order: 'ASC',
    farmIds: farmIds,
    countries: [],
  };

  React.useEffect(() => {
    if (searchedFarmsLocal.length > 0 || searchedStallionLocalSelected.length > 0) {
      postLocalBoostIds(localBoostIdsPayload).then((res: any) => {
        setRecipientsCountLocal(res?.data?.recipients);
        setCountiesCountLocal(res?.data?.countries);
      });

      postLocalSearchByUsers(localSearchByUsersPayload).then((res: any) => {
        setSearchedStallionLocal(res?.data?.searchedStallions);
      });
    } else {
      setSearchedStallionLocal([]);
      setRecipientsCountLocal(0);
      setCountiesCountLocal(0);
    }
  }, [searchedFarmsLocal, searchedStallionLocalSelected]);

  const handleSearchedStallionLocal = (selectedOptions: any) => {
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
    setSearchedStallionLocalSelected(updatedList);
  };
  // farmsLocalLists ends

  // farmsExtendedLists starts
  const [farmsFilterDataExtended, setFarmsFilterDataExtended] = React.useState('');
  const [isFarmExtended, setIsFarmExtended] = React.useState(false);
  // API call to get farms data
  const { data: farmsDataExtended } = useFarmByUsersQuery(farmsFilterDataExtended, {
    skip: !isFarmExtended,
  });
  const farmsExtendedLists = isFarmExtended ? farmsDataExtended : [];

  const debouncedExtendedFarmsList = React.useRef(
    debounce(async (farmsName) => {
      if (farmsName.length >= 3) {
        setFarmsFilterDataExtended(farmsName);
        setIsFarmExtended(true);
      } else {
        setIsFarmExtended(false);
      }
    }, 1000)
  ).current;

  const handleExtendedFarmsInput = (e: any) => {
    if (e && e.target.value) {
      debouncedExtendedFarmsList(e.target.value);
    }
  };

  // selected farms handler
  const handleSelectedFarmsExtended = (selectedOptions: any) => {
    setSearchedFarmsExtended(selectedOptions);

    handleFarmsExtendedSelected(selectedOptions);
  };

  const handleFarmsExtendedSelected = (farmList: any) => {
    const getSelectedFarmIds: any = farmList?.length
      ? farmList?.map((elem: any) => elem?.farmId)
      : [];

    let finalStallions = [];
    if (searchedStallionExtendedSelected?.length) {
      finalStallions = searchedStallionExtendedSelected?.filter(
        (r: any) => getSelectedFarmIds.includes(r?.farmId) && r
      );
    }
    setSearchedStallionExtendedSelected(finalStallions);

    let finalCountries = [];
    if (countriesSelectedExtended?.length) {
      finalCountries = countriesSelectedExtended?.filter(
        (r: any) => getSelectedFarmIds.includes(r?.farmId) && r
      );
    }
    setCountriesSelectedExtended(finalCountries);

    let finalTrackedStallion = [];
    if (trackedStallionsExtendedSelected?.length) {
      finalTrackedStallion = trackedStallionsExtendedSelected?.filter(
        (r: any) => getSelectedFarmIds.includes(r?.farmId) && r
      );
    }
    setTrackedStallionsExtendedSelected(finalTrackedStallion);

    if (farmList?.length <= 0) {
      setTrackedDamSireSelected([]);
      setTrackedFarmsExtendedSelected([]);
    }
  };

  // stallions duplicate handler
  const handleSearchedStallionExtended = (selectedOptions: any) => {
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
    setSearchedStallionExtendedSelected(updatedList);
  };

  // countries selected handler
  const handleCountriesSelectedExtended = (selectedOptions: any) => {
    let updatedList: any = selectedOptions;

    const foundDuplicateName = selectedOptions.find((elem: any, index: number) => {
      return selectedOptions?.find(
        (item: any, ind: number) => item.id === elem.id && index !== ind
      );
    });

    if (foundDuplicateName) {
      updatedList = selectedOptions?.filter((item: any) => item.id !== foundDuplicateName?.id);
    }
    setCountriesSelectedExtended(updatedList);

    handleCountiesClicked(selectedOptions);
  };

  // countries clicked handler
  const handleCountiesClicked = (countryList: any) => {
    const getSelectedCountryIds: any = countryList?.length
      ? countryList?.map((elem: any) => elem?.id)
      : [];

    let finalTrackedDamSire = [];
    if (trackedDamSireSelected?.length) {
      finalTrackedDamSire = trackedDamSireSelected?.filter(
        (r: any) => getSelectedCountryIds.includes(r?.countryId) && r
      );
    }

    setTrackedDamSireSelected(finalTrackedDamSire);

    let finalTrackedFarms = [];
    if (trackedFarmsExtendedSelected?.length) {
      finalTrackedFarms = trackedFarmsExtendedSelected?.filter(
        (r: any) => getSelectedCountryIds.includes(r?.countryId) && r
      );
    }
    setTrackedFarmsExtendedSelected(finalTrackedFarms);

    let finalTrackedStallionsCount = [];
    if (trackedStallionsExtendedSelected?.length) {
      finalTrackedStallionsCount = trackedStallionsExtendedSelected?.filter(
        (r: any) => getSelectedCountryIds.includes(r?.countryId) && r
      );
    }
    setTrackedStallionsExtendedSelected(finalTrackedStallionsCount);

    let finalStatesSelected = [];
    if (statesListSelected?.length) {
      finalStatesSelected = statesListSelected?.filter(
        (r: any) => getSelectedCountryIds.includes(r?.country?.id) && r
      );
    }
    setStatesListSelected(finalStatesSelected);
  };

  // tracked dam sires handler
  const handleTrackedDamSireSelected = (selectedOptions: any) => {
    let updatedList: any = selectedOptions;

    const foundDuplicateName = selectedOptions.find((elem: any, index: number) => {
      return selectedOptions?.find(
        (item: any, ind: number) => item.horseId === elem.horseId && index !== ind
      );
    });

    if (foundDuplicateName) {
      updatedList = selectedOptions?.filter(
        (item: any) => item.horseId !== foundDuplicateName?.horseId
      );
    }
    setTrackedDamSireSelected(updatedList);
  };

  // tracked farms handler
  const handleTrackedFarmsExtended = (selectedOptions: any) => {
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
    setTrackedFarmsExtendedSelected(updatedList);
  };

  // tracked stallions handler
  const handleTrackedStallionExtended = (selectedOptions: any) => {
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
    setTrackedStallionsExtendedSelected(updatedList);
  };
  // farmsExtendedLists ends

  // searchedDamSire starts
  const [damSireFilterData, setDamSireFilterData] = React.useState('');
  const [damSireSearchedSelected, setDamSireSearchedSelected] = React.useState<any>([]);
  const [isDamSire, setIsDamSire] = React.useState(false);
  // API call to get dam sire data
  const { data: damSireData } = useDamSireByMareQuery(damSireFilterData, {
    skip: !isDamSire,
  });
  const damSireSearched = isDamSire ? damSireData : [];

  const debouncedDamSireList = React.useRef(
    debounce(async (sireName) => {
      if (sireName.length >= 3) {
        setDamSireFilterData(sireName);
        setIsDamSire(true);
      } else {
        setIsDamSire(false);
      }
    }, 1000)
  ).current;

  const handleDamSireInput = (e: any) => {
    if (e && e.target.value) {
      debouncedDamSireList(e.target.value);
    }
  };
  // searchedDamSire ends

  // mutations for post boosts
  const [postExtendedBoostIds] = usePostLocalBoostIdsMutation();
  const [postExtendedSearchByUsers] = usePostLocalSearchByUsersMutation();

  const farmIdsExtended = searchedFarmsExtended?.map((el: any) => el?.farmId);
  const stallionIdsExtended = searchedStallionExtendedSelected?.map((el: any) => el?.stallionId);
  const countryIdsExtended = countriesSelectedExtended?.map((el: any) => el?.id);
  const statesIdsExtended = statesListSelected?.map((el: any) => el?.id);
  const damSireIdsExtended = damSireSearchedSelected?.map((el: any) => el?.sireUuid);
  const trackedDamSiresExtended = trackedDamSireSelected?.map((el: any) => el?.horseId);
  const trackedFarmsSelectedIdsExtended = trackedFarmsExtendedSelected?.map(
    (el: any) => el?.farmId
  );
  const trackedStallionsSelectedIdsExtended = trackedStallionsExtendedSelected?.map(
    (el: any) => el?.stallionId
  );
  let extendedBoostIdsPayload = {
    farms: farmIdsExtended,
    stallions: stallionIdsExtended,
    countries: countryIdsExtended,
    states: statesIdsExtended,
    damSireSearched: damSireIdsExtended,
    damSireTracked: trackedDamSiresExtended,
    farmsTracked: trackedFarmsSelectedIdsExtended,
    stallionsTracked: trackedStallionsSelectedIdsExtended,
  };

  let extendedSearchByUsersPayload = {
    order: 'ASC',
    farmIds: farmIdsExtended,
    countries: countryIdsExtended,
  };

  // set all the fields based on selection
  React.useEffect(() => {
    if (
      searchedFarmsExtended.length > 0 ||
      searchedStallionExtendedSelected.length > 0 ||
      countriesSelectedExtended.length > 0 ||
      statesListSelected.length > 0 ||
      damSireSearchedSelected.length > 0 ||
      trackedDamSireSelected.length > 0 ||
      trackedFarmsExtendedSelected.length > 0 ||
      trackedStallionsExtendedSelected.length > 0
    ) {
      postExtendedBoostIds(extendedBoostIdsPayload).then((res: any) => {
        setRecipientsCountExtended(res?.data?.recipients);
        setCountiesCountExtended(res?.data?.countries);
      });

      postExtendedSearchByUsers(extendedSearchByUsersPayload).then((res: any) => {
        setSearchedStallionExtended(res?.data?.searchedStallions);
        const countriesList = res?.data?.countries;
        const ids = countriesList.map((o: any) => o.id);
        const filtered = countriesList.filter(
          ({ id }: any, index: any) => !ids.includes(id, index + 1)
        );
        setCountriesListExtended(filtered);
        setTrackedDamSireList(res?.data?.TrackedDamsire);
        setTrackedFarmsExtended(res?.data?.TrackedFarms);
        setTrackedStallionsExtended(res?.data?.TrackedStallions);
      });
    } else {
      setSearchedStallionExtended([]);
      setSearchedStallionExtended([]);
      setCountriesListExtended([]);
      setTrackedDamSireList([]);
      setTrackedFarmsExtended([]);
      setTrackedStallionsExtended([]);
      setRecipientsCountExtended(0);
      setCountiesCountExtended(0);
    }
  }, [
    searchedFarmsExtended,
    searchedStallionExtendedSelected,
    countriesSelectedExtended,
    statesListSelected,
    damSireSearchedSelected,
    trackedDamSireSelected,
    trackedFarmsExtendedSelected,
    trackedStallionsExtendedSelected,
  ]);

  // validations for local boost form
  let validateLocalBoostForm = () => {
    /*eslint-disable */
    // let fields = state;
    let errors = {};
    let formIsValid = true;

    // @ts-ignore
    if (localFromName == '') {
      formIsValid = false; //@ts-ignore
      errors['localFromName'] = `From Name is required`;
    }
    if (messageEditorValueLocal == '' || messageEditorValueLocal == '<p><br></p>') {
      formIsValid = false; //@ts-ignore
      errors['messageEditorValueLocal'] = `Message is required`;
    }
    if (searchedFarmsLocal.length === 0) {
      formIsValid = false; //@ts-ignore
      errors['searchedFarmsLocal'] = `Searched Farms is required`;
    }
    if (searchedStallionLocalSelected.length === 0) {
      formIsValid = false; //@ts-ignore
      errors['searchedStallionLocalSelected'] = `Searched Stallions is required`;
    }
    setErrors(errors);
    return formIsValid;
    /*eslint-enable */
  };

  // validations for extended boost form
  let validateExtendedBoostForm = () => {
    /*eslint-disable */
    // let fields = state;
    let errors = {};
    let formIsValid = true;

    // @ts-ignore
    if (extendedFromName == '') {
      formIsValid = false; //@ts-ignore
      errors['extendedFromName'] = `From Name is required`;
    }
    if (searchedFarmsExtended.length === 0) {
      formIsValid = false; //@ts-ignore
      errors['searchedFarmsExtended'] = `Searched Farms is required`;
    }
    if (searchedStallionExtendedSelected.length === 0) {
      formIsValid = false; //@ts-ignore
      errors['searchedStallionExtendedSelected'] = `Searched Stallions is required`;
    }
    if (countriesSelectedExtended.length === 0) {
      formIsValid = false; //@ts-ignore
      errors['countriesSelectedExtended'] = `Country(s) is required`;
    }
    if (messageEditorValueExtended == '' || messageEditorValueExtended == '<p><br></p>') {
      formIsValid = false; //@ts-ignore
      errors['messageEditorValueExtended'] = `Message is required`;
    }
    setErrors(errors);
    return formIsValid;
    /*eslint-enable */
  };

  // defaultValues
  let defaultValues = React.useMemo(
    () => ({
      localFromName: currentFarm?.localFromName || '',
      localMessageLocal: currentFarm?.localMessageLocal || '',
      messageEditorValueLocal: currentFarm?.messageEditorValueLocal || '',
      searchedFarmsLocal: currentFarm?.searchedFarmsLocal || [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewFarmSchema),
    // mode: 'onTouched',
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

  // API call for POST local boost
  const [postLocalBoost] = usePostLocalBoostMutation();

  let localBoostPayload = {
    fromName: localFromName,
    message: messageEditorValueLocal,
    farms: farmIds,
    stallions: stallionIds,
  };

  const stateIdsExtended = statesListSelected?.map((el: any) => el?.id);
  const trackedDamSireIdsExtended = trackedDamSireSelected?.map((el: any) => el?.horseId);
  const trackedFarmsIdsExtended = trackedFarmsExtendedSelected?.map((el: any) => el?.farmId);
  const trackedStallionsIdsExtended = trackedStallionsExtendedSelected?.map(
    (el: any) => el?.stallionId
  );
  const damSireSearchedIdsExtended = damSireSearchedSelected?.map((el: any) => el?.sireUuid);

  // API call for POST extended boost
  const [postExtendedBoost] = usePostExtendedBoostMutation();

  let extendedBoostPayload = {
    fromName: extendedFromName,
    message: messageEditorValueExtended,
    farms: farmIdsExtended,
    countries: countryIdsExtended,
    states: stateIdsExtended,
    stallions: stallionIdsExtended,
    damSireSearched: damSireSearchedIdsExtended,
    damSireTracked: trackedDamSireIdsExtended,
    farmsTracked: trackedFarmsIdsExtended,
    stallionsTracked: trackedStallionsIdsExtended,
  };

  // submit handler for boosts
  const onSubmit = async (data: FormValuesProps) => {
    if (!isExtendedBoostElements) {
      if (!validateLocalBoostForm()) return;
      try {
        let res: any = await postLocalBoost(localBoostPayload);
        if (res?.error) {
          setApiStatusMsg({
            status: 422,
            message: '<b>There was a problem in sending Local Boost!</b>',
          });
          setApiStatus(true);
        } else {
          handleDrawerCloseRow();
          setApiStatusMsg({
            status: 201,
            message: '<b>Boosted Successfully!</b>',
          });
          setApiStatus(true);
        }
      } catch (error) {}
    } else {
      if (!validateExtendedBoostForm()) return;
      try {
        let res: any = await postExtendedBoost(extendedBoostPayload);
        if (res?.error) {
          setApiStatusMsg({
            status: 422,
            message: '<b>There was a problem in sending Extended Boost!</b>',
          });
          setApiStatus(true);
        } else {
          handleDrawerCloseRow();
          setApiStatusMsg({
            status: 201,
            message: '<b>Boosted Successfully!</b>',
          });
          setApiStatus(true);
        }
      } catch (error) {}
    }
  };

  return (
    // drawer section
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
        {isEdit === undefined && messageModuleAccessAddBtn.message_send_new_boost === false ? <UnAuthorized /> :
        <Box px={4} className="edit-section" sx={{ paddingTop: '0px !important' }}>
          {/* form section */}
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Box px={0}>
              <Grid
                container
                spacing={3}
                mt={0}
                pt={0}
                className="RaceListModalBox ViewConversationModal"
              >
                <Grid item xs={12} md={12} mt={0} mx={1} className="racelistgroup boost-radiogroup">
                  <Typography
                    variant="h4"
                    className="ImportedHeader"
                    sx={{ paddingLeft: '0px !important', paddingBottom: '5px !important' }}
                  >
                    Stallion Boost
                  </Typography>
                  <Box className="RadioGroupWrapper" mx={1}>
                    <RHFRadioGroup
                      value={boostValue}
                      onChange={handleBoostChange}
                      sx={{ margin: '0px !important' }}
                      className="RadioList gelding-display"
                      name="boostType"
                      options={BOOST_TYPE_OPTIONS_VALUE}
                      getOptionLabel={BOOST_TYPE_OPTIONS}
                    />
                  </Box>
                </Grid>

                {/* local boost section */}
                {!isExtendedBoostElements ? (
                  <Grid container spacing={3} mt={3} pt={0} px={3} pr={0} className="LocalBoostBox">
                    <Grid container spacing={3} px={4}>
                      <Grid item xs={6} md={6} mt={3} className="racelistgroup">
                        <Box className="FormGroup">
                          <TextField
                            error={errors.localFromName? true : false}
                            placeholder="Enter From Name"
                            className="form-control edit-field"
                            value={toPascalCase(localFromName)}
                            onChange={(e) => setLocalFromName(e.target.value)}
                          />
                          {errors.localFromName && <div className="errorMsg">{errors.localFromName}</div>}
                        </Box>
                        <Box className="FormGroup">
                          <Box className="edit-field">
                            {/* Searched Farm(s) */}
                            <Autocomplete
                              ChipProps={{ deleteIcon: <CloseIcon /> }}
                              popupIcon={<KeyboardArrowDownRoundedIcon />}
                              options={farmsLocalLists || []}
                              disablePortal
                              multiple
                              disableCloseOnSelect
                              onInputChange={handleLocalFarmsInput}
                              getOptionLabel={(option: any) =>
                                option.label ?? toPascalCase(option?.farmName)?.toString()
                              }
                              value={searchedFarmsLocal}
                              renderOption={(props, option: any, { selected }) => (
                                <li {...props} className="MuiAutocomplete-option">
                                  <span
                                    className="autocompleteTitle"
                                    style={{
                                      width: '90%',
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
                                  error = {errors.searchedFarmsLocal? true : false}
                                  placeholder={searchedFarmsLocal.length ? '' : `Searched Farm(s)`}
                                />
                              )}
                              onChange={(e: any, selectedOptions: any) =>
                                handleSelectedFarmsLocal(selectedOptions)
                              }
                              className="AutoCompleteBox"
                              sx={{ margin: '0px', padding: '0px' }}
                            />
                            {errors.searchedFarmsLocal && <div className="errorMsg">{errors.searchedFarmsLocal}</div>}
                          </Box>
                        </Box>

                        <Box className="FormGroup">
                          <Box className="edit-field">
                            {/* Searched Stallion(s) */}
                            <Autocomplete
                              ChipProps={{ deleteIcon: <CloseIcon /> }}
                              popupIcon={<KeyboardArrowDownRoundedIcon />}
                              options={searchedStallionLocal || []}
                              disablePortal
                              multiple
                              disableCloseOnSelect
                              getOptionLabel={(option: any) =>
                                option.label ?? toPascalCase(option?.stallionName)?.toString()
                              }
                              renderOption={(props, option: any, { selected }) => (
                                <li {...props} className="MuiAutocomplete-option">
                                  <span
                                    className="autocompleteTitle"
                                    style={{
                                      width: '90%',
                                      whiteSpace: 'break-spaces',
                                    }}
                                  >
                                    {toPascalCase(option?.stallionName)}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                    icon={<img src={Images.unchecked} alt="checkbox" />}
                                    checked={searchedStallionLocalSelected.some(
                                      (v: any) => option.stallionId == v.stallionId
                                    )}
                                    disableRipple
                                  />
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error = {errors.searchedStallionLocalSelected? true : false}
                                  placeholder={
                                    searchedStallionLocalSelected.length
                                      ? ''
                                      : `Searched Stallion(s)`
                                  }
                                />
                              )}
                              value={searchedStallionLocalSelected}
                              onChange={(e: any, selectedOptions: any) =>
                                handleSearchedStallionLocal(selectedOptions)
                              }
                              className="AutoCompleteBox"
                              sx={{ margin: '0px', padding: '0px' }}
                            />
                            {errors.searchedStallionLocalSelected && <div className="errorMsg">{errors.searchedStallionLocalSelected}</div>}
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6} md={6} mt={9} className="racelistgroup">
                        <Box className="FormGroup" pl={4}>
                          <List className="RawDataList">
                            <ListItem>
                              <ListItemText
                                primary="Recipients:"
                                secondary={recipientsCountLocal ? recipientsCountLocal : 0}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Countries:"
                                secondary={countiesCountLocal ? countiesCountLocal : 0}
                              />
                            </ListItem>
                          </List>
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                      {/* message box */}
                      <Box className="FormGroup">
                        <Typography
                          variant="h4"
                          className="ImportedHeader"
                          sx={{ paddingLeft: '9px !important', paddingBottom: '0px !important' }}
                        >
                          Message
                        </Typography>
                        <Box className={`rhf-editor-wrapper new-messages-rhf-editor ${errors.messageEditorValueLocal ? 'error' : ''}`}>
                          <RHFEditor
                            placeholder=""
                            className="rhf-editor-block"
                            name="message"
                            value={messageEditorValueLocal}
                            onChange={(e) => setMessageEditorValueLocal(e)}
                            messageEditor={'messageEditor'}
                          />
                        </Box>
                        {errors.messageEditorValueLocal && <div className="errorMsg">{errors.messageEditorValueLocal}</div>}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>
                      <Stack sx={{ mt: 1 }} className="DrawerBtnWrapper">
                        <Grid container spacing={4} px={2} className="DrawerBtnBottom">
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
                          <Grid item xs={6} md={6} sx={{ paddingTop: '9px !important' }}>
                            <Button
                              type="button"
                              fullWidth
                              className="add-btn"
                              onClick={handleDrawerCloseRow}
                            >
                              Cancel
                            </Button>
                          </Grid>
                        </Grid>
                      </Stack>
                    </Grid>
                    {/* local boost section end */}
                  </Grid>
                ) : (
                  <Grid
                    container
                    spacing={3}
                    mt={0}
                    pt={0}
                    px={3}
                    className="LocalBoostBox ExtendedBoostBox"
                  >
                    {/* extended boost section */}
                    <Grid container spacing={1} px={4}>
                      <Grid item xs={6} md={6} mt={4} className="racelistgroup">
                        <Box className="FormGroup">
                          <TextField
                            placeholder="Enter From Name"
                            className="form-control edit-field"
                            value={toPascalCase(extendedFromName)}
                            onChange={(e) => setExtendedFromName(e.target.value)}
                          />
                          <div className="errorMsg">{errors.extendedFromName}</div>
                        </Box>

                        <Box className="FormGroup">
                          <Box className="edit-field">
                            {/* Searched Farm(s) */}
                            <Autocomplete
                              ChipProps={{ deleteIcon: <CloseIcon /> }}
                              popupIcon={<KeyboardArrowDownRoundedIcon />}
                              options={farmsExtendedLists || []}
                              disablePortal
                              multiple
                              disableCloseOnSelect
                              onInputChange={handleExtendedFarmsInput}
                              getOptionLabel={(option: any) =>
                                option.label ?? toPascalCase(option?.farmName)?.toString()
                              }
                              value={searchedFarmsExtended}
                              renderOption={(props, option: any, { selected }) => (
                                <li {...props} className="MuiAutocomplete-option">
                                  <span
                                    className="autocompleteTitle"
                                    style={{
                                      width: '90%',
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
                                  error = {errors.searchedFarmsExtended? true : false}
                                  placeholder={
                                    searchedFarmsExtended.length ? '' : `Searched Farm(s)`
                                  }
                                />
                              )}
                              onChange={(e: any, selectedOptions: any) =>
                                handleSelectedFarmsExtended(selectedOptions)
                              }
                              className="AutoCompleteBox"
                              sx={{ margin: '0px', padding: '0px' }}
                            />
                            {errors.searchedFarmsExtended && <div className="errorMsg">{errors.searchedFarmsExtended}</div>}
                          </Box>
                        </Box>

                        <Box className="FormGroup">
                          <Box className="edit-field">
                            <Autocomplete
                              ChipProps={{ deleteIcon: <CloseIcon /> }}
                              popupIcon={<KeyboardArrowDownRoundedIcon />}
                              options={searchedStallionExtended || []}
                              disablePortal
                              multiple
                              disableCloseOnSelect
                              getOptionLabel={(option: any) =>
                                option.label ?? toPascalCase(option?.stallionName)?.toString()
                              }
                              renderOption={(props, option: any, { selected }) => (
                                <li {...props} className="MuiAutocomplete-option">
                                  <span
                                    className="autocompleteTitle"
                                    style={{
                                      width: '90%',
                                      whiteSpace: 'break-spaces',
                                    }}
                                  >
                                    {toPascalCase(option?.stallionName)}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                    icon={<img src={Images.unchecked} alt="checkbox" />}
                                    checked={searchedStallionExtendedSelected.some(
                                      (v: any) => option.stallionId == v.stallionId
                                    )}
                                    disableRipple
                                  />
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error = {errors.searchedStallionExtendedSelected? true : false}
                                  placeholder={
                                    searchedStallionExtendedSelected.length
                                      ? ''
                                      : `Searched Stallion(s)`
                                  }
                                />
                              )}
                              value={searchedStallionExtendedSelected}
                              onChange={(e: any, selectedOptions: any) =>
                                handleSearchedStallionExtended(selectedOptions)
                              }
                              className="AutoCompleteBox"
                              sx={{ margin: '0px', padding: '0px' }}
                            />
                            {errors.searchedStallionExtendedSelected && <div className="errorMsg">
                              {errors.searchedStallionExtendedSelected}
                            </div>}
                          </Box>
                        </Box>

                        <Box className="FormGroup">
                          <Box className="edit-field">
                            {/* Select Country(s) */}
                            <Autocomplete
                              ChipProps={{ deleteIcon: <CloseIcon /> }}
                              popupIcon={<KeyboardArrowDownRoundedIcon />}
                              options={countriesListExtended || []}
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
                                      width: '90%',
                                      whiteSpace: 'break-spaces',
                                    }}
                                  >
                                    {toPascalCase(option?.countryName)}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                    icon={<img src={Images.unchecked} alt="checkbox" />}
                                    checked={countriesSelectedExtended.some(
                                      (v: any) => option.id == v.id
                                    )}
                                    disableRipple
                                  />
                                </li>
                              )}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  error = {errors.countriesSelectedExtended? true : false}
                                  placeholder={
                                    countriesSelectedExtended.length ? '' : `Select Country(s)`
                                  }
                                />
                              )}
                              value={countriesSelectedExtended}
                              onChange={(e: any, selectedOptions: any) =>
                                handleCountriesSelectedExtended(selectedOptions)
                              }
                              className="AutoCompleteBox"
                              sx={{ margin: '0px', padding: '0px' }}
                            />
                            {errors.countriesSelectedExtended && <div className="errorMsg">{errors.countriesSelectedExtended}</div>}
                          </Box>
                        </Box>

                        <Box className="FormGroup">
                          <Box className="edit-field">
                            {/* Select Dam Sire Searched */}
                            <Autocomplete
                              ChipProps={{ deleteIcon: <CloseIcon /> }}
                              popupIcon={<KeyboardArrowDownRoundedIcon />}
                              options={damSireSearched || []}
                              disablePortal
                              multiple
                              disableCloseOnSelect
                              getOptionLabel={(option: any) =>
                                option.label ?? toPascalCase(option?.sireName)?.toString()
                              }
                              onInputChange={handleDamSireInput}
                              renderOption={(props, option: any, { selected }) => (
                                <li {...props} className="MuiAutocomplete-option">
                                  <span
                                    className="autocompleteTitle"
                                    style={{
                                      width: '90%',
                                      whiteSpace: 'break-spaces',
                                    }}
                                  >
                                    {toPascalCase(option?.sireName)}
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
                                    damSireSearchedSelected.length ? '' : `Select Dam Sire Searched`
                                  }
                                />
                              )}
                              value={damSireSearchedSelected}
                              onChange={(e: any, selectedOptions: any) =>
                                setDamSireSearchedSelected(selectedOptions)
                              }
                              className="AutoCompleteBox"
                              sx={{ margin: '0px', padding: '0px' }}
                            />
                          </Box>
                        </Box>

                        <Box className="FormGroup">
                          <Box className="edit-field">
                            {/* Tracked Farm(s) */}
                            <Autocomplete
                              ChipProps={{ deleteIcon: <CloseIcon /> }}
                              popupIcon={<KeyboardArrowDownRoundedIcon />}
                              options={trackedFarmsExtended || []}
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
                                      width: '90%',
                                      whiteSpace: 'break-spaces',
                                    }}
                                  >
                                    {toPascalCase(option?.farmName)}
                                  </span>
                                  <Checkbox
                                    checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                    icon={<img src={Images.unchecked} alt="checkbox" />}
                                    checked={trackedFarmsExtendedSelected.some(
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
                                    trackedFarmsExtendedSelected.length ? '' : `Tracked Farm(s)`
                                  }
                                />
                              )}
                              value={trackedFarmsExtendedSelected}
                              onChange={(e: any, selectedOptions: any) =>
                                handleTrackedFarmsExtended(selectedOptions)
                              }
                              className="AutoCompleteBox"
                              sx={{ margin: '0px', padding: '0px' }}
                            />
                          </Box>
                        </Box>
                      </Grid>

                      <Grid item xs={6} md={6} mt={3} className="racelistgroup newboost-group">
                        <Box>
                          <Box className="FormGroup" pl={4}>
                            <List className="RawDataList">
                              <ListItem>
                                <ListItemText
                                  primary="Recipients:"
                                  secondary={recipientsCountExtended ? recipientsCountExtended : 0}
                                />
                              </ListItem>
                              <ListItem>
                                <ListItemText
                                  primary="Countries:"
                                  secondary={countiesCountExtended ? countiesCountExtended : 0}
                                />
                              </ListItem>
                            </List>
                          </Box>
                        </Box>
                        <Box>
                          <Box className="FormGroup" sx={{ mt: 2 }}>
                            <Box className="edit-field">
                              {/* Select State(s) */}
                              {countriesSelectedExtended?.length ? (
                                <Autocomplete
                                  fullWidth
                                  ChipProps={{ deleteIcon: <CloseIcon /> }}
                                  popupIcon={<KeyboardArrowDownRoundedIcon />}
                                  options={statesData || []}
                                  disablePortal
                                  multiple
                                  disableCloseOnSelect
                                  getOptionLabel={(option: any) =>
                                    option.label ?? toPascalCase(option?.stateName)?.toString()
                                  }
                                  renderOption={(props, option: any, { selected }) => (
                                    <li {...props} className="MuiAutocomplete-option">
                                      <span
                                        className="autocompleteTitle"
                                        style={{
                                          width: '90%',
                                          whiteSpace: 'break-spaces',
                                        }}
                                      >
                                        {toPascalCase(option?.stateName)}
                                      </span>
                                      <Checkbox
                                        checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                        icon={<img src={Images.unchecked} alt="checkbox" />}
                                        checked={statesListSelected.some(
                                          (v: any) => option.id == v.id
                                        )}
                                        disableRipple
                                      />
                                    </li>
                                  )}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder={
                                        statesListSelected.length ? '' : `Select State(s)`
                                      }
                                    />
                                  )}
                                  value={statesListSelected}
                                  onChange={(e: any, selectedOptions: any) =>
                                    handlestatesListSelected(selectedOptions)
                                  }
                                  className="AutoCompleteBox"
                                  sx={{ margin: '0px', padding: '0px' }}
                                />
                              ) : (
                                ''
                              )}
                            </Box>
                          </Box>

                          <Box className="FormGroup" sx={{ mt: 5.5 }}>
                            <Box className="edit-field">
                              {/* Tracked Dam Sire */}
                              <Autocomplete
                                fullWidth
                                ChipProps={{ deleteIcon: <CloseIcon /> }}
                                popupIcon={<KeyboardArrowDownRoundedIcon />}
                                options={
                                  (searchedFarmsExtended.length > 0 && trackedDamSireList) || []
                                }
                                disablePortal
                                multiple
                                disableCloseOnSelect
                                getOptionLabel={(option: any) =>
                                  option.label ?? toPascalCase(option?.horseName)?.toString()
                                }
                                renderOption={(props, option: any, { selected }) => (
                                  <li {...props} className="MuiAutocomplete-option">
                                    <span
                                      className="autocompleteTitle"
                                      style={{
                                        width: '90%',
                                        whiteSpace: 'break-spaces',
                                      }}
                                    >
                                      {toPascalCase(option?.horseName)}
                                    </span>
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                      icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={trackedDamSireSelected.some(
                                        (v: any) => option.horseId == v.horseId
                                      )}
                                      disableRipple
                                    />
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder={
                                      trackedDamSireSelected.length ? '' : `Tracked Dam Sire`
                                    }
                                  />
                                )}
                                value={trackedDamSireSelected}
                                onChange={(e: any, selectedOptions: any) =>
                                  handleTrackedDamSireSelected(selectedOptions)
                                }
                                className="AutoCompleteBox"
                                sx={{ margin: '0px', padding: '0px' }}
                              />
                            </Box>
                          </Box>

                          <Box className="FormGroup">
                            <Box className="edit-field">
                              {/* Tracked Stallion(s) */}
                              <Autocomplete
                                ChipProps={{ deleteIcon: <CloseIcon /> }}
                                popupIcon={<KeyboardArrowDownRoundedIcon />}
                                options={trackedStallionsExtended || []}
                                disablePortal
                                multiple
                                disableCloseOnSelect
                                getOptionLabel={(option: any) =>
                                  option.label ?? toPascalCase(option?.stallionName)?.toString()
                                }
                                renderOption={(props, option: any, { selected }) => (
                                  <li {...props} className="MuiAutocomplete-option">
                                    <span
                                      className="autocompleteTitle"
                                      style={{
                                        width: '90%',
                                        whiteSpace: 'break-spaces',
                                      }}
                                    >
                                      {toPascalCase(option?.stallionName)}
                                    </span>
                                    <Checkbox
                                      checkedIcon={<img src={Images.checked} alt="checkbox" />}
                                      icon={<img src={Images.unchecked} alt="checkbox" />}
                                      checked={trackedStallionsExtendedSelected.some(
                                        (v: any) => option.stallionId == v.stallionId
                                      )}
                                      disableRipple
                                    />
                                  </li>
                                )}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder={
                                      trackedStallionsExtendedSelected.length
                                        ? ''
                                        : `Tracked Stallion(s)`
                                    }
                                  />
                                )}
                                value={trackedStallionsExtendedSelected}
                                onChange={(e: any, selectedOptions: any) =>
                                  handleTrackedStallionExtended(selectedOptions)
                                }
                                className="AutoCompleteBox"
                                sx={{ margin: '0px', padding: '0px' }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={12} mt={2} className="racelistgroup">
                      {/* message box */}
                      <Box className="FormGroup">
                        <Typography
                          variant="h4"
                          className="ImportedHeader"
                          sx={{ paddingLeft: '9px !important', paddingBottom: '0px !important' }}
                        >
                          Message
                        </Typography>
                        <Box className={`rhf-editor-wrapper new-messages-rhf-editor ${errors.messageEditorValueExtended ? 'error' : ''}`}>
                          <RHFEditor
                            placeholder=""
                            className="rhf-editor-block"
                            name="messageExtended"
                            value={messageEditorValueExtended}
                            onChange={(e) => setMessageEditorValueExtended(e)}
                            messageEditor={'messageEditor'}
                          />
                        </Box>
                        {errors.messageEditorValueExtended && <div className="errorMsg">{errors.messageEditorValueExtended}</div>}
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={12} mt={0} sx={{ paddingTop: '0px !important' }}>
                      <Stack sx={{ mt: 1 }} className="DrawerBtnWrapper">
                        <Grid container spacing={4} px={2} className="DrawerBtnBottom">
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

                          <Grid item xs={6} md={6} sx={{ paddingTop: '9px !important' }}>
                            <Button
                              type="button"
                              fullWidth
                              className="add-btn"
                              onClick={handleDrawerCloseRow}
                            >
                              Cancel
                            </Button>
                          </Grid>
                        </Grid>
                      </Stack>
                    </Grid>
                  </Grid>
                )}
              </Grid>
              {/* extended boost section end */}
            </Box>
          </FormProvider>
        </Box>
        }
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

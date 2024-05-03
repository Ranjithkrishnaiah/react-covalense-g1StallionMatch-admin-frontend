import React, { useState, useEffect } from 'react';
// @mui
import { styled } from '@mui/material/styles';
import { Input, Slide, Button, InputAdornment, ClickAwayListener, Stack, Box, StyledEngineProvider } from '@mui/material';
// utils
import cssStyles from 'src/utils/cssStyles';
// components
import Iconify from 'src/components/Iconify';
import { IconButtonAnimate } from 'src/components/animate';
import AccountPopover from './AccountPopover';
import NotificationsPopover from './NotificationsPopover';
// dom
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
//import StallionNewEditModal from 'src/sections/@dashboard/stallion/StallionNewEditModal';
import { WrapperDialog } from 'src/components/wrapper/Wrapper';
import SettingsPopover from './SettingsPopover';
import FarmNewEditModal from 'src/sections/@dashboard/farm/FarmNewEditModal';
//import StallionNewAddModal from 'src/sections/@dashboard/stallion/StallionNewAddModal';
import StallionNewEditModal from 'src/sections/@dashboard/stallion/StallionNewEditModal';
import RaceNewEditModal from 'src/sections/@dashboard/race/RaceNewEditModal';
import RunnerNewEditModal from 'src/sections/@dashboard/runner/RunnerNewEditModal';
import NewMessageModal from 'src/sections/@dashboard/messages/NewMessageModal';
import NewBoostModal from 'src/sections/@dashboard/messages/NewBoostModal';
import OrderReportModal from 'src/sections/@dashboard/reports/OrderReportModal';
import ReportQueueModal from 'src/sections/@dashboard/reports/ReportQueueModal';
import ProductsNewEditModal from 'src/sections/@dashboard/products/ProductsNewEditModal';
import PromoCodesNewEditModal from 'src/sections/@dashboard/products/PromoCodesNewEditModal';
import UserManagementNewEditModal from 'src/sections/@dashboard/system/usermanagement/UserManagementNewEditModal';
import UserManagementEditModal from 'src/sections/@dashboard/system/usermanagement/UserManagementEditModal';
import SalesNewEditModal from 'src/sections/@dashboard/sales/NewSalesViewDetailsModal';
import { PATH_DASHBOARD } from 'src/routes/paths';
import ProductsEditModal from 'src/sections/@dashboard/products/ProductsEditModal';
import PromoCodesEditModal from 'src/sections/@dashboard/products/PromoCodesEditModal';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Autocomplete, TextField, SxProps } from '@mui/material';
import { useHorseHeaderKeywordSearchQuery } from 'src/redux/splitEndpoints/horseSplit';
import { debounce } from 'lodash';
import { toPascalCase } from 'src/utils/customFunctions';
import { useDispatch, useSelector } from 'react-redux';
import { setOrderReportOpened, setReportFilterOpened } from 'src/redux/slices/settings';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import {
  useGetAppPermissionByUserTokenQuery
} from 'src/redux/splitEndpoints/usermanagementSplit';
import { RaceHorseWrapperDialog } from 'src/components/horse-modal/RaceHorseWrapper';
import SessionExpired from 'src/components/WrappedDialog/SessionExpired';
// ----------------------------------------------------------------------

const APPBAR_MOBILE = 64;
const APPBAR_DESKTOP = 80;

const SearchbarStyle = styled('div')(({ theme }) => ({
  ...cssStyles(theme).bgBlur(),
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: APPBAR_MOBILE,
  padding: theme.spacing(0, 3),
  [theme.breakpoints.up('md')]: {
    height: APPBAR_DESKTOP,
    padding: theme.spacing(0, 3),
  },
}));

type Props = {
  apiStatus?: boolean,
  setApiStatus?: React.Dispatch<React.SetStateAction<boolean>>,
  apiStatusMsg?: any,
  setApiStatusMsg?: React.Dispatch<React.SetStateAction<any>>,
  getAddMpdal?: any,
  handleShowAddHorse?: any,
  handleRequireApproval?: any,
  moduleListProps?: any,
  isSearchClicked?: boolean;
};

// ----------------------------------------------------------------------

export default function Searchbar({
  apiStatus = false,
  setApiStatus,
  apiStatusMsg = false,
  setApiStatusMsg,
  getAddMpdal,
  handleShowAddHorse,
  handleRequireApproval,
  moduleListProps,
  isSearchClicked
}: Props) {
  const [isOpen, setOpen] = useState(true);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const dispatch = useDispatch()
  const handleClose = () => {
    setOpen(false);
  };

  const { pathname } = useLocation();
  const isData = pathname.includes('data') || pathname.includes('list');
  const currentPage: any = pathname.split("/");

  let comingFromEditScreen: any = window.localStorage.getItem('comingFromEditScreen');
  if (JSON.parse(comingFromEditScreen) === true && currentPage[2] !== 'horsedetails') {
    window.localStorage.setItem('comingFromEditScreen', JSON.stringify(false));
  }

  const ADMIN_DASHBOARD = '/dashboard';
  const addBtnLink = '/dashboard/' + currentPage[2] + '/' + 'new';

  let page = "";

  // Check the url for invite user, if link expired, open expired invite modal
  const [openSessionExpire, setOpenSessionExpire] = useState(false);
  const [sessionExpireError, setSessionExpireError] = useState<any>(null);
  const isTokenExpired = window.localStorage.getItem('isTokenExpired');

  useEffect(() => {
    if (isTokenExpired === 'Yes') {
      setOpenSessionExpire(true);
      setSessionExpireError('Please log in again to continue using the app.');
    }
  }, [isTokenExpired])

  const [valuesExist, setValuesExist] = useState<any>({});
  // const [userModuleAccessAddBtn, setUserModuleAccessAddBtn] = useState(
  //   {
  //     stallion: false,
  //     farm: false,
  //     horse: false,   
  //     member: false,
  //     user: false,
  //   }
  // );
  const { data: appPermissionListByUser, isFetching: isFetchingAccessLevel, isLoading: isLoadingAccessLevel, isSuccess: isSuccessAccessLevel } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });
  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
      let list: any = [];
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: true
          }));
        } else {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: false
          }));
        }
      }
    }
  }, [isSuccessAccessLevel, isFetchingAccessLevel]);

  // React.useEffect(() => {
  //   if(valuesExist.hasOwnProperty("FARM_ADMIN_CREATE_A_NEW_FARM")) {
  //     setUserModuleAccessAddBtn({
  //       ...userModuleAccessAddBtn,
  //       farm: true
  //     });
  //   }
  // },[valuesExist]);

  // console.log('userModuleAccessAddBtn>>>', userModuleAccessAddBtn);


  const [openStallionModal, setOpenStallionModal] = useState(false);
  const [openMembersModal, setOpenMembersModal] = useState(false);
  const [openFarmsModal, setOpenFarmsModal] = useState(false);
  const [openRaceModal, setOpenRaceModal] = useState(false);
  const [openRunnerModal, setOpenRunnerModal] = useState(false);
  const [openMessageModal, setOpenMessageModal] = useState(false);
  const [openBoostModal, setOpenBoostModal] = useState(false);
  const [isMessageBtnDisable, setIsMessageBtnDisable] = useState(false);
  const [isBoostBtnDisable, setIsBooostBtnDisable] = useState(false);

  const [openOrderReportModal, setOpenOrderReportModal] = useState(false);
  const [openReportQueueModal, setOpenReportQueueModal] = useState(false);
  const [isOrderBtnDisable, setIsOrderBtnDisable] = useState(false);
  const [isQueueBtnDisable, setIsQueueBtnDisable] = useState(false);

  const [openProductsNewEditModal, setOpenProductsNewEditModal] = useState(false);
  const [isProductsBtnDisable, setIsProductsBtnDisable] = useState(false);

  const [openPromoCodesNewEditModal, setOpenPromoCodesNewEditModal] = useState(false);
  const [isPromoCodesBtnDisable, setIsPromoCodesBtnDisable] = useState(false);

  const [openNewUserEditModal, setOpenNewUserEditModal] = useState(false);
  const [isNewUserBtnDisable, setIsNewUserBtnDisable] = useState(false);

  const [openSalesNewEditModal, setOpenSalesNewEditModal] = useState(false);
  const [isSalesBtnDisable, setIsSalesBtnDisable] = useState(false);

  const [openUpdateSalesModal, setOpenUpdateSalesModal] = useState(false);
  const [isUpdateSalesBtnDisable, setIsUpdateSalesBtnDisable] = useState(false);

  const [openSelectRaceHorseModal, setOpenSelectRaceHorseModal] = useState(false);

  // console.log(valuesExist.SALES_ADD_NEW_SALE,isSalesBtnDisable,'valuesExist')

  // const { orderReportOpened } = useSelector(user => user.filterSettings)
  const orderReportOpened = true;
  React.useEffect(() => {
    if (!orderReportOpened) {
      setIsOrderBtnDisable(false);
    }
  }, [orderReportOpened])

  React.useEffect(() => {
    getAddMpdal(setOpenStallionModal, openStallionModal)
  }, [openStallionModal])

  const handleOpenMenu = () => {
    setOpenStallionModal(true);
    setReset(false);
  };
  const handleCloseStallionModal = () => {
    setOpenStallionModal(false);
    setReset(true);
  };
  const handleOpenMembersModal = () => {
    setOpenMembersModal(true);
  };
  const handleCloseMembersModal = () => {
    setOpenMembersModal(false);
  };
  const handleOpenFarmsModal = () => {
    setOpenFarmsModal(true);
  };
  const handleCloseFarmsModal = () => {
    setOpenFarmsModal(false);
  };
  const handleOpenRaceModal = () => {
    setOpenRaceModal(true);
  };
  const handleCloseRaceModal = () => {
    setOpenRaceModal(false);
  };
  const handleOpenRunnerModal = () => {
    setOpenRunnerModal(true);
  };
  const handleCloseRunnerModal = () => {
    setOpenRunnerModal(false);
  };
  const handleOpenMessageModal = () => {
    if (openBoostModal === true)
      handleCloseBoostModal();
    setOpenMessageModal(true);
    setIsMessageBtnDisable(true);
  }
  const handleCloseMessageModal = () => {
    setOpenMessageModal(false);
    setIsMessageBtnDisable(false);
  };
  const handleOpenBoostModal = () => {
    if (openMessageModal === true)
      handleCloseMessageModal();
    setOpenBoostModal(true);
    setIsBooostBtnDisable(true);
  }
  const handleCloseBoostModal = () => {
    setOpenBoostModal(false);
    setIsBooostBtnDisable(false);
  };

  const handleOpenSelectRaceHorseModal = () => {
    setOpenSelectRaceHorseModal(true);
  };

  const handleCloseSelectRaceHorseModal = () => {
    setOpenSelectRaceHorseModal(false);
  };

  const handleOpenOrderReportModal = () => {

    dispatch(
      setReportFilterOpened(false)
    )
    dispatch(
      setOrderReportOpened(true)
    )

    if (openOrderReportModal === true)
      handleCloseOrderReportModal();
    setOpenOrderReportModal(true);
    setIsOrderBtnDisable(true);
  };
  const handleCloseOrderReportModal = () => {
    setOpenOrderReportModal(false);
    setIsOrderBtnDisable(false);
  };
  const handleOpenReportQueueModal = () => {
    navigate(PATH_DASHBOARD.reports.filter('requiredApproval'));
    if (openReportQueueModal === true)
      handleCloseReportQueueModal();
    handleRequireApproval();
    // setOpenReportQueueModal(true);
    // setIsQueueBtnDisable(true);    
  }
  const handleCloseReportQueueModal = () => {
    setOpenReportQueueModal(false);
    setIsQueueBtnDisable(false);
  };
  const handleOpenProductsNewEditModal = () => {
    if (openProductsNewEditModal === true)
      handleCloseProductsNewEditModal();
    setOpenProductsNewEditModal(true);
    setIsProductsBtnDisable(true);
  }
  const handleCloseProductsNewEditModal = () => {
    setOpenProductsNewEditModal(false);
    setIsProductsBtnDisable(false);
  };
  const handleOpenPromoCodesNewEditModal = () => {
    if (openPromoCodesNewEditModal === true)
      handleClosePromoCodesNewEditModal();
    setOpenPromoCodesNewEditModal(true);
    setIsPromoCodesBtnDisable(true);
  }
  const handleClosePromoCodesNewEditModal = () => {
    setOpenPromoCodesNewEditModal(false);
    setIsPromoCodesBtnDisable(false);
  };
  const handleOpenNewUserEditModal = () => {
    if (openNewUserEditModal === true)
      handleCloseNewUserEditModal();
    setOpenNewUserEditModal(true);
    setIsNewUserBtnDisable(true);
  }
  const handleCloseNewUserEditModal = () => {
    setOpenNewUserEditModal(false);
    setIsNewUserBtnDisable(false);
  };

  const handleOpenSalesNewEditModal = () => {
    if (openSalesNewEditModal === true)
      handleCloseSalesNewEditModal();
    setOpenSalesNewEditModal(true);
    setIsSalesBtnDisable(true);
  }
  const handleCloseSalesNewEditModal = () => {
    setOpenSalesNewEditModal(false);
    setIsSalesBtnDisable(false);
  };

  const resetStallionDashboard = () => {
    alert(1);
  }

  const [horseHeaderFilterData, setHorseHeaderFilterData] = React.useState<any>("");
  const [isHorseHeaderFilter, setIsHorseHeaderFilter] = React.useState(false);
  const [isClearHorseKeyword, setIsClearHorseKeyword] = useState(0);
  const [selectedHorseKeyword, setSelectedHorseKeyword] = useState<any>(null);

  const debouncedHorseHeaderSearch = React.useRef(
    debounce(async (searchedKeyword) => {
      if (searchedKeyword.length >= 3) {
        setHorseHeaderFilterData(searchedKeyword);
        setIsHorseHeaderFilter(true);
        refetch();
      } else {
        setIsHorseHeaderFilter(false);
      }
    }, 1000)
  ).current;

  const handleHorseKeywordInput = (e: any) => {
    setIsClearHorseKeyword(0);
    if (!e) return;
    if (e && e.target.value && isClearHorseKeyword === 0) {
      debouncedHorseHeaderSearch(e.target.value);
    } else {
      setSelectedHorseKeyword(null);
    }
  };

  const handleHorseKeywordReset = () => {
    setHorseHeaderFilterData('');
    setIsHorseHeaderFilter(false);
    setIsClearHorseKeyword(1);
  };


  const handleHorseKeywordSelect = (selectedOptions: any) => {
    if (selectedOptions) setSelectedHorseKeyword({ search: selectedOptions.search });
    // navigate(PATH_DASHBOARD.horsedetails.keywordsearch(selectedOptions?.horseName, selectedOptions?.horseID, selectedOptions?.horseType, selectedOptions?.countryid));
    if (selectedOptions?.type === 'Horse') {
      navigate(PATH_DASHBOARD.horsedetails.edit(selectedOptions?.uuid));
      setIsHorseHeaderFilter(false);
    } else if (selectedOptions?.type === 'Stallion') {
      navigate(PATH_DASHBOARD.stallions.keywordfilter(selectedOptions?.name, selectedOptions?.type));
    } else if (selectedOptions?.type === 'Farm') {
      navigate(PATH_DASHBOARD.farms.filter(selectedOptions?.name));
    } else if (selectedOptions?.type === 'Member') {
      navigate(PATH_DASHBOARD.members.userFilter(selectedOptions?.name));
    } else if (selectedOptions?.type === 'Race') {
      navigate(PATH_DASHBOARD.race.filter(selectedOptions?.name));
    } else if (selectedOptions?.type === 'Runner') {
      navigate(PATH_DASHBOARD.runnerdetails.runnerfilter(selectedOptions?.name));
    }
  }

  const { data, isError, isFetching, isLoading, isSuccess, refetch } = useHorseHeaderKeywordSearchQuery({ keyWord: horseHeaderFilterData }, { skip: (!isHorseHeaderFilter) }); //
  const horseKeywordFilterOptions = (isHorseHeaderFilter && isClearHorseKeyword === 0 && !isFetching) ? data : [];

  const [Reset, setReset] = useState(false);
  // console.log(valuesExist, 'valuesExistsearch')

  const renderSidebar = (value: string) => {
    switch (value) {
      case "stallions":
        return <StallionNewEditModal
          openAddEditForm={openStallionModal}
          isEdit={false}
          handleDrawerCloseRow={handleCloseStallionModal}
          Reset={Reset}
          setReset={setReset}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
          valuesExist={valuesExist} setValuesExist={setValuesExist}
        />
        break;
      case "members":
        return <WrapperDialog title="Invite New Member" open={openMembersModal} close={handleCloseMembersModal} valuesExist={valuesExist} setValuesExist={setValuesExist} />
        break;
      case "farms":
        return <FarmNewEditModal
          openAddEditForm={openFarmsModal}
          handleDrawerCloseRow={handleCloseFarmsModal}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
          valuesExist={valuesExist} setValuesExist={setValuesExist}
        />
        break;
      case "race":
        return <RaceNewEditModal openAddEditForm={openRaceModal} handleDrawerCloseRow={handleCloseRaceModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} valuesExist={valuesExist} setValuesExist={setValuesExist} />
        break;
      case "runnerdetails":
        return <RunnerNewEditModal openAddEditForm={openRunnerModal} handleDrawerCloseRow={handleCloseRunnerModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} valuesExist={valuesExist} setValuesExist={setValuesExist} />
        break;
      case "messages":
        return <><NewMessageModal openAddEditForm={openMessageModal} handleDrawerCloseRow={handleCloseMessageModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} valuesExist={valuesExist} setValuesExist={setValuesExist} /><NewBoostModal openAddEditForm={openBoostModal} handleDrawerCloseRow={handleCloseBoostModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} valuesExist={valuesExist} setValuesExist={setValuesExist} /></>
        break;
      case "reports":
        return <><OrderReportModal openAddEditForm={openOrderReportModal && orderReportOpened} handleDrawerCloseRow={handleCloseOrderReportModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} /><ReportQueueModal openAddEditForm={openReportQueueModal} handleDrawerCloseRow={handleCloseReportQueueModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} valuesExist={valuesExist} setValuesExist={setValuesExist} /></>
        break;

      case "products":
        return <><ProductsNewEditModal openAddEditForm={openProductsNewEditModal} isEdit={false} handleDrawerCloseRow={handleCloseProductsNewEditModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} /><PromoCodesEditModal isEdit={false} openAddEditForm={openPromoCodesNewEditModal} handleDrawerCloseRow={handleClosePromoCodesNewEditModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} /></>
        break;

      case "usermanagement":
        return <UserManagementEditModal openAddEditForm={openNewUserEditModal} handleDrawerCloseRow={handleCloseNewUserEditModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} valuesExist={valuesExist} setValuesExist={setValuesExist} isEdit={false} />
        break;

      case "sales":
        return <SalesNewEditModal isEdit={false} openAddEditForm={openSalesNewEditModal} handleDrawerCloseRow={handleCloseSalesNewEditModal} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
        break;

      case "racehorse":
        return <WrapperDialog title="Select a Horse" open={openSelectRaceHorseModal} close={handleCloseSelectRaceHorseModal} />


      // case "horsedetails":
      //   return window.open(addBtnLink);
      default:
        break;
    }
  }



  const navigate = useNavigate();

  const handleNewHorse = () => {
    navigate(PATH_DASHBOARD.horsedetails.new);
    // setTimeout(() => {
    //   window.location.reload();
    // }, 100)
    // handleShowAddHorse(true)
  }

  const BackToHorseDashboard = () => {
    navigate(PATH_DASHBOARD.horsedetails.data);
    handleShowAddHorse(false)
  }

  return (
    <StyledEngineProvider injectFirst>
      <Box className='HeaderSearch'>
        <SearchbarStyle className='HeaderSearchStyle' sx={{ height: '80px' }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }} flexGrow={1}>

          <Box className='FormGroup edit-field keysearch'>
              <Autocomplete
                disablePortal
                popupIcon={<KeyboardArrowDownRoundedIcon />}
                className="keywordSearch-box"
                id="customAutocomplete"
                options={horseKeywordFilterOptions || []}
                value={selectedHorseKeyword}
                getOptionLabel={(option: any) => option && toPascalCase(option?.search)}
                onInputChange={handleHorseKeywordInput}
                onChange={(e: any, selectedOptions: any) => handleHorseKeywordSelect(selectedOptions)}
                onBlur={() => handleHorseKeywordReset()}
                // freeSolo
                noOptionsText={
                  isHorseHeaderFilter &&
                  isClearHorseKeyword === 0 && (
                    <Box className="search-couldnot d-flex align-items-center justify-content-between mt-2 scroll-submit-stallion-wrp keysearch-box">
                      <span className="fw-bold sorry-message">
                      {isFetching
                        ? 'Loading...'
                        : `Sorry, we couldn't find any matches"`}
                    </span>
                    </Box>
                  )
                }
                disableClearable
                renderInput={params => {
                  return (  
                    <TextField
                      {...params}
                      variant="outlined"
                      placeholder={"Enter keywords ..."}
                      sx={{ mr: 1, background: '#FAF8F7', borderRadius: '6px', padding: '5px 10px' }}
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <Iconify
                                icon={'eva:search-fill'}
                                sx={{ color: 'text.disabled', width: 20, height: 20 }}
                              />
                            </InputAdornment>
                          </>
                        )
                      }}
                    />
                  );
                }}
              />
            </Box>


            {currentPage[2] !== "members" ?

              (currentPage[2] === 'messages' && !isSearchClicked) ?
                <>
                  <Button variant="contained" onClick={handleOpenMessageModal} className="add-btn" disabled={(isMessageBtnDisable) ? valuesExist.MESSAGING_ADMIN_SEND_NEW_MESSAGE === undefined ? true : true : valuesExist.MESSAGING_ADMIN_SEND_NEW_MESSAGE === undefined ? true : undefined}>New Message</Button>
                  <Button variant="contained" onClick={handleOpenBoostModal} className="add-btn green" disabled={(isBoostBtnDisable) ? valuesExist.MESSAGING_ADMIN_SEND_NEW_BOOST === undefined ? true : true : valuesExist.MESSAGING_ADMIN_SEND_NEW_BOOST === undefined ? true : undefined}>New Boost</Button>
                </>
                :
                (currentPage[2] === 'messages' && isSearchClicked) ?
                  <>
                    <Button variant="contained" onClick={moduleListProps?.clearAll} className='add-btn'>Dashboard</Button>
                    <Button variant="contained" onClick={handleOpenMessageModal} className="add-btn" disabled={(isMessageBtnDisable) ? valuesExist.MESSAGING_ADMIN_SEND_NEW_MESSAGE === undefined ? true : true : valuesExist.MESSAGING_ADMIN_SEND_NEW_MESSAGE === undefined ? true : undefined}>New Message</Button>
                    <Button variant="contained" onClick={handleOpenBoostModal} className="add-btn green" disabled={(isBoostBtnDisable) ? valuesExist.MESSAGING_ADMIN_SEND_NEW_BOOST === undefined ? true : true : valuesExist.MESSAGING_ADMIN_SEND_NEW_BOOST === undefined ? true : undefined}>New Boost</Button>
                  </>
                  :
                  (currentPage[4] === 'racehorse') ?
                    <>
                      <Button
                        variant="contained"
                        onClick={handleOpenSelectRaceHorseModal}
                        className='add-btn'
                      >
                        Add
                      </Button>
                    </>
                    :
                    (currentPage[2] === 'reports' && !isSearchClicked) ?
                      <>
                        <Button variant="contained"
                          onClick={handleOpenOrderReportModal}
                          className="add-btn"
                          disabled={(isOrderBtnDisable) ? true : undefined}
                        >Order Report</Button>
                        <Button variant="contained"
                          onClick={handleOpenReportQueueModal}
                          className="add-btn green"
                          disabled={(isQueueBtnDisable) ? true : undefined}
                        >Requires Approval</Button>
                      </>
                      :
                      (currentPage[2] === 'reports' && isSearchClicked) ?
                        <>
                          <Button
                            variant="contained"
                            onClick={moduleListProps?.clearAll}
                            className='add-btn'
                          >
                            Dashboard
                          </Button>
                          <Button variant="contained"
                            onClick={handleOpenOrderReportModal}
                            className="add-btn"
                            disabled={(isOrderBtnDisable) ? true : undefined}
                          >Order Report</Button>
                          <Button variant="contained"
                            onClick={handleOpenReportQueueModal}
                            className="add-btn green"
                            disabled={(isQueueBtnDisable) ? true : undefined}
                          >Requires Approval</Button>
                        </>
                        :

                        (currentPage[2] === 'products') ?
                          <>
                            {/* PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_ADD_NEW_PRODUCTS */}
                            <Button variant="contained" onClick={handleOpenProductsNewEditModal} disabled={valuesExist.PRODUCTS_PROMO_MANAGEMENT_PRODUCTS_ADD_NEW_PRODUCTS === undefined ? true : false} className="add-btn green">New Product</Button>
                            {/* <Button variant="contained" onClick={handleOpenProductsNewEditModal} className="add-btn green" disabled = {(isProductsBtnDisable) ? true : undefined}>New Product</Button>  */}
                            <Button variant="contained" onClick={handleOpenPromoCodesNewEditModal} className="add-btn" disabled={(isProductsBtnDisable) ? valuesExist.PRODUCTS_PROMO_MANAGEMENT_PROMOCODE_ADD_NEW_PROMOCODE === undefined ? true : true : valuesExist.PRODUCTS_PROMO_MANAGEMENT_PROMOCODE_ADD_NEW_PROMOCODE === undefined ? true : undefined}>New Promo Code</Button>
                          </>
                          :

                          (currentPage[2] === 'usermanagement') ?
                            <>
                              <Button variant="contained" onClick={handleOpenNewUserEditModal} className="add-btn green" disabled={(isProductsBtnDisable) ? valuesExist.ADMIN_USER_MANAGEMENT_CREATE_NEW_USER === undefined ? true : true : valuesExist.ADMIN_USER_MANAGEMENT_CREATE_NEW_USER === undefined ? true : undefined}>New User</Button>
                            </>
                            :

                            (currentPage[2] === 'notifications') ?
                              <>

                              </>
                              :
                              (currentPage[2] === 'marketing') ?
                                <>

                                </>
                                :
                                (currentPage[2] === 'horsedetails' && (currentPage[currentPage.length - 1] === "edit" || currentPage[currentPage.length - 1] === "new")) ?
                                  <Button
                                    variant="contained"
                                    onClick={BackToHorseDashboard}
                                    className='add-btn'
                                  >
                                    Back to Dashboard
                                  </Button>
                                  :
                                  (currentPage[2] === 'horsedetails' && !isSearchClicked && currentPage[currentPage.length - 1] !== "edit") ?
                                    <Button
                                      variant="contained"
                                      onClick={handleNewHorse}
                                      className='add-btn'
                                      disabled={valuesExist.HORSE_ADMIN_CREATE_A_NEW_HORSE === undefined ? true : false}
                                    >
                                      Add New
                                    </Button>
                                    :
                                    (currentPage[2] === 'horsedetails' && isSearchClicked && currentPage[currentPage.length - 1] !== "edit") ?
                                      <><Button
                                        variant="contained"
                                        onClick={moduleListProps?.clearAll}
                                        className='add-btn'
                                      >
                                        Dashboard
                                      </Button>
                                        <Button
                                          variant="contained"
                                          onClick={handleNewHorse}
                                          className='add-btn'
                                          disabled={valuesExist.HORSE_ADMIN_CREATE_A_NEW_HORSE === undefined ? true : false}
                                        >
                                          Add New
                                        </Button></>
                                      :
                                      (currentPage[2] === 'userprofile') ?
                                        <>

                                        </>
                                        :
                                        (currentPage[2] === 'systemactivities') ?
                                          <>

                                          </>
                                          :
                                          (currentPage[2] === 'settings') ?
                                            <>

                                            </>
                                            :
                                            (currentPage[2] === 'sales' && !isSearchClicked) ?
                                              <>
                                                <Button variant="contained" onClick={handleOpenSalesNewEditModal} className="add-btn green" disabled={(isSalesBtnDisable) ? valuesExist.SALES_ADD_NEW_SALE === undefined ? true : true : valuesExist.SALES_ADD_NEW_SALE === undefined ? true : undefined}>New Sale</Button>
                                                {/* <Button variant="contained" className="add-btn" disabled = {(isUpdateSalesBtnDisable) ? true : undefined}>Update Sale</Button> */}
                                              </>
                                              :
                                              (currentPage[2] === 'sales' && isSearchClicked) ?
                                                <>
                                                  <Button variant="contained" onClick={moduleListProps?.clearAll} className='add-btn'>Dashboard</Button>
                                                  <Button variant="contained" onClick={handleOpenSalesNewEditModal} className="add-btn green" disabled={(isSalesBtnDisable) ? valuesExist.SALES_ADD_NEW_SALE === undefined ? true : true : valuesExist.SALES_ADD_NEW_SALE === undefined ? true : undefined}>New Sale</Button>
                                                </>
                                                :
                                                (currentPage[2] === 'stallions' && isSearchClicked) ?
                                                  <>
                                                    <Button
                                                      variant="contained"
                                                      onClick={moduleListProps?.clearAll}
                                                      className='add-btn'
                                                    >
                                                      Dashboard
                                                    </Button>
                                                    <Button
                                                      variant="contained"
                                                      onClick={handleOpenMenu}
                                                      className='add-btn'
                                                    >
                                                      Add New
                                                    </Button>
                                                    )
                                                  </>
                                                  :
                                                  (currentPage[2] === 'stallions' && !isSearchClicked) ?
                                                    <>
                                                      <Button
                                                        variant="contained"
                                                        onClick={handleOpenMenu}
                                                        className='add-btn'
                                                      >
                                                        Add New
                                                      </Button>
                                                    </>
                                                    :
                                                    (currentPage[2] !== 'app' && isSearchClicked) ?
                                                      <>
                                                        <Button
                                                          variant="contained"
                                                          onClick={moduleListProps?.clearAll}
                                                          className='add-btn'
                                                        >
                                                          Dashboard
                                                        </Button>
                                                        <Button
                                                          variant="contained"
                                                          onClick={() => {
                                                            (currentPage[2] == 'race') ? handleOpenRaceModal() : (currentPage[2] == 'runnerdetails') ? handleOpenRunnerModal() : handleOpenFarmsModal();
                                                          }}
                                                          disabled={currentPage[2] == 'race' ? valuesExist.RACE_ADMIN_ADD_NEW_RACE === undefined ? true : (currentPage[2] == 'runnerdetails') ? valuesExist.RUNNER_ADMIN_ADD_NEW_RUNNER ? true : false : false : false}
                                                          className='add-btn'
                                                        >
                                                          Add
                                                        </Button>
                                                      </>
                                                      :
                                                      (currentPage[2] !== 'app' && !isSearchClicked) &&
                                                      <Button
                                                        variant="contained"
                                                        onClick={() => {
                                                          (currentPage[2] == 'race') ? handleOpenRaceModal() : (currentPage[2] == 'runnerdetails') ? handleOpenRunnerModal() : handleOpenFarmsModal();
                                                        }}
                                                        disabled={currentPage[2] == 'race' ? valuesExist.RACE_ADMIN_ADD_NEW_RACE === undefined ? true : (currentPage[2] == 'runnerdetails') ? valuesExist.RUNNER_ADMIN_ADD_NEW_RUNNER ? true : false : false : false}
                                                        className='add-btn'
                                                      >
                                                        Add
                                                      </Button>
              :
              (currentPage[2] === 'members' && isSearchClicked) ?
                <><Button
                  variant="contained"
                  onClick={moduleListProps?.clearAll}
                  className='add-btn'
                >
                  Dashboard
                </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      handleOpenMembersModal();
                    }}
                    className='add-btn'
                  >
                    Invite
                  </Button></>
                :
                <Button
                  variant="contained"
                  onClick={() => {
                    handleOpenMembersModal();
                  }}
                  className='add-btn'
                >
                  Invite
                </Button>}
          </Stack>

          <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1.5 }}>
            <SettingsPopover />
            <NotificationsPopover />
            <AccountPopover />
          </Stack>
        </SearchbarStyle>

        {renderSidebar(currentPage[2])}
        {currentPage[2] === "members" &&
          <WrapperDialog
            title="Invite New Member"
            open={openMembersModal}
            close={handleCloseMembersModal}
            apiStatus={true}
            setApiStatus={setApiStatus}
            apiStatusMsg={apiStatusMsg}
            setApiStatusMsg={setApiStatusMsg}
            valuesExist={valuesExist} setValuesExist={setValuesExist}
          />
        }
        {currentPage[4] === "racehorse" &&
          <RaceHorseWrapperDialog
            title="Select a Horse"
            open={openSelectRaceHorseModal}
            close={handleCloseSelectRaceHorseModal}
            apiStatus={true}
            setApiStatus={setApiStatus}
            apiStatusMsg={apiStatusMsg}
            setApiStatusMsg={setApiStatusMsg}
            valuesExist={valuesExist} setValuesExist={setValuesExist}
          />
        }

        <SessionExpired
          open={openSessionExpire}
          title={'Your session has expired'}
          onClose={() => setOpenSessionExpire(false)}
          sessionExpireError={sessionExpireError}
        />

      </Box>
    </StyledEngineProvider>
  );
}

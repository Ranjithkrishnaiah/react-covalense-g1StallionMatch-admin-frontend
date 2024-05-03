// @mu
import { Box, Container } from '@mui/material';
import Page from 'src/components/Page';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import DashboardHeader from 'src/layouts/dashboard/header';
import './dashboard.css';
import ProductsFilterSidebar from 'src/sections/@dashboard/products/filter/ProductFilterSidebar';
import DataAnalytics from 'src/sections/@dashboard/products/DataAnalytics';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
import { useEffect, useState } from 'react';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { Spinner } from 'src/components/Spinner';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';
// ----------------------------------------------------------------------
export default function ProductsData() {
  // react states
  const filterCounterhook = useCounter(0);
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';
  const [valuesExist, setValuesExist] = useState<any>({});
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [clickedPopover, setClickedPopover] = useState(false);
  const [productModuleAccess, setProductModuleAccess] = useState({
    // stallion_list: false,
    product_dashboard: false,
    product_dashboard_download: false,
    search_product_promocode: false,
    product_list_download: false,
    // stallion_edit: false,
    // stallion_edit_promoted_page: false,
    // stallion_feehistory: false,
    // horse_list: false,
  });
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
      for (const item of appPermissionListByUser) {
        if (item.value in SettingsPermissionList) {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: true,
          }));
        } else {
          setValuesExist((prevState: any) => ({
            ...prevState,
            [item.value]: false,
          }));
        }
      }
    }
  }, [isSuccessAccessLevel, isFetchingAccessLevel]);

  useEffect(() => {
    if (valuesExist.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_VIEW_READONLY')) {
      setUserModuleAccess(true);
    }
    setProductModuleAccess({
      ...productModuleAccess,
      product_dashboard: !valuesExist?.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_VIEW_READONLY') ? false : true,
      product_dashboard_download: !valuesExist?.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_DASHBOARD_EXPORT_FUNCTION') ? false : true,
      search_product_promocode: !valuesExist?.hasOwnProperty('PRODUCTS_PROMO_MANAGEMENT_SEARCH_VIEW_READONLY') ? false : true,
      // product_list_download: !valuesExist?.hasOwnProperty('STALLION_ADMIN_EXPORT_LISTS') ? false : true,
      // stallion_edit: !valuesExist?.hasOwnProperty('STALLION_ADMIN_UPDATE_INFORMATION_FOR_AN_EXISTING_STALLION')? false : true,
      // stallion_edit_promoted_page: !valuesExist?.hasOwnProperty('STALLION_ADMIN_EDIT_PROMOTED_STALLIONS_PAGE')? false : true,
      // stallion_feehistory: !valuesExist?.hasOwnProperty('STALLION_ADMIN_VIEW_SHARE_FEE_HISTORY')? false : true,
      // horse_list: !valuesExist?.hasOwnProperty('STALLION_ADMIN_VIEW_SHARE_FEE_HISTORY')? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);
  console.log(valuesExist, productModuleAccess, 'valuesExist')

  return (
    <>
      {/*  header section */}
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />
      <Page
        title="Product & Promo Codes Dashboard"
        sx={{ display: 'flex' }}
        className="productsDataDashboard"
      >
        <ProductsFilterSidebar productModuleAccess={productModuleAccess}/>
        {isFetchingAccessLevel && filterCounterhook.value < 2 ?
          <Box className="Spinner-Wrp">
            {/* spinner */}
            <Spinner />
          </Box> :
          filterCounterhook.value >= 2 && productModuleAccess.product_dashboard === false ? <UnAuthorized /> :
            <>
              
              <Box className="MessageDataDashboardRight" sx={{ width: '100%' }} px={2}>
                <Container>
                {/* toast message */}
                {apiStatus && (
                  <CustomToasterMessage
                    apiStatus={true}
                    setApiStatus={setApiStatus}
                    apiStatusMsg={apiStatusMsg}
                    setApiStatusMsg={setApiStatusMsg}
                  />
                )}
                {/* products dashboard section */}
                <DataAnalytics
                  apiStatus={true}
                  setApiStatus={setApiStatus}
                  apiStatusMsg={apiStatusMsg}
                  setApiStatusMsg={setApiStatusMsg}
                  productModuleAccess={productModuleAccess}
                  setProductModuleAccess={setProductModuleAccess}
                  clickedPopover={clickedPopover}
                  setClickedPopover={setClickedPopover}
                />
                </Container>
              </Box>
            </>
        }
        <>
        </>
        {/* Products filter section */}
        {clickedPopover && !productModuleAccess.product_dashboard_download && (
          <DownloadUnauthorizedPopover
            clickedPopover={clickedPopover}
            setClickedPopover={setClickedPopover}
          />
        )}

      </Page>
    </>
  );
}

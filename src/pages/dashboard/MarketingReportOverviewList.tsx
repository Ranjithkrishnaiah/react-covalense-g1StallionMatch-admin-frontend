// @mu
import { useState } from 'react';
import React from "react";
import {
  Box,
  Container,
  StyledEngineProvider,
} from '@mui/material';
import Page from 'src/components/Page';
import 'src/sections/@dashboard/marketing/marketing.css'
import MarketingFilterSidebar from 'src/sections/@dashboard/marketing/filter/MarketingFilterSidebar';
import ReportOverviewEditModal from 'src/sections/@dashboard/marketing/reportoverview/ReportOverviewEditModal';
import { useMarketingPageQuery } from 'src/redux/splitEndpoints/marketingSplit';
import { Spinner } from "src/components/Spinner";
import { MaterialROTable } from "src/sections/@dashboard/marketing/reportoverview/list/MaterialROTable";
import DashboardHeader from 'src/layouts/dashboard/header';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

// Type declaration for report list
export interface DataItem {
  id: string;
  title: string | null;
  description: string | null;
  isActive: boolean;
  pdfUrl: string | null;
  imageUrl: string | null;
  buttonText: string | null;
  position: number
}

export default function MarketingReportOverviewList() {
  const reportOverviewPageId = process.env.REACT_APP_MARKETING_REPORT_PAGE_ID;

  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [marketingModuleAccess, setMarketingModuleAccess] = useState({
    marketing_viewonly: false,
    marketing_update: false,
  });

  // Check permission to access the member module
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  React.useEffect(() => {
    if (isSuccessAccessLevel && appPermissionListByUser) {
      let list: any = [];
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

  React.useEffect(() => {
    if (valuesExist.hasOwnProperty('MARKETING_REPORTS_OVERVIEW_PAGE')) {
      setUserModuleAccess(true);
    }
    setMarketingModuleAccess({
      ...marketingModuleAccess,
      marketing_viewonly: !valuesExist?.hasOwnProperty('MARKETING_REPORTS_OVERVIEW_PAGE') ? false : true,
      marketing_update: !valuesExist?.hasOwnProperty('MARKETING_REPORTS_OVERVIEW_PAGE') ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  // Get all report overview api call
  const data = useMarketingPageQuery(reportOverviewPageId); //, {refetchOnMountOrArgChange: true}
  const ReportOverviewList: Array<DataItem> = data?.data?.overview?.list ? data?.data?.overview?.list : [];

  // close modal
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [rowId, setRowId] = useState("");
  const [openReportOverviewModal, setOpenReportOverviewModal] = useState(false);
  const handleCloseReportOverviewModal = () => {
    setOpenReportOverviewModal(false);
    setEdit(false);
  };

  const CHARACTER_LIMIT = 100;
  const [values, setValues] = React.useState({
    name: ""
  });

  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';

  return (
    <StyledEngineProvider injectFirst>
      <DashboardHeader isCollapse={isCollapse} onOpenSidebar={() => setOpenHeader(true)} apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />
      <Page title="Stallion Match Page" sx={{ display: 'flex' }} className='HomepageData'>
        {/* <MarketingFilterSidebar/>  */}
        <Box className='HomepageDataRight' sx={{ width: '100%' }} px={2}>
          <Container>
            {apiStatus && <CustomToasterMessage apiStatus={true} setApiStatus={setApiStatus} apiStatusMsg={apiStatusMsg} setApiStatusMsg={setApiStatusMsg} />}
            {filterCounterhook.value >= 2 && marketingModuleAccess.marketing_viewonly === false ? (
              <UnAuthorized />
            ) :
              (data?.isFetching) ?
                <Box className='Spinner-Wrp'>  <Spinner /></Box> :
                <Box mt={0} className='HomepageDataBody'>
                  <Box className='HomeBlockWrapper' mt={0}>
                    <Box className='hp-table-wrapper'>
                      <MaterialROTable
                        items={ReportOverviewList}
                        ReportOverviewSectionUuid={data?.data?.overview?.marketingPageSectionId}
                        openAddEditForm={openReportOverviewModal}
                        handleDrawerCloseRow={handleCloseReportOverviewModal}
                        apiStatus={true}
                        setApiStatus={setApiStatus}
                        apiStatusMsg={apiStatusMsg}
                        setApiStatusMsg={setApiStatusMsg}
                        marketingModuleAccess={marketingModuleAccess}
                        setMarketingModuleAccess={setMarketingModuleAccess}
                        clickedPopover={clickedPopover}
                        setClickedPopover={setClickedPopover}
                      />
                    </Box>
                  </Box>
                </Box>
            }
          </Container>
        </Box>
        {/* Report over view popup modal */}
        <ReportOverviewEditModal
          openAddEditForm={openReportOverviewModal}
          handleDrawerCloseRow={handleCloseReportOverviewModal}
          ReportOverviewSectionUuid={data?.data?.overview?.marketingPageSectionId}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
        />
        {clickedPopover &&
          <DownloadUnauthorizedPopover
            clickedPopover={clickedPopover}
            setClickedPopover={setClickedPopover}
          />
        }
      </Page>
    </StyledEngineProvider>
  );
}

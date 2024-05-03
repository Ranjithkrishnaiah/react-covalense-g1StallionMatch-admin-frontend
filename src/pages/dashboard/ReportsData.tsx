// @mu
import {
  Box,
  Container,
  TableHead,
  TableCell,
  TableSortLabel,
  TableRow,
  Table,
  Card,
  TableContainer,
  TableBody,
} from '@mui/material';
// import { Link } from 'react-router-dom'
import Page from 'src/components/Page';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
import React, { useEffect, useRef, useState } from 'react';
// ----------------------------------------------------------------------

import './dashboard.css';
import ReportsFilterSidebar from 'src/sections/@dashboard/reports/filter/ReportsFilterSidebar';
import { getReportOrderbyId } from 'src/redux/splitEndpoints/reportServicesSplit';
import ReportsDataAnalytics from './ReportsDataAnalytics';
import { CustomToasterMessage } from 'src/components/toasterMessage/customToasterMessage';
import NoDataComponent from 'src/components/NoDataComponent/NoDataComponent';
import { Spinner } from 'src/components/Spinner';
import Scrollbar from 'src/components/Scrollbar';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { visuallyHidden } from '@mui/utils';
import ViewDetailsModal from 'src/sections/@dashboard/reports/ViewDetailsModal';
import PaginationSettings from 'src/utils/pagination/PaginationFunction';
import PaginationLimit from 'src/utils/pagination/PaginationLimit';
import ReportsDataTableRow from './ReportsDataTableRow';
import {
  parseDateAsDotFormat,
} from 'src/utils/customFunctions';
import { useLocation, useParams } from 'react-router-dom';
import { useReportsQuery, useShareReportListQuery } from 'src/redux/splitEndpoints/reportsSplit';
import './dashboard.css';
import CsvLink from 'react-csv-export';
import { useGetPageSettingQuery } from 'src/redux/splitEndpoints/smSettingsSplit';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import DownloadUnauthorizedPopover from 'src/components/DownloadUnauthorizedPopover';

const headCells = [
  {
    id: 'OrderId',
    numeric: false,
    disablePadding: true,
    label: 'Order ID',
  },
  {
    id: 'createdOn',
    numeric: false,
    disablePadding: true,
    label: 'Date',
  },
  {
    id: 'Name',
    numeric: false,
    disablePadding: true,
    label: 'Client Name',
  },
  {
    id: 'Email',
    numeric: false,
    disablePadding: true,
    label: 'Email',
  },
  {
    id: 'Report',
    numeric: false,
    disablePadding: true,
    label: 'Report',
  },
  {
    id: 'Country',
    numeric: false,
    disablePadding: true,
    label: 'Country',
  },
  {
    id: 'Paid',
    numeric: false,
    disablePadding: true,
    label: 'Paid',
  },
  {
    id: 'Status',
    numeric: false,
    disablePadding: true,
    label: 'Status',
  },
  {
    id: 'PDF',
    numeric: false,
    disablePadding: true,
    label: 'PDF',
  },
];

export default function ReportsData() {
  const pageId = process.env.REACT_APP_REPORT_PAGE_ID;

  const [order, setOrder] = useState('DESC');
  const [orderBy, setOrderBy] = useState('createdOn');
  const [defaultPageOrderBy, setDefaultPageOrderBy] = useState('createdOn');
  const { name = '' } = useParams();
  const filterRef = useRef<any>(null);
  const { data: reportsSettings, isFetching: isReportsSettingFetching, isLoading: isReportsSettingLoading, isSuccess: isReportsSettingSuccess } = useGetPageSettingQuery(pageId, { refetchOnMountOrArgChange: true });


  // Check the horse page settings
  useEffect(() => {
    if (isReportsSettingSuccess) {
      setOrderBy(reportsSettings?.settingsResponse?.defaultDisplay?.selectedOption?.value);
      setDefaultPageOrderBy(reportsSettings?.settingsResponse?.defaultDisplay?.selectedOption?.value);
    }
    if (isSearchClicked) {
      setGetFilters(
        {
          ...getFilters,
          sortBy: reportsSettings?.settingsResponse?.defaultDisplay?.selectedOption?.value

        }
      );
    }
  }, [reportsSettings]);


  const selectedReportsSettings = {
    defaultDisplayColumn: 'createdOn',
    sendFrom: 'none',
    replyTo: 'none',
    approvalAutomation: true,
    deliveryAutomation: true,
  };

 
  //Custome Table Head Component
  function EnhancedTableHead(props: any) {
    const {
      order,
      orderBy,
      numSelected,
      rowCount,
      onRequestSort,
    } = props;
    const createSortHandler = (property: any) => (event: any) => {
      onRequestSort(event, property);
    };

    const handleExportUnaccessModal = () => {
      setClickedPopover(true);
    }

    return (
      <TableHead className="messagesTableHead">
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align="left"
              padding={headCell.disablePadding ? 'none' : 'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
            > 
              <TableSortLabel
                IconComponent={
                  order === 'ASC' ? KeyboardArrowDownRoundedIcon : KeyboardArrowUpRoundedIcon
                }
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'ASC'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'DESC' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
          <TableCell
            align="left"
            className={`icon-share-wrapper ${downloadData?.isFetching ? 'disabled-icon' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            {filterCounterhook.value >= 2 && reportModuleAccess.report_list_download === false ? (
              <i className={'icon-Share'} onClick={handleExportUnaccessModal} />
            ) :
            <CsvLink data={csvShareData} fileName={`Report_Data (${new Date()})`}>
              <i className={'icon-Share'} />
            </CsvLink>
            }
          </TableCell>
        </TableRow>
      </TableHead>
    );
  }

  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [reportModuleAccess, setReportModuleAccess] = useState({
    report_list: false,
    report_dashboard: false,
    report_dashboard_download: false,
    report_list_download: false,
    report_edit: false,
    report_activate_link: false,
    report_approve_report: false,
    report_cancel_report: false,
    report_resend_report: false,
    report_send_resend_report: false,
    report_share_report: false,
    activate_report: false,
  });

  // Check permission to access the member module
  const {
    data: appPermissionListByUser,
    isFetching: isFetchingAccessLevel,
    isLoading: isLoadingAccessLevel,
    isSuccess: isSuccessAccessLevel,
  } = useGetAppPermissionByUserTokenQuery(null, { refetchOnMountOrArgChange: true });

  const SettingsPermissionList = PermissionConstants.DefaultPermissionList;

  useEffect(() => {
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
    if (valuesExist.hasOwnProperty('REPORTS_ADMIN_EXPORT_LISTS')) {
      setUserModuleAccess(true);
    }
    
    setReportModuleAccess({
      ...reportModuleAccess,
      report_list: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_READ_ONLYALL_REPORTS') ? false : true,
      report_list_download: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_EXPORT_LISTS') ? false : true,
      report_dashboard: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_VIEW_REPORTS_DASHBOARD') ? false : true,
      report_dashboard_download: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_DASHBOARD_EXPORT_FUNCTION')? false : true,
      report_edit: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_EDIT_REPORT_DETAILS')? false : true,
      report_activate_link: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_ACTIVATE_LINKS')? false : true,
      report_approve_report: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_APPROVE_REPORTS')? false : true,
      report_cancel_report: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_CANCEL_REPORTS')? false : true,
      report_resend_report: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_RESEND_REPORTS')? false : true,
      report_send_resend_report: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_SEND_RESEND_REPORTS')? false : true,
      report_share_report: !valuesExist?.hasOwnProperty('REPORTS_ADMIN_SHARE_REPORTS')? false : true,
      activate_report: (!valuesExist?.hasOwnProperty('REPORTS_ADMIN_ACTIVATE_LINKS') && !valuesExist?.hasOwnProperty('REPORTS_ADMIN_DEACTIVATE_LINKS')) ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  const [isSearchClicked, setIsSearchClicked] = useState<any>(false);
  const [getFilters, setGetFilters] = useState({});
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [limit, setLimit] = useState(15);
  const [open, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [editDataDetails, setEditDataDetails] = useState({});
  const [loadingMain, setLoadingMain] = useState<boolean>(true);

  const [rowId, setRowId] = useState('');

  const handleFilter = (value: any) => {
    setGetFilters(value);
  };

  const handleFilterApplied = () => {
    setIsFilterApplied(true);
  };

  const handleRemoveFilterApplied = () => {
    setIsFilterApplied(false);
  };
  const [clear, setClear] = useState<any>(false);
  let newState = {
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  };

  const [convertedDateRangeValue, setConvertedDateRangeValue] = React.useState('');
  const [convertedDateDateValue, setConvertedDateDateValue] = React.useState([null, null]);

  const [convertedInitiatedDateRangeValue, setConvertedInitiatedDateRangeValue] =
    React.useState('');
  const [convertedInitiatedDateDateValue, setConvertedInitiatedDateDateValue] = React.useState([
    null,
    null,
  ]);

  const [convertedCompletedDateRangeValue, setConvertedCompletedDateRangeValue] =
    React.useState('');
  const [convertedCompletedDateDateValue, setConvertedCompletedDateDateValue] = React.useState([
    null,
    null,
  ]);

  const [convertedDeliveredDateRangeValue, setConvertedDeliveredDateRangeValue] =
    React.useState('');
  const [convertedDeliveredDateDateValue, setConvertedDeliveredDateDateValue] = React.useState([
    null,
    null,
  ]);

  const [isUrlFilter, setIsUrlFilter] = useState<any>(false);
  const [reportValue, setReportValue] = useState('');
  const { pathname } = useLocation();
  const getReportName = pathname.split('/')[4];
  const getReportIdFilter = pathname.split('/')[5];
  const getReportIdFilters = pathname.split('/')[5];

  useEffect(() => {
    if (getReportName === 'requiredApproval') {
      setReportValue('requiredApproval');
      handleFilter({
        isRequeiredApproval: true,
        page: page,
        limit: limit,
        order: order,
        sortBy: orderBy,
        orderStatusId: 1,
      });
      setStateValue({
        ...state,
        orderStatus: '1',
      })
      handleFilterApplied();
      setIsSearchClicked(true);
      setIsUrlFilter(true);
    } else if (getReportName === 'orders-list') {
      handleFilter({
        page: page,
        limit: limit,
        order: order,
        sortBy: orderBy,
      });
      handleFilterApplied();
      setIsSearchClicked(true);
      setIsUrlFilter(true);
    } else if (getReportIdFilter === 'reportFilter') {
      handleFilter({
        page: page,
        limit: limit,
        order: order,
        sortBy: orderBy,
        orderId: name,
      });
      handleFilterApplied();
      setIsSearchClicked(true);
      setIsUrlFilter(true);
    } else if (getReportIdFilters === 'filter') {
      handleFilter({
        page: page,
        limit: limit,
        order: order,
        sortBy: orderBy,
        reportId: name,
        ...((name == String(7) || name == String(8) || name == String(9) || name == String(10)) && { isRedirect: true }),
      });
      handleFilterApplied();
      setIsSearchClicked(true);
      setIsUrlFilter(true);
    }else {
      setReportValue('');
      setIsSearchClicked(false);
    }
  }, [getReportName]);

  const [state, setStateValue] = React.useState({
    clientName: '',
    email: '',
    selectedReport: '',
    selectedReportName: { productName: '' },
    orderId: '',
    orderStatus: '',
    orderStatusName: { status: '' },
    sire: '',
    dam: '',
    country: '',
    countryName: {countryName: ''},
    company: '',
    paymentGateway: 'none',
    currency: 'none',
    paidRange: [0, 100],
    isInclude: false,
    isIncludeClicked: false,
    paidRangeClicked: false,
    page: page,
    limit: limit,
    order: order,
    sortBy: orderBy,
  });

  const clearAll = () => {
    filterRef?.current?.handleClearFilter();
    setIsSearchClicked(false);
  };

  const data = useReportsQuery(isFilterApplied ? getFilters : newState, {
    skip: !isSearchClicked,
    refetchOnMountOrArgChange: true
  });
  
  const reportsOrdersList = data?.data?.data ? data?.data?.data : [];
  const downloadData: any = useShareReportListQuery(isFilterApplied ? getFilters : newState, {
    skip: !isSearchClicked,
  });
  const [csvShareData, setCsvShareData] = useState<any>([]);
  
  React.useEffect(() => {
    let tempArr: any = [];
    downloadData?.data?.forEach((item: any) => {
      let {
        orderId,
        orderCreatedOn,
        clientName,
        email,
        productName,
        countryName,
        total,
        currencySymbol,
        paymentStatus,
      } = item;
      const dateCreated: any = parseDateAsDotFormat(orderCreatedOn);
      const totalAmount: any = `US${currencySymbol}${total}`;
      tempArr.push({
        orderId,
        dateCreated,
        clientName,
        email,
        productName,
        countryName,
        totalAmount,
        paymentStatus,
      });
    });
    setCsvShareData(tempArr);    
  }, [downloadData?.data]);

  const reportsListProps = {
    page: page == 0 ? 1 : page,
    setPage,
    result: data?.data?.data,
    pagination: data?.data?.meta,
    query: data,
    clear,
    setClear,
    limit: rowsPerPage,
    setLimit,
    clearAll,
  };

 
  const handleEditPopup = () => {
    setOpen(!open);
  };
  const handleEditState = async (data: any) => {
    setLoadingMain(true);
    const reportData = await getReportOrderbyId(data.orderProductId);
    if (reportData) {
      setEditDataDetails(reportData);
      setLoadingMain(false);
    }
    setEdit(true);
  };

  const handleCloseEditState = () => {
    setEdit(false);
    setEditDataDetails({});
    setOpen(false);
  };
  const [selected, setSelected] = useState([]);
  const [openPopper, setOpenPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);


  const canBeOpen = openPopper && Boolean(anchorEl);
  const handleRequestPaginationLimit = (pageLimit: number) => {
    const datafltr = {
      ...getFilters,
      ...{ page: page },
      ...{ limit: pageLimit },
    };
    handleFilter(datafltr);
    // data?.refetch();
  };

  const handleRequestPagination = (pageNum: number) => {
    const datafltr = {
      ...getFilters,
      ...{ page: pageNum },
      ...{ limit: limit },
      
    };
    handleFilter(datafltr);
    // data?.refetch();
  };

  const handleRequestSort = (event: any, property: any) => {
    const isAsc = orderBy === property && order === 'ASC';
    setOrder(isAsc ? 'DESC' : 'ASC');
    setOrderBy(property);
    const datafltr = {
      ...getFilters,
      ...({ page: page }),
      ...({ limit: limit }),
      ...({ order: isAsc ? 'DESC' : 'ASC' }),
      ...({ sortBy: property }),
      
    };
    handleFilter(datafltr);
    // data?.refetch();
  };

  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const [filterStatus, setFilterStatus] = useState(false);



  const handleOpenFilterParam = (val: boolean) => {
    setFilterStatus(val);
  };

  return (
    <>
      {/* Reports Header  */}
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
        moduleListProps={reportsListProps}
        isSearchClicked={isSearchClicked}
      />
      {/* End Reports Header  */}
      <Page title="Reports Dashboard" sx={{ display: 'flex' }} className="ReportsDataDashboard">
        {/* Reports Filter Side Bar  */}
        <ReportsFilterSidebar
          handleFilter={handleFilter}
          handleOpenFilterParam={handleOpenFilterParam}
          handleFilterApplied={handleFilterApplied}
          handleRemoveFilterApplied={handleRemoveFilterApplied}
          isFilterApplied={isFilterApplied}
          rowCount={!isFilterApplied ? 0 : data?.data?.meta?.itemCount}
          page={page}
          limit={limit}
          isSearchClicked={isSearchClicked}
          setIsSearchClicked={setIsSearchClicked}
          setPage={setPage}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          order={order}
          setOrder={setOrder}
          convertedDateRangeValue={convertedDateRangeValue}
          setConvertedDateRangeValue={setConvertedDateRangeValue}
          convertedDateDateValue={convertedDateDateValue}
          setConvertedDateDateValue={setConvertedDateDateValue}
          convertedInitiatedDateRangeValue={convertedInitiatedDateRangeValue}
          setConvertedInitiatedDateRangeValue={setConvertedInitiatedDateRangeValue}
          convertedInitiatedDateDateValue={convertedInitiatedDateDateValue}
          setConvertedInitiatedDateDateValue={setConvertedInitiatedDateDateValue}
          convertedCompletedDateRangeValue={convertedCompletedDateRangeValue}
          setConvertedCompletedDateRangeValue={setConvertedCompletedDateRangeValue}
          convertedCompletedDateDateValue={convertedCompletedDateDateValue}
          setConvertedCompletedDateDateValue={setConvertedCompletedDateDateValue}
          convertedDeliveredDateRangeValue={convertedDeliveredDateRangeValue}
          setConvertedDeliveredDateRangeValue={setConvertedDeliveredDateRangeValue}
          convertedDeliveredDateDateValue={convertedDeliveredDateDateValue}
          setConvertedDeliveredDateDateValue={setConvertedDeliveredDateDateValue}
          reportValue={reportValue}
          state={state}
          setStateValue={setStateValue}
          ref={filterRef}
          defaultPageOrderBy={defaultPageOrderBy}
          setDefaultPageOrderBy={setDefaultPageOrderBy}
        />
        {/* End Reports Filter Side Bar  */}
        <Box
          className="MessageDataDashboardRight"
          sx={{ width: '100%', paddingBottom: '20px' }}
          px={2}
        >
          <Container>
            {apiStatus && (
              <CustomToasterMessage
                apiStatus={true}
                setApiStatus={setApiStatus}
                apiStatusMsg={apiStatusMsg}
                setApiStatusMsg={setApiStatusMsg}
              />
            )}
            {/* ReportsDataAnalytics component lodes when fiters are not applied  */}
            {!isSearchClicked && !isUrlFilter ? (
                  isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                   <Box className="Spinner-Wrp">
                     {/* spinner */} <Spinner />
                   </Box>
                 ) : 
                 filterCounterhook.value >= 2 && reportModuleAccess.report_dashboard === false ? (
                   <UnAuthorized />
                 ) : (
                 <Box>
                   {/* By default display the stallion dashboard data if any search is happened */}
                   <ReportsDataAnalytics
                      apiStatus={true}
                      setApiStatus={setApiStatus}
                      apiStatusMsg={apiStatusMsg}
                      setApiStatusMsg={setApiStatusMsg}
                      filterStatus={filterStatus}
                      reportModuleAccess={reportModuleAccess}
                      setReportModuleAccess={setReportModuleAccess}
                      clickedPopover={clickedPopover}
                      setClickedPopover={setClickedPopover}
                    />
                 </Box>
               )) : isFetchingAccessLevel && filterCounterhook.value < 2 ? (
                 <Box className="Spinner-Wrp">
                   {/* spinner */} <Spinner />
                 </Box>
               ) : filterCounterhook.value >= 2 && reportModuleAccess.report_list === false ? (
                 <UnAuthorized />
               ) : !isFilterApplied ? (
                 <NoDataComponent {...reportsListProps} />
               ) : data?.isFetching ? (
                 <Box className="Spinner-Wrp">
                   {/* Load a spinner if any search is happened and api is still fetching*/}
                   <Spinner />
                 </Box>
               ) : (data.isSuccess && reportsListProps?.result?.length > 0) ? ( //when filters are selected this Table component is displayed
              <Card sx={{ boxShadow: 'none', background: '#faf8f7' }}>
                <Scrollbar>
                  <TableContainer className="datalist" sx={{ minWidth: 800 }}>
                    <Table
                      sx={{
                        borderCollapse: 'separate',
                        borderSpacing: '0 4px',
                        background: '#FAF8F7',
                      }}
                    >
                      {/* Custom table Header  */}
                      <EnhancedTableHead
                        numSelected={selected.length}
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                        rowCount={reportsOrdersList.length}
                      />
                      {/* Table Body  */}
                      <TableBody>
                        {reportsOrdersList.map((row: any, index: number) => (
                          <ReportsDataTableRow
                            key={row.orderId}
                            row={row}
                            selected={row.orderId}
                            refreshState={() => {
                              data.refetch();
                            }}
                            onSelectRow={row.orderId}
                            onEditPopup={() => handleEditPopup()}
                            onSetRowId={() => setRowId(row.orderId)}
                            handleEditState={() => handleEditState(row)}
                            apiStatus={true}
                            setApiStatus={setApiStatus}
                            apiStatusMsg={apiStatusMsg}
                            setApiStatusMsg={setApiStatusMsg}
                            reportModuleAccess={reportModuleAccess}
                            setReportModuleAccess={setReportModuleAccess}
                            clickedPopover={clickedPopover}
                            setClickedPopover={setClickedPopover}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>
                {/* Pagination Component  */}
                <Box className="Pagination-wrapper">
                  <PaginationSettings
                    data={reportsListProps}
                    handleRequestPagination={handleRequestPagination}
                    limit={limit}
                    setLimit={setLimit}
                  />
                  <PaginationLimit
                    data={reportsListProps}
                    handleRequestPaginationLimit={handleRequestPaginationLimit}
                    limit={limit}
                    setLimit={setLimit}
                  />
                </Box>
              </Card>
            ) : (
              <NoDataComponent {...reportsListProps} />
            )}
          </Container>
        </Box>
        {/* View Detail Model  */}
        <ViewDetailsModal
          open={open}
          rowId={rowId}
          loadingMain={loadingMain}
          dataDetails={editDataDetails}
          isEdit={isEdit}
          handleEditPopup={() => setOpen(false)}
          handleCloseEditState={handleCloseEditState}
          apiStatus={true}
          setApiStatus={setApiStatus}
          apiStatusMsg={apiStatusMsg}
          setApiStatusMsg={setApiStatusMsg}
          reportModuleAccess={reportModuleAccess}
          setReportModuleAccess={setReportModuleAccess}
          clickedPopover={clickedPopover}
          setClickedPopover={setClickedPopover}
        />
        {/* Download Unauthorized Popover */}
        {clickedPopover && !reportModuleAccess.report_dashboard_download && (
            <DownloadUnauthorizedPopover
              clickedPopover={clickedPopover}
              setClickedPopover={setClickedPopover}
            />
        )}
      </Page>
    </>
  );
}

// @mu
import { Box, Typography, Container, Grid, Stack, Divider, Button, MenuItem } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import barchart from 'src/assets/Images/bar-chart.svg';
import stallionfile from 'src/assets/Images/stallion-file.svg';
import mail from 'src/assets/Images/mail-icon.svg';
import reportfile from 'src/assets/Images/report-file.svg';
import trendingup from 'src/assets/Images/trending-up.svg';
import reportTrendingup from 'src/assets/Images/report-trending-up.svg';
import trendingdown from 'src/assets/Images/trending-down.svg';
import DashboardHeader from 'src/layouts/dashboard/header';
// hooks
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import useSettings from 'src/hooks/useSettings';
import { useState, useEffect } from 'react';
// ----------------------------------------------------------------------
import './dashboard.css';
import { useNotificationsQuery } from 'src/redux/splitEndpoints/notificationsSplit';
import { PATH_DASHBOARD } from 'src/routes/paths';
import { timeStampConversation, intToString } from 'src/utils/customFunctions';
import {
  useMainDashboardQuery,
  useTotalVisitorsQuery,
  useTopVisitedFarmsQuery,
  useTotalRegistrationsQuery,
  useVisitorStatisticsQuery,
  useNewCustomersQuery,
  useDownloadDashboardExcelFileQuery
} from 'src/redux/splitEndpoints/mainDashboardSplit';

import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import CsvLink from 'react-csv-export';
import _, { trim } from 'lodash';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { MenuProps } from 'src/constants/MenuProps';
import {
  dateConvert,
  getLastFromDate,
  currentDate,
  getOPtionText,
  InsertCommas
} from 'src/utils/customFunctions';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import DashboardLineChart from 'src/components/graph/DashboardLineChart';
import { toPascalCase } from 'src/utils/customFunctions';
import { CircularSpinner } from 'src/components/CircularSpinner';
import NewCustomerChart from 'src/components/graph/NewCustomerChart';
import { Spinner } from 'src/components/Spinner';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { useGetAppPermissionByUserTokenQuery } from 'src/redux/splitEndpoints/usermanagementSplit';
import { PermissionConstants } from 'src/constants/PermissionConstants';
import useCounter from 'src/hooks/useCounter';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';

export default function GeneralApp() {
  const [apiStatus, setApiStatus] = useState(false);
  const [apiStatusMsg, setApiStatusMsg] = useState({});
  const { themeLayout } = useSettings();
  const [openHeader, setOpenHeader] = useState(false);
  const { collapseClick, isCollapse } = useCollapseDrawer();
  const verticalLayout = themeLayout === 'vertical';
  const navigate = useNavigate();
  const filterCounterhook = useCounter(0);
  const [valuesExist, setValuesExist] = useState<any>({});
  const [clickedPopover, setClickedPopover] = useState(false);
  const [userModuleAccess, setUserModuleAccess] = useState(false);
  const [mainDashboardModuleAccess, setMainDashboardModuleAccess] = useState({
    mainDashboard_dashboard: false,
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

  useEffect(() => {
    if (valuesExist.hasOwnProperty('STALLION_MATCH_DEFAULT_DASHBOARD')) {
      setUserModuleAccess(true);
    }
    setMainDashboardModuleAccess({
      ...mainDashboardModuleAccess,
      mainDashboard_dashboard: !valuesExist?.hasOwnProperty('STALLION_MATCH_DEFAULT_DASHBOARD') ? false : true,
    });
    filterCounterhook.increment();
  }, [valuesExist]);

  // Payload for notification api call
  let InitialState = {
    page: 1,
    limit: 4,
    order: 'DESC',
    sortBy: 'dateCreated',
  };

  // Notification api call
  const data = useNotificationsQuery(InitialState, { refetchOnMountOrArgChange: true });
  const NotificationsList = data?.data?.data ? data?.data?.data : [];

  // Routing for user notification

  const linkNameHandler = (notificationRow: any) => {
    if (notificationRow.linkName === 'Resend Email') {
    } else if (notificationRow.linkName === 'Boost Profiles') {
    } else if (notificationRow.linkName === 'View Report') {
    } else if (
      notificationRow.linkName === 'Accept Invitation' ||
      notificationRow.linkName === 'Multiple links within email' ||
      notificationRow.linkName === 'Renew Now' ||
      notificationRow.linkName === 'Renew Now Auto-Renew On' ||
      notificationRow.linkName === 'View Details' ||
      notificationRow.linkName === 'Stallion Roster' ||
      notificationRow.linkName === 'None - mailto: links only'
    ) {
    } else if (notificationRow.linkName === 'Go to Profile') {
      navigate(PATH_DASHBOARD.userprofile.data);
    } else if (notificationRow?.linkName?.toLowerCase()?.includes('verify now')) {
      if (notificationRow?.featureName === "Stallion") {
        // let stallionPath = notificationRow.linkAction.split('/')[4];
        // navigate(PATH_DASHBOARD.stallions.filterId(stallionPath));
        let stallionName = notificationRow.messageText.split('[')[0].trim();
        let stallionType = notificationRow.featureName;
        navigate(PATH_DASHBOARD.stallions.keywordfilter(stallionName, stallionType));
      } else if (notificationRow?.featureName === "Farm") {
        let farmPath = notificationRow.linkAction.split('/')[4];
        navigate(PATH_DASHBOARD.farms.filterId(farmPath));
      }
    } else if (notificationRow.messageTitle === 'Request for new horse') {
      navigate(notificationRow.linkAction);
    } else if (notificationRow.messageTitle === 'Request for new mare') {
      navigate(notificationRow.linkAction);
    } else {
      const myArray = notificationRow?.linkAction.split('/');
      const channelId = myArray[3];
      navigate(PATH_DASHBOARD.messages.filter(channelId));
    }
  };

  const dateFilterList = DashboardConstants.dateFilterList;
  const [dateDefaultSelected, setDateDefaultSelected] = useState('today');
  const [dateOptionSelected, setDateOptionSelected] = useState('today');
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [dateTo, setDateTo] = useState<any>(currentDate());
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = useState([null, null]);
  // Get the current date
  const current_date = new Date();

  // Today
  const today_start = startOfDay(current_date);
  const today_end = endOfDay(current_date);
  // On selecting the date filter
  const handleDatePicker = (event: SelectChangeEvent<any>): void => {
    const optionVal: any = event.target.value;
    setDateOptionSelected(getOPtionText(optionVal));
    setDateDefaultSelected(event.target.value);

    if (optionVal === 'lastyear') {
      // Last year
      const last_year_start = startOfYear(subYears(current_date, 1));
      const last_year_end = endOfYear(subYears(current_date, 1));
      setDateFrom(format(last_year_start, 'yyyy-MM-dd HH:mm:ss'));
      setDateTo(format(last_year_end, 'yyyyMMdd'));
    } else if (optionVal === 'thisyear') {
      // This year (end date is the current date)
      const this_year_start = startOfYear(current_date);
      const this_year_end = endOfDay(current_date); // End date is the current date
      setDateFrom(format(this_year_start, 'yyyy-MM-dd HH:mm:ss'));
      setDateTo(format(this_year_end, 'yyyyMMdd'));
    } else {
      setDateFrom(getLastFromDate(optionVal));
      setDateTo(currentDate());
    }
    setConvertedCreatedRangeValue('');
    setConvertedCreatedDateValue([null, null]);
  };

  const fromDateConverted = (dateDefaultSelected === 'custom') ? dateConvert(convertedCreatedDateValue[0]) : dateConvert(dateFrom);
  const toDateConverted = (dateDefaultSelected === 'custom') ? dateConvert(convertedCreatedDateValue[1]) : dateTo;
  const isDashboardAPI: boolean = fromDateConverted > 0 && toDateConverted > 0 ? true : false;

  // Dashboard api call
  const {
    data: dashboardAPIData,
    isFetching,
    isLoading,
    isSuccess: isMainDashboardSuccess,
  } = useMainDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI, refetchOnMountOrArgChange: true }
  );

  // Total visitor api call
  const {
    data: visitorAPIData,
    isFetching: isVisitorFetching,
    isLoading: isVisitorLoading,
    isSuccess: isVisitorSuccess,
  } = useTotalVisitorsQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI, refetchOnMountOrArgChange: true }
  );

  // Total Registrations api call
  const {
    data: totalRegisterAPIData,
    isFetching: isTRFetching,
    isLoading: isTRLoading,
    isSuccess: isTRSuccess,
  } = useTotalRegistrationsQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI, refetchOnMountOrArgChange: true }
  );

  const dashboardData = isMainDashboardSuccess
    ? dashboardAPIData
    : DashboardConstants.mainDashboardStaticData;

  const visitorsData: any = isVisitorSuccess
    ? visitorAPIData
    : DashboardConstants.totalVisitorStaticData;

  const stallionsData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total stallions'
  );

  const registrationsData: any = isTRSuccess
    ? totalRegisterAPIData
    : DashboardConstants.totalRegisterStaticData;

  const reportsData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Total reports');

  // Visitor Statistics api call
  const {
    data: dashboardVisitorStatAPIData,
    isFetching: isDashboardVisitorStatFetching,
    isLoading: isDashboardVisitorStatLoading,
    isSuccess: isDashboardVisitorStatSuccess,
  } = useVisitorStatisticsQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );

  const dashboardVisitorStatData = isDashboardVisitorStatSuccess
    ? dashboardVisitorStatAPIData
    : DashboardConstants.raceAvgDistanceStaticData;

  // New Customers api call
  const {
    data: newCustomersAPIData,
    isFetching: isNewCustomersFetching,
    isLoading: isNewCustomersLoading,
    isSuccess: isNewCustomersSuccess,
  } = useNewCustomersQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );

  const newCustomersData = isNewCustomersSuccess
    ? newCustomersAPIData
    : DashboardConstants.raceAvgDistanceStaticData;

  // Top Visited Farms api call 
  const {
    data: dashboardTVFAPIData,
    isFetching: isTVFFetching,
    isLoading: isTVFLoading,
    isSuccess: isTVFSuccess,
  } = useTopVisitedFarmsQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, limit: 10 },
    { skip: !isDashboardAPI }
  );

  // Genarate the csv from all KPI data
  const [csvData, setCsvData] = useState<any>([]);
  let cntr = 0;
  useEffect(() => {
    setCsvData([
      {
        'Total visits': visitorsData?.CurrentValue > 0 ? visitorsData?.CurrentValue : 0,
        'Total stallions': stallionsData[0]?.CurrentValue > 0 ? stallionsData[0]?.CurrentValue : 0,
        'Total registrations':
          registrationsData[0]?.CurrentValue > 0 ? registrationsData[0]?.CurrentValue : 0,
        'Total reports': reportsData[0]?.CurrentValue > 0 ? reportsData[0]?.CurrentValue : 0,
      },
    ]);
    cntr++;
  }, [isVisitorFetching,isFetching]);

  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});

  // Download indivisual KPI api call
  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
  } = useDownloadDashboardExcelFileQuery(
    { setupId: excelPayload, name: 'main' },
    { skip: !isCsvDownloadDownload }
  );

  // Once user clicks on indivisual KPI, generate the payload for Download indivisual KPI api call
  const downloadIndivisualKPI = (kpiType: any) => {
    setExcelPayload({
      kpiTitle: kpiType,
      fromDate: fromDateConverted,
      toDate: toDateConverted,
    });
    setIsCsvDownloadDownload(true);
  };
  useEffect(() => {
    setIsCsvDownloadDownload(false);
  }, [isCsvDownloadSuccess]);

  return (
    <>
      {/* Header component */}
      <DashboardHeader
        isCollapse={isCollapse}
        onOpenSidebar={() => setOpenHeader(true)}
        apiStatus={true}
        setApiStatus={setApiStatus}
        apiStatusMsg={apiStatusMsg}
        setApiStatusMsg={setApiStatusMsg}
      />
      {/* Main content for dashboard */}
      <Box className="DashboardDataDashboardRight" sx={{ width: '100%' }}>
        {isFetchingAccessLevel && filterCounterhook.value < 2 ? (
          <Box className="Spinner-Wrp">
            <Spinner />
          </Box>
        ) : filterCounterhook.value >= 2 && mainDashboardModuleAccess.mainDashboard_dashboard === false ? (
          <UnAuthorized />
        ) : (
          <Container style={{ paddingLeft: '1.2rem' }}>
            <Stack direction="row" className="MainTitleHeader">
              <Grid container mt={2}>
                <Grid item lg={6} sm={6} className="MainTitleHeadLeft">
                  <Typography variant="h4" className="MainTitle">
                    Dashboard
                  </Typography>
                </Grid>

                {/* Share and Date filter section */}
                <Grid item lg={6} sm={6} className="MainTitleHeadRight">
                  <Stack
                    direction="row"
                    sx={{ justifyContent: { lg: 'right', sm: 'right', xs: 'left' }, display: 'flex' }}
                  >
                    <Box className="Share">
                      <CsvLink
                        data={csvData}
                        fileName={`Dashboard_Data (${dateDefaultSelected})`}
                        withTimeStamp
                      >
                        <Button type="button" className="ShareBtn">
                          <i className="icon-Share"></i>
                        </Button>
                      </CsvLink>
                    </Box>

                    <Box className="edit-field">
                      <Select
                        MenuProps={MenuProps}
                        className="selectDropDown"
                        IconComponent={KeyboardArrowDownRoundedIcon}
                        value={dateDefaultSelected}
                        sx={{ height: '40px', minWidth: '168px' }}
                        onChange={handleDatePicker}
                      >
                        {dateFilterList?.map(({ id, name }) => {
                          return (
                            <MenuItem className="selectDropDownList" value={id} key={id}>
                              {name}
                            </MenuItem>
                          );
                        })}
                      </Select>
                    </Box>

                    {dateDefaultSelected === 'custom' && (
                      <Box className="edit-field calender-wrapper">
                        <CustomRangePicker
                          placeholderText="Enter date range"
                          convertedDateRangeValue={convertedCreatedRangeValue}
                          setConvertedDateRangeValue={setConvertedCreatedRangeValue}
                          convertedDateValue={convertedCreatedDateValue}
                          setConvertedYobDateValue={setConvertedCreatedDateValue}
                        />
                      </Box>
                    )}
                  </Stack>
                </Grid>
                {/* End of Share and Date filter section */}
              </Grid>
            </Stack>

            {!isDashboardAPI ?
              <Box className="Spinner-Wrp">
                <Spinner />
              </Box>
              :
              <>
                {/* First four KPI section */}
                <Box mt={3} className="DBDataDashboardBody">
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3} className="DB-blocks-download">
                      <Stack direction="row" className="DB-blocks">
                        {isVisitorFetching ? <CircularSpinner /> :
                          <>
                            <Box className="adminIcons">
                              <img src={barchart} alt="chart" />
                            </Box>
                            <Box>
                              <Typography variant="h3">{visitorsData?.CurrentValue && InsertCommas(visitorsData?.CurrentValue)}</Typography>
                              <Typography variant="body2">
                                Total visits{' '}
                                <i
                                  className="icon-Download"
                                  onClick={() => downloadIndivisualKPI('TOTAL_VISITS')}
                                ></i>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: 'flex',
                                  color: `${visitorsData?.diffPercent === 0
                                    ? '#FFB648 !important'
                                    : visitorsData?.diffPercent > 0
                                      ? '#4BDE97 !important'
                                      : '#F26464 !important'
                                    }`,
                                }}
                              >
                                <img
                                  src={visitorsData?.diffPercent === 0 ? reportTrendingup : visitorsData?.diffPercent > 0 ? trendingup : trendingdown}
                                  alt="chart"
                                  style={{ marginRight: '5px' }}
                                />{' '}
                                {visitorsData?.diffPercent}% <span>{dateOptionSelected}</span>
                              </Typography>
                            </Box>
                          </>
                        }
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={3} className="DB-blocks-download">
                      <Stack direction="row" className="DB-blocks">
                        {isFetching ? <CircularSpinner /> :
                          <>
                            <Box className="adminIcons">
                              <img src={stallionfile} alt="file" />
                            </Box>
                            <Box>
                              <Typography variant="h3">{stallionsData[0]?.CurrentValue && InsertCommas(stallionsData[0]?.CurrentValue)}</Typography>
                              <Typography variant="body2">
                                Total stallions{' '}
                                <i
                                  className="icon-Download"
                                  onClick={() => downloadIndivisualKPI('TOTAL_STALLIONS')}
                                ></i>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: 'flex',
                                  color: `${reportsData[0]?.diffPercent === 0
                                    ? '#FFB648 !important'
                                    : reportsData[0]?.diffPercent > 0
                                      ? '#4BDE97 !important'
                                      : '#F26464 !important'
                                    }`,
                                }}
                              >
                                <img
                                  src={stallionsData[0]?.diffPercent === 0 ? reportTrendingup : stallionsData[0]?.diffPercent > 0 ? trendingup : trendingdown}
                                  alt="chart"
                                  style={{ marginRight: '5px' }}
                                />{' '}
                                {stallionsData[0]?.diffPercent}% <span>{dateOptionSelected}</span>
                              </Typography>
                            </Box>
                          </>
                        }
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={3} className="DB-blocks-download">
                      <Stack direction="row" className="DB-blocks">
                        {isTRFetching ? <CircularSpinner /> :
                          <>
                            <Box className="adminIcons">
                              <img src={mail} alt="mail" />
                            </Box>
                            <Box>
                              <Typography variant="h3">{registrationsData[0]?.CurrentValue && InsertCommas(registrationsData[0]?.CurrentValue)}</Typography>
                              <Typography variant="body2">
                                Total registrations{' '}
                                <i
                                  className="icon-Download"
                                  onClick={() => downloadIndivisualKPI('TOTAL_REGISTRATIONS')}
                                ></i>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: 'flex',
                                  color: `${registrationsData[0]?.diffPercent === 0
                                    ? '#FFB648 !important'
                                    : reportsData[0]?.diffPercent > 0
                                      ? '#4BDE97 !important'
                                      : '#F26464 !important'
                                    }`,
                                }}
                              >
                                <img
                                  src={registrationsData[0]?.diffPercent === 0 ? reportTrendingup : registrationsData[0]?.diffPercent > 0 ? trendingup : trendingdown}
                                  alt="chart"
                                  style={{ marginRight: '5px' }}
                                />{' '}
                                {registrationsData[0]?.diffPercent}% <span>{dateOptionSelected}</span>
                              </Typography>
                            </Box>
                          </>
                        }
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={3} className="DB-blocks-download">
                      <Stack direction="row" className="DB-blocks">
                        {isFetching ? <CircularSpinner /> :
                          <>
                            <Box className="adminIcons">
                              <img src={reportfile} alt="file" />
                            </Box>
                            <Box>
                              <Typography variant="h3">{reportsData[0]?.CurrentValue && InsertCommas(reportsData[0]?.CurrentValue)}</Typography>
                              <Typography variant="body2">
                                Total reports{' '}
                                <i
                                  className="icon-Download"
                                  onClick={() => downloadIndivisualKPI('TOTAL_REPORTS')}
                                ></i>
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  display: 'flex',
                                  color: `${reportsData[0]?.diffPercent === 0
                                    ? '#FFB648 !important'
                                    : reportsData[0]?.diffPercent > 0
                                      ? '#4BDE97 !important'
                                      : '#F26464 !important'
                                    }`,
                                }}
                              >
                                <img
                                  src={reportsData[0]?.diffPercent === 0 ? reportTrendingup : reportsData[0]?.diffPercent > 0 ? trendingup : trendingdown}
                                  alt="chart"
                                  style={{ marginRight: '5px' }}
                                />{' '}
                                {reportsData[0]?.diffPercent}% <span>{dateOptionSelected}</span>
                              </Typography>
                            </Box>
                          </>
                        }
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
                {/* End of first four KPI section */}
                <Box mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={9}>
                      <Grid item xs={12} md={12}>
                        <Grid container spacing={2}>
                          {/* Visitor statistics section */}
                          <Grid item xs={12} className="dashboard-linechart">
                            <Box
                              className="WorldReachBox lineChartBox"
                              sx={{ background: '#ffffff', height: '370px' }}
                            >
                              <Stack className="linechart-header">
                                <Stack className="linechart-header-left">
                                  <Typography variant="h5">Visitor statistics</Typography>
                                  <Typography variant="h6" className="valuelinechart">
                                    {dashboardVisitorStatData?.rangeFrom} - {dashboardVisitorStatData?.rangeTo}
                                  </Typography>
                                </Stack>
                                <Stack className="LCvalues">
                                  <Stack className="LCvalueslist">
                                    <Stack className="LCvaluesbox">
                                      <span className="circle green"></span>
                                      <Typography variant="h6">{dateOptionSelected}</Typography>
                                    </Stack>
                                    <Typography variant="h5">
                                      {dashboardVisitorStatData?.currentTotal && InsertCommas(dashboardVisitorStatData?.currentTotal)}
                                    </Typography>
                                  </Stack>
                                  <Stack className="LCvalueslist">
                                    <Stack className="LCvaluesbox">
                                      <span className="circle mintgreen"></span>
                                      <Typography variant="h6">Previous</Typography>
                                    </Stack>
                                    <Typography variant="h5">
                                      {dashboardVisitorStatData?.previousTotal && InsertCommas(dashboardVisitorStatData?.previousTotal)}
                                    </Typography>
                                  </Stack>
                                </Stack>
                              </Stack>

                              <Box className="WorldReachBoxBody">
                                {isDashboardVisitorStatFetching ? (
                                  <CircularSpinner />
                                ) : (
                                  <DashboardLineChart
                                    dateOptionSelected={dateOptionSelected}
                                    chartData={dashboardVisitorStatData?.result}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Grid>
                          {/* End of Visitor statistics section */}

                          {/* Notifications section */}
                          <Grid item xs={12}>
                            <Box className="notification">
                              <Box py={1}>
                                <Typography variant="h5">Notifications</Typography>
                              </Box>

                              {NotificationsList?.map((notification: any) => (
                                <Grid
                                  container
                                  columns={12}
                                  my={1}
                                  p={3}
                                  py={2}
                                  className="List-content"
                                  key={notification?.notificationId}
                                >
                                  <Grid item lg={12} xs={12}>
                                    <Box>
                                      <Typography variant="h4" pb={1}>
                                        {notification?.messageTitle}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography
                                        variant="h6"
                                        sx={{ fontFamily: 'Synthese-Book', color: '#161716' }}
                                        dangerouslySetInnerHTML={{ __html: notification?.messageText }}
                                      >
                                        {/* {notification?.messageText} */}
                                      </Typography>
                                    </Box>
                                    <Stack direction="row" mt={1}>
                                      <Box flexGrow={1}>
                                        <Typography component="span" sx={{ color: '#626E60' }}>
                                          {timeStampConversation(notification?.timeStamp)} ago
                                        </Typography>
                                      </Box>
                                      <Box>
                                        <a
                                          className="view-request"
                                          type="button"
                                          onClick={() => linkNameHandler(notification)}
                                        >
                                          {notification?.messageTitle === 'Request for new horse' || notification?.messageTitle === 'Request for new mare' || notification?.featureName === 'Messaging' || notification?.linkName?.toLowerCase()?.includes('verify now')
                                            ? notification?.linkName
                                            : ''}
                                        </a>
                                      </Box>
                                    </Stack>
                                  </Grid>
                                </Grid>
                              ))}
                            </Box>
                          </Grid>
                          {/* End of Notifications section */}

                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box
                            className="newcustomer-box"
                            sx={{ background: '#ffffff', height: '256px' }}
                          >
                            {/* New customer graph component */}
                            <NewCustomerChart fromDate={dateOptionSelected} chartData={newCustomersData} />
                          </Box>
                        </Grid>

                        {/* Top Visited Farms section */}
                        <Grid item xs={12}>
                          <Box className="DB-farms">
                            <Box mb={3} className="DB-farms-header">
                              <Box>
                                <Typography variant="h3" sx={{ marginBottom: '5px' }}>
                                  Top Visited Farms
                                </Typography>
                                <Typography variant="h6">{dashboardTVFAPIData?.farmCount && InsertCommas(dashboardTVFAPIData?.farmCount)} Farms, {dashboardTVFAPIData?.visitCount && InsertCommas(dashboardTVFAPIData?.visitCount)} Visits</Typography>
                              </Box>
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('TOP_VISITED_FARMS')}
                              ></i>
                            </Box>

                            {isTVFFetching && (
                              <Box className="dashboard-loader">
                                <CircularSpinner />
                              </Box>
                            )}
                            {isTVFSuccess && isTVFFetching === false &&
                              dashboardTVFAPIData?.farms?.map((row: any, index: number) => (
                                <>
                                  <Stack direction="row" mt={2} mb={1} className="DB-farms-item">
                                    <Box flexGrow={1}>
                                      <Typography variant="h4">{toPascalCase(row?.farmName)}</Typography>
                                      <Typography variant="h5">
                                        {toPascalCase(row?.stateName)}, {row?.countryName}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography
                                        variant="h4"
                                        sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                      >
                                        <b>
                                          {row?.CurrentValue === null
                                            ? 0
                                            : intToString(row?.CurrentValue)}
                                        </b>
                                      </Typography>
                                      <Typography
                                        component="span"
                                        className={`${row?.Diff > 0 ? 'green' : 'red'}`}
                                      >
                                        {row?.Diff === null ? 0 : row?.Diff}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Divider />
                                </>
                              ))}
                            {isTVFFetching === false && dashboardTVFAPIData?.farms?.length == 0 && <Box>No data found</Box>}
                          </Box>
                        </Grid>
                        {/* End of Top Visited Farms section */}
                      </Grid>
                    </Grid>
                  </Grid>
                </Box></>
            }
          </Container>
        )
        }
      </Box>
      {/* End Main content for dashboard */}
    </>
  );
}

// @mui
import {
  Box,
  Typography,
  Grid,
  Stack,
  Divider,
  MenuItem,
  Button,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import Select from '@mui/material/Select';
// hooks
import useSettings from 'src/hooks/useSettings';
import React, { useEffect, useState } from 'react';
import { MenuProps } from '../../constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LineChart from 'src/components/graph/LineChart';
import DoughnutChart from 'src/components/graph/DoughnutChart';
import { useNavigate } from 'react-router-dom';
import './dashboard.css';
import {
  InsertCommas,
  currentDate,
  dateConvert,
  getOPtionText,
  parseDateAsDotFormat,
  intToString,
  percentageValue,
} from 'src/utils/customFunctions';
import {
  useReportDashboardDataQuery,
  useDownloadReportsExcelFileQuery,
  useGetMostPopularLocationsQuery,
  useGetMostValuableUsersQuery,
  useGetOrderHistoryChartQuery,
  useGetReportBreakDownChartQuery,
  useGetRecentReportListQuery
} from 'src/redux/splitEndpoints/reportsSplit';
import { PATH_DASHBOARD } from 'src/routes/paths';
import ReportChart from './ReportChart';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { getLastFromDate } from 'src/utils/customFunctions';
import CsvLink from 'react-csv-export';
import { toPascalCase } from 'src/utils/customFunctions';
import { CircularSpinner } from 'src/components/CircularSpinner';
import ReportLineChart from 'src/components/graph/ReportLineChart';
import { Spinner } from 'src/components/Spinner';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const ref: any = React.createRef();

export default function ReportsDataAnalytics(props: any) {
  const navigate = useNavigate();
  const { themeLayout } = useSettings();
  const dateFilterList = DashboardConstants.dateFilterList;
  const [reportDashboardData, setReportDashboardData] = useState<any>([]);
  const [dateDefaultSelected, setDateDefaultSelected] = useState<any>('today');
  const [dateOptionSelected, setDateOptionSelected] = useState('today');
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [dateTo, setDateTo] = useState<any>(currentDate());
  const [mostPopularLocationlist, setMostPopularLocationlist] = useState<any>([]);
  const [mostValuablelist, setMostValuablelist] = useState<any>([]);
  const [breakDownPieChartData, setBreakDownPieChartData] = useState<any>([]);
  const [orderHistoryChartData, setOrderHistoryChartData] = useState<any>([]);
  const [reportRecentListData, setReportRecentListData] = useState<any>([]);

  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);


  // Get the current date
  const current_date = new Date();

  // Today
  const today_start = startOfDay(current_date);
  const today_end = endOfDay(current_date);
  const handleDatePicker = (event: any): void => {
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

  const fromDate = (dateDefaultSelected === 'custom') ? dateConvert(convertedCreatedDateValue[0]) : dateConvert(dateFrom);
  const toDate = (dateDefaultSelected === 'custom') ? dateConvert(convertedCreatedDateValue[1]) : dateTo;
  const isDashboardAPI: boolean = fromDate > 0 && toDate > 0 ? true : false;

  // Report dashboard api call
  const { data: dashboardAPIData, isFetching: isReportDataFetching, isLoading: isReportDataLoading, isSuccess: isReportDataSuccess } = useReportDashboardDataQuery({ 'fromDate': fromDate, 'toDate': toDate }, { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true });

  // Most popular location report api call
  const { data: mostPopularLocationAPIData, isFetching: isMostPopularLocationFetching, isLoading: isMostPopularLocationLoading, isSuccess: isMostPopularLocationSuccess } = useGetMostPopularLocationsQuery({ 'fromDate': fromDate, 'toDate': toDate }, { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true });

  // Most valuable users report api call
  const { data: mostValuableUsersAPIData, isFetching: isMostValuableUsersFetching, isLoading: isMostValuableUsersLoading, isSuccess: isMostValuableUsersSuccess } = useGetMostValuableUsersQuery({ 'fromDate': fromDate, 'toDate': toDate }, { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true });

  // Order history chart api call
  const { data: orderHistoryChartAPIData, isFetching: isOrderHistoryChartFetching, isLoading: isOrderHistoryChartLoading, isSuccess: isOrderHistoryChartSuccess } = useGetOrderHistoryChartQuery({ 'fromDate': fromDate, 'toDate': toDate }, { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true });

  // Report breakdown chart api call
  const { data: reportBreakDownChartAPIData, isFetching: isReportBreakDownChartFetching, isLoading: isReportBreakDownChartLoading, isSuccess: isReportBreakDownChartSuccess } = useGetReportBreakDownChartQuery({ 'fromDate': fromDate, 'toDate': toDate }, { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true });

  // Recent orders api call
  const { data: recentOrdersAPIData, isFetching: isRecentOrdersFetching, isLoading: isRecentOrdersLoading, isSuccess: isRecentOrdersSuccess } = useGetRecentReportListQuery({ 'order': 'DESC', 'page': 1, 'limit': 6, 'fromDate': fromDate, 'toData': toDate }, { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true });


  useEffect(() => {
    if (fromDate && toDate) {
      if (isReportDataSuccess) {
        setReportDashboardData(dashboardAPIData);
      }
      if (isMostPopularLocationSuccess) {
        const mpl_dataList: any = mostPopularLocationAPIData?.length && mostPopularLocationAPIData?.slice(0, 5);
        setMostPopularLocationlist(mpl_dataList);
      }
      if (isMostValuableUsersSuccess) {
        const mvc_dataList: any = mostValuableUsersAPIData?.length && mostValuableUsersAPIData?.slice(0, 5);
        setMostValuablelist(mvc_dataList);
      }
      if (isOrderHistoryChartSuccess) {
        setOrderHistoryChartData(orderHistoryChartAPIData);
      }
      if (isReportBreakDownChartSuccess) {
        setBreakDownPieChartData(reportBreakDownChartAPIData);
      }
      if (isRecentOrdersSuccess) {
        setReportRecentListData(recentOrdersAPIData?.data);
      }
    }
  }, [isReportDataFetching, isMostPopularLocationFetching, isMostValuableUsersFetching, isOrderHistoryChartFetching, isReportBreakDownChartFetching, isRecentOrdersFetching]);



  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});

  // Report Dashboard Download indivisual KPI api call
  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
    isError: isCsvDownloadError,
  } = useDownloadReportsExcelFileQuery(
    { setupId: excelPayload, name: 'report' },
    { skip: !isCsvDownloadDownload , refetchOnMountOrArgChange: true}
  );
  //downloads the data to excel
  const downloadIndivisualKPI = (kpiType: any) => {
    if (props.reportModuleAccess?.report_dashboard_download) {
      setExcelPayload({
        kpiTitle: kpiType,
        fromDate: fromDate,
        toDate: toDate,
      });
      setIsCsvDownloadDownload(true);
    } else {
      props.setClickedPopover(true);
    }
  };
  // upadtes IsCsvDownloadDownload when  isCsvDownloadSuccess is changed 
  React.useEffect(() => {
    setIsCsvDownloadDownload(false);
  }, [isCsvDownloadSuccess]);
  // updates Api status Msg when isCsvDownloadError is changed 
  useEffect(() => {
    if (isCsvDownloadError) {
      props.setApiStatusMsg({ status: 422, message: 'Data not found for the given date range!' });
      props.setApiStatus(true);
    }
  }, [isCsvDownloadError]);

  const totalReportOrder: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Total Reports Ordered');
  const avgDeliveryTime: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Average Delivery Time');
  const totalRevenue: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Total Revenue');
  const totalRevenuePerCustomer: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Total Revenue per customer');
  const OrderHistory: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Total Reports Ordered');
  const MostPopularLocations: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Most Popular Locations');
  const RecentOrders: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Recent Orders');
  const MostValuableUsers: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Most Valuable Users');
  const MostPopularReport: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Most Popular Report');
  const MostPopularStallion: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Most Popular Stallion');
  const MostPopularBroodmareSire: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Most Popular Broodmare Sire');
  const MostPopularFarm: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Most Popular Farm');
  const MostPopularPaymentMethod: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Most Popular Payment Method');
  const ReportsOverviewPageViews: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Reports Overview Page Views');
  const OrdersPerPageView: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Orders Per Page View');
  const RepeatedCustomers: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === '# Repeat Customers');
  const ReportBreakDown: any =
    reportDashboardData.length &&
    reportDashboardData.find((item: any) => item?.kpiBlock === 'Report Breakdown');

  const [csvData, setCsvData] = useState<any>('');
  React.useEffect(() => {
    setCsvData([
      {
        'Total Reports Ordered':
          totalReportOrder?.CurrentValue > 0 ? totalReportOrder?.CurrentValue : 0,
        'Average Delivery Time':
          avgDeliveryTime?.CurrentName ? avgDeliveryTime?.CurrentName : 0,
        'Total Revenue': totalRevenue?.CurrentValue > 0 ? totalRevenue?.CurrentValue : 0,
        'Total Revenue Per Customer':
          totalRevenuePerCustomer?.CurrentValue > 0 ? totalRevenuePerCustomer?.CurrentValue : 0,
        'Most Popular Report':
          MostPopularReport?.CurrentName ? MostPopularReport?.CurrentName : '--',
        'Most Popular Stallion':
          MostPopularStallion?.CurrentName ? MostPopularStallion?.CurrentName : '--',
        'Most Popular Broodmare Sire':
          MostPopularBroodmareSire?.CurrentName ? MostPopularBroodmareSire?.CurrentName : '--',
        'Most Popular Farm': MostPopularFarm?.CurrentName ? MostPopularFarm?.CurrentName : '--',
        'Most Popular Payment Method':
          MostPopularPaymentMethod?.CurrentName ? MostPopularPaymentMethod?.CurrentName : '--',
        'Reports Overview Page Views':
          ReportsOverviewPageViews?.CurrentValue > 0 ? ReportsOverviewPageViews?.CurrentValue : 0,
        'Orders Per Page View':
          OrdersPerPageView?.CurrentValue > 0 ? OrdersPerPageView?.CurrentValue : 0,
        '# Repeat Customers':
          RepeatedCustomers?.CurrentValue > 0 ? RepeatedCustomers?.CurrentValue : 0,
      },
    ]);
  }, [reportDashboardData]);

  const breakDownPieChart: any = breakDownPieChartData;
  const breakDownPieData: any =
    breakDownPieChart?.length && breakDownPieChart.map((item: any) => item.OrderProductCount);
  const breakDownPieLabels: any =
    breakDownPieChart?.length && breakDownPieChart.map((item: any) => item.ReportName);
  const breakDownPieTotal: any =
    breakDownPieData?.length && breakDownPieData.reduce((prev: any, next: any) => prev + next);

  // gets percentage 
  let percentageArr: any = [];
  const getPercentage = (value: any, total: any) => {
    if (value && total) {
      const pecentage: any = (value / total) * 100;
      if (pecentage) percentageArr.push(Math.round(pecentage));
      return pecentage && Math.round(pecentage) + '%';
    }
  };

  const lineChartData: any = {
    labels:
      orderHistoryChartData?.length &&
      orderHistoryChartData?.map((item: any) => item?.MonthShortName),
    datasets: [
      {
        label: 'First dataset',
        data:
          orderHistoryChartData?.length &&
          orderHistoryChartData?.map((item: any) => item?.OrderCount),
        fill: false,
        backgroundColor: '#2EFFB4',
        borderColor: '#2EFFB4',
        tension: 0.5,
        pointStyle: 'cross',
        pointBorderWidth: 0,
      },
      {
        label: 'Second dataset',
        data: [33, 33, 53, 60, 41, 44],
        fill: false,
        backgroundColor: '#007142',
        borderColor: '#007142',
        tension: 0.4,
        pointStyle: 'cross',
        pointBorderWidth: 0,
      },
    ],
  };

  return (
    <>
      {/* Reports DashBoard  */}
      <Box className="content-wrapper_">
        {/* Reports Dashboard Header  */}
        <Stack direction="row" className="MainTitleHeader">
          <Grid container mt={1}>
            <Grid item lg={6} sm={6} className="MainTitleHeadLeft">
              <Typography variant="h4" className="MainTitle">
                Reports Dashboard
              </Typography>
            </Grid>
            <Grid item lg={6} sm={6} className="MainTitleHeadRight">
              <Stack
                direction="row"
                sx={{
                  justifyContent: { lg: 'right', sm: 'right', xs: 'left' },
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* Share Button  */}
                <Box className="Share">
                  <CsvLink
                    data={csvData}
                    fileName={`Reports_Data (${dateDefaultSelected})`}
                    withTimeStamp
                  >
                    <Button type="button" className="ShareBtn">
                      <i className="icon-Share"></i>
                    </Button>
                  </CsvLink>
                </Box>
                {/* date filter dropdown  */}
                <Box className="edit-field">
                  <Select
                    MenuProps={MenuProps}
                    className="selectDropDown"
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    onChange={handleDatePicker}
                    value={dateDefaultSelected}
                    sx={{ height: '40px', minWidth: '176px' }}
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
                {/* Custom date picker  */}
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
          </Grid>
        </Stack>
        {!isDashboardAPI ?
          <Box className="Spinner-Wrp">
            <Spinner />
          </Box>
          :
          <>
            <Box mt={1} className="FarmDataDashboardBody">
              <Grid container spacing={1.5} rowSpacing={1.5} className="FarmDataDashboarGrid">
                {/* Total Reports Orderd Tile  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Total Reports Ordered
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_REPORTS_ORDERED')}
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalReportOrder?.CurrentValue ? InsertCommas(totalReportOrder?.CurrentValue) : 0}
                          </Typography>
                          {percentageValue(totalReportOrder?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to {totalReportOrder?.PrevValue} {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* End Total Reports Orderd Tile  */}
                {/* Average Delivery Time Tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Average Delivery Time
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('AVERAGE_DELIVERY_TIME')}
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68', textOverflow:"inherit !important" }}>
                            {avgDeliveryTime?.CurrentName ? avgDeliveryTime?.CurrentName : 0}
                          </Typography>
                          {percentageValue(avgDeliveryTime?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to {avgDeliveryTime?.PrevName} {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* End Average Delivery Time  tile*/}
                {/* TOtal Revenu Tile  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Total Revenue
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_REVENUE')}
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalRevenue?.CurrentValue ? `$${InsertCommas(totalRevenue?.CurrentValue)}` : 0}
                          </Typography>
                          {percentageValue(totalRevenue?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to {totalRevenue?.PrevValue ? InsertCommas(totalRevenue?.PrevValue) : 0} {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* end TOtal Revenu Tile  */}
                {/* Total Revenue Per Customer Tile  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Total Revenue Per Customer
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() =>
                              downloadIndivisualKPI('TOTAL_REVENUE_PER_CUSTOMER')
                            }
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalRevenuePerCustomer?.CurrentValue
                              ? `$${InsertCommas(totalRevenuePerCustomer?.CurrentValue)}`
                              : 0}
                          </Typography>
                          {percentageValue(totalRevenuePerCustomer?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to {totalRevenuePerCustomer?.PrevValue ? InsertCommas(totalRevenuePerCustomer?.PrevValue) : 0} {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* ENd Total Revenue Per Customer Tile  */}
              </Grid>
            </Box>

            <Box mt={1.5} className="WorldReachWrapper">
              <Grid container spacing={1.5} rowSpacing={1.5} className="MessageCountGrid">
                {/* Order History Chart view  */}
                <Grid item xs={9} md={9}>
                  <Box
                    className="WorldReachBox lineChartBox"
                    sx={{ background: '#ffffff', height: '370px' }}
                  >
                    <Stack className="linechart-header">
                      <Stack className="linechart-header-left">
                        <Typography variant="h5">Order History</Typography>
                        <Typography variant="h6" className="valuelinechart">
                          {orderHistoryChartData?.rangeFrom} - {orderHistoryChartData?.rangeTo}
                        </Typography>
                      </Stack>
                      <Stack className='LCvalues'>
                        <Stack className='LCvalueslist'>
                          <Stack className='LCvaluesbox'>
                            <span className='circle green'></span>
                            <Typography variant='h6'>{dateOptionSelected}</Typography>
                          </Stack>
                          <Typography variant='h5'>{orderHistoryChartData?.currentTotal}</Typography>
                        </Stack>
                        <Stack className='LCvalueslist'>
                          <Stack className='LCvaluesbox'>
                            <span className='circle mintgreen'></span>
                            <Typography variant='h6'>Previous</Typography>
                          </Stack>
                          <Typography variant='h5'>{orderHistoryChartData?.previousTotal}</Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Box className='WorldReachBoxBody'>
                      {isOrderHistoryChartFetching ?
                        <CircularSpinner />
                        :
                        <ReportLineChart dateOptionSelected={dateOptionSelected} chartData={orderHistoryChartData?.result} />
                      }
                    </Box>
                  </Box>
                </Grid>
                {/* Ends Order History view  */}
                {/* Most Popularr Location Tiles  */}
                <Grid item xs={12} md={3} className="topPrizemoneyBox">
                  <Box className="DB-farms">
                    <Box className="DB-farms-header">
                      <Typography variant="h3">Most Popular Locations</Typography>
                      <i
                        className="icon-Download"
                        onClick={() => downloadIndivisualKPI('MOST_POPULAR_LOCATIONS')}
                      ></i>
                    </Box>
                    {isMostPopularLocationFetching ? (
                      <Box className="dashboard-loader">
                        <CircularSpinner />
                      </Box>
                    ) :
                      <Box>
                        {mostPopularLocationlist?.length
                          ? mostPopularLocationlist?.map((item: any, index: number) => {
                            return (
                              <>
                                <Stack direction="row" mt={2} mb={1} className="DB-farms-item">
                                  <Box flexGrow={1}>
                                    <Typography variant="h4">{item?.countryCode}</Typography>
                                    <Typography variant="h5">{`${item?.countryName}, ${item?.countryCode}`}</Typography>
                                  </Box>
                                  <Box className="DB-farms-item-right" sx={{ textAlign: 'right' }}>
                                    <Typography variant="h4">
                                      <b>{item?.CurrentValue}</b>
                                    </Typography>
                                    {item?.PreviousValue >= 0 ? (
                                      <Typography component="span" className="green">
                                        +{item?.PreviousValue}
                                      </Typography>
                                    ) : (
                                      <Typography component="span" className="red">
                                        {item?.PreviousValue}
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                                {index < mostPopularLocationlist?.length - 1 && <Divider />}
                              </>
                            );
                          })
                          : ''}
                      </Box>
                    }
                    {(isMostPopularLocationFetching === false && (mostPopularLocationlist?.length === 0 || mostPopularLocationlist == 0)) && <Box className='noDataFound'>No data found</Box>}
                  </Box>
                </Grid>
                {/* Ends Most Popularr Location Tiles  */}
              </Grid>
            </Box>
            <Box mt={2} className="WorldReachWrapper">
              <Grid container spacing={1.5} rowSpacing={1.5} className="ReportsGrid">
                {/* Rescent orders Tile  */}
                <Grid item xs={9} md={9} className="recent-orders-table-wrapper">
                  <Stack className="recent-orders-header">
                    <Typography variant="h5">Recent Orders</Typography>
                    <Button
                      className="link-text"
                      type="button"
                      onClick={() => navigate(PATH_DASHBOARD.reports.filter('orders-list'))}
                    >
                      View All
                    </Button>
                  </Stack>
                  {isRecentOrdersFetching ? <CircularSpinner /> :
                    <>
                      {reportRecentListData?.length ? (
                        <Box className="recent-orders-table">
                          <TableContainer className={`datalist report-data ${props.filterStatus ? 'tableExpanded' : ''}`}>
                            <Table
                              sx={{
                                borderCollapse: 'separate',
                                borderSpacing: '0 4px',
                                background: '#FAF8F7',
                              }}
                            >
                              <TableBody>
                                {reportRecentListData?.length
                                  ? reportRecentListData?.map((item: any, index: any) => {
                                    return (
                                      <TableRow hover key={index}>
                                        <TableCell align="left"  onClick={() => navigate(PATH_DASHBOARD.reports.reportFilter(item?.orderId))}>
                                          <u>{item?.orderId}</u>
                                        </TableCell>
                                        <TableCell align="left">
                                          {parseDateAsDotFormat(item?.orderCreatedOn)}
                                        </TableCell>
                                        <TableCell align="left">{item?.email}</TableCell>
                                        <TableCell align="left">
                                          <u>{item?.productName}</u>
                                        </TableCell>
                                        <TableCell align="left">
                                          <u>{`${item?.currencyCode?.substring(0, 2)}${item?.currencySymbol} ${item?.subTotal}`}</u>
                                        </TableCell>
                                        <TableCell align="left">
                                          <u>{item?.paymentStatus}</u>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })
                                  : ''}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      ) : (
                        <Box className="recent-orders-table">
                          <TableContainer style={{display:"flex", justifyContent:"center"}} className={`datalist report-data ${props.filterStatus ? 'tableExpanded' : ''}`}>
                            <TableRow hover>
                              <Box className='noDataFound'>No data found</Box>
                            </TableRow>
                          </TableContainer>
                        </Box>
                      )}
                    </>
                  }

                </Grid>
                {/* Ends Rescent orders Tile  */}
                {/* Most Valuable Users Tile  */}
                <Grid item xs={12} md={3} className="topPrizemoneyBox most-valuable-user">
                  <Box className="DB-farms">
                    <Box className="DB-farms-header">
                      <Typography variant="h3">Most Valuable Users</Typography>
                      {mostValuablelist?.length ? (
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MOST_VALUABLE_USERS')}
                        ></i>
                      ) : (
                        ''
                      )}
                    </Box>
                    {isMostValuableUsersFetching ? (
                      <Box className="dashboard-loader">
                        <CircularSpinner />
                      </Box>
                    ) :
                      <Box>
                        {mostValuablelist?.length
                          ? mostValuablelist?.map((item: any, index: number) => {
                            return (
                              <>
                                <Stack direction="row" mt={2} mb={1} className="DB-farms-item">
                                  <Box flexGrow={1}>
                                    <Typography variant="h4">{item?.MemberName}</Typography>
                                    <Typography variant="h5">{item?.MemberEmail}</Typography>
                                  </Box>
                                  <Box>
                                    <Typography
                                      variant="h4"
                                      sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                    >
                                      <b>AU${item?.ReportPrice === null ? 0 : intToString(item?.ReportPrice)}</b>
                                    </Typography>
                                  </Box>
                                </Stack>
                                {index < mostValuablelist?.length - 1 && <Divider />}
                              </>
                            );
                          })
                          : ''}
                      </Box>
                    }
                    {(isMostValuableUsersFetching === false && (mostValuablelist?.length === 0 || mostValuablelist == 0)) && <Box >No data found</Box>}
                  </Box>
                </Grid>
                {/* Ends Most Valuable Users Tile  */}
              </Grid>
            </Box>
            <Box mt={2} className="FarmDataDashboardBody">
              <Grid container spacing={1.5} rowSpacing={1.5} className="FarmDataDashboarGrid">
                {/* Most Popular Report tile  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Most Popular Report
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('MOST_POPULAR_REPORT')}
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {/* {MostPopularReport?.CurrentValue ? InsertCommas(MostPopularReport?.CurrentValue) : 0} */}
                            {MostPopularReport?.CurrentName
                              ? toPascalCase(MostPopularReport?.CurrentName)
                              : '-'}
                          </Typography>
                          {/* {percentageValue(MostPopularReport?.diffPercent)} */}
                        </Box>
                        <Typography component="span">
                          Compared to {MostPopularReport?.CurrentName}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Ends Most Popular Report tile  */}
                {/* Most Popular Stallion tile  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Most Popular Stallion
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('MOST_POPULAR_STALLION')}
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {MostPopularStallion?.CurrentName
                              ? toPascalCase(MostPopularStallion?.CurrentName)
                              : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously {toPascalCase(MostPopularStallion?.PrevName)}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* ends Most Popular Stallion tile  */}
                {/* Most Popular Broodmare Sire tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Most Popular Broodmare Sire
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() =>
                              downloadIndivisualKPI('MOST_POPULAR_BROODMARE_SIRE')
                            }
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {MostPopularBroodmareSire?.CurrentName
                              ? toPascalCase(MostPopularBroodmareSire?.CurrentName)
                              : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously {toPascalCase(MostPopularBroodmareSire?.PrevName)}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/*  Ends Most Popular Broodmare Sire tile */}
                {/* Most Popular Farm Tiles  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Most Popular Farm
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('MOST_POPULAR_FARM')}
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {MostPopularFarm?.CurrentName
                              ? toPascalCase(MostPopularFarm?.CurrentName)
                              : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously {toPascalCase(MostPopularFarm?.PrevName)}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Ends Most Popular Farm Tiles  */}
                {/* Most Popular Payment Method tiles  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Most Popular Payment Method
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() =>
                              downloadIndivisualKPI('MOST_POPULAR_PAYMENT_METHOD')
                            }
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {MostPopularPaymentMethod?.CurrentName
                              ? toPascalCase(MostPopularPaymentMethod?.CurrentName)
                              : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously {toPascalCase(MostPopularPaymentMethod?.PrevName)}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Ends Most Popular Payment Method tiles  */}
                {/* Reports Overview Page Views tile  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Reports Overview Page Views
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() =>
                              downloadIndivisualKPI('REPORTS_OVERVIEW_PAGE_VIEWS')
                            }
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {ReportsOverviewPageViews?.CurrentValue
                              ? InsertCommas(ReportsOverviewPageViews?.CurrentValue)
                              : 0}
                          </Typography>
                          {percentageValue(ReportsOverviewPageViews?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to {ReportsOverviewPageViews?.PrevValue} {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Ends Reports Overview Page Views tile  */}
                {/* Orders Per Page View tile  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            Orders Per Page View
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ORDERS_PER_PAGE_VIEW')}
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {OrdersPerPageView?.CurrentValue ? InsertCommas(OrdersPerPageView?.CurrentValue) : 0}
                          </Typography>
                          {percentageValue(OrdersPerPageView?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to {OrdersPerPageView?.PrevValue} {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Ends Orders Per Page View tile  */}
                {/* Repeated Customers tile  */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isReportDataFetching ? <CircularSpinner /> :
                      <Box>
                        <Box className="DB-farms-header">
                          <Typography variant="body2" className="HBD-subheadings">
                            # Repeat Customers
                          </Typography>
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('REPEATED_CUSTOMER')}
                          ></i>
                        </Box>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {RepeatedCustomers?.CurrentValue ? InsertCommas(RepeatedCustomers?.CurrentValue) : 0}
                          </Typography>
                          {percentageValue(RepeatedCustomers?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to {RepeatedCustomers?.PrevValue} {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Ends Repeated Customers tile  */}
              </Grid>
            </Box>
            <Box mt={2} className="WorldReachWrapper">
              <Grid container spacing={1.5} rowSpacing={1.5} className="MessageCountGrid">
                {/* Report chart  */}
                <Grid item xs={9} md={9}>
                  <ReportChart fromDate={fromDate} toDate={toDate} />
                </Grid>
                {/* Report BreakDown TIle  */}
                <Grid item xs={12} md={3} mt={0}>
                  <Box
                    className="RegByCountry"
                    sx={{
                      background: '#ffffff',
                      minHeight: '492px',
                      border: '1px solid #E7E8F2',
                      borderRadius: '5px',
                    }}
                  >
                    <Box className="DB-farms-header mb-0 RegByCountryHead-last-field">
                      <Typography variant="body2" className="HBD-subheadings">
                        Report BreakDown
                      </Typography>
                      <i
                        className="icon-Download"
                        onClick={() => downloadIndivisualKPI('REPORT_BREAKDOWN')}
                      ></i>
                    </Box>

                    <Stack className="DoughnutChart-Box">
                      {isReportBreakDownChartFetching ? <CircularSpinner /> :
                        <Box>
                          {breakDownPieChart?.length ? (
                            <DoughnutChart
                              data={percentageArr}
                              labels={breakDownPieLabels}
                              backgroundColor={[
                                '#007142',
                                '#00DE8E',
                                '#1D472E',
                                '#808080',
                                '#BD9A68',
                                '#C75227',
                              ]}
                            />
                          ) : (
                            ''
                          )}
                          <Box className="Dgchart-analystic-wrp report-chart-analystic">
                            <Stack
                              className={`Dgchart-list-block-wrpr DGchartFirst ${props.filterStatus ? 'Dgchart-block' : ''
                                }`}
                              direction={{ xs: 'column', sm: 'row' }}
                              divider={
                                <Divider
                                  orientation="vertical"
                                  sx={{ borderBottom: 'solid 1px #E7E8F2', borderColor: '#E7E8F2' }}
                                  flexItem
                                />
                              }
                              spacing={1.2}
                            >
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="green">
                                    {getPercentage(
                                      breakDownPieChart?.[0]?.OrderProductCount,
                                      breakDownPieTotal
                                    )}
                                  </Typography>
                                  <Typography variant="h6">{breakDownPieChart?.[0]?.ReportName}</Typography>
                                </Box>
                              </Stack>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="mintgreen">
                                    {getPercentage(
                                      breakDownPieChart?.[1]?.OrderProductCount,
                                      breakDownPieTotal
                                    )}
                                  </Typography>
                                  <Typography variant="h6">{breakDownPieChart?.[1]?.ReportName}</Typography>
                                </Box>
                              </Stack>

                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list Dgchart-last">
                                  <Typography variant="h4" className="darkgreen">
                                    {getPercentage(
                                      breakDownPieChart?.[2]?.OrderProductCount,
                                      breakDownPieTotal
                                    )}
                                  </Typography>
                                  <Typography variant="h6">{breakDownPieChart?.[2]?.ReportName}</Typography>
                                </Box>
                              </Stack>
                            </Stack>

                            <Stack
                              className={`Dgchart-list-block-wrpr ${props.filterStatus ? 'Dgchart-block' : ''
                                }`}
                              direction={{ xs: 'column', sm: 'row' }}
                              divider={
                                <Divider
                                  orientation="vertical"
                                  sx={{ borderBottom: 'solid 1px #E7E8F2', borderColor: '#E7E8F2' }}
                                  flexItem
                                />
                              }
                              spacing={1.2}
                            >
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" style={{ color: 'grey' }}>
                                    {getPercentage(
                                      breakDownPieChart?.[3]?.OrderProductCount,
                                      breakDownPieTotal
                                    )}
                                  </Typography>
                                  <Typography variant="h6">{breakDownPieChart?.[3]?.ReportName}</Typography>
                                </Box>
                              </Stack>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="gold">
                                    {getPercentage(
                                      breakDownPieChart?.[4]?.OrderProductCount,
                                      breakDownPieTotal
                                    )}
                                  </Typography>
                                  <Typography variant="h6">{breakDownPieChart?.[4]?.ReportName}</Typography>
                                </Box>
                              </Stack>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="orange">
                                    {getPercentage(
                                      breakDownPieChart?.[5]?.OrderProductCount,
                                      breakDownPieTotal
                                    )}
                                  </Typography>
                                  <Typography variant="h6">{breakDownPieChart?.[5]?.ReportName}</Typography>
                                </Box>
                              </Stack>
                            </Stack>
                          </Box>

                        </Box>

                      }
                      {(isReportBreakDownChartFetching === false && (breakDownPieChart?.length === 0 || breakDownPieChart == 0)) && <Box className='noDataFound'>No data found</Box>}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        }
      </Box>
    </>
  );
}

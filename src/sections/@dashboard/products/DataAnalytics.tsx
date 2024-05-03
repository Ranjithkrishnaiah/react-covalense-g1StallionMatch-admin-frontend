import { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Stack, Divider, MenuItem, Button } from '@mui/material';
import { MenuProps } from '../../../constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import LineChart from 'src/components/graph/LineChart';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import {
  currentDate,
  dateConvert,
  getLastFromDate,
  getOPtionText,
  scrollToTop,
  InsertCommas,
  percentageValue,
} from 'src/utils/customFunctions';
import {
  useDownloadProductExcelFileQuery,
  useMostPopularProductsQuery,
  useMostPopularPromocodesQuery,
  useProductDashboardQuery,
  useProductRedepmtionGraphDataQuery,
} from 'src/redux/splitEndpoints/productSplit';
import CsvLink from 'react-csv-export';
import { Spinner } from 'src/components/Spinner';
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { CircularSpinner } from 'src/components/CircularSpinner';

export default function DataAnalytics(props: any) {
  const dateFilterList = DashboardConstants.dateFilterList;
  //   react states
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

  const fromDateConverted =
    dateDefaultSelected === 'custom'
      ? dateConvert(convertedCreatedDateValue[0])
      : dateConvert(dateFrom);
  const toDateConverted =
    dateDefaultSelected === 'custom' ? dateConvert(convertedCreatedDateValue[1]) : dateTo;

  const isDashboardAPI = fromDateConverted > 0 && toDateConverted > 0 ? true : false;
  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});
  const [csvData, setCsvData] = useState<any>('');

  // API call to get dashboard data
  const {
    data: dashboardRealAPIData,
    isFetching: isDDFetching,
    isLoading: isDDLoading,
    isSuccess: isDDSuccess,
  } = useProductDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI }
  );
  // API call to download csv for products
  const csvDownloadData = useDownloadProductExcelFileQuery(
    { setupId: excelPayload },
    { skip: !isCsvDownloadDownload , refetchOnMountOrArgChange: true}
  );
  // API call to get Product Redepmtions Graph Data
  const { data: graphData, isFetching: isGraphDataFetching,
    isLoading: isGraphDataLoading,
    isSuccess: isGraphDataSuccess } = useProductRedepmtionGraphDataQuery(
      { fromDate: fromDateConverted, toDate: toDateConverted },
      { skip: !isDashboardAPI }
    );
  // API call to get most Popular Promocode Data
  const { data: mostPopularPromocode, isFetching: mostPopularPromocodeFetching } = useMostPopularPromocodesQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );
  // API call to get most Popular Products Data
  const { data: mostPopularProducts, isFetching: mostPopularProductsFetching } = useMostPopularProductsQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );

  // filter and get data based on KPI title
  const numberOfProducts: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Number of Products'
    );
  const numberOfPromocode: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Number of Promo Codes'
  );
  const redemtions: any = dashboardRealAPIData?.filter((data: any) => data?.KPI === 'Redemtions');
  const successfulPayments: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Successful Payments'
  );
  const averageRevenuePerUser: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Average Revenue Per User (ARPU)'
  );
  const MRR: any = dashboardRealAPIData?.filter((data: any) => data?.KPI === 'MRR(Monthly Recurring Revenue)');
  const ARR: any = dashboardRealAPIData?.filter((data: any) => data?.KPI === 'ARR');
  const customerChurnRate: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Customer Churn Rate (CCR)'
  );
  const customerLifetimeValue: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Customer Lifetime Value (CLV)'
  );
  const averageRevenuePerStallion: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Average Revenue Per Stallion (ARPS)'
  );
  const stallionChurnRate: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Stallion Churn Rate (SCR)'
  );
  const stallionLifetimeValue: any = dashboardRealAPIData?.filter(
    (data: any) => data?.KPI === 'Stallion Lifetime Value (SLV)'
  );

  // csv download based on KPI title
  useEffect(() => {
    if (dashboardRealAPIData) {
      setCsvData([
        {
          'Number of Products':
            numberOfProducts[0].CurrentValue  ? numberOfProducts[0].CurrentValue : 0,
          'Number of Promo Codes':
            numberOfPromocode[0].CurrentValue  ? numberOfPromocode[0].CurrentValue : 0,
          Redemtions: redemtions[0].CurrentValue  ? redemtions[0].CurrentValue : 0,
          'Successful Payments':
            successfulPayments[0].CurrentValue  ? successfulPayments[0].CurrentValue : 0,
          MRR: MRR[0].CurrentValue  ? 'AUD' + MRR[0].CurrentValue : 0,
          ARR: ARR[0].CurrentValue  ? 'AUD' + ARR[0].CurrentValue : 0,
          'Average Revenue Per User (ARPU)':
            averageRevenuePerUser[0].CurrentValue 
              ? 'AUD' + averageRevenuePerUser[0].CurrentValue
              : 0,
          'Customer Churn Rate (CCR)':
            customerChurnRate[0].CurrentValue  ? customerChurnRate[0].CurrentValue : 0,
          'Customer Lifetime Value (CLV)':
            customerLifetimeValue[0].CurrentValue 
              ? 'AUD' + customerLifetimeValue[0].CurrentValue
              : 0,
          'Average Revenue Per Stallion (ARPS)':
            averageRevenuePerStallion[0].CurrentValue 
              ? 'AUD' + averageRevenuePerStallion[0].CurrentValue
              : 0,
          'Stallion Churn Rate (SCR)':
            stallionChurnRate[0].CurrentValue  ? stallionChurnRate[0].CurrentValue : 0,
          'Stallion Lifetime Value (SLV)':
            stallionLifetimeValue[0].CurrentValue 
              ? 'AUD' + stallionLifetimeValue[0].CurrentValue
              : 0,
        },
      ]);
    }
  }, [isDDFetching]);

  // method to download individual tiles based on KPIs
  const downloadIndivisualKPI = (kpiType: any) => {
    if (props?.productModuleAccess?.product_dashboard_download) {
      setExcelPayload({
        kpiTitle: kpiType,
        fromDate: fromDateConverted,
        toDate: toDateConverted,
      });
      setIsCsvDownloadDownload(true);
      scrollToTop();
    }else {
      props?.setClickedPopover(true);
    }
  };

  // method to calculate DiffValue For Popular Promocode
  const calculateDiffValueForPopularPromocode = (obj: any) => {
    let color = 'gray';
    let resultValue = 0;

    if (obj.currentCount && obj.previousCount) {
      resultValue = obj.currentCount - obj.previousCount;
    } else {
      if (!obj.previousCount) {
        resultValue = obj.currentCount;
      }
    }

    if (resultValue > 0) {
      color = 'green';
    } else {
      color = 'red';
    }

    let htmlDiv = (
      <Typography component="span" className={color}>
        {resultValue}
      </Typography>
    );

    return htmlDiv;
  };



  // csv download data fetching
  useEffect(() => {
    if (csvDownloadData.isFetching === false && csvDownloadData.isSuccess === true) {
      setIsCsvDownloadDownload(false);
    }
  }, [csvDownloadData.isFetching]);

  // csv download data error status
  useEffect(() => {
    if (csvDownloadData.isError) {
      props.setApiStatusMsg({ status: 422, message: 'Data not found for the given date range!' });
      props.setApiStatus(true);
    }
  }, [csvDownloadData.isError]);

  return (
    <Container>
      <Stack direction="row" className="MainTitleHeader">
        {/* dashboard share and date filter section */}
        <Grid container mt={2}>
          <Grid item lg={6} sm={6} className="MainTitleHeadLeft">
            <Typography variant="h4" className="MainTitle">
              Product & Promo Codes Dashboard
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
              <Box mr={1}>
                <CsvLink
                  data={csvData}
                  fileName={`Product_Data (${dateDefaultSelected})`}
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
              {/* date range picker */}
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
      {/* dashboard share and date filter section end */}
      {!isDashboardAPI ? (
        <Box className="Spinner-Wrp">
          <Spinner />
        </Box>
      ) : (
        <>
          {/* dashboard products stats section */}
          <Grid container spacing={2} rowSpacing={2} className="promocodeDataLeftBody">
            <Grid item xs={12} md={9}>
              <Box mt={3} className="FarmDataDashboardBody">
                <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                  {/* Number of Products tile */}
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Number of Products{' '}
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('NO_OF_PRODUCTS')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              {numberOfProducts && InsertCommas(numberOfProducts[0].CurrentValue)}
                            </Typography>
                            {numberOfProducts && percentageValue(numberOfProducts[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {numberOfProducts && InsertCommas(numberOfProducts[0].PrevValue)}{' '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>
                  {/* Number of Products tile ends */}

                  {/* Number of Promo Codes tile */}
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Number of Promo Codes
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('NO_OF_PROMOCODES')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              {numberOfPromocode && InsertCommas(numberOfPromocode[0].CurrentValue)}
                            </Typography>
                            {numberOfPromocode && percentageValue(numberOfPromocode[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {numberOfPromocode && InsertCommas(numberOfPromocode[0].PrevValue)}{' '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>
                  {/* Number of Promo Codes tile ends */}

                  {/* Redemtions tile */}
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Redemtions
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('REDEMTIONS')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              {redemtions && InsertCommas(redemtions[0].CurrentValue)}
                            </Typography>
                            {redemtions && percentageValue(redemtions[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to {redemtions && InsertCommas(redemtions[0].PrevValue)}{' '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>
                  {/* Redemtions tile ends */}
                </Grid>
              </Box>
              <Box mt={2} className="WorldReachWrapper">
                {/* products Line Chart */}
                <Grid container spacing={2} rowSpacing={2} className="MessageCountGrid">
                  <Grid item xs={12} md={12}>
                    <Box
                      className="average-distance WorldReachBox lineChartBox"
                      sx={{ background: '#ffffff', height: '370px' }}
                    >
                      <Stack className="linechart-header">
                        <Stack className="linechart-header-left">
                          <Typography variant="h5">Redemptions</Typography>
                          <Typography variant="h6" className="valuelinechart">
                            {graphData?.rangeFrom} -{' '}
                            {graphData?.rangeTo}
                          </Typography>
                        </Stack>
                        <Stack className="LCvalues">
                          <Stack className="LCvalueslist">
                            <Stack className="LCvaluesbox">
                              <span className="circle green"></span>
                              <Typography variant="h6">{dateOptionSelected}</Typography>
                            </Stack>
                            <Typography variant="h5">{graphData?.currentTotal}</Typography>
                          </Stack>
                          <Stack className="LCvalueslist">
                            <Stack className="LCvaluesbox">
                              <span className="circle mintgreen"></span>
                              <Typography variant="h6">Previous</Typography>
                            </Stack>
                            <Typography variant="h5">{graphData?.previousTotal}</Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                      <Box className="WorldReachBoxBody">
                        {isGraphDataFetching ? (
                          <CircularSpinner />
                        ) : (
                          <LineChart
                            dateOptionSelected={dateOptionSelected}
                            chartData={graphData?.result}
                          />
                        )}
                      </Box>
                      {/* products Line Chart */}
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Most Popular Promo Codes */}
            <Grid item xs={12} md={3} mt={3}>
              <Grid container spacing={2} rowSpacing={2} className="MessageCountGrid">
                <Grid
                  item
                  xs={12}
                  md={12}
                  className="topPrizemoneyBox product-data-extra-block-left"
                >
                  <Box className="DB-farms most-popular-products">
                    <Box mb={3} className="DB-farms-header">
                      <Typography variant="h3">Most Popular Promo Codes</Typography>
                      <i
                        className="icon-Download"
                        onClick={() => downloadIndivisualKPI('MOST_POPULAR_PROMOCODES')}
                      ></i>
                    </Box>
                     {mostPopularPromocodeFetching ?(
                      <Box className="dashboard-loader">
                        <CircularSpinner />
                      </Box>
                    ) :
                    <>
                        {mostPopularPromocode?.map((v: any, i: number) => {
                          return (
                            <>
                              <Stack direction="row" mt={2} mb={1} className="DB-farms-item" key={i}>
                                <Box flexGrow={1}>
                                  <Typography variant="h4">{v?.promoCodeName}</Typography>
                                  <Typography variant="h5">{v?.productName}</Typography>
                                </Box>
                                <Box sx={{ textAlign: 'right' }}>
                                  <Typography variant="h4" sx={{ textAlign: 'right' }}>
                                    <b>{v.currentCount}</b>
                                  </Typography>

                                  {calculateDiffValueForPopularPromocode(v)}
                                </Box>
                              </Stack>
                              {mostPopularPromocode && mostPopularPromocode?.length - 1 !== i && (
                                <Divider />
                              )}
                            </>
                          );
                        })}
                        {mostPopularPromocode?.length === 0 && <Box className='noDataFound'>No data found</Box>}
                        </>
                    }
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            {/* Most Popular Promo Codes ends */}
          </Grid>

          <Box mt={2} className="FarmDataDashboardBody">
            <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
              {/* products tiles stats */}
              <Grid item xs={12} md={9}>
                <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Successful Payments
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('SUCCESSFUL_PAYMENTS')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              {successfulPayments && InsertCommas(successfulPayments[0].CurrentValue)}
                            </Typography>
                            {successfulPayments &&
                              percentageValue(successfulPayments[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {successfulPayments && InsertCommas(successfulPayments[0].PrevValue)}{' '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            MRR
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('MRR')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              AU${MRR && InsertCommas(MRR[0].CurrentValue)}
                            </Typography>
                            {MRR && percentageValue(MRR[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to {MRR && InsertCommas(MRR[0].PrevValue)} {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            ARR
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('ARR')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              AU${ARR && InsertCommas(ARR[0].CurrentValue)}
                            </Typography>
                            {ARR && percentageValue(ARR[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to {ARR && InsertCommas(ARR[0].PrevValue)} {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Average Revenue Per User (ARPU)
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('ARPU')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              AU$
                              {averageRevenuePerUser &&
                                InsertCommas(averageRevenuePerUser[0].CurrentValue)}
                            </Typography>
                            {averageRevenuePerUser &&
                              percentageValue(averageRevenuePerUser[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {averageRevenuePerUser &&
                              InsertCommas(averageRevenuePerUser[0].PrevValue)}{' '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Customer Churn Rate (CCR)
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('CCR')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              {customerChurnRate && InsertCommas(customerChurnRate[0].CurrentValue)}%
                            </Typography>
                            {customerChurnRate && percentageValue(customerChurnRate[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {customerChurnRate && InsertCommas(customerChurnRate[0].PrevValue)}{'% '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Customer Lifetime Value (CLV)
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('CLV')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              AU$
                              {customerLifetimeValue &&
                                InsertCommas(customerLifetimeValue[0].CurrentValue)}
                            </Typography>
                            {customerLifetimeValue &&
                              percentageValue(customerLifetimeValue[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {customerLifetimeValue &&
                              InsertCommas(customerLifetimeValue[0].PrevValue)}{' '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Average Revenue Per Stallion(ARPS)
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('ARPS')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              AU$
                              {averageRevenuePerStallion &&
                                InsertCommas(averageRevenuePerStallion[0].CurrentValue)}
                            </Typography>
                            {averageRevenuePerStallion &&
                              percentageValue(averageRevenuePerStallion[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {averageRevenuePerStallion &&
                              InsertCommas(averageRevenuePerStallion[0].PrevValue)}{' '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Stallion Churn Rate (SCR)
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('SCR')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              {stallionChurnRate && InsertCommas(stallionChurnRate[0].CurrentValue)}%
                            </Typography>
                            {stallionChurnRate && percentageValue(stallionChurnRate[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {stallionChurnRate && InsertCommas(stallionChurnRate[0].PrevValue)}{'% '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack direction="row" className="HDB-blocks">
                      {isDDFetching ? <CircularSpinner /> :
                        <Box>
                          <Typography variant="body2" className="HBD-subheadings">
                            Stallion Lifetime Value (SLV)
                            <i
                              className="icon-Download"
                              onClick={() => downloadIndivisualKPI('SLV')}
                            ></i>
                          </Typography>
                          <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                            <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                              AU$
                              {stallionLifetimeValue &&
                                InsertCommas(stallionLifetimeValue[0].CurrentValue)}
                            </Typography>
                            {stallionLifetimeValue &&
                              percentageValue(stallionLifetimeValue[0]?.diffPercent)}
                          </Box>
                          <Typography component="span">
                            Compared to{' '}
                            {stallionLifetimeValue &&
                              InsertCommas(stallionLifetimeValue[0].PrevValue)}{' '}
                            {dateOptionSelected}
                          </Typography>
                        </Box>
                      }
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>
              {/* products tiles stats ends */}

              {/* Most Popular Products tile */}
              <Grid item xs={12} md={3} className="topPrizemoneyBox product-data-extra-block-left">
                <Box className="DB-farms msg-most-engaged">
                  <Box mb={3} className="DB-farms-header">
                    <Typography variant="h3">Most Popular Products</Typography>
                    <i
                      className="icon-Download"
                      onClick={() => downloadIndivisualKPI('MOST_POPULAR_PRODUCTS')}
                    ></i>
                  </Box>
                  {mostPopularProductsFetching ? (
                    <Box className="dashboard-loader">
                      <CircularSpinner />
                    </Box>
                  ) :
                    <>
                      {mostPopularProducts?.map((v: any, i: number) => {
                        return (
                          <>
                            <Stack direction="row" mt={2} mb={1} className="DB-farms-item" key={i}>
                              <Box flexGrow={1}>
                                <Typography variant="h4">{v.productName}</Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h4" sx={{ textAlign: 'right' }}>
                                  <b>{v.currentCount}</b>
                                </Typography>
                                {calculateDiffValueForPopularPromocode(v)}
                              </Box>
                            </Stack>
                            {mostPopularProducts && mostPopularProducts?.length - 1 !== i && (
                              <Divider />
                            )}
                          </>
                        );
                      })}
                      {mostPopularProducts?.length === 0 && <Box className='noDataFound'>No data found</Box>}
                    </>
                  }

                </Box>
              </Grid>
              {/* Most Popular Products tile ends */}
            </Grid>
          </Box>
        </>
      )}
      {/* dashboard products stats section end */}
    </Container>
  );
}

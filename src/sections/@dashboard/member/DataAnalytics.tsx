// @mu
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Box, Button, Divider, Grid, MenuItem, Stack, Typography } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React, { useState } from 'react';
import CsvLink from 'react-csv-export';
import { CircularSpinner } from 'src/components/CircularSpinner';
import { Spinner } from 'src/components/Spinner';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import DottedWorldMemberMap from 'src/components/graph/DottedWorldMemberMap';
import DoughnutChart from 'src/components/graph/DoughnutChart';
import MemberLineChart from 'src/components/graph/MemberLineChart';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import { MenuProps } from 'src/constants/MenuProps';
import {
  useDownloadMemberExcelFileQuery,
  useMemberDashboardQuery,
  useMemberDashboardRegByCountryQuery,
  useMemberDashboardRegRateQuery,
} from 'src/redux/splitEndpoints/memberSplit';
import {
  addDecimalUptoTwo,
  currentDate,
  dateConvert,
  getLastFromDate,
  getOPtionText,
  InsertCommas,
  percentageValue,
} from 'src/utils/customFunctions';
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

export default function DataAnalytics(props: any) {
  const { filterStatus, memberModuleAccess, setMemberModuleAccess, clickedPopover, setClickedPopover } = props;
  const dateFilterList = DashboardConstants.dateFilterList;
  const [dateDefaultSelected, setDateDefaultSelected] = useState('today');
  const [dateOptionSelected, setDateOptionSelected] = useState('today');
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [dateTo, setDateTo] = useState<any>(currentDate());
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  // Get the current date
  const current_date = new Date();

  // Today
  const today_start = startOfDay(current_date);
  const today_end = endOfDay(current_date);
  // Handle datepicker
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
  const isDashboardAPI: boolean = fromDateConverted > 0 && toDateConverted > 0 ? true : false;

  // Member dashboard api call
  const {
    data: dashboardAPIData,
    isFetching,
    isLoading,
    isSuccess: isMemberDataSuccess,
  } = useMemberDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI, refetchOnMountOrArgChange: true }
  );

  // Member Dashboard RegByCountry api call
  const {
    data: dashboardRegByCountryAPIData,
    isFetching: isRegByCountryFetching,
    isLoading: isRegByCountryLoading,
    isSuccess: isRegByCountrySuccess,
  } = useMemberDashboardRegByCountryQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI, refetchOnMountOrArgChange: true }
  );

  // Member Dashboard RegRate api call
  const {
    data: dashboardRegRateAPIData,
    isFetching: isRegRateFetching,
    isLoading: isRegRateLoading,
    isSuccess: isRegRateSuccess,
  } = useMemberDashboardRegRateQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI, refetchOnMountOrArgChange: true }
  );

  const dashboardData = isMemberDataSuccess
    ? dashboardAPIData
    : DashboardConstants.memberDashboardStaticData;
  const [breakDownPieChartData, setBreakDownPieChartData] = useState<any>([]);
  // const dashboardRegByCountryData = (isRegByCountrySuccess) ? dashboardRegByCountryAPIData : DashboardConstants.memberRegByCountryStaticData;

  const dashboardRegRateData = isRegRateSuccess
    ? dashboardRegRateAPIData
    : DashboardConstants.memberRegRateStaticData;

  const newRegistrationsData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'New Registrations'
  );
  const avgRegistrationsGrowthData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Average Registrations growth'
  );
  const avgSpendPerUserData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Average spend per user'
  );
  const userSpendingData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'User Spending'
  );
  const churnRateData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Churn rate');
  const myStallionsData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'My Stallions'
  );
  const myMareData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'My Mares');
  const myBroodmareSireData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'My Broodmare Sires'
  );
  const myFarmsData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'My Farms');
  const visitorsData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Visitors');
  const avgVisitiorGrowthData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Average Visitior Growth'
  );
  const sessionsData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Sessions');

  React.useEffect(() => {
    if (isRegByCountrySuccess) {
      setBreakDownPieChartData(dashboardRegByCountryAPIData);
    }
  }, [isRegByCountryFetching]);

  const breakDownPieData: any =
    breakDownPieChartData?.length && breakDownPieChartData.map((item: any) => item?.percent);
  const breakDownPieLabels: any =
    breakDownPieChartData?.length && breakDownPieChartData.map((item: any) => item?.countryName);

  // gets percentage
  let percentageArr: any = [];
  const getPercentage = (value: any, total: any) => {
    if (value && total) {
      const pecentage: any = (value / total) * 100;
      if (pecentage) percentageArr.push(Math.round(pecentage));
      return pecentage && Math.round(pecentage) + '%';
    }
  };

  // Generate data for share
  const [csvData, setCsvData] = useState<any>([]);
  let cntr = 0;
  React.useEffect(() => {
    setCsvData([
      {
        Visitors: visitorsData[0]?.CurrentValue ? visitorsData[0]?.CurrentValue : 0,
        'New Registrations':
          newRegistrationsData[0]?.CurrentValue ? newRegistrationsData[0]?.CurrentValue : 0,
        'Average Visitor Growth':
          avgVisitiorGrowthData[0]?.CurrentValue ? avgVisitiorGrowthData[0]?.CurrentValue : 0,
        'Average Reg. Growth':
          avgRegistrationsGrowthData[0]?.CurrentValue
            ? avgRegistrationsGrowthData[0]?.CurrentValue
            : 0,
        'Average Spend per User':
          avgSpendPerUserData[0]?.CurrentValue ? avgSpendPerUserData[0]?.CurrentValue : 0,
        'Users Spending':
          userSpendingData[0]?.CurrentValue ? userSpendingData[0]?.CurrentValue : 0,
        Sessions: sessionsData[0]?.CurrentValue ? sessionsData[0]?.CurrentValue : 0,
        'Churn Rate': churnRateData[0]?.CurrentValue ? churnRateData[0]?.CurrentValue : 0,
        'My Stallions': myStallionsData[0]?.CurrentValue ? myStallionsData[0]?.CurrentValue : 0,
        'My Mares': myMareData[0]?.CurrentValue ? myMareData[0]?.CurrentValue : 0,
        'My Broodmare Sires':
          myBroodmareSireData[0]?.CurrentValue ? myBroodmareSireData[0]?.CurrentValue : 0,
        'My Farms': myFarmsData[0]?.CurrentValue ? myFarmsData[0]?.CurrentValue : 0,
      },
    ]);
    cntr++;
  }, [isFetching]);

  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});

  // Member Dashboard Download indivisual KPI api call
  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
  } = useDownloadMemberExcelFileQuery(
    { setupId: excelPayload, name: 'member' },
    { skip: !isCsvDownloadDownload , refetchOnMountOrArgChange: true}
  );
  const downloadIndivisualKPI = (kpiType: any) => {
    if (memberModuleAccess?.member_dashboard_download) {
      setExcelPayload({
        kpiTitle: kpiType,
        fromDate: fromDateConverted,
        toDate: toDateConverted,
      });
      setIsCsvDownloadDownload(true);
    } else {
      setClickedPopover(true);
    }
  };
  React.useEffect(() => {
    setIsCsvDownloadDownload(false);
  }, [isCsvDownloadSuccess]);

  return (
    <>
      {/* Header content for member dashboard */}
      <Stack direction="row" className="MainTitleHeader">
        <Grid container mt={2}>
          <Grid item lg={6} sm={6} className="MainTitleHeadLeft">
            <Typography variant="h4" className="MainTitle">
              Member Dashboard
            </Typography>
          </Grid>
          <Grid item lg={6} sm={6} className="MainTitleHeadRight">
            <Stack
              direction="row"
              sx={{ justifyContent: { lg: 'right', sm: 'right', xs: 'left' }, display: 'flex' }}
            >
              <Box className="Share">
                <CsvLink
                  data={csvData}
                  fileName={`Member_Data (${dateDefaultSelected})`}
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
        </Grid>
      </Stack>
      {/* End Header content for member dashboard */}
      {!isDashboardAPI ? (
        <Box className="Spinner-Wrp">
          <Spinner />
        </Box>
      ) : (
        <>
          {/* First four KPI section */}
          <Box mt={3} className="MemberDataDashboardBody">
            <Grid container spacing={2} rowSpacing={2} className="MemberDataDashboarGrid">
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Visitors{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('TOTAL_VISITORS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {visitorsData[0]?.CurrentValue &&
                            InsertCommas(visitorsData[0]?.CurrentValue)}
                        </Typography>
                        {visitorsData && percentageValue(visitorsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {visitorsData[0]?.PrevValue && InsertCommas(visitorsData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        New Registrations{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('TOTAL_NEW_REGISTRATIONS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {newRegistrationsData[0]?.CurrentValue &&
                            InsertCommas(newRegistrationsData[0]?.CurrentValue)}
                        </Typography>
                        {newRegistrationsData &&
                          percentageValue(newRegistrationsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {newRegistrationsData[0]?.PrevValue &&
                          InsertCommas(newRegistrationsData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Average Visitor Growth{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('AVG_VISITORS_GROWTH')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {avgVisitiorGrowthData[0]?.CurrentValue &&
                            addDecimalUptoTwo(avgVisitiorGrowthData[0]?.CurrentValue.toString())}
                          %{' '}
                        </Typography>
                        {avgVisitiorGrowthData &&
                          percentageValue(avgVisitiorGrowthData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {avgVisitiorGrowthData[0]?.PrevValue &&
                          addDecimalUptoTwo(avgVisitiorGrowthData[0]?.PrevValue.toString())}
                        % {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Average Reg. Growth{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('AVG_REGISTRATIONS_GROWTH')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {avgRegistrationsGrowthData[0]?.CurrentValue &&
                            addDecimalUptoTwo(avgRegistrationsGrowthData[0]?.CurrentValue.toString())}
                          %{' '}
                        </Typography>
                        {avgRegistrationsGrowthData &&
                          percentageValue(avgRegistrationsGrowthData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {avgRegistrationsGrowthData[0]?.PrevValue &&
                          addDecimalUptoTwo(avgRegistrationsGrowthData[0]?.PrevValue.toString())}
                        % {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
            </Grid>
          </Box>
          {/* End First four KPI section */}

          {/* World map section */}
          <Box mt={2} className="WorldReachWrapper">
            <Box className="WorldReachBox" sx={{ background: '#ffffff', height: '580px' }}>
              <Typography variant="h5">World Reach</Typography>
              <Box className="WorldReachBoxBody">
                <DottedWorldMemberMap fromDate={fromDateConverted} toDate={toDateConverted} totalMembers={visitorsData[0]?.CurrentValue} />
              </Box>
            </Box>
          </Box>
          {/* World map section */}

          {/* Registration Rate and Registration by country section */}
          {/* 
          Registration Rate and Registration by country compoenent            
          if data is loading it loads spinner component
          if data is present the data component loads
          if there is no data NoData component is loaded 
     */}

          <Box className="chartMembersWrapper" mt={2} mb={2}>
            <Grid container spacing={2} rowSpacing={2} className="chartMembersWrapperGrid">
              <Grid item xs={12} md={9} mt={0}>
                <Box
                  className="WorldReachBox lineChartBox"
                  sx={{ background: '#ffffff', minHeight: '446px' }}
                >
                  <Stack className="linechart-header">
                    <Stack className="linechart-header-left">
                      <Typography variant="h5">Registration Rate</Typography>
                      <Typography variant="h6" className="valuelinechart">
                        {dashboardRegRateData?.rangeFrom} - {dashboardRegRateData?.rangeTo}
                      </Typography>
                    </Stack>
                    <Stack className="LCvalues">
                      <Stack className="LCvalueslist">
                        <Stack className="LCvaluesbox">
                          <span className="circle green"></span>
                          <Typography variant="h6">{dateOptionSelected}</Typography>
                        </Stack>
                        <Typography variant="h5">
                          {dashboardRegRateData?.currentTotal &&
                            InsertCommas(dashboardRegRateData?.currentTotal)}
                        </Typography>
                      </Stack>
                      <Stack className="LCvalueslist">
                        <Stack className="LCvaluesbox">
                          <span className="circle mintgreen"></span>
                          <Typography variant="h6">Previous</Typography>
                        </Stack>
                        <Typography variant="h5">
                          {dashboardRegRateData?.previousTotal &&
                            InsertCommas(dashboardRegRateData?.previousTotal)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Box className="WorldReachBoxBody">
                    {isRegRateFetching ? (
                      <CircularSpinner />
                    ) : (
                      <MemberLineChart
                        dateOptionSelected={dateOptionSelected}
                        chartData={dashboardRegRateData?.result}
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={3} mt={0}>
                <Box
                  className="RegByCountry"
                  sx={{
                    background: '#ffffff',
                    minHeight: '446px',
                    border: '1px solid #E7E8F2',
                    borderRadius: '5px',
                  }}
                >
                  <Typography variant="h6" className="RegByCountryHead">
                    Registration by Country
                  </Typography>
                  {/* <DoughnutMemberChart chartData={dataResults} chartLabels={dataLabels}/> */}
                  {isRegByCountryFetching ? <CircularSpinner /> :
                    <Box>
                      <DoughnutChart
                        data={breakDownPieData}
                        labels={breakDownPieLabels}
                        backgroundColor={[
                          '#007142',
                          '#00DE8E',
                          '#1D472E',
                          '#2EFFB4',
                          '#BD9A68',
                          '#C75227',
                          '#B0B6AF',
                        ]}
                      />
                      <Box className="Dgchart-analystic-wrp">
                        <Stack
                          className={`Dgchart-list-block-wrpr ${props.filterStatus ? 'Dgchart-member-block' : ''
                            }`}
                          direction={{ xs: 'column', sm: 'row' }}
                          divider={
                            <Divider orientation="vertical" sx={{ borderColor: '#E7E8F2' }} flexItem />
                          }
                          spacing={1.5}
                        >
                          {breakDownPieChartData[0]?.hasOwnProperty('countryName') && (
                            <>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="green">
                                    {breakDownPieChartData[0]?.percent}%
                                  </Typography>
                                  <Typography variant="h6">
                                    {breakDownPieChartData[0]?.countryName}
                                  </Typography>
                                </Box>
                              </Stack>
                            </>
                          )}
                          {breakDownPieChartData[1]?.hasOwnProperty('countryName') && (
                            <>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="mintgreen">
                                    {breakDownPieChartData[1]?.percent}%
                                  </Typography>
                                  <Typography variant="h6">
                                    {breakDownPieChartData[1]?.countryName}
                                  </Typography>
                                </Box>
                              </Stack>
                            </>
                          )}
                          {breakDownPieChartData[2]?.hasOwnProperty('countryName') && (
                            <>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="darkgreen">
                                    {breakDownPieChartData[2]?.percent}%
                                  </Typography>
                                  <Typography variant="h6">
                                    {breakDownPieChartData[2]?.countryName}
                                  </Typography>
                                </Box>
                              </Stack>
                            </>
                          )}
                        </Stack>

                        <Stack
                          className={`Dgchart-list-block-wrpr ${props.filterStatus ? 'Dgchart-member-block' : ''
                            }`}
                          direction={{ xs: 'column', sm: 'row' }}
                          divider={
                            <Divider orientation="vertical" sx={{ borderColor: '#E7E8F2' }} flexItem />
                          }
                          spacing={1.5}
                        >
                          {breakDownPieChartData[3]?.hasOwnProperty('countryName') && (
                            <>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="mintgreen">
                                    {breakDownPieChartData[3]?.percent}%
                                  </Typography>
                                  <Typography variant="h6">
                                    {breakDownPieChartData[3]?.countryName}
                                  </Typography>
                                </Box>
                              </Stack>
                            </>
                          )}
                          {breakDownPieChartData[4]?.hasOwnProperty('countryName') && (
                            <>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list">
                                  <Typography variant="h4" className="gold">
                                    {breakDownPieChartData[4]?.percent}%
                                  </Typography>
                                  <Typography variant="h6">
                                    {breakDownPieChartData[4]?.countryName}
                                  </Typography>
                                </Box>
                              </Stack>
                            </>
                          )}

                          {breakDownPieChartData[5]?.hasOwnProperty('countryName') && (
                            <>
                              <Stack className="Dgchart-list-block">
                                <Box className="Dgchart-list Dgchart-last-list">
                                  <Typography variant="h4" className="orange">
                                    {breakDownPieChartData[5]?.percent}%
                                  </Typography>
                                  <Typography variant="h6">
                                    {breakDownPieChartData[5]?.countryName}
                                  </Typography>
                                </Box>
                              </Stack>
                            </>
                          )}
                        </Stack>
                      </Box>
                    </Box>
                  }
                </Box>
              </Grid>
            </Grid>
          </Box>
          {/* End Registration Rate and Registration by country section */}

          {/* last eight KPI section */}
          <Box mt={2} className="MemberDataDashboardBody">
            <Grid container spacing={2} rowSpacing={2} className="MemberDataDashboarGrid">
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Average Spend per User{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('AVG_SPEND_PER_USER')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {'$'}
                          {avgSpendPerUserData[0]?.CurrentValue &&
                            InsertCommas(avgSpendPerUserData[0]?.CurrentValue)}
                        </Typography>
                        {avgSpendPerUserData && percentageValue(avgSpendPerUserData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to {'$'}
                        {avgSpendPerUserData[0]?.PrevValue &&
                          InsertCommas(avgSpendPerUserData[0]?.PrevValue)} {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Users Spending (%){' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('USER_SPENDING')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {userSpendingData[0]?.CurrentValue}
                          {'%'}
                        </Typography>
                        {userSpendingData && percentageValue(userSpendingData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to {userSpendingData[0]?.PrevValue}
                        {'%'} {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>

              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Sessions{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('TOTAL_USER_SESSIONS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {sessionsData[0]?.CurrentValue &&
                            InsertCommas(sessionsData[0]?.CurrentValue)}
                        </Typography>
                        {sessionsData && percentageValue(sessionsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {sessionsData[0]?.PrevValue && InsertCommas(sessionsData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Churn Rate{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('CHURN_RATE')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {churnRateData[0]?.CurrentValue}
                          {'%'}
                        </Typography>
                        {churnRateData && percentageValue(churnRateData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to {churnRateData[0]?.PrevValue}
                        {'%'} {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        My Stallions{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MY_STALLIONS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {myStallionsData[0]?.CurrentValue &&
                            InsertCommas(myStallionsData[0]?.CurrentValue)}
                        </Typography>
                        {myStallionsData && percentageValue(myStallionsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {myStallionsData[0]?.PrevValue && InsertCommas(myStallionsData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        My Mares{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MY_MARES')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {myMareData[0]?.CurrentValue && InsertCommas(myMareData[0]?.CurrentValue)}
                        </Typography>
                        {myFarmsData && percentageValue(myMareData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {myMareData[0]?.PrevValue && InsertCommas(myMareData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        My Broodmare Sires{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MY_BROODMARE_SIRES')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {myBroodmareSireData[0]?.CurrentValue}
                        </Typography>
                        {myBroodmareSireData && percentageValue(myBroodmareSireData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to {myBroodmareSireData[0]?.PrevValue}{'%'} {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        My Farms{' '}
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MY_FARMS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {myFarmsData[0]?.CurrentValue}
                        </Typography>
                        {myFarmsData && percentageValue(myFarmsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to {myFarmsData[0]?.PrevValue}{'%'} {dateOptionSelected}
                      </Typography>
                    </Box>
                  }
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      {/* End of last eight KPI section */}
    </>
  );
}

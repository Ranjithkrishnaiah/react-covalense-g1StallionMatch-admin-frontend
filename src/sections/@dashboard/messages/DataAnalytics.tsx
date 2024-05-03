// @mu
import { Box, Typography, Grid, Stack, MenuItem, Button } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState, useEffect } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import React from 'react';
import { MenuProps } from 'src/constants/MenuProps';
import {
  dateConvert,
  getLastFromDate,
  currentDate,
  getOPtionText,
  intToString,
  InsertCommas,
  percentageValue,
} from 'src/utils/customFunctions';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import _ from 'lodash';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { Divider } from '@mui/material';
import { toPascalCase } from 'src/utils/customFunctions';
import CsvLink from 'react-csv-export';
import {
  useConversationBreakdownGraphQuery,
  useMessageDashboardQuery,
  useMostEngagedUsersQuery,
  useMostMentionedStallionsQuery,
  useMsgCountGraphDataQuery,
  useDownloadMessagingExcelFileQuery,
} from 'src/redux/splitEndpoints/messagesSplit';
import MessagesLineChart from 'src/components/graph/MessagesLineChart';
import DoughnutMessagesChart from 'src/components/graph/DoughnutMessagesChart';
import { CircularSpinner } from 'src/components/CircularSpinner';
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

export default function DataAnalytics(props: any) {
  const dateFilterList = DashboardConstants.dateFilterList;
  // initial states
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

  // API call to get messages dashbnoard data
  const {
    data: dashboardRealAPIData,
    isFetching: isDDFetching,
    isLoading: isDDLoading,
    isSuccess: isDDSuccess,
  } = useMessageDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );

  // API call to get Most Mentioned Stallions data
  const {
    data: dashboardMMSAPIData,
    isFetching: isMMSFetching,
    isLoading: isMMSLoading,
    isSuccess: isMMSSuccess,
  } = useMostMentionedStallionsQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );

  // API call to get Most Engaged Users data
  const {
    data: dashboardMEUAPIData,
    isFetching: isMEUFetching,
    isLoading: isMEULoading,
    isSuccess: isMEUSuccess,
  } = useMostEngagedUsersQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );

  const dashboardData = isDDSuccess
    ? dashboardRealAPIData
    : DashboardConstants?.raceDashboardStaticData;

  // filter and get data based on KPI title
  const conversationsData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Conversations'
  );
  const messagesData: any = dashboardData?.filter((data: any) => data?.KPI === 'Messages');
  const activeBreedersData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Active Breeders'
  );
  const activeFarmUsersData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Active Farm Users'
  );
  const nominationRequestsData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Nomination Requests'
  );
  const acceptedNominationsData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Accepted Nominations'
  );
  const counterOfferedNominationData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Counter Offered Nominatio'
  );
  const declinedNominationsData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Declined Nominations'
  );
  const mostEngagedFarmData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Most Engaged Farm'
  );
  const mostEngagedStallionData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Most Engaged Stallion'
  );
  const mostEngagedCountryData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Most Engaged Country'
  );
  const flaggedMessagesData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Flagged Messages'
  );
  const quickestFarmReplyData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Quickest Farm Reply'
  );
  const averageFarmResponseData: any = dashboardData?.filter(
    (data: any) => data?.KPI === 'Average Farm Response'
  );

  // csv download based on KPI title
  const [csvData, setCsvData] = useState<any>('');
  React.useEffect(() => {
    setCsvData([
      {
        'Conversations data':
          conversationsData[0]?.CurrentValue > 0 ? conversationsData[0]?.CurrentValue : 0,
        'Messages data': messagesData[0]?.CurrentValue > 0 ? messagesData[0]?.CurrentValue : 0,
        'Active Breeders':
          activeBreedersData[0]?.CurrentValue > 0 ? activeBreedersData[0]?.CurrentValue : 0,
        'Active Farm Users':
          activeFarmUsersData[0]?.CurrentValue > 0 ? activeFarmUsersData[0]?.CurrentValue : 0,
        'Nomination Requests':
          nominationRequestsData[0]?.CurrentValue > 0 ? nominationRequestsData[0]?.CurrentValue : 0,
        'Accepted Nominations':
          acceptedNominationsData[0]?.CurrentValue > 0
            ? acceptedNominationsData[0]?.CurrentValue
            : 0,
        'Counter Offered Nomination':
          counterOfferedNominationData[0]?.CurrentValue > 0
            ? counterOfferedNominationData[0]?.CurrentValue
            : 0,
        'Declined Nominations':
          declinedNominationsData[0]?.CurrentValue > 0
            ? declinedNominationsData[0]?.CurrentValue
            : 0,
        'Flagged Messages':
          flaggedMessagesData[0]?.CurrentValue > 0 ? flaggedMessagesData[0]?.CurrentValue : 0,
        'Most Engaged Farm':
          mostEngagedFarmData[0]?.CurrentName !== '' ? mostEngagedFarmData[0]?.CurrentName : '',
        'Most Engaged Stallion':
          mostEngagedStallionData[0]?.CurrentName !== ''
            ? mostEngagedStallionData[0]?.CurrentName
            : '',
        'Most Engaged Country':
          mostEngagedCountryData[0]?.CurrentName !== ''
            ? mostEngagedCountryData[0]?.CurrentName
            : '',
        'Quickest Farm Reply':
          quickestFarmReplyData[0]?.CurrentName !== '' ? quickestFarmReplyData[0]?.CurrentName : '',
        'Average Farm Response':
          averageFarmResponseData[0]?.CurrentName !== ''
            ? averageFarmResponseData[0]?.CurrentName
            : '',
      },
    ]);
  }, [isDDSuccess, dashboardData]);

  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});

  // API call to download messaging details
  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
    isError: isCsvDownloadError,
  } = useDownloadMessagingExcelFileQuery(
    { setupId: excelPayload, name: 'messages' },
    { skip: !isCsvDownloadDownload , refetchOnMountOrArgChange: true}
  );
  // method to download individual tiles based on KPIs
  const downloadIndivisualKPI = (kpiType: any) => {
    if (props.messageModuleAccess?.message_dashboard_download) {
      setExcelPayload({
        kpiTitle: kpiType,
        fromDate: fromDateConverted,
        toDate: toDateConverted,
      });
      setIsCsvDownloadDownload(true);
    } else {
      props.setClickedPopover(true);
    }
  };


  React.useEffect(() => {
    setIsCsvDownloadDownload(false);
  }, [isCsvDownloadSuccess]);

  // error handler
  useEffect(() => {
    if (isCsvDownloadError) {
      props.setApiStatusMsg({ status: 422, message: 'Data not found for the given date range!' });
      props.setApiStatus(true);
    }
  }, [isCsvDownloadError]);

  // API call to get Messages Count Graph Data
  const {
    data: dashboardMessageCountAPIData,
    isFetching: isMessageCountFetching,
    isLoading: isMessageCountLoading,
    isSuccess: isMessageCountSuccess,
  } = useMsgCountGraphDataQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );
  const dashboardMessageCountData = isMessageCountSuccess
    ? dashboardMessageCountAPIData
    : DashboardConstants.messagingMessageCountStaticData;

  // API call to get Conversation Breakdown Graph Data
  const { data: doughnutData, isFetching: doughnutFetching } = useConversationBreakdownGraphQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isDashboardAPI }
  );

  const dataResults = _.values(doughnutData);
  const dataLabels = _.keys(doughnutData);

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuPropss: any = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        marginTop: '-1px',
        boxShadow: 'none',
        border: 'solid 1px #161716',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        boxSizing: 'border-box',
      },
    },
  };

  return (
    <>
      <Box>
        {/* dashboard share and date filter section */}
        <Stack direction="row" className="MainTitleHeader">
          <Grid container mt={2}>
            <Grid item lg={6} sm={6}>
              <Typography variant="h4" className="MainTitle">
                Message Dashboard
              </Typography>
            </Grid>
            <Grid item lg={6} sm={6} className="MainTitleHeadRight">
              <Stack
                direction="row"
                sx={{
                  justifyContent: { lg: 'right', sm: 'right', xs: 'left' },
                  display: 'flex',
                }}
              >
                {/* csv download share icon */}
                <Box className="Share">
                  <CsvLink
                    data={csvData}
                    fileName={`Messaging_Data (${dateDefaultSelected})`}
                    withTimeStamp
                  >
                    <Button type="button" className="ShareBtn">
                      <i className="icon-Share"></i>
                    </Button>
                  </CsvLink>
                </Box>
                {/* csv download share icon end */}

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
            {/* dashboard messages stats section */}
            <Box mt={1} className="FarmDataDashboardBody">
              <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                {/* Conversations tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Conversations{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('CONVERSATIONS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {conversationsData[0]?.CurrentValue &&
                              InsertCommas(conversationsData[0]?.CurrentValue)}
                          </Typography>
                          {conversationsData && percentageValue(conversationsData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {conversationsData[0]?.PrevValue &&
                            InsertCommas(conversationsData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Conversations tile ends */}
                {/* Messages tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Messages{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('MESSAGES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {messagesData[0]?.CurrentValue &&
                              InsertCommas(messagesData[0]?.CurrentValue)}
                          </Typography>
                          {messagesData && percentageValue(messagesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {messagesData[0]?.PrevValue && InsertCommas(messagesData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Messages tile ends */}

                {/* Active Breeders tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Active Breeders{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ACTIVE_BREEDERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {activeBreedersData[0]?.CurrentValue &&
                              InsertCommas(activeBreedersData[0]?.CurrentValue)}
                          </Typography>
                          {activeBreedersData && percentageValue(activeBreedersData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {activeBreedersData[0]?.PrevValue &&
                            InsertCommas(activeBreedersData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Active Breeders tile ends */}

                {/* Active Farm Users tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Active Farm Users{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ACTIVE_FARM_USERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {activeFarmUsersData[0]?.PrevValue &&
                              InsertCommas(activeFarmUsersData[0]?.CurrentValue)}
                          </Typography>
                          {activeFarmUsersData &&
                            percentageValue(activeFarmUsersData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {activeFarmUsersData[0]?.PrevValue &&
                            InsertCommas(activeFarmUsersData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Active Farm Users tile ends */}

                {/* Nomination Requests tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Nomination Requests{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('NOMINATION_REQUESTS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {nominationRequestsData[0]?.CurrentValue &&
                              InsertCommas(nominationRequestsData[0]?.CurrentValue)}
                          </Typography>
                          {nominationRequestsData &&
                            percentageValue(nominationRequestsData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {nominationRequestsData[0]?.PrevValue &&
                            InsertCommas(nominationRequestsData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Nomination Requests tile end */}

                {/* Accepted Nominations tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Accepted Nominations{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ACCEPTED_NOMINATIONS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {acceptedNominationsData[0]?.CurrentValue &&
                              InsertCommas(acceptedNominationsData[0]?.CurrentValue)}
                          </Typography>
                          {acceptedNominationsData &&
                            percentageValue(acceptedNominationsData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {acceptedNominationsData[0]?.PrevValue &&
                            InsertCommas(acceptedNominationsData[0]?.PrevValue)}{'% '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Accepted Nominations tile ends */}

                {/* Counter Offered Nominations tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Counter Offered Nominations{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('COUNTER_OFFERED_NOMINATIONS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {counterOfferedNominationData[0]?.CurrentValue &&
                              InsertCommas(counterOfferedNominationData[0]?.CurrentValue)}
                          </Typography>
                          {counterOfferedNominationData &&
                            percentageValue(counterOfferedNominationData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {counterOfferedNominationData[0]?.PrevValue &&
                            InsertCommas(counterOfferedNominationData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Counter Offered Nominations tile ends */}

                {/* Declined Nominations tile */}
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Declined Nominations{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('DECLINED_NOMINATIONS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {declinedNominationsData[0]?.CurrentValue &&
                              InsertCommas(declinedNominationsData[0]?.CurrentValue)}
                          </Typography>
                          {declinedNominationsData &&
                            percentageValue(declinedNominationsData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {declinedNominationsData[0]?.PrevValue &&
                            InsertCommas(declinedNominationsData[0]?.PrevValue)}{'% '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                {/* Declined Nominations tile ends */}
              </Grid>
            </Box>
            {/* dashboard messages stats section end */}

            {/* MessageCount graph section */}
            <Box mt={2} className="WorldReachWrapper">
              <Grid container spacing={2} rowSpacing={2} className="MessageCountGrid">
                {/* MessagesLineChart */}
                <Grid item xs={9} md={9}>
                  <Box
                    className="WorldReachBox lineChartBox"
                    sx={{ background: '#ffffff', height: '370px' }}
                  >
                    <Stack className="linechart-header">
                      <Stack className="linechart-header-left">
                        <Typography variant="h5">Message Count</Typography>
                        <Typography variant="h6" className="valuelinechart">
                          {dashboardMessageCountData?.rangeFrom} -{' '}
                          {dashboardMessageCountData?.rangeTo}
                        </Typography>
                      </Stack>
                      <Stack className="LCvalues">
                        <Stack className="LCvalueslist">
                          <Stack className="LCvaluesbox">
                            <span className="circle green"></span>
                            <Typography variant="h6">{dateOptionSelected}</Typography>
                          </Stack>
                          <Typography variant="h5">
                            {dashboardMessageCountData?.currentTotal}
                          </Typography>
                        </Stack>
                        <Stack className="LCvalueslist">
                          <Stack className="LCvaluesbox">
                            <span className="circle mintgreen"></span>
                            <Typography variant="h6">Previous</Typography>
                          </Stack>
                          <Typography variant="h5">
                            {dashboardMessageCountData?.previousTotal}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Box className="WorldReachBoxBody">
                      {isMessageCountFetching ? (
                        <CircularSpinner />
                      ) : (
                        <MessagesLineChart
                          dateOptionSelected={dateOptionSelected}
                          chartData={dashboardMessageCountData?.result}
                        />
                      )}
                    </Box>
                    {/* MessagesLineChart ends */}
                  </Box>
                </Grid>
                <Grid item xs={12} md={3} className="topPrizemoneyBox">
                  {/* Most Mentioned Stallions */}
                  <Box className="DB-farms message-DB-farms">
                    <Box mb={3} className="DB-farms-header">
                      <Typography variant="h3">Most Mentioned Stallions </Typography>
                      <i
                        className="icon-Download"
                        onClick={() => downloadIndivisualKPI('MOST_MENTIONED_STALLIONS')}
                      ></i>
                    </Box>
                    {isMMSFetching ? (
                      <Box className="dashboard-loader">
                        <CircularSpinner />
                      </Box>
                    ) :
                      <>
                        {dashboardMMSAPIData?.map((row: any, index: number) => (
                          <>
                            <Stack direction="row" mt={2} mb={1} className="DB-farms-item">
                              <Box flexGrow={1}>
                                <Typography variant="h4">
                                  {toPascalCase(row?.CurrentStallionName)}
                                </Typography>
                                <Typography variant="h5">
                                  {row?.CurrentState}
                                  {row?.CurrentState && ','} {row?.CurrentCountry}
                                </Typography>
                              </Box>
                              <Box className="DB-farms-item-right" sx={{ textAlign: 'right' }}>
                                <Typography variant="h4" sx={{ textAlign: 'right' }}>
                                  <b>{row?.CurrentValue ? intToString(row?.CurrentValue) : '-'}</b>
                                </Typography>
                                <Typography
                                  component="span"
                                  className={`${row?.Diff > 0 ? 'green' : 'red'}`}
                                >
                                  {row?.Diff
                                    ? row?.Diff > 0
                                      ? `+ ${row?.Diff}`
                                      : `${row?.Diff}`
                                    : '-'}
                                </Typography>
                              </Box>
                            </Stack>
                            <Divider />
                          </>
                        ))}
                      </>
                    }
                    {(isMMSFetching === false && dashboardMMSAPIData?.length == 0) && <Box className='noDataFound'>No data found</Box>}
                  </Box>
                  {/* Most Mentioned Stallions ends */}
                </Grid>
              </Grid>
            </Box>
            {/* MessageCount graph section end */}

            <Box mt={2} className="FarmDataDashboardBody">
              <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                {/* Conversation Breakdown section */}
                <Grid item xs={12} md={3} mt={0}>
                  <Box
                    className="RegByCountry"
                    sx={{
                      background: '#ffffff',
                      height: '415px',
                      border: '1px solid #E7E8F2',
                      borderRadius: '5px',
                    }}
                  >
                    <Typography variant="h6" className="RegByCountryHead">
                      Conversation Breakdown
                    </Typography>

                    {doughnutFetching ? <CircularSpinner /> :
                      (doughnutData?.waitingForReply || doughnutData?.receivedReponse || doughnutData?.archived) ?
                      <>
                        <Stack className="DoughnutChart-Box" sx={{ marginBottom: '10px' }}>
                          <DoughnutMessagesChart chartData={dataResults} chartLabels={dataLabels} />
                        </Stack>

                        <Box className="Dgchart-analystic-wrp">
                          <Stack
                            className={`Dgchart-list-block-wrpr ${props.filterStatus ? 'Dgchart-block' : ''
                              }`}
                            direction={{ xs: 'column', md: 'row', sm: 'row' }}
                            divider={
                              <Divider
                                orientation="vertical"
                                sx={{ borderColor: '#E7E8F2' }}
                                flexItem
                              />
                            }
                            spacing={1.2}
                          >
                            <Box className="Dgchart-list-block">
                              <Box className="Dgchart-list">
                                <Typography variant="h4" className="green">
                                  {doughnutData?.waitingForReply}
                                  {'%'}
                                </Typography>
                                <Typography variant="h6">Waiting for Reply</Typography>
                              </Box>
                            </Box>

                            <Box className="Dgchart-list-block">
                              <Box className="Dgchart-list">
                                <Typography variant="h4" className="mintgreen">
                                  {doughnutData?.receivedReponse}
                                  {'%'}
                                </Typography>
                                <Typography variant="h6">Recieved Response</Typography>
                              </Box>
                            </Box>

                            <Box className="Dgchart-list-block">
                              <Box className="Dgchart-list Dgchart-last-list">
                                <Typography variant="h4" className="darkgreen">
                                  {doughnutData?.archived}
                                  {'%'}
                                </Typography>
                                <Typography variant="h6">Archived</Typography>
                              </Box>
                            </Box>
                          </Stack>
                        </Box>
                      </> :
                      <></>
                    }
                    {doughnutFetching === false && (doughnutData?.waitingForReply == null && doughnutData?.receivedReponse == null && doughnutData?.archived == null) && <Box className='noDataFound' style={{padding:'34px'}}>No data found </Box>}
                  </Box>
                </Grid>
                {/* Conversation Breakdown section end */}

                {/* dashboard messages stats section */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                    {/* Most Engaged Farm */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Most Engaged Farm{' '}
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('MOST_ENGAGED_FARM')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {mostEngagedFarmData[0]?.CurrentName ? toPascalCase(mostEngagedFarmData[0]?.CurrentName) : '-'}
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {
                                mostEngagedFarmData[0]?.PrevName === '-' ||
                                  mostEngagedFarmData[0]?.PrevName === null
                                  ? 'N/A'
                                  : toPascalCase(mostEngagedFarmData[0]?.PrevName)
                              }
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    {/* Most Engaged Farm ends */}

                    {/* Most Engaged Stallion */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Most Engaged Stallion{' '}
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('MOST_ENGAGED_STALLION')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {mostEngagedStallionData[0]?.CurrentName ? toPascalCase(mostEngagedStallionData[0]?.CurrentName) : '-'}
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {
                                mostEngagedStallionData[0]?.PrevName === '-' ||
                                  mostEngagedStallionData[0]?.PrevName === null
                                  ? 'N/A'
                                  : toPascalCase(mostEngagedStallionData[0]?.PrevName)
                              }
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    {/* Most Engaged Stallion end */}

                    {/* Most Engaged Country tile */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Most Engaged Country{' '}
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('MOST_ENGAGED_COUNTRY')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {toPascalCase(mostEngagedCountryData[0]?.CurrentName)}
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {
                                mostEngagedCountryData[0]?.PrevName === '-' ||
                                  mostEngagedCountryData[0]?.PrevName === null
                                  ? 'N/A'
                                  : toPascalCase(mostEngagedCountryData[0]?.PrevName)
                              }
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    {/* Most Engaged Country tile ends */}

                    {/* Flagged Messages */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Flagged Messages{' '}
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('FLAGGED_MESSAGES')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#C75227' }}>
                                {toPascalCase(flaggedMessagesData[0]?.CurrentValue)}
                              </Typography>
                              {flaggedMessagesData &&
                                percentageValue(flaggedMessagesData[0]?.diffPercent)}
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {flaggedMessagesData[0]?.PrevName === '-' ||
                                flaggedMessagesData[0]?.PrevName === null
                                ? 'N/A'
                                : flaggedMessagesData[0]?.PrevName}
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    {/* Flagged Messages ends */}

                    {/* Quickest Farm Reply tile */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Quickest Farm Reply{' '}
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('QUICKEST_FARM_REPLY')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {toPascalCase(quickestFarmReplyData[0]?.CurrentName)}
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {
                                quickestFarmReplyData[0]?.PrevName === '-' ||
                                  quickestFarmReplyData[0]?.PrevName === null
                                  ? 'N/A'
                                  : toPascalCase(quickestFarmReplyData[0]?.PrevName)
                              }
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    {/* Quickest Farm Reply tile ends*/}

                    {/* Average Farm Response tile */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Average Farm Response{' '}
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('AVERAGE_FARM_RESPONSE')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }} title={averageFarmResponseData[0]?.CurrentName}>
                                {averageFarmResponseData[0]?.CurrentName.toString().split('.')[0]}
                              </Typography>
                              {averageFarmResponseData &&
                                percentageValue(averageFarmResponseData[0]?.diffPercent)}
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {averageFarmResponseData[0]?.PrevName === '-' ||
                                averageFarmResponseData[0]?.PrevName === null
                                ? 'N/A'
                                : averageFarmResponseData[0]?.PrevName.toString().split('.')[0]}
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    {/* Average Farm Response tile ends */}
                  </Grid>
                </Grid>

                <Grid item xs={12} md={3} className="topPrizemoneyBox">
                  {/* Most Engaged Users tile */}
                  <Box className="DB-farms msg-most-engaged">
                    <Box mb={3} className="DB-farms-header">
                      <Typography variant="h3">Most Engaged Users</Typography>
                      <i
                        className="icon-Download"
                        onClick={() => downloadIndivisualKPI('MOST_ENGAGED_USERS')}
                      ></i>
                    </Box>
                    {isMEUFetching ? (
                      <Box className="dashboard-loader">
                        <CircularSpinner />
                      </Box>
                    ) :
                      <>
                        {dashboardMEUAPIData?.map((row: any, index: number) => (
                          <>
                            <Stack direction="row" mt={2} mb={1} className="DB-farms-item">
                              <Box flexGrow={1}>
                                <Typography variant="h4">{toPascalCase(row['UserName'])}</Typography>
                                <Typography variant="h5">{row['EmailID']}</Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="h4"
                                  sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                >
                                  <b>{row['MessagesCount'] ? intToString(row['MessagesCount']) : '-'}</b>
                                </Typography>
                              </Box>
                            </Stack>
                            <Divider />
                          </>
                        ))}
                      </>
                    }
                    {(isMEUFetching === false && dashboardMEUAPIData?.length == 0) && <Box className='noDataFound'>No data found</Box>}
                  </Box>
                  {/* Most Engaged Users tile ends */}
                </Grid>
                {/* dashboard messages stats section ends */}
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}

const Placeholder = ({ children }: any) => {
  return <div>{children}</div>;
};

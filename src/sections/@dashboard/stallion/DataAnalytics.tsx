// @mui
import { Box, Typography, Grid, Stack, MenuItem, Button } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import 'src/pages/dashboard/dashboard.css';
import { useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import React from 'react';
import { MenuProps } from 'src/constants/MenuProps';
import {
  dateConvert,
  getLastFromDate,
  currentDate,
  getOPtionText,
  toPascalCase,
  InsertCommas,
  percentageValue,
} from 'src/utils/customFunctions';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import {
  useStallionDashboardQuery,
  useDownloadStallionExcelFileQuery,
} from 'src/redux/splitEndpoints/stallionsSplit';
import DottedWorldStallionMap from 'src/components/graph/DottedWorldStallionMap';
import { trim } from 'lodash';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
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
  const { stallionModuleAccess, setStallionModuleAccess, clickedPopover, setClickedPopover } = props;
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
  const isDashboardAPI = fromDateConverted > 0 && toDateConverted > 0 ? true : false;

  // Stallion dashboard api call
  const {
    data: dashboardAPIData,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useStallionDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI }
  );
  const dashboardData = isSuccess
    ? dashboardAPIData
    : DashboardConstants.stallionDashboardStaticData;

  // Generate the data from API by filter with KPI block name
  const totalActiveStallionsData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Active stallions'
  );
  const totalPromotedStallionsData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Promoted stallions'
  );
  const newStallionsData: any = dashboardData?.filter(
    (data: any) => trim(data?.kpiBlock) === 'New Stallions'
  );
  const churnedStallionsData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Churned stallions'
  );

  const mostSearchedStallionData: any = dashboardData?.filter(
    (data: any) => trim(data?.kpiBlock) === 'Most searched stallion'
  );
  const largestNominationsSoldStallionData: any = dashboardData?.filter(
    (data: any) => data?.id === 19
  );
  const mostMessagedStallionData: any = dashboardData?.filter(
    (data: any) => trim(data?.kpiBlock) === 'Most messaged stallion'
  );
  const mostViewedProfileData: any = dashboardData?.filter(
    (data: any) => trim(data?.kpiBlock) === 'Most Viewed Profile Page'
  );

  const mostEngagedStallionData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most Engaged Stallion'
  );
  const topReferrerData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Top Referrer Stallion'
  );
  const mostActiveStallionData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most active Stallion'
  );
  const mostSuccessfulStallionData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most successful stallion'
  );

  // Generate the data for CSV file
  const [csvData, setCsvData] = useState<any>('');
  React.useEffect(() => {
    setCsvData([
      {
        'Total Active stallions':
          totalActiveStallionsData[0]?.CurrentValue > 0
            ? totalActiveStallionsData[0]?.CurrentValue
            : 0,
        'Total Promoted stallions':
          totalPromotedStallionsData[0]?.CurrentValue > 0
            ? totalPromotedStallionsData[0]?.CurrentValue
            : 0,
        'New Stallions':
          newStallionsData[0]?.CurrentName !== '' ? newStallionsData[0]?.CurrentValue : 0,
        'Churned stallions':
          churnedStallionsData[0]?.CurrentValue > 0 ? churnedStallionsData[0]?.CurrentValue : 0,
        'Most searched stallion':
          mostSearchedStallionData[0]?.CurrentName !== ''
            ? mostSearchedStallionData[0]?.CurrentName
            : '',
        'Largest Nominations sold Stallion':
          largestNominationsSoldStallionData[0]?.CurrentName !== ''
            ? largestNominationsSoldStallionData[0]?.CurrentName
            : '',
        'Most messaged stallion':
          mostMessagedStallionData[0]?.CurrentName !== ''
            ? mostMessagedStallionData[0]?.CurrentName
            : '',
        'Most Viewed Profile Page':
          mostViewedProfileData[0]?.CurrentName !== '' ? mostViewedProfileData[0]?.CurrentName : '',
        'Most Engaged Stallion':
          mostEngagedStallionData[0]?.CurrentName !== ''
            ? mostEngagedStallionData[0]?.CurrentName
            : '',
        'Top Referrer':
          topReferrerData[0]?.CurrentName !== '' ? topReferrerData[0]?.CurrentName : '',
        'Most Active Stallion (Runners)':
          mostActiveStallionData[0]?.CurrentName !== ''
            ? mostActiveStallionData[0]?.CurrentName
            : '',
        'Most Successfull Stallion (Winners)':
          mostSuccessfulStallionData[0]?.CurrentName !== ''
            ? mostSuccessfulStallionData[0]?.CurrentName
            : '',
      },
    ]);
  }, [isSuccess, dashboardData]);

  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});

  // Download indivisual KPI api call
  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
  } = useDownloadStallionExcelFileQuery(
    { setupId: excelPayload, name: 'race' },
    { skip: !isCsvDownloadDownload , refetchOnMountOrArgChange: true}
  );

  // Once user clicks on indivisual KPI, generate the payload for Download indivisual KPI api call
  const downloadIndivisualKPI = (kpiType: any) => {
    if (stallionModuleAccess?.stallion_dashboard_download) {
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
      {/* Main content for stallion dashboard */}
      <Stack direction="row" className="MainTitleHeader">
        {/* Share and Date filter section */}
        <Grid container mt={2}>
          <Grid item lg={6} sm={6} className="MainTitleHeadLeft">
            <Typography variant="h4" className="MainTitle">
              Stallions Dashboard
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
                  fileName={`Stallion_Data (${dateDefaultSelected})`}
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
        {/* End of Share and Date filter section */}
      </Stack>
      {!isDashboardAPI ? (
        <Box className="Spinner-Wrp">
          <Spinner />
        </Box>
      ) : (
        <>
          {/* First four KPI section */}
          <Box mt={2} className="StallionDataDashboardBody">
            <Grid container spacing={2} rowSpacing={2} className="StallionDataDashboarGrid">
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Total Active Stallions
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('TOTAL_ACTIVE_STALLIONS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {totalActiveStallionsData[0]?.CurrentValue &&
                            InsertCommas(totalActiveStallionsData[0]?.CurrentValue)}
                        </Typography>
                        {totalActiveStallionsData &&
                          percentageValue(totalActiveStallionsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {totalActiveStallionsData[0]?.PrevValue &&
                          InsertCommas(totalActiveStallionsData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Total Promoted Stallions
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('TOTAL_PROMOTED_STALLIONS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {totalPromotedStallionsData[0]?.CurrentValue &&
                            InsertCommas(totalPromotedStallionsData[0]?.CurrentValue)}
                        </Typography>
                        {totalPromotedStallionsData &&
                          percentageValue(totalPromotedStallionsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {totalPromotedStallionsData[0]?.PrevValue &&
                          InsertCommas(totalPromotedStallionsData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>

              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        New Stallions
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('NEW_STALLIONS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {newStallionsData[0]?.CurrentValue > 0
                            ? InsertCommas(newStallionsData[0]?.CurrentValue)
                            : 0}
                        </Typography>
                        {newStallionsData && percentageValue(newStallionsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {newStallionsData[0]?.PrevValue &&
                          InsertCommas(newStallionsData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Churned Stallions
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('CHURNED_STALLIONS')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {churnedStallionsData[0]?.CurrentValue &&
                            InsertCommas(churnedStallionsData[0]?.CurrentValue)}
                        </Typography>
                        {churnedStallionsData &&
                          percentageValue(churnedStallionsData[0]?.diffPercent)}
                      </Box>
                      <Typography component="span">
                        Compared to{' '}
                        {churnedStallionsData[0]?.PrevValue &&
                          InsertCommas(churnedStallionsData[0]?.PrevValue)}{' '}
                        {dateOptionSelected}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>
            </Grid>
          </Box>
          {/* End of First four KPI section */}

          {/* World map section */}
          <Box mt={3} className="WorldReachWrapper">
            <Box className="WorldReachBox" sx={{ background: '#ffffff', height: '580px' }}>
              <Typography variant="h5">World Reach - Stallions</Typography>
              <Box className="WorldReachBoxBody">
                {/* World map component */}
                <DottedWorldStallionMap fromDate={fromDateConverted} toDate={toDateConverted} totalStallions={totalActiveStallionsData[0]?.CurrentValue} />
              </Box>
            </Box>
          </Box>
          {/* End of World map section */}

          {/* last eight KPI section */}
          <Box mt={2} className="StallionDataDashboardBody">
            <Grid container spacing={2} rowSpacing={2} className="StallionDataDashboarGrid">
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Most Searched Stallion
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MOST_SEARCHED_STALLION')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {toPascalCase(mostSearchedStallionData[0]?.CurrentName)}
                        </Typography>
                      </Box>
                      <Typography component="span">
                        Previously {toPascalCase(mostSearchedStallionData[0]?.PrevName)}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Largest Nominations Sold
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('LARGEST_NOMINATIONS_SOLD_STALLION')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {toPascalCase(largestNominationsSoldStallionData[0]?.CurrentName)}
                        </Typography>
                      </Box>
                      <Typography component="span">
                        Previously {toPascalCase(largestNominationsSoldStallionData[0]?.PrevName)}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>

              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Most Messaged Stallion
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MOST_MESSAGED_STALLION')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {toPascalCase(mostMessagedStallionData[0]?.CurrentName)}
                        </Typography>
                      </Box>
                      <Typography component="span">
                        Previously {toPascalCase(mostMessagedStallionData[0]?.PrevName)}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Most Viewed Profile Page
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MOST_VIEWED_PROFILE_PAGE')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {toPascalCase(mostViewedProfileData[0]?.CurrentName)}
                        </Typography>
                      </Box>
                      <Typography component="span">
                        Previously {toPascalCase(mostViewedProfileData[0]?.PrevName)}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Most Engaged Stallion
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MOST_ENGAGED_STALLION')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {toPascalCase(mostEngagedStallionData[0]?.CurrentName)}
                        </Typography>
                      </Box>
                      <Typography component="span">
                        Previously {toPascalCase(mostEngagedStallionData[0]?.PrevName)}
                      </Typography>
                    </Box>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Top Referrer
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('TOP_REFERRER_STALLION')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {topReferrerData[0]?.CurrentName ? toPascalCase(topReferrerData[0]?.CurrentName) : '-'}
                        </Typography>
                      </Box>
                        <Typography component="span">
                          Previously {topReferrerData[0]?.PrevName ? toPascalCase(topReferrerData[0]?.PrevName) : '-'}
                        </Typography>
                    </Box>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Most Active Stallion (Runners)
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MOST_ACTIVE_STALLION')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {toPascalCase(mostSuccessfulStallionData[0]?.CurrentName)}
                        </Typography>
                      </Box>
                        <Typography component="span">
                          {' '}
                          Previously {toPascalCase(mostSuccessfulStallionData[0]?.PrevName)}
                        </Typography>
                    </Box>}
                </Stack>
              </Grid>
              <Grid item xs={12} md={3}>
                <Stack direction="row" className="HDB-blocks">
                  {isFetching ? <CircularSpinner /> :
                    <Box>
                      <Typography variant="body2" className="HBD-subheadings">
                        Most Successfull Stallion (Winners)
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MOST_SUCCESSFUL_STALLION')}
                        ></i>
                      </Typography>
                      <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                        <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                          {toPascalCase(mostSuccessfulStallionData[0]?.CurrentName)}
                        </Typography>
                      </Box>
                        <Typography component="span">
                          Previously {toPascalCase(mostSuccessfulStallionData[0]?.PrevName)}
                        </Typography>
                    </Box>}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </>
      )}
      {/* End of last eight KPI section */}

      {/* End of Main content for stallion dashboard */}
    </>
  );
}

// @mui
import {
  Box,
  Typography,
  Grid,
  Stack,
  MenuItem,
  Button,
  StyledEngineProvider,
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import React from 'react';
import { MenuProps } from 'src/constants/MenuProps';
import {
  dateConvert,
  getLastFromDate,
  currentDate,
  getOPtionText,
  InsertCommas,
  percentageValue,
} from 'src/utils/customFunctions';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import {
  useHorseDashboardQuery,
  useDownloadHorseExcelFileQuery,
} from 'src/redux/splitEndpoints/horseSplit';
import { trim } from 'lodash';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import CsvLink from 'react-csv-export';
import UnAuthorized from 'src/components/NoDataComponent/UnAuthorized';
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
  const { horseModuleAccess, setHorseModuleAccess, clickedPopover, setClickedPopover } = props;
  const dateFilterList = DashboardConstants.dateFilterList;

  // Get the current date
  const current_date = new Date();

  // Today
  const today_start = startOfDay(current_date);
  const today_end = endOfDay(current_date);

  const [dateDefaultSelected, setDateDefaultSelected] = useState('today');
  const [dateOptionSelected, setDateOptionSelected] = useState('today');
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [dateTo, setDateTo] = useState<any>(currentDate());
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
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

  // Horse dashboard api call
  const {
    data: dashboardAPIData,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useHorseDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, dateRangeType: dateDefaultSelected },
    { skip: !isDashboardAPI }
  );
  const dashboardData = isSuccess ? dashboardAPIData : DashboardConstants.horseDashboardStaticData;

  const totalHorsesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Horses'
  );
  const newHorsesData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'New Horses');
  const missingSireOrDamData: any = dashboardData?.filter(
    (data: any) => trim(data?.kpiBlock) === 'Missing Sire or Dam'
  );
  const missingYoBCoBColourData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Missing YoB CoB Colour'
  );
  const thoroughbredsData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Thoroughbreds'
  );
  const nonThoroughbredsData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'NonThoroughbreds'
  );
  const inEligibleData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'InEligible');
  const verifiedData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Verified');
  const runnersData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Runners');
  const stakesWinnersData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Stakes Winners'
  );
  const winnersData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Winners');
  const countriesRunnersData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Countries Runners'
  );
  const racesData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Races');
  const stakesRacesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Stakes Races'
  );
  const totalCountriesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Countries'
  );
  const inEligibleCountriesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'EligibleCountries'
  );
  const apiAddedData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'API added');
  const userRequestedData: any = dashboardData?.filter(
    (data: any) => trim(data?.kpiBlock) === 'User Requested'
  );
  const thirdPartyAddedData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === '3rd Party added'
  );
  const internallyAddedData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Internally added'
  );

  // Generate data for share
  const csvData = [
    {
      'Total Horses': totalHorsesData[0]?.CurrentValue,
      'New Horses': newHorsesData[0]?.CurrentValue,
      'Missing Sire or Dam': missingSireOrDamData[0]?.CurrentValue,
      'Missing YoB/CoB/Colour': missingYoBCoBColourData[0]?.CurrentValue,
      Thoroughbreds: thoroughbredsData[0]?.CurrentValue,
      'Non-thoroughbreds': nonThoroughbredsData[0]?.CurrentValue,
      Ineligible: inEligibleData[0]?.CurrentValue,
      Verified: verifiedData[0]?.CurrentValue,
      Runners: runnersData[0]?.CurrentValue,
      'Stakes Winners': stakesWinnersData[0]?.CurrentValue,
      Winners: winnersData[0]?.CurrentValue,
      'Countries (Runners)': countriesRunnersData[0]?.CurrentValue,
      Races: racesData[0]?.CurrentValue,
      'Stakes Races': stakesRacesData[0]?.CurrentValue,
      'Total Countries': totalCountriesData[0]?.CurrentValue,
      'Eligible Countries': inEligibleCountriesData[0]?.CurrentValue,
      'API Added': apiAddedData[0]?.CurrentValue,
      'User Requested': userRequestedData[0]?.CurrentValue,
      '3rd Party Added': thirdPartyAddedData[0]?.CurrentValue,
      'Internally Added': internallyAddedData[0]?.CurrentValue,
    },
  ];

  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});

  // Horse Dashboard Download indivisual KPI api call
  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
  } = useDownloadHorseExcelFileQuery(
    { setupId: excelPayload, name: 'race' },
    { skip: !isCsvDownloadDownload , refetchOnMountOrArgChange: true}
  );
  const downloadIndivisualKPI = (kpiType: any) => {
    if (horseModuleAccess?.horse_dashboard_download) {
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
    <StyledEngineProvider injectFirst>
      <>
        {/* Header content for horse dashboard */}
        <Stack direction="row" className="MainTitleHeader">
          <Grid container mt={2}>
            <Grid item lg={6} sm={6} className="MainTitleHeadLeft">
              <Typography variant="h4" className="MainTitle">
                Horse Data Dashboard
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
                    fileName={`Horse_Data (${dateDefaultSelected})`}
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
        {/* End of Header content for horse dashboard */}
        {!isDashboardAPI ? (
          <Box className="Spinner-Wrp">
            <Spinner />
          </Box>
        ) : (
          <>
            {/* All KPI section and each section has four KPIs */}
            <Box mt={3} className="HorseDataDashboardBody">
              <Grid container spacing={2} rowSpacing={2} className="HorseDataDashboarGrid">
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Total Horses
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_HORSES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalHorsesData[0]?.CurrentValue &&
                              InsertCommas(totalHorsesData[0]?.CurrentValue)}
                          </Typography>
                          {totalHorsesData && percentageValue(totalHorsesData[0]?.diffPercent)}
                        </Box>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          New Horses
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('NEW_HORSES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {
                              InsertCommas(newHorsesData[0]?.CurrentValue ? newHorsesData[0]?.CurrentValue : 0)}
                          </Typography>
                          {newHorsesData && percentageValue(newHorsesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {newHorsesData[0]?.PrevValue && InsertCommas(newHorsesData[0]?.PrevValue)}{' '}
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
                          Missing Sire or Dam
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('MISSING_SIRE_OR_DAM')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {missingSireOrDamData[0]?.CurrentValue &&
                              InsertCommas(missingSireOrDamData[0]?.CurrentValue)}
                          </Typography>
                          {missingSireOrDamData &&
                            percentageValue(missingSireOrDamData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {missingSireOrDamData[0]?.PrevValue &&
                            InsertCommas(missingSireOrDamData[0]?.PrevValue)}{' '}
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
                          Missing YoB/CoB/Colour
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('MISSING_YOB_COB_COLOUR')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {missingYoBCoBColourData[0]?.CurrentValue &&
                              InsertCommas(missingYoBCoBColourData[0]?.CurrentValue)}
                          </Typography>
                          {missingYoBCoBColourData &&
                            percentageValue(missingYoBCoBColourData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {missingYoBCoBColourData[0]?.PrevValue &&
                            InsertCommas(missingYoBCoBColourData[0]?.PrevValue)}{' '}
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
                          Thoroughbreds
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('THOROUGHBREDS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {thoroughbredsData[0]?.CurrentValue &&
                              InsertCommas(thoroughbredsData[0]?.CurrentValue)}
                          </Typography>
                          {thoroughbredsData && percentageValue(thoroughbredsData[0]?.diffPercent)}
                        </Box>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Non-thoroughbreds
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('NONTHOROUGHBREDS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {nonThoroughbredsData[0]?.CurrentValue &&
                              InsertCommas(nonThoroughbredsData[0]?.CurrentValue)}
                          </Typography>
                          {nonThoroughbredsData &&
                            percentageValue(nonThoroughbredsData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {missingYoBCoBColourData[0]?.PrevValue &&
                            InsertCommas(nonThoroughbredsData[0]?.PrevValue)}{' '}
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
                          Ineligible
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('INELIGIBLE')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {inEligibleData[0]?.CurrentValue &&
                              InsertCommas(inEligibleData[0]?.CurrentValue)}
                          </Typography>
                          {inEligibleData && percentageValue(inEligibleData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {inEligibleData[0]?.PrevValue &&
                            InsertCommas(inEligibleData[0]?.PrevValue)}{' '}
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
                          Verified
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('VERIFIED')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {verifiedData[0]?.CurrentValue &&
                              InsertCommas(verifiedData[0]?.CurrentValue)}
                          </Typography>
                          {verifiedData && percentageValue(verifiedData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {verifiedData[0]?.PrevValue && InsertCommas(verifiedData[0]?.PrevValue)}{' '}
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
                          Runners
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('RUNNERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {runnersData[0]?.CurrentValue &&
                              InsertCommas(runnersData[0]?.CurrentValue)}
                          </Typography>
                          {runnersData && percentageValue(runnersData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {runnersData[0]?.PrevValue && InsertCommas(runnersData[0]?.PrevValue)}{' '}
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
                          Stakes Winners
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('STAKES_WINNERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {stakesWinnersData[0]?.CurrentValue &&
                              InsertCommas(stakesWinnersData[0]?.CurrentValue)}
                          </Typography>
                          {stakesWinnersData && percentageValue(stakesWinnersData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {stakesWinnersData[0]?.PrevValue &&
                            InsertCommas(stakesWinnersData[0]?.PrevValue)}{' '}
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
                          Winners
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('WINNERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {winnersData[0]?.CurrentValue &&
                              InsertCommas(winnersData[0]?.CurrentValue)}
                          </Typography>
                          {winnersData && percentageValue(winnersData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {winnersData[0]?.PrevValue && InsertCommas(winnersData[0]?.PrevValue)}{' '}
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
                          Countries (Runners)
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('COUNTRIES_RUNNERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {countriesRunnersData[0]?.CurrentValue &&
                              InsertCommas(countriesRunnersData[0]?.CurrentValue)}
                          </Typography>
                          {countriesRunnersData &&
                            percentageValue(countriesRunnersData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {countriesRunnersData[0]?.PrevValue &&
                            InsertCommas(countriesRunnersData[0]?.PrevValue)}{' '}
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
                          Races
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('RACES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {racesData[0]?.CurrentValue && InsertCommas(racesData[0]?.CurrentValue)}
                          </Typography>
                          {racesData && percentageValue(racesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {racesData[0]?.PrevValue && InsertCommas(racesData[0]?.PrevValue)}{' '}
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
                          Stakes Races
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('STAKES_RACES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {stakesRacesData[0]?.CurrentValue &&
                              InsertCommas(stakesRacesData[0]?.CurrentValue)}
                          </Typography>
                          {stakesRacesData && percentageValue(stakesRacesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {stakesRacesData[0]?.PrevValue &&
                            InsertCommas(stakesRacesData[0]?.PrevValue)}{' '}
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
                          Total Countries
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_COUNTRIES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {totalCountriesData[0]?.CurrentValue &&
                              InsertCommas(totalCountriesData[0]?.CurrentValue)}
                          </Typography>
                          {totalCountriesData &&
                            percentageValue(totalCountriesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalCountriesData[0]?.PrevValue &&
                            InsertCommas(totalCountriesData[0]?.PrevValue)}{' '}
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
                          Eligible Countries
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ELIGIBLECOUNTRIES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {inEligibleCountriesData[0]?.CurrentValue &&
                              InsertCommas(inEligibleCountriesData[0]?.CurrentValue)}
                          </Typography>
                          {inEligibleCountriesData &&
                            percentageValue(inEligibleCountriesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {inEligibleCountriesData[0]?.PrevValue &&
                            InsertCommas(inEligibleCountriesData[0]?.PrevValue)}{' '}
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
                          API Added
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('API_ADDED')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {apiAddedData[0]?.CurrentValue &&
                              InsertCommas(apiAddedData[0]?.CurrentValue)}
                          </Typography>
                          {apiAddedData && percentageValue(apiAddedData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {apiAddedData[0]?.PrevValue && InsertCommas(apiAddedData[0]?.PrevValue)}{' '}
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
                          User Requested
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('USER_REQUESTED')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {userRequestedData[0]?.CurrentValue &&
                              InsertCommas(userRequestedData[0]?.CurrentValue)}
                          </Typography>
                          {userRequestedData && percentageValue(userRequestedData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {userRequestedData[0]?.PrevValue &&
                            InsertCommas(userRequestedData[0]?.PrevValue)}{' '}
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
                          3rd Party Added
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('THIRD_PARTY_ADDED')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {thirdPartyAddedData[0]?.CurrentValue &&
                              InsertCommas(thirdPartyAddedData[0]?.CurrentValue)}
                          </Typography>
                          {thirdPartyAddedData &&
                            percentageValue(thirdPartyAddedData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {thirdPartyAddedData[0]?.PrevValue &&
                            InsertCommas(thirdPartyAddedData[0]?.PrevValue)}{' '}
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
                          Internally Added
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('INTERNALLY_ADDED')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#1D472E' }}>
                            {internallyAddedData[0]?.CurrentValue &&
                              InsertCommas(internallyAddedData[0]?.CurrentValue)}
                          </Typography>
                          {internallyAddedData &&
                            percentageValue(internallyAddedData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {internallyAddedData[0]?.CurrentValue &&
                            InsertCommas(internallyAddedData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
        {/* End of All KPI section and each section has four KPIs */}
      </>
    </StyledEngineProvider>
  );
}

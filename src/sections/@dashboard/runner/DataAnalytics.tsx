// @mu
import { Box, Typography, Grid, Stack, MenuItem, Button } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useEffect, useState } from 'react';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import React from 'react';
import { MenuProps } from 'src/constants/MenuProps';
import {
  dateConvert,
  getLastFromDate,
  currentDate,
  getOPtionText,
  InsertCommas,
  toPascalCase,
  percentageValue,
} from 'src/utils/customFunctions';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { Divider } from '@mui/material';
import {
  useRunnerDashboardQuery,
  useRunnerDashboardHorseColorQuery,
  useDownloadRunnerExcelFileQuery,
  useRunnerDashboardAccuracyRatingQuery,
} from 'src/redux/splitEndpoints/runnerDetailsSplit';
import { useCountriesQuery, useEligibleRaceCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import CsvLink from 'react-csv-export';
import DottedWorldRunnerMap from 'src/components/graph/DottedWorldRunnerMap';
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
import { Checkbox } from '@mui/material';
import { ListItemText } from '@mui/material';
import { Images } from 'src/assets/images';

export default function DataAnalytics(props: any) {
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
        height:'210px',
      },
    },
    variant: 'menu',
  };

  const dateFilterList = DashboardConstants.dateFilterList;
  const [dateDefaultSelected, setDateDefaultSelected] = useState('lastweek');
  const [dateOptionSelected, setDateOptionSelected] = useState('lastweek');
  const [countryList, setCountryList] = useState<any>([]);
  const [countryId, setCountryId] = useState<any>([]);
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [dateTo, setDateTo] = useState<any>(currentDate());
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  const [csvData, setCsvData] = useState<any>('');
  const [isCsvDownloadDownload, setIsCsvDownloadDownload] = useState(false);
  const [excelPayload, setExcelPayload] = useState<any>({});
  const [isSelected, setIsSelected] = useState<any>([]);
  // Get the current date
  const current_date = new Date();

  // Today
  const today_start = startOfDay(current_date);
  const today_end = endOfDay(current_date);
  // Handle Date option selection
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

  // Api call
  const { data: countriesList, isSuccess } = useEligibleRaceCountriesQuery();
  const {
    data: dashboardRealAPIData,
    isFetching: isDDFetching,
    isLoading: isDDLoading,
    isSuccess: isDDSuccess,
  } = useRunnerDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, countryId: countryId?.length ? countryId?.join() : 0 },
    { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true }
  );
  const {
    data: dashboardHCAPIData,
    isFetching: isHCFetching,
    isLoading: isHCLoading,
    isSuccess: isHCSuccess,
  } = useRunnerDashboardHorseColorQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, countryId: countryId?.length ? countryId?.join() : 0 },
    { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true }
  );

  const dashboardData = isDDSuccess
    ? dashboardRealAPIData
    : DashboardConstants.runnerDashboardStaticData;

  // Arrange data set from API
  const totalRunnerData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Runners'
  );
  const totalStakesRunnerData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Stakes Runners'
  );
  const totalStakesWinnersData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Stakes Winners'
  );
  const totalWinnersNonStakesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Winners NonStakes'
  );

  const bestSireData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Best Sire');
  const bestBroodmareSireData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Best Broodmare Sire'
  );
  const commonSWAncestorData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Common SW Ancestor (3Gen)'
  );
  const commonWnrAncestorData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Common Wnr Ancestor (3Gen)'
  );

  const bestSire_BroodmareSireCrossData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Best Sire/Broodmare Sire Cross'
  );
  const bestGrandSire_BroodmareSireCrossData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Best Grand Sire/Broodmare Sire Cross'
  );
  const best2xInbredAncestorData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Best 2x Inbred Ancestor (5 Gen)'
  );
  const best2PlusxInbredAncestorData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Best 3+x Inbred Ancestor (5 Gen)'
  );

  const commonWinnerColourData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Common Winner Colour'
  );
  const winnerSexDistributionData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Winners Sex Distribution'
  );
  const winnerSexDistributionSplitData = winnerSexDistributionData[0].CurrentName?.split('-');
  const winnerAverageAgeData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Winners Average Age'
  );

  const commonSWColourData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Common SW Colour'
  );
  const sWSexDistributionData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'SW Sex Distribution'
  );
  const sWSexDistributionSplitData = sWSexDistributionData[0].CurrentName?.split('-');
  const sWAverageAgeData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'SW Average Age'
  );


  useEffect(() => {
    if (isSuccess) {
      let idList = countriesList?.map((v: any) => v.id);
      setCountryList(idList);
      setCountryId(idList);
      // console.log(idList, 'idList');
    }
  }, [isSuccess])

  // Api call
  const {
    data: poorAccuracyRatingData,
    isFetching: isPoorAccuracyRatingFetching,
    isLoading: isPoorAccuracyRatingLoading,
    isSuccess: isPoorAccuracyRatingSuccess,
  } = useRunnerDashboardAccuracyRatingQuery(
    {
      fromDate: fromDateConverted,
      toDate: toDateConverted,
      countryId: countryId?.length ? countryId?.join() : 0,
      accuracyType: 'Poor',
    },
    { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true }
  );
  const {
    data: goodAccuracyRatingData,
    isFetching: isGoodAccuracyRatingFetching,
    isLoading: isGoodAccuracyRatingLoading,
    isSuccess: isGoodAccuracyRatingSuccess,
  } = useRunnerDashboardAccuracyRatingQuery(
    {
      fromDate: fromDateConverted,
      toDate: toDateConverted,
      countryId: countryId?.length ? countryId?.join() : 0,
      accuracyType: 'Good',
    },
    { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true }
  );
  const {
    data: excellentAccuracyRatingData,
    isFetching: isExcellentAccuracyRatingFetching,
    isLoading: isExcellentAccuracyRatingLoading,
    isSuccess: isExcellentAccuracyRatingSuccess,
  } = useRunnerDashboardAccuracyRatingQuery(
    {
      fromDate: fromDateConverted,
      toDate: toDateConverted,
      countryId: countryId?.length ? countryId?.join() : 0,
      accuracyType: 'Excellent',
    },
    { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true }
  );
  const {
    data: outstandingAccuracyRatingData,
    isFetching: isOutstandingAccuracyRatingFetching,
    isLoading: isOutstandingAccuracyRatingLoading,
    isSuccess: isOutstandingAccuracyRatingSuccess,
  } = useRunnerDashboardAccuracyRatingQuery(
    {
      fromDate: fromDateConverted,
      toDate: toDateConverted,
      countryId: countryId?.length ? countryId?.join() : 0,
      accuracyType: 'Outstanding',
    },
    { skip: (!isDashboardAPI), refetchOnMountOrArgChange: true }
  );

  // Set the CSV data in one object
  React.useEffect(() => {
    setCsvData([
      {
        'Total Runners': totalRunnerData[0].CurrentValue > 0 ? totalRunnerData[0].CurrentValue : 0,
        'Total Stakes Runners':
          totalStakesRunnerData[0].CurrentValue > 0 ? totalStakesRunnerData[0].CurrentValue : 0,
        'Total Stakes Winners':
          totalStakesWinnersData[0].CurrentValue > 0 ? totalStakesWinnersData[0].CurrentValue : 0,
        'Total Winners NonStakes':
          totalWinnersNonStakesData[0].CurrentValue > 0
            ? totalWinnersNonStakesData[0].CurrentValue
            : 0,
        'Best Sire': bestSireData[0].CurrentName !== '' ? bestSireData[0].CurrentName : '',
        'Best Broodmare Sire':
          bestBroodmareSireData[0].CurrentName !== '' ? bestBroodmareSireData[0].CurrentValue : '',
        'Common SW Ancestor (3Gen)':
          commonSWAncestorData[0].CurrentName !== '' ? commonSWAncestorData[0].CurrentValue : '',
        'Common Wnr Ancestor (3Gen)':
          commonWnrAncestorData[0].CurrentName !== '' ? commonWnrAncestorData[0].CurrentValue : '',
        'Best Sire/Broodmare Sire Cross':
          bestSire_BroodmareSireCrossData[0].CurrentName !== ''
            ? 'AUD' + bestSire_BroodmareSireCrossData[0].CurrentName
            : '',
        'Best Grand Sire/Broodmare Sire Cross':
          bestGrandSire_BroodmareSireCrossData[0].CurrentName !== ''
            ? bestGrandSire_BroodmareSireCrossData[0].CurrentName
            : '',
        'Best 2x Inbred Ancestor (5 Gen)':
          best2xInbredAncestorData[0].CurrentName !== ''
            ? best2xInbredAncestorData[0].CurrentName
            : '',
        'Best 3+x Inbred Ancestor (5 Gen)':
          best2PlusxInbredAncestorData[0].CurrentName !== ''
            ? best2PlusxInbredAncestorData[0].CurrentName
            : '',
        'Common Winner Colour':
          commonWinnerColourData[0].CurrentName !== '' ? commonWinnerColourData[0].CurrentName : '',
        'Winners Sex Distribution':
          winnerSexDistributionData[0].CurrentName !== ''
            ? winnerSexDistributionData[0].CurrentName
            : '',
        'Winners Average Age':
          winnerAverageAgeData[0].CurrentValue > 0 ? winnerAverageAgeData[0].CurrentValue : 0,
        'Common SW Colour':
          commonSWColourData[0].CurrentValue > 0 ? commonSWColourData[0].CurrentValue : 0,
        'SW Sex Distribution':
          sWSexDistributionData[0].CurrentValue > 0
            ? 'AUD' + sWSexDistributionData[0].CurrentValue
            : '',
        'SW Average Age':
          sWAverageAgeData[0].CurrentName !== '' ? sWAverageAgeData[0].CurrentName : '',
        'Accuracy Rating - Poor':
          poorAccuracyRatingData?.CurrentValue > 0 ? poorAccuracyRatingData?.CurrentValue : 0,
        'Accuracy Rating - Good':
          goodAccuracyRatingData?.CurrentValue > 0 ? goodAccuracyRatingData?.CurrentValue : 0,
        'Accuracy Rating - Excellent':
          excellentAccuracyRatingData?.CurrentValue > 0
            ? excellentAccuracyRatingData?.CurrentValue
            : 0,
        'Accuracy Rating - Outstanding':
          outstandingAccuracyRatingData?.CurrentValue > 0
            ? outstandingAccuracyRatingData?.CurrentValue
            : 0,
      },
    ]);
  }, [isDDSuccess, dashboardData]);

  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
    isError: isCsvDownloadError,
  } = useDownloadRunnerExcelFileQuery(
    { setupId: excelPayload, name: 'runner' },
    { skip: !isCsvDownloadDownload, refetchOnMountOrArgChange: true }
  );

  // Download each tile by kpitype in csv format
  const downloadIndivisualKPI = (kpiType: any) => {
    setExcelPayload({
      kpiTitle: kpiType,
      fromDate: fromDateConverted,
      toDate: toDateConverted,
      countryId: countryId?.length ? countryId?.join() : 0,
    });
    setIsCsvDownloadDownload(true);
  };

  // On success reset the state
  React.useEffect(() => {
    if (isCsvDownloadFetching === false && isCsvDownloadSuccess === true) {
      setIsCsvDownloadDownload(false);
    }
  }, [isCsvDownloadFetching]);

  // On error show the toast message
  React.useEffect(() => {
    if (isCsvDownloadError) {
      props.setApiStatusMsg({ status: 422, message: 'Data not found for the given date range!' });
      props.setApiStatus(true);
    }
  }, [isCsvDownloadError]);

  const listOfCountryId = countriesList?.map((v: any) => v.id) || [];

  const isAllSelected = listOfCountryId?.length > 0 && countryList?.length === countriesList?.length;

  const handleCountryChange = (e: any) => {
    let value = e.target.value;
    if (value.includes("all")) {

      setCountryList((isSelected && isSelected?.length) === (countriesList && countriesList?.length) ? [] : listOfCountryId);
      setCountryId((isSelected && isSelected?.length) === (countriesList && countriesList?.length) ? [] : listOfCountryId);
      return;
    }
    setCountryList(value);
    setCountryId(value);
    if (isSelected?.length == 0 && isAllSelected) {
      setCountryList([]);
      setCountryId([]);
    }

  }

  return (
    <>
      <Box>
        <Stack direction="row" className="MainTitleHeader">
          <Grid container mt={2} mb={1}>
            <Grid item lg={6} sm={6} className="MainTitleHeadLeft">
              <Typography variant="h4" className="MainTitle">
                Runner Dashboard
              </Typography>
            </Grid>
            {/* Runners data analytics filter */}
            <Grid item lg={6} sm={6} className="MainTitleHeadRight">
              <Stack
                direction="row"
                sx={{ justifyContent: { lg: 'right', sm: 'right', xs: 'left' }, display: 'flex' }}
              >
                <Box className="Share">
                  <CsvLink
                    data={csvData}
                    fileName={`Runner_Data (${dateDefaultSelected})`}
                    withTimeStamp
                  >
                    <Button type="button" className="ShareBtn">
                      <i className="icon-Share"></i>
                    </Button>
                  </CsvLink>
                </Box>
                <Box className="edit-field viewSelectCountry">
                  {/* <Select
                    MenuProps={{
                      disablePortal: true,
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                      ...MenuPropss,
                    }}
                    value={countryList.length === 0 ? [11] : countryList}
                    displayEmpty
                    renderValue={
                      countryList.length !== 0
                        ? undefined
                        : () => (
                            <Placeholder>
                              <em>Race Country</em>
                            </Placeholder>
                          )
                    }
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    onChange={(e) => {
                      setCountryList(e.target.value);
                      setCountryId(e.target.value);
                    }}
                    name="countryId"
                    defaultValue="none"
                    className="countryDropdown filter-slct"
                  >
                    {countriesList?.map(({ id, countryName }) => {
                      return (
                        <MenuItem
                          className="selectDropDownList countryDropdownList"
                          value={id}
                          key={id}
                        >
                          {countryName}
                        </MenuItem>
                      );
                    })}
                  </Select> */}
                  <Select
                    MenuProps={MenuPropss}
                    IconComponent={KeyboardArrowDownRoundedIcon}
                    // {...register("eligibleRaceCountries")}
                    name="eligibleRaceCountries"
                    multiple
                    displayEmpty
                    renderValue={(selected: any) => {
                      setIsSelected(selected)
                      if (selected?.length === 0) {
                        return <em>Select Countries</em>;
                      }
                      return <em>View Selected Countries</em>;

                    }}
                    //onChange={(e) => { setCountryList(e.target.value); setCountryId(e.target.value) }}
                    onChange={handleCountryChange}
                    defaultValue={countryList}
                    value={countryList}
                    className='filter-slct'>
                    <MenuItem className="selectDropDownList reportSelectCountry" value="''" disabled><em>Select Countries</em></MenuItem>
                    <MenuItem value='all' className="selectDropDownList reportSelectCountry viewSelectCountry settingDropDown">
                      <ListItemText primary={"Select All"} />
                      <Checkbox
                        checkedIcon={<img src={Images.checked} />}
                        icon={<img src={Images.unchecked} />}
                        checked={isAllSelected}
                        disableRipple
                      />
                    </MenuItem>
                    {countriesList?.map((v: any, i: number) => {
                      return (
                        <MenuItem className="selectDropDownList reportSelectCountry viewSelectCountry settingDropDown" key={v.id} value={v.id}>
                          {/* {(v.countryName)} */}
                          <ListItemText primary={v.countryName} />
                          <Checkbox
                            checkedIcon={<img src={Images.checked} alt="checkbox" />} icon={<img src={Images.unchecked} alt="checkbox" />}
                            checked={countryList?.indexOf(v.id) > -1}
                            disableRipple
                          />
                        </MenuItem>
                      )
                    })}
                  </Select>
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
            {/* End Runners data analytics filter */}
          </Grid>
        </Stack>
        {/* Runners Stats */}
        {!isDashboardAPI ? (
          <Box className="Spinner-Wrp">
            <Spinner />
          </Box>
        ) : (
          <>
            <Box mt={1} className="FarmDataDashboardBody">
              <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Total Runners
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_RUNNERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalRunnerData[0]?.CurrentValue &&
                              InsertCommas(totalRunnerData[0]?.CurrentValue)}
                          </Typography>
                          {totalRunnerData && percentageValue(totalRunnerData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalRunnerData[0]?.PrevValue &&
                            InsertCommas(totalRunnerData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Total Stakes Runners
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_STAKE_RUNNERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalStakesRunnerData[0]?.CurrentValue &&
                              InsertCommas(totalStakesRunnerData[0]?.CurrentValue)}
                          </Typography>
                          {totalStakesRunnerData &&
                            percentageValue(totalStakesRunnerData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalStakesRunnerData[0]?.PrevValue &&
                            InsertCommas(totalStakesRunnerData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Total Stakes Winners
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_STAKE_WINNERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalStakesWinnersData[0]?.CurrentValue &&
                              InsertCommas(totalStakesWinnersData[0]?.CurrentValue)}
                          </Typography>
                          {totalStakesWinnersData &&
                            percentageValue(totalStakesWinnersData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalStakesWinnersData[0]?.PrevValue &&
                            InsertCommas(totalStakesWinnersData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Total Winners (Non-stakes)
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_NON_STAKE_WINNERS')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalWinnersNonStakesData[0].CurrentValue}
                          </Typography>
                          {totalWinnersNonStakesData &&
                            percentageValue(totalWinnersNonStakesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to {totalWinnersNonStakesData[0].PrevValue} {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
              </Grid>
            </Box>
            {/* End Runners Stats */}

            {/* World map */}
            <Box mt={2} className="WorldReachWrapper">
              <Box className="WorldReachBox" sx={{ background: '#ffffff', height: '580px' }}>
                <Typography variant="h5">World Reach</Typography>
                <Box className="WorldReachBoxBody">
                  <DottedWorldRunnerMap
                    fromDate={fromDateConverted}
                    toDate={toDateConverted}
                    totalRunners={totalRunnerData[0]?.CurrentValue}
                    countryId={countryId}
                  />
                </Box>
              </Box>
            </Box>
            {/* End World map */}

            {/* Runners Stats */}
            <Box mt={2} className="FarmDataDashboardBody">
              <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Best Sire
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('BEST_SIRE')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {bestSireData[0].CurrentName ? toPascalCase(bestSireData[0].CurrentName) : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {bestSireData[0].PrevName === '' ? 'N/A' : bestSireData[0].PrevName}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Best Broodmare Sire
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('BEST_BROODMARE_SIRE')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {bestBroodmareSireData[0].CurrentName ? toPascalCase(bestBroodmareSireData[0].CurrentName) : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {bestBroodmareSireData[0].PrevName === ''
                            ? 'N/A'
                            : bestBroodmareSireData[0].PrevName}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Common SW Ancestor (3 Gen)
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('COMMON_SW_ANCESTOR')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {commonSWAncestorData[0].CurrentName ? toPascalCase(commonSWAncestorData[0].CurrentName) : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {commonSWAncestorData[0].PrevName === ''
                            ? 'N/A'
                            : commonSWAncestorData[0].PrevName}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Common Wnr Ancestor (3 Gen)
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('COMMON_WNR_ANCESTOR')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {commonWnrAncestorData[0].CurrentName ? toPascalCase(commonWnrAncestorData[0].CurrentName) : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {commonWnrAncestorData[0].PrevName === ''
                            ? 'N/A'
                            : commonWnrAncestorData[0].PrevName}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Best Sire/Broodmare Sire Cross
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('BEST_SIRE_BROODMARE_SIRE')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {toPascalCase(bestSire_BroodmareSireCrossData[0].CurrentName)}
                          </Typography>
                        </Box>
                        {/* <Typography component='span'>Previously {bestSire_BroodmareSireCrossData[0].PrevName === "" ? "N/A" : bestSire_BroodmareSireCrossData[0].PrevName}</Typography> */}
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Best Grand Sire /<br />
                          Broodmare Sire Cross
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('BEST_GRAND_SIRE_BROODMARE_SIRE')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {toPascalCase(bestGrandSire_BroodmareSireCrossData[0].CurrentName)}
                          </Typography>
                        </Box>
                        {/* <Typography component='span'>Previously {bestGrandSire_BroodmareSireCrossData[0].PrevName === "" ? "N/A" : bestGrandSire_BroodmareSireCrossData[0].PrevName}</Typography> */}
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Best 2x Inbred Ancestor (5 Gen)
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('BEST_2X_INBRED_ANCESTOR')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {best2xInbredAncestorData[0].CurrentName ? toPascalCase(best2xInbredAncestorData[0].CurrentName) : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {best2xInbredAncestorData[0].PrevName === ''
                            ? 'N/A'
                            : best2xInbredAncestorData[0].PrevName}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Best 3+x Inbred Ancestor (5 Gen)
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('BEST_3XPLUS_INBRED_ANCESTOR')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {best2PlusxInbredAncestorData[0].CurrentName ? toPascalCase(best2PlusxInbredAncestorData[0].CurrentName) : '-'}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {best2PlusxInbredAncestorData[0].PrevName === ''
                            ? 'N/A'
                            : best2PlusxInbredAncestorData[0].PrevName}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>

                <Grid
                  container
                  spacing={2}
                  rowSpacing={1}
                  xs={12}
                  md={12}
                  className="runner-data-extra-block"
                >
                  <Grid
                    item
                    xs={12}
                    md={3}
                    className="topPrizemoneyBox runner-data-extra-block-left"
                  >
                    <Box className="DB-farms">
                      <Box mb={3} className="DB-farms-header">
                        <Typography variant="h3">Most Common Horse Colours (Rnrs)</Typography>
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('MOST_COMMON_COLOURS_RNRS')}
                        ></i>
                      </Box>
                      {isHCFetching && (
                        <Box className="dashboard-loader">
                          <CircularSpinner />
                        </Box>
                      )}
                      {dashboardHCAPIData?.map((row: any, index: number) => (
                        <>
                          <Stack direction="row" mt={2} mb={1} className="DB-farms-item">
                            <Box flexGrow={1}>
                              <Typography variant="h4">{row?.colour}</Typography>
                              <Typography variant="h5">
                                From {toPascalCase(row?.countries)} different countries
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h4" sx={{ textAlign: 'right' }}>
                                <b>{row?.runners && InsertCommas(row?.runners)}</b>
                              </Typography>
                            </Box>
                          </Stack>
                          <Divider />
                        </>
                      ))}
                      {(isHCFetching === false && dashboardHCAPIData?.length === 0) && <Box className='noDataFound'>No data found</Box>}
                    </Box>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    rowSpacing={1}
                    xs={12}
                    md={9}
                    className="runner-data-extra-block-right"
                  >
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Common SW Colour
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('COMMON_SW_COLOUR')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {commonSWColourData[0].CurrentName ? toPascalCase(commonSWColourData[0].CurrentName) : '-'}
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {commonSWColourData[0].PrevName === ''
                                ? 'N/A'
                                : commonSWColourData[0].PrevName}
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
                              SW Sex Distribution
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('SW_SEX_DISTRIBUTION')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                <b style={{ color: '#8BBAF0' }}>{sWSexDistributionSplitData[0]}</b>-
                                <b style={{ color: '#ed8ac5' }}>{sWSexDistributionSplitData[1]}</b>
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {sWSexDistributionData[0].PrevName === ''
                                ? 'N/A'
                                : sWSexDistributionData[0].PrevName}
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
                              SW Average Age
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('SW_AVG_AGE')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {toPascalCase(sWAverageAgeData[0].CurrentName)}
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {sWAverageAgeData[0].PrevName === ''
                                ? 'N/A'
                                : sWAverageAgeData[0].PrevName}
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
                              Common Winner Colour
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('COMMON_WINNER_COLOUR')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {commonWinnerColourData[0].CurrentName ? toPascalCase(commonWinnerColourData[0].CurrentName) : '-'}
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {commonWinnerColourData[0].PrevName === ''
                                ? 'N/A'
                                : commonWinnerColourData[0].PrevName}
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
                              Winners Sex Distribution
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('WINNER_SEX_DISTRIBUTION')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                <b style={{ color: '#8BBAF0' }}>
                                  {winnerSexDistributionSplitData[0]}
                                </b>
                                -
                                <b style={{ color: '#ed8ac5' }}>
                                  {winnerSexDistributionSplitData[1]}
                                </b>
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {winnerSexDistributionData[0].PrevName === ''
                                ? 'N/A'
                                : winnerSexDistributionData[0].PrevName}
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
                              Winners Average Age
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('WINNER_AVG_AGE')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {toPascalCase(winnerAverageAgeData[0].CurrentName)}
                              </Typography>
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {winnerAverageAgeData[0].PrevName === ''
                                ? 'N/A'
                                : winnerAverageAgeData[0].PrevName}
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} md={3} sx={{ paddingTop: '8px !important' }}>
                  <Stack direction="row" className="HDB-blocks">
                    {isPoorAccuracyRatingFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Accuracy Rating - Poor
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ACCURACY_RATING_POOR')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {poorAccuracyRatingData?.CurrentValue === null
                              ? 0
                              : InsertCommas(poorAccuracyRatingData?.CurrentValue)}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {poorAccuracyRatingData?.PrevValue === null
                            ? 0
                            : InsertCommas(poorAccuracyRatingData?.PrevValue)}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3} sx={{ paddingTop: '8px !important' }}>
                  <Stack direction="row" className="HDB-blocks">
                    {isGoodAccuracyRatingFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Accuracy Rating - Good
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ACCURACY_RATING_GOOD')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {goodAccuracyRatingData?.CurrentValue === null
                              ? 0
                              : InsertCommas(goodAccuracyRatingData?.CurrentValue)}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {goodAccuracyRatingData?.PrevValue === null
                            ? 0
                            : InsertCommas(goodAccuracyRatingData?.PrevValue)}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3} sx={{ paddingTop: '8px !important' }}>
                  <Stack direction="row" className="HDB-blocks">
                    {isExcellentAccuracyRatingFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Accuracy Rating - Excellent
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ACCURACY_RATING_EXCELLENT')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {excellentAccuracyRatingData?.CurrentValue === null
                              ? 0
                              : InsertCommas(excellentAccuracyRatingData?.CurrentValue)}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {excellentAccuracyRatingData?.PrevValue === null
                            ? 0
                            : InsertCommas(excellentAccuracyRatingData?.PrevValue)}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
                <Grid item xs={12} md={3} sx={{ paddingTop: '8px !important' }}>
                  <Stack direction="row" className="HDB-blocks">
                    {isOutstandingAccuracyRatingFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Accuracy Rating - Outstanding
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('ACCURACY_RATING_OUTSTANDING')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {outstandingAccuracyRatingData?.CurrentValue === null
                              ? 0
                              : InsertCommas(outstandingAccuracyRatingData?.CurrentValue)}
                          </Typography>
                        </Box>
                        <Typography component="span">
                          Previously{' '}
                          {outstandingAccuracyRatingData?.PrevValue === null
                            ? 0
                            : InsertCommas(outstandingAccuracyRatingData?.PrevValue)}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
              </Grid>
            </Box>
            {/* End Runners Stats */}
          </>
        )}
      </Box>
    </>
  );
}

const Placeholder = ({ children }: any) => {
  // const classes = usePlaceholderStyles();
  return <div>{children}</div>;
};

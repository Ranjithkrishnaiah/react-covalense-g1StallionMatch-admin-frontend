// @mui
import {
  Box,
  Typography,
  Grid,
  Stack,
  MenuItem,
  Button,
  Autocomplete,
  Checkbox,
  TextField,
  ListItemText,
} from '@mui/material';
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
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import DottedWorldRaceMap from 'src/components/graph/DottedWorldRaceMap';
import { Divider } from '@mui/material';
import RaceLineChart from 'src/components/graph/RaceLineChart';
import {
  useRaceDashboardQuery,
  useRaceDashboardMostValuedRacesQuery,
  useRaceDashboardTopPrizeMoneyQuery,
  useRaceDashboardAvgDistanceQuery,
} from 'src/redux/splitEndpoints/raceSplit';
import { useCountriesQuery, useEligibleRaceCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useDownloadRaceExcelFileQuery } from 'src/redux/splitEndpoints/raceSplit';
import CsvLink from 'react-csv-export';
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
import { Images } from 'src/assets/images';

export default function DataAnalytics(props: any) {
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
        height: "210px",
      },
    },
    variant: 'menu',
  };

  // Api calls
  const { data: countriesList, isFetching, isSuccess } = useEligibleRaceCountriesQuery();

  const {
    data: dashboardRealAPIData,
    isFetching: isDDFetching,
    isLoading: isDDLoading,
    isSuccess: isDDSuccess,
  } = useRaceDashboardQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, countryId: countryId?.length ? countryId?.join() : 0 },
    { skip: (!isDashboardAPI ),refetchOnMountOrArgChange: true }
  );
  const {
    data: dashboardMVRAPIData,
    isFetching: isMVRFetching,
    isLoading: isMVRLoading,
    isSuccess: isMVRSuccess,
  } = useRaceDashboardMostValuedRacesQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, countryId: countryId?.length ? countryId?.join() : 0 },
    { skip: (!isDashboardAPI ),refetchOnMountOrArgChange: true }
  );
  const {
    data: dashboardTPMAPIData,
    isFetching: isTPMFetching,
    isLoading: isTPMLoading,
    isSuccess: isTPMSuccess,
  } = useRaceDashboardTopPrizeMoneyQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, countryId: countryId?.length ? countryId?.join() : 0 },
    { skip: (!isDashboardAPI ),refetchOnMountOrArgChange: true }
  );
  const {
    data: dashboardAvgDistanceAPIData,
    isFetching: isAvgDistanceFetching,
    isLoading: isAvgDistanceLoading,
    isSuccess: isAvgDistanceSuccess,
  } = useRaceDashboardAvgDistanceQuery(
    { fromDate: fromDateConverted, toDate: toDateConverted, countryId: countryId?.length ? countryId?.join() : 0 },
    { skip: (!isDashboardAPI ),refetchOnMountOrArgChange: true }
  );
  const dashboardAvgDistanceData = isAvgDistanceSuccess
    ? dashboardAvgDistanceAPIData
    : DashboardConstants.raceAvgDistanceStaticData;

  // Arrange data set from API
  const dashboardData = isDDSuccess
    ? dashboardRealAPIData
    : DashboardConstants.raceDashboardStaticData;
  const totalRaceData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Total Races');
  const totalStakesRacesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Stakes Races'
  );
  const countriesData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Countries');
  const countryBlacklistData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Country Black list'
  );
  const totalTurfRacesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Turf Races'
  );
  const totalDirtRacesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Dirt Races'
  );
  const totalSyntheticRacesData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Synthetic Races'
  );
  const totalUnknownTrackTypeData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Total Unknown TrackType'
  );
  const totalPrizemoneyData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Average Prize Money'
  );
  const mostRacesData: any = dashboardData?.filter((data: any) => data?.kpiBlock === 'Most Races');
  const mostCommonTrackConditionData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most Common Track Condition'
  );
  const mostPopularJockeyData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most Popular Jockey'
  );
  const mostSuccessfulJockeyData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most Successful Jockey'
  );
  const mostSuccessfulTrainerData: any = dashboardData?.filter(
    (data: any) => data?.kpiBlock === 'Most Successful Trainer'
  );

  useEffect(() => {
    if (isSuccess) {
      let idList = countriesList?.map((v: any) => v.id);
      setCountryList(idList);
      setCountryId(idList);
      //console.log(idList, 'idList');
    }
  }, [isFetching])
  // console.log(countryList,countryId, 'idList');

  // Set the CSV data in one object
  React.useEffect(() => {
    setCsvData([
      {
        'Total Races': totalRaceData[0].CurrentValue > 0 ? totalRaceData[0].CurrentValue : 0,
        'Total Stakes Races':
          totalStakesRacesData[0].CurrentValue > 0 ? totalStakesRacesData[0].CurrentValue : 0,
        Countries: countriesData[0].CurrentValue > 0 ? countriesData[0].CurrentValue : 0,
        'Country Blacklist':
          countryBlacklistData[0].CurrentValue > 0 ? countryBlacklistData[0].CurrentValue : 0,
        'Total Turf Races':
          totalTurfRacesData[0].CurrentValue > 0 ? totalTurfRacesData[0].CurrentValue : 0,
        'Total Dirt Races':
          totalDirtRacesData[0].CurrentValue > 0 ? totalDirtRacesData[0].CurrentValue : 0,
        'Total Synthetic Races':
          totalSyntheticRacesData[0].CurrentValue > 0 ? totalSyntheticRacesData[0].CurrentValue : 0,
        'Total Unknown TrackType':
          totalUnknownTrackTypeData[0].CurrentValue > 0
            ? totalUnknownTrackTypeData[0].CurrentValue
            : 0,
        'Average Prize Money':
          totalPrizemoneyData[0].CurrentValue > 0
            ? 'AUD' + totalPrizemoneyData[0].CurrentValue
            : '',
        'Most Races': mostRacesData[0].CurrentName !== '' ? mostRacesData[0].CurrentName : '',
        'Most Common Track Condition':
          mostCommonTrackConditionData[0].CurrentName !== ''
            ? mostCommonTrackConditionData[0].CurrentName
            : '',
        'Most Popular Jockey':
          mostPopularJockeyData[0].CurrentName !== '' ? mostPopularJockeyData[0].CurrentName : '',
        'Most Successful Jockey':
          mostSuccessfulJockeyData[0].CurrentName !== ''
            ? mostSuccessfulJockeyData[0].CurrentName
            : '',
        'Most Successful Trainer':
          mostSuccessfulTrainerData[0].CurrentName !== ''
            ? mostSuccessfulTrainerData[0].CurrentName
            : '',
      },
    ]);
  }, [isDDSuccess, dashboardData]);

  const {
    data: csvDownloadData,
    isFetching: isCsvDownloadFetching,
    isLoading: isCsvDownloadLoading,
    isSuccess: isCsvDownloadSuccess,
    isError: isCsvDownloadError,
  } = useDownloadRaceExcelFileQuery(
    { setupId: excelPayload, name: 'race' },
    { skip: !isCsvDownloadDownload , refetchOnMountOrArgChange: true}
  );

  // Download each tile by kpitype in csv format
  const downloadIndivisualKPI = (kpiType: any) => {
    setExcelPayload({
      kpiTitle: kpiType,
      fromDate: fromDateConverted,
      toDate: toDateConverted,
      countryId: countryId?.join(),
    });
    setIsCsvDownloadDownload(true);
  };

  // Set download CSV state
  React.useEffect(() => {
    setIsCsvDownloadDownload(false);
  }, [isCsvDownloadSuccess]);

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
    // console.log("value", value);
    // console.log("value isAllSelected", isAllSelected);


    if (value.includes("all")) {
      // (isSelected && isSelected?.length) === (countriesList && countriesList?.length) ? [] : listOfCountryId
      // console.log("select clicked", value.includes("all"));

      setCountryList((isSelected && isSelected?.length) === (countriesList && countriesList?.length) ? [] : listOfCountryId);
      // console.log("setCountryList",value);

      setCountryId((isSelected && isSelected?.length) === (countriesList && countriesList?.length) ? [] : listOfCountryId);
      // console.log("setCountryId",value);
      return;
    }
    setCountryList(value);
    // console.log("setCountryList 12", value);
    setCountryId(value);
    // console.log("setCountryList 34", value);
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
                Race Dashboard
              </Typography>
            </Grid>
            {/* Race data analytics filter */}
            <Grid item lg={6} sm={6} className="MainTitleHeadRight">
              <Stack
                direction="row"
                sx={{ justifyContent: { lg: 'right', sm: 'right', xs: 'left' }, display: 'flex' }}
              >
                <Box className="Share">
                  <CsvLink
                    data={csvData}
                    fileName={`Race_Data (${dateDefaultSelected})`}
                    withTimeStamp
                  >
                    <Button type="button" className="ShareBtn">
                      <i className="icon-Share"></i>
                    </Button>
                  </CsvLink>
                </Box>
                <Box className="edit-field">
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
                      // console.log(selected, 'selected')
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
                            checkedIcon={<img src={Images.checked} />}
                            icon={<img src={Images.unchecked} />}
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
            {/* End Race data analytics filter */}
          </Grid>
        </Stack>
        {/* Races Stats */}
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
                          Total Races{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_RACES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalRaceData[0]?.CurrentValue &&
                              InsertCommas(totalRaceData[0]?.CurrentValue)}
                          </Typography>
                          {totalRaceData && percentageValue(totalRaceData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalRaceData[0]?.PrevValue && InsertCommas(totalRaceData[0]?.PrevValue)}{' '}
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
                          Total Stakes Races{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_STAKE_RACES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalStakesRacesData[0]?.CurrentValue &&
                              InsertCommas(totalStakesRacesData[0]?.CurrentValue)}
                          </Typography>
                          {totalStakesRacesData &&
                            percentageValue(totalStakesRacesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalStakesRacesData[0]?.PrevValue &&
                            InsertCommas(totalStakesRacesData[0]?.PrevValue)}{' '}
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
                          Countries{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('COUNTRIES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {countriesData[0]?.CurrentValue &&
                              InsertCommas(countriesData[0]?.CurrentValue)}
                          </Typography>
                          {countriesData && percentageValue(countriesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {countriesData[0]?.PrevValue && InsertCommas(countriesData[0]?.PrevValue)}{' '}
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
                          Country Blacklist{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('COUNTRY_BLACKLIST')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {countryBlacklistData[0]?.CurrentValue &&
                              InsertCommas(countryBlacklistData[0]?.CurrentValue)}
                          </Typography>
                          {countryBlacklistData &&
                            percentageValue(countryBlacklistData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {countryBlacklistData[0]?.PrevValue &&
                            InsertCommas(countryBlacklistData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>
              </Grid>
            </Box>
            {/* End Races Stats */}

            {/* World map */}
            <Box mt={2} className="WorldReachWrapper">
              <Box className="WorldReachBox" sx={{ background: '#ffffff', height: '580px' }}>
                <Typography variant="h5">World Reach</Typography>
                <Box className="WorldReachBoxBody">
                  <DottedWorldRaceMap
                    fromDate={fromDateConverted}
                    toDate={toDateConverted}
                    totalRaces={totalRaceData[0]?.CurrentValue}
                    countryId={countryId}
                  />
                </Box>
              </Box>
            </Box>
            {/* End World map */}

            {/* Races Stats */}
            <Box mt={2} className="FarmDataDashboardBody">
              <Grid container spacing={2} rowSpacing={2} className="FarmDataDashboarGrid">
                <Grid item xs={12} md={3}>
                  <Stack direction="row" className="HDB-blocks">
                    {isDDFetching ? <CircularSpinner /> :
                      <Box>
                        <Typography variant="body2" className="HBD-subheadings">
                          Total Turf Races{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_TURF_RACES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalTurfRacesData[0]?.CurrentValue &&
                              InsertCommas(totalTurfRacesData[0]?.CurrentValue)}
                          </Typography>
                          {totalTurfRacesData && percentageValue(totalTurfRacesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalTurfRacesData[0]?.PrevValue &&
                            InsertCommas(totalTurfRacesData[0]?.PrevValue)}{' '}
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
                          Total Dirt Races{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_DIRT_RACES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalDirtRacesData[0]?.CurrentValue &&
                              InsertCommas(totalDirtRacesData[0]?.CurrentValue)}
                          </Typography>
                          {totalDirtRacesData && percentageValue(totalDirtRacesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalDirtRacesData[0]?.PrevValue &&
                            InsertCommas(totalDirtRacesData[0]?.PrevValue)}{' '}
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
                          Total Synthetic Races{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_SYNTHETIC_RACES')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalSyntheticRacesData[0]?.CurrentValue &&
                              InsertCommas(totalSyntheticRacesData[0]?.CurrentValue)}
                          </Typography>
                          {totalSyntheticRacesData &&
                            percentageValue(totalSyntheticRacesData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalSyntheticRacesData[0]?.PrevValue &&
                            InsertCommas(totalSyntheticRacesData[0]?.PrevValue)}{' '}
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
                          Total Unknown Track Type{' '}
                          <i
                            className="icon-Download"
                            onClick={() => downloadIndivisualKPI('TOTAL_UNKNOWN_TRACK_TYPE')}
                          ></i>
                        </Typography>
                        <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                          <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                            {totalUnknownTrackTypeData[0]?.CurrentValue &&
                              InsertCommas(totalUnknownTrackTypeData[0]?.CurrentValue)}
                          </Typography>
                          {totalUnknownTrackTypeData &&
                            percentageValue(totalUnknownTrackTypeData[0]?.diffPercent)}
                        </Box>
                        <Typography component="span">
                          Compared to{' '}
                          {totalUnknownTrackTypeData[0]?.PrevValue &&
                            InsertCommas(totalUnknownTrackTypeData[0]?.PrevValue)}{' '}
                          {dateOptionSelected}
                        </Typography>
                      </Box>
                    }
                  </Stack>
                </Grid>

                <Grid item xs={12} md={9}>
                  <Box
                    className="average-distance WorldReachBox lineChartBox"
                    sx={{ background: '#ffffff', height: '370px' }}
                  >
                    <Stack className="linechart-header">
                      <Stack className="linechart-header-left">
                        <Typography variant="h5">Average Distance</Typography>
                        <Typography variant="h6" className="valuelinechart">
                          {dashboardAvgDistanceData?.rangeFrom} -{' '}
                          {dashboardAvgDistanceData?.rangeTo}
                        </Typography>
                      </Stack>
                      <Stack className="LCvalues">
                        <Stack className="LCvalueslist">
                          <Stack className="LCvaluesbox">
                            <span className="circle green"></span>
                            <Typography variant="h6">{dateOptionSelected}</Typography>
                          </Stack>
                          <Typography variant="h5">
                            {dashboardAvgDistanceData?.currentTotal &&
                              InsertCommas(dashboardAvgDistanceData?.currentTotal)}
                          </Typography>
                        </Stack>
                        <Stack className="LCvalueslist">
                          <Stack className="LCvaluesbox">
                            <span className="circle mintgreen"></span>
                            <Typography variant="h6">Previous</Typography>
                          </Stack>
                          <Typography variant="h5">
                            {dashboardAvgDistanceData?.previousTotal &&
                              InsertCommas(dashboardAvgDistanceData?.previousTotal)}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>

                    <Box className="WorldReachBoxBody">
                      {isAvgDistanceFetching ? (
                        <CircularSpinner />
                      ) : (
                        <RaceLineChart
                          dateOptionSelected={dateOptionSelected}
                          chartData={dashboardAvgDistanceData?.result}
                        />
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={3} className="topPrizemoneyBox">
                  <Box className="DB-farms message-DB-farms">
                    <Box mb={3} className="DB-farms-header">
                      <Typography variant="h3">Most Valuable Races</Typography>
                      <i
                        className="icon-Download"
                        onClick={() => downloadIndivisualKPI('MOST_VALUABLE_RACES')}
                      ></i>
                    </Box>
                    {isMVRFetching ? (
                      <Box className="dashboard-loader">
                        <CircularSpinner />
                      </Box>
                    ) :
                      <>
                        {dashboardMVRAPIData?.map((row: any, index: number) => (
                          <>
                            <Stack direction="row" mt={2} mb={1} className="DB-farms-item">
                              <Box flexGrow={1}>
                                <Typography variant="h4">
                                  {row?.Race}, {row?.StakeCategory}
                                </Typography>
                                <Typography variant="h5">
                                  {row?.Venue}, {row?.Country}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography
                                  variant="h4"
                                  sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                >
                                  <b>
                                    {row?.ActualCurrenyCode}{' '}
                                    {row.ActualPrizeMoney === null
                                      ? 0
                                      : intToString(row?.ActualPrizeMoney)}
                                  </b>
                                </Typography>
                              </Box>
                            </Stack>
                            <Divider />
                          </>
                        ))}
                      </>
                    }
                    {(isMVRFetching === false && dashboardMVRAPIData?.length == 0) && <Box className='noDataFound'>No data found</Box>}
                  </Box>
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
                              Average Prizemoney
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('AVG_PRIZEMONEY')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                AUD{' '}
                                {totalPrizemoneyData[0].CurrentValue === null
                                  ? 0
                                  : totalPrizemoneyData[0].CurrentValue.toLocaleString()}
                              </Typography>
                              {/* <Typography variant='body2' className='HDB-block-count red' sx={{display: 'flex', color: '#C75227'}}>+2.5% <i className='icon-Arrow-up' style={{marginLeft: '5px'}}></i></Typography> */}
                            </Box>
                            <Typography component="span">
                              Previously AUD{' '}
                              {totalPrizemoneyData[0].PrevValue === null
                                ? 0
                                : totalPrizemoneyData[0].PrevValue.toLocaleString()}
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
                              Most Races (Country)
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('MOST_RACES')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {mostRacesData[0].CurrentName ? mostRacesData[0].CurrentName : '-'}
                              </Typography>
                              {/* <Typography variant='body2' className='HDB-block-count red' sx={{display: 'flex', color: '#C75227'}}>+2.5% <i className='icon-Arrow-up' style={{marginLeft: '5px'}}></i></Typography> */}
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {mostRacesData[0].PrevName === '' ? 'N/A' : mostRacesData[0].PrevName}
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
                              Most Common Track Condition
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('MOST_COMMON_TRACK_CONDITION')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {mostCommonTrackConditionData[0].CurrentName ? mostCommonTrackConditionData[0].CurrentName : '-'}
                              </Typography>
                              {/* <Typography variant='body2' className='HDB-block-count red' sx={{display: 'flex', color: '#C75227'}}>+2.5% <i className='icon-Arrow-up' style={{marginLeft: '5px'}}></i></Typography> */}
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {mostCommonTrackConditionData[0].PrevName === ''
                                ? 'N/A'
                                : mostCommonTrackConditionData[0].PrevName}
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ paddingTop: '8px !important' }}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Most Popular Jockey
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('MOST_POPULAR_JOCKEY')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {mostPopularJockeyData[0].CurrentName ? mostPopularJockeyData[0].CurrentName : '-'}
                              </Typography>
                              {/* <Typography variant='body2' className='HDB-block-count red' sx={{display: 'flex', color: '#C75227'}}>+2.5% <i className='icon-Arrow-up' style={{marginLeft: '5px'}}></i></Typography> */}
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {mostPopularJockeyData[0].PrevName === ''
                                ? 'N/A'
                                : mostPopularJockeyData[0].PrevName}
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ paddingTop: '8px !important' }}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Most Successfull Jockey
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('MOST_SUCCESSFUL_JOCKEY')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {mostSuccessfulJockeyData[0].CurrentName ? mostSuccessfulJockeyData[0].CurrentName : '-'}
                              </Typography>
                              {/* <Typography variant='body2' className='HDB-block-count red' sx={{display: 'flex', color: '#C75227'}}>+2.5% <i className='icon-Arrow-up' style={{marginLeft: '5px'}}></i></Typography> */}
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {mostSuccessfulJockeyData[0].PrevName === ''
                                ? 'N/A'
                                : mostSuccessfulJockeyData[0].PrevName}
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ paddingTop: '8px !important' }}>
                      <Stack direction="row" className="HDB-blocks">
                        {isDDFetching ? <CircularSpinner /> :
                          <Box>
                            <Typography variant="body2" className="HBD-subheadings">
                              Most Successfull Trainer
                              <i
                                className="icon-Download"
                                onClick={() => downloadIndivisualKPI('MOST_SUCCESSFUL_TRAINER')}
                              ></i>
                            </Typography>
                            <Box sx={{ display: 'flex' }} className="HBD-block-headings">
                              <Typography variant="h3" sx={{ color: '#BD9A68' }}>
                                {mostSuccessfulTrainerData[0].CurrentName ? mostSuccessfulTrainerData[0].CurrentName : '-'}
                              </Typography>
                              {/* <Typography variant='body2' className='HDB-block-count red' sx={{display: 'flex', color: '#C75227'}}>+2.5% <i className='icon-Arrow-up' style={{marginLeft: '5px'}}></i></Typography> */}
                            </Box>
                            <Typography component="span">
                              Previously{' '}
                              {mostSuccessfulTrainerData[0].PrevName === ''
                                ? 'N/A'
                                : mostSuccessfulTrainerData[0].PrevName}
                            </Typography>
                          </Box>
                        }
                      </Stack>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={3} className="topPrizemoneyBox race-data-extra-block-left">
                    <Box className="DB-farms">
                      <Box mb={3} className="DB-farms-header">
                        <Typography variant="h3">Top Prizemoney (Venue)</Typography>
                        <i
                          className="icon-Download"
                          onClick={() => downloadIndivisualKPI('TOP_PRIZEMONEY_VENUE')}
                        ></i>
                      </Box>
                      {isTPMFetching ? (
                        <Box className="dashboard-loader">
                          <CircularSpinner />
                        </Box>
                      ) :
                        <>
                          {dashboardTPMAPIData?.map((row: any, index: number) => (
                            <>
                              <Stack direction="row" mt={2} mb={1} className="DB-farms-item">
                                <Box flexGrow={1}>
                                  <Typography variant="h4">{row?.Venue}</Typography>
                                  <Typography variant="h5">
                                    {row?.Venue}, {row?.Country}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography
                                    variant="h4"
                                    sx={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                                  >
                                    <b>
                                      AUD{' '}
                                      {row.convPrizeMoney === null
                                        ? 0
                                        : intToString(row?.convPrizeMoney)}
                                    </b>
                                  </Typography>
                                </Box>
                              </Stack>
                              <Divider />
                            </>
                          ))}
                        </>
                      }
                      {(isTPMFetching === false && (dashboardTPMAPIData?.length === 0)) && <Box className='noDataFound'>No data found</Box>}
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            {/* End Races Stats */}
          </>
        )}
      </Box>
    </>
  );
}

const Placeholder = ({ children }: any) => {
  return <div>{children}</div>;
};

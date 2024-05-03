import React, { useCallback, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import {
  Avatar,
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  MenuList,
  Popover,
  Select,
  Stack,
  StyledEngineProvider,
  TextField,
  Typography,
} from '@mui/material';
// hooks
import useSettings from 'src/hooks/useSettings';
// components
import { Link } from 'react-router-dom';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { MenuProps } from 'src/constants/MenuProps';
import { Images } from 'src/assets/images';
import MatchedMares from 'src/components/MatchedMares';
import ProgenyTracker from 'src/components/ProgenyTracker';
import 'src/pages/dashboard/analytics.css';
import { CustomButton } from 'src/components/CustomButton';
import { getRatingText, toPascalCase } from 'src/utils/customFunctions';
import useCollapseDrawer from 'src/hooks/useCollapseDrawer';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  getLastFromDate,
  getOPtionText,
  convert,
  getLastMonth,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from 'src/utils/customFunctions';
import CopyToClipboard from 'react-copy-to-clipboard';
import {
  useStallionQuery,
  useStallionActivityKeyStatisticQuery,
  useStallionActivityCloseAnalyticsQuery,
  useGetStallionMatchedActivityQuery,
  useGetStallionAnalyticsPdfQuery,
} from 'src/redux/splitEndpoints/stallionsSplit';
import CsvLink from 'react-csv-export';
import AnalyticsDetails from 'src/components/StallionAnalytics/AnalyticsDetails';
import { Spinner } from 'src/components/Spinner';
import StallionActivityChart from './StallionActivityChart';
import { useNavigate } from 'react-router';
import { DateRange } from 'src/@types/dateRangePicker';
import { ShareMailWrapperDialog } from 'src/components/stallion-modal/ShareMailWrapper';
// ----------------------------------------------------------------------

export default function StallionViewAnalytics() {
  const navigate = useNavigate();
  const dateFilterList = DashboardConstants.dateFilterList;

  const viewArray = ['Today', 'This Week', 'This Month', 'This Year', 'Custom'];
  const today = new Date();
  const lastMonth = startOfMonth();
  let initialDateRange = [lastMonth, today];
  const [dueDateValue, setDueDateValue] = React.useState<any>(initialDateRange);
  const [dateRangeValue, setDateRangeValue] = React.useState('This Month');

  const [dateDefaultSelected, setDateDefaultSelected] = useState('This Month');
  const [dateOptionSelected, setDateOptionSelected] = useState('This Month');
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);

  const [shareMailOpen, setShareMailOpen] = useState(false);

  // close shareEmail wrapper handler
  const handleCloseShareMailWrapper = () => {
    setShareMailOpen(false);
  };

  // const handleDatePicker = (event: SelectChangeEvent<any>): void => {
  //   const optionVal: any = event.target.value;
  //   setDateOptionSelected(getOPtionText(optionVal));
  //   setDateDefaultSelected(event.target.value);
  //   setDateFrom(getLastFromDate(optionVal));
  // };
  // Handle datepicker
  const handleDatePicker = (event: SelectChangeEvent<any>): void => {
    const val = event.target.value;
    if (val === 'Today') {
      setDueDateValue([today, today]);
    } else if (val === 'This Week') {
      const thisWeek = startOfWeek();
      setDueDateValue([thisWeek, today]);
    } else if (val === 'This Month') {
      const thisMonth = startOfMonth();
      setDueDateValue([thisMonth, today]);
    } else if (val === 'This Year') {
      const thisYear = startOfYear();
      setDueDateValue([thisYear, today]);
    }
    setDateRangeValue(val);
    setDateDefaultSelected(val);
    setDateOptionSelected(getOPtionText(val));
    setDateFrom(getLastFromDate(val));
  };

  const curDate = new Date().toISOString().slice(0, 10);
  const fromDateConverted = dateDefaultSelected === 'Custom'? convert(convertedCreatedDateValue[0]): convert(dueDateValue[0]);
  const toDateConverted =
    dateDefaultSelected === 'Custom' ? convert(convertedCreatedDateValue[1]) : curDate;

  const { pathname } = useLocation();
  const currentPage = pathname.split('/');
  const stallionID: any = currentPage[4];
  const [isStallionID, setIsStallionID] = useState(stallionID === '' ? false : true);

  // Get stallion info api call with stallion id as payload
  const {
    data: stallionsDetails,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useStallionQuery(stallionID, { skip: !isStallionID });

  // format csv data
  const csvData = [
    {
      'Horse Name': stallionsDetails?.horseName,
      'Service Fee': stallionsDetails?.fee,
      YOB: stallionsDetails?.yob,
    },
  ];

  // Tooltip style used in rating info
  const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }: any) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 346,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9',
    },
  }));

  // Progressbar style used in profile rating
  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    background: '#FFFFFF',
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.mode === 'light' ? '#1D472E' : '#1D472E',
    },
  }));

  // Progressbar style used in profile rating
  const BorderLinearProgress1 = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    background: '#FFFFFF',
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      backgroundColor: theme.palette.mode === 'light' ? '#C75227' : '#C75227',
    },
  }));

  // Full screen functionality
  const handle = useFullScreenHandle();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const handleFullscreen = () => {
    handle.enter();
    setIsFullScreen(true);
  };

  const closeFullscreen = () => {
    handle.exit();
    setIsFullScreen(false);
  };

  const reportChange = useCallback(
    (state, handle) => {
      setIsFullScreen(state);
    },
    [handle]
  );

  const BaseAPI = process.env.REACT_APP_PUBLIC_URL;

  // If user click on Stallion Match Link, navigate to the SM search page
  const handleStallionSearchNavigation = () => {
    navigate(`${BaseAPI}stallion-search?stallionId=${stallionID}`);
  };
  // Copt stallion search page link
  const stallionSearchUrl = `${BaseAPI}stallion-search?stallionId=${stallionID}`;
  const [copied, setCopied] = React.useState(false);
  const onSuccessfulCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download stallion analytics from s3 using API
  const [isPdfDownloadDownload, setIsPdfDownloadDownload] = useState(false);
  const [isPdfDataUrl, setIsPdfDataUrl] = useState(false);
  const [pdfPayload, setPdfPayload] = useState<any>({});
  const downloadData = useGetStallionAnalyticsPdfQuery(
    {
      stallionId: stallionID,
      filterBy: dateRangeValue,
      fromDate: fromDateConverted,
      toDate: toDateConverted,
    },
    { skip: !isPdfDownloadDownload }
  );

  const pdfDataUrl = useGetStallionAnalyticsPdfQuery(
    { stallionId: stallionID, fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isPdfDataUrl }
  );

  const handleDownloadPdf = () => {
    setIsPdfDownloadDownload(true);
  };
  useEffect(() => {
    if (pdfDataUrl.currentData && pdfDataUrl.isSuccess) {
      setIsPdfDownloadDownload(false);
    }
  }, [pdfDataUrl?.isFetching]);

  useEffect(() => {
    if (downloadData.currentData && downloadData.isSuccess) {
      callDownloadPdf();
      setIsPdfDownloadDownload(false);
    }
  }, [downloadData?.isFetching]);

  const callDownloadPdf = () => {
    fetch(downloadData?.data[0]?.downloadUrl).then((response: any) => {
      response.blob().then((blob: any) => {
        // Creating new object of PDF file
        const fileURL = window.URL.createObjectURL(blob);
        // Setting various property values
        let alink = document.createElement('a');
        alink.href = fileURL;
        alink.download = 'stallion_analytics.pdf';
        alink.click();
      });
    });
  };

  let stateFilterForAnalytics = {
    stallionId: stallionID,
    filterBy: dateRangeValue,
    fromDate: dateRangeValue === 'Custom' ? convert(convertedCreatedDateValue[0]) : '',
    toDate: dateRangeValue === 'Custom' ? convert(convertedCreatedDateValue[1]) : '',
  };

  let stateFilterForKeyStatANdCloseAnalytics = {
    stallionId: stallionID,
    filterBy: dateRangeValue,
    fromDate: fromDateConverted,
    toDate: toDateConverted,
  };

  // Get StallionActivityKeyStatistic api call
  const { data: stallionAnalyticsKeyStatsData, isLoading: isStallionAnalyticsLoading } =
    useStallionActivityKeyStatisticQuery(stateFilterForKeyStatANdCloseAnalytics, {
      skip: !isStallionID,
      refetchOnMountOrArgChange: true,
    });

  // Get StallionActivityCloseAnalytic api call
  const { data: stallionAnalyticsCloseData } = useStallionActivityCloseAnalyticsQuery(
    stateFilterForKeyStatANdCloseAnalytics,
    { skip: !isStallionID, refetchOnMountOrArgChange: true }
  );

  // Get GetStallionMatchedActivity api call
  const { data: stallionMatchedActivityData, isSuccess: stallionMatchedActivityDataSuccess } =
    useGetStallionMatchedActivityQuery(stateFilterForKeyStatANdCloseAnalytics, {
      skip: !isStallionID,
      refetchOnMountOrArgChange: true,
    });

  const [lineGrapData, setLineGraphData] = React.useState([]);
  useEffect(() => {
    if (stallionMatchedActivityDataSuccess) {
      setLineGraphData(stallionMatchedActivityData);
    }
  }, [stallionMatchedActivityDataSuccess]);

  // Generate Key Statistics data
  const RoasterAnalytics = [
    [
      {
        title: 'SM Searches',
        value: stallionAnalyticsCloseData ? stallionAnalyticsCloseData[0]?.SMSearches : 'N/A',
      },
      {
        title: '20/20 Matches',
        value: stallionAnalyticsCloseData
          ? stallionAnalyticsCloseData[0]?.TwentyTwentyMatches
          : 'N/A',
      },
      {
        title: 'Perfect Matches',
        value: stallionAnalyticsCloseData ? stallionAnalyticsCloseData[0]?.PerfectMatches : 'N/A',
      },
    ],
    [
      {
        title: 'Stallion Page Views',
        value: stallionAnalyticsCloseData ? stallionAnalyticsCloseData[0]?.PageViews : 'N/A',
      },
      {
        title: '# of Messages',
        value: stallionAnalyticsCloseData ? stallionAnalyticsCloseData[0]?.Messages : 'N/A',
      },
      {
        title: '# of Nominations',
        value: stallionAnalyticsCloseData ? stallionAnalyticsCloseData[0]?.Nominations : 'N/A',
      },
    ],
    [
      {
        title: '# of Runners',
        value: stallionAnalyticsKeyStatsData
          ? stallionAnalyticsKeyStatsData[0]?.TotalRunners
          : 'N/A',
      },
      {
        title: '# of Winners',
        value: stallionAnalyticsKeyStatsData
          ? stallionAnalyticsKeyStatsData[0]?.TotalWinners
          : 'N/A',
      },
      {
        title: '# of Stakes Winners',
        value: `${
          stallionAnalyticsKeyStatsData
            ? stallionAnalyticsKeyStatsData[0]?.TotalStakeWinners
            : 'N/A'
        }`,
      },
    ],
    [
      {
        title: 'SW/RNRS Strike Rate',
        value: `${
          stallionAnalyticsKeyStatsData
            ? stallionAnalyticsKeyStatsData[0]?.StakeWinnersRunnersPerc
            : 'N/A'
        }${stallionAnalyticsKeyStatsData ? '%' : ''}`,
      },
      {
        title: 'M/F Runners',
        value: `${
          stallionAnalyticsKeyStatsData ? stallionAnalyticsKeyStatsData[0]?.MaleRunners : 'N/A'
        } / ${
          stallionAnalyticsKeyStatsData ? stallionAnalyticsKeyStatsData[0]?.FemaleRunners : 'N/A'
        }`,
      },
      {
        title: 'Winners/Runners',
        value: `${
          stallionAnalyticsKeyStatsData
            ? stallionAnalyticsKeyStatsData[0]?.WinnersRunnersPerc
            : 'N/A'
        }${stallionAnalyticsKeyStatsData ? '%' : ''}`,
      },
    ],
  ];

  return (
    <StyledEngineProvider injectFirst>
      <Box className="ViewAnalyticsPageBody" px={2}>
        {/* Breadcrumb  */}
        <Box mb={4} className="common-list-header">
          <Box my={1} className="backtopagewrapper">
            <i className="icon-Chevron-left" style={{ color: '#007142' }} />{' '}
            <Link to="/dashboard/stallions/data" className="backtopage">
              {' '}
              Back to Stallion List
            </Link>
          </Box>
        </Box>
        {/* Breadcrumb  */}

        {/* Header */}
        <Box py={3} my={5} className="stallion-report" sx={{ position: 'relative' }}>
          <Grid container lg={12} xs={12}>
            <Grid item lg={6} xs={12}>
              <Stack direction={{ lg: 'row', sm: 'row', xs: 'column' }} spacing={2}>
                <Box>
                  <Avatar src={Images.HorseProfile} sx={{ width: '72px', height: '72px' }} />
                </Box>
                <Box>
                  <Typography variant="h2">{toPascalCase(stallionsDetails?.horseName)}</Typography>
                  <Typography variant="h6">
                    Service Fee: {stallionsDetails?.currencySymbol}
                    {stallionsDetails?.fee ? stallionsDetails?.fee.toLocaleString() : '--'}
                  </Typography>
                  <Typography variant="h6">YOB: {stallionsDetails?.yob}</Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item lg={6} xs={12}>
              <Stack
                direction={{ lg: 'row', sm: 'row', xs: 'column' }}
                spacing={{ xs: 0, sm: 2, md: 3 }}
                sx={{ justifyContent: { lg: 'end', xs: 'left' } }}
                className="report-links"
              >
                <MenuList>
                  <MenuItem disableGutters>
                    <i className="icon-Link-img">
                      <img src={Images.IconLink} alt="ab" />
                    </i>
                    <CopyToClipboard text={stallionSearchUrl} onCopy={onSuccessfulCopy}>
                      <Box className={'pointerOnHover'}>
                        {' '}
                        {!copied ? 'Stallion Match Link' : 'Stallion Match Link Copied!'}
                      </Box>
                    </CopyToClipboard>
                  </MenuItem>
                </MenuList>
                <MenuList>
                  <MenuItem disableGutters onClick={handleDownloadPdf}>
                    <i className="icon-Download" />
                    Download
                  </MenuItem>
                </MenuList>
                <MenuList>
                  <MenuItem
                    disableGutters
                    onClick={() => {
                      setShareMailOpen(true);
                      // setIsPdfDataUrl(true);
                    }}
                  >
                    <i className="icon-Share"></i>Share
                  </MenuItem>
                </MenuList>
              </Stack>
              <Stack>
                <Box
                  className="progressbar"
                  sx={{ mt: { lg: '1rem', xs: '0' }, width: { lg: '87.593%', xs: '95%' } }}
                >
                  <Box mb={1} sx={{ display: 'flex' }}>
                    <Typography variant="h6" flexGrow={1}>
                      Profile Rating: <b>{getRatingText(stallionsDetails?.profileRating)}</b>
                    </Typography>

                    <HtmlTooltip
                      placement="bottom"
                      className="CommonTooltip"
                      title={
                        <React.Fragment>
                          {
                            'Your stallion’s profile rating is determined by how much information is complete. To increase his profile rating, please update and add information to your stallion’s profile page. '
                          }{' '}
                        </React.Fragment>
                      }
                    >
                      <i className="icon-Info-circle" style={{ fontSize: '16px' }} />
                    </HtmlTooltip>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    {stallionsDetails?.profileRating > 25 && (
                      <BorderLinearProgress
                        variant="determinate"
                        value={stallionsDetails?.profileRating}
                      />
                    )}
                    {stallionsDetails?.profileRating <= 25 && (
                      <BorderLinearProgress1
                        variant="determinate"
                        value={stallionsDetails?.profileRating}
                      />
                    )}
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Body */}
        <Box py={3} my={5} className="stallion-match-activity" sx={{ position: 'relative' }}>
          <Box className="trends-header-wrapper" pt={1} pb={{ sm: '0', md: '26px', lg: '26px' }}>
            {/* Date filter */}
            <Stack direction={{ lg: 'row', xs: 'column' }} className="trends-header-wrapper-inner">
              <Box flexGrow={1}>
                <Typography variant="h3" sx={{ color: '#1D472E' }}>
                  Stallion Match Activity
                </Typography>
              </Box>
              <Box className="trends-header-wrapper-left">
                <Box className="trends-popover">
                  <Box className="edit-field">
                    <Select
                      MenuProps={MenuProps}
                      className="selectDropDown"
                      IconComponent={KeyboardArrowDownRoundedIcon}
                      value={dateRangeValue}
                      sx={{ height: '40px', minWidth: '168px' }}
                      onChange={handleDatePicker}
                    >
                      {viewArray?.map((option: string) => {
                        return (
                          <MenuItem className="selectDropDownList" value={option} key={option}>
                            {option}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Box>
                  {dateDefaultSelected === 'Custom' && (
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
                </Box>
              </Box>
            </Stack>
            {/* End of Date filter */}
          </Box>

          {/* Fullscreen section for graph */}
          <FullScreen handle={handle} onChange={reportChange} className="aptitude-fullscreen">
            <Box className="SPtreechat StallionMatchActivityGraph">
              <Stack direction="row" className="StallionMatchActivityFS">
                {!isFullScreen ? (
                  <CustomButton className="ListBtn" onClick={handleFullscreen}>
                    <i className="icon-Arrows-expand" /> Full Screen
                  </CustomButton>
                ) : (
                  <CustomButton className="ListBtn fullscreenBtn" onClick={closeFullscreen}>
                    <img
                      src={Images.collapseicon}
                      alt="close"
                      className="collapse-icon"
                      onClick={closeFullscreen}
                    />{' '}
                    Exit Full Screen
                  </CustomButton>
                )}
              </Stack>

              {/* Stallion Match Activity chart section */}
              <Box className="Linechart-StMatchActvty" sx={{ padding: '24px 40px 40px' }}>
                <StallionActivityChart
                  stallionMatchedActivityData={stallionMatchedActivityData}
                  stateFilterForAnalytics={stateFilterForAnalytics}
                />
              </Box>
              {/* End of Stallion Match Activity chart section */}

              {/* Stallion Match Activity KPI's section */}
              <Box className="StMatchActvtyInfo" sx={{ padding: '24px 40px 30px' }}>
                <Stack
                  pb={3}
                  direction={{ xs: 'column', sm: 'row' }}
                  divider={
                    <Divider
                      orientation="vertical"
                      sx={{ borderBottom: 'solid 1px #B0B6AF', borderColor: '#B0B6AF' }}
                      flexItem
                    />
                  }
                  spacing={2}
                >
                  <Stack
                    direction={{ xs: 'row', sm: 'column' }}
                    sx={{ width: '100%', alignItems: { xs: 'center', md: 'flex-start' } }}
                  >
                    <Box sx={{ width: { md: '100%', sm: '100%', xs: '70%' } }}>
                      <Typography variant="h6">
                        <span className="circle-gr-trends" /> SM Searches
                      </Typography>
                    </Box>
                    <Box sx={{ width: { md: '100%', sm: '100%', xs: '30%' } }}>
                      <Typography variant="h4">
                        {stallionMatchedActivityData
                          ? stallionMatchedActivityData[0]?.totalSmSearches || 0
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack
                    direction={{ xs: 'row', sm: 'column' }}
                    sx={{ width: '100%', alignItems: { xs: 'center', md: 'flex-start' } }}
                  >
                    <Box sx={{ width: { md: '100%', sm: '100%', xs: '70%' } }}>
                      <Typography variant="h6">
                        <span className="circle-gr-trends green" /> 20/20 Matches
                      </Typography>
                    </Box>
                    <Box sx={{ width: { md: '100%', sm: '100%', xs: '30%' } }}>
                      <Typography variant="h4">
                        {stallionMatchedActivityData
                          ? stallionMatchedActivityData[0]?.totalTtMatches || 0
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack
                    direction={{ xs: 'row', sm: 'column' }}
                    sx={{ width: '100%', alignItems: { xs: 'center', md: 'flex-start' } }}
                  >
                    <Box sx={{ width: { md: '100%', sm: '100%', xs: '70%' } }}>
                      <Typography variant="h6">
                        <span className="circle-gr-trends light-green" /> Perfect Matches
                      </Typography>
                    </Box>
                    <Box sx={{ width: { md: '100%', sm: '100%', xs: '30%' } }}>
                      <Typography variant="h4">
                        {stallionMatchedActivityData
                          ? stallionMatchedActivityData[0]?.totalPerfectMatches || 0
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
                <Divider
                  orientation="horizontal"
                  sx={{
                    display: { md: 'none', xs: 'block' },
                    borderBottom: 'solid 1px #B0B6AF',
                    mb: '1rem',
                  }}
                  flexItem
                />
              </Box>
              {/* End of Stallion Match Activity KPI's section */}
            </Box>
          </FullScreen>
          {/* End of Fullscreen section for graph */}

          {/* Key statistics section */}
          <Box className="KeyStatisticsWrapper" mt={9}>
            <Box className="KeyStatisticsHeader" mb={4}>
              <Typography variant="h3" sx={{ color: '#1D472E' }}>
                Key Statistics
              </Typography>
            </Box>
            {isStallionAnalyticsLoading ? (
              <Spinner />
            ) : (
              <AnalyticsDetails
                analytics={RoasterAnalytics}
                stallionAnalyticsCloseData={stallionAnalyticsCloseData}
                stallionAnalyticsKeyStatsData={stallionAnalyticsKeyStatsData}
                report={true}
              />
            )}
          </Box>
          {/* End of Key statistics section */}

          {/* Matched Mares & Progeny Tracker section */}
          <Box className="matched-mare-table-wrapper" mt={10} mb={0}>
            <Typography variant="h3" sx={{ color: '#1D472E' }}>
              Matched Mares in Stallion Match
            </Typography>
            <Typography component="p" mt={2} className="matched-mare-table-para">
              View mares searched with your farm’s stallions and contact registered Stallion Match
              breeders.
            </Typography>
            <MatchedMares
              stallionId={stallionID}
              fromDate={fromDateConverted}
              toDate={toDateConverted}
            />
            <ProgenyTracker
              stallionId={stallionID}
              fromDate={fromDateConverted}
              toDate={toDateConverted}
            />
          </Box>
          {/* End of Matched Mares & Progeny Tracker section */}
        </Box>
      </Box>

      {/* share email Wrapper Dialog */}
      <ShareMailWrapperDialog
        title="Share Email"
        open={shareMailOpen}
        stallionID={stallionID}
        fromDate={fromDateConverted}
        toDate={toDateConverted}
        reportType={'analytics report'}
        filterBy={dateRangeValue}
        // pdfDataUrl={pdfDataUrl?.data?.[0]?.downloadUrl}
        close={handleCloseShareMailWrapper}
      />
    </StyledEngineProvider>
  );
}

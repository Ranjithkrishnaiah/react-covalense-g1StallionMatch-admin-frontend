import React, { useState, useEffect, useCallback } from 'react';
// @mui
import {
  Avatar,
  Box,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  MenuList,
  Select,
  Stack,
  StyledEngineProvider,
  Typography,
  Popover,
} from '@mui/material';
import { Link } from 'react-router-dom';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import { MenuProps } from 'src/constants/MenuProps';
import { Images } from 'src/assets/images';
import StudFeeHistory from 'src/components/StudFeeHistory';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import 'src/pages/dashboard/analytics.css';
import { CustomButton } from 'src/components/CustomButton';
import { SingleLineBarChart } from 'src/components/graph/SingleLineBarChart';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import CustomRangePicker from 'src/components/customDateRangePicker/CustomRangePicker';
import { DashboardConstants } from 'src/constants/DashboardConstants';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  getLastFromDate,
  getOPtionText,
  yearOnlyConvert,
  getRatingText,
  dateConvert,
  currentDate,
} from 'src/utils/customFunctions';
import { useLocation, useParams } from 'react-router';
import {
  useStallionQuery,
  useStallionStudFeeChartQuery,
  useGetStallionStudFeeHistoryPdfQuery,
} from 'src/redux/splitEndpoints/stallionsSplit';
import CsvLink from 'react-csv-export';
import { toPascalCase } from 'src/utils/customFunctions';
import { ShareMailWrapperDialog } from 'src/components/stallion-modal/ShareMailWrapper';
// ----------------------------------------------------------------------

export default function StallionViewFeeHistory() {
  const dateFilterList = DashboardConstants.dateFilterList;
  const [dateDefaultSelected, setDateDefaultSelected] = useState('lastweek');
  const [dateOptionSelected, setDateOptionSelected] = useState('last week');
  const [dateFrom, setDateFrom] = useState<any>(getLastFromDate(dateDefaultSelected));
  const [convertedCreatedRangeValue, setConvertedCreatedRangeValue] = React.useState('');
  const [convertedCreatedDateValue, setConvertedCreatedDateValue] = React.useState([null, null]);
  const [isPdfDataUrl, setIsPdfDataUrl] = useState(false);
  const [shareMailOpen, setShareMailOpen] = useState(false);

  // close shareEmail wrapper handler
  const handleCloseShareMailWrapper = () => {
    setShareMailOpen(false);
  };

  const handleDatePicker = (event: SelectChangeEvent<any>): void => {
    const optionVal: any = event.target.value;
    setDateOptionSelected(getOPtionText(optionVal));
    setDateDefaultSelected(event.target.value);
    setDateFrom(getLastFromDate(optionVal));
  };
  const d = new Date();
  let currentYear = d.getFullYear().toString();
  const fromDateConverted =
    dateDefaultSelected === 'custom'
      ? yearOnlyConvert(convertedCreatedDateValue[0])
      : yearOnlyConvert(dateFrom);
  const toDateConverted =
    dateDefaultSelected === 'custom' ? yearOnlyConvert(convertedCreatedDateValue[1]) : currentYear;
  const isDashboardAPI = fromDateConverted > 0 && toDateConverted > 0 ? true : false;
  const selectedDateFilter =
    dateDefaultSelected === 'custom' &&
    fromDateConverted !== undefined &&
    toDateConverted !== undefined
      ? fromDateConverted + '-' + toDateConverted
      : fromDateConverted !== undefined && toDateConverted !== undefined
      ? fromDateConverted + '-' + toDateConverted
      : '';

  const { pathname } = useLocation();
  const currentPage = pathname.split('/');
  const stallionID: any = currentPage[4];
  const [isStallionID, setIsStallionID] = useState(stallionID === '' ? false : true);

  // console.log((selectedDateFilter === ''),isStallionID,'selectedDateFilter')
  // Get stallion info api call with stallion id as payload
  const {
    data: stallionDataById,
    error,
    isFetching,
    isLoading,
    isSuccess,
  } = useStallionQuery(stallionID, { skip: !isStallionID });
  const {
    data: studFeeChartData,
    error: studFeeChartError,
    isFetching: isStudFeeChartFetching,
    isLoading: isStudFeeChartLoading,
    isSuccess: isStudFeeChartSuccess,
  } = useStallionStudFeeChartQuery(
    { id: stallionID, date: selectedDateFilter },
    { skip: isStallionID === false || selectedDateFilter === '', refetchOnMountOrArgChange: true }
  );
  const currentStallion = stallionDataById;
  const studFeeChartLineData = {
    horseName: toPascalCase(currentStallion?.horseName),
    year: studFeeChartData?.year,
    price: studFeeChartData?.price,
  };

  // format csv data
  const csvData = [
    {
      'Horse Name': currentStallion?.horseName,
      'Service Fee': currentStallion?.fee,
      YOB: currentStallion?.yob,
    },
  ];

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

  // Download stallion analytics from s3 using API
  const [isPdfDownloadDownload, setIsPdfDownloadDownload] = useState(false);
  const [pdfPayload, setPdfPayload] = useState<any>({});
  const downloadData = useGetStallionStudFeeHistoryPdfQuery(
    { stallionId: stallionID, fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isPdfDownloadDownload }
  );

  const pdfDataUrl = useGetStallionStudFeeHistoryPdfQuery(
    { stallionId: stallionID, fromDate: fromDateConverted, toDate: toDateConverted },
    { skip: !isPdfDataUrl }
  );

  useEffect(() => {
    if (pdfDataUrl.currentData && pdfDataUrl.isSuccess) {
      setIsPdfDownloadDownload(false);
    }
  }, [pdfDataUrl?.isFetching]);

  const handleDownloadPdf = () => {
    setIsPdfDownloadDownload(true);
  };

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
        alink.download = 'stallion_studfee_history.pdf';
        alink.click();
      });
    });
  };

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
                  <Typography variant="h2">{toPascalCase(currentStallion?.horseName)}</Typography>
                  <Typography variant="h6">
                    Service Fee: {currentStallion?.currencySymbol}
                    {currentStallion?.fee.toLocaleString()}
                  </Typography>
                  <Typography variant="h6">YOB: {currentStallion?.yob}</Typography>
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
                      Profile Rating: <b>{getRatingText(currentStallion?.profileRating)}</b>
                    </Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <BorderLinearProgress
                      variant="determinate"
                      value={currentStallion?.profileRating}
                    />
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        {/* Body */}
        <Box py={3} my={5} className="stallion-match-activity" sx={{ position: 'relative' }}>
          <Box className="trends-header-wrapper" pt={1} pb={{ sm: '0', md: '26px', lg: '26px' }}>
            <Stack direction={{ lg: 'row', xs: 'column' }} className="trends-header-wrapper-inner">
              <Box flexGrow={1}>
                <Typography variant="h3" sx={{ color: '#1D472E' }}>
                  Stud Fee Chart
                </Typography>
              </Box>
              <Box className="trends-header-wrapper-left">
                <Box className="trends-popover">
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
                </Box>
              </Box>
            </Stack>
          </Box>
          <FullScreen handle={handle} onChange={reportChange} className="aptitude-fullscreen">
            <Box className="aptitude-fullscreen">
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
                <Box
                  className="Linechart-StMatchActvty"
                  sx={{ padding: '24px 40px 40px', height: '250px' }}
                >
                  <SingleLineBarChart data={studFeeChartLineData} />
                </Box>
              </Box>
            </Box>
          </FullScreen>
          <StudFeeHistory stallionId={stallionID} dateFilter={selectedDateFilter} />
        </Box>
      </Box>

      {/* share email Wrapper Dialog */}
      <ShareMailWrapperDialog
        title="Share Email"
        open={shareMailOpen}
        stallionID={stallionID}
        fromDate={fromDateConverted}
        toDate={toDateConverted}
        reportType={'studFee report'}
        filterBy={''}
        // pdfDataUrl={pdfDataUrl?.data?.[0]?.downloadUrl}
        close={handleCloseShareMailWrapper}
      />
    </StyledEngineProvider>
  );
}

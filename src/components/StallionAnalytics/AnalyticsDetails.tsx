import { Divider, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import CustomAccordionDetails from "src/components/customAccordion/CustomAccordionDetails";
import './StallionAnalytics.css';
import React from 'react'
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom'

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


function AnalyticsDetails(props: any) {
  const { pathname } = useLocation();
  console.log(pathname,'pathname')
  const isStallionReport = pathname.includes('/report/stallion/') || pathname.includes('/analytics')
  let report = props.report === undefined ? false : true;

  // Get the indivisual KPI info
  let getDiffHTML = (currTitle: string, crrValue: number) => {
    if (isStallionReport) {
      let currKey = currTitle;
      let currValue = crrValue;
      let prevValue: any = '';
      let prevKey = '';

      if (currKey === 'Stallion Page Views') {
        prevKey = 'PreviousPageViews';
        currValue = props.stallionAnalyticsCloseData[0]?.PageViewsDiffPercent
        prevValue = 0
      }
      if (currKey === '# of Messages') {
        prevKey = 'PreviousMessages';
        currValue = props.stallionAnalyticsCloseData[0]?.MessagesDiffPercent
        prevValue = 0
      }
      if (currKey === '# of Nominations') {
        prevKey = 'PreviousNominations';
        currValue = props.stallionAnalyticsCloseData[0]?.NominationsDiffPercent
        prevValue = 0
      }

      if (currKey === 'Perfect Matches') {
        prevKey = 'PreviousPerfectMatches';
        currValue = props.stallionAnalyticsCloseData[0]?.PerfectMatches
        prevValue = props.stallionAnalyticsCloseData[0]?.PreviousPerfectMatches
      }
      if (currKey === 'SM Searches') {
        prevKey = 'PreviousSMSearches';
        currValue = props.stallionAnalyticsCloseData[0]?.SMSearches
        prevValue = props.stallionAnalyticsCloseData[0]?.PreviousSMSearches
      }
      if (currKey === '20/20 Matches') {
        prevKey = 'PreviousTwentyTwentyMatches';
        currValue = props.stallionAnalyticsCloseData[0]?.TwentyTwentyMatches
        prevValue = props.stallionAnalyticsCloseData[0]?.PreviousTwentyTwentyMatches
      }

      if (currKey === 'M/F Runners') {
        prevKey = 'PreviousFemaleRunners';
        currValue = getPercValue(props.stallionAnalyticsKeyStatsData[0]?.MaleRunners, props.stallionAnalyticsKeyStatsData[0]?.FemaleRunners)
        prevValue = getPercValue(props.stallionAnalyticsKeyStatsData[0]?.PreviousMaleRunners, props.stallionAnalyticsKeyStatsData[0]?.PreviousFemaleRunners)
      }
      if (currKey === '# of Runners') {
        prevKey = 'PreviousTotalRunners';
        currValue = props.stallionAnalyticsKeyStatsData[0]?.TotalRunners
        prevValue = props.stallionAnalyticsKeyStatsData[0]?.PreviousTotalRunners
      }
      if (currKey === '# of Winners') {
        prevKey = 'PreviousTotalWinners';
        currValue = props.stallionAnalyticsKeyStatsData[0]?.TotalWinners
        prevValue = props.stallionAnalyticsKeyStatsData[0]?.PreviousTotalWinners
      }

      if (currKey === 'SW/RNRS Strike Rate') {
        prevKey = 'PreviousStakeWinnersRunnersPerc';
        currValue = props.stallionAnalyticsKeyStatsData[0]?.StakeWinnersRunnersPerc
        prevValue = props.stallionAnalyticsKeyStatsData[0]?.PreviousStakeWinnersRunnersPerc
      }
      if (currKey === '# of Stakes Winners') {
        prevKey = 'PreviousTotalStakeWinners';
        currValue = props.stallionAnalyticsKeyStatsData[0]?.TotalStakeWinners
        prevValue = props.stallionAnalyticsKeyStatsData[0]?.PreviousTotalStakeWinners
      }
      if (currKey === 'Winners/Runners') {
        prevKey = 'PreviousWinnersRunnersPerc';
        currValue = props.stallionAnalyticsKeyStatsData[0]?.WinnersRunnersPerc
        prevValue = props.stallionAnalyticsKeyStatsData[0]?.PreviousWinnersRunnersPerc
      }

      if (props.stallionAnalyticsKeyStatsData || props.stallionAnalyticsCloseData) {
        let diff = getDiffValue(currValue, prevValue);
        let htmlForDiff = <Typography component="span" className={`key-statics-arrow ${diff === 0 ? 'arrowUpBlock' : diff > 0 ? 'arrowUpBlock' : 'arrowDownBlock'}`}>
          {diff === 0 ? '' : diff > 0 ? <i className="icon-Arrow-up" /> : <i className="icon-Arrow-down" />} {Math.abs(diff) > 0 && Math.abs(diff)} {Math.abs(diff) && (currKey === 'Stallion Page Views' || currKey === '# of Messages' || currKey === '# of Nominations')? '%' : ''}
        </Typography>;

        return htmlForDiff;
      }
    }
  }

  // Get the diffrence from currValue & prevValue used in getDiffHTML()
  const getDiffValue = (a: any, b: any) => {
    let diffValue = 0;
    let firstValue = a;
    let secondValue = b;
    if (!firstValue) {
      firstValue = 0;
    }
    if (!secondValue) {
      secondValue = 0;
    }
    diffValue = firstValue - secondValue;
    return diffValue;
  }

  // Get the percentage value from currValue & prevValue used in getDiffHTML()
  const getPercValue = (a: any, b: any) => {
    let percValue: any = 0;
    if (a && b) {
      percValue = ((a / b) * 100).toFixed(2);
    }
    if (!b) {
      percValue = 0;
    }
    return percValue;
  }

  return (
    <>
      <CustomAccordionDetails sx={{ padding: '0 1.25rem' }}>
        {
          props.analytics.map((subArray: any[], index: number) => (
            <Box key={index} className='roaster-lines-anlaytics-wrp'>
              <Stack
                className='roaster-lines-anlaytics'
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
                {subArray.map((obj: any, i: number) => (
                  <Stack
                    className='roaster-block'
                    key={obj.title + i}
                    direction={{ xs: 'row', sm: 'column' }}
                    sx={{ width: '100%', alignItems: { xs: 'center', md: 'flex-start' } }}
                  >
                    <Box className='roaster-block-left' sx={{ width: { md: '100%', sm: '100%', xs: '50%' } }}>
                      <Typography variant="h6">{obj.title}
                        {obj.title === 'Stallion Match Searches' && <HtmlTooltip
                          placement='bottom-start'
                          enterTouchDelay={0}
                          leaveTouchDelay={6000}
                          className="CommonTooltip studfee-tooltip"
                          title={
                            <React.Fragment>
                              {' '}
                              {' '}
                            </React.Fragment>
                          }
                        >
                          <i className="icon-Info-circle" style={{ fontSize: '16px' }} />
                        </HtmlTooltip>}
                      </Typography>

                    </Box>
                    <Box className='roaster-block-right' sx={{ width: { md: '100%', sm: '100%', xs: '50%' }, display: 'flex', alignItems: 'flex-end' }}>
                      <Typography variant="h4">{obj.value ? obj.value : 0}</Typography>
                      {isStallionReport && getDiffHTML(obj.title, obj.value)}
                    </Box>
                  </Stack>
                ))}
              </Stack>

              {report === false && index === 1 ?
                <Box pb={2} className='keyStaticsWrapper'>
                  <Typography variant="h3">Key Statistics</Typography>
                </Box> : ""}
              <Divider
                orientation="horizontal"
                sx={{
                  display: { md: 'none', xs: 'none' },
                  borderBottom: 'solid 1px #B0B6AF',
                  mb: '1rem',
                }}
                flexItem
              />
            </Box>
          ))
        }
      </CustomAccordionDetails>
    </>
  );
}

export default AnalyticsDetails;
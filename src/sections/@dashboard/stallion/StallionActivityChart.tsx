import { Box } from '@mui/material';
import { StallionActivityLineChart } from 'src/components/graph/StallionActivityLineChart';

function StallionActivityChart(props: any) {
  if (props.stallionMatchedActivityData) {
    return (
      <Box className='line-chart-report'>   <StallionActivityLineChart filter={props.stateFilterForAnalytics} chartData={props.stallionMatchedActivityData} report={true} /></Box>
    )
  } else {
    return (
      <Box className='noGraph'>
      <div className='no-graph-data'>No Graph Data</div>
      </Box>
  )}
}

export default StallionActivityChart
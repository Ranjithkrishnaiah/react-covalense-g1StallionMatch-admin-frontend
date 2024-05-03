
import React, { PureComponent, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Chart, registerables } from 'chart.js';
import { Box } from '@mui/material';
import { InsertCommas } from 'src/utils/customFunctions';

const NewCustomerChart = ({fromDate, chartData}: {fromDate: any, chartData: any}) => {

  Chart.register(...registerables);
  const [graphData, setGraphData] = React.useState(chartData);
  const [averageData, setAverageData] = React.useState<any>('');
  const [totalCount, setTotalCount] = React.useState<any>('');


  useEffect(() => {
    let arr: any = [];
    let totCount = 0;
    let totRecords = 0;
    chartData?.map((res: any) => {      
      arr.push({ordersCount: res?.NewRegCount, xAxis: res?.DayNum});
      totCount += res?.NewRegCount;  
      totRecords = totRecords+1; 
    })
    setGraphData(arr)
    setAverageData(totCount/totRecords);
    setTotalCount(totCount);
  },[fromDate, chartData])


  const ITEM_HEIGHT = 35;
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
  }

  const CustomTooltip = ({ active, payload, label }: { active?: any, payload?: any, label?: any }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ border: 'none !important' }}>
          {payload.map((pld: any, index: number) => (
            <div key={index} style={{ padding: 10 }}>
              <div style={{ color: '#fff', fontWeight: 'bold' }}>{pld.value}</div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Box className='WorldReachBoxBodyNew' width={'100%'} height={'100%'} position={'relative'} borderRadius={'10px'} overflow={'hidden'}>
      {/* <Box bgcolor={'#bd9968'} position={'absolute'} top={0} width={'100%'} height={'450px'}>
      </Box> */}

      <Box  position={'absolute'} padding={3} width={'100%'}>
        <Box display={'flex'} justifyContent={'space-between'}>
        <p style={{ color: "#1D472E", fontWeight:'700', fontSize:14, fontFamily:"synthese-regular"}}>
         New Customers  
        </p>
        <p style={{ color: "#ffffff", fontWeight:'400', fontSize:18, fontFamily:"synthese-regular"}}>
        +{InsertCommas(parseInt(totalCount)) || 0}
        </p>
        </Box>
        <p style={{ color: "#1D472E", opacity:0.7, fontWeight:'400', fontSize:12, fontFamily:"synthese-regular"}}>
          { InsertCommas(Math.ceil(parseInt(averageData))) || 0} Daily Avg.
        </p>        
      </Box>
      <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        style={{ zIndex: 1}}
        data={graphData}
        margin={{
          top: 10,
          right: 0,
          left: 0,
          bottom: 0,
        }}
      >

        <defs>
          <linearGradient id="colorUv" x1="0" y1="0%" x2="0" y2="100%">
            <stop offset="0%"  stopColor="#d6c1a5" />
            <stop offset="50%"  stopColor="#d6c1a5" />
            <stop offset={`${750}%`} stopColor="#c8ad85" />
            <stop offset={`${100}%`} stopColor="#be9d70" />
          </linearGradient>
        </defs>

        {/* <XAxis dataKey="xAxis" stroke='grey' fontSize={'13px'}/>
        <YAxis  domain={[0, 80]} tick={false} hide /> */}
        <Tooltip wrapperStyle={{ outline: "none" }} content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        <Area type="basis" dataKey="ordersCount"
          stroke="#fff" 
          fill="url(#colorUv)" />
      </AreaChart>
      </ResponsiveContainer>
    </Box>

  );
}
export default NewCustomerChart;

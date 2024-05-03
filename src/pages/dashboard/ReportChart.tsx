import React, { useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip ,ResponsiveContainer } from 'recharts';
import { Chart, registerables } from 'chart.js';
import { Box } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useCountriesQuery } from 'src/redux/splitEndpoints/countriesSplit';
import { useGetOrderByCountryQuery } from 'src/redux/splitEndpoints/reportsSplit';
import { MenuProps } from 'src/constants/MenuProps';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const ReportChart = ({fromDate, toDate}: {fromDate: any, toDate: any}) => {
  Chart.register(...registerables);
  const { data: countriesList } = useCountriesQuery();
  const [country, setCountry] = React.useState(11);
  const [graphData, setGraphData] = React.useState([]);
  const [averageData, setAverageData] = React.useState('');
  const [totalCount, setTotalCount] = React.useState(''); 
  // Get order by country api call
  const { data: orderByCountryChartAPIData, isFetching: isOrderByCountryChartFetching, isLoading: isOrderByCountryChartLoading, isSuccess: isOrderByCountryChartSuccess } = useGetOrderByCountryQuery({'fromDate': fromDate, 'toDate': toDate, 'countryId': country, 'groupedBy': 'Day'}, { refetchOnMountOrArgChange: true });
  // Render the api data
  useEffect(() => {
    if(orderByCountryChartAPIData?.length){
      setGraphData(orderByCountryChartAPIData[0].data)
      setAverageData(orderByCountryChartAPIData[0].average)
      setTotalCount(orderByCountryChartAPIData[0].totalCount)
    }
  },[isOrderByCountryChartFetching]);  
  // Onclick, set the country value and call api
  const handleChange = (event: SelectChangeEvent) => {
    setCountry(event.target.value as unknown as number);
  };

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
    <Box className='WorldReachBoxBodyNew' paddingBottom={'20px'} position={'relative'} borderRadius={'6px'} height={'495px'} bgcolor={'#bd9968'}>
      {/* <Box bgcolor={'#bd9968'} position={'absolute'} top={0} width={'100%'} height={'480px'}>
      </Box> */}

      <Box  position={'absolute'} top={15} left={25} className='reportChart'>
        <p className="orderby">
         Orders By Country  <span style={{ color: "#ffffff", fontSize:18, fontFamily: 'Synthese-Regular', fontWeight:'400', paddingLeft: "12px"}}>{totalCount }</span>
        </p>
        <p className="avarage">
        { Math.ceil(parseInt(averageData))|| 0} Average 
        </p>
        
      </Box>
      
      <Box className="edit-field" sx={{width: '170px !important'}} zIndex={9} position={'absolute'} top={'18px'} right={'15px'}>
        <FormControl fullWidth>
          <Select
            MenuProps={{
              anchorOrigin: {
                vertical: 'bottom',
                horizontal: 'left',
              },
              transformOrigin: {
                vertical: 'top',
                horizontal: 'left',
              },
              ...MenuProps,
            }}
            value={country.toString()}
            onChange={handleChange}
            displayEmpty
            defaultValue={'11'}
            IconComponent={KeyboardArrowDownRoundedIcon}
            className="countryDropdown filter-slct"
          >
             <MenuItem  className="selectDropDownList countryDropdownList reportCountryDropdownList" value="" disabled><em>Select Country</em></MenuItem>
              {countriesList?.map(({ id, countryName }) => {
                return (
                  <MenuItem className="selectDropDownList countryDropdownList reportCountryDropdownList" value={id} key={id}>
                    {countryName}
                  </MenuItem>
                );
              })}
          </Select>
        </FormControl>
      </Box>
      <ResponsiveContainer width='100%' height={525}>
      <AreaChart
        // width={726}
        style={{ zIndex: 1 }}
        // height={480}
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

        <XAxis dataKey="xAxis" stroke='grey' fontSize={'13px'}/>
        <YAxis  domain={[0, 80]} tick={false} hide />
        <Tooltip wrapperStyle={{ outline: "none" }} content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        <Area type="monotone" dataKey="ordersCount"
          stroke="#fff" 
          fill="url(#colorUv)" />
      </AreaChart>
      </ResponsiveContainer>
    </Box>

  );
}
export default ReportChart;

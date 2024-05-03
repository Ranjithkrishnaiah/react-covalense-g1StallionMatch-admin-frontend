import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Box, Stack } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function StallionActivityLineChart(props: any) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        display: false,
      },
      title: {
        display: false,
        text: 'Chart.js Line Chart',
      },
    }
  };
  const [graphData, setData] = useState<any>({});

  const getMonths = (date: any) => {
    let filterBy = props.chartData[0].xKey;
    let label = '';
    var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (filterBy === 'days') {
      let index: any = new Date().getMonth();
      label = `${date} ${month[index]}`;
    }
    if (filterBy === 'months') {
      label = `${month[date - 1]}`;
    }
    if (filterBy === 'years' || filterBy === 'year') {
      label = `${date}`;
    }
    return label !== '' ? label : date;
  }

  const labels: any = new Array;
  const xAxis: any = new Array;
  const yAxis: any = new Array;
  const zAxis: any = new Array;
  let data: any = {};

  // Generate the data for line graph
  useEffect(() => {
    setData({});
    if (props.chartData[0].data?.length) {
      if (props.report) {
        props.chartData[0].data?.map((v: any, i: number) => {
          let keyArr = Object.keys(v);
          for (let index = 0; index < keyArr.length; index++) {
            const element = keyArr[index];
            if (element === "smSearches") {
              xAxis.push(v.smSearches)
            }
            if (element === "ttMatches") {
              yAxis.push(v.ttMatches)
            }
            if (element === "perfectMatches") {
              zAxis.push(v.perfectMatches)
            }
            if (element === "createdOn") {
              labels.push(getMonths(String(v.createdOn)))
            }
          }
        })
      }
      data = {
        labels,
        datasets: [
          {
            label: 'SM Searches',
            data: xAxis,
            borderColor: '#3139DA',
            backgroundColor: '#3139DA',
          },
          {
            label: '20/20 Matches',
            data: yAxis,
            borderColor: '#1D472E',
            backgroundColor: '#1D472E',
          },
          {
            label: 'Perfect Matches',
            data: zAxis,
            borderColor: '#2EFFB4',
            backgroundColor: '#2EFFB4',
          },
        ],
      };
      setData(data);
      
    }
  }, [props.chartData])


  if (Object.keys(graphData).length) {
    return <Stack className='Linechart-Graph'><Line options={options} data={graphData} /></Stack>;
  }
  return (
  <Box className='noGraph'>
    <div className='no-graph-data'>No Graph data</div>
    </Box>
    )
}
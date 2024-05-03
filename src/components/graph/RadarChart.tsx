import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Container, Grid, Box, StyledEngineProvider, Typography, Divider, Stack, IconButton, Avatar } from '@mui/material';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const ageData = {
  labels: ['2 Years', '3 Years', '4 Years', '5 Years', 'Open'],
  datasets: [
    {
      label: 'Female',
      data: [5, 10, 15, 20, 25, 30, 35],
      backgroundColor: 'rgba(239 198 223)',
      borderColor: 'rgba(237 138 197)',
      borderWidth: 2,
    },
    {
      label: 'Male',
      data: [5, 10, 15, 20, 25, 30, 35],
      backgroundColor: 'rgba(197 217 240)',
      borderColor: 'rgba(139 186 240)',
      borderWidth: 2,
    }
  ],
};

export const distanceData = {
  labels: ['800m (4f)', '1200m (6f)', '1400m (8f)', '2000m (10f)', '2400m (12f)', '2800m+ (14f)'],
  datasets: [
    {
      label: 'Female',
      data: [5, 10, 15, 20, 25, 30, 35],
      backgroundColor: 'rgba(239 198 223)',
      borderColor: 'rgba(237 138 197)',
      borderWidth: 2,
    },
    {
      label: 'Male',
      data: [5, 10, 15, 20, 25, 30, 35],
      backgroundColor: 'rgba(197 217 240)',
      borderColor: 'rgba(139 186 240)',
      borderWidth: 2,
    }
  ],
};

const RadarChart = (radarType:any) => {
  const data = (radarType.chartType === 'age') ? ageData : distanceData;
  const typeLabel = (radarType.chartType === 'age') ? 'Age' : 'Distance';
  return (
    <>
    <Radar data={data} />
    <Typography variant='h3' sx={ {textAlign: 'center'} } className='radarHeadings'>{typeLabel}</Typography>
    </>
  );
}
export default RadarChart;

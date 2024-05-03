import React from 'react';
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
import "./GraphStyles.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
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

const labels = ['1 Apr', '5 Apr', '10 Apr', '15 Apr', '20 Apr', '25 Apr', '30 Apr'];
const fakeX = [5, 4, 6, 8, 5, 7, 8]
const fakeY = [7, 5, 8, 10, 5, 4, 5]
const fakeZ = [10, 5, 7, 15, 13, 8, 9]
export const data = {
  labels,
  datasets: [
    {
      label: 'Horse 1',
      data: fakeX,
      borderColor: '#2EFFB4',
      backgroundColor: '#2EFFB4',
    },
    {
      label: 'Horse 2',
      data: fakeY,
      borderColor: '#1D472E',
      backgroundColor: '#1D472E',
    },
    {
      label: 'Horse 3',
      data: fakeZ,
      borderColor: '#3139DA',
      backgroundColor: '#3139DA',
    },
  ],
};

export function LineBarChart({chartData = data}) {
  return <div className='lineBarChart-Wrapper' style={{position: "relative"}}><Line options={options} data={chartData} /></div>;
}

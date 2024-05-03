import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bubble } from 'react-chartjs-2';


ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export const data = {
  datasets: [
    {
      label: '',
      data: [
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
        { x: [Math.random()*10], y: [Math.random()*10], r: [Math.random()*20] },
      ],
      backgroundColor: 'rgba(29 71 46)',
    },
  ],
};

export function BubbleChart() {
  return <Bubble options={options} data={data} />;
}

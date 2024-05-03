import React, { useEffect, useState } from 'react';
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
import { circle } from 'leaflet';


ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const defaultdata = {
  labels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "First dataset",
      data: [33, 33, 53, 60, 41, 44, 65],
      fill: false,
      backgroundColor: "#2EFFB4",
      borderColor: "#2EFFB4",
      tension: 0.5,
      pointStyle: 'cross',
      pointBorderWidth: 0,
    },
    {
      label: "Second dataset",
      data: [20, 33, 25, 35, 51, 54, 76],
      fill: false,
      backgroundColor: "#007142",
      borderColor: "#007142",
      tension: 0.4,
      pointStyle: 'cross',
      pointBorderWidth: 0,

    }
  ]
};

export default function AreaChart(props: any) {
  const { chartData, dateOptionSelected } = props; 
  const [graphData, setData] = useState<any>({});
  const labels: any = new Array;
  const xAxis: any = new Array;
  const yAxis: any = new Array;
  let data: any = {};

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: {
          display: false,
          // lineWidth: 0.5,
          drawBorder: false,
          borderDash: [15, 5],
          borderColor: "#EEEEEE",
          borderDashOffset: 2,

        },
        ticks: {
          maxTicksLimit: 5,
        }
      },
      x: {
        grid: {
          display: true,
          drawBorder: false,
          // borderDash: [15, 5],
          // lineWidth: 0.5,
          borderColor: "#EEEEEE",
          borderDashOffset: 2,
        },
        // ticks: {
        //   maxTicksLimit: 4,
        // }

      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        // align:'end',
        pointStyle: 'circle',
        display: false,
        labels: {
          usePointStyle: true,
        }
      },
      title: {
        display: false,
        // align: 'start',
        titleFont: 'Synthese-Regular',
        // text: 'Nov - July',
      },
    }
  };
  var month = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];

  useEffect(() => {
    setData({});
    if (chartData !== undefined) {
      if (chartData?.length) {
        chartData?.map((v: any, i: number) => {
          yAxis.push(v.NewRegCount ? v.NewRegCount : 0);
          labels.push(month[v.DayNum]);
        })
        data = {
          labels: labels,
          datasets: [
            {
              label: "Previous",
              data: xAxis,
              fill: false,
              backgroundColor: "#2EFFB4",
              borderColor: "#2EFFB4",
              tension: 0.5,
              pointStyle: 'cross',
              pointBorderWidth: 0,
            },
            {
              label: dateOptionSelected ? dateOptionSelected : '',
              data: yAxis,
              fill: false,
              backgroundColor: "#007142",
              borderColor: "#007142",
              tension: 0.4,
              pointStyle: 'cross',
              pointBorderWidth: 0,

            }
          ],
        };
        setData(data);
        
      }
    } else {
      setData(defaultdata);
    }
  }, [chartData])

  if (Object.keys(graphData).length) {
    return <div className='lineChart-Wrapper' style={{ position: "relative" }}><Line className='lineChart' options={options} data={graphData} /></div>;
  }
  return <div className='no-graph-data'>No Graph data</div>
}
import  { useEffect, useState } from 'react';
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

// default data 
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

export default function MessagesLineChart(props: any) {
  // react states
  const { chartData, dateOptionSelected } = props; 
  const [graphData, setData] = useState<any>({});
  const labels: any = new Array;
  const xAxis: any = new Array;
  const yAxis: any = new Array;
  let data: any = {};

  // options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: {
          display: false,
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
          borderColor: "#EEEEEE",
          borderDashOffset: 2,
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        pointStyle: 'circle',
        display: false,
        labels: {
          usePointStyle: true,
        }
      },
      title: {
        display: false,
        titleFont: 'Synthese-Regular',
        text: 'Nov - July',
      },
      datalabels: {
        display: function(context:any) {
          return false; 
        }
      }
    }
  };
  var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // set data on value change
  useEffect(() => {
    setData({});
    if (chartData !== undefined) {
      if (chartData?.length) {
        chartData?.map((v: any, i: number) => {
          yAxis.push(v.currentValue ? v.currentValue : 0);
          xAxis.push(v.previousValue ? v.previousValue : 0);
          labels.push(v.label);
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
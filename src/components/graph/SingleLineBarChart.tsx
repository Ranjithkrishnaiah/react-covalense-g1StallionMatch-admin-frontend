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
  options: {
    hover: {
      mode: 'dataset',
      intersect: false,
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 12,
          family: 'Synthese-Regular'
        },
        color: '#626E60',
        // beginAtZero: true,
      },
      grid: {
        display: false,
        drawBorder: false,
      },

    },
    y: {
      beginAtZero: true,
      ticks: {
        font: {
          size: 14,
          family: 'Synthese-Regular'
        },
        color: '#626E60',
        // maxTicksLimit: 10,
        // stepSize: 1,
        precision:0,
        padding: 20,
      },
      grid: {
        display: true,
        drawBorder: false,
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
    tooltip: {
      displayColors: false,
      titleFontSize: 50,
      titleFontFamily: "Synthese-Book",
      titleFontColor: '#161716',
      fontColor: '#161716',
      fontFamily: "Synthese-Book",
      fontWeight: "400",
    },
  }
};

export function SingleLineBarChart(props: any) {
  const labels = props.data.year;
  const fakeX = props.data.price;
  // console.log(fakeX,labels,'labels')
  const chartData = {
    labels,
    datasets: [
      {
        label: props.data.horseName,
        data: fakeX,
        borderColor: '#1D472E',
        backgroundColor: '#1D472E',
        pointHitRadius: 20,
        pointHoverRadius: 5,
      }
    ],
  };
  return <div className='lineBarChart-Wrapper' style={{ position: "relative" }}><Line options={options} data={chartData} /></div>;
}

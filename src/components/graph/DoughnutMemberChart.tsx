import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Pie } from 'react-chartjs-2';
import './GraphStyles.css';

ChartJS.register(ArcElement, Tooltip, Legend);
export const chartColors = [
  '#336699',
  '#99CCFF',
  '#999933',
  '#666699',
  '#CC9933',
  '#006666',
  '#3399FF',
  '#993300',
  '#CCCC99',
  '#666666',
  '#FFCC66',
  '#6699CC',
  '#663366',
  '#9999CC',
  '#CCCCCC',
  '#669999',
  '#CCCC66',
  '#CC6600',
  '#9999FF',
  '#0066CC',
  '#99CCCC',
  '#999999',
  '#FFCC00',
  '#009999',
  '#99CC33',
  '#FF9900',
  '#999966',
  '#66CCCC',
  '#339966',
  '#CCCC33',
  '#003f5c',
  '#665191',
  '#a05195',
  '#d45087',
  '#2f4b7c',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
  '#EF6F6C',
  '#465775',
  '#56E39F',
  '#59C9A5',
  '#5B6C5D',
  '#0A2342',
  '#2CA58D',
  '#84BC9C',
  '#CBA328',
  '#F46197',
  '#DBCFB0',
  '#545775',
];

export default function DoughnutMemberChart(props: any) {
  const { chartData, chartLabels } = props;
  const data = {
    maintainAspectRatio: false,
    responsive: false,
    labels: chartLabels ? chartLabels : ['a', 'b', 'c'],
    datasets: [
      {
        data: chartData ? chartData : [70, 80, 70],
        backgroundColor: ['#007142', '#00DE8E', '#1D472E', '#2EFFB4', '#BD9A68', '#C75227', '#B0B6AF'],
        display: true,
        borderWidth: 0,
        hoverOffset: 15,
        hoverBorderWidth: 0,
      },
    ],
  };

  const options = {
    layout: {
      padding: 15,
    },
    responsive: true,
    scales: {
      y: {
        display: false, // Hide Y axis labels
      },
      x: {
        display: false, // Hide X axis labels
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
    },
  };


  return (
    <div className="App">
      <div className="doughnutChart-Wrapper" style={{ position: 'relative' }}>
        <Doughnut className="doughnutChart" data={data} options={options} />
      </div>
    </div>
  );
}

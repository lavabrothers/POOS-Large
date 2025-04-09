
import { JSX } from 'react';
import Chart from 'react-apexcharts';
import { Typography } from '@mui/material';

// Define the props interface for type safety
interface DividendsChartProps {
  dates: string[];
  values: number[];
}

// Define the component using React.FC for type safety
function Chart_Dividends({ dates, values }: DividendsChartProps): JSX.Element {


    return (
    <>
    <Typography variant="h5">Dividends</Typography>
    <Chart 
    options={{
      chart: { id: 'dividends', type:'bar',zoom: { enabled: true, type: 'x' },
      toolbar: {
        show: true,
        autoSelected: 'zoom',
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      }
    },
    xaxis: { type: 'datetime',categories: dates, title: { text: 'Date', style: {color: '#fff'}},  labels:{style:{colors: '#fff'}}},
    yaxis: { labels:{style:{colors: '#fff'}}},
    dataLabels: { enabled: false },
    tooltip: {theme: 'dark'},
    plotOptions: { bar: { horizontal: false, columnWidth: '55%' } }}}
    series={[{ name: 'Dividend', data: values }]}
    type="bar"
    minwidth="100%"
    minheight="100%"
  />
  </>
  );
};

export default Chart_Dividends;

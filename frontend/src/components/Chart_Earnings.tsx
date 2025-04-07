
import { JSX } from 'react';
import Chart from 'react-apexcharts';
import { Typography } from '@mui/material';

// Define the props interface for type safety
interface EarningsChartProps {
  dates: string[];
  values: number[];
}

// Define the component using React.FC for type safety
function Chart_Earnings({ dates, values }: EarningsChartProps): JSX.Element {


    return (
    <>
    <Typography variant="h5">Earnings (Reported EPS)</Typography>
          <Chart 
            options={{
              chart: { id: 'earnings' },
              xaxis: { 
                categories: dates, 
                title: { text: 'Fiscal Date Ending', style: {color: '#fff',}},
                labels:{style:{colors: '#fff'}}
               },

              yaxis: { 
             
                labels:{style:{colors: '#fff'}}
              },

              dataLabels: { enabled: false },
              stroke: { curve: 'smooth' },
              legend: { position: 'bottom', labels:{colors: ['#ffffff']}},
              tooltip: {
                theme: 'dark',
              },
              
              
            }}
            series={[{ name: 'Reported EPS', data: values }]}
            type="line"
            width={1000}
            height={300}
          />
    </>
  );
};

export default Chart_Earnings;

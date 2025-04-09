
import { JSX } from 'react';
import Chart from 'react-apexcharts';
import { Typography } from '@mui/material';

// Define the props interface for type safety
interface IncomeStatementChartProps {
  dates: string[];
  values: number[];
}

// Define the component using React.FC for type safety
function Chart_IncomeStatement({ dates, values }: IncomeStatementChartProps): JSX.Element {


    return (
    <>
    <Typography variant="h5">Income Statement (Net Income)</Typography>
          <Chart 
            options={{
              chart: { id: 'income-statement' },
              xaxis: { 
                categories: dates, 
                title: { text: 'Fiscal Date Ending',style: {color: '#fff'} },
                labels:{style:{colors: '#fff'}}
             },

              yaxis: { title: { text: 'Net Income', style: {color: '#fff'} },
              labels:{style:{colors: '#fff'}}
            },
              dataLabels: { enabled: false },
              stroke: { curve: 'smooth' },
              tooltip: {
                theme: 'dark'
              }
            }}
            series={[{ name: 'Net Income', data: values }]}
            type="line"
           minwidth="100%"
           minheight="100%"
          />
  </>
  );
};

export default Chart_IncomeStatement;

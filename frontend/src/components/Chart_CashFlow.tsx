
import { JSX } from 'react';
import Chart from 'react-apexcharts';
import { Typography } from '@mui/material';

// Define the props interface for type safety
interface CashFlowChartProps {
  dates: string[];
  operatingCF: number[];
  financingCF: number [];
}

// Define the component using React.FC for type safety
function Chart_CashFlow({ dates, operatingCF, financingCF}: CashFlowChartProps): JSX.Element {

    


    return (
    <>
    <Typography variant="h5">Cash Flow (Operating vs. Financing)</Typography>
          <Chart 
            options={{
              chart: { 
                id: 'cash-flow-bar', 
                type:'bar',
                zoom: { enabled: true, type: 'x' }, 
                toolbar: { show: true, autoSelected: 'zoom' } },
              xaxis: { 
                type:'datetime',
                categories: dates, 
                title: { text: 'Fiscal Date Ending',style: {color: '#fff'} },
                labels:{style:{colors: '#fff'}}
                
              },
              yaxis: { labels:{style:{colors: '#fff'}} },
              dataLabels: { enabled: false },
              plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
              legend: { 
                position: 'bottom',
                labels: {
                colors: ['#fff', '#fff']
                
              }},
              colors: ['#007bff', '#ff0000'],
              tooltip: {
                theme: 'dark'
              }
            }}
            series={[
              { name: 'Operating Cash Flow', data: operatingCF},
              { name: 'Financing Cash Flow', data: financingCF}
            ]}
            type="bar"
            width={500}
            height={300}
          />
  </>
  );
};

export default Chart_CashFlow;

import { JSX } from 'react';
import Chart from 'react-apexcharts';
import { Typography } from '@mui/material';

export interface BalanceSheetEntry {
    fiscalDateEnding: string;
    totalAssets: string | number;
    cashAndShortTermInvestments?: string | number;
    inventory?: string | number;
    propertyPlantEquipment?: string | number;
    longTermInvestments?: string | number;
    goodwill?: string | number;
    intangibleAssets?: string | number;
  }

interface BalanceSheetChartProps {
    balanceSheet: BalanceSheetEntry;
  }

  function Chart_BalanceSheet({ balanceSheet }: BalanceSheetChartProps): JSX.Element {
  
  // ----- Balance Sheet Pie Chart Breakdown -----
  const parseValue = (val: any) => (val && val !== "None" ? Number(val) : 0);
  const cash = parseValue((balanceSheet as any).cashAndShortTermInvestments);
  const inventory = parseValue((balanceSheet as any).inventory);
  const ppe = parseValue((balanceSheet as any).propertyPlantEquipment);
  const longTermInv = parseValue((balanceSheet as any).longTermInvestments);
  const goodwill = parseValue((balanceSheet as any).goodwill);
  const intangible = parseValue((balanceSheet as any).intangibleAssets);
  const totalAssets = parseValue(balanceSheet.totalAssets);
  const usedAssets = cash + inventory + ppe + longTermInv + goodwill + intangible;
  const otherAssets = Math.max(totalAssets - usedAssets, 0);

  const balanceSheetLabels = [
    "Cash & Short-Term",
    "Inventory",
    "PPE",
    "Long-Term Inv.",
    "Goodwill",
    "Intangible",
    "Other Assets"
  ];
  const balanceSheetValues = [
    cash,
    inventory,
    ppe,
    longTermInv,
    goodwill,
    intangible,
    otherAssets
  ];
      return (
      <>
      <Typography variant="h5">Balance Sheet Breakdown (Total Assets)</Typography>
      <Chart 
      options={{
        labels: balanceSheetLabels,
        dataLabels: { enabled: true },
        legend: { 
            position: 'bottom',
            labels: {
                colors: ['#fff', '#fff','#fff', '#fff','#fff', '#fff','#fff']
            }
        },
        tooltip: { 
            theme: 'dark',
            y: { formatter: (val: number) => `${val}` } ,
        },
    }}
    series={balanceSheetValues}
    type="pie"
    width={500}
    height={300}
    />
    </>
     );
    };
  
  export default Chart_BalanceSheet;
  
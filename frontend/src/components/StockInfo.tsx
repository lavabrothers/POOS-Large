import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Box, Button, Typography, Grid } from '@mui/material';


interface StockData {
  symbol: string;
  dividends: Array<{ ex_dividend_date: string; amount: number }>;
  incomeStatements: Array<{ fiscalDateEnding: string; netIncome: number }>;
  balanceSheets: Array<{ fiscalDateEnding: string; totalAssets: number }>;
  cashFlows: Array<{ fiscalDateEnding: string; netIncome: number }>;
  earnings: Array<{ fiscalDateEnding: string; reportedEPS: string }>;
}

function StockInfo({ stockSymbol }: { stockSymbol: string }) {
  // Retrieve user data
  let name = "";
  if(name){ //empty function to get rid of errors.

  }
  const userString = localStorage.getItem('user_data');
  let user: any;
  if (userString && userString !== "") {
    user = JSON.parse(userString);
    name = user.firstName;
  } else {
    window.location.href = '/';
    return <div></div>;
  }

  function goToHome() {
    window.location.href = '/home';
  }

  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stockSymbol) return;
    setLoading(true);
    setError(null);
    fetch(`http://134.122.3.46:3000/api/stocks/${stockSymbol}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setStockData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [stockSymbol]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!stockData) return <p>No stock data available.</p>;

  // For Dividends
  const sortedDividends = [...stockData.dividends].sort(
    (a, b) => new Date(a.ex_dividend_date).getTime() - new Date(b.ex_dividend_date).getTime()
  );
  const dividendDates = sortedDividends.map(item => item.ex_dividend_date);
  const dividendValues = sortedDividends.map(item => item.amount);

  // For Income Statements (Net Income)
  const sortedIncomeStatements = [...stockData.incomeStatements].sort(
    (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
  );
  const incomeDates = sortedIncomeStatements.map(item => item.fiscalDateEnding);
  const incomeValues = sortedIncomeStatements.map(item => item.netIncome);

  // For Balance Sheets (Total Assets) – using the latest balance sheet for a pie chart breakdown
  const sortedBalanceSheets = [...stockData.balanceSheets].sort(
    (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
  );
  const latestBalanceSheet = sortedBalanceSheets[sortedBalanceSheets.length - 1];

  // For Earnings (Reported EPS)
  const sortedEarnings = [...stockData.earnings].sort(
    (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
  );
  const earningsDates = sortedEarnings.map(item => item.fiscalDateEnding);
  const earningsValues = sortedEarnings.map(item => parseFloat(item.reportedEPS));

  // ----- Balance Sheet Pie Chart Breakdown -----
  const parseValue = (val: any) => (val && val !== "None" ? Number(val) : 0);
  const cash = parseValue((latestBalanceSheet as any).cashAndShortTermInvestments);
  const inventory = parseValue((latestBalanceSheet as any).inventory);
  const ppe = parseValue((latestBalanceSheet as any).propertyPlantEquipment);
  const longTermInv = parseValue((latestBalanceSheet as any).longTermInvestments);
  const goodwill = parseValue((latestBalanceSheet as any).goodwill);
  const intangible = parseValue((latestBalanceSheet as any).intangibleAssets);
  const totalAssets = parseValue(latestBalanceSheet.totalAssets);
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

  // ----- Cash Flow Double Bar Chart Breakdown -----
  // We assume your cash flow object now includes additional fields for a breakdown:
  const sortedCashFlows = [...stockData.cashFlows].sort(
    (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
  );
  const cashFlowDates = sortedCashFlows.map(item => item.fiscalDateEnding);
  const parseValue2 = (val: any) => (val && val !== "None" ? Number(val) : 0);
  const operatingCFValues = sortedCashFlows.map(item => parseValue2((item as any).operatingCashflow));
  const financingCFValues = sortedCashFlows.map(item => parseValue2((item as any).cashflowFromFinancing));

  return (
    <Box id="stockinfoDiv" sx={{ padding: 2 }}>
      <Typography variant="h4">{stockData.symbol} Stock Data</Typography>
      {/* Top Row: Balance Sheet and Earnings */}
      <Grid container spacing={2} sx={{ mt: 10 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="h5">Balance Sheet Breakdown (Total Assets)</Typography>
          <Chart 
            options={{
              labels: balanceSheetLabels,
              dataLabels: { enabled: true },
              legend: { position: 'bottom' },
              tooltip: { y: { formatter: (val: number) => `${val}` } }
            }}
            series={balanceSheetValues}
            type="pie"
            width={500}
            height={300}
            />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="h5">Earnings (Reported EPS)</Typography>
          <Chart 
            options={{
              chart: { id: 'earnings' },
              xaxis: { categories: earningsDates, title: { text: 'Fiscal Date Ending' } },
              yaxis: { title: { text: 'Reported EPS' } },
              dataLabels: { enabled: false },
              stroke: { curve: 'smooth' }
            }}
            series={[{ name: 'Reported EPS', data: earningsValues }]}
            type="line"
            width={1000}
            height={300}
          />
        </Grid>
      </Grid>

      {/* Bottom Row: Dividends, Income Statement, and Cash Flow */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="h5">Dividends</Typography>
          <Chart 
            options={{
              chart: { id: 'dividends' },
              xaxis: { categories: dividendDates, title: { text: 'Date' } },
              yaxis: { title: { text: 'Dividend' } },
              dataLabels: { enabled: false },
              plotOptions: { bar: { horizontal: false, columnWidth: '55%' } }
            }}
            series={[{ name: 'Dividend', data: dividendValues }]}
            type="bar"
            width={500}
            height={300}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="h5">Income Statement (Net Income)</Typography>
          <Chart 
            options={{
              chart: { id: 'income-statement' },
              xaxis: { categories: incomeDates, title: { text: 'Fiscal Date Ending' } },
              yaxis: { title: { text: 'Net Income' } },
              dataLabels: { enabled: false },
              stroke: { curve: 'smooth' }
            }}
            series={[{ name: 'Net Income', data: incomeValues }]}
            type="line"
            width={500}
            height={300}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography variant="h5">Cash Flow (Operating vs. Financing)</Typography>
          <Chart 
            options={{
              chart: { id: 'cash-flow-bar', zoom: { enabled: true, type: 'x' }, toolbar: { show: true, autoSelected: 'zoom' } },
              xaxis: { categories: cashFlowDates, title: { text: 'Fiscal Date Ending' } },
              yaxis: { title: { text: 'Cash Flow' } },
              dataLabels: { enabled: false },
              plotOptions: { bar: { horizontal: false, columnWidth: '55%' } },
              legend: { position: 'bottom' },
              colors: ['#007bff', '#ff0000']
            }}
            series={[
              { name: 'Operating Cash Flow', data: operatingCFValues },
              { name: 'Financing Cash Flow', data: financingCFValues }
            ]}
            type="bar"
            width={500}
            height={300}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StockInfo;

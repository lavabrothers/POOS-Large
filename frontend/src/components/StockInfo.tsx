import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Box, Button, Typography } from '@mui/material';

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

// For Income Statements (e.g., Revenue)
const sortedIncomeStatements = [...stockData.incomeStatements].sort(
  (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
);
const incomeDates = sortedIncomeStatements.map(item => item.fiscalDateEnding);
const incomeValues = sortedIncomeStatements.map(item => item.netIncome);

// For Balance Sheets (e.g., Total Assets)
const sortedBalanceSheets = [...stockData.balanceSheets].sort(
  (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
);
const balanceDates = sortedBalanceSheets.map(item => item.fiscalDateEnding);
const balanceValues = sortedBalanceSheets.map(item => item.totalAssets);

// For Cash Flows (e.g., Operating Cash Flow)
const sortedCashFlows = [...stockData.cashFlows].sort(
  (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
);
const cashFlowDates = sortedCashFlows.map(item => item.fiscalDateEnding);
const cashFlowValues = sortedCashFlows.map(item => item.netIncome);

// For Earnings (Reported EPS)
const sortedEarnings = [...stockData.earnings].sort(
  (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
);
const earningsDates = sortedEarnings.map(item => item.fiscalDateEnding);
const earningsValues = sortedEarnings.map(item => parseFloat(item.reportedEPS));

console.log('Dividends:', stockData.dividends);
console.log('Income Statements:', stockData.incomeStatements);
console.log('Cash Flows:', stockData.cashFlows);


  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4">{stockData.symbol} Stock Data</Typography>
      <Button onClick={goToHome}>Home</Button>


      {/* Dividends Chart */}
      <Typography variant="h5" sx={{ mt: 4 }}>Dividends</Typography>
      <Chart 
        options={{
          chart: { id: 'dividends' },
          xaxis: { categories: dividendDates, title: { text: 'Date' } },
          yaxis: { title: { text: 'Dividend' } },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth' },
        }}
        series={[{ name: 'Dividend', data: dividendValues }]}
        type="line"
        height={300}
      />

      {/* Income Statement Chart */}
      <Typography variant="h5" sx={{ mt: 4 }}>Income Statement (Net Income)</Typography>
      <Chart 
        options={{
          chart: { id: 'income-statement' },
          xaxis: { categories: incomeDates, title: { text: 'Fiscal Date Ending' } },
          yaxis: { title: { text: 'Net Income' } },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth' },
        }}
        series={[{ name: 'Revenue', data: incomeValues }]}
        type="line"
        height={300}
      />

      {/* Balance Sheet Chart */}
      <Typography variant="h5" sx={{ mt: 4 }}>Balance Sheet (Total Assets)</Typography>
      <Chart 
        options={{
          chart: { id: 'balance-sheet' },
          xaxis: { categories: balanceDates, title: { text: 'Fiscal Date Ending' } },
          yaxis: { title: { text: 'Total Assets' } },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth' },
        }}
        series={[{ name: 'Total Assets', data: balanceValues }]}
        type="line"
        height={300}
      />

      {/* Cash Flow Chart */}
      <Typography variant="h5" sx={{ mt: 4 }}>Cash Flow (Operating Cash Flow)</Typography>
      <Chart 
        options={{
          chart: { id: 'cash-flow' },
          xaxis: { categories: cashFlowDates, title: { text: 'Fiscal Date Ending' } },
          yaxis: { title: { text: 'Operating Cash Flow' } },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth' },
        }}
        series={[{ name: 'Operating Cash Flow', data: cashFlowValues }]}
        type="line"
        height={300}
      />

      {/* Earnings Chart */}
      <Typography variant="h5" sx={{ mt: 4 }}>Earnings (Reported EPS)</Typography>
      <Chart 
        options={{
          chart: { id: 'earnings' },
          xaxis: { categories: earningsDates, title: { text: 'Fiscal Date Ending' } },
          yaxis: { title: { text: 'Reported EPS' } },
          dataLabels: { enabled: false },
          stroke: { curve: 'smooth' },
        }}
        series={[{ name: 'Reported EPS', data: earningsValues }]}
        type="line"
        height={300}
      />
    </Box>
  );
}

export default StockInfo;

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, Link,} from '@mui/material';
import Chart_Earnings from './Chart_Earnings';
import Chart_BalanceSheet, { BalanceSheetEntry } from './Chart_BalanceSheet';
import Chart_Dividends from './Chart_Dividends';
import Chart_IncomeStatements from './Chart_IncomeStatements';
import Chart_CashFlow from './Chart_CashFlow';



interface StockData {
  symbol: string;
  dividends: Array<{ ex_dividend_date: string; amount: number }>;
  incomeStatements: Array<{ fiscalDateEnding: string; netIncome: number }>;
  balanceSheets: Array<{ fiscalDateEnding: string; totalAssets: number }>;
  cashFlows: Array<{ fiscalDateEnding: string; netIncome: number }>;
  earnings: Array<{ fiscalDateEnding: string; reportedEPS: string }>;
}
interface stockDataDescription {
  ticker: string;
  'company name': string;
  'short name': string;
  industry: string;
  description: string;
  website: string;
  logo: string;
  ceo: string;
  exchange: string;
  'market cap': number;
  sector: string;
  'tag 1': string;
  'tag 2': string;
  'tag 3': string;
}

function StockLogo({ symbol }: { symbol: string }) {
  const [imgSrc, setImgSrc] = useState(`../logos/${symbol}.jpg`);

  const handleImageError = () => {
    setImgSrc(`../images/logos/${symbol}.png`);
  };
  return (
    <img
      src={imgSrc}
      alt={`${symbol} Logo`}
      width="64"
      height="64"
      onError={handleImageError}
    />
  );
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

  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [error, setError] = useState<string | null>(null);

  
  const [stockDescription, setStockDescription] = useState<stockDataDescription | null>(null);
  //const stockLogo = `logos/${stockSymbol}.jpg`;
  const [loadingDesc, setLoadingDesc] = useState(true);

  useEffect(() => {
    if (!stockSymbol) return;
    if(loadingDesc){
       
    }
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
      fetch(`http://134.122.3.46:3000/api/stockInfo/?ticker=${stockSymbol}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setStockDescription(data);
        setLoadingDesc(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoadingDesc(false);
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



  // ----- Cash Flow Double Bar Chart Breakdown -----
  // We assume your cash flow object now includes additional fields for a breakdown:
  const sortedCashFlows = [...stockData.cashFlows].sort(
    (a, b) => new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
  );
  const cashFlowDates = sortedCashFlows.map(item => item.fiscalDateEnding);
  const parseValue2 = (val: any) => (val && val !== "None" ? Number(val) : 0);
  const operatingCFValues = sortedCashFlows.map(item => parseValue2((item as any).operatingCashflow));
  const financingCFValues = sortedCashFlows.map(item => parseValue2((item as any).cashflowFromFinancing));

  // Stock description and logo



  return (
    <Box
    id="stockinfoDiv"

    sx={{ 
      padding: 2, 
      bgcolor: 'background.paper', 
      color: 'text.primary',
      minwidth: '100%', 
      minHeight: '100vh',
      border: '2px solid #404040', }}


    >
      <Box
        display="flex"
        flexDirection="row" 
        justifyContent="center"
        alignItems={"center"}
        position={"relative"}>
        <Typography variant="h4">{stockData.symbol} Stock Data</Typography>
          <Box sx={{ ml: 2,
            position: 'absolute',
            top: "50%",
            right: 0,
            m:1,
            transform: 'translateY(-50%)',
           }}>
            <StockLogo symbol={stockData.symbol} />
          </Box>
      </Box>
      
      

      <Link href={stockDescription?.website} target="_blank" variant="h6">{stockDescription?.['company name']}</Link>
      <Typography variant="body1">{stockDescription?.description}</Typography>  

{/*-----------------Top Row: Balance Sheet and Earnings----------------------*/}
      {/* Balance Sheet  */}
      <Grid container spacing={0.5} sx={{ mt: 10 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
         <Chart_BalanceSheet balanceSheet={latestBalanceSheet as BalanceSheetEntry} />
        </Grid>

      {/* Earnings */}
        <Grid size={{ xs: 24, sm: 6, md: 7 }}>
          <Chart_Earnings dates={earningsDates} values={earningsValues} />
        </Grid>
      </Grid><br/><br/>

{/*----------------Bottom Row: Dividends, Income Statement, and Cash Flow---------------*/}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Dividends */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
         <Chart_Dividends dates={dividendDates} values={dividendValues} />
        </Grid>

        {/* Income Statement */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
         <Chart_IncomeStatements dates={incomeDates} values={incomeValues} />
        </Grid>

        {/* Cash Flow */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <Chart_CashFlow dates={cashFlowDates} operatingCF={operatingCFValues}  financingCF={financingCFValues} 
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StockInfo;

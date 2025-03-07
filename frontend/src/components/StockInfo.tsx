// Testing API

import { useState, useEffect } from 'react';

interface StockData {
  symbol: string;
  dividends: any;
  incomeStatement: any;
  balanceSheet: any;
  cashFlow: any;
  earnings: any;
}

function StockInfo({ stockSymbol }: { stockSymbol: string }) {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stockSymbol) return;
    setLoading(true);
    setError(null);
    fetch(`/api/stocks/${stockSymbol}`)
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
  if (!stockData) return <p>Enter a stock symbol to see data.</p>;

  return (
    <div>
      <h2>{stockData.symbol} Stock Data</h2>
      {/* Render the data as needed, e.g.: */}
      <p>Latest Annual EPS: {stockData.earnings?.annualEarnings?.[0]?.reportedEPS}</p>
      {/* ...other UI elements to display dividends, financials, etc... */}
    </div>
  );
}

export default StockInfo;

// StockCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import Chart from 'react-apexcharts';

interface Earnings {
  fiscalDateEnding: string;
  reportedEPS: string;
}

interface Stock {
  symbol: string;
  name?: string; //optional until the stock api returns the stock name
}

interface StockCardProps {
  stock: Stock;
  onAddFavorite?: (stock: Stock) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onAddFavorite }) => {
  //we need usestates so that we can track whether or not our API is working.
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const response = await fetch(`http://134.122.3.46:3000/api/stocks/${stock.symbol}`); //TODO: this should be an environment variable and not hard coded
        if (!response.ok) {
          throw new Error(`Unable to fetch earnings for ${stock.symbol}`);
        }
        const data = await response.json();
        setEarnings(data.earnings); // passing the json response to the earnings array
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEarnings();
  }, [stock.symbol]);

  //sort earnings by fiscalDateEnding (ascending) to display chronologically. This may not be necessary since earnings are already returned chronologically
  const sortedEarnings = earnings.slice().sort(
    (a, b) =>
      new Date(a.fiscalDateEnding).getTime() - new Date(b.fiscalDateEnding).getTime()
  );
  const categories = sortedEarnings.map(e => e.fiscalDateEnding);
  const epsData = sortedEarnings.map(e => parseFloat(e.reportedEPS));

  const chartOptions = {
    chart: {
      id: 'earnings-chart',
      toolbar: { show: false }
    },
    xaxis: {
      categories: categories,
      title: { text: 'Fiscal Date Ending' }
    },
    yaxis: {
      title: { text: 'Reported EPS' }
    },
    stroke: {
      curve: "smooth" as "smooth"
    },
    dataLabels: { enabled: false }
  };

  const series = [
    {
      name: 'Reported EPS',
      data: epsData
    }
  ];

  return (
    <Card sx={{ minWidth: 275, margin: 2 }}>
      <CardContent>
        <Typography variant="h5">
          {stock.symbol} {stock.name ? `- ${stock.name}` : ''}
        </Typography>
        {loading && <Typography>Loading earnings...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && earnings.length > 0 && (
          <Chart options={chartOptions} series={series} type="line" height={200} />
        )}
        <Button
          onClick={() => onAddFavorite && onAddFavorite(stock)}
          variant="contained"
          sx={{ mt: 2 }}
          >
          Add to Favorites
        </Button>
      </CardContent>
    </Card>
  );
};

export default StockCard;

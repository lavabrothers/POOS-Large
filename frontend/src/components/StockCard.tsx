import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import Chart from 'react-apexcharts';
import Chart_Earnings from './Chart_Earnings';

interface Earnings {
  fiscalDateEnding: string;
  reportedEPS: string;
}

interface Stock {
  symbol: string;
  name?: string;
}

interface StockCardProps {
  stock: Stock;
  onAddFavorite?: (stock: Stock) => void;
  onRemoveFavorite?: (stock: Stock) => void;
  onSymbolClick?: (stock: Stock) => void;
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  onAddFavorite,
  onRemoveFavorite,
  onSymbolClick,
}) => {
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        const response = await fetch(`http://134.122.3.46:3000/api/stocks/${stock.symbol}`);
        if (!response.ok) {
          throw new Error(`Unable to fetch earnings for ${stock.symbol}`);
        }
        const data = await response.json();
        setEarnings(data.earnings);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEarnings();
  }, [stock.symbol]);

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
      labels:{style:{colors: '#fff'}},
      title: { text: 'Fiscal Date Ending', style: {color: '#fff',}},
    },
    yaxis: {
      title: { text: 'Reported EPS', style: {color: '#fff',}},
      labels:{style:{colors: '#fff'}}
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
        <Typography variant="h6">
          {onSymbolClick ? (
            <Button 
              onClick={() => onSymbolClick(stock)}
              variant="contained"
              sx={{ mt: 2 }}
              >
          
              {stock.name + ' (' + stock.symbol + ')'}
            </Button>
          ) : (
            stock.symbol
          )}
        </Typography>
        {loading && <Typography>Loading earnings...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && !error && earnings.length > 0 && (
          <Chart options={chartOptions} series={series} type="line" height={200} />
        )}
        {onAddFavorite && (
          <Button
            onClick={() => onAddFavorite(stock)}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add to Favorites
          </Button>
        )}
        {onRemoveFavorite && (
          <Button
            onClick={() => onRemoveFavorite(stock)}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Remove from Favorites
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StockCard;

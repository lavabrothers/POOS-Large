import StockInfo from '../components/StockInfo.tsx';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import Logo from '../components/Logo.tsx';

function StockInfoPage() {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <div>No stock symbol provided.</div>;
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.default', // uses dark theme background
        color: 'text.primary',         // uses dark theme text color
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Logo />
      <StockInfo stockSymbol={symbol} />
    </Box>
  );
}

export default StockInfoPage;

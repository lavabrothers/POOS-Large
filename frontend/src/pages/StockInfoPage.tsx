import StockInfo from '../components/StockInfo.tsx';
import { useParams } from 'react-router-dom';


function StockInfoPage() {
  const { symbol } = useParams<{ symbol: string }>();

  if (!symbol) {
    return <div>No stock symbol provided.</div>;
  }

  return (
    <div>
      <h1>Stock Details</h1>
      <StockInfo stockSymbol={symbol} />
    </div>
  );
}

export default StockInfoPage;


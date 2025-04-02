import React, { useState, useEffect } from 'react';
import { Grid, Typography, Button, Box, Grow } from '@mui/material';
import StockCard from './StockCard';

function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user
  const userString = localStorage.getItem('user_data');
  let user: any = null;
  let name = "";

  if (userString && userString !== "") {
    user = JSON.parse(userString);
    name = user.firstName;
  } else {
    window.location.href = '/';
    return <Box></Box>;
  }

  function goToHome() {
    window.location.href = '/home';
  }

  // Function to navigate to the stock info page when the symbol is clicked
  function goToStockInfoPage (stock: { symbol: string }) {
    window.location.href = `/stocks/${stock.symbol}`;
  };

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch(`http://134.122.3.46:3000/api/favorites/search?userId=${user._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        setFavorites(data.stocks);
      } catch (err: any) {
        console.error("Error fetching favorites:", err);
        setError("Error fetching favorites");
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, [user._id]);

  // Remove favorite
  const removeFavorite = async (stock: { symbol: string }) => {
    try {
      const response = await fetch('http://134.122.3.46:3000/api/favorites/remove', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, symbol: stock.symbol })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error removing favorite');
      }
      setFavorites(prev => prev.filter(f => f.symbol !== stock.symbol));
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove favorite.");
    }
  };

  if (loading) return <Box>Loading favorites...</Box>;
  if (error) return <Box>{error}</Box>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ textDecoration: 'underline' }}>
        Favorites
      </Typography>
      <Typography variant="h6">Hello Again, {name}!</Typography>
      <Button onClick={goToHome} variant="contained" sx={{ my: 2 }}>
        Home
      </Button>

      <Grow in={!loading}>
        <Grid container spacing={2}>
          {favorites.length > 0 ? (
            favorites.map((fav) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fav.symbol}>
                <StockCard
                  stock={fav}
                  onRemoveFavorite={removeFavorite}
                  onSymbolClick={goToStockInfoPage} // pass the symbol click handler
                />
              </Grid>
            ))
          ) : (
            <Grid size ={12}>
              <Typography>No favorites added.</Typography>
            </Grid>
          )}
        </Grid>
      </Grow>
    </Box>
  );
}

export default Favorites;


import React, { useState, useEffect } from 'react';
import { Grid, Typography, Box, Grow, TextField } from '@mui/material';
import StockCard from './StockCard';


function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Retrieve user data from localStorage
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

  // Function to navigate to the stock info page when the symbol is clicked
  function goToStockInfoPage(stock: { symbol: string }) {
    window.location.href = `/stocks/${stock.symbol}`;
  }

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch(`http://134.122.3.46:3000/api/favorites/search?userId=${user._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        for (const fav of data.stocks) {
          if (fav.name == undefined || fav.name == 'test') {
            const response = await fetch(`http://134.122.3.46:3000/api/stockInfo?ticker=${fav.symbol}`)
            var res = JSON.parse(await response.text())
            fav.name = res['short name']
          }
        }
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

  // Handler for search bar
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter favorites based on search query (case-insensitive)
  const filteredFavorites = favorites.filter(fav =>
    fav.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <Box 
      id="favoritesDiv"
      sx={{
        padding: 2,
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Typography variant="h6">Hello Again, {name}!</Typography>
      
      <TextField
        fullWidth
        placeholder="Search Favorites (Symbols)..."
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{
          mb: 2,
          borderRadius: '50px',
          '& .MuiOutlinedInput-root': {
            borderRadius: '50px',
          },
        }}
      />

      <Grow in={!loading}>
        <Grid container spacing={2}>
          {filteredFavorites.length > 0 ? (
            filteredFavorites.map((fav) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={fav.symbol}>
                <StockCard
                  stock={fav}
                  onRemoveFavorite={removeFavorite}
                  onSymbolClick={goToStockInfoPage}
                />
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} >
              <Typography>No favorites match your search.</Typography>
            </Grid>
          )}
        </Grid>
      </Grow>
    </Box>
  );
}

export default Favorites;

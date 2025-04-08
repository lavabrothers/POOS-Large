
import React, { useState, useEffect } from 'react';
import { Grid, Typography,  Box, Grow, TextField, Button } from '@mui/material';
import StockCard from './StockCard';

function Home() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingFavorite, setAddingFavorite] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newStockStatus, setNewStockStatus] = useState<number | null>(null)

  // Retrieve user data from localStorage
  let name: string = "";
  const userString = localStorage.getItem('user_data');
  let user: any;
  if(addingFavorite){ //we gotta keep this in to get rid of a stupid error. 
    
  }

  if (userString && userString !== "") {
    user = JSON.parse(userString);
    name = user.firstName;
  } else {
    window.location.href = '/';
    return <Box></Box>;
  }

  // Function to navigate to the stock's detail page
  function goToStockInfoPage(stock: { symbol: string }) {
    window.location.href = `/stocks/${stock.symbol}`;
  }

  // Add a stock to the database
  async function addNew() : Promise<void> {
    const response = await fetch(`http://134.122.3.46:3000/api/stocks/${searchQuery}`)
    setNewStockStatus(response.status)
    if(response.status == 200) {
      const response = await fetch(`http://134.122.3.46:3000/api/stockInfo?ticker=${searchQuery}`)
      var res = JSON.parse(await response.text())
      var newStocks = stocks
      newStocks.push({symbol : searchQuery, name : res['short name']})
      setStocks(newStocks);
      
      window.location.reload();
    }
    else setNewStockStatus(response.status)
  }

  function signOut() : void {
    localStorage.setItem('user_data', '')
    window.location.href = '/'
  }

  // Fetch all stocks and the user's favorites, then filter out favorites from the list
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all stocks
        const stocksResponse = await fetch('http://134.122.3.46:3000/api/stocks');
        if (!stocksResponse.ok) {
          throw new Error(`Stocks API error: ${stocksResponse.status}`);
        }
        const stocksData = await stocksResponse.json();

        // Fetch user's favorites using the search endpoint
        const favResponse = await fetch(`http://134.122.3.46:3000/api/favorites/search?userId=${user._id}`);
        let favoriteSymbols = new Set<string>();
        if (favResponse.ok) {
          const favData = await favResponse.json();
          // Expecting favData to have a "stocks" array
          favoriteSymbols = new Set(
            favData.stocks.map((fav: { symbol: string }) => fav.symbol)
          );
        } else if (favResponse.status === 404) {
          console.warn('No favorites found for this user.');
        } else {
          throw new Error(`Favorites API error: ${favResponse.status}`);
        }

        // Filter out stocks that are already favorited
        const filteredStocks = stocksData.filter((stock: { symbol: string }) => !favoriteSymbols.has(stock.symbol));
        setStocks(filteredStocks);
        for (const st of filteredStocks) {
          const response = await fetch(`http://134.122.3.46:3000/api/stockInfo?ticker=${st.symbol}`)
          var res = JSON.parse(await response.text())
          st.name = res['short name']
        }
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Error fetching stocks");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user._id]);

  // Handler for search bar
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setNewStockStatus(null)
  };

  // Filter stocks based on search query (case-insensitive)
  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to add a stock to favorites
  const addFavorite = async (stock: { symbol: string; name?: string }) => {
    setAddingFavorite(true);
    setAddError(null);
    try {
      const response = await fetch('http://134.122.3.46:3000/api/favorites/add', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id,
          symbol: stock.symbol,
          stockName: stock.name || "test" // in case you have a name field
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error adding favorite');
      }
      // Remove the added stock from the displayed list
      setStocks(prev => prev.filter(s => s.symbol !== stock.symbol));
    } catch (err: any) {
      console.error("Error adding favorite:", err);
      setAddError("Error adding favorite: " + err.message);
    } finally {
      setAddingFavorite(false);
    }
  };

  if (loading) return <Box>Loading stocks...</Box>;
  if (error) return <Box>{error}</Box>;

  return (
    <Box
      id="homeDiv"
      sx={{
        padding: 2,
        bgcolor: 'background.default', 
        color: 'text.primary',         
      }}
    >

      <Typography variant="h4">Welcome Home, {name}!</Typography>
      <Button onClick={signOut} variant="contained"  sx={{ my: 2 }}>
        Sign Out
      </Button>
      
      {addError && <Typography color="error">{addError}</Typography>}

      <TextField
        fullWidth
        placeholder="Search stocks (Symbols)..."
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
          {filteredStocks.length > 0 ? (
            filteredStocks.map((stock) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stock.symbol}>
                <StockCard
                  stock={stock}
                  onAddFavorite={addFavorite}
                  onSymbolClick={goToStockInfoPage}
                />
              </Grid>
            ))
          ) : (
            <Typography>Stock not found.</Typography>
          )}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button onClick={addNew} variant="contained"  sx={{ my: 2 }}>
              Stock not found? Click here to add.
            </Button>
          </Grid>
          {newStockStatus == 429 ? (
            <Typography>Stock could not be added. AlphaVantage API limit reached.</Typography>
          ) : newStockStatus == 404 ? (
            <Typography>Stock could not be added. Requested symbol could not be found.</Typography>
          ) : <></>}
          
        </Grid>
        
      </Grow>
    </Box>
  );
}

export default Home;


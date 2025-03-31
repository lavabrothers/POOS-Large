import React, { useState, useEffect } from 'react';

function Home() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingFavorite, setAddingFavorite] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Retrieve user data from localStorage
  let name: string = "";
  const userString = localStorage.getItem('user_data');
  let user: any;

  if (userString && userString !== "") {
    user = JSON.parse(userString);
    name = user.firstName;
  } else {
    window.location.href = '/';
    return <div></div>;
  }

  // Navigate to the Favorites page
  function goToFavorites(): void {
    window.location.href = '/favorites';
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
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError("Error fetching stocks");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user._id]);

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

  if (loading) return <div>Loading stocks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div id="homeDiv">
      <span id="inner-title">HOME</span>
      <h2>Welcome, {name}!</h2>
      <button onClick={goToFavorites}>Favorites</button>
      {addError && <p style={{ color: 'red' }}>{addError}</p>}
      <ul>
        {stocks.length > 0 ? (
          stocks.map((stock) => (
            <li key={stock.symbol}>
              {stock.symbol} {stock.name && `- ${stock.name}`}
              <button 
                onClick={() => addFavorite(stock)} 
                disabled={addingFavorite}
                style={{ marginLeft: '10px' }}
              >
                {addingFavorite ? "Adding..." : "Add to Favorites"}
              </button>
            </li>
          ))
        ) : (
          <li>No stocks available</li>
        )}
      </ul>
    </div>
  );
}

export default Home;

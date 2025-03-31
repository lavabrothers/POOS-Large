import React, { useState, useEffect } from 'react';

function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

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

  function goToHome(): void {
    window.location.href = '/home';
  }

  // Fetch favorites for this user using your favorites search endpoint
  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch(`http://134.122.3.46:3000/api/favorites/search?userId=${user._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        // Expecting data.stocks to be the favorites array
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

  // Function to remove a favorite stock
  const removeFavorite = async (symbol: string) => {
    setRemoving(true);
    setRemoveError(null);
    try {
      const response = await fetch('http://134.122.3.46:3000/api/favorites/remove', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id,
          symbol: symbol
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error removing favorite');
      }
      // Update the favorites list by filtering out the removed stock
      setFavorites(prev => prev.filter(fav => fav.symbol !== symbol));
    } catch (err: any) {
      console.error("Error removing favorite:", err);
      setRemoveError("Error removing favorite: " + err.message);
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <div>Loading favorites...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div id="favoritesDiv">
      <span id="inner-title">Favorites</span>
      <h2>Hello Again, {name}!</h2>
      <button onClick={goToHome}>Home</button>
      {removeError && <p style={{ color: 'red' }}>{removeError}</p>}
      <ul>
        {favorites.length > 0 ? (
          favorites.map((fav) => (
            <li key={fav.symbol}>
              {fav.stockName ? `${fav.stockName} - ` : ""}{fav.symbol}
              <button 
                onClick={() => removeFavorite(fav.symbol)}
                disabled={removing}
                style={{ marginLeft: '10px' }}
              >
                {removing ? "Removing..." : "Remove from Favorites"}
              </button>
            </li>
          ))
        ) : (
          <li>No favorites added.</li>
        )}
      </ul>
    </div>
  );
}

export default Favorites;

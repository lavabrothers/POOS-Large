import React, { useState, useEffect } from 'react';

function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    async function fetchFavorites() {
      try {
        // Using the favorites search endpoint to get all favorites for this user
        const response = await fetch(`http://134.122.3.46:3000/api/favorites/search?userId=${user._id}`);
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        // Expecting data to be an object with a "stocks" array
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

  if (loading) return <div>Loading favorites...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div id="favoritesDiv">
      <span id="inner-title">Favorites</span>
      <h2>Hello Again, {name}!</h2>
      <button onClick={goToHome}>Home</button>
      <ul>
        {favorites.length > 0 ? (
          favorites.map((fav) => (
            <li key={fav.symbol}>
              {fav.stockName ? `${fav.stockName} - ` : ""}{fav.symbol}
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

import React, { useState, useEffect } from 'react';

function Home() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Function to navigate to favorites page
  function goToFavorites(): void {
    window.location.href = '/favorites';
  }

  // Fetch the stock symbols from your API endpoint
  useEffect(() => {
    fetch('http://134.122.3.46:3000/api/stocks') //hard coded 
      .then((response) => response.json())
      .then((data) => {
        setStocks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stocks:", err);
        setError("Error fetching stocks");
        setLoading(false);
      });
  }, []);

  return (
    <div id="homeDiv">
      <span id="inner-title">HOME</span>
      <h2>Welcome, {name}!</h2>
      <button onClick={goToFavorites}>Favorites</button>

      {loading && <p>Loading stocks...</p>}
      {error && <p>{error}</p>}

      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>{stock.symbol}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;

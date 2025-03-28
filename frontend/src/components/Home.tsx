import React from 'react';

function Home() {
  let name: string = "";
  const userString = localStorage.getItem('user_data');
  let user: any;

  if (userString !== "" && userString !== null) {
    user = JSON.parse(userString);
    name = user.firstName;
  } else {
    window.location.href = '/';
    return <div></div>;
  }

  function goToFavorites(): void {
    window.location.href = '/favorites';
  }

  return (
    <div id="homeDiv">
      <span id="inner-title">HOME</span>
      <h2>Welcome, {name}!</h2>
      <button onClick={goToFavorites}>Favorites</button>
    </div>
  );
}

export default Home;

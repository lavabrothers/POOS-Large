import React from 'react';

function Favorites() {
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

  function goToHome(): void {
    window.location.href = '/home';
  }

  return (
    <div id="favoritesDiv">
      <span id="inner-title">Favorites</span>
      <h2>Hello Again, {name}!</h2>
      <button onClick={goToHome}>Home</button>
    </div>
  );
}

export default Favorites;

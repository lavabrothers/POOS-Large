import React, { useState } from 'react';

function Signup() {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  function handleUsernameChange (e: any ) : void 
  {
    setUsername(e.target.value);
  }

  function handleEmailChange (e: any ) : void
  {
    setEmail(e.target.value);
  }

  function handlePasswordChange (e: any ) : void
  {
    setPassword(e.target.value);
  }

  function handleFirstNameChange (e: any ) : void
  {
    setFirstName(e.target.value);
  }

  function handleLastNameChange (e: any ) : void
  {
    setLastName(e.target.value);
  }

  function goToOnBoard () : void
  {

    window.location.href = '/onboard';
  };

  async function doSignup(event: any) : Promise<void>
  {
    event.preventDefault();

    var obj = {
      username: username,
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
    };

    var js = JSON.stringify(obj);

    try {

      const response = await fetch('http://134.122.3.46:3000/api/signup', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }});

      var res = JSON.parse(await response.text());

      if (res.error) 
      {
        setMessage(res.error);
      } 
      else 
      {
        var user = res.user
        localStorage.setItem('user_data', JSON.stringify(user));

        setMessage('Signup successful!');

        goToOnBoard();

      }
    } 
    catch(error:any)
    {
        alert(error.toString());
        return;
    }    
  };

  return (
    <div id="signupDiv">
      <span id="inner-title">SIGN UP</span><br />
      <input type="text" id="username" placeholder="Username" 
        onChange={handleUsernameChange} /><br />

      <input type="email" id="email" placeholder="Email"
        onChange={handleEmailChange} /><br />

      <input type="password" id="password" placeholder="Password"
        onChange={handlePasswordChange} /><br />

      <input type="text" id="firstName" placeholder="First Name"
        onChange={handleFirstNameChange} /><br />

      <input type="text" id="lastName" placeholder="Last Name"
        onChange={handleLastNameChange} /> <br /><br />

      <button type="button" id="signupButton" className="buttons"
       onClick={doSignup}> Sign Up</button><br /><br />
       
      <span id="signupResult">{message}</span>
    </div>
  );
}

export default Signup;

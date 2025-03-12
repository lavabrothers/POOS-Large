import React, { useState } from 'react';

function Signup() {
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFirstName(e.target.value);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setLastName(e.target.value);
  };

  const goToLogin = (): void => {
    window.location.href = '/login';
  };

  async function doSignup(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    const obj = {
      username,
      email,
      password,
      firstName,
      lastName,
    };

    try {
      const response = await fetch('http://134.122.3.46:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.error) {
        setMessage(res.error);
      } else {
        setMessage('Signup successful!');
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  return (
    <div id="signupDiv">
      <span id="inner-title">SIGN UP</span>
      <br />
      <form onSubmit={doSignup}>
        <input
          type="text"
          id="username"
          placeholder="Username"
          onChange={handleUsernameChange}
        />
        <br />
        <input
          type="email"
          id="email"
          placeholder="Email"
          onChange={handleEmailChange}
        />
        <br />
        <input
          type="password"
          id="password"
          placeholder="Password"
          onChange={handlePasswordChange}
        />
        <br />
        <input
          type="text"
          id="firstName"
          placeholder="First Name"
          onChange={handleFirstNameChange}
        />
        <br />
        <input
          type="text"
          id="lastName"
          placeholder="Last Name"
          onChange={handleLastNameChange}
        />
        <br />
        <br />
        <button type="submit" id="signupButton" className="buttons">
          Sign Up
        </button>
        <br />
        <br />
      </form>
      <button type="button" id="loginButton" className="buttons" onClick={goToLogin}>
        Go to Login
      </button>
      <br />
      <span id="signupResult">{message}</span>
    </div>
  );
}

export default Signup;

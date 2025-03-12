import React, { useState } from 'react';

function SignUp() {
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function doSignUp(e: React.FormEvent) {
    e.preventDefault();

    const obj = {
      username: username,
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName
    };

    try {
      const response = await fetch('http://134.122.3.46:3000/api/signup', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      // Adjust the logic based on your backend’s actual response
      if (!res || res.id <= 0) {
        setMessage('Unable to create user. Username or email may already be taken.');
      } else {
        // Example: store user data in localStorage, then redirect
        const user = {
          firstName: res.firstName,
          lastName: res.lastName,
          id: res.id
        };
        localStorage.setItem('user_data', JSON.stringify(user));

        setMessage('');
        window.location.href = '/cards';
      }
    } catch (error: any) {
      setMessage(error.toString());
    }
  }

  return (
    <div id="signupDiv">
      <span id="inner-title">CREATE AN ACCOUNT</span>
      <br />

      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <br />

      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <br />

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <input
        type="submit"
        id="signupButton"
        className="buttons"
        value="Sign Up"
        onClick={doSignUp}
      />

      <span id="signupResult">{message}</span>
    </div>
  );
}

export default SignUp;

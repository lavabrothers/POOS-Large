
import React, { useState } from 'react';
import { Box, TextField, Typography, Button } from '@mui/material';


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

  function goToOnBoard(): void {
    window.location.href = '/onboard';
  }

  function goToLogin(): void {
    window.location.href = '/';
  }

  async function doSignup(event: any): Promise<void> {
    event.preventDefault();

    const obj = {
      username,
      email,
      password,
      firstName,
      lastName,
    };

    const js = JSON.stringify(obj);

    try {
      const response = await fetch('http://134.122.3.46:3000/api/signup', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = JSON.parse(await response.text());

      if (res.error) {
        setMessage(res.error);
      } else {
        const user = res.user;
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('Signup successful!');
        goToOnBoard();
      }
    } catch (error: any) {
      alert(error.toString());
      return;
    }
  }

  return (
    <Box
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: 'background.paper',  // Use theme paper color
        borderRadius: '16px', 
        padding: '30px', 
        width: '400px', 
        gap: 2,
        boxShadow: 3,
        
      }}
    >
      <Typography variant="h3" sx={{ color: 'text.primary' }}>
        Register
      </Typography>
      <TextField 
        type="text" 
        id="username" 
        label="Username" 
        variant="outlined" 
        onChange={handleUsernameChange}
      />
      <TextField 
        type="email" 
        id="email" 
        label="Email" 
        variant="outlined" 
        onChange={handleEmailChange}
      />
      <TextField 
        type="password" 
        id="password" 
        label="Password" 
        variant="outlined" 
        onChange={handlePasswordChange}
      />
      <TextField 
        type="text" 
        id="firstName" 
        label="First Name" 
        variant="outlined" 
        onChange={handleFirstNameChange}
      />
      <TextField 
        type="text" 
        id="lastName" 
        label="Last Name" 
        variant="outlined" 
        onChange={handleLastNameChange}
      />
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
        <Button variant="outlined" onClick={goToLogin}>
          Go Back
        </Button>
        <Button variant="contained" onClick={doSignup}>
          Sign Up
        </Button>
      </Box>
      <Typography id="signupResult" sx={{ color: 'text.primary' }}>
        {message}
      </Typography>
    </Box>
  );
}

export default Signup;

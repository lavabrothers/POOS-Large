// src/components/Onboarding.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import stocks from './stocklist.tsx';
import alterFav from './alterfav.tsx';
import { ToastContainer, toast, Bounce} from 'react-toastify';

function Onboarding() {
  const [logo, setLogo] = useState('question');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  const userstring = localStorage.getItem('user_data');
  let user: any;
  let name = "";
  if (userstring && userstring !== "") {
    user = JSON.parse(userstring);
    name = user.firstName;
  } else {
    window.location.href = '/';
    return <div></div>;
  }

  // Use a TextField with native select (or consider MUI's Autocomplete) so that the style matches the rest of your app
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    // Determine which logo to show based on the selected value
    let symbol = 'question';
    for (let i = 0; i < stocks.length; i++) {
      if (value === `${stocks[i].symbol} (${stocks[i].name})`) {
        symbol = stocks[i].symbol;
        break;
      }
    }
    setLogo(symbol);
    console.log('logos/' + symbol + '.jpg');
  };

  const addFavorite = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    let symbol = '';
    let stockName = '';
    for (let i = 0; i < stocks.length; i++) {
      if (input === `${stocks[i].symbol} (${stocks[i].name})`) {
        symbol = stocks[i].symbol;
        stockName = stocks[i].name;
        break;
      }
    }
    if (symbol === '') {
      setMessage('Select an option from the menu to add.');
    } else {
      if (await alterFav('a', user._id, symbol)) {
        setMessage(`Added ${stockName} to your favorites. Feel free to add more!`);
      } else {
        setMessage('Failed to add.');
      }
      setInput('');
    }
  };

  const clearInput = () => {
    setInput('');
  };

  const notify = () => toast('Onboarding complete! Redirecting to login...', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
    onClose: goToLogin
    });

    function notifyFinished() : void {
        notify();
    }

    function goToLogin() : void {
        window.location.href = '/'
    }

  return (
    <Box
      id="onboardingDiv"
      sx={{
        bgcolor: 'background.default', // Use dark theme background
        color: 'text.primary',         // Use dark theme text color
        p: 4,
        borderRadius: 2,
        width: { xs: '90%', sm: '400px' },
        mx: 'auto',
        mt: 4,
        textAlign: 'center'
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        WELCOME TO FINANCIAL STATS, {name.toUpperCase()}!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Tell us about what stocks you're interested in so we can add them to your dashboard!
      </Typography>

      {/* Instead of using plain HTML, use a Material-UI TextField for consistent styling */}
      <TextField
        fullWidth
        select
        label="Select a Stock"
        value={input}
        onChange={handleInputChange}
        SelectProps={{
          native: true,
        }}
        variant="outlined"
        sx={{ mb: 2, borderRadius: '50px' }}
      >
        <option value=""></option>
        {stocks.map((d, index) => (
          <option key={index} value={`${d.symbol} (${d.name})`}>
            {`${d.symbol} (${d.name})`}
          </option>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={addFavorite}>
          Add
        </Button>
        <Button variant="outlined" onClick={clearInput}>
          Clear
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <img
          src={`logos/${logo}.jpg`}
          alt="Logo"
          width="64"
          height="64"
        />
      </Box>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {message}
      </Typography>
      <button type="button" onClick={notifyFinished}>Proceed</button>
            <ToastContainer />
    </Box>
  );
}

export default Onboarding;

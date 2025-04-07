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
  // Retrieve user data from localStorage
  const userString = localStorage.getItem('user_data');
  let user: any;
  let name = "";
  if (userString && userString !== "") {
    user = JSON.parse(userString);
    name = user.firstName;
  } else {
    window.location.href = '/';
    return <div></div>;
  }

  const [logo, setLogo] = useState('question');
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');

  // Update input; if matching a stock, update logo accordingly
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    let symbol = 'question';
    for (let i = 0; i < stocks.length; i++) {
      if (val === `${stocks[i].symbol} (${stocks[i].name})`) {
        symbol = stocks[i].symbol;
        break;
      }
    }
    setLogo(symbol);
    console.log('Logo set to:', symbol);
  };

  const addFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
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

  const goToHome = () => {
    window.location.href = '/home';
  };

  return (
    <Box
      id="onboardingDiv"
      sx={{
        bgcolor: 'background.default', // Uses dark theme background
        color: 'text.primary',         // Uses theme text color
        p: 4,
        borderRadius: 2,
        width: { xs: '90%', sm: 500 },
        mx: 'auto',
        mt: 4,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        WELCOME TO FINANCIAL STATS, {name.toUpperCase()}!
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Tell us about what stocks you're interested in so we can add them to your dashboard!
      </Typography>

      {/* Use a TextField with a select menu */}
      <TextField
        select
        label="Select Stock"
        value={input}
        onChange={handleInputChange}
        variant="outlined"
        fullWidth
        sx={{ mb: 2, borderRadius: '50px' }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {stocks.map((d) => (
          <MenuItem key={d.symbol} value={`${d.symbol} (${d.name})`}>
            {`${d.symbol} (${d.name})`}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
        <Button variant="contained" onClick={addFavorite}>
          Add
        </Button>
        <Button variant="outlined" onClick={clearInput}>
          Clear
        </Button>
      </Box>

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
        <div id="onboardingDiv">
            <span id="inner-title">WELCOME TO FINANCIAL STATS, {name.toUpperCase()}!</span><br/>
            <span id="description">Tell us about what stocks you're interested in so we can add them to your dashboard!</span><br/><br/>
            
            <input list="stocks" name="stock" id="stock" value={input} onChange={changelogo} />
            <datalist id="stocks">
                { stocks.map( d => <option value = {d.symbol + ' (' + d.name + ')'} /> ) }
            </datalist>
            <input type="submit" value = 'Add' onClick={addFavorite}/>
            <input type="button" value = 'Clear' onClick={clearInput}></input><br/><br/>
            <img src={'logos/' + logo + '.jpg'} alt="Desc" width="64" height="64"></img><br/>
            <span id='message'>{message}</span><br/><br/>
            <button type="button" onClick={notifyFinished}>Proceed</button>
            <ToastContainer />
        </div>
    )
}

export default Onboarding;

import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import Lottie from 'lottie-react';
import graphAnimation from '../assets/graph_animation.json';
//import { useLocation } from 'react-router-dom';
import { Button } from '@mui/material';

function goToHomePage(): void {
  window.location.href = '/home';
}

function goToFavorites(): void {
  window.location.href = '/favorites';
}

function signOut() : void {
  localStorage.setItem('user_data', '')
  window.location.href = '/'
}

function Logo() {
  //const location = useLocation();
  
  return (
    <Box sx={{ width: '95%', padding: 2 }}>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box display="flex" flexDirection="row" alignItems="center">
            <Lottie onClick={goToHomePage} animationData={graphAnimation} style={{ height: 100, cursor: 'pointer' }}/>
          <Typography onClick={goToHomePage} variant="h2" sx={{ cursor: 'pointer', mt: 3.5, ml: 1 }}>
            Finstats
          </Typography>
        </Box>
        <Box>
          <Button onClick={goToFavorites} variant="contained"  sx={{ my: 2, mx: 2}}>
          Favorites 
          </Button>
          <Button onClick={signOut} variant="contained"  color="secondary" sx={{ my: 2 }}>
            Sign Out
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Logo;

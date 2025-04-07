import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import Lottie from 'lottie-react';
import graphAnimation from '../assets/graph_animation.json';
import { useLocation } from 'react-router-dom';

function goToHomePage(): void {
  window.location.href = '/home';
}

function goToFavorites(): void {
  window.location.href = '/favorites';
}

function Logo() {
  const location = useLocation();
  
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
        <Typography onClick={goToFavorites} 
        variant="h3" 
        sx={{
             cursor: 'pointer', 
             mt: 3.5, mr: 1,  
             color: location.pathname === '/favorites' ? 'primary.main' : 'inherit'
            }}
        >
            Favorites
        </Typography>
      </Box>
    </Box>
  );
}

export default Logo;

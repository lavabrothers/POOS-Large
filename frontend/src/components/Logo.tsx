import * as React from 'react'
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import Lottie from 'lottie-react';
import graphAnimation from '../assets/graph_animation.json'



function goToHomePage(): void {
      window.location.href = '/home';
}
function Logo()
{
   return(
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="left">
            <Lottie onClick={goToHomePage} animationData={graphAnimation} style={{ height: 100, cursor:'pointer'}}/>
            <Typography onClick={goToHomePage} variant="h2" sx={{cursor: 'pointer', mt:3.5}} >Finstats</Typography>
      </Box>
    );
};

export default Logo;
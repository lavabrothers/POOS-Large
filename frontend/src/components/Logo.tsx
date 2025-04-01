import * as React from 'react'
import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
import Lottie from 'lottie-react';
import graphAnimation from '../assets/graph_animation.json'
function Logo()
{
   return(
      <Box display="flex" flexDirection="row" alignItems="center" justifyContent="left">
            <Lottie animationData={graphAnimation} style={{ height: 100}}/>
            <Typography variant="h2" >Finstats</Typography>
      </Box>
    );
};

export default Logo;
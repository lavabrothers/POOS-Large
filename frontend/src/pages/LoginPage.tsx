import React from 'react';
import { Box } from '@mui/material';
import Lottie from 'lottie-react';
import PageTitle from '../components/PageTitle';
import Login from '../components/Login';
import graphAnimation from '../assets/graph_animation.json';

const LoginPage = () => {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh" 
      sx={{ bgcolor: 'background.default', color: 'text.primary' }}
    >
      <Box display="flex" flexDirection="row" alignItems="flex-start" justifyContent="center" gap={4}>
        <Lottie animationData={graphAnimation} style={{ height: 170 }} />
        <PageTitle />
        <Login />
      </Box>
    </Box>
  );
};

export default LoginPage;

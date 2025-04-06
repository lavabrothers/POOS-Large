import React from 'react';
import { Box } from '@mui/material';
import SignUp from '../components/SignUp';

const SignUpPage = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"  
      alignItems="center"     
      minHeight="100vh"        
    >
      <SignUp />
    </Box>
  );
};

export default SignUpPage;

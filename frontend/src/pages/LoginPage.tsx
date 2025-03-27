import PageTitle from '../components/PageTitle.tsx';
import Login from '../components/Login.tsx';
import Box from '@mui/material/Box';
import Lottie from 'lottie-react';
import graphAnimation from '../assets/graph_animation.json'
const LoginPage = () =>
{

    return(
      <Box display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center">
        <Box display="flex" flexDirection="row" alignItems="flex-start" justifyContent="center" gap={4}>
          <Lottie animationData={graphAnimation} style={{ height: 170}}/>
          <PageTitle />
          <Login />
        </Box>
      </Box>
    );
};

export default LoginPage;

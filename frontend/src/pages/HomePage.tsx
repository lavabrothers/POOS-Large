import Home from '../components/Home';
import { Box } from '@mui/material';
import Logo from '../components/Logo';
import NewsTicker from '../components/NewsTicker';

const HomePage = () => {
  return (
    <Box sx={{ paddingTop: '60px' }}>
      <NewsTicker />
      <Logo />
      <Home />
    </Box>
  );
};

export default HomePage;

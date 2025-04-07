import Home from '../components/Home';
import { Box } from '@mui/material';
import Logo from '../components/Logo';
import NewsTicker from '../components/NewsTicker';
        
const HomePage = () => {
  return (
    <Box

      sx={{
        bgcolor: 'background.default', // uses dark theme background
        color: 'text.primary',  
        // uses dark theme text color
        minHeight: '100vh',
        width: '100%',
      }}
    >
  <NewsTicker />
      <Logo />
      <Home />
    </Box>
  );
};

export default HomePage;

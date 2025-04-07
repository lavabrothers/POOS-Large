import Favorites from '../components/Favorites.tsx';
import { Box } from '@mui/material';
import Logo from '../components/Logo.tsx';

const FavoritesPage = () =>
{

    return(
      <Box

      sx={{
        bgcolor: 'background.default', 
        color: 'text.primary',         
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Box>
        <Logo />
        <Favorites />
      </Box>
      </Box>
    );
};

export default FavoritesPage;

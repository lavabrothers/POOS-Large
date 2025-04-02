import PageTitle from '../components/PageTitle.tsx';
import Favorites from '../components/Favorites.tsx';
import { Box } from '@mui/material';
import Logo from '../components/Logo.tsx';

const FavoritesPage = () =>
{

    return(
      <Box>
        <Logo />
        <Favorites />
      </Box>
    );
};

export default FavoritesPage;

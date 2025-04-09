import Typography from '@mui/material/Typography'
import Box from "@mui/material/Box";
function PageTitle()
{
   return(
    <Box sx={{ width: '100%', maxWidth: 500}}>
      <Typography variant="h6" >Welcome to</Typography>
      <Typography variant="h1" >Finstats</Typography>
    </Box>
   );
};

export default PageTitle;

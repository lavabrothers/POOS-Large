import { createTheme } from '@mui/material/styles';
 
 const darkNeonTheme = createTheme({
   palette: {
     mode: 'dark',
     primary: {
       main: '#238691', // neon teal accent
     },
     secondary: {
       main: '#ff6a3d', // neon orange accent
     },
     background: {
       default: '#121212',
       paper: '#202020',
     },
     text: {
       primary: '#ffffff',
       secondary: '#aaaaaa',
     },
   },
   components: {
     MuiTextField: {
       styleOverrides: {
         root: {
           '& .MuiOutlinedInput-root': {
             backgroundColor: '#262626',
             '& fieldset': { borderColor: '#333' },
             '&:hover fieldset': { borderColor: '#555' },
             '&.Mui-focused fieldset': { borderColor: '#00ffcc' },
           },
           '& .MuiInputLabel-root': {
             color: '#aaa',
           },
         },
       },
     },
     MuiButton: {
       styleOverrides: {
         root: {
           textTransform: 'none',
           
         },
       },
     },
   },
 });
 
 export default darkNeonTheme;

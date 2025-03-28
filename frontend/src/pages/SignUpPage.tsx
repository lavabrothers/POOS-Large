import SignUp from '../components/SignUp.tsx';
import Box from '@mui/material/Box';


const SignUpPage = () => 
  {

    return(
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Box display="flex" flexDirection="row" alignItems="flex-start" justifyContent="center" gap={4}>
          <SignUp />
        </Box>
      </Box>
    );
};

export default SignUpPage;

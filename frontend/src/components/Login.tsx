import { useState } from 'react';
import { Box, TextField, Typography, Modal, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';

function Login() {
  const [message, setMessage] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [loading, setLoading] = useState(false);

  /*function handleSend() {
    setLoading(true);
  }*/

  const handleForgotPasswordEmail = (e: any): void => {
    setForgotPasswordEmail(e.target.value);
  };

  function handleSetLoginName(e: any): void {
    setLoginName(e.target.value);
  }

  const handleSetPassword = (e: any): void => {
    setPassword(e.target.value);
  };

  function goToSignup(): void {
    window.location.href = '/signup';
  }

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();

    var obj = { username: loginName, password: loginPassword };
    var js = JSON.stringify(obj);
    try {
      const response = await fetch('http://134.122.3.46:3000/api/login', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });
      var res = JSON.parse(await response.text());
      if ("Invalid username or password." === res.error) {
        setMessage('User/Password combination incorrect');
      } else if ("Username and password are required." === res.error) {
        setMessage('Username and password are required.');
      } else if ("User is not verified. Please check your email to verify your account. You may want to check your spam or junk folder." === res.error) {
        setMessage('User is not verified. Please check your email to verify your account. You may want to check your spam or junk folder.');
      } else {
        var user = res.user;
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('Login successful!');
        window.location.href = '/home';
      }
    } catch (error: any) {
      alert(error.toString());
      return;
    }
  }

  async function doForgotPassword(event: any): Promise<void> {
    event.preventDefault();

    var obj = { email: forgotPasswordEmail };
    var js = JSON.stringify(obj);
    
    setLoading(true);

    try {
      const response = await fetch('http://134.122.3.46:3000/api/request-password-reset', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });
      var res = JSON.parse(await response.text());

      if ("Email is required." == res.error) {
        setForgotPasswordMessage('Please enter an email address.');
        setLoading(false);
      } else if ("Email does not exist in our database." == res.error) {
        setForgotPasswordMessage('This email does not match our records.');
        setLoading(false);
      } else {
        setForgotPasswordMessage('Email sent!');
        setTimeout(() => {
          setLoading(false);
          setForgotPasswordOpen(false);
          setForgotPasswordEmail('');
          setForgotPasswordMessage('');
        }, 2000);
      }
    } catch (error: any) {
      alert(error.toString());
      return;
    }
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        bgcolor: 'background.paper',  // Use theme's paper color for dark mode
        borderRadius: '16px', 
        padding: '24px', 
        width: '400px', 
        gap: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h6" sx={{ color: 'text.primary' }}>Log in</Typography>
      <TextField 
        id="loginName" 
        label="Username" 
        variant="outlined" 
        onChange={handleSetLoginName}
        sx={{ bgcolor: 'background.default', borderRadius: '4px' }}
      />
      <TextField 
        id="loginPassword" 
        type="password" 
        label="Password" 
        variant="outlined" 
        onChange={handleSetPassword}
        sx={{ bgcolor: 'background.default', borderRadius: '4px' }}
      />
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
        <Button 
          onClick={doLogin}
          variant="contained"
          color="primary"
        >
          Log In
        </Button>
        <Button 
          onClick={goToSignup}
          variant="outlined"
          color="primary"
        >
          Sign Up
        </Button>
      </Box>
      <Modal
        open={forgotPasswordOpen} 
        onClose={() => setForgotPasswordOpen(false)}
      >
        <Box sx={{ 
          display: 'flex', 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          flexDirection: 'column', 
          bgcolor: 'background.paper', 
          borderRadius: '16px', 
          padding: '24px', 
          width: '400px', 
          gap: 2,
          boxShadow: 3,
        }}>
          <Typography 
            sx={{ textAlign: 'center', mb: 2, color: 'primary.main' }}
            variant="h6"
          >
            Reset Password
          </Typography>
          
          <Typography sx={{ textAlign: 'center', mb: 2 }}>
            We'll send you an email with details to reset your password.
          </Typography>
          
          {forgotPasswordMessage && (
            <Typography sx={{ textAlign: 'center', color: forgotPasswordMessage.includes('sent') ? 'green' : 'red' }}>
              {forgotPasswordMessage}
            </Typography>
          )}

          <TextField 
            id="forgotPasswordEmail" 
            label="Email" 
            variant="outlined" 
            onChange={handleForgotPasswordEmail}
            sx={{ bgcolor: 'background.default', borderRadius: '4px' }}
          />
          
          <Button
            sx={{ mb: 2 }}
            variant="contained"
            onClick={doForgotPassword}
            endIcon={<SendIcon />}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Modal>
      <Link to="#" onClick={() => setForgotPasswordOpen(true)} style={{ textDecoration: 'none', color: 'primary.main' }}>
          <Typography variant="body2">Forgot Password?</Typography>
      </Link>
      <Typography id="loginResult" sx={{ color: 'text.primary' }}>{message}</Typography>
    </Box>
  );
}

export default Login;

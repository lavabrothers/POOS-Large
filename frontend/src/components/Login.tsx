import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { TextField, Typography, Modal, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';

function Login() {
const [message,setMessage] = useState('');
const [forgotPasswordMessage,setForgotPasswordMessage] = useState('');
const [loginName,setLoginName] = React.useState('');
const [loginPassword,setPassword] = React.useState('');
const [forgotPasswordOpen,setForgotPasswordOpen] = React.useState(false);
const [forgotPasswordEmail,setForgotPasswordEmail] = React.useState('');
const [loading, setLoading] = React.useState(false);
  
  function handleSend() 
  {
    setLoading(true);
  }

  function handleForgotPasswordEmail( e: any ) : void
  {
    setForgotPasswordEmail( e.target.value );

  }

  function handleSetLoginName( e: any ) : void
  {
    setLoginName( e.target.value );
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
      } else {
        var user = res.user;
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('Login successful!');
        window.location.href = '/home';
      }
    }
    catch(error:any)
    {
        alert(error.toString());
        return;
    }
  };

  async function doForgotPassword(event:any) : Promise<void>
  {
    event.preventDefault();

    var obj = {email:forgotPasswordEmail};
    //obj = {email: email@email.com}

    var js = JSON.stringify(obj);
    
    setLoading(true);

    try{
      const response = await fetch('http://134.122.3.46:300/api/request-password-reset', {
        method:'POST',
        body: js,
        headers:{'Content-Type': 'application/json'}});
        
    var res = JSON.parse(await response.text());


    // MOCK RESPONSE FOR TESTING
    // const response = {
    //   error: forgotPasswordEmail === ''
    //     ? 'Email is required.' 
    //     : forgotPasswordEmail === 'email' 
    //     ? null 
    //     : 'Email does not exist in our database.'
    // };

    // var res = response; // Type assertion

    if ("Email is required." == res.error)
    {
      setForgotPasswordMessage('Please enter an email address.');
      setLoading(false);

    }
    else if ("Email does not exist in our database." == res.error) {
      setForgotPasswordMessage('This email does not match our records.');
      setLoading(false);
    }
    else
    {
      setForgotPasswordMessage('Email sent!');
      setTimeout(() => {
        setLoading(false);
        setForgotPasswordOpen(false);
        setForgotPasswordEmail('');
        setForgotPasswordMessage('');
      }, 2000);
    }
    }
      
    catch(error:any)
    {
        alert(error.toString());
        return;
    }
    
  }

  return(
    <Box sx={{ 
      display: 'flex', 
      flexDirection:'column', 
      bgcolor: '#f0f0f0', 
      borderRadius: '16px', 
      padding: '24px', 
      width: '400px', 
      gap: 2,
      boxShadow: 3,
      }}>
      <Typography variant='h6'> Log in</Typography>
      <TextField id="loginName" label="Username" variant="outlined" onChange={handleSetLoginName}/>
      <TextField id="loginPassword" type="password" label="Password" variant="outlined" onChange={handleSetPassword}/>
      <Box sx={{display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center'}}>
        <button type="button" id="signupButton" className="buttons"
          onClick={doLogin}>Log In</button><br/><br/>
        <button type="button" id="signupButton" className="buttons"
          onClick={goToSignup}>Sign Up</button><br />
      </Box>
      <Modal
        sx={{}} open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
        <Box sx={{ 
          display: 'flex', 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          flexDirection:'column', 
          bgcolor: '#f0f0f0', 
          borderRadius: '16px', 
          padding: '24px', 
          width: '400px', 
          gap: 2,
          boxShadow: 3,
          }}>
          <Typography 
          sx={{textAlign: 'center', marginBottom: 2, color: '#1976d2'}}
          variant='h6'>Reset Password</Typography>
          
          <Typography
          sx={{textAlign: 'center', marginBottom: 2}}>We'll send you an email with details to reset your password.</Typography>
          
          {forgotPasswordMessage && (
            <Typography sx={{textAlign: 'center', color: forgotPasswordMessage.includes('sent') ? 'green' : 'red'}}>  
              {forgotPasswordMessage}
            </Typography>
          )}

          <TextField id="forgotPasswordEmail" label="Email" variant="outlined" onChange={handleForgotPasswordEmail}/>
          
          <Button
          sx={{marginBottom: 2}} 
           type="button" id="signupButton" className="buttons"
          onClick={doForgotPassword} endIcon={<SendIcon />} disabled={loading} loadingPosition="end">
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Modal>
      <Link to="#" onClick={() => setForgotPasswordOpen(true)} style={{textDecoration: 'none', color: '#1976d2'}}>
          <Typography variant='body2'>Forgot Password?</Typography>
      </Link>
      <span id="loginResult">{message}</span>
    </Box>
  );
}

export default Login;

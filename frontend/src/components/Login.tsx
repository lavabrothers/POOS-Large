import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { TextField, Typography } from '@mui/material';

function Login()
{

const [message,setMessage] = useState('');
const [loginName,setLoginName] = React.useState('');
const [loginPassword,setPassword] = React.useState('');

  function handleSetLoginName( e: any ) : void
  {
    setLoginName( e.target.value );
  }

  function handleSetPassword( e: any ) : void
  {
    setPassword( e.target.value );
  }

  function goToSignup() : void 
  {
   
    window.location.href = '/signup';
  }

  async function doLogin(event:any) : Promise<void>
  {
    event.preventDefault();

    var obj = {username:loginName,password:loginPassword};
    //obj = {username: 'johnnybravo', password: 'password'}

    var js = JSON.stringify(obj);

    try
    {    

      const response = await fetch('http://134.122.3.46:3000/api/login', {
          method:'POST',
          body: js,
          headers:{'Content-Type': 'application/json'}});
          
      var res = JSON.parse(await response.text());


      if ("Invalid username or password." == res.error)
      {
        setMessage('User/Password combination incorrect');
      }
      else if ("Username and password are required." == res.error) {
        setMessage('Username and password are required.')
      }
      else
      {
        var user = res.user
        localStorage.setItem('user_data', JSON.stringify(user));

        setMessage('Login successful!');

        //When home is ready, put path here
        window.location.href = '/home';
      }
    }
    catch(error:any)
    {
        alert(error.toString());
        return;
    }    
  };

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
      <span id="loginResult">{message}</span>
    </Box>
  );
};

export default Login;

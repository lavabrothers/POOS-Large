import React, { useState } from 'react';

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
        //window.location.href = '/cards';
      }
    }
    catch(error:any)
    {
        alert(error.toString());
        return;
    }    
  };

  return(
    <div id="loginDiv">
      <span id="inner-title">PLEASE LOG IN</span><br />
      <input type="text" id="loginName" placeholder="Username" 
        onChange={handleSetLoginName} /><br />
      <input type="password" id="loginPassword" placeholder="Password" 
        onChange={handleSetPassword} /><br/><br/>
      <button type="button" id="signupButton" className="buttons"
        onClick={doLogin}>Log In</button><br/><br/>
      <button type="button" id="signupButton" className="buttons"
        onClick={goToSignup}>Sign Up</button><br />
      <span id="loginResult">{message}</span>
    </div>
  );
};

export default Login;

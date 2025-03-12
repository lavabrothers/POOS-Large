import React, { useState } from 'react';

function SignUp() 
{
const [message, setMessage] = useState('');
const [firstName, setFirstName] = React.useState('');
const [lastName, setLastName] = React.useState('');
const [loginEmail, setEmail] = React.useState('');
const [loginName, setLoginName] = React.useState('');
const [loginPassword, setPassword] = React.useState('');

function handleSetFirstName( e: any ) : void
{
  setFirstName( e.target.value );
}
function handleSetLastName( e: any ) : void
{
  setLastName( e.target.value );
}

function handleSetEmail( e: any ) : void
{
  setLastName( e.target.value );
}
function handleSetLoginName( e: any ) : void
{
  setLoginName( e.target.value );
}

function handleSetPassword( e: any ) : void
{
  setPassword( e.target.value );
}

function goToOnBoard() : void 
{
 
  window.location.href = '/onboard';
}

async function doSignUp(event:any) : Promise<void>
{
  event.preventDefault();

  var obj = {firstname: firstName, lastname: lastName , email: loginEmail, username: loginName, password: loginPassword,};
  // obj { Ruben, Dennis, rubendennis@gmail.com, username1, password1}

  var js = JSON.stringify(obj);

  try
  {    

    const response = await fetch('http://134.122.3.46:3000/api/signup', {
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
  <div id="signupDiv">
    <span id="inner-title">PLEASE SIGN UP </span><br />
    <input type="text" id="firstName" placeholder="First Name" 
      onChange={handleSetFirstName} /><br />
    <input type="text" id="lastName" placeholder="Last Name" 
      onChange={handleSetLastName} /><br />
    <input type="text" id="loginEmail" placeholder="Email" 
      onChange={handleSetEmail} /><br />
    <input type="text" id="loginName" placeholder="Username" 
      onChange={handleSetLoginName} /><br />
    <input type="password" id="loginPassword" placeholder="Password" 
      onChange={handleSetPassword} /><br/><br/>
    <button type="button" id="signupButton" className="buttons"
      onClick={doSignUp}>Sign Up </button><br/><br/>
    <button type="button" id="signupButton" className="buttons"
      onClick={goToOnBoard}>Sign Up</button><br />
    <span id="signupResult">{message}</span>
  </div>
);
};

export default SignUp;

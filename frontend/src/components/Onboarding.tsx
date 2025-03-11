import React, { useState } from 'react';
import stocks from './stocklist.tsx'

function Onboarding () {

    var name: string;
    console.log(stocks[0])
    console.log(typeof(stocks[0]))
    
    // using a hardcoded user for now, until signup is up and running 
    
    const [logo, setLogo] = useState('question')
    const userstring = JSON.stringify({
		"_id": "67cf2a78b0ab1e81c34af699",
		"username": "onboardtestuser",
		"email": "onboardtestuser@email.com",
		"firstName": "onboardtestuser",
		"lastName": "lastname",
		"createdAt": "2025-03-10T18:07:52.691Z",
		"updatedAt": "2025-03-10T18:07:52.691Z",
		"__v": 0
	})
    
    //const userstring = localStorage.getItem('user_data');

    if (userstring != "" && userstring != null) {
        const user = JSON.parse(userstring);
        name = user.firstName;
    }
    else {
        window.location.href = '/';
        return(<div></div>)
    }

    function changelogo( e : any ) : void {
        var symbol = 'question'
        var val = e.target.value
        console.log(val)
        for (var i = 0; i < stocks.length; i++) {
            if (val == stocks[i].symbol + ' (' + stocks[i].name + ')') {
                console.log(stocks[i].symbol)
                symbol = stocks[i].symbol
                break
            }
        }

        setLogo(symbol)
        console.log('logos/' + logo + '.jpg')
        
        
    }

    
   
    return (
        <div id="onboardingDiv">
            <span id="inner-title">WELCOME TO FINANCIAL STATS, {name.toUpperCase()}!</span><br/>
            <span id="description">Tell us about what stocks you're interested in so we can add them to your dashboard!</span><br/><br/>
            
            <input list="stocks" name="stock" id="stock" onChange={changelogo}/>
            <datalist id="stocks">
                { stocks.map( d => <option value = {d.symbol + ' (' + d.name + ')'} /> ) }
            </datalist>
            <input type="submit"/><br/><br/>
            <img src={'logos/' + logo + '.jpg'} alt="Desc" width="64" height="64"></img>
        </div>
    )
}

export default Onboarding
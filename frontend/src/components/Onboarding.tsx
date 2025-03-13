import React, { useState } from 'react';
import stocks from './stocklist.tsx'
import alterFav from './alterfav.tsx';



function Onboarding () {

    var name: string;
    
    const [logo, setLogo] = useState('question')
    const [input, setInput] = useState('')
    const [message, setMessage] = useState('')

    // using a hardcoded user for now, until signup is up and running 
    /*
    const userstring = JSON.stringify({
		"_id": "67cf2a78b0ab1e81c34af699",
		"username": "onboardtestuser",
		"email": "onboardtestuser@email.com",
		"firstName": "onboardtestuser",
		"lastName": "lastname",
		"createdAt": "2025-03-10T18:07:52.691Z",
		"updatedAt": "2025-03-10T18:07:52.691Z",
		"__v": 0
	})*/
    
    const userstring = localStorage.getItem('user_data');
    var user : any
    if (userstring != "" && userstring != null) {
        user = JSON.parse(userstring);
        name = user.firstName;
    }
    else {
        window.location.href = '/';
        return(<div></div>)
    }

    function changelogo( e : any ) : void {
        setInput(e.target.value)
        var symbol = 'question'
        var val = e.target.value

        for (var i = 0; i < stocks.length; i++) {
            if (val == stocks[i].symbol + ' (' + stocks[i].name + ')') {
                symbol = stocks[i].symbol
                break
            }
        }

        setLogo(symbol)
        console.log('logos/' + logo + '.jpg')
    }

    async function addFavorite( event : any ) : Promise<void> {
        
        event.preventDefault();
        console.log(input)

        var symbol = ''
        var name = ''
        for (var i = 0; i < stocks.length; i++) {
            if (input == stocks[i].symbol + ' (' + stocks[i].name + ')') {
                symbol = stocks[i].symbol
                name = stocks[i].name
                break
            }
        }

        if (symbol == '') {
            setMessage('Select an option from the menu to add.')
        }
        else {
            if ( await alterFav('a', user._id, symbol) ) setMessage('Added ' + name + ' to your favorites. Feel free to add more!')
            else setMessage('Failed to add.')
            setInput('')
        }
    }

    function goToHome() : void {
        //When home is ready, path to it here
        //window.location.href = 'PATH TO HOME HERE'
    }

    function clearInput() : void {
        setInput('')
    }

    return (
        <div id="onboardingDiv">
            <span id="inner-title">WELCOME TO FINANCIAL STATS, {name.toUpperCase()}!</span><br/>
            <span id="description">Tell us about what stocks you're interested in so we can add them to your dashboard!</span><br/><br/>
            
            <input list="stocks" name="stock" id="stock" value={input} onChange={changelogo} />
            <datalist id="stocks">
                { stocks.map( d => <option value = {d.symbol + ' (' + d.name + ')'} /> ) }
            </datalist>
            <input type="submit" value = 'Add' onClick={addFavorite}/>
            <input type="button" value = 'Clear' onClick={clearInput}></input><br/><br/>
            <img src={'logos/' + logo + '.jpg'} alt="Desc" width="64" height="64"></img><br/>
            <span id='message'>{message}</span><br/><br/>
            <button type="button" onClick={goToHome}>Proceed</button>
        </div>
    )
}

export default Onboarding
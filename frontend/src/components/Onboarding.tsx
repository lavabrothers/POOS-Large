import React, { useState } from 'react';

function Onboarding () {

    var name: string;
    const userstring = localStorage.getItem('user_data');
    console.log(userstring);
    if (userstring != "" && userstring != null) {
        const user = JSON.parse(userstring);
        name = user.firstName;
    }
    else {
        name = "Undefined user";
    }

    return (
        <div id="onboardingDiv">
            <span id="inner-title">WELCOME TO FINANCIAL STATS, {name.toUpperCase()}!</span><br/>
            <span id="description">Tell us about what stocks you're interested in so we can add them to your dashboard!</span>
        </div>
    )
}

export default Onboarding
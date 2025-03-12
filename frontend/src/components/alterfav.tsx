import React from "react";

async function alterFav( op : string, userid : string, symbol : string) : Promise<boolean> {
    // if op == 'a', adds to the favorites list.
    // if op == 'r', will remove from the favorites list.
    // returns true if successful, false if failed

    interface Stock {
        symbol : string
        stockName : string
    }

    async function createFavList( userid : string ) : Promise<boolean> {
        // returns false if failed, true if successful
        
        const stocks : Stock[] = []
    
        var js = JSON.stringify({ userId : userid, stocks : stocks})
        const response = await fetch('http://134.122.3.46:3000/api/favorites/create', {
            method:'POST',
            body: js,
            headers: {'Content-Type': 'application/json'}});
            
        var res = JSON.parse(await response.text());
    
        if (res.error) return false
        else return true
    }

    if ( op == 'r' ) var api = 'remove'
    else if ( op == 'a' ) var api = 'add'
    else return false
console.log("precall")
    var js = JSON.stringify({userId : userid, symbol : symbol})
    const response = await fetch('http://134.122.3.46:3000/api/favorites/' + api, {
        method:'PUT',
        body: js,
        headers: {'Content-Type': 'application/json'}});
console.log("postcall")
    var res = JSON.parse(await response.text());

    
console.log(res.message)
    if ( res.message == 'Favorites not found for this user.' ) {
console.log("Fav not found")
        if ( await createFavList(userid) ) {
            if ( await alterFav(op, userid, symbol) ) return true
            else return false
        }
    }
    if (res.error) return false
    return true
}

export default alterFav
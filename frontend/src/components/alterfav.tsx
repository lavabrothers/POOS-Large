import stocklist from './stocklist'

async function alterFav( op : string, id : string, symbol : string,) : Promise<boolean> {
    // if op == 'a', adds to the favorites list.
    // if op == 'r', will remove from the favorites list.
    // returns true if successful, false if failed

    interface Stock {
        symbol : string
        stockName : string
    }

    async function createFavList( id : string ) : Promise<boolean> {
        // returns false if failed, true if successful
        
        const stocks : Stock[] = []
    
        var js = JSON.stringify({ userId : id, stocks : stocks})
        const response = await fetch('http://134.122.3.46:3000/api/favorites/create', {
            method:'POST',
            body: js,
            headers: {'Content-Type': 'application/json'}});
            
        var res = JSON.parse(await response.text());
    
        if (res.error) return false
        else return true
    }

    if ( op == 'r' ) {
        var api = 'remove'
        var js = JSON.stringify({userId : id, symbol : symbol})
    }
    else if ( op == 'a' ) {
        var api = 'add'
        var name = ''
        for (var i = 0; i < stocklist.length; i++) {
            if (stocklist[i].symbol == symbol) {
                name = stocklist[i].name
                break
            }
        }
        var js = JSON.stringify({userId : id, symbol : symbol, stockName : name})
    }
    else return false

    const response = await fetch('http://134.122.3.46:3000/api/favorites/' + api, {
        method:'PUT',
        body: js,
        headers: {'Content-Type': 'application/json'}});

    var res = JSON.parse(await response.text());

    

    if ( res.message == 'Favorites not found for this user.' ) {

        if ( await createFavList(id) ) {
            if ( await alterFav(op, id, symbol) ) return true
            else return false
        }
    }
    if (res.error) return false
    return true
}

export default alterFav
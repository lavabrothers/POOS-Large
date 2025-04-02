// Uses UnitTester user with id 67ec9ea0b4d17f170bd40839 to test functions



describe("Testing create favorites: ", function () {
    it('Should not create a list for a user that already has one', async function () {

        var js = JSON.stringify({ userId : '67ec9ea0b4d17f170bd40839', stocks : ''})
        const response = await fetch('http://134.122.3.46:3000/api/favorites/create', {
            method:'POST',
            body: js,
            headers: {'Content-Type': 'application/json'}});
        
        var res = JSON.parse(await response.text());

        expect(response.status).toBe(404)
        expect(res.message).toBe('Favorites list already exists for this user.')
    })
})

async function requsetAdd(js) {
    const response = await fetch('http://134.122.3.46:3000/api/favorites/add', {
        method: 'PUT',
        body: js,
        headers: { 'Content-Type': 'application/json' }});
    
        return { res: JSON.parse(await response.text()), status: response.status };
}

async function requsetRemove(js) {
    const response = await fetch('http://134.122.3.46:3000/api/favorites/remove', {
        method: 'PUT',
        body: js,
        headers: { 'Content-Type': 'application/json' }});
    
        return { res: JSON.parse(await response.text()), status: response.status };
}

describe('Testing Add/Remove Favorites API: ', function () {
    it('Should successfully remove, add, and then remove AAPL from UnitTester', async function () {
        var remjs = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'AAPL'
        })

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).not.toBe("Favorites not found for this user.")
        expect(res.message).not.toBe(403)

        var remjs = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'AAPL',
            stockName: 'Apple'
        })

        var { res, status } = await requsetAdd(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe("Stock AAPL added.")
        expect(status).toBe(200)

        var remjs = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'AAPL'
        })

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe('Stock AAPL removed.')
        expect(status).toBe(200)
    })

    it("Should fail to add favorite to non-existing user", async function () {
        var remjs = JSON.stringify({
            userId: 'nope',
            symbol: 'AAPL',
            stockName: 'Apple'
        })

        var { res, status } = await requsetAdd(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe('Favorites not found for this user.')
        expect(status).toBe(404)
    })

    it("Should fail to remove favorite from non-existing user", async function () {
        var remjs = JSON.stringify({
            userId: 'nope',
            symbol: 'AAPL',
        })

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe('Favorites not found for this user.')
        expect(status).toBe(404)
    })

    it("Removes AAPL from UnitTester twice, should recognize that stock isn't there", async function () {
        var js = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'AAPL'
        })

        var { res, status } = await requsetRemove(js)
        expect(res.error).toBeNull
        expect(res.message).not.toBe("Favorites not found for this user.")
        expect(res.message).not.toBe(403)

        var { res, status } = await requsetRemove(js)
        expect(res.error).toBeNull
        expect(res.message).toBe('This stock is not in this favorites list.')
        expect(status).toBe(404)
    })

    it("Adds AAPL to UnitTester twice then removes it. Should recognize that stock is already there", async function () {
        var js = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'AAPL',
            stockName: 'Apple'
        })

        var { res, status } = await requsetAdd(js)
        expect(res.error).toBeNull
        expect(res.message).not.toBe("Favorites not found for this user.")
        expect(res.message).not.toBe(403)

        var { res, status } = await requsetAdd(js)
        expect(res.error).toBeNull
        expect(res.message).toBe('Stock AAPL already exists in favorites list.')
        expect(status).toBe(400)

        var remjs = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'AAPL'
        })

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe('Stock AAPL removed.')
        expect(status).toBe(200)
    })
})

async function requestSearchAll() {
    const response = await fetch(`http://134.122.3.46:3000/api/favorites/search?userId=67ec9ea0b4d17f170bd40839`);
    return { res: JSON.parse(await response.text()), status: response.status };
}

describe("Testing favorites search API: ", function () {
    it('Adds NFLX, AMZN, and TSLA. Should search for all with one API call. Removes all afterward.', async function () {
        var js = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'NFLX',
            stockName: 'Netflix'
        })

        var { res, status } = await requsetAdd(js)
        expect(res.error).toBeNull
        expect(res.message).toBe("Stock NFLX added.")
        expect(status).toBe(200)

        var js = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'AMZN',
            stockName: 'Amazon'
        })

        var { res, status } = await requsetAdd(js)
        expect(res.error).toBeNull
        expect(res.message).toBe("Stock AMZN added.")
        expect(status).toBe(200)

        var js = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'TSLA',
            stockName: 'Tesla'
        })

        var { res, status } = await requsetAdd(js)
        expect(res.error).toBeNull
        expect(res.message).toBe("Stock TSLA added.")
        expect(status).toBe(200)

        var { res, status } = await requestSearchAll()
        var list = []
        for (const stock of res.stocks) {
            list.push(stock.symbol)
        }
       
        expect(list).toContain('AMZN')
        expect(list).toContain('NFLX')
        expect(list).toContain('TSLA')
        expect(res.stocks.length).toEqual(3)
        expect(status).toBe(200)

        var js = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'NFLX'
        })

        var { res, status } = await requsetRemove(js)
        expect(res.error).toBeNull
        expect(res.message).toBe("Stock NFLX removed.")
        expect(status).toBe(200)

        var js = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'TSLA'
        })

        var { res, status } = await requsetRemove(js)
        expect(res.error).toBeNull
        expect(res.message).toBe("Stock TSLA removed.")
        expect(status).toBe(200)

        var js = JSON.stringify({
            userId: '67ec9ea0b4d17f170bd40839',
            symbol: 'AMZN'
        })

        var { res, status } = await requsetRemove(js)
        expect(res.error).toBeNull
        expect(res.message).toBe("Stock AMZN removed.")
        expect(status).toBe(200)

        var { res, status } = await requestSearchAll()
        expect(res).toEqual( {stocks: []} )
        expect(status).toBe(200)
    })

    it('Should search for favorites, but find nothing there', async function () {
        var { res, status } = await requestSearchAll()
        expect(res).toEqual( {stocks: []} )
        expect(status).toBe(200)
    })
})
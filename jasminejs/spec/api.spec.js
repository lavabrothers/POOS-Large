// Uses UnitTester user with id 67ec9ea0b4d17f170bd40839 to test functions

async function requestLogin (js) {
    const response = await fetch('http://134.122.3.46:3000/api/login', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }});
    
    return { res: JSON.parse(await response.text()), status: response.status };
}

describe('Testing Login API: ', function () {
    it('Should login successfully', async function () {
        var js = JSON.stringify({
            'username': 'UnitTester',
            'password': 'password1!'
        })
        var { res, status } = await requestLogin(js)
        expect(res.message).toBe('Login successful')
        expect(res.error).toBeNull
        expect(res.user._id).toBe("67ec9ea0b4d17f170bd40839")
        expect(res.user.username).toBe("UnitTester")
        expect(res.user.email).toBe("UnitTester@test.com")
        expect(res.user.firstName).toBe("Unit")
        expect(res.user.lastName).toBe("Tester")
        expect(status).toBe(200)
    })

    it('Should fail to login, with invalid password', async function () {
        var js = JSON.stringify({
            'username': 'UnitTester',
            'password': 'badpass'
        })
        var { res, status } = await requestLogin(js)
        expect(res.message).toBeNull
        expect(res.error).toBe('Invalid username or password.')
    })

    it('Should fail to login, with missing username or password', async function () {
        var js = JSON.stringify({
            'username': 'UnitTester'
        })
        var { res, status } = await requestLogin(js)
        expect(res.message).toBeNull
        expect(res.error).toBe('Username and password are required.')

        var js = JSON.stringify({
            'password': 'password1!'
        })
        var { res, status } = await requestLogin(js)
        expect(res.message).toBeNull
        expect(res.error).toBe('Username and password are required.')

        var { res, status } = await requestLogin('')
        expect(res.message).toBeNull
        expect(res.error).toBe('Username and password are required.')
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
            'userId': '67ec9ea0b4d17f170bd40839',
            'symbol': 'AAPL'
        })

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).not.toBe("Favorites not found for this user.")
        expect(res.message).not.toBe(403)

        var remjs = JSON.stringify({
            'userId': '67ec9ea0b4d17f170bd40839',
            'symbol': 'AAPL',
            'stockName': 'Apple'
        })

        var { res, status } = await requsetAdd(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe("Stock AAPL added.")
        expect(status).toBe(200)

        var remjs = JSON.stringify({
            'userId': '67ec9ea0b4d17f170bd40839',
            'symbol': 'AAPL'
        })

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe('Stock AAPL removed.')
        expect(status).toBe(200)
    })

    it("Should fail to add favorite to non-existing user", async function () {
        var remjs = JSON.stringify({
            'userId': 'nope',
            'symbol': 'AAPL',
            'stockName': 'Apple'
        })

        var { res, status } = await requsetAdd(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe('Favorites not found for this user.')
        expect(status).toBe(404)
    })

    it("Should fail to remove favorite from non-existing user", async function () {
        var remjs = JSON.stringify({
            'userId': 'nope',
            'symbol': 'AAPL',
        })

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe('Favorites not found for this user.')
        expect(status).toBe(404)
    })

    it("Removes AAPL from UnitTester twice, should recognize that stock isn't there", async function () {
        var remjs = JSON.stringify({
            'userId': '67ec9ea0b4d17f170bd40839',
            'symbol': 'AAPL'
        })

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).not.toBe("Favorites not found for this user.")
        expect(res.message).not.toBe(403)

        var { res, status } = await requsetRemove(remjs)
        expect(res.error).toBeNull
        expect(res.message).toBe('This stock is not in this favorites list.')
        expect(status).toBe(404)
    })
})

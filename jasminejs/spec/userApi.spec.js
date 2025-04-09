// Uses UnitTester user with id 67ec9ea0b4d17f170bd40839 to test functions

async function requestSignup (js) {
    const response = await fetch('http://134.122.3.46:3000/api/signup', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }});
    
    return { res: JSON.parse(await response.text()), status: response.status };
}

async function requestLogin (js) {
    const response = await fetch('http://134.122.3.46:3000/api/login', {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }});
    
    return { res: JSON.parse(await response.text()), status: response.status };
}

describe('Testing Signup API', function () {
    it('Should fail to signup a user that already exists.', async function () {
        var js = JSON.stringify({
            username: "UnitTester",
            email: "UnitTester@test.com",
            password: "password1!",
            firstName: "Unit",
            lastName: "Tester"
        })

        var { res, status } = await requestSignup(js)
        expect(status).toBe(403)
        expect(res.message).toBeNull
        expect(res.error).toBe("A user with that email already exists.")
    })

    it('Should fail to signup with any missing fields', async function () {
        var jslist = []
        jslist.push(JSON.stringify({
            username: "UnitTester",
            email: "UnitTester@test.com",
            password: "password1!",
            firstName: "Unit"
        }))

        jslist.push(JSON.stringify({
            username: "UnitTester",
            email: "UnitTester@test.com",
            password: "password1!",
            lastName: "Tester"
        }))

        jslist.push(JSON.stringify({
            username: "UnitTester",
            email: "UnitTester@test.com",
            firstName: "Unit",
            lastName: "Tester"
        }))

        jslist.push(JSON.stringify({
            username: "UnitTester",
            password: "password1!",
            firstName: "Unit",
            lastName: "Tester"
        }))

        jslist.push(JSON.stringify({
            email: "UnitTester@test.com",
            password: "password1!",
            firstName: "Unit",
            lastName: "Tester"
        }))

        jslist.push(JSON.stringify({}))

        for (const js of jslist) {
            var { res, status } = await requestSignup(js)
            expect(status).toBe(403)
            expect(res.error).toBe("All fields are required.")
            expect(res.message).toBeNull
        }
    })

    it('Should fail to signup with invalid password.', async function () {
        //letters, number, symbol, 8+
        var jslist = []

        jslist.push(JSON.stringify({
            username: 'UnitTesterDNE',
            email: "UnitTesterDNE@test.com",
            password: "pass1!",
            firstName: "Unit",
            lastName: "Tester"
        }))
        
        jslist.push(JSON.stringify({
            username: 'UnitTesterDNE',
            email: "UnitTesterDNE@test.com",
            password: "passwordthingy",
            firstName: "Unit",
            lastName: "Tester"
        }))  

        jslist.push(JSON.stringify({
            username: 'UnitTesterDNE',
            email: "UnitTesterDNE@test.com",
            password: "password123",
            firstName: "Unit",
            lastName: "Tester"
        })) 

        jslist.push(JSON.stringify({
            username: 'UnitTesterDNE',
            email: "UnitTesterDNE@test.com",
            password: "password!@#",
            firstName: "Unit",
            lastName: "Tester"
        })) 

        for (const js of jslist) {
            var { res, status } = await requestSignup(js)
            expect(status).toBe(403)
            expect(res.error).toBe("Password must be 8+ characters long and contain at least one letter, one number, and one special character.")
            expect(res.message).toBeNull
        }
    })

    it('Should not allow invalid email', async function () {
        var jslist = []

        jslist.push(JSON.stringify({
            username: 'UnitTesterDNE',
            email: "bademail",
            password: "password1!",
            firstName: "Unit",
            lastName: "Tester"
        }))

        jslist.push(JSON.stringify({
            username: 'UnitTesterDNE',
            email: "bad@email",
            password: "password1!",
            firstName: "Unit",
            lastName: "Tester"
        }))

        jslist.push(JSON.stringify({
            username: 'UnitTesterDNE',
            email: "bad.email",
            password: "password1!",
            firstName: "Unit",
            lastName: "Tester"
        }))

        for (const js of jslist) {
            var { res, status } = await requestSignup(js)
            expect(status).toBe(403)
            expect(res.error).toBe("Invalid email.")
            expect(res.message).toBeNull
        }
    })
})

describe('Testing Login API: ', function () {
    it('Should login successfully', async function () {
        var js = JSON.stringify({
            username: 'UnitTester',
            password: 'password1!'
        })
        var { res, status } = await requestLogin(js)
        expect(res.message).toBe('Login successful')
        expect(res.error).toBeNull
        expect(res.user._id).toBe("67f45f9a2e06a650c83d00b4")
        expect(res.user.username).toBe("UnitTester")
        expect(res.user.email).toBe("UnitTester@test.com")
        expect(res.user.firstName).toBe("Unit")
        expect(res.user.lastName).toBe("Tester")
        expect(status).toBe(200)
    })

    it('Should fail to login, with invalid password', async function () {
        var js = JSON.stringify({
            username: 'UnitTester',
            password: 'badpass'
        })
        var { res, status } = await requestLogin(js)
        expect(res.message).toBeNull
        expect(res.error).toBe('Invalid username or password.')
    })

    it('Should fail to login, with missing username or password', async function () {
        var js = JSON.stringify({
            username: 'UnitTester'
        })
        var { res, status } = await requestLogin(js)
        expect(res.message).toBeNull
        expect(res.error).toBe('Username and password are required.')

        var js = JSON.stringify({
            password: 'password1!'
        })
        var { res, status } = await requestLogin(js)
        expect(res.message).toBeNull
        expect(res.error).toBe('Username and password are required.')

        var { res, status } = await requestLogin('')
        expect(res.message).toBeNull
        expect(res.error).toBe('Username and password are required.')
    })
})


/*
async function requestStockInfo(js) {
    const response = await fetch('http://134.122.3.46:3000/api/stockInfo', {
        method: 'GET',
        query: js,
        headers: { 'Content-Type': 'application/json' }});
    
        return { res: JSON.parse(await response.text()), status: response.status };
}

describe("Testing stockInfo API: ", function () {
    it('Should do stuff', async function () {
        var js = JSON.stringify({ ticker: 'AAPL' })
        var { res, status } = await requestStockInfo(js)
        expect(res.error).toBeNull
        console.log(res)
    })
})
*/

async function requestStocks() {
    const response = await fetch(`http://134.122.3.46:3000/api/stocks`);
    return { res: JSON.parse(await response.text()), status: response.status };
}

async function requestStockData(symbol) {
    const response = await fetch(`http://134.122.3.46:3000/api/stocks/${symbol}`);
    return { res: JSON.parse(await response.text()), status: response.status };
}

describe('Testing /stocks API: ', function () {
    it ('Should give list of stocks', async function () {
        var { res, status } = await requestStocks()
        expect(res).toBeTruthy
        expect(status).toBe(200)
    })
})

describe("Testing stock/'symbol' API: ", function () {
    it("Should get info for AAPL", async function () {
        var { res, status } = await requestStockData('AAPL')
        expect(res._id).toBe('67c7839eec4cd3c17b025b0f')
        expect(res.symbol).toBe('AAPL')
        expect(res.dividends).toBeTruthy
        expect(res.incomeStatements).toBeTruthy
        expect(res.balanceSheets).toBeTruthy
        expect(res.cashFlows).toBeTruthy
        expect(res.earnings).toBeTruthy
        expect(status).toBe(200)
    })

    it('Should get info for all stocks in system', async function () {
        var { res, status } = await requestStocks()
        expect(res).toBeTruthy
        expect(status).toBe(200)

        var stocks = res
        
        for (const obj of stocks) {
            var { res, status } = await requestStockData(obj.symbol)

            if (status == 404) {
                expect(status).withContext(`No data found for ${obj.symbol}`).toBe(200)
            }
            else if (status == 429) {
                expect(status).withContext(`AlphaVantage refused to get data for ${obj.symbol}, rate limit exceeded`).toBe(200)
            }
            else {
                expect(status).toBe(200)
                expect(res._id).not.toBe(undefined)
                expect(res.symbol).toBe(obj.symbol)
                expect(res.dividends).not.toBe(undefined)
                expect(res.incomeStatements).not.toBe(undefined)
                expect(res.balanceSheets).not.toBe(undefined)
                expect(res.cashFlows).not.toBe(undefined)
                expect(res.earnings).not.toBe(undefined)
            }
        }
    }, 100000)
})


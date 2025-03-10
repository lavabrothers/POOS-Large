// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const bcrypt = require('bcrypt'); //for hashing passwords
const User = require('./models/User'); //for user signup api

// Connect to MongoDB
console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Require stock model from separate file
const Stock = require('./models/Stock');

const app = express();
app.use(express.json()); //for parsing json
const PORT = process.env.PORT || 3000;

// Define the route
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    let stockDoc = await Stock.findOne({ symbol });


    // Function to get the most recent fiscal date from an array (from income statements)
    const getLatestDate = (reports) => {
      if (!reports || reports.length === 0) return null;
      // fiscalDateEnding is in 'YYYY-MM-DD' format
      const dates = reports.map(report => new Date(report.fiscalDateEnding));
      // Get the maximum date
      return new Date(Math.max(...dates));
    };

    // Define the threshold as roughly 3 months (90 days)
    const QUARTER_MILLISECONDS = 90 * 24 * 60 * 60 * 1000;
    
    // If already in databse and up-to-date, return from our database (BYPASS ALPHA VANTAGE API)
    if (stockDoc) { // Is symbol already in database? 
      // Use incomeStatements as an example to check freshness.
      const latestFiscalDate = getLatestDate(stockDoc.incomeStatements);
      if (latestFiscalDate) { // Is there a latest fiscal date?
        const timeSinceLatest = Date.now() - latestFiscalDate.getTime();
        if (timeSinceLatest < QUARTER_MILLISECONDS) { // Is the latest fiscal date less than a quarter (3 months)?
          console.log(`Cache hit for ${symbol} (financial data is less than a quarter old).`);
          return res.json(stockDoc);
        }
      }
      console.log(`Data for ${symbol} appears to be older than a quarter. Refreshing data...`);
    } else {
      console.log(`Cache miss for ${symbol}, fetching from Alpha Vantage...`);
    }

    const apiKey = process.env.ALPHA_VANTAGE_KEY;

    const urls = {
      dividends: `https://www.alphavantage.co/query?function=DIVIDENDS&symbol=${symbol}&apikey=${apiKey}`,
      incomeStatement: `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${apiKey}`,
      balanceSheet: `https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${symbol}&apikey=${apiKey}`,
      cashFlow: `https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${symbol}&apikey=${apiKey}`,
      earnings: `https://www.alphavantage.co/query?function=EARNINGS&symbol=${symbol}&apikey=${apiKey}`
    };

    // fetch the data
    const [dividendsRes, incomeRes, balanceRes, cashFlowRes, earningsRes] = await Promise.all([
      axios.get(urls.dividends),
      axios.get(urls.incomeStatement),
      axios.get(urls.balanceSheet),
      axios.get(urls.cashFlow),
      axios.get(urls.earnings)
    ]);

    // Extract QUARTERLY data for database
    const newStock = new Stock({
      symbol,
      dividends: dividendsRes.data["data"] || [], 
      incomeStatements: incomeRes.data["quarterlyReports"] || [], 
      balanceSheets: balanceRes.data["quarterlyReports"] || [], 
      cashFlows: cashFlowRes.data["quarterlyReports"] || [], 
      earnings: earningsRes.data["quarterlyEarnings"] || [],
    });

    // If you want ALL data (quarterly and annual):
    // const newStock = new Stock({
    //   symbol,
    //   dividends: dividendsRes.data,
    //   incomeStatement: incomeRes.data,
    //   balanceSheet: balanceRes.data,
    //   cashFlow: cashFlowRes.data,
    //   earnings: earningsRes.data,
    //   lastUpdated: new Date()
    // });
    stockDoc = await newStock.save();

    console.log(`Stored data for ${symbol} in database.`);
    res.json(stockDoc);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to retrieve stock data" });
  }
});

//route for user signup (takes in username, email, password, first & last name for parameters)
app.post('/api/signup', async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Validate input fields
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email }); //checking if user already exists
    if (existingUser) {
      return res.status(400).json({ error: "A user with that email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //hashing the password

    const newUser = new User({ //making a new user w/ the user Model
      username,
      email,
      password: hashedPassword, // store the hashed password
      firstName,
      lastName
    });

    await newUser.save(); //saving user to db

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 4Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

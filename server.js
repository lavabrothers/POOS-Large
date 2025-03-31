// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const bcrypt = require('bcrypt'); //for hashing passwords
const User = require('./models/User'); //for user signup api
const Favorite = require('./models/Favorite');

// Connect to MongoDB
//console.log("MONGO_URI:", process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Require stock model from separate file
const Stock = require('./models/Stock');

const app = express();

// Change from Connor to fix cors blockage
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

app.use(express.json()); //for parsing json
const PORT = process.env.PORT || 3000;

app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await Stock.find({}).select('symbol -_id');
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


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
    const QUARTER_MILLISECONDS = 100 * 24 * 60 * 60 * 1000;

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

    // Helper function to check for rate limit message in a response object
    const hasRateLimitError = (data) => {
      return data.Information && data.Information.includes("our standard API rate limit is 25 requests per day");
    };

     // ERROR HANDLING: Check if any response indicates a rate limit error
     if (
      hasRateLimitError(dividendsRes.data) ||
      hasRateLimitError(incomeRes.data) ||
      hasRateLimitError(balanceRes.data) ||
      hasRateLimitError(cashFlowRes.data) ||
      hasRateLimitError(earningsRes.data)
    ) {
      console.error("Alpha Vantage rate limit exceeded.");
      return res.status(429).json({ error: "Alpha Vantage rate limit exceeded. Please try again later." });
    }

    // Extract quarterly data into an object
    const extractedData = {
      symbol,
      dividends: dividendsRes.data["data"] || [],
      incomeStatements: incomeRes.data["quarterlyReports"] || [],
      balanceSheets: balanceRes.data["quarterlyReports"] || [],
      cashFlows: cashFlowRes.data["quarterlyReports"] || [],
      earnings: earningsRes.data["quarterlyEarnings"] || [],
      updatedAt: new Date()
    };

    // ERROR HANDLING: Check if the extracted data is empty
    const isDataEmpty = !extractedData.incomeStatements.length &&
                        !extractedData.balanceSheets.length &&
                        !extractedData.cashFlows.length &&
                        !extractedData.earnings.length &&
                        !extractedData.dividends.length;

    if (isDataEmpty) {
      console.error(`Alpha Vantage returned no valid data for ${symbol}.`);
      return res.status(404).json({ error: `No data found for symbol ${symbol}.` });
    }

    // Now create a new document with the extracted data
    const newStock = new Stock(extractedData);

    if (stockDoc) {
      stockDoc = await Stock.findOneAndUpdate({ symbol }, extractedData, { new: true });
      console.log(`Updated data for ${symbol} in database.`);
    } else {
      stockDoc = await newStock.save();
      console.log(`Stored data for ${symbol} in database.`);
    }
    res.json(stockDoc);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Failed to retrieve stock data", details: error.message });
  }
});

// creates the favorites list of a user, this is used for the signup
app.post('/api/favorites/create', async (req, res) => {
  const {userId, stocks} = req.body;
  try{
    const found = await Favorite.findOne({ userId });
    if(found){
      return res.status(404).json({message: 'Favorites list already exists for this user.'})
    }
    const newFavorite = new Favorite({ userId, stocks });
    await newFavorite.save();
    res.status(201).json({ message: "Favorites list created successfully." });
  } catch (error) {
    console.error("Error during favorites creation:", error);
    res.status(500).json({ error: "Internal server error." });
  }
  
});

// remove a single stock from a user's favorite list
app.put('/api/favorites/remove', async (req, res) => {
  const { userId, symbol } = req.body;

  try{
    // find user's favorite list;
    const favorite = await Favorite.findOne({ userId });

    if(!favorite){ // does not exist
      return res.status(404).json({message: 'Favorites not found for this user.'});
    }

    const symbolExist = await Favorite.findOne({ symbol });
    if(!symbolExist){ // does not exist
      return res.status(404).json({message: 'This stock is not in this favorites list.'});
    }

    const oldStocks = [...favorite.stocks]; // old list

    const newStocks = favorite.stocks.filter(stock => stock.symbol !== symbol); // new list without the stock

    favorite.stocks = newStocks; // store new stocks list

    await favorite.save();

    res.json({message: `Stock ${symbol} removed.`});
  } catch(err){
    res.status(500).json({ error: "Internal server error." });
  }
});

app.put('/api/favorites/add', async(req, res) => {
  const { userId, symbol, stockName } = req.body;

  try{
    const favorite = await Favorite.findOne({ userId });

    if(!favorite) {
      return res.status(404).json({message: 'Favorites not found for this user.'})
    }
    const oldStocks = [...favorite.stocks];

    // check if stock is already in the list
    const exists = favorite.stocks.some(
      stock => stock.symbol === symbol
    );

    if(exists){
      return res.status(400).json({message: `Stock ${symbol} already exists in favorites list.`})
    }

    favorite.stocks.push({symbol, stockName});

    await favorite.save();

    res.json({ message: `Stock ${symbol} added.`});
  } catch(err){
    console.error('Error adding stock to favorites:', err); 
    res.status(500).json({ error: "Internal server error." })
  }
}); 

app.get('/api/favorites/search', async(req, res) => {
  const { userId, query } = req.query;

  try{
    // find a user's favorites list first
    const favList = await Favorite.findOne({ userId });

    if (!favList) {
      return res.status(404).json({message: 'Favorites not found for this user.'});
    }
    let filtered = favList.stocks;

    if (query) {
      filtered = favList.stocks.filter(stock => stock.symbol.includes(query) || stock.stockName.includes(query));
    }

    res.json({stocks: filtered});
  } catch(error){
      console.error('Error occurred:', error);
      res.status(500).json({ error: "Internal server error." });
  }
});

//route for user signup (takes in username, email, password, first & last name for parameters)
app.post('/api/signup', async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Validate input fields
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(403).json({ error: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ email }); //checking if user already exists
    if (existingUser) {
      return res.status(403).json({ error: "A user with that email already exists." });
    }
    console.log("checking username: ", username);
    const usernameTaken = await User.findOne({ username }); //checking if username is taken
    if (usernameTaken) {
      return res.status(403).json({ error: "Username is taken." });
    }

    const emailValidate = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if(!emailValidate.test(email)){
      return res.status(403).json({ error: "Invalid email."})
    }
  
  
    // makes sure the password is more than 8 chars, contains at least one letter
    // contains at least one number, and a special character
    if( !( password.length >= 8 && 
      (/[a-zA-Z]/.test(password) && 
      (/[0-9]/.test(password) && 
      (/[!\"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(password))))
        ) ) {
          return res.status(403).json({ error: "Password must be 8+ characters long. Also contain at least one letter, number, and special character."});
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
    const user = await User.findOne({ username })
    const userData = user.toObject()
    res.status(201).json({ message: "User created successfully.", user: userData});
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post('/api/login', async (req, res) => { //route for login
  const { username, password } = req.body;

  if (!username || !password) { //validating inputs
    return res.status(403).json({ error: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username }); //checking if user exists
    if (!user) {
      return res.status(403).json({ error: "Invalid username or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid username or password." });
    }

    const userData = user.toObject();
    delete userData.password; //removing password

    res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});


// 4Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});

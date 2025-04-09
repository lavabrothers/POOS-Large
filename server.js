// server.js
//This is a text
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bcrypt = require('bcrypt'); //for hashing passwords
const User = require('./models/User'); //for user signup api
const Favorite = require('./models/Favorite');
const postmark = require("postmark");
const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN);
const crypto = require('crypto');
const StockInfo = require('./models/StockInfo');
const NewsTickerCache = require('./models/NewsTickerCache'); //for caching news ticker


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

    // Define the threshold as roughly 3 months (90 days) - (Changed to 200 days to fix late entries)
    const QUARTER_MILLISECONDS = 200 * 24 * 60 * 60 * 1000;

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

app.get('/api/stockInfo', async(req, res) =>{
  const { ticker } = req.query;
  try{
    const stock = await StockInfo.findOne({ticker: ticker.toUpperCase()});

    if(!stock){
      return res.status(404).json({message: 'Stock not found'});
    }

    res.json(stock);

  }catch (error) {
    res.status(500).json({ error: "Internal server error." });
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
    res.status(500).json({ error: "Internal server error." });
  }
  
});

// remove a single stock from a user's favorite list
app.put('/api/favorites/remove', async (req, res) => {
  const { userId, symbol } = req.body;

  try {
    // Find the user's favorites document
    const favorite = await Favorite.findOne({ userId });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorites not found for this user.' });
    }

    // Check if the stock exists in the user's favorites list
    const stockExists = favorite.stocks.some(stock => stock.symbol === symbol);
    if (!stockExists) {
      return res.status(404).json({ message: 'This stock is not in this favorites list.' });
    }

    // Filter out the stock from the favorites array
    favorite.stocks = favorite.stocks.filter(stock => stock.symbol !== symbol);

    // Save the updated document
    await favorite.save();

    res.json({ message: `Stock ${symbol} removed.` });
  } catch (err) {
    console.error('Error removing favorite:', err);
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

  // Basic regex check for email
  const emailValidate = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  if (!emailValidate.test(email)) {
    return res.status(403).json({ error: "Invalid email." });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(403).json({ error: "A user with that email already exists." });
    }
    console.log("checking username: ", username);
    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      return res.status(403).json({ error: "Username is taken." });
    }
  
    // Validate and hash password
    if (
      !(
        password.length >= 8 &&
        /[a-zA-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[!\"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(password)
      )
    ) {
      return res.status(403).json({ 
        error: "Password must be 8+ characters long and contain at least one letter, one number, and one special character." 
      });
    }    
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      verified: false
    });
  
    // Generate a verification token and expiration (1 hour)
    const verificationToken = crypto.randomBytes(20).toString('hex');
    console.log("Generated token:", verificationToken); //TODO: Deleteme
    newUser.verificationToken = verificationToken;

    // Save the new user
    await newUser.save();

    // Construct the verification URL
    const verificationUrl = `http://134.122.3.46:3000/api/verify?token=${verificationToken}`;

    // Prepare the email message using Postmark
    postmarkClient.sendEmail({
      "From": "lo859155@ucf.edu", // Must be a verified sender in Postmark - Logan's UCF email
      "To": newUser.email,
      "Subject": "Verify your email address",
      "TextBody": `Please verify your email by clicking the following link: ${verificationUrl}`,
      "HtmlBody": `<p>Thank you for joining Finstats!\n\nPlease verify your email by clicking <a href="${verificationUrl}">here</a>.</p>`
    }).then(response => {
      console.log('Verification email sent:', response);
    }).catch(error => {
      console.error('Error sending verification email:', error);
    });

    res.status(201).json({ 
      message: "User created successfully. Please check your email to verify your account.",
      user: newUser
    });
  } catch (error) {
    console.error("Error during user signup:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get('/api/verify', (req, res) => {
  const token = req.query.token;
  // Serve an HTML page with a confirmation button
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
        button { padding: 10px 20px; font-size: 16px; }
      </style>
    </head>
    <body>
      <h1>Confirm Your Email Address</h1>
      <p>To verify your email, please click the confirm button below.</p>
      <form action="/api/verify-email" method="GET">
        <input type="hidden" name="token" value="${token}" />
        <button type="submit">Confirm</button>
      </form>
    </body>
    </html>
  `);
});

app.get('/api/verify-email', async (req, res) => {
  const token = req.query.token;
  console.log("Received token:", token); //TODO: DELETEME
  if (!token) {
    return res.status(400).send('Verification token is missing.');
  }

  try {
    // Find the user with the matching token
    const user = await User.findOne({ verificationToken: token });
    console.log("User found:", user); //TODO: DELETME

    if (!user) {
      return res.status(400).send('Verification token is invalid or has expired.');
    }

    // Update the user's status to verified and remove the token fields
    user.verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.send('Email verified successfully! You can now log in.');

    // Clear verification token
    user.verificationToken = undefined;
    await user.save();
  } catch (error) {
    console.error('Error during email verification:', error);
    res.status(500).send('Internal server error.');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) { // Validate inputs
    return res.status(403).json({ error: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username }); // Check if user exists
    if (!user) {
      return res.status(403).json({ error: "Invalid username or password." });
    }

    // Check if the user is verified
    if (!user.verified) {
      return res.status(403).json({ error: "User is not verified. Please check your email to verify your account. You may want to check your spam or junk folder." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid username or password." });
    }

    const userData = user.toObject();
    delete userData.password; // Remove the password from the response

    res.status(200).json({ message: "Login successful", user: userData });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.post('/api/request-password-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "Email does not exist in our database." });
    }

    // Generate a reset token (overwriting verificationToken)
    const token = crypto.randomBytes(20).toString('hex');
    user.verificationToken = token;
    await user.save();

    const resetUrl = `http://134.122.3.46:3000/api/reset-password?token=${token}`;

    postmarkClient.sendEmail({
      From: "lo859155@ucf.edu",
      To: user.email,
      Subject: "Password Reset Request",
      TextBody: `You requested a password reset. Click this link to reset your password: ${resetUrl}`,
      HtmlBody: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    }).then(response => {
      console.log('Password reset email sent:', response);
    }).catch(error => {
      console.error('Error sending password reset email:', error);
    });

    res.status(200).json({ message: "A reset link has been be sent." });
  } catch (err) {
    console.error('Error in request password reset:', err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get('/api/reset-password', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Token is missing." });
  }

  // Wait for the user to be found
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    return res.status(400).json({ error: "Token is invalid." });
  }

  // Serve a simple HTML page with a form to reset the password
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
        input { padding: 10px; margin: 5px; font-size: 16px; }
        button { padding: 10px 20px; font-size: 16px; }
        #feedback { margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>Reset Your Password</h1>
      <form id="resetForm">
        <input type="hidden" name="token" value="${token}" />
        <div>
          <input type="password" name="newPassword" placeholder="New Password" required />
        </div>
        <div>
          <input type="password" name="confirmPassword" placeholder="Confirm New Password" required />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      <div id="feedback"></div>

      <script>
        const form = document.getElementById('resetForm');
        const feedback = document.getElementById('feedback');

        form.addEventListener('submit', async (e) => {
          e.preventDefault();

          const token = form.elements.token.value;
          const newPassword = form.elements.newPassword.value;
          const confirmPassword = form.elements.confirmPassword.value;

          try {
            const res = await fetch('/api/reset-password', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ token, newPassword, confirmPassword })
            });

            const data = await res.json();
            if (data.error) {
              feedback.textContent = data.error;
              feedback.style.color = "red";
            } else {
              feedback.textContent = data.message || "Password has been reset successfully!";
              feedback.style.color = "green";
            }
          } catch (error) {
            console.error('Error:', error);
            feedback.textContent = "An error occurred. Please try again.";
            feedback.style.color = "red";
          }
        });
      </script>
    </body>
    </html>
  `);
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ error: "Password reset token is invalid." });
    }

    // Validate new password complexity
    if (
      !(
        newPassword.length >= 8 &&
        /[a-zA-Z]/.test(newPassword) &&
        /[0-9]/.test(newPassword) &&
        /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(newPassword)
      )
    ) {
      return res.status(403).json({
        error: "Password must be 8+ characters long and contain at least one letter, one number, and one special character."
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.verificationToken = undefined; // Clear token field
    await user.save();

    // Return JSON so the client can call res.json()
    return res.json({ message: "Password has been reset successfully! You can now log in." });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get('/api/newsticker', async (req, res) => {
  try {
    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) {
      return res.status(500).json({ error: "News API key not configured." });
    }
    
    //checks if the cache exists and is newer than 24 hours 
    const cacheEntry = await NewsTickerCache.findOne({});
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const thirtyminutes = 1800000;

    if (cacheEntry && (now - cacheEntry.updatedAt < thirtyminutes)) {
      console.log('Returning cached news ticker data');
      return res.json({ status: "ok", articles: cacheEntry.articles });
    }

    //cache is stale, fetch new data
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        country: 'us',
        category: 'business',
        apiKey: newsApiKey
      }
    });

    if (response.data.status === "ok") {
      const headlines = response.data.articles.map(article => ({
        title: article.title,
        url: article.url
      }));

      //add the new data
      await NewsTickerCache.findOneAndUpdate(
        {}, 
        { articles: headlines, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      console.log('Fetched new data from the API and updated cache.');
      return res.json({ status: "ok", articles: headlines });
    } else {
      return res.status(500).json({ error: "Error fetching headlines", details: response.data });
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    return res.status(500).json({ error: "Error fetching news", details: error.message });
  }
});


// 4Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
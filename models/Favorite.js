// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
mongoose.models = {};

const stocksSchema = new mongoose.Schema({
    symbol: String,
    stockName: String
});

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    stocks: [stocksSchema]
})

const Favorite = mongoose.model('favorites', favoriteSchema);

module.exports = Favorite;
// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const stocksSchema = new mongoose.Schema({
    symbol: String,
    stockName: String
});

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    stocks: [stocksSchema]
})

const Favorite = mongoose.model('Favorites', favoriteSchema);

module.exports = Favorite;
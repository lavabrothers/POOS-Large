//caching mechanism for the news ticker api
const mongoose = require('mongoose');

const NewsTickerCacheSchema = new mongoose.Schema({
  articles: [{
    title: String,
    url: String
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NewsTickerCache', NewsTickerCacheSchema);

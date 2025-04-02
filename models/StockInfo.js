// models/StockInfo
import mongoose from 'mongoose';
const { Schema } = mongoose;

const infoSchema = new Schema({
  "ticker": { type: String, required: true, unique: true },
  "company name":{ type: String, required: true },
  "short name": { type: String }, 
  "industry": { type: String },
  "description":  { type: String },
  "website": {type: String },
  "logo": { type: String },  // Store the file name of the logo
  "ceo": { type: String },
  "exchange": { type: String },
  "market cap": { type: Number },
  "sector": { type: String },
  "tag 1": { type: String },
  "tag 2": { type: String },
  "tag 3": { type: String },
}, { timestamps: true });

const StockInfo = mongoose.model('StockInfo', infoSchema);
export default StockInfo;
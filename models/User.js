// models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },  //storing the hashed password
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('UserTest', userSchema, 'Users'); //actualy returning the model
//module.exports = userSchema;

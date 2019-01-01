const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const UserSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Mobile no. is required.'],
    trim: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    trim: true
  },

  lives: {
    type: Number,
    required: true,
    default: 3
  }

});


UserSchema.plugin(timestamp);
UserSchema.plugin(mongooseStringQuery);

const User = mongoose.model('User', UserSchema);
module.exports = User;
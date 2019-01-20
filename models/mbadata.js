const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const MbaDataSchema = new mongoose.Schema({
  mobile: {
    type: String,
    required: [true, 'Mobile no. is required.'],
    trim: true,
    unique: true
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

  mht_id: {
    type: Number,
    required: true,
    unique: true
  },
  
  center: {
    type: String,
    required: true    
  }
  
});


MbaDataSchema.plugin(timestamp);
MbaDataSchema.plugin(mongooseStringQuery);

const MbaData = mongoose.model('MbaData', MbaDataSchema);
module.exports = MbaData;
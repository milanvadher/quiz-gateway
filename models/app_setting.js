const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const ApplicationSettingSchema = new mongoose.Schema({
  
  negative_per_question: {
    type: Number,
    required: true
  },
  total_life: {
    type: Number,
    required: true,
    default: 3
  },

  score_per_life: {
    type: Number,
    required: true,
    default: 100  
  } 
  
});

ApplicationSettingSchema.plugin(timestamp);
ApplicationSettingSchema.plugin(mongooseStringQuery);

const ApplicationSetting = mongoose.model('ApplicationSetting', ApplicationSettingSchema);
module.exports = ApplicationSetting;
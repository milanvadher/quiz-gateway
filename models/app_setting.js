const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const ApplicationSettingSchema = new mongoose.Schema({
  
  negative_per_question: {
    type: Number,
    required: true
  },
  total_lives: {
    type: Number,
    required: true,
    default: 3
  },

  score_per_lives: {
    type: Number,
    required: true,
    default: 100  
  },
  username: {
    type:String,
    required: true
  },
  negative_per_hint:
  {
    type:Number,
    required: true
  },
  passeord: {
    type:String,
    required: true
  }
  
});

ApplicationSettingSchema.plugin(timestamp);
ApplicationSettingSchema.plugin(mongooseStringQuery);

const ApplicationSetting = mongoose.model('ApplicationSetting', ApplicationSettingSchema);
module.exports = ApplicationSetting;
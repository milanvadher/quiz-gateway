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
    type: String,
    required: true
  },

  negative_per_hint: {
    type: Number,
    required: true
  },

  password: {
    type: String,
    required: true
  }
  
});

ApplicationSettingSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.__v;
  delete obj._id;
  return obj;
};

ApplicationSettingSchema.plugin(timestamp);
ApplicationSettingSchema.plugin(mongooseStringQuery);

const ApplicationSetting = mongoose.model('ApplicationSetting', ApplicationSettingSchema);
module.exports = ApplicationSetting;
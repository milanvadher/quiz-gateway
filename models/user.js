const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const UserSchema = new mongoose.Schema({
  mobile: {
    type: String,
    trim: true
  },

  password: {
    type: String
    //required: true
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
  },

  isactive: {
    type: Boolean,
    required: true,
    default: 1
  },
  
  contactNumber: {
    type: Number,
    required: true,
    unique: true
  },
  
  center: {
    type: String,
    required: true    
  },
  
  bonus: {
    type: Number,
    required: true    
  },
  
  totalscore: {
    type: Number,
    required: true    
  },

  question_id: {
    type: Number
    //,    required: true    
  },

  fb_token: {
    type: String
  },

  onesignal_token: {
    type: String
  },

  img: {
    type: String
  },

  user_group: {
    type: String,
    enum: ['SANKUL','MBA'],
    required: true,
    default: 'MBA'
  },

  token: {
    type: String
  },


  totalscore_month: {
    type: Number,
    default: 0
  },

  totalscore_month_update: {
    type:Date
  },

  totalscore_week: {
    type: Number,
    default: 0
  },

  totalscore_week_update: {
    type: Date    
  }
});

UserSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj._id;
  return obj;
};

UserSchema.plugin(timestamp);
UserSchema.plugin(mongooseStringQuery);

const User = mongoose.model('User', UserSchema);
module.exports = User;
const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

const UserScoreSchema = new mongoose.Schema({
  user_mobile: {
    type: String,
    required: true,
    trim: true
  },

  question_st: {
    type: Number,
    required: true,
    default: 0
  },

  level: {
    type: Number,
    required: true,
    default: 0  
  },

  score: {
    type: Number,
    required: true,
    default: 0  
  },
 current_score: {
    type: Number,
    required: true,
    default: 0  
  },

  lives: {
    type: Number,
    required: true,
    default: 3
  }

//   lifelines: {
//     type: String,
//     required: true,
//     default: 0  
//   },
  
});

UserScoreSchema.plugin(timestamp);

const UserScore = mongoose.model('UserScore', UserScoreSchema);
module.exports = UserScore;
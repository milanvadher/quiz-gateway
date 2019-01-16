const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const UserScoreSchema = new mongoose.Schema({
  // user_mobile: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },

  MHT_Id: {
    type: Number,
    required: true
  },
  question_st: {
    type: Number,
    required: true,
    default: 1
  },

  level: {
    type: Number,
    required: true,
    default: 1  
  },

  score: {
    type: Number,
    required: true,
    default: 0  
  },

  total_questions: {
      type: Number,
      required:true
  },

  // current_score: {
  //   type: Number,
  //   required: true,
  //   default: 0  
  // },

  completed: {
    type: Boolean,
    default: false
  }

//   lifelines: {
//     type: String,
//     required: true,
//     default: 0  
//   },
  
});

UserScoreSchema.plugin(timestamp);
UserScoreSchema.plugin(mongooseStringQuery);

const UserScore = mongoose.model('UserScore', UserScoreSchema);
module.exports = UserScore;
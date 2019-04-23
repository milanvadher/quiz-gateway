const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const UserScoreSchema = new mongoose.Schema({
  // user_mobile: {
  //   type: String,
  //   required: true,
  //   trim: true
  // },

  mht_id: {
    type: Number,
    required: true
  },
  question_st: {
    type: Number,
    required: true,
    default: 1
  },

  question_read_st: {
    type: Number,
    required: true,
    default: 0
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
      required:true,
      default: 10
  },

  fifty_fifty: {
    type: Boolean,
    required: true,
    default: true
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

UserScoreSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.__v;
  delete obj._id;
  return obj;
};

UserScoreSchema.plugin(timestamp);
UserScoreSchema.plugin(mongooseStringQuery);

const UserScore = mongoose.model('UserScore', UserScoreSchema);
module.exports = UserScore;
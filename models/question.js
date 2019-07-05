const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const OptionSchema = new mongoose.Schema({
    option_number: {
        type: Number,
        required: true
    },
    option: {
        type: String,
        required: true,
      trim: true
    }
});

const AnswerSchema = new mongoose.Schema({
  answer: {
      type: String,
      required: true,
    trim: true
  }
});

const QuestionSchema = new mongoose.Schema({

  question_st: {
    type: Number,
    required: true
  },

  question_type: {
    type:  String,
    enum: ['MCQ','PIKACHAR'],
    required: true,
    default: 'MCQ'
  },

  question: {
    type: String,
    required: true,
    trim: true
  },

  options: [OptionSchema],

  score: {
    type: Number,
    trim: true,
    default: 10
  },

  answer: [AnswerSchema],
  pikacharanswer: [[String]],

  artifact_type: {
    type: String,
    trim: true
  },

  artifact_url: {
    type: String,
    trim: true
  },

  artifact_path: {
    type: String,
    trim: true
  },

  level: {
    type: Number
  },

  quiz_type: {
    type: String,
    enum: ['REGULAR','BONUS'],
    required: true,
    default: 'REGULAR'
  },

  question_id: {
    type: Number,
    required: true
  },

  date: {
    type: Date
  },

  reference : {
    type: String
  },

  jumbledata: [String],

  timeout: {
    type: Number,
    default: 0
  }
});

QuestionSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.__v;
  delete obj._id;
  return obj;
};

QuestionSchema.plugin(timestamp);
QuestionSchema.plugin(mongooseStringQuery);

const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;
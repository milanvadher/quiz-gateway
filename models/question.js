const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

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

const QuestionSchema = new mongoose.Schema({
  question_st: {
    type: Number,
    required: true
  },

  question_type: {
    type: String,
    enum: ['MCQ'],
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
    trim: true
  },

  answer: {
    type: String,
    required: true,
    trim: true
  },

  artifact_type: {
    type: String,
    trim: true
  },

  artifact_path: {
    type: String,
    trim: true
  },

  level: {
    type: Number,
    required: true  
  }
  
});

QuestionSchema.plugin(timestamp);

const Question = mongoose.model('Question', QuestionSchema);
module.exports = Question;
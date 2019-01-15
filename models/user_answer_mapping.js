const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const UserAnswerMappingSchema = new mongoose.Schema({
  mht_id: {
    type: Number,
    required: true
  },
  question_id: {
    type: Number,
    required: true  
  },
 quize_type: {
    type: String,
    enum: ['REGULAR','BONUS'],
    required: true,
    default: 'REGULAR'
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  answer_status: {
      type:Boolean,
      required: true
  }

});


UserAnswerMappingSchema.plugin(timestamp);
UserAnswerMappingSchema.plugin(mongooseStringQuery);

const UserAnswerMapping = mongoose.model('UserAnswerMapping', UserAnswerMappingSchema);
module.exports = UserAnswerMapping;
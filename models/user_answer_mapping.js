const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const AnswerSchema = new mongoose.Schema({
  answer: {
      type: String,
      required: true,
      trim: true    
  }
});

const UserAnswerMappingSchema = new mongoose.Schema({
  contactNumber: {
    type: String,
    required: true
  },
  question_id: {
    type: Number,
    required: true  
  },
 quiz_type: {
    type: String,
    enum: ['REGULAR','BONUS'],
    required: true,
    default: 'REGULAR'
  },
  answer: {
    type: String, 
    trim: true
  },
  // answer: [AnswerSchema],

  // pikacharanswer: [AnswerSchema],
  answer_status: {
      type:Boolean,
      required: true
  }

});

UserAnswerMappingSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.__v;
  delete obj._id;
  return obj;
};


UserAnswerMappingSchema.plugin(timestamp);
UserAnswerMappingSchema.plugin(mongooseStringQuery);

const UserAnswerMapping = mongoose.model('UserAnswerMapping', UserAnswerMappingSchema);
module.exports = UserAnswerMapping;
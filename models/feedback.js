const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const FeedbackSchema = new mongoose.Schema({
  
  contact: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true,
  }

});

FeedbackSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.__v;
  delete obj._id;
  return obj;
};

FeedbackSchema.plugin(timestamp);
FeedbackSchema.plugin(mongooseStringQuery);

const Feedback = mongoose.model('Feedback', FeedbackSchema);
module.exports = Feedback;
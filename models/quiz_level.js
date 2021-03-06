const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');
const CategorySchema = new mongoose.Schema({
    category_number: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
      trim: true
    }
});
const QuizLevelSchema = new mongoose.Schema({
    level_index: {
        type: Number,
        required: true,
        unique:true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    level_type: {
        type: String,
      enum: ['REGULAR', 'TIME_BASED'],
        required: true,
        trim: true
    },
    total_questions: {
        type: Number,
        required: true
    },
    categorys: [CategorySchema],
    start_date: {
        type: Date,
        required:true
    },
    end_date: {
        type: Date
    },
    description:{
        type:String
    },
    imagepath: {
        type:String
    }
});


QuizLevelSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.__v;
  delete obj._id;
  return obj;
};

QuizLevelSchema.plugin(timestamp);
QuizLevelSchema.plugin(mongooseStringQuery);
const QuizLevel = mongoose.model('QuizLevel', QuizLevelSchema);

module.exports = QuizLevel;

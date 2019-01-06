const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const QuizLevelSchema = new mongoose.Schema({
    level_index: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    level_type: {
        type: String,
        enum: ['Regular'],
        required: true,
        trim: true
    },
    total_questions: {
        type: Number,
        required:true
    }
});

QuizLevelSchema.plugin(timestamp);
QuizLevelSchema.plugin(mongooseStringQuery);
const QuizLevel = mongoose.model('QuizLevel', QuizLevelSchema);

module.exports = QuizLevel;

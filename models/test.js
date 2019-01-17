const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const TestSchema = new mongoose.Schema(
    {
        task: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'complete', 'in progress', 'overdue'],
            default: 'pending',
        },
    },
    { minimize: false },
);

TestSchema.plugin(timestamps);
TestSchema.plugin(mongooseStringQuery);

const Test = mongoose.model('Test', TestSchema);
module.exports = Test;
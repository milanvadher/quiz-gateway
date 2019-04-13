const mongoose = require('mongoose');
const mongooseStringQuery = require('mongoose-string-query');
const timestamps = require('mongoose-timestamp');

const TestSchema = new mongoose.Schema(
    {
        habit: {
            type: String,
            trim: true,
        },
        timestamps: {
            type: Date
        },
        value: {
            type: Number
        },
        remark: {
            type: String
        }
    },
    { minimize: false },
);

TestSchema.plugin(timestamps);
TestSchema.plugin(mongooseStringQuery);

const Test = mongoose.model('Test', TestSchema);
module.exports = Test;
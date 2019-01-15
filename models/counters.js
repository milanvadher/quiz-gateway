const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const CounterSchema = new mongoose.Schema({
    
    sequence_value : {
      type: Number
    },
    question_id: {
        type:String
    }
  
});

CounterSchema.plugin(timestamp);
CounterSchema.plugin(mongooseStringQuery);

const Counter = mongoose.model('Counter', CounterSchema);
module.exports = Counter;
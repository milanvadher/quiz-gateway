const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const CounterSchema = new mongoose.Schema({
    sequence_value : {
      type: Number
    },
    sequence_name: {
      type: String
    }
});

CounterSchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.__v;
  delete obj._id;
  return obj;
};

CounterSchema.plugin(timestamp);
CounterSchema.plugin(mongooseStringQuery);

const Counter = mongoose.model('Counter', CounterSchema);
module.exports = Counter;
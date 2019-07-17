const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const mongooseStringQuery = require('mongoose-string-query');

const UsersHistorySchema = new mongoose.Schema({
  mht_id: {
    type: Number,
    required: true
  },
  
  totalscore: {
    type: Number,
    default: 0
  },

  monthdate: {
    type:Date
  },

  img_dropbox_url : {
    type: String,
  },
  name : {
    type: String,
  },
});

UsersHistorySchema.methods.toJSON = function() {
  let obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  delete obj._id;
  return obj;
};

UsersHistorySchema.plugin(timestamp);
UsersHistorySchema.plugin(mongooseStringQuery);

const UsersHistory = mongoose.model('UsersHistory', UsersHistorySchema);
module.exports = UsersHistory;
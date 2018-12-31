const mongoose = require('mongoose');

const UserLoginSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: [true, 'Mobile no. is required.'],
        trim: true,
    },

    password: {
        type: String,
        required: true
    }

});

const UserLogin = mongoose.model('UserLogin', UserLoginSchema);

module.exports = UserLogin;

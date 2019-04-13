const User = require('../models/user');

var token_cache = {
    
    token_cache_: {},

    get: function(mht_id) {
        return token_cache_[mht_id];
    },

    set: function(mht_id, token) {
        token_cache_[mht_id]= token;
    },

    init: async function() {
        let users = await User.find({}, "token");
        users.forEach((user) => {
            token_cache_[user.mht_id] = user.token;
        });
    },

    clear: function() {
        token_cache_ = {}
    }

}

exports.token_cache;
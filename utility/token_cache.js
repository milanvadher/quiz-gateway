const User = require('../models/user');

class TokenCache {
    
    constructor() {
        this.token_cache_ = {};
    }
    

    get(mht_id) {
        return this.token_cache_[mht_id];
    }

    set(mht_id, token) {
        this.token_cache_[mht_id]= token;
    }

    async init() {
        let users = await User.find({}, "mht_id token");
        users.forEach((user) => {
            this.token_cache_[user.mht_id] = user.token;
        });
    }

    clear() {
        this.token_cache_ = {}
    }

}


class Singleton {

    constructor() {
        if(!Singleton.instance) {
            Singleton.instance = new TokenCache();
        }
    }

    getInstance() {
        return Singleton.instance;
    }

}

module.exports = Singleton;
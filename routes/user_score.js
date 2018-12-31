/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const UserScore = require('../models/user_score');

module.exports = function (server) {

    /**
     * LIST User Score
     */
    server.get('/user_score', (req, res, next) => {

        UserScore.find({}, function (err, docs) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }
            res.send(docs);
            next();
        });
    });


};
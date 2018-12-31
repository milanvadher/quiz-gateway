/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const User = require('../models/user');

module.exports = function (server) {

	/**
	 * POST
	 */
    server.post('/register', (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'"),
            );
        }

        let data = req.body || {};

        let user = new User(data);
        user.save(function (err) {
            if (err) {
                console.error(err);
                return next(new errors.InternalError(err.message));
                // next();
            }
            res.send(201);
            next();
        });
    });

    /**
	 * LIST
	 */
    server.get('/users', (req, res, next) => {
        User.apiQuery(req.params, function (err, docs) {
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
/**
 * Module Dependencies
 */
const errors = require('restify-errors');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

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

        bcrypt.hash(req.body.password, SALT_WORK_FACTOR).then((hashPassword) => {
            data.password = hashPassword;
            let user = new User(data);
            user.save(function (err) {
                if (err) {
                    console.error(err);
                    return next(new errors.InternalError(err.message));
                    // next();
                }
                res.send(201, { msg: 'User created successfully !!' });
                next();
            });
        });

    });

    /**
	 * LOGIN
	 */
    server.post('/login', (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'"),
            );
        }

        let data = req.body || {};

        User.findOne({ mobile: data.mobile }, function (err, doc) {
            if (err) {
                console.log(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }
            
            if (doc) {
                bcrypt.compare(data.password, doc.password, (err, result) => {
                    if (!result) {
                        res.send(403, { msg: 'Password is incorrect.' });
                        next();
                    } else {
                        res.send(200, doc);
                        next();
                    }
                });
            } else {
                res.send(404, { msg: 'User not found.' });
                next();
            }
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

    /**
	 * DELETE
	 */
    server.del('/user/:id', (req, res, next) => {
        User.remove({ _id: req.params.id }, function (err) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }

            res.send(204);
            next();
        });
    });

};

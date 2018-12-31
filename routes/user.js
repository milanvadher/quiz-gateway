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
const UserLogin = require('../models/user_login');

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
                res.send(201);
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

        console.log('Data ', data);

        UserLogin.findOne({ mobile: 7574852413 },function (err, doc) {
            if (err) {
                console.log(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }
            console.log('*******************', doc);
            return bcrypt.compare(data.password, doc.password);
        }).then((result) => {
            if (!result) {
                res.send(403).message('You are not authorised.')
            }
            res.send(doc);
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

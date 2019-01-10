/**
 * Module Dependencies
 */
const errors = require('restify-errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../config');

/**
 * Model Schema
 */
const User = require('../models/user');

const SALT_WORK_FACTOR = 10;
/**
 * POST
 */
exports.register_user = function (req, res, next) {
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

};

/**
 * LOGIN
 */
exports.login = async function (req, res, next) {
    try {
        let data = req.body || {};

        let user = await User.findOne({ mobile: data.mobile });

        if (user) {
            let result = await bcrypt.compare(data.password, user.password);
            if (!result) {
                res.send(226, { msg: 'Password is incorrect.' });
                next();
            } else {
                let token = jwt.sign({ mobile: data.mobile }, config.jwt_secret, {
                    expiresIn: '12h'
                });
                res.send(200, { success: true, user_info: user, token: token });
                next();
            }
        } else {
            res.send(404, { msg: 'User not found.' });
            next();
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/**
 * LIST
 */
exports.get_users = function (req, res, next) {
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
};

/**
 * DELETE
 */
exports.delete = function (req, res, next) {
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
};

/**
 * Module Dependencies
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../config');

/**
 * Model Schema
 */
const User = require('../models/user');

/**
 * Veriables
 */
const SALT_WORK_FACTOR = 10; // For unique password even if same password (For handle brute force attack)

/**
 * Register user with unique mobile no and encypted password.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {msg}
 */
exports.register = async function (req, res, next) {
    try {
        let data = req.body || {};

        let hashPassword = await bcrypt.hash(req.body.password, SALT_WORK_FACTOR);

        data.password = hashPassword;

        let user = new User(data);

        let result = await user.save();

        if (result) {
            res.send(201, { msg: 'User created successfully !!' });
            next();
        } else {
            res.send(409, { msg: 'User Already exist.' });
            next();
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/**
 * Login user with mobile no and password.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {User}
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
 * Get user list.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {User}
 */
exports.list = async function (req, res, next) {
    try {
        
        let users = await User.apiQuery(req.params);
        if (users) {
            res.send(users);
            next();
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/**
 * Delete user by _id
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {User}
 */
exports.remove = async function (req, res, next) {
    try {
        let result = await User.remove({ _id: req.params.id });
        if (result.n) {
            res.send(200, { msg: "User deleted successfully !!" });
            next();
        } else {
            res.send(404, { msg: "User not found" });
            next();
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

 
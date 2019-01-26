/**
 * Module Dependencies
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../config');
const request = require('request');
const rn = require('random-number');
/**
 * Model Schema
 */
const User = require('../models/user');
const MBAData = require('../models/mbadata');
const ApplicationSetting = require('../models/app_setting');

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
        let hashPassword = await bcrypt.hash(req.body.password, SALT_WORK_FACTOR);
        let app_setting = await ApplicationSetting.findOne({});
        let user = new User(
            {
                "mobile": req.body.mobile,
                "password": hashPassword,
                "name": req.body.name,
                "email": req.body.email,
                "lives": app_setting.total_lives,
                "isactive": true,
                "mht_id": req.body.mht_id,
                "center": req.body.center,
                "bonus": 0,
                "question_id": 0,
                "totalscore": 0
            });
        new_user = await user.save();
        res.send(200, new_user);
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
        let user = await User.findOne({ mht_id: data.mht_id });
        if (user) {
            let result = await bcrypt.compare(data.password, user.password);
            if (!result) {
                res.send(226, { msg: 'Password is incorrect.' });
                next();
            } else {
                let token = jwt.sign({ mht_id: data.mht_id }, config.jwt_secret);
                user = user.toObject();
                user.token = token;
                res.send(200, user);
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
            res.send(200, {users:users});
            next();
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/**
 * To get rank, you need to send mht_id of the user of whose rank is needed in the header
 */
exports.leaders = async function (req, res, next) {
    try {
        let leaders = await User.find(
            {},
            null,
            {
                limit: 10,
                sort: {
                    totalscore: -1
                }
            });


        let userRank;

        // Send MHT-ID in header
        // If mht_id not sent, or wrong MHT-id sent, if fails silently
        try {
            userRank = await getRank(req.headers.mht_id);
        }
        catch (e) {
        }

        if (leaders) {
            res.send(200, {
                leaders,
                userRank
            });
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

 /**
 * Generate OTP and chekc user is exsist in MBA Data if yes then check applicaiton data if no give message.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {User}
 */
exports.validate_user =async function (req, res, next) {
    try {
        let options = {min:  100000, max:  999999, integer: true};
        let user_otp = rn(options);
        let result = await MBAData.findOne({"mht_id": req.body.mht_id, "mobile": req.body.mobile});
        console.log(result);
        if (result && result.mobile) {
            console.log(process.env.SMS_KEY);
            request('http://api.msg91.com/api/sendhttp.php?country=91&sender=QUIZEAPP&route=4&mobiles=+' + result.mobile + '&authkey=' + process.env.SMS_KEY + '&message=JSCA! This is your one-time password ' + user_otp + '.', { json: true }, (err, otp, body) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ msg: "An error occurred when sending OTP." });
                } else {
                    res.send(200, { otp: user_otp, msg: 'OTP is send to your Contact number.', data: result});
                }
            });
        } else {
            res.status(400).json({ msg: "Your mobile number is not in MBA list. Kindly update !!" });
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};


/**
 * Generate OTP and chekc user is exsist in MBA Data if yes then check applicaiton data if no give message.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {User}
 */
exports.forgot_password = async function (req, res, next) {
    try {
        let options = {min:  100000, max:  999999, integer: true};
        let user_otp = rn(options);
        let user = await User.findOne({ "mht_id": req.body.mht_id });
        if (user && user.mobile) {
            request('http://api.msg91.com/api/sendhttp.php?country=91&sender=QUIZEAPP&route=4&mobiles=+' + user.mobile + '&authkey=' + process.env.SMS_KEY + '&message=JSCA! This is your one-time password ' + user_otp + '.', { json: true }, (err, otp, body) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ msg: "internal server error please try again later." });
                } else {
                    res.send(200, {otp: user_otp, msg: 'OTP is send to your Contact number.', data: user});
                }
            });
        }
		else {
            res.status(400).json({ msg: "You are not registered !!" });
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};


/**
 * Generate OTP and chekc user is exsist in MBA Data if yes then check applicaiton data if no give message.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {User}
 */
exports.update_password = async function (req, res, next) {
    try {
        let hashPassword = await bcrypt.hash(req.body.password, SALT_WORK_FACTOR);
        await User.updateOne({ "mht_id": req.body.mht_id }, {$set: {"password": hashPassword} });
        res.send(200, {msg: "Password updated successfully !!!"})
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/**
 * Helper function for leaders. Returns rank of the user
 * @param mht_id - unique ID of the user
 * @returns {Promise<*>}
 */
async function getRank(mht_id) {
    var user = await User.findOne({"mht_id": parseInt(mht_id)});
    var score = user.totalscore;
    var count = await User.count({
        totalscore: {
            "$gt": score
        }
    }) + 1;
    return count;
}
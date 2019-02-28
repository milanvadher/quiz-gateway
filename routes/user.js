/**
 * Module Dependencies
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('./../config');
const request = require('request');
const rn = require('random-number');
const nodemailer = require("nodemailer");
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
 * Setup Email
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.PASSWORD
    }
});

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
        let exists_user = await User.findOne({"mht_id": req.body.mht_id});
        if(exists_user) {
            return res.send(226, {'msg': 'A user with this mht_id already exists !!!'});
        }
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
 * Change mobile no. requsest --> send email to Devlopers ... 😎 😎 😎
 * 
 * @param req {Object} The request
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {msg}
 */
exports.change_mobile = async function (req, res, next) {
    try {
        let new_mobile = req.body.new_mobile;
        if (new_mobile) {
            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: [process.env.DEV1, process.env.DEV2, process.env.DEV3, process.env.DEV4],
                subject: 'Change Mobile No. request',
                text: 'JSCA! New request received from ' + new_mobile + ' to add into MBA database.'
            };
            let ack = await sendMail(mailOptions);
            if (ack.status) {
                res.send(200, { msg: 'Your request is submitted successfully!! We will contact you in 24 Hours.' });
            } else {
                throw new Error(ack.data);
            }
        }
    } catch (error) {
        console.log(error);
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
            res.send(200, { users: users });
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
                sort: {
                    totalscore: -1,
                    lives: -1,
                    createdAt: -1
                }
            });


        let userRank;

        // Send MHT-ID in header
        // If mht_id not sent, or wrong MHT-id sent, if fails silently
        try {
            userRank = await getRank(leaders, req.headers.mht_id);
        }
        catch (e) {
            console.log(e);
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
* Generate OTP and check user is exsist in MBA Data if yes then check applicaiton data if no give message.
* If user mobile no. is from out of india then send OTP through E-MAIL.
* @param req {Object} The request.
* @param res {Object} The response.
* @param req.body {Object} The JSON payload.
* @param {Function} next
* @return {User}
*/
exports.validate_user = async function (req, res, next) {
    try {
        let exists_user = await User.findOne({"mht_id": req.body.mht_id});
        if(exists_user) {
            return res.send(226, {'msg': 'A user with this mht_id already exists !!!'});
        }
        let options = { min: 100000, max: 999999, integer: true };
        let user_otp = rn(options);
        let result = await MBAData.findOne({ "mht_id": req.body.mht_id, "mobile": req.body.mobile });
        console.log(result);
        if (result && result.mobile) {
            if (result.mobile.length == 10) {
                console.log(process.env.SMS_KEY);
                request('http://api.msg91.com/api/sendhttp.php?country=91&sender=QUIZEAPP&route=4&mobiles=+' + result.mobile + '&authkey=' + process.env.SMS_KEY + '&message=JSCA! This is your one-time password ' + user_otp + '.', { json: true }, (err, otp, body) => {
                    if (err) {
                        console.log(err);
                        res.send(500, { msg: "An error occurred when sending OTP." });
                    } else {
                        res.send(200, { otp: user_otp, msg: 'OTP is send to your Contact number.', data: result });
                    }
                });
            } else {
                if (result.mailId) {
                    const mailOptions = {
                        from: process.env.EMAIL_ID,
                        to: mailId,
                        subject: 'MBA Quiz-GateWay',
                        text: 'JSCA! This is your one-time password ' + user_otp + '.'
                    };
                    let ack = await sendMail(mailOptions);
                    if (ack.status) {
                        res.send(200, { otp: user_otp, msg: 'OTP is send to ' + result.mailId + ' Kindly check your email id.', data: result });
                    } else {
                        throw new Error(ack.data);
                    }
                } else {
                    res.send(400, { msg: "Your E-mail ID is not in MBA list. Kindly update !!" });
                }
            }
        } else {
            res.send(400, { msg: "Your mobile number is not in MBA list. Kindly update !!" });
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
        let options = { min: 100000, max: 999999, integer: true };
        let user_otp = rn(options);
        let user = await User.findOne({ "mht_id": req.body.mht_id });
        if (user && user.mobile) {
            if (user.mobile.length == 10) {
                request('http://api.msg91.com/api/sendhttp.php?country=91&sender=QUIZEAPP&route=4&mobiles=+' + user.mobile + '&authkey=' + process.env.SMS_KEY + '&message=JSCA! This is your one-time password ' + user_otp + '.', { json: true }, (err, otp, body) => {
                    if (err) {
                        console.log(err);
                        res.send(500, { msg: "internal server error please try again later." });
                    } else {
                        res.send(200, { otp: user_otp, msg: 'OTP is send to your Contact number.', data: user });
                    }
                });
            } else {
                if (user.mailId) {
                    const mailOptions = {
                        from: process.env.EMAIL_ID,
                        to: mailId,
                        subject: 'MBA Quiz-GateWay',
                        text: 'JSCA! This is your one-time password ' + user_otp + '.'
                    };
                    let ack = await sendMail(mailOptions);
                    if (ack.status) {
                        res.send(200, { otp: user_otp, msg: 'OTP is send to ' + result.mailId + ' Kindly check your email id.', data: result });
                    } else {
                        throw new Error(ack.data);
                    }
                } else {
                    res.send(400, { msg: "Your E-mail ID is not in MBA list. Kindly update !!" });
                }
            }
        }
        else {
            res.send(400, { msg: "You are not registered !!" });
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
        await User.updateOne({ "mht_id": req.body.mht_id }, { $set: { "password": hashPassword } });
        let user = await User.findOne({"mht_id": req.body.mht_id});
        res.send(200, user);
    } catch (error) {
        console.log(error)
        res.send(500, new Error(error));
        next();
    }
};

/**
 * Update Notification Token.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {User}
 */
exports.update_notification_token = async function (req, res, next) {
    try {
        await User.updateOne({ "mht_id": req.body.mht_id }, { $set: 
            { 
                "fb_token": req.body.fb_token,
                "onesignal_token" : req.body.onesignal_token
            } 
        });
        res.send(200, { msg: "Token updated successfully !!!" })
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
};

/**
 * Helper function for leaders. Returns rank of the user
 * @param leaders - leaderlist
 * @param mht_id - unique ID of the user
 * @returns {Promise<*>}
 */
async function getRank(leaders, mht_id) {
    mht_id = parseInt(mht_id);
    let rank = 0;
    for (let leader in leaders) {
        rank++;
        if (mht_id == leaders[leader].mht_id) {
            return rank;
        }
    }
    // var user = await User.findOne({"mht_id": parseInt(mht_id)});
    // var score = user.totalscore;
    // var count = await User.count({
    //     totalscore: {
    //         "$gt": score
    //     }
    // }) + 1;
    // return count;
}


exports.test = async function (req, res, next) {
    try {
        let mailId = req.body.mailId;
        let ack = await sendMail(123456, mailId);
        console.log(ack);
        if (ack.status) {
            res.send(200, { otp: 123456, msg: 'OTP is send to ' + mailId + ' Kindly check your email id.', data: [] });
        } else {
            throw new Error(ack.data);
        }
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
}

/**
 * Send email to Out of INDIA's MBA.
 * 
 * @param otp 6 digit OTP
 * @param mailId Email id of MBA
 */
async function sendMail(mailOptions) {
    let result = {};
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        result.status = true;
        result.data = info;
        console.log(' ** ', result);
        return result;
    } catch (error) {
        console.log(error);
        result.status = false;
        result.data = error;
        console.log(' ** ', result);
        return result;
    }
}

exports.feedback = async function (req, res, next) {
    try {
        let message = req.body.message;
        let contact = req.body.contact;
        let feedback = await Feedback.insertOne({message: message, contact: contact});
        res.send(200, feedback);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
}
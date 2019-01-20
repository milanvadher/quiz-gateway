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
exports.register_user = async function (req, res, next) {
    try {
        let data = req.body || {};

        let hashPassword = await bcrypt.hash(req.body.password, SALT_WORK_FACTOR);
        data.password = hashPassword;
        await User.updateOne({"mht_id": data.mht_id},
        { $set: {
            "center":data.center,
            "isactive":true,
            "email":data.email,
            "name":data.name,
            "mobile":data.mobile,
            "password":data.password        }}
        )
        let user =await User.findOne({"mht_id": data.mht_id});

        if (user) {
            res.send(201, user);
            next();
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
exports.get_users = async function (req, res, next) {
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
exports.delete = async function (req, res, next) {
    try {
        let result = await User.remove({ _id: req.params.id });
        if (result.n) {
            res.send(200, { msg: "User deleted successfully !!" });
            next();
        } else {
            res.send(404, { msg: "User not found" });
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
exports.generate_otp =async function (req, res, next) {
    try {

        var options = {
        min:  100000
        , max:  999999
        , integer: true
        }
        let uesr_otp= rn(options);
        console.log(uesr_otp);
        let result=await MBAData.findOne({ "mht_id": req.body.mht_id,"modile":req.body.mobile });
            
        let user=await User.findOne({ "mht_id": req.body.mht_id });
        //let app_setting= await ApplicationSetting.findOne({});
        if (result && result.mobile && !(user==null) ) {
            //res.send({ msg: 'You are already registered.', isNewUser: false, profile: true })
            request('http://api.msg91.com/api/sendhttp.php?country=91&sender=QUIZEAPP&route=4&mobiles=+' + result.mobile + '&authkey=192315AnTq0Se1Q5a54abb2&message=JSCA! This is your one-time password ' + uesr_otp + '.', { json: true }, (err, otp, body) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({ err: "internal server error please try again later." });
                } else {
                    res.send(200,{ OTP: uesr_otp, msg: 'OTP is send to your Contact number.', Data:  user });                    
                }
            });
        } 
        else if( result && (user==null || user==undefined)) {
            if (result.mobile ) {
                request('http://api.msg91.com/api/sendhttp.php?country=91&sender=QUIZEAPP&route=4&mobiles=+' + result.mobile + '&authkey=192315AnTq0Se1Q5a54abb2&message=JSCA! This is your one-time password ' + uesr_otp + '.', { json: true }, (err, otp, body) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({ err: "internal server error please try again later." });
                    } else {
                        res.send(200,{ OTP: uesr_otp, msg: 'OTP is send to your Contact number.', Data: null })
                    }
                });
            } 
        }
		else {
            res.status(400).json({ err: "your mobile number is not in MBA List kindly update do it need full!!" });
        }
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
};


/**
 * verify OTP and chekc user is exsist in MBA Data if yes then check applicaiton data if no give message.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {User}
 */
exports.verify_otp =async function (req, res, next) {
    try {
        
        let result=await MBAData.findOne({ "mht_id": req.body.mht_id });
            
        let user=await User.findOne({ "mht_id": req.body.mht_id });
        let app_setting= await ApplicationSetting.findOne({});
        if  (user) {
            res.send(200, user);                    
        } 
        else if(!user) {
                let insert_user=new User(
                    {
                        "mobile": result.mobile,
                        "name": result.name,
                        "email": result.email,
                        "lives": app_setting.total_lives,
                        "isactive": true,   
                        "mht_id": result.mht_id,
                        "center": result.center,
                        "bonus":0,
                        "question_id":0,
                        "totalscore":0
                    }
                );
                await insert_user.save();

                res.send(200, insert_user )
        }
		
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
};

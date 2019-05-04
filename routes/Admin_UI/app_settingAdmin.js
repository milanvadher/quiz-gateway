/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const ApplicationSetting=require('../../models/app_setting');
const Test=require('../../models/test');

/**
 * get first Application setting object from applicaton settig.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {application_setting}
 */
exports.get = async function (req, res, next) {
    try {
        let application= await  ApplicationSetting.find(req.params);
        res.send(200, application);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
exports.get_appversion= async function(req,res,next)
{
    try {
        let application= await  ApplicationSetting.findOne({},"appversion ios_appversion");
        res.send(200, application);
        next();
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
};

/**
 * update application setting with _id, to update some setting like 'negative, total life per users etc..' 
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as application setting.
 * @param {Function} next
 * @return {application_setting}
 */
exports.update = async function (req, res, next) {
    try {
        
        let app_update=req.body;
        let id=app_update._Id;
        await  ApplicationSetting.updateOne({"_Id":id},
        { $set: {
            "negative_per_question":app_update.negative_per_question,
            "total_lives":app_update.total_lives,
            "score_per_lives":app_update.score_per_lives,
            "username":app_update.username,
            "password":app_update.password        }}
        );
        let application= await  ApplicationSetting.findOne({"_Id":id});
        res.send(200, application);
    } catch (error) {
        res.send(500, new Error(error));
    }
    next();

};
/**
 * insert new application setting to set some setting like 'negative, total life per users etc..' 
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as application setting.
 * @param {Function} next
 * @return {application_setting}
 */
exports.create = async function (req, res, next) {
    try {
        let app_insert=req.body;
        //console.log(app_insert);
        let application= new  ApplicationSetting(app_insert);
        await application.save();
        res.send(200, application);
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
    }
    next();
};


exports.sadhana_data = async function(req, res, next) {
    try {
        let app_insert=req.body;
        //console.log(app_insert);
        let application= new Test(app_insert);
        await application.save();
        res.send(200, application);
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
    }
    next();
}
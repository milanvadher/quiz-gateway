/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const ApplicationSetting=require('../../models/app_setting');

/**
 * get first Application setting object from applicaton settig.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {application_setting}
 */
exports.get_applicationSetting = async function (req, res, next) {
    try {
        let application= await  ApplicationSetting.findOne({});
        res.send(200, application);
        next();
    } catch (error) {
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
exports.update_applicationSetting = async function (req, res, next) {
    try {
        
        let app_update=req.body;
        let id=app_update._Id;
        let application= await  ApplicationSetting.update({"_Id":id},
        { $set: {
            "negative_per_question":app_update.negative_per_question,
            "total_life":app_update.total_life,
            "score_per_life":app_update.score_per_life,
            "username":app_update.username,
            "passeord":app_update.passeord        }}
        );
        res.send(200, application);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
/**
 * insert new application setting to set some setting like 'negative, total life per users etc..' 
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as application setting.
 * @param {Function} next
 * @return {application_setting}
 */
exports.insert_applicationSetting = async function (req, res, next) {
    try {
        
        let app_insert=req.body;
        let application= await  ApplicationSetting.insert(app_insert);
        res.send(200, application);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
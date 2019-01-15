/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const UserScore = require('../models/user_score');

/**
 * Get all user score data.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param {Function} next
 * @return {userscores}
 */
exports.get_userScores = async function (req, res, next) {
    let userscores;
    try {
        userscores = await UserScore.find({});
        res.send(200, userscores);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/**
 * Get user score a per level wise.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.level {String} The User Quiz level
 * @param {Function} next
 * @return {userscores}
 */
exports.get_userScoresByLevel = async function (req, res, next) {
    let level = req.body.level;
    let userscores;
    try {
        userscores = await UserScore.find({"level":level});
        res.send(200, userscores);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
/**
 * Get user score a per user wise.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.mhtid {String} The User mhtid
 * @param {Function} next
 * @return {userscores}
 */
exports.get_userScoresByLevel = async function (req, res, next) {
    let mhtid = req.body.mhtid;
    let userscores;
    try {
        userscores = await UserScore.find({"mht_Id":mhtid});
        res.send(200, userscores);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
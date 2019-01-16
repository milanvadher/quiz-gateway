/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const UserScore = require('../models/user_score');

/**
 * Get Question of a particular level and with specific question state
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.question_st {String} The User Question State
 * @param req.body.level {String} The User Quiz level
 * @param {Function} next
 * @return {Question}
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
 * Get Question of a particular level and with specific question state
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.question_st {String} The User Question State
 * @param req.body.level {String} The User Quiz level
 * @param {Function} next
 * @return {Question}
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

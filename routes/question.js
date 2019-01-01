/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const Question = require('../models/question');
const QuizLevel = require('../models/quiz_level');
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
exports.get_question = async function(req, res, next)
{
    // TODO - Check User Authentication
    let question_st = req.body.question_st;
    let level = req.body.level;
    let question;
    try {
        question = await Question.findOne({
            "question_st": question_st,
            "level": level
        });
        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};


/**
 * Get Quiz Details for a user
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.user_mob {String} The User Mobile
 * @param {Function} next
 * @return {quiz_levels, completed_levels, current_level}
 */
exports.get_quiz_details = async function(req, res, next)
{
    // TODO - Check User Authentication
    let user_mob = req.body.user_mob;
    let results;
    try {
        results = await Promise.all([
            // Find all levels
            QuizLevel.find({}),

            // Find levels that user has already completed
            UserScore.find({
                "user_mobile": user_mob,
                "completed": true
            }, "level score -_id"),    

            // Find current level of user
            UserScore.find({
                "user_mobile": user_mob,
                "completed": false
            }, "-_id")
        ]);
        response = {
            "quiz_levels": results[0],
            "completed": results[1],
            "current": results[2]
        }
        res.send(200, {"results" : response});
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
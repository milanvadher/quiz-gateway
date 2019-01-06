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
const User = require('../models/user');

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
exports.get_question = async function (req, res, next) {
    // TODO - Check User Authentication
    let question_st = req.body.question_st;
    let level = req.body.level;
    let question;
    try {
        question = await Question.findOne({
            "question_st": question_st,
            "level": level
        }, "-_id");
        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
exports.get_questions = async function (req, res, next) {
    // TODO - Check User Authentication
    //let question_st = req.body.question_st;
    let level = req.body.level;
    let questionfrom = req.body.QuestionFrom;
    let questionto = req.body.QuestionTo;
    let question;
    try {
        if ( questionto != undefined || questionto == null || questionto == 0 ) {
            question = await Question.find({
                "question_st": {
                    $gte: questionfrom
                },
                "level": level
            }, "-_id");
        }
        else {
              question = await Question.find({
                "question_st": {
                    $gte: questionfrom,
                    $lte: questionto
                },
                "level": level
            }, "-_id");
        }
        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};


/**
 * Check the answer is right or not and add score
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.question_st {String} The User Question State
 * @param req.body.mobile {String} The User Mobile
 * @param req.body.answer {String} The User selected answer
 * @param req.body.level {String} The User Quiz Level
 * @param req.body.score {String} The User current score
 * @param req.body.lives {String} The User lives
 * @param {Function} next
 * @return {Question}
 */
<<<<<<< HEAD
exports.validate_answer = async function (req, res, next) {
    console.log(req);
=======
exports.validate_answer = async function(req, res, next)
{
>>>>>>> d61930c79fa11c0625c6d39f02bf77480ec1f336
    // TODO - Check User Authentication
    let question_st = req.body.question_st;
    let user_mobile = req.body.mobile;
    let selected_ans = req.body.answer;
    let user_level = req.body.level;
    let current_score = req.body.score;
    let lives = req.body.lives;
    let question, status, user;
    try {
        question = await Question.findOne({
<<<<<<< HEAD
            "question_st": question_st,
        }, "answer score");

        if (question.answer == selected_ans) {
            let user_score = await UserScore.update({
                "user_mobile": user_mobile,
                "completed": false,
                "level": user_level
            },
                {
                    $inc: { "score": question.score, "total_questions": -1 },
                    $set: { "question_st": question_st }
                });
            status = { "answer_status": true, "lives": lives, "score": user_score.score };
        } else {
            let user_score = await UserScore.update({
                    "user_mobile": user_mobile,
                    "completed": false,
                    "level": user_level
                },
                { $inc: { "total_questions": -1 } });
                    user = await User.update({
                    "mobile": user_mobile
                    },
                { $inc: { "lives": -1 } });
            status = { "answer_status": false, "lives": user.lives, "score": current_score };
=======
            "question_st": question_st,            
            }, "answer score");
              
        if(question.answer == selected_ans) {
            let user_score = await UserScore.update({
               "user_mobile": user_mobile,
               "completed": false,
               "level": user_level},
               {$inc: {"score":question.score,"total_questions":-1},
                    $set: {"question_st":question_st}
               });
           status = {"answer_status": true, "lives": lives , "score": user_score.score};
        } else {
             let user_score = await UserScore.update({
               "user_mobile": user_mobile,
               "completed": false,
               "level": user_level},
               {$inc: {"total_questions":-1}});
            user = await User.update({
                "mobile":user_mobile},
                {$inc: {"lives": -1}});
            status = {"answer_status": false,"lives": user.lives ,"score": current_score};
>>>>>>> d61930c79fa11c0625c6d39f02bf77480ec1f336
        }

        res.send(200, status);
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
exports.get_quiz_details = async function (req, res, next) {
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
<<<<<<< HEAD

        let current_user_level = results[2];
        let completed_levels = results[1];

        let levels = results[0];
        let level_current;
        if (!current_user_level && !completed_levels) {
            level_current = 1;
            results[2] = await UserScore.create({
                "user_mobile": user_mob,
                "total_questions": levels[0].total_questions
            });
        } else if (!current_user_level && completed_levels) {
            let total_question = 0;
            if (levels.length > completed_levels.length) {
                //get total Questions for current level.
                total_question = levels[completed_levels[completed_levels.length - 1].level + 1].total_questions;
=======
        
        let current_user_score = results[2];
        let completed_levels = results[1];
        let QZLevel=results[0];
        let level_current;
        if(!current_user_score && !completed_levels) {
            level_current=1;
            results[2] = await UserScore.create({
                "user_mobile": user_mob,
                "total_questions":QZLevel[0].total_questions
            });
        } else if(!current_user_score && completed_levels) {
            let total_question=0;
            if(QZLevel.length>(completed_levels.length))
            {
                total_question=QZLevel[completed_levels[completed_levels.length-1].level+1].total_questions;
>>>>>>> d61930c79fa11c0625c6d39f02bf77480ec1f336
            }

            results[2] = await UserScore.create({
                "user_mobile": user_mob,
                "level": completed_levels.length + 1,
<<<<<<< HEAD
                "total_questions": total_question
            });
            level_current = completed_levels.length + 1;
        }
        else {
            level_current = current_user_level[0].level;
        }

        let Question_Sta;
        Question_Sta = await Question.find({ "level": level_current }, "question_st");
        //console.log(Question_Sta);
=======
                "total_questions":total_question
            });
            level_current=completed_levels.length+1;
        }
        else{
            level_current=current_user_score[0].level;
        }
        let Question_Sta;
        Question_Sta=Question.find({"level":level_current },"question_st");

>>>>>>> d61930c79fa11c0625c6d39f02bf77480ec1f336
        response = {
            "quiz_levels": results[0],
            "completed": results[1],
            "current": results[2],
<<<<<<< HEAD
            "Question_Sta": Question_Sta
=======
            "Question_Sta":Question_Sta
>>>>>>> d61930c79fa11c0625c6d39f02bf77480ec1f336
        }
        res.send(200, { "results": response });
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
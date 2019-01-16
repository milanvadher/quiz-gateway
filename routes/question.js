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
const UserAnswerMapping = require('../models/user_answer_mapping');
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
        if (!questionto  || questionto == 0 ) {
            question = await Question.find({
                "question_st": {
                    $gte: questionfrom
                },
                "level": level
            }, "-_id -reference");
        }
        else {
              question = await Question.find({
                "question_st": {
                    $gte: questionfrom,
                    $lte: questionto
                },
                "level": level
            }, "-_id -reference");
        }
        res.charSet('utf-8');
        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};


exports.hint_question = async function (req, res, next) {
    // TODO - Check User Authentication
    //let question_st = req.body.question_st;
    let user_mhtid = req.body.mhtid; 
    let isHintuse= req.body.hint;
    let question_id = req.body.question_id;
    let question, scoreAdd;

    question = await Question.findOne({
        "question_id": question_id,            
        }, "question_st score reference");
    scoreAdd=question.score;
    if(isHintuse)
    {
        scoreAdd=scoreAdd/2;
    }
    try {
        await User.update({
            "MHT_Id": user_mhtid},
            {$inc: {"totalScore":(scoreAdd * -1)},
                 $set: {"question_id":question_id}
            });

        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
/** https://stackoverflow.com/questions/8384029/auto-increment-in-mongodb-to-store-sequence-of-unique-user-id
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
exports.validate_answer = async function (req, res, next) {
    //console.log(req);
    // TODO - Check User Authentication
    let question_st = req.body.question_st;
    let question_id = req.body.question_id;
    let user_mhtid = req.body.mhtid;
    let selected_ans = req.body.answer;
    let user_level = req.body.level;
    let current_score = req.body.score;
    let lives = req.body.lives;
    let isBounce = req.body.bounce;
    //let isHintuse= req.body.hint;
    let negativeScore= req.body.negativeScore;
    let question, status, user,scoreAdd;
    try {
        question = await Question.findOne({
            "question_id": question_id,            
            }, "answer score");
        scoreAdd=question.score;
        if(isBounce)
        {
           
            let answer_status=false;
            if(question.answer == selected_ans) {
                answer_status=true;
                // let user_score = await UserScore.update({
                //    "MHT_Id": user_mhtid,
                //    "completed": false,
                //    "level": user_level},
                //    {$inc: {"score":scoreAdd,"total_questions":-1},
                //         $set: {"question_st":question_st}
                //    });

                 //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                   let user = await User.update({
                    "MHT_Id": user_mhtid},
                    {$inc: {"totalScore":scoreAdd,"bounce":scoreAdd},
                         $set: {"question_id":question_id}
                    });
                status = {"answer_status": answer_status, "lives": lives , "score": user.totalScore};
            } else {
                //  let user_score = await UserScore.update({
                //    "MHT_Id": user_mhtid,
                //    "completed": false,
                //    "level": user_level},
                //    {$inc: {"total_questions":-1}});
                // user = await User.update({
                //     "MHT_Id":user_mhtid},
                //     {$inc: {"lives": -1}});
                status = {"answer_status": answer_status,"lives": user.lives ,"score": current_score};
            }
            let UAMObj={"MHT_Id":user_mhtid,"question_id":question_id,"quize_type":question.quize_type,"answer":selected_ans,"answer_status":answer_status}
            // entry in user answer, in case of bounce.
            await UserAnswerMapping.insert(UAMObj);
        }
        else
        {
            // question = await Question.findOne({
            //     "question_st": question_st,            
            //     }, "answer score");
            
            if(question.answer == selected_ans) {
                // if(isHintuse){
                //     scoreAdd=scoreAdd/2;
                // }
                let user_score = await UserScore.update({
                   "MHT_Id": user_mhtid,
                   "completed": false,
                   "level": user_level},
                   {$inc: {"score":scoreAdd,"total_questions":-1},
                        $set: {"question_st":question_st}
                   });
                    //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                   let user = await User.update({
                    "MHT_Id": user_mhtid},
                    {$inc: {"totalScore":scoreAdd},
                         $set: {"question_id":question_id}
                    });
                   let UAMObj={"MHT_Id":user_mhtid,"question_id":question_id,"quize_type":question.quize_type,"answer":selected_ans,"answer_status":true }
                   // entry in user answer, if answer is right and in case of regular.
                   await UserAnswerMapping.insert(UAMObj);

                    status = {"answer_status": true, "lives": lives , "score": user.totalScore};
            } else {
                 let user_score = await UserScore.update({
                   "MHT_Id": user_mhtid,
                   "completed": false,
                   "level": user_level},
                   {$inc: {"total_questions":-1}});
                   //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                user = await User.update({
                    "MHT_Id":user_mhtid},
                    {$inc: {"lives": -1,"totalScore":negativeScore},
                    $set: {"question_id":question_id}
                });
                status = {"answer_status": false,"lives": user.lives ,"score": user.totalScore};
            }
        }
      

        res.send(200, status);
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
exports.get_bonusquestion = async function (req, res, next) {
    // TODO - Check User Authentication
    let MHT_Id = req.body.mhtid;
    //let level = req.body.level;
    let question;
    try {
        let usersanwered= await UserAnswerMapping.find({
            "MHT_Id":MHT_Id,
            "quize_type": "BOUNCE"
        },"question_id");

        question = await Question.findOne({
            "quize_type": "BOUNCE",
            "question_id": {$nin:[ usersanwered]}
        }, "-_id");

        res.send(200, question);
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
exports.get_lifefromScore = async function (req, res, next) {
    // TODO - Check User Authentication
    let scoreperlife = req.body.scoreperlife;
    try {
        let user= await User.find({
            "MHT_Id":MHT_Id
        });
        if(user.totalScore>scoreperlife)
        {
                user = await User.update({
                    "MHT_Id":user_mhtid},
                    {$inc: {"lives": 1,"totalScore":(scoreperlife*-1)}
                });
        } 

        res.send(200, user);
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
    let MHT_id = req.body.mhtid;
    let results;
    var datetime = new Date();
    try {
        results = await Promise.all([
            // Find all levels
            QuizLevel.find({
                "start_date":{
                    $gte: datetime
                },
                "end_date":{
                    $lte: datetime
                }
            }),

            // Find levels that user has already completed
            UserScore.find({
                "MHT_Id": MHT_id,
                "completed": true
            }, "level score -_id"),

            // Find current level of user
            UserScore.find({
                "MHT_Id": MHT_id,
                "completed": false
            }, "-_id")
        ]);
        
        let current_user_level = results[2];
        let completed_levels = results[1];

        let levels = results[0];
        let level_current;
        if ((!current_user_level || current_user_level.length == 0)&& (!completed_levels || completed_levels.length == 0)) {
            level_current = 1;
            results[2] = await UserScore.create({
                "MHT_id": MHT_id,
                "total_questions": levels[0].total_questions
            });
        } else if (!current_user_level && completed_levels) {
            let total_question = 0;
            if (levels.length > completed_levels.length) {
                //get total Questions for current level.
                total_question = levels[completed_levels[completed_levels.length - 1].level + 1].total_questions;
            }
            
            let question = await Question.find({ "level": level_current }, "question_st");
            results[2] = await UserScore.create({
                "MHT_id": MHT_id,
                "level": completed_levels.length + 1,
                "total_questions": total_question,
                "question_st": question.question_st
            });
            level_current = completed_levels.length + 1;
        }
        else {
            level_current = current_user_level[0].level;
        }

        
        //console.log(Question_Sta);
        response = {
            "quiz_levels": results[0],
            "completed": results[1],
            "current": results[2]
        }
        res.send(200, { "results": response });
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
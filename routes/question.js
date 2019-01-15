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

/**
 * Get Question with specific question state and level
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.QuestionFrom {String} Question State from
 * @param req.body.questionto {String} Question State to
 * @param req.body.level {String} The User Quiz level
 * @param {Function} next
 * @return {Question}
 */
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


/**
 * give hint of the question and deducted score from total score.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.mhtid {String} user mht id for find user.
 * @param req.body.hint {String} give is need hint
 * @param req.body.question_id {String} question id for getting question
 * @param {Function} next
 * @return {Question}
 */
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
            "mht_Id": user_mhtid},
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
/** 
 * Check the answer is right or not and add score as it's regular question or bonus 
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.question_st {String} The User Question State
 * @param req.body.question_id {String} The User Question id
 * @param req.body.mhtid {String} The User mhtid
 * @param req.body.answer {String} The User selected answer
 * @param req.body.level {String} The User Quiz Level
 * @param req.body.score {String} The User current score
 * @param req.body.lives {String} The User lives
 * @param req.body.bonus {String} is it bonus question
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
    let isbonus = req.body.bonus;
    let negativeScore= req.body.negativeScore;
    let question, status, user,scoreAdd;
    try {
        question = await Question.findOne({
            "question_id": question_id,            
            }, "answer score");
        scoreAdd=question.score;
        if(isbonus)
        {
           
            let answer_status=false;
            if(question.answer == selected_ans) {
                answer_status=true;
                 //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                   let user = await User.update({
                    "mht_id": user_mhtid},
                    {$inc: {"totalScore":scoreAdd,"bonus":scoreAdd},
                         $set: {"question_id":question_id}
                    });
                status = {"answer_status": answer_status, "lives": lives , "score": user.totalScore};
            } 
            else {
                status = {"answer_status": answer_status,"lives": user.lives ,"score": current_score};
            }
            let UAMObj={"mht_id":user_mhtid,"question_id":question_id,"quize_type":question.quize_type,"answer":selected_ans,"answer_status":answer_status}
            // entry in user answer, in case of bonus.
            await UserAnswerMapping.insert(UAMObj);
        }
        else
        {
            if(question.answer == selected_ans) {
              
                let user_score = await UserScore.update({
                   "mht_id": user_mhtid,
                   "completed": false,
                   "level": user_level},
                   {$inc: {"score":scoreAdd,"total_questions":-1},
                        $set: {"question_st":question_st}
                   });
                    //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                   let user = await User.update({
                    "mht_id": user_mhtid},
                    {$inc: {"totalScore":scoreAdd},
                         $set: {"question_id":question_id}
                    });
                   let UAMObj={"mht_id":user_mhtid,"question_id":question_id,"quize_type":question.quize_type,"answer":selected_ans,"answer_status":true }
                   // entry in user answer, if answer is right and in case of regular.
                   await UserAnswerMapping.insert(UAMObj);

                    status = {"answer_status": true, "lives": lives , "score": user.totalScore};
            } else {
                 let user_score = await UserScore.update({
                   "mht_id": user_mhtid,
                   "completed": false,
                   "level": user_level},
                   {$inc: {"total_questions":-1}});
                   //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                user = await User.update({
                    "mht_id":user_mhtid},
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
 * Get Question bonus of a particular user wise and date wise.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.mhtid {String} The User mht id
 * @param {Function} next
 * @return {Question}
 */
exports.get_bonusquestion = async function (req, res, next) {
    // TODO - Check User Authentication
    let mhtid = req.body.mhtid;
    var datetime = new Date();
    
    let question;
    try {
        let usersanwered= await UserAnswerMapping.find({
            "mhtid":mhtid,
            "quize_type": "BOUNS"
        },"question_id");

        question = await Question.findOne({
            "quize_type": "BOUNS",
            "date":datetime.getDate(),
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
 * get new life from user score, dudect some amount of score 
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
    let mht_id = req.body.mht_id;
    try {
        let user= await User.find({
            "mht_id":mht_id
        });
        if(user.totalScore>scoreperlife)
        {
                user = await User.update({
                    "mht_id":user.mht_Id},
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
 * Get Quiz Details for a user, application level will be on start and end date for level.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.mhtid {String} The User mhtid
 * @param {Function} next
 * @return {quiz_levels, completed_levels, current_level}
 */
exports.get_quiz_details = async function (req, res, next) {
    // TODO - Check User Authentication
    let mht_id = req.body.mhtid;
    let results;
    var datetime = new Date();
    try {
        results = await Promise.all([
            // Find all levels
            QuizLevel.find({
                "start_date":{
                    $gte: datetime.getDate()
                },
                "end_date":{
                    $lte: datetime.getDate()
                }
            }),

            // Find levels that user has already completed
            UserScore.find({
                "mht_id": mht_id,
                "completed": true
            }, "level score -_id"),

            // Find current level of user
            UserScore.find({
                "mht_id": mht_id,
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
                "mht_id": mht_id,
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
                "mht_id": mht_id,
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
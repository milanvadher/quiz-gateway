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

const ApplicationSetting=require('../models/app_setting');

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
exports.get = async function (req, res, next) {
    let question_st = req.body.question_st;
    let level = req.body.level;
    let question;
    try {
        question = await Question.findOne({
            "question_st": question_st,
            "quiz_type": "REGULAR",
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
exports.list = async function (req, res, next) {
    // TODO - Check User Authentication
    //let question_st = req.body.question_st;
    let level = req.body.level;
    let questionfrom = req.body.QuestionFrom;
    let questionto = req.body.QuestionTo;
    let question;
    try {
        if (!questionto  || questionto == 0 ) {
            question = await Question.find({
                "quiz_type": "REGULAR",
                "question_st": {
                    $gte: questionfrom
                },
                "level": level
            }, "-_id");
        }
        else {
              question = await Question.find({
                "quiz_type": "REGULAR",
                "question_st": {
                    $gte: questionfrom,
                    $lte: questionto
                },
                "level": level
            }, "-_id");
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
 * @param req.body.question_id {String} question id for getting question
 * @param {Function} next
 * @return {Question}
 */
exports.hint_question = async function (req, res, next) {
    // TODO - Check User Authentication
    let user_mhtid = req.body.mht_id ; 
    let question_id = req.body.question_id;
    let question, scoreAdd;

    let app_sett= await ApplicationSetting.findOne({});
    if(app_sett.negative_per_hint>0)
    {
        scoreAdd=app_sett.negative_per_hint;
    }
    else
    {
        question = await Question.findOne({
            "question_id": question_id,            
            }, "question_st score reference");
        scoreAdd=question.score;
        scoreAdd=scoreAdd/2;
    }
    try {
        await User.updateOne(
                {"mht_id": user_mhtid},
                {$inc: {"totalscore":(scoreAdd * -1)}
            });
        let users= await User.findOne({"mht_id": user_mhtid});
        res.send(200, users);
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
 * @param req.body.question_id {String} The User Question id
 * @param req.body.mhtid {String} The User mhtid
 * @param req.body.answer {String} The User selected answer
 * @param req.body.level {String} The User Quiz Level
 * @param {Function} next
 * @return {Question}
 */
exports.validate_answer = async function (req, res, next) {
    let question_id = req.body.question_id;
    let user_mhtid = req.body.mht_id;
    let selected_ans = req.body.answer;
    let user_level = req.body.level;

    let question, status, user,scoreAdd;
    try {
        question = await Question.findOne({"question_id": question_id,}, "answer score quiz_type question_st");
        scoreAdd=question.score;

        user = await User.findOne({"mht_id": user_mhtid });
        if(question.quiz_type =="BONUS")
        {
            let answer_status=false;
            if(question.answer[0].answer == selected_ans) {
                  answer_status=true;
                 //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                await User.updateOne({"mht_id": user_mhtid},
                    {$inc: {"totalscore":scoreAdd,"bonus":scoreAdd},
                         $set: {"question_id":question_id}
                    });
                user = await User.findOne({"mht_id":user_mhtid});

                status = {"answer_status": answer_status, "lives": user.lives , "totalscore": user.totalscore};
            } 
            else {
                status = {"answer_status": answer_status,"lives": user.lives ,"totalscore": user.totalscore};
            }
            let UAMObj=new  UserAnswerMapping({"mht_id":user_mhtid,"question_id":question_id,"quiz_type":question.quiz_type,"answer":selected_ans,"answer_status":answer_status});
            // entry in user answer, in case of bonus.
            await UAMObj.save();
        }
        else
        {
            //console.log(question.answer[0].answer);
            if(question.answer[0].answer == selected_ans) {
              
                 await UserScore.updateOne({
                   "mht_id": user_mhtid,
                   "completed": false,
                   "level": user_level},
                   {$inc: {"score":scoreAdd,"total_questions":-1},
                    $set: {"question_st":question.question_st}
                   });
                    //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                  await User.updateOne({"mht_id": user_mhtid},
                    { $inc: {"totalscore":scoreAdd},
                      $set: {"question_id":question_id}
                    });

                   let UAMObj=new  UserAnswerMapping({"mht_id":user_mhtid,"question_id":question_id,"quiz_type":question.quiz_type,"answer":selected_ans,"answer_status":true });
                   // entry in user answer, if answer is right and in case of regular.
                   await UAMObj.save();
                   user = await User.findOne({"mht_id":user_mhtid});

                    status = {"answer_status": true, "lives": user.lives , "totalscore": user.totalscore};
            } else {
                 await UserScore.updateOne({
                   "mht_id": user_mhtid,
                   "completed": false,
                   "level": user_level},
                   {$inc: {"total_questions":-1}});
                   //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                await User.updateOne({"mht_id":user_mhtid},
                    {$inc: {"lives": -1},
                    $set: {"question_id":question_id}
                });
                user = await User.findOne({"mht_id":user_mhtid});
                status = {"answer_status": false,"lives": user.lives ,"totalscore": user.totalscore};
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
exports.get_bonus_question = async function (req, res, next) {
    // TODO - Check User Authentication
    let mhtid = req.body.mht_id;
    var datetime = new Date();
    var dt=datetime.getFullYear()+"-"+(datetime.getMonth()+1)+"-"+(datetime.getDate()-1);
    //console.log(dt)
    var datetimec=new Date(dt);
    dt=datetime.getFullYear()+"-"+(datetime.getMonth()+1)+"-"+(datetime.getDate()+1);
    var datetimef=new Date(dt);

    let question,usersanwered;
    try {
        usersanwered= await UserAnswerMapping.find({
            "mht_id":mhtid,
            "quiz_type": "BONUS"
        },"question_id -_id");
        let qidarrya=[];
        if(!usersanwered || usersanwered.length>0)
        {
            //console.log(datetime +'pppp');
            usersanwered.forEach(o=>{
                qidarrya.push(o.question_id);
            })
        }
        //console.log(datetimec);
        //console.log(datetimef);
        question = await Question.find({
            "quiz_type": "BONUS",
            "date":{ $gte : datetimec , $lt : datetimef  },
            "question_id": {$nin: qidarrya}
        }, "-_id");

        res.send(200, question);
        next();
    } catch (error) {
      //  console.log(error);
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
exports.req_life = async function (req, res, next) {
    // TODO - Check User Authentication
    let mht_id = req.body.mht_id;
    try {
        let app_setting= await ApplicationSetting.findOne({});
        
        let user= await User.findOne({
            "mht_id":mht_id
        });
        if(user.totalscore>app_setting.score_per_lives)
        {
            user = await User.updateOne({
                "mht_id":user.mht_id},
                {$inc: {"lives": 1,"totalscore": (app_setting.score_per_lives*-1)}
            });
           let users= await User.findOne({
                "mht_id":mht_id
            });
          res.send(200, users);

        }
        else{
            res.send(200, "please check score!!");
        }

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
exports.user_state = async function (req, res, next) {
    let mht_id = req.body.mht_id;
    let results;
    var datetime = new Date();
    try {
        let user = await User.findOne({"mht_id": mht_id });
        if(!user) {
            return res.send(500, {msg: "User does not exist !!!"});
        }
        var dt = `${datetime.getFullYear()}-${datetime.getMonth() + 1}-${datetime.getDate() + 1}`;
        var datetimef = new Date(dt);
        dt = `${datetime.getFullYear()}-${datetime.getMonth() + 1}-${datetime.getDate()}`;
        var datetimet = new Date(dt);
        results = await Promise.all([
            // Find all levels
            
            // $type : 10 --> 10 it's Check type to null
            // QuizLevel.find( {
            //     $and : [
            //         { "start_date" :  { $lte: datetimet}  },
            //         { $or : [ { "end_date" : { $type : 10 } }, { "end_date" : { $gt : datetimet } } ] }
            //     ]
            // } ),
            
            QuizLevel.aggregate([{
                $lookup : {
                  from: "questions",
                  localField: "level_index",
                  foreignField: "level",
                  as: "questiondetails"
                  }},{ $match:
                  {
                             $and : [
                                 { "start_date" :  { $lte: datetimet}  },
                                 { $or : [ { "end_date" : { $type : 10 } }, { "end_date" : { $gt : datetimet } } ] }
                             ]
                             }},
                  {
                  $project: {
                  "level_index":1,"name":1,"level_type":1
                  ,"total_questions":1,"categorys":1,"start_date":1,"end_date":1,"description":1,"imagepath":1     
                  , "totalscores": {$sum:"$questiondetails.score"}
                     }
                  } 
             ])  ,

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
        response = {
            "quiz_levels": results[0],
            "completed": results[1],
            "current": results[2],
            "totalscore": user.totalscore,
            "lives": user.lives
        }
        res.send(200, { "results": response });
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
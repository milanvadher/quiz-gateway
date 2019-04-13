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
const moment = require('moment-timezone');

const ApplicationSetting = require('../models/app_setting');

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
        res.charSet('utf-8');
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
        if (!questionto || questionto == 0) {
            question = await Question.find({
                "quiz_type": "REGULAR",
                "question_st": {
                    $gte: questionfrom
                },
                "level": level
            });
        }
        else {
            question = await Question.find({
                "quiz_type": "REGULAR",
                "question_st": {
                    $gte: questionfrom,
                    $lte: questionto
                },
                "level": level
            });
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

    let user_mhtid = req.body.mht_id;
    let question_id = req.body.question_id;
    let question, scoreAdd;

    let app_sett = await ApplicationSetting.findOne({});
    if (app_sett.negative_per_hint > 0) {
        scoreAdd = app_sett.negative_per_hint;
    }
    else {
        question = await Question.findOne({
            "question_id": question_id,
        }, "question_st score reference");
        scoreAdd = question.score/2;
    }
    try {
        var datetimetStartWeek = new Date(moment().tz('Asia/Kolkata').day("Monday").format());
        var datetimet =new Date(moment().tz('Asia/Kolkata').format());
        var  datetimeEndMonth=new Date(datetimet.getFullYear(),datetimet.getMonth()+1,1);
        var datetimeStartMonth=new Date(datetimet.getFullYear(),datetimet.getMonth(),1);
        var datetimetendWeek=new Date(datetimetStartWeek.getFullYear(),datetimetStartWeek.getMonth(),datetimetStartWeek.getDay()+6);
        datetimetStartWeek=new Date(datetimetStartWeek.getFullYear(),datetimetStartWeek.getMonth(),datetimetStartWeek.getDay());


        let scoreAddMonth=0,scoreAddWeek=0;
        if(datetimeStartMonth <= quiz_level.start_date && datetimeEndMonth >= quiz_level.start_date)
        {
            scoreAddMonth = scoreAdd;
        }
        if(datetimetStartWeek <= quiz_level.start_date && datetimetendWeek >= quiz_level.start_date)
        {
            scoreAddWeek = scoreAdd;
        }
        await User.updateOne(
            { "mht_id": user_mhtid },
            {
                $inc: { "totalscore": (scoreAdd * -1),"totalscore_month": (scoreAddMonth * -1),"totalscore_week": (scoreAddWeek * -1) }
            });
        let users = await User.findOne({ "mht_id": user_mhtid });
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

    let question, status, user, scoreAdd,quiz_level;
    try {
        question = await Question.findOne({ "question_id": question_id }, "answer pikacharanswer score quiz_type question_st question_type");
        scoreAdd = question.score;

        let isRightAnswer = false;
       // console.log(question);
        if (question.question_type === 'PIKACHAR') {
            if (question.answer[0].answer.replace(' ', '') == selected_ans) {
                isRightAnswer = true;
            }
        } else if (question.answer[0].answer == selected_ans) {
            isRightAnswer = true;
        }

        user = await User.findOne({ "mht_id": user_mhtid });
        if (question.quiz_type == "BONUS") {
            if (isRightAnswer) {
                //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                await User.updateOne({ "mht_id": user_mhtid },
                    {
                        $inc: { "totalscore": scoreAdd,"totalscore_week": scoreAdd,"totalscore_month": scoreAdd, "bonus": scoreAdd },
                        $set: { "question_id": question_id }
                    });
                user = await User.findOne({ "mht_id": user_mhtid });
                status = { "answer_status": isRightAnswer, "lives": user.lives, "totalscore": user.totalscore,"totalscore_month": user.totalscore_month,"totalscore_week": user.totalscore_week };
            }
            else {

                //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                await User.updateOne({ "mht_id": user_mhtid },
                    {
                        $inc: { "totalscore": -2 ,"totalscore_month": -2,"totalscore_week": -2 }                        
                    });
                user = await User.findOne({ "mht_id": user_mhtid });
                status = { "answer_status": isRightAnswer, "lives": user.lives, "totalscore": user.totalscore,"totalscore_month": user.totalscore_month,"totalscore_week": user.totalscore_week };
            }
            let UAMObj = new UserAnswerMapping({ "mht_id": user_mhtid, "question_id": question_id, "quiz_type": question.quiz_type, "answer":selected_ans, "answer_status": isRightAnswer });
            // entry in user answer, in case of bonus.
            await UAMObj.save();
        }
        else {
            var datetimetStartWeek = new Date(moment().tz('Asia/Kolkata').day("Saturday").format());
            var datetimet = new Date(moment().tz('Asia/Kolkata').format());
            var  datetimeEndMonth = new Date(datetimet.getFullYear(), datetimet.getMonth() + 1, 1);
            var datetimeStartMonth = new Date(datetimet.getFullYear(), datetimet.getMonth(), 1);
            var datetimetendWeek = new Date(datetimetStartWeek.getFullYear(), datetimetStartWeek.getMonth(), datetimetStartWeek.getDay() + 6);
            datetimetStartWeek = new Date(datetimetStartWeek.getFullYear(), datetimetStartWeek.getMonth(), datetimetStartWeek.getDay());    
            
            if (isRightAnswer) {
                quiz_level = await QuizLevel.findOne({"level_index": user_level});
            //console.log(quiz_level.start_date);

                let user_score = await UserScore.findOne({
                    "mht_id": user_mhtid,
                    "completed": false,
                    "level": user_level
                });
                let new_question_st = question.question_st + 1;
                await UserScore.updateOne({
                    "mht_id": user_mhtid,
                    "completed": false,
                    "level": user_level
                    },
                    {
                        $inc: { "score": scoreAdd, "total_questions": user_score.total_questions },
                        $set: { "question_st": new_question_st }
                    });
                // let user_score = await UserScore.findOne({
                //     "mht_id": user_mhtid,
                //     "completed": false,
                //     "level": user_level
                // });

                if ((user_score.total_questions + 1) == quiz_level.total_questions) {
                    await UserScore.updateOne({
                        "mht_id": user_mhtid,
                        "completed": false,
                        "level": user_level
                    },
                        { $set: { "completed": true, "question_st": question.question_st } }
                    );
                    new_question_st = question.question_st;
                }
                let scoreAddMonth=0,scoreAddWeek=0;
                if(datetimeStartMonth <= quiz_level.start_date && datetimeEndMonth >= quiz_level.start_date)
                {
                    scoreAddMonth = scoreAdd;
                }
                if(datetimetStartWeek <= quiz_level.start_date && datetimetendWeek >= quiz_level.start_date)
                {
                    scoreAddWeek=scoreAdd;
                }
                //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                await User.updateOne({ "mht_id": user_mhtid },
                    {
                        $inc: { "totalscore": scoreAdd,"totalscore_month": scoreAddMonth,"totalscore_week": scoreAddWeek  },
                        $set: { "question_id": question_id }
                    }); 
                user = await User.findOne({ "mht_id": user_mhtid });
                status = { "answer_status": isRightAnswer, "lives": user.lives, "totalscore": user.totalscore,"totalscore_month": user.totalscore_month,"totalscore_week": user.totalscore_week, "question_st": new_question_st };
            } else {
                
                if(datetimeStartMonth<=quiz_level.start_date && datetimeEndMonth>=quiz_level.start_date)
                {
                    scoreAddMonth=-2;
                }
                if(datetimetStartWeek<=quiz_level.start_date && datetimetendWeek>=quiz_level.start_date)
                {
                    scoreAddWeek=-2;
                }
                //add total score field this have all user scores include regular and bonuses, so we can manage easly.
                await User.updateOne({ "mht_id": user_mhtid },
                    {
                        $inc: { "lives": -1, "totalscore": -2,"totalscore_month": scoreAddMonth,"totalscore_week": scoreAddWeek  },
                        $set: { "question_id": question_id }
                    });
                user = await User.findOne({ "mht_id": user_mhtid });
                status = { "answer_status": isRightAnswer, "lives": user.lives, "totalscore": user.totalscore,"totalscore_month": user.totalscore_month,"totalscore_week": user.totalscore_week, "question_st": question.question_st };
            }
                //console.log('tet');
                let UAMObj = await UserAnswerMapping.findOne({"mht_id": user_mhtid, "question_id": question_id});
                //console.log(UAMObj);
                if(UAMObj==null)
                {
                    UAMObj = new UserAnswerMapping({ "mht_id": user_mhtid, "question_id": question_id, "quiz_type": question.quiz_type,  "answer":selected_ans, "answer_status": isRightAnswer });
                    // entry in user answer, if answer is right and in case of regular.
                    await UAMObj.save();
                }
        }
        
        res.send(200, status);
        next();
    } catch (error) {
        console.log(error);
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
    var datetimec = moment().tz('Asia/Kolkata').startOf("day");
    var datetimef = moment().tz('Asia/Kolkata').startOf("day").add(1, "days");
    let question, usersanwered;

    try {
        usersanwered = await UserAnswerMapping.find({
            "mht_id": mhtid,
            "quiz_type": "BONUS"
        }, "question_id -_id");
        let qidarray = [];
        if (!usersanwered || usersanwered.length > 0) {
            usersanwered.forEach(o => {
                qidarray.push(o.question_id);
            })
        }
        question = await Question.find({
            "quiz_type": "BONUS",
            "date": { $gte: datetimec, $lt: datetimef },
            "question_id": { $nin: qidarray }
        }, "-_id");

        
        res.charSet('utf-8');
        if(question.length > 0) {
            res.send(200, question);
        } else {
            res.send(200, {msg: 'You have already finished Daily Bonus'});
        }
        next();
    } catch (error) {
          console.log(error);
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
        let app_setting = await ApplicationSetting.findOne({});

        let user = await User.findOne({
            "mht_id": mht_id
        });
        if (user.totalscore >= app_setting.score_per_lives && user.lives < 3) {
            user = await User.updateOne({
                "mht_id": user.mht_id
            },
                {
                    $inc: { "lives": 1, "totalscore": (app_setting.score_per_lives * -1) }
                });
            let users = await User.findOne({
                "mht_id": mht_id
            });
            res.send(200, users);

        }
        else {
            if (user.lives > 2) {
                res.send(226, { "msg": "You have enough lives!!" });
            } else {
                res.send(226, { "msg": "You don't have sufficient coins!!" });
            }
        }

        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

exports.puzzle_completed = async function (req, res, next) {
    let mht_id = req.body.mht_id;
    let puzzle_name = req.body.puzzle_name;
    let puzzle_type = req.body.puzzle_type;
    let inc_lives = 0;
    try {
        if (puzzle_type == '3') {
            inc_lives = 1;
        } else if (puzzle_type == '4') {
            inc_lives = 2;
        } else if (puzzle_type == '5') {
            inc_lives = 2;
        }
        let app_setting = await ApplicationSetting.findOne({});
        await User.updateOne({ "mht_id": mht_id, "$where": "this.lives < " + app_setting.total_lives }, { $inc: { "lives": inc_lives } });
        let user = await User.findOne({ "mht_id": mht_id });
        res.send(200, { "lives": user.lives,"totalscore": user.totalscore,"totalscore_month": user.totalscore_month,"totalscore_week": user.totalscore_week });
        next();
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
};

async function resetMonthWeekScore(mht_id)
{
    var datetimet =new Date(moment().tz('Asia/Kolkata').format());
    var datetimetMonth = new Date(datetimet.getFullYear(), datetimet.getMonth() + 1 ,1);
    var datetimetWeek = new Date(moment().tz('Asia/Kolkata').day("Monday").format());

    //var curDate=new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var n = weekday[datetimet.getDay()];
    if((datetimet.getDay() )==1)
    {
        let user = await User.findOne({ "mht_id": mht_id });
        if(user.totalscore_month_update==undefined||user.totalscore_month_update<=datetimet)
        {
            await User.updateOne({ "mht_id": mht_id },{$set : {"totalscore_month": 0,"totalscore_month_update":datetimetMonth}});
        }
    }    
    if(n=='Monday')
    {
        let user = await User.findOne({ "mht_id": mht_id });
        console.log(user.totalscore_week_update);
        console.log(datetimet);
        if(user.totalscore_week_update==undefined||user.totalscore_week_update>=datetimet)
        {
            await User.updateOne({ "mht_id": mht_id },{$set : {"totalscore_week": 0,"totalscore_week_update":datetimetWeek}});
        }
    }
}

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
   await resetMonthWeekScore(mht_id);
    var datetime = new Date();
    try {
        let user = await User.findOne({ "mht_id": mht_id });
        if (!user) {
            return res.send(500, { msg: "User does not exist !!!" });
        }
        var dt = `${datetime.getFullYear()}-${datetime.getMonth() + 1}-${datetime.getDate() + 1}`;
        //var datetimef = new Date(dt);
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
                $lookup: {
                    from: "questions",
                    localField: "level_index",
                    foreignField: "level",
                    as: "questiondetails"
                }
            }, {
                $match:
                {
                    $and: [
                        { "start_date": { $lte: datetimet } },
                        { $or: [{ "end_date": { $type: 10 } }, { "end_date": { $gt: datetimet } }] }
                    ]
                }
            },
            {
                $project: {
                    "_id": 0,
                    "level_index": 1, "name": 1, "level_type": 1
                    , "total_questions": 1, "categorys": 1, "start_date": 1, "end_date": 1, "description": 1, "imagepath": 1
                    , "totalscores": { $sum: "$questiondetails.score" }
                }
            }
            ]),

            // Find levels that user has already completed
            UserScore.find({
                "mht_id": mht_id,
                "completed": true
            }, "level score fifty_fifty -_id"),

            // Find current level of user
            UserScore.find({
                "mht_id": mht_id,
                "completed": false
            }, "-_id")
        //     ,
        //    Question.aggregate(
        //         [
        //             {
        //                 "$project" : {
        //                     "_id" : NumberInt(0),
        //                     "qu" : "$$ROOT"
        //                 }
        //             },
        //             {
        //                 "$lookup" : {
        //                     "localField" : "qu.question_id",
        //                     "from" : "useranswermappings",
        //                     "foreignField" : "question_id",
        //                     "as" : "uam"
        //                 }
        //             },
        //             {
        //                 "$unwind" : {
        //                     "path" : "$uam",
        //                     "preserveNullAndEmptyArrays" : true
        //                 }
        //             },
        //             {
        //                 "$match" : {
        //                     "qu.quiz_type" : "BONUS",
        //                     "qu.date": { "$gte": datetimecb, "$lt": datetimefb },
        //                     "$or" : [
        //                         {
        //                             "uam.mht_id" : null
        //                         },
        //                         {
        //                             "uam.mht_id" : NumberLong(mht_id)
        //                         }
        //                     ]
        //                 }
        //             }
        //         ],
        //         {
        //               $project:{
        //                      "question_id":1,
        //                      "userQuestion_id":"uam.question_id"
        //               }
        //         }
        //     )
        ]);

        let current_user_level = results[2];
        let completed_levels = results[1];
        let levels = results[0];
        let level_current;
        if ((!current_user_level || current_user_level.length == 0) && (!completed_levels || completed_levels.length == 0)) {
            level_current = 1;
            results[2] = [await UserScore.create({
                "mht_id": mht_id,
                "total_questions": 0
            })];
        } else if ((!current_user_level || current_user_level.length == 0) && completed_levels) {
            // let total_question = 10;
            // if (levels.length > completed_levels.length) {
            //     //get total Questions for current level.
            //     total_question = levels[completed_levels[completed_levels.length - 1].level].total_questions;
            // }

            let question = await Question.find({ "level": level_current }, "question_st");
            results[2] = [await UserScore.create({
                "mht_id": mht_id,
                "level": completed_levels.length + 1,
                "total_questions": 0,
                "question_st": question.question_st

            })];
            level_current = completed_levels.length + 1;
        }
        else {
            level_current = current_user_level[0].level;
        }
        // var datetime = new Date();
        // var dt = datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + (datetime.getDate() - 1);
        // //console.log(dt)
        // var datetimec = new Date(dt);
        // dt = datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + (datetime.getDate() + 1);
        // var datetimef = new Date(dt);

        //let question, usersanwered;
        // try {
        //     // Commet below code as created new query for mongo
        //     usersanwered = await UserAnswerMapping.find({
        //         "mht_id": mht_id,
        //         "quiz_type": "BONUS"
        //     }, "question_id -_id");
        //     let qidarrya = [];
        //     if (!usersanwered || usersanwered.length > 0) {
        //         //console.log(datetime +'pppp');
        //         usersanwered.forEach(o => {
        //             qidarrya.push(o.question_id);
        //         })
        //     }
        //     question = await Question.find({
        //         "quiz_type": "BONUS",
        //         "date": { $gte: datetimec, $lt: datetimef },
        //         "question_id": { $nin: qidarrya }
        //     }, "-_id");
        // } catch (error) {
        //     console.log(error);
        // }
        response = {
            "quiz_levels": results[0],
            "completed": results[1],
            "current": results[2],
            "totalscore": user.totalscore,
            //"totalscore_month": user.totalscore_month,
            //"totalscore_week": user.totalscore_week,
            "lives": user.lives
            //,             "bonus_count": results[3]
        }
        res.send(200, { "results": response });
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

exports.user_state_new = async function (req, res, next) {
    let mht_id = req.body.mht_id;
    let results;
    var datetime = new Date();
    try {
        let user = await User.findOne({ "mht_id": mht_id });
        if (!user) {
            return res.send(500, { msg: "User does not exist !!!" });
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
                $lookup: {
                    from: "questions",
                    localField: "level_index",
                    foreignField: "level",
                    as: "questiondetails"
                }
            }, {
                $match:
                {
                    $and: [
                        { "start_date": { $lte: datetimet } },
                        { $or: [{ "end_date": { $type: 10 } }, { "end_date": { $gt: datetimet } }] }
                    ]
                }
            },
            {
                $project: {
                    "_id": 0,
                    "level_index": 1, "name": 1, "level_type": 1
                    , "total_questions": 1, "categorys": 1, "start_date": 1, "end_date": 1, "description": 1, "imagepath": 1
                    , "totalscores": { $sum: "$questiondetails.score" }
                }
            }
            ]),

            // Find levels that user has already completed
            UserScore.find({
                "mht_id": mht_id,
                "completed": true
            }, "level score fifty_fifty -_id"),

            // Find current level of user
            UserScore.find({
                "mht_id": mht_id,
                "completed": false
            }, "-_id")
            , Question.aggregate(
                [
                    {
                        "$project": {
                            "_id": 0,
                            "qu": "$$ROOT"
                        }
                    },
                    {
                        "$lookup": {
                            "localField": "qu.question_id",
                            "from": "useranswermappings",
                            "foreignField": "question_id",
                            "as": "uam"
                        }
                    },
                    {
                        "$unwind": {
                            "path": "$uam",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        "$match": {
                            "qu.quiz_type": "BONUS",
                            //"qu.date": { "$gte": datetimecb, "$lt": datetimefb },
                            "$or": [
                                {
                                    "uam": null
                                },
                                {
                                    "uam.mht_id": mht_id
                                }
                            ]
                        }
                    },
                    {
                        "$project": {
                            "qu.question_id": "$qu.question_id",
                            "qu.quiz_type": "$qu.quiz_type",
                            "qu.question_st": "$qu.question_st",
                            "uam.question_id": "$uam.question_id",
                            "uam.mht_id": "$uam.mht_id"
                        }
                    }
                ])
        ]);
        //console.log(results);
        let current_user_level = results[2];
        let completed_levels = results[1];
        let levels = results[0];
        let level_current;
        if ((!current_user_level || current_user_level.length == 0) && (!completed_levels || completed_levels.length == 0)) {
            level_current = 1;
            results[2] = [await UserScore.create({
                "mht_id": mht_id,
                "total_questions": levels[0].total_questions
            })];
        } else if ((!current_user_level || current_user_level.length == 0) && completed_levels) {
            let total_question = 0;
            if (levels.length > completed_levels.length) {
                //get total Questions for current level.
                total_question = levels[completed_levels[completed_levels.length - 1].level].total_questions;
            }

            let question = await Question.find({ "level": level_current }, "question_st");
            results[2] = [await UserScore.create({
                "mht_id": mht_id,
                "level": completed_levels.length + 1,
                "total_questions": total_question,
                "question_st": question.question_st

            })];
            level_current = completed_levels.length + 1;
        }
        else {
            level_current = current_user_level[0].level;
        }
        // var datetime = new Date();
        // var dt = datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + (datetime.getDate() - 1);
        // //console.log(dt)
        // var datetimec = new Date(dt);
        // dt = datetime.getFullYear() + "-" + (datetime.getMonth() + 1) + "-" + (datetime.getDate() + 1);
        // var datetimef = new Date(dt);

        //let question, usersanwered;
        // try {
        //     // Commet below code as created new query for mongo
        //     usersanwered = await UserAnswerMapping.find({
        //         "mht_id": mht_id,
        //         "quiz_type": "BONUS"
        //     }, "question_id -_id");
        //     let qidarrya = [];
        //     if (!usersanwered || usersanwered.length > 0) {
        //         //console.log(datetime +'pppp');
        //         usersanwered.forEach(o => {
        //             qidarrya.push(o.question_id);
        //         })
        //     }
        //     question = await Question.find({
        //         "quiz_type": "BONUS",
        //         "date": { $gte: datetimec, $lt: datetimef },
        //         "question_id": { $nin: qidarrya }
        //     }, "-_id");
        // } catch (error) {
        //     console.log(error);
        // }
        response = {
            "quiz_levels": results[0],
            "completed": results[1],
            "current": results[2],
            "totalscore": user.totalscore,
            "lives": user.lives,
            "bonus_count": results[3]
        }
        res.send(200, { "results": response });
        next();
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
};
exports.use_fifty_fifty = async function (req, res, next) {
    let mht_id = req.body.mht_id;
    let level = req.body.level;
    try {
        let user_score = await UserScore.updateOne({
            "mht_id": mht_id,
            "level": level
        }, {$set: {fifty_fifty: false}});
        res.send(200, user_score);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
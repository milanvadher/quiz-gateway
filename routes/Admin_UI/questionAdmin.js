/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const Question = require('../../models/question');
const Counter = require('../../models/counters');
const UserAnswerMapping= require('../../models/user_answer_mapping')
const Users= require('../../models/user');
/**
 * Get Question by Question id and return whole object response
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as question.
 * @param {Function} next
 * @return {Question}
 */
exports.get_questionByfilter = async function (req, res, next) {
    //let question_id = req.params.question_id;
    let questions;
    try {
        questions = await Question.find(req.params);
        res.send(200, questions);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
// /**
//  * Get Question by Question level and return whole object response
//  * @param req {Object} The request.
//  * @param res {Object} The response.
//  * @param req.body {Object} The JSON payload.
//  * @param req.body.level_name {String} question level  
//  * @param {Function} next
//  * @return {Question}
//  */

// exports.get_questionBylevel = async function (req, res, next) {
//     let level = req.params.level;
//     let question;
//     try {
//         question = await Question.find({
//             "level": level
//         });
//         res.send(200, question);
//         next();
//     } catch (error) {
//         res.send(500, new Error(error));
//         next();
//     }
// };

// /**
//  * Get Question by Question quize type and return whole object response
//  * @param req {Object} The request.
//  * @param res {Object} The response.
//  * @param req.body {Object} The JSON payload.
//  * @param req.body.levelquize_type_name {String} quize type  
//  * @param {Function} next
//  * @return {Question}
//  */
// exports.get_questionByQuizetype = async function (req, res, next) {
//     let quize_type = req.body.quize_type;
//     let question;
//     try {
//         question = await Question.find({
//             "quize_type": quize_type
//         });
//         res.send(200, question);
//         next();
//     } catch (error) {
//         res.send(500, new Error(error));
//         next();
//     }
// };

/**
 * update question details.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as question object.
 * @param {Function} next
 * @return {Question}
 */
exports.update_questionById  = async function (req, res, next) {
    let question_update=req.body;
    let question_id = question_update.question_id;

    let question;
    try {
        // question = await Question.find({
        //     "question_id": question_id
        // });
        await Question.updateOne({ "question_id": question_id},
        {$set: { "question_st" : question_update.question_st,
                 "question_type" : question_update.question_type,
                 "question" : question_update.question,
                 "options" : question_update.options,
                 "score" : question_update.score,
                 "answer" : question_update.answer,
                 "pikacharanswer": question_update.pikacharanswer,
                 "artifact_path" : question_update.artifact_path,
                 "level" : question_update.level,
                 "quiz_type" : question_update.quiz_type,
                 "date" : question_update.date,
                 "reference" : question_update.reference,
                 "jumbledata": question_update.jumbledata
                }} );
        question=  await Question.findOne({ "question_id": question_id});
        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/**
 * inert new question details.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as question object.
 * @param {Function} next
 * @return {Question}
 */
exports.insert_question  = async function (req, res, next) {
    let question_insert=req.body;
    let question;
    try {
        // question = await Question.find({
        //     "question_id": question_id
        // });
        question=  new Question(
        {   "question_id": await getNextSequenceValue("qid"),
            "question_st" : question_insert.question_st,
            "question_type" : question_insert.question_type,
            "question" : question_insert.question,
            "options" : question_insert.options,
            "score" : question_insert.score,
            "answer" : question_insert.answer,
            "pikacharanswer": question_update.pikacharanswer,
            "artifact_path" : question_insert.artifact_path,
            "level" : question_insert.level,
            "quiz_type" : question_insert.quiz_type,
            "date" : question_insert.date,
            "reference" : question_insert.reference,
            "jumbledata": question_insert.jumbledata
        } );
        await  question.save();
        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/** https://stackoverflow.com/questions/35813854/how-to-join-multiple-collections-with-lookup-mongodb
 * inert new questions details.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as questions object.
 * @param {Function} next
 * @return {Questions}
 */
exports.insert_questions  = async function (req, res, next) {
    let question_inserts=req.body;

    let questions=[];
    try {
        let lastQid=await getNextSequenceValue("qid");
        console.log(lastQid);
        question_inserts.forEach(question_insert => {
            questions.push({   "question_id":lastQid,
            "question_st" : question_insert.question_st,
            "question_type" : question_insert.question_type,
            "question" : question_insert.question,
            "options" : question_insert.options,
            "score" : question_insert.score,
            "answer" : question_insert.answer,
            "pikacharanswer": question_insert.pikacharanswer,
            "artifact_path" : question_insert.artifact_path,
            "level" : question_insert.level,
            "quiz_type" : question_insert.quiz_type,
            "date" : question_insert.date,
            "reference" : question_insert.reference,
            "jumbledata": question_insert.jumbledata
        });
        lastQid++;
        });
        
        await Counter.updateOne({"sequence_name": "qid" },
            { $set : {"sequence_value":lastQid-1}})
       let questions_Res=  await Question.insertMany(questions);
       
        res.send(200, questions_Res);
        next();
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
};
/**
 * get auto incremented number for Questionid
 * @param {some number} sequenceName 
 */
async function getNextSequenceValue(sequenceName){
    insertSequnceValue(sequenceName);
    var sequenceDocument = await Counter.updateOne({"sequence_name": sequenceName },
    { $inc : {"sequence_value":1}});
    sequenceDocument =await Counter.findOne({"sequence_name" : sequenceName});
    return sequenceDocument.sequence_value;
  }
  async function insertSequnceValue(sequenceName)
  {
      let counters= await Counter.findOne({"sequence_name":sequenceName});
      if(counters==undefined || counters==null)
      { 
            let count= new Counter({"sequence_name":sequenceName,"sequence_value":0});
            await count.save();
      }
  }
/**
 * Delete Question by _id
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {Question}
 */
exports.delete = async function (req, res, next) {
    try {
        let result = await Question.deleteOne({ "question_id": req.params.id });
        if (result.n) {
            res.send(200, { msg: "Question deleted successfully !!" });
        } else {
            res.send(404, { msg: "Question not found" });
        }
    } catch (error) {
        res.send(500, new Error(error));
    }
    next();

};


/**
 * Get answered question for user wise
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.mhtid {String} user mht id
 * @param {Function} next
 * @return {questionanswer}
 */
exports.get_questionanswerBymhtid = async function (req, res, next) {
    try {
        //let mhtid=req.params.mhtid;
        let mhtid=parseInt(req.params.mhtid, 10)
        console.log(mhtid);

        let questionanswer= await UserAnswerMapping.aggregate([{
            $lookup: {
                from: "questions",
                localField: "question_id",
                foreignField: "question_id",
                as: "questiondetails"
            }},
            { $unwind:"$questiondetails" },     // $unwind used for getting data in object or for one record only
        
            // Join with user_role table
            {
                $lookup:{
                    from: "users", 
                    localField: "mht_id", 
                    foreignField: "mht_id",
                    as: "users"
                }
            },
            {   $unwind:"$users" },
            // define some conditions here 
            {
                $match:{ "mht_id" : mhtid }
            },
             // define which fields are you want to fetch
            {   
                $project:{
                    _id : 1,
                    question_id : 1,
                    mht_id : 1,
                    quiz_type:1,
                    answer:1,
                    pikacharanswer: 1,
                    answer_status:1,
                    level : "$questiondetails.level",
                    score : "$questiondetails.score",
                    question : "$questiondetails.question",
                    question_type : "$questiondetails.question_type",
                    question_st : "$questiondetails.question_st",
                    quiz_type : "$questiondetails.quiz_type",
                    date : "$questiondetails.date",
                    reference : "$questiondetails.reference",
                    mobile : "$users.mobile",
                    email : "$users.email",
                    name : "$users.name",
                    lives : "$users.lives",
                    totalscore : "$users.totalscore",
                    bonus : "$users.bonus"
                } 
            }
        ]);
          
        res.send(200, questionanswer);
        next();
    } catch (error) {
        console.log(error);
        res.send(500, new Error(error));
        next();
    }
};

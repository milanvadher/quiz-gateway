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
exports.get_questionById = async function (req, res, next) {
    let question_id = req.body.question_id;
    let question;
    try {
        question = await Question.findOne({
            "question_id": question_id
        });
        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
/**
 * Get Question by Question level and return whole object response
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.level_name {String} question level  
 * @param {Function} next
 * @return {Question}
 */

exports.get_questionBylevel = async function (req, res, next) {
    let level = req.body.level;
    let question;
    try {
        question = await Question.find({
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
 * Get Question by Question quize type and return whole object response
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param req.body.levelquize_type_name {String} quize type  
 * @param {Function} next
 * @return {Question}
 */
exports.get_questionByQuizetype = async function (req, res, next) {
    let quize_type = req.body.quize_type;
    let question;
    try {
        question = await Question.find({
            "quize_type": quize_type
        });
        res.send(200, question);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

/**
 * update question details.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as question object.
 * @param {Function} next
 * @return {Question}
 */
exports.update_questionById  = async function (req, res, next) {
    let question_update=req.body.question;
    let question_id = question.question_id;

    let question;
    try {
        // question = await Question.find({
        //     "question_id": question_id
        // });
        question=  await Question.update({ "question_id": question_id},
        {$set: { "question_st" : question_update.question_st,
                 "question_type" : question_update.question_type,
                 "question" : question_update.question,
                 "options" : question_update.options,
                 "score" : question_update.score,
                 "answer" : question_update.answer,
                 "artifact_path" : question_update.artifact_path,
                 "level" : question_update.level,
                 "quize_type" : question_update.quize_type,
                 "date" : question_update.date,
                 "reference" : question_update.reference
                }} );
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
    let question_insert=req.body.question;
    let question;
    try {
        // question = await Question.find({
        //     "question_id": question_id
        // });
        question=  await Question.insert(
        {   "question_id": getNextSequenceValue("qid"),
            "question_st" : question_insert.question_st,
            "question_type" : question_insert.question_type,
            "question" : question_insert.question,
            "options" : question_insert.options,
            "score" : question_insert.score,
            "answer" : question_insert.answer,
            "artifact_path" : question_insert.artifact_path,
            "level" : question_insert.level,
            "quize_type" : question_insert.quize_type,
            "date" : question_insert.date,
            "reference" : question_insert.reference
        } );
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
    let question_inserts=req.body.questions;
    let question_id = question.question_id;

    let questions=[];
    try {
        // question = await Question.find({
        //     "question_id": question_id
        // });
        let lastQid=getNextSequenceValue("qid");
        question_inserts.array.forEach(question_insert => {
            questions.push({   "question_id":lastQid,
            "question_st" : question_insert.question_st,
            "question_type" : question_insert.question_type,
            "question" : question_insert.question,
            "options" : question_insert.options,
            "score" : question_insert.score,
            "answer" : question_insert.answer,
            "artifact_path" : question_insert.artifact_path,
            "level" : question_insert.level,
            "quize_type" : question_insert.quize_type,
            "date" : question_insert.date,
            "reference" : question_insert.reference
        });
        lastQid++;
        });
       let questions_Res=  await Question.insertMany(
            questions
            );
        res.send(200, questions_Res);
        next();
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};
/**
 * get auto incremented number for Questionid
 * @param {some number} sequenceName 
 */
function getNextSequenceValue(sequenceName){
    insertSequnceValue(sequenceName);
    var sequenceDocument = Counter.findAndModify({
    query:{question_id: sequenceName },
    update: {$inc:{sequence_value:1}},
    new:true
      });
  return sequenceDocument.sequence_value;
  }
  function insertSequnceValue(sequenceName)
  {
      let counters= Counter.findOne({question_id:sequenceName});
      if(counters==undefined || counters==null)
          Counter.insert({question_id:sequenceName,sequence_value:0});
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
        let result = await Question.remove({ _id: req.params.id });
        if (result.n) {
            res.send(200, { msg: "Question deleted successfully !!" });
            next();
        } else {
            res.send(404, { msg: "Question not found" });
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
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
exports.get_questionanswerBymhiid = async function (req, res, next) {
    try {
        let mhtid=req.body.mhtid
        let questionanswer= await   UserAnswerMapping.aggregate([{
            $lookup: {
                from:Question,
                localField: question_id,
                foreignField: question_id,
                as: 'questiondetails'
            }},
            { $unwind:"$questiondetails" },     // $unwind used for getting data in object or for one record only
        
            // Join with user_role table
            {
                $lookup:{
                    from: Users, 
                    localField: mht_id, 
                    foreignField: mht_id,
                    as: "users"
                }
            },
            {   $unwind:"$users" },
            // define some conditions here 
            {
                $match:{
                    $and:[{"mht_id" : mhtid}]
                }
            },
             // define which fields are you want to fetch
            {   
                $project:{
                    _id : 1,
                    question_id : 1,
                    mht_id : 1,
                    quize_type:1,
                    answer:1,
                    answer_status:1,
                    level : "$questiondetails.level",
                    score : "$questiondetails.score",
                    question : "$questiondetails.question",
                    question_type : "$questiondetails.question_type",
                    question_st : "$questiondetails.question_st",
                    quize_type : "$questiondetails.quize_type",
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
        res.send(500, new Error(error));
        next();
    }
};

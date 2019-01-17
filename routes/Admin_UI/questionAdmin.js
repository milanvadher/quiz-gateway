/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const Question = require('../models/question');

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

exports.insert_question  = async function (req, res, next) {
    let question_insert=req.body.question;
    let question_id = question.question_id;

    let question;
    try {
        // question = await Question.find({
        //     "question_id": question_id
        // });
        question=  await Question.insert(
        {   "question_id": question_insert.question_id,
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
exports.insert_questions  = async function (req, res, next) {
    let question_inserts=req.body.questions;
    let question_id = question.question_id;

    let questions=[];
    try {
        // question = await Question.find({
        //     "question_id": question_id
        // });
        question_inserts.array.forEach(question_insert => {
            questions.push({   "question_id": question_insert.question_id,
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
function getNextSequenceValue(sequenceName){
    var sequenceDocument = db.counters.findAndModify({
    query:{_id: sequenceName },
    update: {$inc:{sequence_value:1}},
    new:true
      });
  return sequenceDocument.sequence_value;
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
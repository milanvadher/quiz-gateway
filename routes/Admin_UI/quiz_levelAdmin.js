/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const QuizLevel = require('../../models/quiz_level');
/**
* Get quize level by index
* @param req {Object} The request.
* @param res {Object} The response.
* @param req.params {Object} The JSON payload.
* @param {Function} next
* @return {quize_level}
*/
exports.get_quiz_levelByfilter = async function (req, res, next) {
   try {
       let quiz_level = await QuizeLevel.find(req.params);
       res.send(200, quize_level);
       next();
   } catch (error) {
       res.send(500, new Error(error));
       next();
   }
};

// /**
//  * Get all quize level
//  * @param req {Object} The request.
//  * @param res {Object} The response.
//  * @param req.body {Object} The JSON payload.
//  * @param {Function} next
//  * @return {Question}
//  */
// exports.get_quize_leve = async function (req, res, next) {
//     try {
//         let quizeLevel= await  QuizeLevel.find({});
//         res.send(200, quizeLevel);
//         next();
//     } catch (error) {
//         res.send(500, new Error(error));
//         next();
//     }
// };



// /**
//  * Get quize level by name
//  * @param req {Object} The request.
//  * @param res {Object} The response.
//  * @param req.body {Object} The JSON payload.
//  * @param req.body.level_name {String} quize level 
//  * @param {Function} next
//  * @return {quize_level}
//  */
// exports.get_quize_leveByname = async function (req, res, next) {
//     try {
//         let name=req.body.level_name
//         let quizeLevel= await  QuizeLevel.find({"name":name});
//         res.send(200, quizeLevel);
//         next();
//     } catch (error) {
//         res.send(500, new Error(error));
//         next();
//     }
// };

// /**
//  * Get quize level by level type
//  * @param req {Object} The request.
//  * @param res {Object} The response.
//  * @param req.body {Object} The JSON payload.
//  * @param req.body.level_type {String} quize level type 
//  * @param {Function} next
//  * @return {quize_levels}
//  */
// exports.get_quize_leveByleveltype = async function (req, res, next) {
//     try {
//         let level_type=req.body.level_type
//         let quizeLevel= await  QuizeLevel.find({"level_type":level_type});
//         res.send(200, quizeLevel);
//         next();
//     } catch (error) {
//         res.send(500, new Error(error));
//         next();
//     }
// };



/**
 * update quize level data: fiter  by the level_index and update other data.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as quize_level.
 * @param {Function} next
 * @return {quize_level}
 */
exports.update_quiz_level = async function (req, res, next) {
    try {
        
        let quiz_level = req.body;
        let index = quiz_level.level_index;
        let quizlevel = await QuizLevel.updateOne({"level_index":index},
        { $set: {
            "name": quiz_level.name,
            "level_type": quiz_level.level_type,
            "total_questions": quiz_level.total_questions,
            "categorys": quiz_level.categorys,
            "start_date": quiz_level.start_date,
            "end_date": quiz_level.end_date        }}
        );
        res.send(200, quizlevel);
    } catch (error) {
        res.send(500, new Error(error));
    }
    next();
};
/**
 * insert in into quize level collection, responce new added object or give validation message if same level index exsisted.
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload as quize level object.
 * @param {Function} next
 * @return {quize_level}
 */
exports.insert_quiz_level = async function (req, res, next) {
    try {
        let quiz_level = req.body;
        let quiz_levels = [];
        
        quiz_levels = await QuizeLevel.find({"level_index": quiz_level.level_index});
        if(quiz_levels == undefined || quiz_levels == null || quiz_levels.length==0 )
        {
            let quizLevel = new QuizeLevel(quiz_level);
            quizLevel.save();
            res.send(200, quizLevel);
        }
        else
        {
            res.send(200, "This level index already exsist!!");
        }
    }
     catch (error) {
        res.send(500, new Error(error));
    }
    next();

};
/**
 * Delete quize level by level index
 * @param req {Object} The request.
 * @param res {Object} The response.
 * @param req.body {Object} The JSON payload.
 * @param {Function} next
 * @return {message}
 */
exports.delete_quiz_level = async function (req, res, next) {
    try {
        let result = await QuizLevel.deleteOne({"level_index": req.params.id});
        if (result.n) {
            res.send(200, { msg: "Quiz level deleted successfully !!" });
            next();
        } else {
            res.send(404, { msg: "Quiz level not found" });
            next();
        }
    } catch (error) {
        res.send(500, new Error(error));
        next();
    }
};

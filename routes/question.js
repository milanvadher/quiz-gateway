/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const Question = require('../models/question');

module.exports = function (server) {

    /**
     * LIST QUESTIONS
     */
    server.post('/questions', (req, res, next) => {

        Question.find({}, function (err, questions){
            if (err) {
                console.log(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }
            res.send(questions);
            next();
        });
    });

};
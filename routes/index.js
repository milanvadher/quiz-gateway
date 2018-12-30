/**
 * Module Dependencies
 */
const errors = require('restify-errors');

/**
 * Model Schema
 */
const Test = require('../models/test');
const User = require('../models/user');
const Question = require('../models/question');
const UserScore = require('../models/user_score');

module.exports = function (server) {

    server.post('/questions', (req, res, next) => {
        //let mobile = req.user.mobile;
        Question.find({}, (error, response) => {
            if(!error) {
                res.send(response);
                next();
            }
        })
    });


	/**
	 * POST
	 */
    server.post('/test', (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'"),
            );
        }

        let data = req.body || {};

        let test = new Test(data);
        test.save(function (err) {
            if (err) {
                console.error(err);
                return next(new errors.InternalError(err.message));
                // next();
            }
            res.send(201);
            next();
        });
    });

	/**
	 * LIST
	 */
    server.get('/test', (req, res, next) => {
        Test.apiQuery(req.params, function (err, docs) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }
            res.send(docs);
            next();
        });
    });

	/**
	 * GET
	 */
    server.get('/test/:test_id', (req, res, next) => {
        Test.findOne({ _id: req.params.test_id }, function (err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }
            res.send(doc);
            next();
        });
    });

	/**
	 * UPDATE
	 */
    server.put('/test/:test_id', (req, res, next) => {
        if (!req.is('application/json')) {
            return next(
                new errors.InvalidContentError("Expects 'application/json'"),
            );
        }
        
        let data = req.body || {};

        if (!data._id) {
            data = Object.assign({}, data, { _id: req.params.todo_id });
        }

        Test.findOne({ _id: req.params.todo_id }, function (err, doc) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            } else if (!doc) {
                return next(
                    new errors.ResourceNotFoundError(
                        'The resource you requested could not be found.',
                    ),
                );
            }

            Test.update({ _id: data._id }, data, function (err) {
                if (err) {
                    console.error(err);
                    return next(
                        new errors.InvalidContentError(err.errors.name.message),
                    );
                }

                res.send(200, data);
                next();
            });
        });
    });

	/**
	 * DELETE
	 */
    server.del('/todos/:todo_id', (req, res, next) => {
        Test.remove({ _id: req.params.todo_id }, function (err) {
            if (err) {
                console.error(err);
                return next(
                    new errors.InvalidContentError(err.errors.name.message),
                );
            }

            res.send(204);
            next();
        });
    });
};    
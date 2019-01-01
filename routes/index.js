/**
 * Module Dependencies
 */
const errors = require('restify-errors');
const fs = require('fs');

var request_handlers = {},
    handler_paths = `${process.cwd()}/routes`;

fs.readdirSync(handler_paths).forEach(function (file) {
    if (file.indexOf('.js') != -1) {
        request_handlers[file.split('.')[0]] = require(handler_paths + '/' + file)
    }
});


module.exports = function (server) {
    


    // Question Routes
    server.post('/question', request_handlers.question.get_question);
    server.post('/quiz_level', request_handlers.question.get_quiz_details);
	
};    
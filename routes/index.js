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
    // User Routes
    server.post('/register', request_handlers.user.register_user);
    server.post('/login', request_handlers.user.login);
    server.get('/users', request_handlers.user.get_users);
    server.del('/deleteuser/:id', request_handlers.user.delete);


    // Question Routes
    server.post('/question', request_handlers.question.get_question);
    server.post('/questions', request_handlers.question.get_questions);
    server.post('/quiz_level', request_handlers.question.get_quiz_details);
    server.post('/validate_answer', request_handlers.question.validate_answer);
	
};    
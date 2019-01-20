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
handler_paths = `${process.cwd()}/routes/Admin_UI`;
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

     // Application Routes
     server.get('/get_applicationSetting', request_handlers.app_settingAdmin.get_applicationSetting);
     server.put('/applicationSetting', request_handlers.app_settingAdmin.update_applicationSetting);
     server.post('/applicationSetting', request_handlers.app_settingAdmin.insert_applicationSetting);
 

    // Question Routes
    server.post('/question', request_handlers.question.get_question);
    server.post('/questions', request_handlers.question.get_questions);
    server.post('/hint_question', request_handlers.question.hint_question);
    server.post('/validate_answer', request_handlers.question.validate_answer);
    server.post('/bonusquestion', request_handlers.question.get_bonusquestion);
    server.post('/lifefromScore', request_handlers.question.get_lifefromScore);
    server.post('/quiz_level', request_handlers.question.get_quiz_details);

     // User scores Routes
     server.get('/userscores', request_handlers.user_score.get_userScoresByfilter);
    

    // Question Admin Routes
     server.get('/question', request_handlers.questionAdmin.get_questionByfilter);
     server.put('/question', request_handlers.questionAdmin.update_questionById);
     server.post('/addquestions', request_handlers.questionAdmin.insert_questions);
     server.del('/deletequestion/:question_id', request_handlers.questionAdmin.deletequestion);
     server.get('/questionanswer/:mhtid', request_handlers.questionAdmin.get_questionanswerBymhtid);
     
    // Quize Level Admin Routes
    server.get('/quizleve', request_handlers.quize_levelAdmin.get_quize_leveByfilter);
    server.put('/quizlevel', request_handlers.quize_levelAdmin.update_quize_level);
    server.post('/quizlevel', request_handlers.quize_levelAdmin.insert_quize_level);
    server.del('/deletequizlevel/:id', request_handlers.quize_levelAdmin.delete_quiz_level);

};    
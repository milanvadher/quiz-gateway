/**
 * Module Dependencies
 */
const errors = require('restify-errors');
const fs = require('fs');

var request_handlers = {},
    handler_paths = `${process.cwd()}/routes`;

/**
 * Import routes recursively from a directory path
 */
async function import_routes(dir_path) {
    // Walk directory
    fs.readdirSync(dir_path).forEach(function (file) {
        let file_path = `${dir_path}/${file}`;
        let stat = fs.statSync(file_path);
        // If it is a directory, invoke again
        if(stat && stat.isDirectory()) {
            import_routes(file_path);
        } else if (file.indexOf('.js') != -1 && file != 'index.js') {
            // require the route file
            request_handlers[file.split('.')[0]] = require(file_path);
        }
    });
}

import_routes(handler_paths);

const route_definitions = [
    {'path': '/quiz_level', 'method': 'post', 'handler': request_handlers.question.get_quiz_details}
];

async function request_dispatcher(req, res, next) {
    let req_handler = get_handler(req.path());
    let data = await req_handler(req);
    let response = {
        "status": 200,
        "data": data 
    };
    res.send(200, response);
    next();
}

function get_handler(path) {
    for(index in route_definitions) {
        let route = route_definitions[index];
        console.log(path);
        console.log(route.path);
        if(route.path === path) {
            return route.handler;
        }
    }
}

module.exports = async function (server) {

    for(index in route_definitions) {
        let route = route_definitions[index];
        server[route.method](route.path, request_dispatcher);
    }


    // User Routes
    server.post('/register', request_handlers.user.register_user);
    server.post('/login', request_handlers.user.login);
    server.get('/users', request_handlers.user.get_users);
    server.del('/deleteuser/:id', request_handlers.user.delete);

    // Application Routes
    server.get('/get_applicationSetting', request_handlers.app_settingAdmin.get_applicationSetting);
    server.post('/edit_applicationSetting', request_handlers.app_settingAdmin.update_applicationSetting);
    server.post('/add_applicationSetting', request_handlers.app_settingAdmin.insert_applicationSetting);
 

    // Question Routes
    server.post('/question', request_handlers.question.get_question);
    server.post('/questions', request_handlers.question.get_questions);
    server.post('/hint_question', request_handlers.question.hint_question);
    server.post('/validate_answer', request_handlers.question.validate_answer);
    server.post('/bonusquestion', request_handlers.question.get_bonusquestion);
    server.post('/lifefromScore', request_handlers.question.get_lifefromScore);
    //server.post('/quiz_level', request_handlers.question.get_quiz_details);

    // User scores Routes
    server.get('/get_userscores', request_handlers.user_score.get_userScoresByfilter);
    

    // Question Admin Routes
    server.get('/get_question', request_handlers.questionAdmin.get_questionByfilter);
    server.post('/edit_questionByquestionid', request_handlers.questionAdmin.update_questionById);
    server.post('/add_questions', request_handlers.questionAdmin.insert_questions);
    server.del('/deletequestion/:question_id', request_handlers.questionAdmin.deletequestion);
    server.get('/get_questionanswerBymhtid/:mhtid', request_handlers.questionAdmin.get_questionanswerBymhtid);
     
    // Quize Level Admin Routes
    server.get('/get_quizleve', request_handlers.quize_levelAdmin.get_quize_leveByfilter);
    server.post('/edit_quizlevel', request_handlers.quize_levelAdmin.update_quize_level);
    server.post('/add_quizlevel', request_handlers.quize_levelAdmin.insert_quize_level);
    server.del('/deletequizlevel/:id', request_handlers.quize_levelAdmin.delete_quiz_level);
};    
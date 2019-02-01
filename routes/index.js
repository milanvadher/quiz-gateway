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
        console.log(file_path);
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
    {
        // User Routes
        'handler': request_handlers.user,
        'routes': [
            {'path': '/validate_user', 'method': 'post', 'receiver': 'validate_user'},
            {'path': '/register', 'method': 'post', 'receiver': 'register'},
            {'path': '/login', 'method': 'post', 'receiver': 'login'},
            {'path': '/forgot_password', 'method': 'post', 'receiver': 'forgot_password'},
            {'path': '/update_password', 'method': 'post', 'receiver': 'update_password'},
            {'path': '/users', 'method': 'get', 'receiver': 'list'},
            {'path': '/leaders', 'method': 'get', 'receiver': 'leaders'},
            {'path': '/user/:id', 'method': 'del', 'receiver': 'remove'}
            //{'path': '/generate_otp', 'method': 'post', 'receiver': 'generate_otp'},
            //{'path': '/verify_otp', 'method': 'post', 'receiver': 'verify_otp'}
        ]
    },
    {
        // Application Routes
        'handler': request_handlers.app_settingAdmin,
        'routes': [
            {'path': '/app_set', 'method': 'get', 'receiver': 'get'},
            {'path': '/app_set', 'method': 'put', 'receiver': 'update'},
            {'path': '/app_set', 'method': 'post', 'receiver': 'create'},
        ]
    },
    {
        // Question Routes
        'handler': request_handlers.question,
        'routes': [
            {'path': '/question', 'method': 'post', 'receiver': 'get'},
            {'path': '/questions', 'method': 'post', 'receiver': 'list'},
            {'path': '/hint_question', 'method': 'post', 'receiver': 'hint_question'},
            {'path': '/validate_answer', 'method': 'post', 'receiver': 'validate_answer'},
            {'path': '/bonus_question', 'method': 'post', 'receiver': 'get_bonus_question'},
            {'path': '/req_life', 'method': 'post', 'receiver': 'req_life'},
            {'path': '/user_state', 'method': 'post', 'receiver': 'user_state'},
            {'path': '/puzzle_completed', 'method': 'post', 'receiver': 'puzzle_completed'},
        ]
    },
    {
        // User scores Routes
        'handler': request_handlers.user_score,
        'routes': [
            {'path': '/user_scores', 'method': 'get', 'receiver': 'get'}
        ]
    },
    {
        // Question Admin Routes
        'handler': request_handlers.questionAdmin,
        'routes': [
            {'path': '/admin/question', 'method': 'get', 'receiver': 'get_questionByfilter'},
            {'path': '/admin/question', 'method': 'put', 'receiver': 'update_questionById'},
            {'path': '/admin/questions', 'method': 'post', 'receiver': 'insert_questions'},
            {'path': '/admin/question/:id', 'method': 'del', 'receiver': 'delete'},
            {'path': '/admin/questionanswerBymhtid/:mhtid', 'method': 'get', 'receiver': 'get_questionanswerBymhtid'},
        ]
    },
    {
        // Quize Level Admin Routes
        'handler': request_handlers.quiz_levelAdmin,
        'routes': [
            {'path': '/admin/quizlevel', 'method': 'get', 'receiver': 'get_quiz_levelByfilter'},
            {'path': '/admin/quizlevel', 'method': 'put', 'receiver': 'update_quiz_level'},
            {'path': '/admin/quizlevel', 'method': 'post', 'receiver': 'insert_quiz_level'},
            {'path': '/admin/quizlevel/:id', 'method': 'del', 'receiver': 'delete_quiz_level'}
        ]
    }
];

module.exports = async function (server) {
    for(index in route_definitions) {
        let route_def = route_definitions[index];
        for(ind in route_def.routes) {
            let route = route_def.routes[ind];
            console.log(route);
            server[route.method](route.path, route_def.handler[route.receiver]);
        }
    }
};
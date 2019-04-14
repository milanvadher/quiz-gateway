require('dotenv').config()

module.exports = function() {
	let conf = {
		name: 'QUIZ_GATEWAY',
		env: process.env.NODE_ENV || 'development',
		jwt_secret: process.env.JWT_SECRET || 'MBA-QUIZ'
	};
	switch(process.env.NODE_ENV){
		case 'development':
			conf.db = {uri: `${process.env.OPENSHIFT_MONGODB_DB_URL}/QuizGateWay-Development`};
			conf.port = process.env.OPENSHIFT_NODEJS_PORT;
			break;
        case 'production':
			conf.db = {uri: 'mongodb://127.0.0.1:27017/QuizGateWay'};
			conf.port = 3000;
			break;
	}
	return conf;
}();
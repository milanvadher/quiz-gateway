require('dotenv').config()

module.exports = function() {
	let conf = {
		name: 'QUIZ_GATEWAY',
		env: process.env.NODE_ENV || 'development',
		jwt_secret: process.env.JWT_SECRET || 'MBA-QUIZ'
	};
	switch(process.env.NODE_ENV){
		case 'development':
			conf.db = {uri: `mongodb://127.0.0.1:27017/LuckyDraw`};
			conf.port = 3001;
			break;
        case 'production':
			conf.db = {uri: 'mongodb://127.0.0.1:27017/LuckyDraw'};
			conf.port = 3001;
			break;
	}
	return conf;
}();
/**
 * Module Dependencies
 */
const config = require('./config');
const restify = require('restify');
const mongoose = require('mongoose');
const restifyPlugins = require('restify-plugins');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const response_transformation = require('./utility/transformation');
const onesignal = require('./utility/onesignal-notification');
const schedule = require('node-schedule');
/**
  * Initialize Server
  */
const server = restify.createServer({
    name: config.name,
    version: config.version,
});

// log all requests to access.log
server.use(morgan(':remote-addr - :method - :url - :status - HTTP/:http-version - [:date[iso]] - :res[content-length] - :response-time - ":referrer" - ":user-agent"', {
    stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

const corsMiddleware = require('restify-cors-middleware');
const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['*'],
  //exposeHeaders: ['API-Token-Expiry']
})

server.pre(cors.preflight)
server.use(cors.actual)
/**
  * Middleware
  */
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(response_transformation.transform);
server.use(restifyPlugins.fullResponse());
server.use(function (req, res, next) {
    if (req.url === '/login' || req.url === '/validate_user' || req.url === '/register' || req.url === '/forgot_password' || req.url === '/update_password' || req.url === '/testMail') return next();

    // // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'] || req.query.token;

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.jwt_secret, function (err, decoded) {
            if (err) {
                return res.send(403, { success: false, msg: 'Failed to authenticate token.' });
                next(false);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.send(403, {
            success: false,
            message: 'No token provided.'
        });
        next(false);
    }
});

/**
  * Start Server, Connect to DB & Require Routes
  */
server.listen(config.port, () => {
    // establish connection to mongodb
    mongoose.Promise = global.Promise;
    scheduleNotification();
    // mongoose.connect(config.db.uri, { useMongoClient: true });
    mongoose.connect(config.db.uri, { useNewUrlParser: true }).then(() => {
        console.log('Connected to DB Successfully !! ');
    });

    const db = mongoose.connection;

    db.on('error', (err) => {
        console.error(err);
        process.exit(1);
    });

    db.once('open', () => {
        require('./routes/index')(server);
        console.log(`Server is listening on port ${config.port}`);
    });
});

function scheduleNotification() {
    var j = schedule.scheduleJob('45 7 * * *', function (date) {
        console.log("Notification event occured:" + date);
        onesignal.sendNewChallengeMsg()
    });
}
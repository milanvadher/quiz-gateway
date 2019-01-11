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

/**
  * Middleware
  */
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());
server.use(function (req, res, next) {

    if (req.url === '/login' || req.url === '/register') return next();

    // check header or url parameters or post parameters for token
    const token = req.headers['x-access-token'] || req.query.token;

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.jwt_secret, function (err, decoded) {
            if (err) {
                return res.send(403, { success: false, message: 'Failed to authenticate token.' });
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
    }
})
/**
  * Start Server, Connect to DB & Require Routes
  */
server.listen(config.port, () => {
    // establish connection to mongodb
    mongoose.Promise = global.Promise;
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

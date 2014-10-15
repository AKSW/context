var session = require('express-session');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var config = require('../config');

module.exports = function(app) {
    // session support
    app.use(cookieParser(config.cookieParserSalt));
    app.use(session({
        secret: config.cookieParserSalt + config.sidSalt,
        store: new MongoStore(config.sessionDb),
        key: 'sessionId',
        saveUninitialized: true,
        resave: true,
    }));
};

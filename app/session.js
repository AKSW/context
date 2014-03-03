var express = require('express'),
    passport = require('passport'),
    config = require('../config'),
    MongoStore = require('connect-mongo')(express);

module.exports = function(app) {
    // session support
    app.use(express.cookieParser(config.cookieParserSalt));
    app.use(express.session({
        secret: config.cookieParserSalt + config.sidSalt,
        store: new MongoStore(config.sessionDb)
    }));

    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
};

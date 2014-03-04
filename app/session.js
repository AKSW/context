var express = require('express'),
    config = require('../config'),
    MongoStore = require('connect-mongo')(express);

module.exports = function(app) {
    // session support
    app.use(express.cookieParser(config.cookieParserSalt));
    app.use(express.session({
        secret: config.cookieParserSalt + config.sidSalt,
        store: new MongoStore(config.sessionDb)
    }));
};

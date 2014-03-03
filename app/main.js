var flash = require('connect-flash'),
    express = require('express');

module.exports = function(app) {
    // use flash messaging
    app.use(flash());

    // parse request bodies (req.body)
    app.use(express.json());
    app.use(express.urlencoded());

    // support _method (PUT in forms etc)
    app.use(express.methodOverride());
};

var express = require('express');

module.exports = function(app) {
    // parse request bodies (req.body)
    app.use(express.json());
    app.use(express.urlencoded());

    // support _method (PUT in forms etc)
    app.use(express.methodOverride());
};

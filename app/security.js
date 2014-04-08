var express = require('express');

module.exports = function(app) {
    // use csrf
    app.use(express.csrf());
    // disable powered-by header
    app.disable('x-powered-by');
};

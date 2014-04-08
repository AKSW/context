var express = require('express');

module.exports = function(app) {
    // use csrf
    app.use(express.csrf());
};

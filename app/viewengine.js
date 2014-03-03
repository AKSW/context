var dust = require('dustjs-linkedin'),
    cons = require('consolidate'),
    express = require('express');

module.exports = function(app, dirname) {
    // settings
    // map .renderFile to ".html" files
    app.engine('dust', cons.dust);

    // make ".dust" the default
    app.set('view engine', 'dust');

    // set views for error and 404 pages
    app.set('views', dirname + '/views');

    // serve static files
    app.use(express.static(dirname + '/public'));
};

var nodemon = require('gulp-nodemon');

module.exports = function(){
    var config = require('../../config');
    var logger = require('../../logger');

    // start nodemon
    return nodemon({
            script: './app.js',
            verbose: true
        })
        // listen for events
        .on('start', function () {
            logger.info('Starting up context, serving on [localhost:' + config.defaultPort + ']');
            logger.info('Hit CTRL-C to stop the server');
        })
        .on('quit', function () {
            logger.info('App has quit');
        })
        .on('restart', function (files) {
            logger.info('App restarted due to: ', files);
        });
};
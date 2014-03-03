// includes
var express = require('express'),
    config = require('./config');

// deploy test
// make app
var app = module.exports = express();

// load view engine config
require('./app/viewengine')(app, __dirname);

// load main app config
require('./app/main')(app);

// load sessions config
require('./app/session')(app);

// load flash messages config
require('./app/flashmessaging')(app);

// load access control
require('./app/accesscontrol')(app);

// load controllers
require('./lib/boot')(app, { verbose: !module.parent });

// load error routes (404. 5xx)
require('./app/errorhandling')(app);

// if running in single debug mode
if (!module.parent) {
    app.use(express.logger('dev'));
    app.listen(config.defaultPort);
    console.log('\n  listening on port '+config.defaultPort+'\n');
}

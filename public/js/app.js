// load modules
var CorpusModule = require('./modules/corpus');

// init app
var app = angular.module('context-app', ['ngRoute', 'ngAnimate', 'mgcrea.ngStrap', 'ngSanitize', 'CorpusModule']);

// config app routes
require('./routes')(app);

// config app services
require('./services')(app);

// init controllers
require('./controllers')(app);

// config app directives
require('./directives')(app);

// config app filters
require('./filters')(app);

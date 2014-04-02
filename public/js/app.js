// load bower libs
window.$ = window.jQuery = require('jquery');
require('bootstrap');
// load angular and router
var angular = require('angular');
require('angular-router-browserify')(angular);

// load modules
var CorpusModule = require('./modules/corpus');

// init app
var app = angular.module('context-app', ['ngRoute', 'CorpusModule']);

// config app routes
require('./routes')(app);

// init controllers
require('./controllers')(app);

// config app directives
require('./directives')(app);

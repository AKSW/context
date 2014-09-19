// load modules
var CorpusModule = require('./modules/corpus');

// init app
var app = angular.module('context-app', ['ngRoute', 'ngAnimate', 'mgcrea.ngStrap', 'CorpusModule','vs-repeat','pasvaz.bindonce','infinite-scroll']);

app.filter('pagination', function() //TODO: move on filter.js
{

    return function(input, start)
    {
        if (input) return input.slice(start);
    };
});

/*.directive('postRepeatDirective',['$timeout',
 function($timeout) {
 return function(scope){
 if (scope.$first)
 window.a = new Date();
 if (scope.$last)
 $timeout(function(){
 console.log('DOM rendering took: '+ (new Date()-window.a)+' ms');
 });
 };

 }]);*/ //TODO: directive for benchmarking usage , can be deleted


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

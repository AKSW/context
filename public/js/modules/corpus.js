// get extentions
var extentions = require('../data/corpusextentions');

// init module
var corpusModule = angular.module('CorpusModule', ['ui.router']);

// config routes
corpusModule.config(function ($stateProvider, $urlRouterProvider) {
    // main view
    $stateProvider.state('corpus', {
        url: '/corpus/:id',
        controller: require('../controllers/corpus/main'),
        templateUrl: '/templates/corpusView.html',
        resolve: {
            corpus: ['$http', '$stateParams', function($http, $stateParams) {
                return $http({method: 'GET', url: '/api/corpus/' + $stateParams.id});
            }]
        }
    });

    // make view routes for extentions
    extentions.forEach(function(ex) {
        $stateProvider.state('corpus.' + ex.name, {
            url: ex.path,
            templateUrl: ex.template,
            controller: ex.controller,
        });
    });
});

// register controllers
extentions.forEach(function(ex) {
    corpusModule.controller(ex.controller, ['$scope', '$state', '$sce','corpusModel','$q', ex.js]);
});

// export
module.exports = corpusModule;

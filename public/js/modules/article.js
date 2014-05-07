// get extentions
var extentions = require('../data/article');

// init module
var articleModule = angular.module('articleModule', ['ui.router']);
debugger;
// config routes
articleModule.config(function ($stateProvider, $urlRouterProvider) {
    // main view
    $stateProvider.state('article', {
        url: '/article/:id',
        controller: require('../controllers/article'),
        templateUrl: '/templates/articleView.html',
        resolve: {
            corpus: ['$http', '$stateParams', function($http, $stateParams) {
                return $http({method: 'GET', url: '/api/article/' + $stateParams.id});
            }]
        }
    });

    // make view routes for extentions
    extentions.forEach(function(ex) {
        $stateProvider.state('article.' + ex.name, {
            url: ex.path,
            templateUrl: ex.template,
            controller: ex.controller
        });
    });
});

// register controllers
extentions.forEach(function(ex) {
    articleModule.controller(ex.controller, ['$scope', '$state', '$sce', ex.js]);
});

// export
module.exports = articleModule;

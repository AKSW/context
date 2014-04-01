module.exports = function applyRoutes (app) {
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.when('/createCorpus', { controller: 'CreateCorpusController', templateUrl: '/templates/createCorpus.html' });
        //$routeProvider.otherwise({ redirectTo: '/' });

        $locationProvider.html5Mode(true);
    }]);
};
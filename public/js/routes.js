module.exports = function applyRoutes (app) {
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        $routeProvider.when('/', { controller: 'HomeController', template: '' });
        $routeProvider.when('/auth', { controller: 'LoginController', template: '' });
        $routeProvider.when('/register', { controller: 'RegisterController', template: '' });
        $routeProvider.when('/createCorpus', { controller: 'CreateCorpusController', templateUrl: '/templates/createCorpus.html' });

        $locationProvider.html5Mode(true);
    }]);
};
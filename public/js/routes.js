module.exports = function applyRoutes (app) {
    app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
        //$routeProvider.when('/', { controller: 'HomeController', template: '' });
        //$routeProvider.otherwise({ redirectTo: '/' });

        $locationProvider.html5Mode(true);
    }]);
};
var HomeController = require('./controllers/home.js');
var RegisterController = require('./controllers/register.js');

module.exports = function applyControllers (app) {
    app.controller('HomeController', ['$scope', HomeController]);
    app.controller('RegisterController', ['$scope', RegisterController]);
};
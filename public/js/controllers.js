module.exports = function applyControllers (app) {
    app.controller('HomeController', ['$scope', require('./controllers/home.js')]);
    app.controller('RegisterController', ['$scope', require('./controllers/register.js')]);
    app.controller('ProfileController', ['$scope', require('./controllers/profile.js')]);
    app.controller('CreateCorpusController', ['$scope', require('./controllers/createcorpus.js')]);
    app.controller('ResaController', ['$scope','$http','$sce', require('./controllers/resa.js')]);
};
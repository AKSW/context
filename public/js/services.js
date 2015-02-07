module.exports = function applyServices (app) {
    app.service('dataService', ['DS','DSCacheFactory','$q','$http',require('./services/dataservice.js')]);
    app.factory('corpusModel',['DS','DSCacheFactory','dataService',require('./services/corpusService.js')])
};

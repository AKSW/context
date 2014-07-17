var _ = require('lodash');
var defaultPort = '8081';
//use jqlite instead of jquery
//$element === angular.element() === jQuery() === $()
//angular.element.find('.tweet');
var watchList = [];
module.exports = function ResaController($scope, $http, $sce) {
    $scope.toggle_stop=0;
    $scope.toggle_start=1;
    $scope.tweets = [];
    $scope.tweets_number = 0;
    $scope.entities_number = 0;
    // analysis start function
    $scope.startAnalysis = function (e) {
        // prevent event
        e.preventDefault();
        $scope.toggle_stop=1;
        $scope.toggle_start=0;
        var keyword = $scope.keyword;
        $http({
            url: "/api/resa/start/" + keyword,
            method: "GET"
        }).success(function (response) {
            $scope.response = response;
            initStreamWebsocket($scope);
        }).error(function (error) {
            $scope.error = error;
        });
    }

    $scope.stopAnalysis = function (e) {
        // prevent event
        e.preventDefault();
        $scope.toggle_start=1;
        $scope.toggle_stop=0;
        $http({
            url: "/api/resa/stop",
            method: "GET"
        }).success(function (response) {
            $scope.response = response;
        }).error(function (error) {
            $scope.error = error;
        });
    }
    $scope.resetView = function (e) {
        // prevent event
        e.preventDefault();
        watchList = [];
        $scope.entities_number = 0;
        $scope.tweets = [];
        $scope.tweets_number = 0;
    }
    var getEntityType = function (types) {
        if (!types.length) {
            return 'Misc';
        }
        var tmp, out = '';
        _.forEach(types, function (v) {
            tmp = v.split(':');
            if (tmp[1] == 'Place' || tmp[1] == 'Person' || tmp[1] == 'Organisation') {
                out = tmp[1];
            }
        })
        if (out) {
            return out;
        } else {
            return 'Misc';
        }

    }
    var convertToSlug = function (Text) {
        return Text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-')
            ;
    }
    var prepareTweetText = function (text, entities) {
        _.forEach(entities, function (e) {
            text = text.replace(e.name, '&nbsp;<span resource="' + e.uri + '" class="r_entity r_' + getEntityType(e.types).toLowerCase() + '" typeOf="' + e.types + '">' + e.name + '</span>&nbsp;');
            updateWatchlist(e);
        });
        return text;
    }
    var updateWatchlist = function (entity) {
        if (entity.name != $scope.keyword) {
            if (watchList[entity.name] == undefined) {
                watchList[entity.name] = {count: 1, type: getEntityType(entity.types), uri: entity.uri};
                $scope.entities_number++;
            } else {
                watchList[entity.name].count++;
            }
        }
    }
    var updateD3Graph=function(){
        //console.log(watchList);
        for (var key in watchList) {

        }
    }
    var initStreamWebsocket = function ($scope) {
        var location = document.location.hostname + ':' + defaultPort + document.location.pathname;
        console.log('connecting to socket', location);
        var socket = new WebSocket('ws://' + location);
        socket.onerror = function (err) {
            console.log(err);
        };
        socket.onopen = function () {
            console.log('connection established!');
        };
        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            $scope.$apply(function () {
                //console.log(data);
                data.text = prepareTweetText(data.text, data.entities);
                $scope.tweets.unshift(data);
                $scope.tweets_number++;
                //update d3 graph
                updateD3Graph();
                //console.log(watchList);
            });
        };
        socket.onclose = function () {
            $scope.$apply(function () {

            });
        };
    };
};

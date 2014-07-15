var defaultPort = '8081';
module.exports = function ResaController($scope,$http) {
    $scope.tweets=[];
    $scope.tweets_number=0;
    // analysis start function
    $scope.startAnalysis = function (e) {
        // prevent event
        e.preventDefault();
        var keyword=$scope.keyword;
        $http({
            url: "/api/resa/start/"+keyword,
            method: "GET"
        }).success(function(response){
            $scope.response = response;
            initStreamWebsocket($scope);
        }).error(function(error){
            $scope.error = error;
        });
    }

    $scope.stopAnalysis = function (e) {
        // prevent event
        e.preventDefault();
        $http({
            url: "/api/resa/stop",
            method: "GET"
        }).success(function(response){
            $scope.response = response;
        }).error(function(error){
            $scope.error = error;
        });
    }
    var initStreamWebsocket = function($scope) {
        var location = document.location.hostname + ':' + defaultPort + document.location.pathname;
        console.log('connecting to socket', location);
        var socket = new WebSocket('ws://' + location);
        socket.onerror = function(err) {
            console.log(err);
        };
        socket.onopen = function () {
            console.log('connection established!');
        };
        socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            $scope.$apply(function() {
                $scope.tweets.push(data);
                $scope.tweets_number++;
            });
        };
        socket.onclose = function () {
            $scope.$apply(function() {

            });
        };
    };
};

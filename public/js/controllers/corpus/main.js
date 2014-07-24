// extentions
var extentions = require('../../data/corpusextentions');

// default socket port
var defaultPort = '8081';

// corpus object
var currentCorpus = {
    uri: function() {
        var it = this.input_type;
        if(it === 'twitter') {
            return 'http://twitter.com/' + this.input;
        } else if(it === 'direct') {
            return '-';
        } else {
            return this.input;
        }
    }
};

// progress websocket
var initProgressWebsocket = function($scope) {
    var location = document.location.hostname + ':' + defaultPort + document.location.pathname.replace('/overview', '');
    console.log('connecting to socket', location);
    var socket = new WebSocket('ws://' + location);
    socket.onerror = function(err) {
        console.log(err);
    };
    socket.onopen = function () {
        $scope.$apply(function() {
            $scope.progress.show = true;
        });
    };
    socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        $scope.$apply(function() {
            $scope.progress.type = data.type;
            if(data.type=='complete'){
                //when job is completed update the counters
                $scope.currentCorpus.articlesCount=data.articlesCount;
                $scope.currentCorpus.entitiesCount=data.entitiesCount;
            }else{
                $scope.progress.progress = data.progress;
            }
        });
    };
    socket.onclose = function () {
        $scope.$apply(function() {
            $scope.progress.show = false;
        });
    };
};

module.exports = function MainCorpusController($scope, $location, $state, corpus) {
    // set current corpus data
    currentCorpus = _.extend(currentCorpus, corpus.data);
    // expose corpus to scope
    $scope.currentCorpus = currentCorpus;

    // expose math
    $scope.Math = Math;
    // should show progress bar
    $scope.progress = {
        show: false,
        progress: 0,
        type: ''
    };

    // init extentions
    $scope.extentions = extentions;
    // expose state
    $scope.$state = $state;

    // render first view if needed
    $scope.$on('$viewContentLoaded', function onRender() {
        // init progress websocket if corpus is not processed yet
        if(!currentCorpus.processed) {
            initProgressWebsocket($scope);
        }

        // see if we need to change path
        var len = $location.path().split('/').length;
        // if page is just loaded
        if(len === 3) {
            // redirect to first subview
            $state.go('corpus.'+extentions[0].name);
        }
    });
};

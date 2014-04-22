// extentions
var extentions = require('../../data/corpusextentions');

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

module.exports = function MainCorpusController($scope, $location, $state, corpus) {
    // set current corpus data
    currentCorpus = _.extend(currentCorpus, corpus.data);
    // expose corpus to scope
    $scope.currentCorpus = currentCorpus;

    // init extentions
    $scope.extentions = extentions;
    // expose state
    $scope.$state = $state;

    // render first view if needed
    $scope.$on('$viewContentLoaded', function onRender() {
        var len = $location.path().split('/').length;
        // if page is just loaded
        if(len === 3) {
            // redirect to first subview
            $state.go('corpus.'+extentions[0].name);
        }
    });
};

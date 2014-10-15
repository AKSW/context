module.exports = function CorpusOverviewController($scope, $state, $sce, $http) {
    // console.log('corpus overview');
    $scope.reAnnotate = function() {
        $http.get('/api/corpus/' + $scope.currentCorpus._id + '/reannotate')
        .success(function(data, status, headers, config) {
            alert('Re-annotation started, please refresh the page in a few mins.');
        })
        .error(function(data, status, headers, config) {
            alert('Re-annotation failed! Try again?');
        });
    };
};

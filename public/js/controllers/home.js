module.exports = function HomeController($scope) {
    // corpus model
    $scope.corpus = '0';
    // on corpus select event
    $scope.corpusSelect = function() {
        // do not do anything if it's dummy entry
        if($scope.corpus === '0') {
            return;
        }
        // redirect to corpus
        window.location = '/corpus/' + $scope.corpus;
    };
};

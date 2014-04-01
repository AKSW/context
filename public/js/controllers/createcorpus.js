var corpusTypes = require('../data/corpusTypes.js');
var nlpApis = require('../data/nlpApis.js');
require('seiyria-bootstrap-slider');

module.exports = function CreateCorpusController($scope) {
    // collection of corpus types
    $scope.corpusTypes = corpusTypes;
    // collection of nlp apis
    $scope.nlpApis = nlpApis;

    // current corpus
    $scope.corpusSelection = {index: 0};
    $scope.currentCorpus = $scope.corpusTypes[0];

    // input slider reference
    var $inputCount, $sliderContainer;
    // update view slider
    var updateView = function() {
        console.log('view loaded!');
        $scope.currentCorpus = $scope.corpusTypes[$scope.corpusSelection.index];
        if($scope.currentCorpus.haveItems) {
            if(!$inputCount) {
                $sliderContainer = $('#slider_container');
                $inputCount = $('#input_count');
            } else {
                $inputCount.slider('destroy');
            }
            $sliderContainer.show();
            $inputCount.slider({
                min: $scope.currentCorpus.itemsMin,
                max: $scope.currentCorpus.itemsMax,
                step: 50,
                value: $scope.currentCorpus.itemsDefault,
                tooltip: 'always'
            });
        } else {
            $sliderContainer.hide();
        }
    };

    // update view on model change
    $scope.$watch('corpusSelection', updateView, true);

    // update slider
    $scope.$on('$viewContentLoaded', updateView);
};

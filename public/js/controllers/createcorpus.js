var corpusTypes = require('../data/corpusTypes.js');
var nlpApis = require('../data/nlpApis.js');

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

    // analysis start function
    $scope.startAnalysis = function () {
        // get fields
        var $inputItem = $('#input_item');
        var $inputItemArea = $('#input_item_area');
        var $inputItemFile = $('#input_item_file');
        var $inputCountField = $('input#input_count');
        var $newCorpusForm = $('#newcorpus_form');
        var $inputType = $('input[name=input_type]:checked');

        // remove old warning
        $inputItem.parent().removeClass('has-warning');

        // validate input
        var input = null;
        var corpusType = $scope.currentCorpus.name;
        var inputType = $scope.currentCorpus.inputType;
        switch(inputType) {
            case 'text':
                input = $inputItem.val().trim();
                break;
            case 'textarea':
                input = $inputItemArea.val().trim();
                break;
            case 'file':
                input = $inputItemFile.val();
                break;
        }

        if (!input) {
            $inputItem.parent().addClass('has-warning');
            return;
        }

        // assign count to input field
        var itemCount = $inputCount.slider('getValue');
        $inputCountField.val(itemCount);

        // remove unneeded inputs & rename last one
        switch(inputType) {
            case 'text':
                $inputItem.attr('name', 'input');
                $inputItemArea.remove();
                $inputItemFile.remove();
                break;
            case 'textarea':
                $inputItem.remove();
                $inputItemArea.attr('name', 'input');
                $inputItemFile.remove();
                break;
            case 'file':
                $inputItem.remove();
                $inputItemArea.remove();
                $inputItemFile.attr('name', 'input');
                break;
        }

        // swap input type value
        $inputType.val(corpusType);

        // send to server
        $newCorpusForm.submit();
    };
};

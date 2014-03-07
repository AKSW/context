define([
    'underscore',
    'backbone',
    'data/corpusTypesCollection',
    'text!/templates/createCorpus.html',
], function(_, Backbone, corpusTypesCollection, createCorpusTemplate){
    // DOM references
    var $inputCount, $inputItem, $inputLabel, $inputItemArea, $inputItemFile,
        $sliderContainer, $corpusNameInput, $nlpApiOptions, $newCorpusForm,
        $inputCountField;

    // current type
    var currentType;

    // Handle radio buttons change
    var handleTypeChange = function (e) {
        // get new selection name
        var name = $(e.target).val();
        // find corresponding data
        var corpusType = this.collection.find(function(item) {
            return item.get('name') === name;
        });
        // store
        currentType = corpusType;
        // set input description
        $inputLabel.text(corpusType.get('inputDescription'));
        // detect type of input and set view according to it
        var inputType = corpusType.get('inputType');
        switch(inputType) {
            case 'text':
                $inputItem.show();
                $inputItemArea.hide();
                $inputItemFile.hide();
                $inputItem.attr('placeholder', corpusType.get('inputPlaceholder'));
                break;
            case 'textarea':
                $inputItemArea.show();
                $inputItem.hide();
                $inputItemFile.hide();
                break;
            case 'file':
                $inputItemFile.show();
                $inputItem.hide();
                $inputItemArea.hide();
                break;
        }

        // set values range for slider
        if(corpusType.get('haveItems')) {
            $sliderContainer.show();
            $inputCount.slider('destroy');
            $inputCount.slider({
                min: corpusType.get('itemsMin'),
                max: corpusType.get('itemsMax'),
                step: 50,
                value: corpusType.get('itemsDefault'),
                tooltip: 'always'
            });
        } else {
            $sliderContainer.hide();
        }
    };

    // handle start button
    var handleAnalysisStart = function (e) {
        $corpusNameInput.parent().removeClass('has-warning');
        $inputItem.parent().removeClass('has-warning');

        // validate input
        var name = $corpusNameInput.val().trim();
        var input = null;
        var corpusType = currentType.get('name');
        var inputType = currentType.get('inputType');
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

        if (!name) {
            $corpusNameInput.parent().addClass('has-warning');
            return;
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

        // send to server
        $newCorpusForm.submit();
    };

    // render view
    var handleRender = function(){
        // set collection of items
        this.collection = corpusTypesCollection;

        // compile template
        var compiledTemplate = _.template(createCorpusTemplate, {types: this.collection.models});

        // render compiled template to this Views "el"
        this.$el.html(compiledTemplate);

        // cache dom pointers
        $inputCount = $('#input_count');
        $inputItem = $('#input_item');
        $inputItemArea = $('#input_item_area');
        $inputItemFile = $('#input_item_file');
        $inputLabel = $('#input_label');
        $sliderContainer = $('#slider_container');
        $corpusNameInput = $('#corpus_name');
        $nlpApiOptions = $('#nlp_api');
        $newCorpusForm = $('#newcorpus_form');
        $inputCountField = $('input#input_count');

        // apply styling to slider
        var corpusType = this.collection.find(function(item) {
            return item.get('name') === 'feed';
        });
        // store
        currentType = corpusType;
        // update slider
        $inputCount.slider({
            min: corpusType.get('itemsMin'),
            max: corpusType.get('itemsMax'),
            step: 50,
            value: corpusType.get('itemsDefault'),
            tooltip: 'always'
        });
    };

    // create view
    var CreateCorpusView = Backbone.View.extend({
        el: $('#createCorpusContainer'),
        render: handleRender,

        events: {
            'change input[name=input_type]' : 'typeChange',
            'click #analyzeBtn': 'startAnalysis',
        },

        // handle radio buttons change
        typeChange: handleTypeChange,

        // handle analyze button click
        startAnalysis: handleAnalysisStart,
    });
    // Our module now returns our view
    return CreateCorpusView;
});

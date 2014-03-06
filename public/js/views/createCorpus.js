define([
    'data/corpusTypesCollection',
    'text!/templates/createCorpus.html',
], function(corpusTypesCollection, createCorpusTemplate){
    var $inputCount, $inputItem, $inputLabel,
        $inputItemArea, $inputItemFile,
        $sliderContainer;

    var CreateCorpusView = Backbone.View.extend({
        el: $('#createCorpusContainer'),
        render: function(){
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

            // apply styling to slider
            var corpusType = this.collection.find(function(item) {
                return item.get('name') === 'feed';
            });
            $inputCount.slider({
                min: corpusType.get('itemsMin'),
                max: corpusType.get('itemsMax'),
                step: 50,
                value: corpusType.get('itemsDefault'),
                tooltip: 'always'
            });
        },

        events: {
            'change input[name=input_type]' : 'typeChange',
        },

        typeChange: function (e) {
            // get new selection name
            var name = $(e.target).val();
            // find corresponding data
            var corpusType = this.collection.find(function(item) {
                return item.get('name') === name;
            });
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
        },
    });
    // Our module now returns our view
    return CreateCorpusView;
});

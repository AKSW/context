define([
    'underscore',
    'backbone',
    'data/corpusExtentionViewCollection',
    'text!/templates/corpusView.html',
], function(_, Backbone, corpusExtentionViewCollection, corpusTemplate){
    // current corpus object
    var currentCorpus = {};

    // default view element path
    var defaultElement = '#contentTab';

    // currently rendered view
    var currentSubview;

    var applyNewSubview = function(subviewModel) {
        var View = subviewModel.get('view');
        currentSubview = new View({el: defaultElement});
        currentSubview.render();
    };

    // view
    var CorpusView = Backbone.View.extend({
        el: $('#corpusContainer'),
        initialize: function(options) {
            console.log('corpus opt', options);
        },
        render: function(){
            console.log('corpus view');

            // set collection of items
            this.collection = corpusExtentionViewCollection;

            // compile template
            var compiledTemplate = _.template(corpusTemplate, {extentions: this.collection.models});
            this.$el.html(compiledTemplate);

            // render first view
            applyNewSubview(this.collection.at(0));
        },
    });

    // Our module now returns our view
    return CorpusView;
});

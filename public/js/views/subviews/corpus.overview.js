define([
    'underscore',
    'backbone',
    'text!/templates/corpusOverview.html',
], function(_, Backbone, mainTemplate){
    var currentCorpus;

    // view
    var CorpusOverviewView = Backbone.View.extend({
        initialize: function(options) {
            // set element
            this.el = $(options.el);
            // set corpus
            currentCorpus = options.corpus;
        },
        render: function(){
            // compile template
            var compiledTemplate = _.template(mainTemplate, {corpus: currentCorpus});
            this.$el.html(compiledTemplate);
        },
    });

    // Our module now returns our view
    return CorpusOverviewView;
});

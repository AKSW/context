define([
    'underscore',
    'backbone',
    'doT!/templates/corpusFacets',
], function(_, Backbone, mainTemplate){
    var currentCorpus;

    // view
    var CorpusFacetsView = Backbone.View.extend({
        initialize: function(options) {
            // set element
            this.el = $(options.el);
            // set corpus
            currentCorpus = options.corpus;
        },
        render: function(){
            // compile template
            var compiledTemplate = mainTemplate({corpus: currentCorpus});
            this.$el.html(compiledTemplate);
        },
    });

    // Our module now returns our view
    return CorpusFacetsView;
});

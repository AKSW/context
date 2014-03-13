define([
    'underscore',
    'backbone',
    'text!/templates/corpusOverview.html',
], function(_, Backbone, corpusOverviewTemplate){
    // view
    var CorpusOverviewView = Backbone.View.extend({
        initialize: function(options) {
            console.log('corpus opt', options);
            // set element
            this.el = $(options.el);
        },
        render: function(){
            console.log('corpus overview view');

            // compile template
            var compiledTemplate = _.template(corpusOverviewTemplate);
            this.$el.html(compiledTemplate);
        },
    });

    // Our module now returns our view
    return CorpusOverviewView;
});

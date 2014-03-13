define([
    'backbone',
    // Pull in the Model module from above
    'models/corpusExtentionView'
], function(Backbone, CorpusExtentionViewModel){
    var CorpusExtentionViewCollection = Backbone.Collection.extend({
        model: CorpusExtentionViewModel
    });

    // You don't usually return a collection instantiated
    return CorpusExtentionViewCollection;
});

define([
    'backbone',
    // Pull in the Model module from above
    'models/corpusType'
], function(Backbone, CorpusTypeModel){
    var CorpusTypeCollection = Backbone.Collection.extend({
        model: CorpusTypeModel
    });

    // You don't usually return a collection instantiated
    return CorpusTypeCollection;
});

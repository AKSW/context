define([
    'backbone',
    // Pull in the Model module from above
    'models/nlpApi'
], function(Backbone, NlpApiModel){
    var NlpApiCollection = Backbone.Collection.extend({
        model: NlpApiModel
    });

    // You don't usually return a collection instantiated
    return NlpApiCollection;
});

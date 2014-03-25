define([
    'backbone',
], function(Backbone){
    var NlpApiModel = Backbone.Model.extend({
        defaults: {
            id: '', // e.g. DBpedia-Spotlight
            name: '', // e.g. DBpedia Spotlight
        },
    });

    // Return the model for the module
    return NlpApiModel;
});

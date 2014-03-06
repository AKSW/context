define(function(){
    var CorpusTypeModel = Backbone.Model.extend({
        defaults: {
            name: '', // e.g. 'feed'
            description: '', // e.g. 'RSS/RDF/ATOM Feed'
            inputType: 'text', // supported values: text, textarea, file
            inputDescription: '', // e.g. 'URL of the RSS/RDF/ATOM feed'
            inputPlaceholder: '', // e.g. 'URL of your feed'
            haveItems: false, // if have quantifiable items to analyze
            itemsMin: 0, // e.g. 50
            itemsMax: 1500, // e.g. 1000
            itemsDefault: 500, // e.g. 500
        }
    });

    // Return the model for the module
    return CorpusTypeModel;
});

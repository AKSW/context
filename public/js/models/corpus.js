define([
    'backbone',
], function(Backbone){
    var CorpusModel = Backbone.Model.extend({
        // custom functions
        uri: function () {
            var it = this.get('input_type');
            if(it === 'twitter') {
                return 'http://twitter.com/' + this.get('input');
            } else if(it === 'direct') {
                return '-';
            } else {
                return this.get('input');
            }
        },

        defaults: {
            _id: '',
            articlesCount: 0,
            creation_date: Date.now(),
            entitiesCount: 0,
            input: '',
            input_count: 0,
            input_type: '',
            name: '',
            nlp_api: '',
            user: '',
        },
    });

    // Return the model for the module
    return CorpusModel;
});

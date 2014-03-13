define([
    'backbone',
], function(Backbone){
    var CorpusExtentionViewModel = Backbone.Model.extend({
        defaults: {
            name: '', // string with name, e.g. 'Overview'
            path: '', // string with path, e.g. '#overview'
            view: null, // bakcbone view class, e.g. CorpusOverviewView
        }
    });

    // Return the model for the module
    return CorpusExtentionViewModel;
});

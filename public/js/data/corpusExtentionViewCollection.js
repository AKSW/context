define([
    'collections/corpusExtentionView',
    // used views
    'views/subviews/corpus-overview',
], function(CorpusExtentionViewCollection, CorpusOverviewView){
    // build collection of items
    var collection = new CorpusExtentionViewCollection();
    // overview
    collection.add({
        name: 'Overview', // string with name, e.g. 'Overview'
        path: '#overview', // string with path, e.g. '#overview'
        view: CorpusOverviewView, // bakcbone view class, e.g. CorpusOverviewView
    });

    // Our module now returns our view
    return collection;
});

define([
    'collections/corpusExtentionView',
    // used views
    'views/subviews/corpus.overview',
    'views/subviews/corpus.facets',
], function(CorpusExtentionViewCollection, CorpusOverviewView, CorpusFacetsView){
    // build collection of items
    var collection = new CorpusExtentionViewCollection();
    // overview
    collection.add({
        name: 'Overview',
        path: '/overview',
        view: CorpusOverviewView,
    });
    // facets
    collection.add({
        name: 'Facets',
        path: '/facets',
        view: CorpusFacetsView,
    });

    // Our module now returns our view
    return collection;
});

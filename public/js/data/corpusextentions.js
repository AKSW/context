var collection = [];
// overview
collection.push({
    name: 'Overview',
    path: '/overview',
    controller: 'CorpusOverviewController',
    template: '/templates/corpusOverview.html',
});
// facets
collection.push({
    name: 'Facets',
    path: '/facets',
    controller: 'CorpusFacetsController',
    template: '/templates/corpusFacets.html',
});

// Our module now returns our view
module.exports = collection;
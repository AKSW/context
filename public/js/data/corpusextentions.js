var collection = [];
// overview
collection.push({
    name: 'Overview',
    path: '/overview',
    controller: 'CorpusOverviewController',
    template: '/templates/corpusOverview.html',
    js: require('../controllers/corpus/overview.js'),
});
// facets
collection.push({
    name: 'Facets',
    path: '/facets',
    controller: 'CorpusFacetsController',
    template: '/templates/corpusFacets.html',
    js: require('../controllers/corpus/facets.js'),
});

// Our module now returns our view
module.exports = collection;
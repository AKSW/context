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
// relations
collection.push({
    name: 'Entity relations',
    path: '/relations',
    controller: 'CorpusRelationsController',
    template: '/templates/corpusEntityRelations.html',
    js: require('../controllers/corpus/relations.js'),
});

// Our module now returns our view
module.exports = collection;
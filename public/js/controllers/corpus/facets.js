// includes
var FacetsProcesser = require('../../modules/FacetsProcesser');

// data
var facetsData;
var types, entities, articles;

module.exports = function CorpusFacetsController($scope, $state, $sce) {
    console.log('corpus facest');

    // get data
    $.getJSON('/api/corpus/' + $scope.currentCorpus._id + '/facets', function(data) {
        facetsData = FacetsProcesser.processData(data);

        // types
        types = facetsData.types;
        // entities
        entities = facetsData.entities;
        // articles
        articles = facetsData.articles;
        for(var i = 0; i < articles.length; i++) {
            articles[i].sourceSafe = $sce.trustAsHtml(articles[i].source);
        }
        // update data in scope
        $scope.data = [
            {name: 'Articles', values: articles},
            {name: 'Types', values: types},
            {name: 'Entities', values: entities},
        ];

        console.log($scope.data);

        // redraw
        $state.reload();
    });

    // update slider
    $scope.$on('$viewContentLoaded', function() {
        console.log('view redrawn');
    });
};

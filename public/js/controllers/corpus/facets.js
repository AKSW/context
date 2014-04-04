// includes
var FacetsProcesser = require('../../modules/FacetsProcesser');

// data
var facetsData;
var types, entities, articles;

module.exports = function CorpusFacetsController($scope, $state, $sce) {
    // init empty facet filters
    $scope.typeFilter = undefined;
    $scope.entityFilter = undefined;
    $scope.articleFilter = undefined;

    $scope.setFilter = function(item) {
        switch(item.type) {
            case 'article':
                if($scope.articleFilter === item.id) {
                    $scope.articleFilter = undefined;
                } else {
                    $scope.articleFilter = item.id;
                }
                break;
            case 'entity':
                if($scope.entityFilter === item.id) {
                    $scope.entityFilter = undefined;
                } else {
                    $scope.entityFilter = item.id;
                }
                break;
            case 'type':
                if($scope.typeFilter === item.id) {
                    $scope.typeFilter = undefined;
                } else {
                    $scope.typeFilter = item.id;
                }
                break;
        }
    };

    $scope.itemActive = function(item) {
        switch(item.type) {
            case 'article':
                return $scope.articleFilter === item.id;
            case 'entity':
                return $scope.entityFilter === item.id;
            case 'type':
                return $scope.typeFilter === item.id;
        }
    };

    $scope.facetFilter = function (item) {
        var filterArticle = false;
        var filterEntity = false;
        var filterType = false;

        switch(item.type) {
            case 'article':
                if($scope.entityFilter !== undefined) {
                    filterEntity = item.entities.indexOf($scope.entityFilter) !== -1;
                } else {
                    filterEntity = true;
                }
                if($scope.typeFilter !== undefined) {
                    filterType = item.types.indexOf($scope.typeFilter) !== -1;
                } else {
                    filterType = true;
                }
                return filterEntity && filterType;
            case 'entity':
                if($scope.articleFilter !== undefined) {
                    filterArticle = item.articles.indexOf($scope.articleFilter) !== -1;
                } else {
                    filterArticle = true;
                }
                if($scope.typeFilter !== undefined) {
                    filterType = item.types.indexOf($scope.typeFilter) !== -1;
                } else {
                    filterType = true;
                }
                return filterArticle && filterType;
            case 'type':
                if($scope.articleFilter !== undefined) {
                    filterArticle = item.articles.indexOf($scope.articleFilter) !== -1;
                } else {
                    filterArticle = true;
                }
                if($scope.entityFilter !== undefined) {
                    filterEntity = item.entities.indexOf($scope.entityFilter) !== -1;
                } else {
                    filterEntity = true;
                }
                return filterArticle && filterEntity;
        }
    };

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

        // redraw
        $state.reload();
    });
};

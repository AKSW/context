// includes
var ArticleProcesser = require('../modules/ArticleProcessor');

// data
var facetsData;
var types, entities, articles;
var articleId;

module.exports = function ArticleFacetsController($scope, $routeParams, $sce, $state) {

    articleId = $routeParams.id;

    // init empty facet filters
    $scope.typeFilter = undefined;
    $scope.entityFilter = undefined;
    $scope.articleFilter = undefined;

    // ArticleFacetsController is always called twice. One time without an $routeParams. Workaround to avoid errors
    if($routeParams.id !== undefined) {
        // get data
        $.getJSON('/api/article/' + articleId, function (data) {

            facetsData = ArticleProcesser.processData(data);

            // types
            types = facetsData.types;
            // entities
            entities = facetsData.entities;
            // articles
            articles = facetsData.articles;

            for (var i = 0; i < articles.length; i++) {
                articles[i].sourceSafe = $sce.trustAsHtml(articles[i].source);
            }

            // update data in scope
            $scope.data = [
                {name: 'Articles', values: articles},
                {name: 'Types', values: types},
                {name: 'Entities', values: entities}
            ];

            // redraw
            $state.reload();

        });
    }

};

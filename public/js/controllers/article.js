// includes
var ArticleProcesser = require('../modules/ArticleProcessor');

// data
var facetsData;
var types, entities, articles;
var articleId;

module.exports = function ArticleFacetsController($scope, $routeParams, $sce) {

    articleId = $routeParams.id;

    // ArticleFacetsController is always called twice. One time without an $routeParams. Workaround to avoid errors
    if($routeParams.id !== undefined) {
        // get data
        $.getJSON('/api/article/' + articleId, function (data) {

            facetsData = ArticleProcesser.processData(data);

            // articles
            articles = facetsData.articles;

            for (var i = 0; i < articles.length; i++) {
                articles[i].sourceSafe = $sce.trustAsHtml(articles[i].source);
            }

            // update data in scope
            $scope.data = [
                {name: 'Articles', values: articles},
            ];
            //console.log($scope);
            // redraw
            $scope.$apply();

        });
    }

};


// data
var types;
var entities;
var articles;
var totalDisplayed=15; //total displayed articles at initial load //TODO: define a constant on config.js

module.exports = function CorpusFacetsController($scope, $state, $sce) {
    // init empty facet filters
    $scope.typeFilter = undefined;
    $scope.entityFilter = undefined;
    $scope.articleFilter = undefined;

    //get data  //TODO: use nodeJS stream
    oboe({url:'/api/corpus/' + $scope.currentCorpus._id + '/facets',cached:true})
        .done(function(data){

            types = data.types;
            entities = data.entities;
            articles = data.articles;

            for (var i = 0; i < articles.length; i++) {
                articles[i].sourceSafe = $sce.trustAsHtml(articles[i].source);
            }

            // update data in scope
            $scope.data = [
                {name: 'Articles', values: articles},
                {name: 'Types', values: types},
                {name: 'Entities', values: entities}
            ];

            //set pagination
            $scope.curPage = 0;
            $scope.pageSize = 100;

            $scope.$watch('curPage',function(oldValue,newValue){
                if (oldValue!==newValue) {
                    window.scrollTo(0,50);
                    $scope.totalDisplayed = totalDisplayed;

                }
            })


            $scope.numberOfPages = function(filtered)
            {
                if (filtered!==null) {
                    if (filtered) return Math.ceil(filtered / $scope.pageSize);
                    else return Math.ceil($scope.data[0].values.length / $scope.pageSize);
                }
            };


            // redraw
            $state.reload();


        })


    //infinite scrolling for articles
    $scope.totalDisplayed=totalDisplayed;

    $scope.loadMore= function(){

        if ($scope.totalDisplayed<$scope.pageSize)
            $scope.totalDisplayed += 5;
    };

    //TODO: search function with auto suggestion function
    $scope.search=function() {
        $http.get('/api/corpus/' + $scope.currentCorpus._id + '/search/' + $scope.query).success(function (data) {
            for (var i = 0; i < data.length; i++) {
                data[i].sourceSafe = $sce.trustAsHtml(data[i].source);
            }
            $scope.searchResult=data;

        })

    }

    $scope.setFilter = function(item) {
        //reset rendered number of displayed articles for performant filtering
        $scope.totalDisplayed=totalDisplayed;
        //set the current page 0, if filtered
        $scope.curPage=0;

        switch(item.type) {
            case 'article':
                if($scope.articleFilter === item.id) {
                    $scope.articleFilter = undefined;
                    $scope.aF = undefined;

                    //selectedArr=selectedArr.splice(item,1)
                } else {
                    $scope.articleFilter = item.id;
                    $scope.aF = item;
                    //selectedArr.push(item);
                }
                break;
            case 'entity':
                if($scope.entityFilter === item.id) {
                    $scope.entityFilter = undefined;
                    $scope.eF = undefined;
                    // selectedArr.splice(item,1)
                } else {
                    $scope.entityFilter = item.id;
                    $scope.eF = item;
                    //selectedArr.push(item);
                }
                break;
            case 'type':
                if($scope.typeFilter === item.id) {
                    $scope.typeFilter = undefined;
                    $scope.tF = undefined;
                    //selectedArr.splice(item,1)
                } else {
                    $scope.typeFilter = item.id;
                    $scope.tF = item;
                    //selectedArr.push(item);
                }
                break;

        }
    };

    $scope.itemActive = function(item) {
        switch (item.type) {
            case 'article':
                return $scope.articleFilter === item.id;
            case 'entity':
                return $scope.entityFilter === item.id;
            case 'type':
                return $scope.typeFilter === item.id;
        }
    };

    $scope.facetFilter = function(item) {
        var filterArticle = false;
        var filterEntity = false;
        var filterType = false;

        switch (item.type) {
            case 'article':
                if ($scope.entityFilter !== undefined) {
                    filterEntity = item.entities.indexOf($scope.entityFilter) !== -
                        1;
                } else {
                    filterEntity = true;
                }
                if ($scope.typeFilter !== undefined) {
                    filterType = item.types.indexOf($scope.typeFilter) !== -1;
                } else {
                    filterType = true;
                }
                return filterEntity && filterType;
            case 'entity':
                if ($scope.articleFilter !== undefined) {
                    filterArticle = item.articles.indexOf($scope.articleFilter) !== -
                        1;
                } else {
                    filterArticle = true;
                }
                if ($scope.typeFilter !== undefined) {
                    filterType = item.types.indexOf($scope.typeFilter) !== -1;
                } else {
                    filterType = true;
                }
                return filterArticle && filterType;
            case 'type':
                if ($scope.articleFilter !== undefined) {
                    filterArticle = item.articles.indexOf($scope.articleFilter) !== -
                        1;
                } else {
                    filterArticle = true;
                }
                if ($scope.entityFilter !== undefined) {
                    filterEntity = item.entities.indexOf($scope.entityFilter) !== -
                        1;
                } else {
                    filterEntity = true;
                }
                return filterArticle && filterEntity;
        }
    };


};

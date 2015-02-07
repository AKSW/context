
// data
var types;
var entities;
var articles;
var totalDisplayed=15; //total displayed articles at initial load //TODO: define a constant on config.js

module.exports = function CorpusFacetsController($scope, $state, $sce,corpusModel,$q) {
    /*dataService.getData($scope.currentCorpus._id)
        .then(function(res){

            //test(res.entities)

            //$scope.entities = res.entities;
            //$scope.types = res.types;
        })

    /*function test(tempData){
        console.log(JSON.stringify(tempData));
    }*/

    /*dataService.getDataById('5495af94b7c550481406eaf7').then(function(data){
        console.log(data);

    });*/

   /*dataService.findAll(params).then(function(data){

       console.log(data);
   })*/

    /*dataService.getFacetByType($scope.currentCorpus._id,'article').then(function(data){
        console.log(data);
    });*/


    /*var CorpusModel= new corpusModel($scope.currentCorpus._id);
    CorpusModel.getCorpusInfo().then(function(){
        //console.log(CorpusModel.corpusInfo);

    });

    CorpusModel.getFacetByType().then(function(){

    });*/

    articles = [];
    entities = [];
    types = [];
    $scope.articles = [];
    $scope.entities = [];
    $scope.types = [];
    oboe({url:'/api/corpus/' + $scope.currentCorpus._id + '/facetStream'})
        .node('a.*',function(article){
            article.source='';
            //articles.push(article);
            $scope.articles.push(article);
            //console.log($scope.articles.length);
            //$scope.apply();
            $state.go('.');

            // $scope.digest();

            //console.log(article);
            return oboe.drop;
        })
        .node('e.*',function(entity){
            //check if already entity in scope exist
            var itemIndex = _.findIndex($scope.entities,function(item){return item.name === entity.name});
            if (itemIndex !== -1){
                //merge articles and types arrays
                //$scope.entities[itemIndex].articles.push(entity.articles); //TODO: articles won't be updated
                $scope.entities[itemIndex].articles = _.union($scope.entities[itemIndex].articles,entity.articles);
                if ($scope.entities[itemIndex].types.indexOf(entity.types)!== -1)//{$scope.entities[itemIndex].types.push(entity.types);}
                {
                    $scope.entities[itemIndex].types = _.union(entity.types,$scope.entities[itemIndex].types)
                }

                //update counts
                $scope.entities[itemIndex].count = $scope.entities[itemIndex].articles.length + $scope.entities[itemIndex].types.length;
                //$state.go('.');


                //console.log(entities[itemIndex].name+' Articles:'+entities[itemIndex].articles + ' l:'+entities[itemIndex].articles.length + ' types:'+entities[itemIndex].types + 'l:'+entities[itemIndex].types.length +" count:"+entities[itemIndex].count);
                //console.log($scope.entities[itemIndex].name+' Articles:'+$scope.entities[itemIndex].articles + ' l:'+$scope.entities[itemIndex].articles.length + ' types:'+$scope.entities[itemIndex].types + 'l:'+$scope.entities[itemIndex].types.length +" count:"+$scope.entities[itemIndex].count);
            }
            else {
                $scope.entities.push(entity);
                //$state.go('.');
            }
            $scope.apply();

            //console.log(entity.name+','+entity.id + ', Articles'+entity.articles );
            //console.log(entities.length);
            return oboe.drop;
        })
        .node('t.*',function(type){
            var itemIndex = _.findIndex($scope.types,function(item){return item.id === type.id});
            if (itemIndex !== -1){
                //merge articles and entities arrays
                //$scope.entities[itemIndex].articles.push(entity.articles);
                $scope.types[itemIndex].articles = _.union($scope.types[itemIndex].articles,type.articles);
                $scope.types[itemIndex].entities = _.union(type.entities, $scope.types[itemIndex].entities);
                //$scope.types[itemIndex].entities = _.uniq($scope.types[itemIndex].entities);

                //update counts
                $scope.types[itemIndex].count = $scope.types[itemIndex].articles.length + $scope.types[itemIndex].entities.length;
                //$state.go('.');

                //console.log($scope.types[itemIndex].name+' Articles:'+$scope.types[itemIndex].articles + ' l:'+$scope.types[itemIndex].articles.length + ' entities:'+$scope.types[itemIndex].entities + 'l:'+$scope.types[itemIndex].entities.length +" count:"+$scope.types[itemIndex].count);
            }
            else {
                $scope.types.push(type);
                //console.log($scope.types.length)
                //$state.go('.');

            }
            //console.log(entity.name+','+entity.id + ', Articles'+entity.articles );
            //console.log(entities.length);
            console.log($scope.types.length);
           // $scope.apply();

            return oboe.drop;
        })//.done(console.log(articles.length));

    /*corpusObj.getCorpusInfo().then()(function(data){
        console.log('CorpusInfo:'+data);
    });*/

    //get data  //TODO: use nodeJS stream
    /*oboe({url:'/api/corpus/' + $scope.currentCorpus._id + '/facets',cached:true})
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
            //$state.reload();
            $state.go('.');


        })
*/

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

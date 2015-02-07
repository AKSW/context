
module.exports = function dataService(DS,DSCacheFactory,$q,$http) {







    /*var facets = DS.defineResource({
        name:'facet',
        idAttribute: 'id',
        endpoint: '5495af94b7c550481406eaf7/facets',
        maxAge:900000,
        deleteOnExpire:'aggressive'

    })*/
    /*return  DS.defineResource({
        name:'facet',
        idAttribute: 'id',
        endpoint: '/facets'




    })*/

    /*DSCacheFactory('dataCache', {
        maxAge: 900000, // Items added to this cache expire after 15 minutes.
        cacheFlushInterval: 3600000, // This cache will clear itself every hour.
        deleteOnExpire: 'aggressive' ,// Items will be deleted from this cache right when they expire.
        storageMode: 'localStorage'
    });*/

    return {



        getData: function(corpusID){
                var deferred = $q.defer();
                console.log('service initialized with corpusID:'+corpusID);
                $http.get('/api/corpus/' + corpusID + '/facets')
                    .success(function (data){
                            deferred.resolve({
                                entities: data.entities,
                                types: data.types
                            })
                    }).error(function(msg,code){
                                deferred.reject(msg);
                                console.log(msg+' code:'+code);

                    });
                return deferred.promise;


        },



        //initial load fct

        //pagination [offset,limit]

        //get facets: articles,entities,types

        //split into 3 http requests!?

       /* getDataById : function(id){

            var deferred = $q.defer(),
                start = new Date().getTime(),
                dataCache = DSCacheFactory.get('dataCache');


            if (dataCache.get(id)){
                deferred.resolve(dataCache.get(id))
            }
            else {
                $http.get('/api/corpus/'+id+'/facets',function(data){
                    console.log('time taken for request: ' + (new Date().getTime() - start) + 'ms');
                    dataCache.put(id, 'balbaldslfs');
                    deferred.resolve(data);
                })
            }
            console.log(dataCache.info());
            return deferred.promise;


        },*/

        getFacetByType: function(corpusId,type){
            console.log('Type:'+type+' id:'+corpusId);
            //DS.destroyAll('facet');


            var params = {
                limit:10,
                type:type
            };

            /*DS.defineResource({
                name:'facetLocal',
                defaultAdapter: 'DSLocalStorageAdapter'
            })
            DS.updateAll('facetLocal');
             */



            return facets.findAll();

        }
        //facets helper fct


        //get article by id

        //filter helper fct

        //elasticsearch search fct, get only article ids

        //elasticsearch helper fct,

        //use in-memory cache with LRU , especially for articles

    }
}



//client side data layer
/*
*
* ----------------RESTAPI / JSON endpoint---------------------------------------
* ---------------client persistent layer----------------------------------------localStorage
*-------------------caching layer-----------------------------------------------IN-MEMORY
*
*
*
*
*
*/
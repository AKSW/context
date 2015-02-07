module.exports = function corpusModel(DS,DSCacheFactory,dataService) {

    var resourceDefined=false;
    var corpusCache = DSCacheFactory('corpus');
    var facetsCache = DSCacheFactory('facet');

    var corpusModel = function(corpusId){
        this.id = corpusId;
        this.corpusInfo = null;
        createResources(this.id);

    };





    function createResources(corpusId) {
        if (!resourceDefined) {
            DS.defineResource({
                name: 'corpus',
                idAttribute: '_id'
                //endpoint: corpusId,

            });
            DS.defineResource({
                name: 'facet',
                idAttribute: 'id',
                endpoint: 'corpus/'+corpusId+'/facets'

            });
            resourceDefined = true;
        }

    };



    corpusModel.prototype.getCorpusInfo = function (){
        //get all corpus info
        var self=this;
        return DS.find('corpus',self.id).then(function(data){
            self.corpusInfo = data;
            //return data;
            console.log('Article: '+DS.filter('facet',{limit:10}).length);
            corpusCache.put('corpus/'+self.id,data);

        });



        //self.user =


    };

    //TODO: set RestAPI functions

    corpusModel.prototype.getFacetByType = function(){
        //get facet data by type
        var self = this;
        return DS.findAll('facet').then(function(data){
            console.log(data);
            //facetsCache.put('facet/'+self.id,data);
            _.map(data,function(facet){facetsCache.put('facet/'+facet.id,facet)});
            console.log(DSCacheFactory.info());
            //return data;
        });
    }

    return corpusModel;

};

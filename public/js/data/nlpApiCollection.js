define([
    'collections/nlpApi',
], function(NlpApiCollection){
    // build collection of items
    var collection = new NlpApiCollection();
    // overview
    collection.add({
        id: 'DBpedia-Spotlight',
        name: 'DBpedia Spotlight',
    });
    // facets
    collection.add({
        id: 'FOX',
        name: 'FOX',
    });

    // Our module now returns our view
    return collection;
});

define([
    'collections/nlpApi',
], function(NlpApiCollection){
    // build collection of items
    var collection = new NlpApiCollection();
    // spotlight
    collection.add({
        id: 'DBpedia-Spotlight',
        name: 'DBpedia Spotlight',
    });
    // fox
    collection.add({
        id: 'FOX',
        name: 'FOX',
    });
    // german spotlight
    collection.add({
        id: 'DBpedia-Spotlight-DE',
        name: 'DBpedia Spotlight (German)',
    });

    // Our module now returns our view
    return collection;
});

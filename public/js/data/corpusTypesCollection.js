define([
    'collections/corpusType',
], function(CorpusTypeCollection){
    // build collection of items
    var collection = new CorpusTypeCollection();
    // rss
    collection.add({
        name: 'feed',
        description: 'RSS/RDF/ATOM Feed',
        inputType: 'text',
        inputDescription: 'URL of the RSS/RDF/ATOM feed',
        inputPlaceholder: 'URL of your feed',
        haveItems: true,
        itemsMin: 50,
        itemsMax: 600,
        itemsDefault: 50,
    });
    // wordpress
    collection.add({
        name: 'wordpress',
        description: 'WordPress Blog',
        inputType: 'text',
        inputDescription: 'Weblog URL',
        inputPlaceholder: 'URL of the blog',
        haveItems: true,
        itemsMin: 50,
        itemsMax: 400,
        itemsDefault: 400,
    });
    // blogger
    collection.add({
        name: 'blogger',
        description: 'Blogger Blog',
        inputType: 'text',
        inputDescription: 'Weblog URL',
        inputPlaceholder: 'URL of the blog',
        haveItems: true,
        itemsMin: 50,
        itemsMax: 400,
        itemsDefault: 400,
    });
    // public twitter
    collection.add({
        name: 'twitter',
        description: 'Public Twitter account',
        inputType: 'text',
        inputDescription: 'Twitter username',
        inputPlaceholder: 'Username',
        haveItems: true,
        itemsMin: 200,
        itemsMax: 1500,
        itemsDefault: 1000,
    });
    // slidewiki
    collection.add({
        name: 'slidewiki',
        description: 'SlideWiki Deck',
        inputType: 'text',
        inputDescription: 'Deck ID',
        inputPlaceholder: 'Deck ID',
        haveItems: true,
        itemsMin: 50,
        itemsMax: 1000,
        itemsDefault: 400,
    });
    // webpage
    collection.add({
        name: 'webpage',
        description: 'Web page',
        inputType: 'text',
        inputDescription: 'WebPage URL',
        inputPlaceholder: 'URL',
        haveItems: false,
    });
    // direct input
    collection.add({
        name: 'directinput',
        description: 'Direct input',
        inputType: 'textarea',
        inputDescription: 'Your text/html',
        haveItems: false,
    });
    // upload a doc
    collection.add({
        name: 'doc',
        description: 'Upload a document',
        inputType: 'file',
        inputDescription: 'Document',
        haveItems: false,
    });

    // Our module now returns our view
    return collection;
});
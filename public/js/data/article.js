var collection = [];
// overview
collection.push({
    name: 'Article Overview',
    path: '/overview',
    controller: 'ArticleFacetsController',
    template: '/articleView.html',
    js: require('../controllers/article.js')
});


// Our module now returns our view
module.exports = collection;
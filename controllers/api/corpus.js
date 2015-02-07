var WebSocketServer = require('ws').Server;
var config = require('../../config');

// includes
// multiparty
var multiparty = require('multiparty');
// lodash
var _ = require('lodash');
// logger
var logger = require('../../logger');
//mongolastic
var mongolastic = require('mongolastic');
//FacetProcesser //TODO: move file on server-side
var FacetProcesser=require('../../public/js/modules/FacetsProcesser');
var FacetProcesser2=require('../../public/js/modules/FacetsProcesser2');
// db

var Corpus = require('../../modules/corpus');
var CorpusDB = require('../../models').Corpus;
var Article = require('../../models').Article;

//apicache for caching API calls
var apicache = require('apicache').options({ debug: true }).middleware;
// functions
var getCorpusArticles = function(req, res, next) {
    var corpus = req.params.id;
    var articles=[];
    //define query
    var query = {
        'size':5000, //TODO: define a constant in config.js | max numbers of articles to get
        '_sourceInclude':['_id','title','article','entities','source'],
        'body': {
            'query': {
                //'term': {'corpuses._id':corpus}
                'filtered': {
                    'filter': {'term': {'corpuses._id': corpus}}
                }
            }
        }
    };

    //execute query
    Article.search(query,function(err,result){

        if(err) {
            return next(err);
        }
        //get articles
        result.hits.hits.forEach(function (hit){
            articles.push(hit._source);

        });
        // append counts to corpus
        //corpus = corpus.toObject();
        corpus={};
        corpus.articles = articles//.splice(0,2);

        //TODO:measure the time for processing data using facetProcesser
        //console.time("fProcesser");




        var data = FacetProcesser.processData(corpus);






        /*for (var i=0;i<=data.articles.length-1;i++){
            delete data.articles[i].source;
        }*/

        corpus.articles = data.articles;
        corpus.entities = data.entities;
        corpus.types = data.types;
       // corpus = data.entities;

        //TODO:slice data server-side for lazy loading
        // send response
        return res.send(corpus);



    });



};

// export routes
module.exports = function(app) {
    // export create corpus
    app.post('/api/corpus', function(req, res, next) {
        // get form
        var form = new multiparty.Form();

        // parse the form
        form.parse(req, function(err, fields, files) {
            if (err) {
                return next(err);
            }

            // init corpus with user
            var corpus = {
                user: req.user._id
            };
            // push field values into it
            for (var field in fields) {
                corpus[field] = fields[field][0];
            }

            // if files was sent
            // push files info into corpus
            if (files.input) {
                corpus.files = [];
                corpus.input_count = files.input.length;
                for (var index in files.input) {
                    var file = files.input[index];
                    corpus.files.push({
                        name: file.originalFilename,
                        path: file.path
                    });
                }
            }

            // trigger creation
            Corpus.createCorpus(corpus, function(err, id) {
                if (err) {
                    return next(err);
                }

                return res.redirect('/corpus/' + id);
            });
        });
    });

    // export get corpus
    app.get('/api/corpus/:id', function(req, res, next) {
        // get data
        var corpus = req.params.id;

        // find corpus
        CorpusDB.findOne({
            _id: corpus
        }, function(err, corpus) {
            if (err) {
                return next(err);
            }

            // find articles
            Article.find({
                corpuses: corpus._id
            }, function(err, articles) {
                if (err) {
                    return next(err);
                }
                var articlesCount = articles.length;
                var entitiesCount = 0;

                // count entities
                articles.forEach(function(article) {
                    entitiesCount += article.entities.length;
                });

                // append counts to corpus
                corpus = corpus.toObject();
                corpus.articlesCount = articlesCount;
                corpus.entitiesCount = entitiesCount;

                // send response
                return res.send(corpus);
            });
        });
    });

    //Search //TODO:integrate auto suggestion functionality
    app.get('/api/corpus/:id/search/:keyword', function(req, res, next) {
        // get data
        var corpus = req.params.id;
        var keyWord = req.params.keyword;
        var articles = [];
        //define query
        var searchQuery = {
            'size': 2000,
            '_sourceInclude': ['_id',  'source'],
            'body': {
                'query': {

                    //'term': {'corpuses._id':corpus}
                    'filtered': {
                        'query' : {
                            'term': { "source" : keyWord }
                        },
                        'filter': {'term': {'corpuses._id': corpus}}
                    }
                }
            }
        };


        //Execute query
        Article.search(searchQuery, function (err, result) {
            if (err) {
                return next(err);
            }
            result.hits.hits.forEach(function (hit) {
                articles.push(hit._source);
            });


            return res.send(articles);

        });

    });

    // export get corpus
    // extend the function for caching API call
    app.get('/api/corpus/:id/facets', apicache('5 minutes'),getCorpusArticles);


    // relations
    app.get('/api/corpus/:id/relations', getCorpusArticles);

    // co-occurence
    app.get('/api/corpus/:id/cooc', getCorpusArticles);

    app.get('/api/corpus/:id/facetStream', function (req, res) {
        var corpus = req.params.id;
        var articles = [];
        //define query
        var query = {
            'size': 5000, //TODO: define a constant in config.js | max numbers of articles to get
            '_sourceInclude': ['_id', 'title', 'article', 'entities', 'source'],
            'body': {
                'query': {
                    //'term': {'corpuses._id':corpus}
                    'filtered': {
                        'filter': {'term': {'corpuses._id': corpus}}
                    }
                }
            }
        };

        //execute query
        Article.search(query, function (err, result) {

            if (err) {
                return next(err);
            }
            //get articles
            result.hits.hits.forEach(function (hit) {
                articles.push(hit._source);

            });
            // append counts to corpus
            //corpus = corpus.toObject();
            corpus = {};
            corpus.articles = articles;
            articles.forEach(function(article){
                var data = FacetProcesser2.processData(article);
                res.jsonStream(data);
            })
            //var data = FacetProcesser.processData(corpus);

            //res.jsonStream(data);

            res.end();

            //var data = FacetProcesser.processData(corpus);


        });
    })
}
